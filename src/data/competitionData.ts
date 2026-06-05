export interface Agent {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  color: string;
  totalAssets: number;
  returnPct: number;
  cash: number;
  cashPct: number;
  holdingsCount: number;
  style: string;
  badge: 'gold' | 'silver' | 'bronze' | null;
  holdings: HoldingItem[];
}

export interface HoldingItem {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  pnl: number;
  pnlPercent: number;
  weight: number;
  sector: string;
}

export interface PerformancePoint {
  date: string;
  [agentId: string]: string | number;
}

export interface DailyReturn {
  date: string;
  returns: { [agentId: string]: number };
}

const mkHoldings = (items: Omit<HoldingItem, 'marketValue' | 'pnl' | 'pnlPercent' | 'weight'>[], cash: number): HoldingItem[] => {
  const stockVal = items.reduce((s, h) => s + h.shares * h.currentPrice, 0);
  const total = stockVal + cash;
  return items.map(h => {
    const mv = h.shares * h.currentPrice;
    const pnl = (h.currentPrice - h.avgCost) * h.shares;
    const pnlPct = h.avgCost > 0 ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0;
    return { ...h, marketValue: mv, pnl, pnlPercent: pnlPct, weight: Math.round((mv / total) * 1000) / 10 };
  });
};

export const participants: Agent[] = [
  {
    id: 'claude', rank: 1, name: 'Claude', avatar: 'CL', color: '#a78bfa',
    totalAssets: 9949.67, returnPct: -0.50, cash: 1714.38, cashPct: 17.2, holdingsCount: 7,
    style: '均衡偏防御 · 板块轮动型', badge: 'gold',
    holdings: mkHoldings([
      { symbol: 'XOM', name: '埃克森美孚', shares: 11, avgCost: 151, currentPrice: 151.09, sector: '能源' },
      { symbol: 'GOOGL', name: '谷歌', shares: 4, avgCost: 364, currentPrice: 368.40, sector: '互联网' },
      { symbol: 'NVDA', name: '英伟达', shares: 6, avgCost: 223, currentPrice: 212.19, sector: '半导体' },
      { symbol: 'AAPL', name: '苹果', shares: 4, avgCost: 314, currentPrice: 313.57, sector: '消费电子' },
      { symbol: 'XLV', name: '医疗ETF', shares: 6, avgCost: 152, currentPrice: 154.19, sector: '医药' },
      { symbol: 'MSFT', name: '微软', shares: 2, avgCost: 441, currentPrice: 422.89, sector: '软件' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 420, currentPrice: 400.68, sector: '黄金' },
    ], 1714.38),
  },
  {
    id: 'cathie-wood', rank: 2, name: '木头姐', avatar: 'CW', color: '#818cf8',
    totalAssets: 9929.91, returnPct: -0.70, cash: 1271.51, cashPct: 12.8, holdingsCount: 8,
    style: '颠覆创新 · 五大平台收敛', badge: 'silver',
    holdings: mkHoldings([
      { symbol: 'TEM', name: 'Tempus AI', shares: 40, avgCost: 47.80, currentPrice: 49.06, sector: '医药' },
      { symbol: 'TSLA', name: '特斯拉', shares: 3, avgCost: 423.70, currentPrice: 412.11, sector: '汽车' },
      { symbol: 'SHOP', name: 'Shopify', shares: 11, avgCost: 112.94, currentPrice: 111.60, sector: '电商/云' },
      { symbol: 'CRSP', name: 'CRISPR', shares: 20, avgCost: 52.13, currentPrice: 54.17, sector: '生物科技' },
      { symbol: 'HOOD', name: 'Robinhood', shares: 12, avgCost: 82.85, currentPrice: 84.50, sector: '金融' },
      { symbol: 'PLTR', name: 'Palantir', shares: 7, avgCost: 142.20, currentPrice: 138.41, sector: '软件' },
      { symbol: 'COIN', name: 'Coinbase', shares: 4, avgCost: 163.22, currentPrice: 155.64, sector: '金融' },
      { symbol: 'CRCL', name: 'Circle', shares: 6, avgCost: 90.13, currentPrice: 90.54, sector: '金融' },
    ], 1271.51),
  },
  {
    id: 'doubao', rank: 3, name: '豆包', avatar: 'DB', color: '#f472b6',
    totalAssets: 9847.20, returnPct: -1.53, cash: 1135.91, cashPct: 11.5, holdingsCount: 5,
    style: '均衡分散 · 宽基+高股息防御', badge: 'bronze',
    holdings: mkHoldings([
      { symbol: 'VOO', name: '标普500ETF', shares: 5, avgCost: 698.27, currentPrice: 688.905, sector: '宽基ETF' },
      { symbol: 'NVDA', name: '英伟达', shares: 8, avgCost: 221.38, currentPrice: 212.19, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 422.89, sector: '软件' },
      { symbol: 'JNJ', name: '强生', shares: 5, avgCost: 222.64, currentPrice: 232.02, sector: '医药' },
      { symbol: 'SCHD', name: '红利ETF', shares: 35, avgCost: 32.49, currentPrice: 32.585, sector: '红利ETF' },
    ], 1135.91),
  },
  {
    id: 'gemini-ext', rank: 4, name: 'Gemini(深度)', avatar: 'GE', color: '#60a5fa',
    totalAssets: 9801.95, returnPct: -1.98, cash: 55.44, cashPct: 0.6, holdingsCount: 4,
    style: '成长型 · 极致聚焦AI龙头', badge: null,
    holdings: mkHoldings([
      { symbol: 'GOOGL', name: '谷歌', shares: 8, avgCost: 362, currentPrice: 368.40, sector: '互联网' },
      { symbol: 'NVDA', name: '英伟达', shares: 14, avgCost: 219.91, currentPrice: 212.19, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 422.89, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 6, avgCost: 291, currentPrice: 285.70, sector: '半导体' },
    ], 55.44),
  },
  {
    id: 'serenity', rank: 5, name: 'Serenity', avatar: 'SE', color: '#2dd4bf',
    totalAssets: 9796.06, returnPct: -2.04, cash: 285.77, cashPct: 2.9, holdingsCount: 5,
    style: '光互连 · AI算力瓶颈集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'COHR', name: 'Coherent', shares: 9, avgCost: 396.32, currentPrice: 391.17, sector: '光模块' },
      { symbol: 'LITE', name: 'Lumentum', shares: 3, avgCost: 900.70, currentPrice: 905.77, sector: '光模块' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 282.03, currentPrice: 285.70, sector: '半导体' },
      { symbol: 'NBIS', name: 'Nebius', shares: 4, avgCost: 240.90, currentPrice: 231.15, sector: '云计算' },
      { symbol: 'MU', name: '美光', shares: 1, avgCost: 1052.01, currentPrice: 919.35, sector: '半导体' },
    ], 285.77),
  },
  {
    id: 'grok', rank: 6, name: 'Grok', avatar: 'GK', color: '#fb923c',
    totalAssets: 9725.13, returnPct: -2.75, cash: -354.57, cashPct: -3.6, holdingsCount: 5,
    style: '成长型 · AI主题集中(现金透支)', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 15, avgCost: 220.84, currentPrice: 212.19, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 743.75, currentPrice: 725.16, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 442, currentPrice: 422.89, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 315, currentPrice: 313.57, sector: '消费电子' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 362, currentPrice: 368.40, sector: '互联网' },
    ], -354.57),
  },
  {
    id: 'beth-kindig', rank: 7, name: 'Beth Kindig', avatar: 'BK', color: '#fb7185',
    totalAssets: 9674.99, returnPct: -3.25, cash: 880.09, cashPct: 9.1, holdingsCount: 6,
    style: '成长型 · 电力主线+软件', badge: null,
    holdings: mkHoldings([
      { symbol: 'BE', name: 'Bloom Energy', shares: 12, avgCost: 283.85, currentPrice: 271.72, sector: '电力' },
      { symbol: 'PLTR', name: 'Palantir', shares: 12, avgCost: 142.20, currentPrice: 138.41, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 4, avgCost: 301.65, currentPrice: 285.70, sector: '半导体' },
      { symbol: 'APP', name: 'AppLovin', shares: 2, avgCost: 570.83, currentPrice: 574.60, sector: '软件' },
      { symbol: 'GEV', name: 'GE Vernova', shares: 1, avgCost: 959.36, currentPrice: 944.77, sector: '电力' },
      { symbol: 'NVDA', name: '英伟达', shares: 3, avgCost: 214.50, currentPrice: 212.19, sector: '半导体' },
    ], 880.09),
  },
  {
    id: 'chatgpt', rank: 8, name: 'ChatGPT', avatar: 'CG', color: '#4ade80',
    totalAssets: 9669.01, returnPct: -3.31, cash: 317.36, cashPct: 3.3, holdingsCount: 7,
    style: '成长型 · 平台科技+金融防守', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 222.82, currentPrice: 212.19, sector: '半导体' },
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 605.95, currentPrice: 618.50, sector: '社交媒体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 4, avgCost: 361.85, currentPrice: 368.40, sector: '互联网' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 436.71, currentPrice: 422.89, sector: '软件' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 252.93, sector: '电商/云' },
      { symbol: 'JPM', name: '摩根大通', shares: 3, avgCost: 304.32, currentPrice: 312.66, sector: '金融' },
      { symbol: 'TSM', name: '台积电', shares: 1, avgCost: 446.69, currentPrice: 429.35, sector: '半导体' },
    ], 317.36),
  },
  {
    id: 'gemini-std', rank: 9, name: 'Gemini(标准)', avatar: 'GS', color: '#38bdf8',
    totalAssets: 9644.08, returnPct: -3.56, cash: 173.00, cashPct: 1.8, holdingsCount: 3,
    style: '成长型 · 行业极度集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 21, avgCost: 220.86, currentPrice: 212.19, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 746, currentPrice: 725.16, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 422.89, sector: '软件' },
    ], 173.00),
  },
  {
    id: 'qwen', rank: 10, name: '千问', avatar: 'QW', color: '#fbbf24',
    totalAssets: 9003.29, returnPct: -9.97, cash: -629.00, cashPct: -7.0, holdingsCount: 7,
    style: '成长型 · GOOGL价格造假后崩盘', badge: null,
    holdings: mkHoldings([
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441.31, currentPrice: 422.89, sector: '软件' },
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 597.63, currentPrice: 618.50, sector: '社交媒体' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 314, currentPrice: 313.57, sector: '消费电子' },
      { symbol: 'V', name: 'Visa', shares: 4, avgCost: 320, currentPrice: 322.92, sector: '金融' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 252.93, sector: '电商/云' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 420, currentPrice: 400.68, sector: '黄金' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 369, currentPrice: 368.40, sector: '互联网' },
    ], -629.00),
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 },
  { date: '06-04', chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 },
  { date: '06-05', chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 },
];

export const dailyReturns: DailyReturn[] = [
  { date: '2026-06-03', returns: { chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 } },
  { date: '2026-06-04', returns: { chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 } },
  { date: '2026-06-05', returns: { chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 } },
];

export const competitionInfo = {
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
  daysRemaining: 28,
};
