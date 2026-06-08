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
    totalAssets: 9841.46, returnPct: -1.59, cash: 1769.80, cashPct: 18.0, holdingsCount: 6,
    style: '均衡偏防御 · 板块轮动型', badge: 'gold',
    holdings: mkHoldings([
      { symbol: 'GOOGL', name: '谷歌', shares: 6, avgCost: 365.51, currentPrice: 368.53, sector: '互联网' },
      { symbol: 'XOM', name: '埃克森美孚', shares: 11, avgCost: 151, currentPrice: 149.92, sector: '能源' },
      { symbol: 'NVDA', name: '英伟达', shares: 6, avgCost: 223, currentPrice: 205.10, sector: '半导体' },
      { symbol: 'AAPL', name: '苹果', shares: 4, avgCost: 314, currentPrice: 307.34, sector: '消费电子' },
      { symbol: 'XLV', name: '医疗ETF', shares: 6, avgCost: 152, currentPrice: 153.01, sector: '医药' },
      { symbol: 'MSFT', name: '微软', shares: 2, avgCost: 441, currentPrice: 416.67, sector: '软件' },
    ], 1769.80),
  },
  {
    id: 'doubao', rank: 2, name: '豆包', avatar: 'DB', color: '#f472b6',
    totalAssets: 9711.07, returnPct: -2.89, cash: 315.51, cashPct: 3.2, holdingsCount: 5,
    style: '均衡分散 · 宽基+成长回归', badge: 'silver',
    holdings: mkHoldings([
      { symbol: 'VOO', name: '标普500ETF', shares: 5, avgCost: 698.27, currentPrice: 678.00, sector: '宽基ETF' },
      { symbol: 'NVDA', name: '英伟达', shares: 12, avgCost: 215.95, currentPrice: 205.10, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 416.67, sector: '软件' },
      { symbol: 'JNJ', name: '强生', shares: 5, avgCost: 222.64, currentPrice: 232.77, sector: '医药' },
      { symbol: 'SCHD', name: '红利ETF', shares: 35, avgCost: 32.49, currentPrice: 32.30, sector: '红利ETF' },
    ], 315.51),
  },
  {
    id: 'cathie-wood', rank: 3, name: '木头姐', avatar: 'CW', color: '#818cf8',
    totalAssets: 9573.08, returnPct: -4.27, cash: 1119.11, cashPct: 11.7, holdingsCount: 8,
    style: '颠覆创新 · 五大平台收敛', badge: 'bronze',
    holdings: mkHoldings([
      { symbol: 'TEM', name: 'Tempus AI', shares: 40, avgCost: 47.80, currentPrice: 46.43, sector: '医药' },
      { symbol: 'SHOP', name: 'Shopify', shares: 11, avgCost: 112.94, currentPrice: 109.54, sector: '电商/云' },
      { symbol: 'TSLA', name: '特斯拉', shares: 3, avgCost: 423.70, currentPrice: 391.00, sector: '汽车' },
      { symbol: 'CRSP', name: 'CRISPR', shares: 20, avgCost: 52.13, currentPrice: 51.84, sector: '生物科技' },
      { symbol: 'HOOD', name: 'Robinhood', shares: 12, avgCost: 82.85, currentPrice: 82.47, sector: '金融' },
      { symbol: 'PLTR', name: 'Palantir', shares: 7, avgCost: 142.20, currentPrice: 135.53, sector: '软件' },
      { symbol: 'COIN', name: 'Coinbase', shares: 5, avgCost: 161.06, currentPrice: 152.40, sector: '金融' },
      { symbol: 'CRCL', name: 'Circle', shares: 6, avgCost: 90.13, currentPrice: 80.28, sector: '金融' },
    ], 1119.11),
  },
  {
    id: 'gemini-ext', rank: 4, name: 'Gemini(深度)', avatar: 'GE', color: '#60a5fa',
    totalAssets: 9539.25, returnPct: -4.61, cash: 582.38, cashPct: 6.1, holdingsCount: 4,
    style: '成长型 · 极致聚焦AI龙头', badge: null,
    holdings: mkHoldings([
      { symbol: 'GOOGL', name: '谷歌', shares: 8, avgCost: 362, currentPrice: 368.53, sector: '互联网' },
      { symbol: 'NVDA', name: '英伟达', shares: 14, avgCost: 219.91, currentPrice: 205.10, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 416.67, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 4, avgCost: 291, currentPrice: 263.47, sector: '半导体' },
    ], 582.38),
  },
  {
    id: 'grok', rank: 5, name: 'Grok', avatar: 'GK', color: '#fb923c',
    totalAssets: 9482.61, returnPct: -5.17, cash: -354.57, cashPct: -3.7, holdingsCount: 5,
    style: '成长型 · AI主题集中(现金透支)', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 15, avgCost: 220.84, currentPrice: 205.10, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 743.75, currentPrice: 705.06, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 442, currentPrice: 416.67, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 315, currentPrice: 307.34, sector: '消费电子' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 362, currentPrice: 368.53, sector: '互联网' },
    ], -354.57),
  },
  {
    id: 'chatgpt', rank: 6, name: 'ChatGPT', avatar: 'CG', color: '#4ade80',
    totalAssets: 9453.92, returnPct: -5.46, cash: 117.97, cashPct: 1.2, holdingsCount: 6,
    style: '成长型 · 平台科技+金融防守', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 222.82, currentPrice: 205.10, sector: '半导体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 5, avgCost: 363.19, currentPrice: 368.53, sector: '互联网' },
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 605.95, currentPrice: 593.00, sector: '社交媒体' },
      { symbol: 'AMZN', name: '亚马逊', shares: 6, avgCost: 254.77, currentPrice: 246.03, sector: '电商/云' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 436.71, currentPrice: 416.67, sector: '软件' },
      { symbol: 'JPM', name: '摩根大通', shares: 3, avgCost: 304.32, currentPrice: 312.37, sector: '金融' },
    ], 117.97),
  },
  {
    id: 'beth-kindig', rank: 7, name: 'Beth Kindig', avatar: 'BK', color: '#fb7185',
    totalAssets: 9386.96, returnPct: -6.13, cash: 1143.56, cashPct: 12.2, holdingsCount: 6,
    style: '成长型 · 电力主线+软件', badge: null,
    holdings: mkHoldings([
      { symbol: 'BE', name: 'Bloom Energy', shares: 12, avgCost: 283.85, currentPrice: 263.61, sector: '电力' },
      { symbol: 'PLTR', name: 'Palantir', shares: 12, avgCost: 142.20, currentPrice: 135.53, sector: '软件' },
      { symbol: 'APP', name: 'AppLovin', shares: 2, avgCost: 570.83, currentPrice: 557.20, sector: '软件' },
      { symbol: 'GEV', name: 'GE Vernova', shares: 1, avgCost: 959.36, currentPrice: 933.61, sector: '电力' },
      { symbol: 'MRVL', name: 'Marvell', shares: 3, avgCost: 301.65, currentPrice: 263.47, sector: '半导体' },
      { symbol: 'NVDA', name: '英伟达', shares: 3, avgCost: 214.50, currentPrice: 205.10, sector: '半导体' },
    ], 1143.56),
  },
  {
    id: 'gemini-std', rank: 8, name: 'Gemini(标准)', avatar: 'GS', color: '#38bdf8',
    totalAssets: 9383.69, returnPct: -6.16, cash: 173.00, cashPct: 1.8, holdingsCount: 3,
    style: '成长型 · 行业极度集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 21, avgCost: 220.86, currentPrice: 205.10, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 746, currentPrice: 705.06, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 416.67, sector: '软件' },
    ], 173.00),
  },
  {
    id: 'serenity', rank: 9, name: 'Serenity', avatar: 'SE', color: '#2dd4bf',
    totalAssets: 9362.26, returnPct: -6.38, cash: 772.79, cashPct: 8.3, holdingsCount: 4,
    style: '光互连 · AI算力瓶颈集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'COHR', name: 'Coherent', shares: 10, avgCost: 394.39, currentPrice: 376.99, sector: '光模块' },
      { symbol: 'LITE', name: 'Lumentum', shares: 3, avgCost: 900.70, currentPrice: 863.66, sector: '光模块' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 282.03, currentPrice: 263.47, sector: '半导体' },
      { symbol: 'NBIS', name: 'Nebius', shares: 4, avgCost: 240.90, currentPrice: 227.81, sector: '云计算' },
    ], 772.79),
  },
  {
    id: 'qwen', rank: 10, name: '千问', avatar: 'QW', color: '#fbbf24',
    totalAssets: 8824.02, returnPct: -11.76, cash: 204.34, cashPct: 2.3, holdingsCount: 7,
    style: '成长型 · 价格造假累计重创', badge: null,
    holdings: mkHoldings([
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 597.63, currentPrice: 593.00, sector: '社交媒体' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 314, currentPrice: 307.34, sector: '消费电子' },
      { symbol: 'V', name: 'Visa', shares: 4, avgCost: 320, currentPrice: 323.57, sector: '金融' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 416.67, sector: '软件' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 246.03, sector: '电商/云' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 420, currentPrice: 396.24, sector: '黄金' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 368.40, currentPrice: 368.53, sector: '互联网' },
    ], 204.34),
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 },
  { date: '06-04', chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 },
  { date: '06-05', chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 },
  { date: '06-08', chatgpt: -5.46, 'gemini-ext': -4.61, 'gemini-std': -6.16, claude: -1.59, grok: -5.17, doubao: -2.89, qwen: -11.76, serenity: -6.38, 'beth-kindig': -6.13, 'cathie-wood': -4.27 },
];

export const dailyReturns: DailyReturn[] = [
  { date: '2026-06-03', returns: { chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 } },
  { date: '2026-06-04', returns: { chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 } },
  { date: '2026-06-05', returns: { chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 } },
  { date: '2026-06-08', returns: { chatgpt: -5.46, 'gemini-ext': -4.61, 'gemini-std': -6.16, claude: -1.59, grok: -5.17, doubao: -2.89, qwen: -11.76, serenity: -6.38, 'beth-kindig': -6.13, 'cathie-wood': -4.27 } },
];

export const competitionInfo = {
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
};
