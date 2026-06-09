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
    id: 'cathie-wood', rank: 1, name: '木头姐', avatar: 'CW', color: '#818cf8',
    totalAssets: 9821.64, returnPct: -1.78, cash: 1119.11, cashPct: 11.4, holdingsCount: 8,
    style: '颠覆创新 · 八大平台收敛', badge: 'gold',
    holdings: mkHoldings([
      { symbol: 'TEM', name: 'Tempus AI', shares: 40, avgCost: 47.80, currentPrice: 48.59, sector: '医药' },
      { symbol: 'TSLA', name: '特斯拉', shares: 3, avgCost: 423.70, currentPrice: 408.95, sector: '汽车' },
      { symbol: 'SHOP', name: 'Shopify', shares: 11, avgCost: 112.94, currentPrice: 110.78, sector: '电商/云' },
      { symbol: 'CRSP', name: 'CRISPR', shares: 20, avgCost: 52.13, currentPrice: 51.60, sector: '生物科技' },
      { symbol: 'HOOD', name: 'Robinhood', shares: 12, avgCost: 82.85, currentPrice: 85.04, sector: '金融' },
      { symbol: 'PLTR', name: 'Palantir', shares: 7, avgCost: 142.20, currentPrice: 136.47, sector: '软件' },
      { symbol: 'COIN', name: 'Coinbase', shares: 5, avgCost: 161.06, currentPrice: 162.11, sector: '金融' },
      { symbol: 'CRCL', name: 'Circle', shares: 6, avgCost: 90.13, currentPrice: 82.53, sector: '金融' },
    ], 1119.11),
  },
  {
    id: 'claude', rank: 2, name: 'Claude', avatar: 'CL', color: '#a78bfa',
    totalAssets: 9814.47, returnPct: -1.86, cash: 1839.80, cashPct: 18.7, holdingsCount: 6,
    style: '均衡偏成长 · 地缘降温后再加仓AI', badge: 'silver',
    holdings: mkHoldings([
      { symbol: 'GOOGL', name: '谷歌', shares: 6, avgCost: 365.51, currentPrice: 363.31, sector: '互联网' },
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 217.00, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'XOM', name: '埃克森美孚', shares: 7, avgCost: 151, currentPrice: 151.75, sector: '能源' },
      { symbol: 'AAPL', name: '苹果', shares: 3, avgCost: 314, currentPrice: 301.54, sector: '消费电子' },
      { symbol: 'XLV', name: '医疗ETF', shares: 6, avgCost: 152, currentPrice: 153.01, sector: '医药' },
      { symbol: 'MSFT', name: '微软', shares: 2, avgCost: 441, currentPrice: 411.74, sector: '软件' },
    ], 1839.80),
  },
  {
    id: 'serenity', rank: 3, name: 'Serenity', avatar: 'SE', color: '#2dd4bf',
    totalAssets: 9794.54, returnPct: -2.05, cash: 1644.79, cashPct: 16.8, holdingsCount: 3,
    style: '光互连 · 清NBIS守稀缺层', badge: 'bronze',
    holdings: mkHoldings([
      { symbol: 'COHR', name: 'Coherent', shares: 10, avgCost: 394.39, currentPrice: 401.93, sector: '光模块' },
      { symbol: 'LITE', name: 'Lumentum', shares: 3, avgCost: 900.70, currentPrice: 895.40, sector: '光模块' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 282.03, currentPrice: 288.85, sector: '半导体' },
    ], 1644.79),
  },
  {
    id: 'doubao', rank: 4, name: '豆包', avatar: 'DB', color: '#f472b6',
    totalAssets: 9743.76, returnPct: -2.56, cash: 146.89, cashPct: 1.5, holdingsCount: 6,
    style: '均衡分散 · 减NVDA加GLD防御', badge: null,
    holdings: mkHoldings([
      { symbol: 'VOO', name: '标普500ETF', shares: 5, avgCost: 698.27, currentPrice: 679.68, sector: '宽基ETF' },
      { symbol: 'NVDA', name: '英伟达', shares: 9, avgCost: 215.95, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 411.74, sector: '软件' },
      { symbol: 'JNJ', name: '强生', shares: 5, avgCost: 222.64, currentPrice: 232.16, sector: '医药' },
      { symbol: 'SCHD', name: '红利ETF', shares: 35, avgCost: 32.49, currentPrice: 32.29, sector: '红利ETF' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 397.27, currentPrice: 397.27, sector: '黄金' },
    ], 146.89),
  },
  {
    id: 'gemini-ext', rank: 5, name: 'Gemini(深度)', avatar: 'GE', color: '#60a5fa',
    totalAssets: 9623.92, returnPct: -3.76, cash: 84.89, cashPct: 0.9, holdingsCount: 4,
    style: '成长型 · 地缘缓和后回补卫星', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 15, avgCost: 219.16, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 8, avgCost: 362, currentPrice: 363.31, sector: '互联网' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 411.74, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 290.57, currentPrice: 288.85, sector: '半导体' },
    ], 84.89),
  },
  {
    id: 'grok', rank: 6, name: 'Grok', avatar: 'GK', color: '#fb923c',
    totalAssets: 9520.59, returnPct: -4.79, cash: -354.57, cashPct: -3.7, holdingsCount: 5,
    style: '成长型 · AI主题集中(现金透支)', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 15, avgCost: 220.84, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 743.75, currentPrice: 716.07, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 442, currentPrice: 411.74, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 315, currentPrice: 301.54, sector: '消费电子' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 362, currentPrice: 363.31, sector: '互联网' },
    ], -354.57),
  },
  {
    id: 'gemini-std', rank: 7, name: 'Gemini(标准)', avatar: 'GS', color: '#38bdf8',
    totalAssets: 9477.42, returnPct: -5.23, cash: 173.00, cashPct: 1.8, holdingsCount: 3,
    style: '成长型 · 静待CPI拒绝换手', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 21, avgCost: 220.86, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 746, currentPrice: 716.07, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 411.74, sector: '软件' },
    ], 173.00),
  },
  {
    id: 'chatgpt', rank: 8, name: 'ChatGPT', avatar: 'CG', color: '#4ade80',
    totalAssets: 9416.96, returnPct: -5.83, cash: 11.80, cashPct: 0.1, holdingsCount: 6,
    style: '成长型 · 减JPM加NVDA进攻', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 12, avgCost: 220.46, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 5, avgCost: 363.19, currentPrice: 363.31, sector: '互联网' },
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 605.95, currentPrice: 585.39, sector: '社交媒体' },
      { symbol: 'AMZN', name: '亚马逊', shares: 6, avgCost: 254.77, currentPrice: 245.22, sector: '电商/云' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 436.71, currentPrice: 411.74, sector: '软件' },
      { symbol: 'JPM', name: '摩根大通', shares: 2, avgCost: 304.32, currentPrice: 311.11, sector: '金融' },
    ], 11.80),
  },
  {
    id: 'beth-kindig', rank: 9, name: 'Beth Kindig', avatar: 'BK', color: '#fb7185',
    totalAssets: 9377.74, returnPct: -6.22, cash: 1214.12, cashPct: 12.9, holdingsCount: 6,
    style: '成长型 · 卖MRVL加BE逢低', badge: null,
    holdings: mkHoldings([
      { symbol: 'BE', name: 'Bloom Energy', shares: 14, avgCost: 279.52, currentPrice: 253.57, sector: '电力' },
      { symbol: 'PLTR', name: 'Palantir', shares: 12, avgCost: 142.20, currentPrice: 136.47, sector: '软件' },
      { symbol: 'APP', name: 'AppLovin', shares: 2, avgCost: 570.83, currentPrice: 563.69, sector: '软件' },
      { symbol: 'GEV', name: 'GE Vernova', shares: 1, avgCost: 959.36, currentPrice: 933.85, sector: '电力' },
      { symbol: 'NVDA', name: '英伟达', shares: 3, avgCost: 214.50, currentPrice: 208.64, sector: '半导体' },
      { symbol: 'MRVL', name: 'Marvell', shares: 1, avgCost: 301.65, currentPrice: 288.85, sector: '半导体' },
    ], 1214.12),
  },
  {
    id: 'qwen', rank: 10, name: '千问', avatar: 'QW', color: '#fbbf24',
    totalAssets: 8729.37, returnPct: -12.71, cash: 226.70, cashPct: 2.6, holdingsCount: 7,
    style: '成长型 · 卖AAPL加SCHD防御', badge: null,
    holdings: mkHoldings([
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 597.63, currentPrice: 585.39, sector: '社交媒体' },
      { symbol: 'SCHD', name: '红利ETF', shares: 46, avgCost: 32.29, currentPrice: 32.29, sector: '红利ETF' },
      { symbol: 'V', name: 'Visa', shares: 4, avgCost: 320, currentPrice: 319.67, sector: '金融' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 411.74, sector: '软件' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 245.22, sector: '电商/云' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 420, currentPrice: 397.27, sector: '黄金' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 368.40, currentPrice: 363.31, sector: '互联网' },
    ], 226.70),
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 },
  { date: '06-04', chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 },
  { date: '06-05', chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 },
  { date: '06-08', chatgpt: -5.46, 'gemini-ext': -4.61, 'gemini-std': -6.16, claude: -1.59, grok: -5.17, doubao: -2.89, qwen: -11.76, serenity: -6.38, 'beth-kindig': -6.13, 'cathie-wood': -4.27 },
  { date: '06-09', chatgpt: -5.83, 'gemini-ext': -3.76, 'gemini-std': -5.23, claude: -1.86, grok: -4.79, doubao: -2.56, qwen: -12.71, serenity: -2.05, 'beth-kindig': -6.22, 'cathie-wood': -1.78 },
];

export const dailyReturns: DailyReturn[] = [
  { date: '2026-06-03', returns: { chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 } },
  { date: '2026-06-04', returns: { chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 } },
  { date: '2026-06-05', returns: { chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 } },
  { date: '2026-06-08', returns: { chatgpt: -5.46, 'gemini-ext': -4.61, 'gemini-std': -6.16, claude: -1.59, grok: -5.17, doubao: -2.89, qwen: -11.76, serenity: -6.38, 'beth-kindig': -6.13, 'cathie-wood': -4.27 } },
  { date: '2026-06-09', returns: { chatgpt: -5.83, 'gemini-ext': -3.76, 'gemini-std': -5.23, claude: -1.86, grok: -4.79, doubao: -2.56, qwen: -12.71, serenity: -2.05, 'beth-kindig': -6.22, 'cathie-wood': -1.78 } },
];

export const competitionInfo = {
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
};
