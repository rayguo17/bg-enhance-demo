import React, { useState, useEffect } from 'react';
import { ChevronLeft, Phone, Volume2, MoreHorizontal, Plus, Mic, Sparkles, LayoutTemplate, Image as ImageIcon, Play, SkipForward, SkipBack, Sun, Calendar, Bug, FileText } from 'lucide-react';
import TitleBg from './assets/title_background.png';
import BodyBg from './assets/para_background.jpg';
// --- Types & Mock Data ---

const THEMES = [
  { id: 'default', name: '默认主题', bg: 'bg-gradient-to-b from-[#f3e7f3] to-[#eef2f9]', text: 'text-gray-800' },
  { id: 'spring_festival', name: '春节', bg: 'bg-gradient-to-b from-red-100 to-red-50', text: 'text-red-900' },
  { id: 'qingming', name: '清明', bg: 'bg-gradient-to-b from-green-100 to-green-50', text: 'text-green-900' },
  { id: 'sunny_beach', name: '阳光海滩', bg: 'bg-gradient-to-b from-blue-100 to-yellow-50', text: 'text-blue-900' },
];

const LONG_TEXT_RESPONSE = [
  {
    id: 1,
    type: 'long_text_card',
    title: "RX 9070 GRE 是中端偏上、主打 2K 性价比的 RDNA4 显卡，RX 9040 是入门级、主打 1080P的 RDNA4 显卡，二者在核心规格、显存、性能、功耗、定位上差异巨大。",
    h1: "一、性能与定位差异",
    p1: "<list></list>",
    h2: "三、选购建议",
    p2: "在经历了两次“AI寒冬”之后，随着计算能力的提升和大数据时代的到来，深度学习在2010年代迎来了爆发式增长。",
    p3: "如今，AI已经广泛应用于自然语言处理、计算机视觉、自动驾驶等多个领域，深刻地改变了我们的生活方式。",
    hasBlankSpace: true,
    decorations: ["🤖", "🧠", "💡", "📚", "✨"],
    titleImageUrl: TitleBg,
    bgImageUrl: BodyBg,
    instanceId: Date.now()
  }
];

const MOCK_RESPONSES = [
  {
    id: 1,
    type: 'text_card',
    content: "一天的理想睡眠时间因人而异，但通常成年人建议的睡眠时间是7到9小时。保持规律的作息有助于提高睡眠质量。如果你经常感到疲惫，可能需要调整你的睡眠习惯。",
    hasBlankSpace: true, // 模拟存在空白区域
    decorations: ["🌙", "💤", "🛏️", "✨"],
  },
  {
    id: 2,
    type: 'news_card',
    title: "伊朗阿巴斯港居民楼发生爆炸",
    content: "据报道，伊朗南部城市阿巴斯港的一栋居民楼发生爆炸，目前伤亡情况正在进一步核实中。救援队伍已赶往现场。",
    hasBlankSpace: false,
    decorations: ["🚨", "🔥", "📰"],
  },
  {
    id: 3,
    type: 'music_card',
    title: "正在播放",
    songName: "Spring Breeze",
    artist: "Unknown Artist",
    hasBlankSpace: false,
    decorations: ["🎵", "🎶", "🎧", "🎸"],
  },
  {
    id: 4,
    type: 'image_card',
    title: "今日推荐风景",
    content: "这是为您推荐的绝美风景，希望能给您带来好心情。",
    imageUrl: "https://s3-us-west-2.amazonaws.com/issuewireassets/primg/38384/hangzhou158162490.jpeg",
    hasBlankSpace: false,
    decorations: ["🏞️", "📸", "🍃"],
  },
  {
    id: 5,
    type: 'action_card',
    title: "日程提醒",
    content: "下午3点有团队会议，请提前准备好相关材料。",
    actions: ["查看详情", "推迟提醒"],
    hasBlankSpace: true,
    decorations: ["📅", "⏰", "💼", "📝"],
  },
  {
    id: 6,
    type: 'weather_card',
    title: "今日天气",
    temperature: "24°C",
    condition: "晴朗",
    content: "今天天气不错，适合外出活动。记得做好防晒哦！",
    hasBlankSpace: true,
    decorations: ["☀️", "🌤️", "😎", "🌻"],
  },
  {
    id: 7,
    type: 'tech_card',
    title: "鸿蒙电脑桌面新体验",
    content: "全新的鸿蒙PC版桌面带来了更流畅的交互体验，支持多设备协同，让你在工作和娱乐中无缝切换。全新的UI设计更加现代化。",
    hasBlankSpace: true,
    decorations: ["💻", "🚀", "📱", "✨"],
  },
  
];

// --- Utils ---

// 寻找卡片空白区域的算法
export const findBlankSpaces = (rootNode) => {
  if (!rootNode) return [];

  const cardRect = rootNode.getBoundingClientRect();
  const elements = rootNode.querySelectorAll('*');
  
  const obstacles = [];
  elements.forEach(el => {
    // 忽略装饰元素本身
    if (el.classList.contains('decoration-element')) return;
    
    // 简化逻辑：只将 SVG, IMG, 以及包含直接文本的节点视为障碍物
    // 注意：SVG 元素的 tagName 可能是小写的 'svg'，所以统一转大写比较
    const isSvgOrImg = ['SVG', 'IMG'].includes(el.tagName.toUpperCase());
    const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
    const hasText = textNodes.length > 0;

    if (!isSvgOrImg && !hasText) return;

    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return;
    
    // 对于 P/H1/H2/H3 等块级文本标签，只计算其实际文本内容的范围
    const isBlockText = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName);

    if (isBlockText && hasText) {
      textNodes.forEach(textNode => {
        const range = document.createRange();
        range.selectNodeContents(textNode);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        
        obstacles.push({
          left: rect.left - cardRect.left,
          top: rect.top - cardRect.top,
          right: rect.right - cardRect.left,
          bottom: rect.bottom - cardRect.top,
          width: rect.width,
          height: rect.height
        });
      });
    } else {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      
      obstacles.push({
        left: rect.left - cardRect.left,
        top: rect.top - cardRect.top,
        right: rect.right - cardRect.left,
        bottom: rect.bottom - cardRect.top,
        width: rect.width,
        height: rect.height
      });
    }
  });

  // 初始空白区域为整个卡片
  let emptyRects = [{
    left: 0,
    top: 0,
    right: cardRect.width,
    bottom: cardRect.height,
    width: cardRect.width,
    height: cardRect.height
  }];

  // 用每个障碍物去切割空白区域
  obstacles.forEach(obs => {
    const nextEmptyRects = [];
    emptyRects.forEach(rect => {
      // 检查是否相交
      if (
        obs.left < rect.right &&
        obs.right > rect.left &&
        obs.top < rect.bottom &&
        obs.bottom > rect.top
      ) {
        // 相交，将空白区域切割为最多4个小矩形（上、下、左、右）
        if (obs.top > rect.top) {
          nextEmptyRects.push({
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: obs.top,
            width: rect.right - rect.left,
            height: obs.top - rect.top
          });
        }
        if (obs.bottom < rect.bottom) {
          nextEmptyRects.push({
            left: rect.left,
            top: obs.bottom,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.right - rect.left,
            height: rect.bottom - obs.bottom
          });
        }
        if (obs.left > rect.left) {
          nextEmptyRects.push({
            left: rect.left,
            top: rect.top,
            right: obs.left,
            bottom: rect.bottom,
            width: obs.left - rect.left,
            height: rect.bottom - rect.top
          });
        }
        if (obs.right < rect.right) {
          nextEmptyRects.push({
            left: obs.right,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            width: rect.right - obs.right,
            height: rect.bottom - rect.top
          });
        }
      } else {
        // 不相交，保留原矩形
        nextEmptyRects.push(rect);
      }
    });
    
    // 过滤掉被其他矩形完全包含的矩形，优化性能
    emptyRects = nextEmptyRects.filter((r1, i) => {
      return !nextEmptyRects.some((r2, j) => {
        if (i === j) return false;
        return (
          r1.left >= r2.left &&
          r1.right <= r2.right &&
          r1.top >= r2.top &&
          r1.bottom <= r2.bottom
        );
      });
    });
  });

  // 过滤掉太小的空白区域 (例如小于 40x40，确保减去 20px padding 后 emoji 至少有 20px 大小)
  const MIN_SIZE = 40;
  // 按照面积从大到小排序
  const finalEmptyRects = emptyRects
    .filter(r => r.width >= MIN_SIZE && r.height >= MIN_SIZE)
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));

  return { emptyRects: finalEmptyRects, obstacles };
};

// --- Components ---

// 长文本专属卡片组件，方便后续实现独立的优化逻辑
const LongTextCard = ({ data, theme, isOptimized, isDebugMode }) => {
  const cardRef = React.useRef(null);
  const [blankSpaces, setBlankSpaces] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [headerRects, setHeaderRects] = useState([]);
  const [paragraphRects, setParagraphRects] = useState([]);

  useEffect(() => {
    if ((isOptimized || isDebugMode) && cardRef.current) {
      const timer = setTimeout(() => {
        // const result = findBlankSpaces(cardRef.current);
        // setBlankSpaces(result.emptyRects);
        // setObstacles(result.obstacles);

        // 获取标题和段落的区域用于 Debug 模式
        const cardRect = cardRef.current.getBoundingClientRect();
        const headers = cardRef.current.querySelectorAll('h1, h2, h3');
        const paragraphs = cardRef.current.querySelectorAll('.paragraph');

        const getTextRelativeRects = (elements) => {
          const rects = [];
          Array.from(elements).forEach(el => {
            const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
            textNodes.forEach(textNode => {
              const range = document.createRange();
              range.selectNodeContents(textNode);
              const rect = range.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                rects.push({
                  top: rect.top - cardRect.top,
                  left: rect.left - cardRect.left,
                  width: rect.width,
                  height: rect.height
                });
              }
            });
          });
          return rects;
        };

        const getWholeRects = (elements) => {
          const rects = [];
            Array.from(elements).forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
              rects.push({
                top: rect.top - cardRect.top,
                left: rect.left - cardRect.left,
                width: rect.width,
                height: rect.height
              });
            }
          });
          return rects;
        };

        console.log('Paragraph rects:', paragraphRects);
        setHeaderRects(getTextRelativeRects(headers));
        setParagraphRects(getWholeRects(paragraphs));
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setBlankSpaces([]);
      setObstacles([]);
      setHeaderRects([]);
      setParagraphRects([]);
    }
  }, [isOptimized, isDebugMode, data]);

  const selectedSpaces = [];
  if (isOptimized) {
    for (const space of blankSpaces) {
      const top = space.top + space.height / 2;
      const left = space.left + space.width / 2;
      
      const isTooClose = selectedSpaces.some(selected => {
        const dx = Math.abs(left - selected.left);
        const dy = Math.abs(top - selected.top);
        return Math.hypot(dx, dy) < 90;
      });

      if (!isTooClose) {
        selectedSpaces.push({ top, left, width: space.width, height: space.height });
      }

      if (selectedSpaces.length >= 2) break;
    }
  }

  return (
    <div ref={cardRef} className="relative bg-white/60 backdrop-blur-md rounded-2xl p-4 mb-4 shadow-sm border border-white/40 overflow-hidden text-left">
      <p className='text-sm relative z-10'>RX 9070 GRE 是<strong>中端偏上、主打 2K 性价比</strong>的 RDNA4 显卡，RX 9040 是<strong>入门级、主打 1080P</strong>的 RDNA4 显卡，二者在<strong>核心规格、显存、性能、功耗、</strong>定位上差异巨大。</p>
      <h1 className="font-bold text-md mb-2 mt-2 relative z-10">一、性能与定位差异</h1>
      <div className="pl-4 relative paragraph z-10">
        <ul className="auto-hide-last-sibling-br list-disc">
          <li><strong>RX 9070 GRE</strong>
            <ul className="auto-hide-last-sibling-br list-disc pl-4 mt-1 mb-2">
              <li>定位：<strong>2K 高画质 / 高帧</strong>、性价比中端卡（对标 RTX 5060 Ti）</li>
              <li>游戏：2K 高 / 超高画质 60–144fps；4K 中画质可玩</li>
              <li>场景：3A 大作、2K 高刷、光追、AI 加速、生产力</li>
              <li>优势：<strong>核心强、带宽高、光追 / AI 性能好、2K 更稳</strong></li>
            </ul>
            <div className="container-Uxvbjy md-box-line-break wrapper-GYqxgQ undefined"></div>
          </li>
          <li><strong>RX 9040</strong>
            <ul className="auto-hide-last-sibling-br list-disc pl-4 mt-1 mb-2">
              <li>定位：<strong>1080P 高画质</strong>、入门性价比（对标 RTX 4060）</li>
              <li>游戏：1080P 高画质 60–100fps；2K 中低画质勉强</li>
              <li>场景：网游、1080P 3A、轻度创作、低功耗平台</li>
              <li>优势：<strong>16GB 大显存、功耗低、价格更便宜、1080P 够用</strong></li>
            </ul>
            <div className="container-Uxvbjy md-box-line-break wrapper-GYqxgQ undefined"></div>
          </li>
        </ul>

      </div>
      <h1 className="font-bold text-md mb-2 mt-2 relative z-10">二、选购建议</h1>
      <div className="pl-4 relative mb-3 paragraph z-10">
        <ul className="auto-hide-last-sibling-br list-disc">
          <li>选 <strong>RX 9070 GRE</strong>：用 2K 显示器、玩 3A 大作、开高 / 光追、需要大带宽与缓存</li>
          <li>选 <strong>RX 9040</strong>：用 1080P 显示器、预算有限、低功耗主机、更看重显存容量</li>
        </ul>
      </div>
      <p className="text-sm relative z-10">需要我帮你对比这两张卡在<strong>2K/1080P</strong>下的<strong>主流 3A 游戏帧率</strong>，并给出更具体的选购建议吗？</p>

      {/* 渲染文本区域的背景图片 */}
      {isOptimized && data.titleImageUrl && [...headerRects].map((rect, idx) => (
        <div
          key={`text-bg-${idx}`}
          className="absolute pointer-events-none z-0 rounded-md"
          style={{
            top: `${rect.top - 8}px`,
            left: `${rect.left - 12}px`,
            width: `${rect.width + 20}px`,
            height: `${rect.height + 10}px`,
            backgroundImage: `url(${data.titleImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      ))}

      {isOptimized && data.bgImageUrl && [...paragraphRects].map((rect, idx) => (
        <div
          key={`text-bg-${idx}`}
          className="absolute pointer-events-none z-0 rounded-md opacity-80"
          style={{
            top: `${rect.top - 8}px`,
            left: `${rect.left - 12}px`,
            width: `${rect.width + 20}px`,
            height: `${rect.height + 10}px`,
            backgroundImage: `url(${data.bgImageUrl})`,
            backgroundPosition: 'center'
          }}
        />
      ))}

      {isOptimized && selectedSpaces.map((space, idx) => {
        const emojiSize = Math.max(16, Math.min(space.width, space.height) - 30);
        return (
          <div 
            key={idx}
            className="decoration-element absolute opacity-40 pointer-events-none animate-pulse transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ 
              top: `${space.top}px`, 
              left: `${space.left}px`,
              fontSize: `${emojiSize}px`,
              lineHeight: 1
            }}
          >
            {data.decorations ? data.decorations[(idx) % data.decorations.length] : "✨"}
          </div>
        );
      })}

      {/* Debug Mode: 渲染 Header 的红色边框 */}
      {isDebugMode && headerRects.map((rect, idx) => (
        <div
          key={`debug-header-${idx}`}
          className="absolute border-2 border-red-500 pointer-events-none z-50 bg-red-500/20"
          style={{
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
          }}
        />
      ))}

      {/* Debug Mode: 渲染 Paragraph 的蓝色边框 */}
      {isDebugMode && paragraphRects.map((rect, idx) => (
        <div
          key={`debug-p-${idx}`}
          className="absolute border-2 border-blue-500 pointer-events-none z-50 bg-blue-500/20"
          style={{
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`
          }}
        />
      ))}

      {isDebugMode && blankSpaces.map((space, idx) => (
        <div
          key={`debug-blank-${idx}`}
          className="absolute border border-red-500 pointer-events-none z-50 bg-red-500/10"
          style={{
            top: `${space.top}px`,
            left: `${space.left}px`,
            width: `${space.width}px`,
            height: `${space.height}px`
          }}
        />
      ))}

      {isDebugMode && obstacles.map((obs, idx) => (
        <div
          key={`debug-obs-${idx}`}
          className="absolute border border-blue-500 pointer-events-none z-50 bg-blue-500/10"
          style={{
            top: `${obs.top}px`,
            left: `${obs.left}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`
          }}
        />
      ))}
    </div>
  );
};

// 模拟的卡片组件
const ResponseCard = ({ data, theme, isOptimized, isDebugMode }) => {
  const cardRef = React.useRef(null);
  const [blankSpaces, setBlankSpaces] = useState([]);
  const [obstacles, setObstacles] = useState([]);

  useEffect(() => {
    if ((isOptimized || isDebugMode) && cardRef.current) {
      // 稍微延迟一下，确保DOM渲染完成
      const timer = setTimeout(() => {
        const result = findBlankSpaces(cardRef.current);
        setBlankSpaces(result.emptyRects);
        setObstacles(result.obstacles);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setBlankSpaces([]);
      setObstacles([]);
    }
  }, [isOptimized, isDebugMode, data]);

  const renderContent = () => {
    switch (data.type) {
      case 'image_card':
        return (
          <>
            {data.title && <h3 className="font-bold mb-2 text-lg">{data.title}</h3>}
            <img src={data.imageUrl} alt={data.title} className="w-full h-32 object-cover rounded-xl mb-3 shadow-sm" />
            <p className="text-sm leading-relaxed relative z-10">{data.content}</p>
          </>
        );
      case 'action_card':
        return (
          <>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg">{data.title}</h3>
            </div>
            <p className="text-sm leading-relaxed relative z-10 mb-4">{data.content}</p>
            <div className="flex gap-2 relative z-10">
              {data.actions.map((action, idx) => (
                <button key={idx} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${idx === 0 ? 'bg-blue-500 text-black hover:bg-blue-600' : 'bg-black/5 text-black/70 hover:bg-black/10'}`}>
                  {action}
                </button>
              ))}
            </div>
          </>
        );
      case 'weather_card':
        return (
          <>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">{data.title}</h3>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold">{data.temperature}</span>
              <span className="text-sm mb-1 opacity-80">{data.condition}</span>
            </div>
            <p className="text-sm leading-relaxed relative z-10">{data.content}</p>
          </>
        );
      case 'music_card':
        return (
          <>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-lg flex items-center justify-center shadow-inner">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base">{data.songName}</h3>
                <p className="text-xs opacity-70">{data.artist}</p>
              </div>
            </div>
            <div className="flex justify-center items-center gap-4 mt-2 relative z-10">
              <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <SkipBack className="w-5 h-5" />
              </button>
              <button className="p-3 bg-black/5 rounded-full hover:bg-black/10 transition-colors">
                <Play className="w-6 h-6 ml-1" />
              </button>
              <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </>
        );
      default:
        return (
          <>
            {data.title && <h3 className="font-bold mb-2 text-lg">{data.title}</h3>}
            <p className="text-sm leading-relaxed relative z-10">{data.content}</p>
          </>
        );
    }
  };

  // 筛选出中心距离足够远的空白区域，避免装饰重叠
  const selectedSpaces = [];
  if (isOptimized) {
    for (const space of blankSpaces) {
      const top = space.top + space.height / 2;
      const left = space.left + space.width / 2;
      
      const isTooClose = selectedSpaces.some(selected => {
        const dx = Math.abs(left - selected.left);
        const dy = Math.abs(top - selected.top);
        // 增大最小距离阈值到 90px，强制图案在视觉上更分散，避免在同一片大空白区域扎堆
        return Math.hypot(dx, dy) < 90;
      });

      if (!isTooClose) {
        selectedSpaces.push({ top, left, width: space.width, height: space.height });
      }

      if (selectedSpaces.length >= 2) break;
    }
  }

  return (
    <div ref={cardRef} className="relative bg-white/60 backdrop-blur-md rounded-2xl p-4 mb-4 shadow-sm border border-white/40 overflow-hidden">
      {renderContent()}
      
      {/* 动态渲染在空白区域的装饰 */}
      {isOptimized && selectedSpaces.map((space, idx) => {
        // 动态计算 emoji 大小：取空白区域宽高的最小值，减去 30px (即四周各留 15px padding)
        const emojiSize = Math.max(16, Math.min(space.width, space.height) - 30);

        return (
          <div 
            key={idx}
            className="decoration-element absolute opacity-40 pointer-events-none animate-pulse transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ 
              top: `${space.top}px`, 
              left: `${space.left}px`,
              fontSize: `${emojiSize}px`,
              lineHeight: 1
            }}
          >
            {data.decorations ? data.decorations[(idx) % data.decorations.length] : "✨"}
          </div>
        );
      })}

      {/* Debug Mode: 渲染所有空白区域的红色边框 */}
      {isDebugMode && blankSpaces.map((space, idx) => (
        <div
          key={`debug-blank-${idx}`}
          className="absolute border border-red-500 pointer-events-none z-50 bg-red-500/10"
          style={{
            top: `${space.top}px`,
            left: `${space.left}px`,
            width: `${space.width}px`,
            height: `${space.height}px`
          }}
        />
      ))}

      {/* Debug Mode: 渲染所有障碍物的蓝色边框 */}
      {isDebugMode && obstacles.map((obs, idx) => (
        <div
          key={`debug-obs-${idx}`}
          className="absolute border border-blue-500 pointer-events-none z-50 bg-blue-500/10"
          style={{
            top: `${obs.top}px`,
            left: `${obs.left}px`,
            width: `${obs.width}px`,
            height: `${obs.height}px`
          }}
        />
      ))}
    </div>
  );
};

export default function XiaoyiAssistantDemo() {
  const [currentTheme, setCurrentTheme] = useState(THEMES[0]);
  const [messages, setMessages] = useState([]);
  const [isOptimized, setIsOptimized] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [phoneSize, setPhoneSize] = useState({ width: 400, height: 800 });
  const [currentLongTextCardIndex, setCurrentLongTextCardIndex] = useState(0);
  const [inputSize, setInputSize] = useState({ width: 400, height: 800 });

  // 初始化欢迎消息
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'system',
        content: 'Hi~ 我是小艺，“聪明、懂你、又能干”，快问点什么挑战一下我吧~'
      }
    ]);
  }, []);

  const handleGenerateCard = () => {
    // 按顺序选择一个模拟回复
    const response = MOCK_RESPONSES[currentCardIndex];
    setMessages(prev => [...prev, { ...response, instanceId: Date.now() }]);
    setCurrentCardIndex(prev => (prev + 1) % MOCK_RESPONSES.length);
  };

  const handleAddLongTextCard = () => {
    const longTextCard = LONG_TEXT_RESPONSE[currentLongTextCardIndex];
    setMessages(prev => [...prev, longTextCard]);
    setCurrentLongTextCardIndex(prev => (prev + 1) % LONG_TEXT_RESPONSE.length);
  };

  const handleOptimizeBackground = () => {
    setIsOptimized(prev => !prev);
  };

  const handleToggleDebug = () => {
    setIsDebugMode(prev => !prev);
  };

  return (
    <div className="flex h-screen bg-gray-100 p-4 font-sans">
      
      {/* 左侧控制面板 */}
      <div className="w-1/3 min-w-[300px] bg-white rounded-2xl shadow-lg p-6 mr-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6" />
          控制面板
        </h2>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">1. 选择主题</h3>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => setCurrentTheme(theme)}
                className={`p-3 rounded-xl border-2 transition-all text-sm font-medium
                  ${currentTheme.id === theme.id 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'}`}
              >
                {theme.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">2. 模拟操作</h3>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGenerateCard}
              className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-black rounded-xl transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              生成回答卡片
            </button>

            <button
              onClick={handleAddLongTextCard}
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-black rounded-xl transition-colors font-medium shadow-sm"
            >
              <FileText className="w-5 h-5" />
              添加长文本卡片
            </button>
            
            <button
              onClick={handleOptimizeBackground}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-colors font-medium shadow-sm border-2
                ${isOptimized 
                  ? 'bg-purple-100 border-purple-500 text-purple-700' 
                  : 'bg-white border-purple-200 text-purple-600 hover:bg-purple-50'}`}
            >
              <ImageIcon className="w-5 h-5" />
              {isOptimized ? '取消背景优化' : 'AI优化卡片背景'}
            </button>

            <button
              onClick={handleToggleDebug}
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl transition-colors font-medium shadow-sm border-2
                ${isDebugMode 
                  ? 'bg-red-100 border-red-500 text-red-700' 
                  : 'bg-white border-red-200 text-red-600 hover:bg-red-50'}`}
            >
              <Bug className="w-5 h-5" />
              {isDebugMode ? '关闭 Debug 模式' : '开启 Debug 模式'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            * 点击"AI优化卡片背景"后，系统会识别卡片中的空白区域，并根据当前主题插入相应的装饰图案，使排版不再枯燥。
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">3. 屏幕尺寸设置</h3>
          <div className="flex gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">宽度 (px)</label>
              <input
                type="number"
                value={inputSize.width}
                onChange={(e) => setInputSize(prev => ({ ...prev, width: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">高度 (px)</label>
              <input
                type="number"
                value={inputSize.height}
                onChange={(e) => setInputSize(prev => ({ ...prev, height: Number(e.target.value) }))}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={() => setPhoneSize(inputSize)}
            className="w-full py-2 bg-gray-800 hover:bg-gray-900 text-blue-500 rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            应用尺寸
          </button>
        </div>
      </div>

      {/* 右侧手机模拟界面 */}
      <div className="flex-1 flex justify-center items-center">
        {/* 手机外壳 */}
        <div 
          className="bg-black rounded-[3rem] p-3 shadow-2xl relative transition-all duration-300"
          style={{ width: `${phoneSize.width}px`, height: `${phoneSize.height}px` }}
        >
          {/* 屏幕区域 */}
          <div className={`w-full h-full rounded-[2.5rem] overflow-hidden relative flex flex-col transition-colors duration-500 ${currentTheme.bg} ${currentTheme.text}`}>
            
            {/* 顶部导航栏 */}
            <div className="flex justify-between items-center px-6 pt-12 pb-4">
              <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex gap-4">
                <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                  <Volume2 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-black/5 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            

            {/* 对话区域 */}
            <div className="flex-1 overflow-y-auto px-6 pb-36 no-scrollbar">
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px bg-black/10 flex-1"></div>
                <span className="text-xs text-black/40">开始新对话</span>
                <div className="h-px bg-black/10 flex-1"></div>
              </div>

              {messages.map((msg, index) => (
                <div key={msg.instanceId || msg.id} className="mb-4">
                  {msg.type === 'system' ? (
                    <p className="text-sm leading-relaxed mb-6">{msg.content}</p>
                  ) : msg.type === 'long_text_card' ? (
                    <LongTextCard data={msg} theme={currentTheme} isOptimized={isOptimized} isDebugMode={isDebugMode} />
                  ) : (
                    <ResponseCard data={msg} theme={currentTheme} isOptimized={isOptimized} isDebugMode={isDebugMode} />
                  )}
                </div>
              ))}
            </div>

            {/* 底部输入区域 */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/80 via-white/50 to-transparent backdrop-blur-sm p-2">
              <div className="text-center mb-1">
                <span className="text-xs text-black/30">内容由 AI 生成</span>
              </div>
              
              {/* 快捷按钮 */}
              <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
                <button className="flex items-center gap-1 px-4 py-2 bg-white/60 rounded-full text-sm whitespace-nowrap shadow-sm">
                  <Sparkles className="w-4 h-4" /> 深度思考
                </button>
                <button className="flex items-center gap-1 px-4 py-2 bg-white/60 rounded-full text-sm whitespace-nowrap shadow-sm">
                  <LayoutTemplate className="w-4 h-4" /> 小艺任务
                </button>
              </div>

              {/* 输入框 */}
              <div className="flex items-center bg-white/80 rounded-full p-2 shadow-sm border border-purple-200/50">
                <button className="p-2 text-purple-500">
                  <Mic className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  placeholder="随时随地问问小艺" 
                  className="flex-1 bg-transparent border-none outline-none px-2 text-sm"
                  readOnly
                />
                <button className="p-2 text-purple-500">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}