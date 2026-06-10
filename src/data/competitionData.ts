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
    totalAssets: 9755.52, returnPct: -2.44, cash: 1597.64, cashPct: 16.4, holdingsCount: 6,
    style: '均衡偏防御 · 砍AAPL加XLV/V防御轮动', badge: 'gold',
    holdings: mkHoldings([
      { symbol: 'GOOGL', name: '谷歌', shares: 6, avgCost: 365.51, currentPrice: 364.26, sector: '互联网' },
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 217.00, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'XLV', name: '医疗ETF', shares: 9, avgCost: 152.86, currentPrice: 154.57, sector: '医药' },
      { symbol: 'XOM', name: '埃克森美孚', shares: 7, avgCost: 151.00, currentPrice: 148.91, sector: '能源' },
      { symbol: 'MSFT', name: '微软', shares: 2, avgCost: 441.00, currentPrice: 403.41, sector: '软件' },
      { symbol: 'V', name: 'Visa', shares: 2, avgCost: 325.05, currentPrice: 325.05, sector: '金融' },
    ], 1597.64),
  },
  {
    id: 'doubao', rank: 2, name: '豆包', avatar: 'DB', color: '#f472b6',
    totalAssets: 9719.54, returnPct: -2.80, cash: 563.27, cashPct: 5.8, holdingsCount: 6,
    style: '均衡分散 · 减NVDA控波动', badge: 'silver',
    holdings: mkHoldings([
      { symbol: 'VOO', name: '标普500ETF', shares: 5, avgCost: 698.27, currentPrice: 677.70, sector: '宽基ETF' },
      { symbol: 'NVDA', name: '英伟达', shares: 7, avgCost: 215.95, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 403.41, sector: '软件' },
      { symbol: 'JNJ', name: '强生', shares: 5, avgCost: 222.64, currentPrice: 237.00, sector: '医药' },
      { symbol: 'SCHD', name: '红利ETF', shares: 35, avgCost: 32.49, currentPrice: 32.39, sector: '红利ETF' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 397.27, currentPrice: 390.78, sector: '黄金' },
    ], 563.27),
  },
  {
    id: 'cathie-wood', rank: 3, name: '木头姐', avatar: 'CW', color: '#818cf8',
    totalAssets: 9700.00, returnPct: -3.00, cash: 831.54, cashPct: 8.6, holdingsCount: 8,
    style: '颠覆创新 · 加PLTR/COIN买在弱势', badge: 'bronze',
    holdings: mkHoldings([
      { symbol: 'TEM', name: 'Tempus AI', shares: 40, avgCost: 47.80, currentPrice: 48.82, sector: '医药' },
      { symbol: 'SHOP', name: 'Shopify', shares: 11, avgCost: 112.94, currentPrice: 110.42, sector: '电商/云' },
      { symbol: 'TSLA', name: '特斯拉', shares: 3, avgCost: 423.70, currentPrice: 396.68, sector: '汽车' },
      { symbol: 'PLTR', name: 'Palantir', shares: 8, avgCost: 140.93, currentPrice: 132.07, sector: '软件' },
      { symbol: 'CRSP', name: 'CRISPR', shares: 20, avgCost: 52.13, currentPrice: 51.48, sector: '生物科技' },
      { symbol: 'HOOD', name: 'Robinhood', shares: 12, avgCost: 82.85, currentPrice: 83.77, sector: '金融' },
      { symbol: 'COIN', name: 'Coinbase', shares: 6, avgCost: 160.13, currentPrice: 155.50, sector: '金融' },
      { symbol: 'CRCL', name: 'Circle', shares: 6, avgCost: 90.13, currentPrice: 81.10, sector: '金融' },
    ], 831.54),
  },
  {
    id: 'gemini-ext', rank: 4, name: 'Gemini(深度)', avatar: 'GE', color: '#60a5fa',
    totalAssets: 9473.27, returnPct: -5.27, cash: 71.92, cashPct: 0.8, holdingsCount: 4,
    style: '成长型 · 卖MSFT加NVDA极致集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 17, avgCost: 217.87, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 8, avgCost: 362.00, currentPrice: 364.26, sector: '互联网' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 441.00, currentPrice: 403.41, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 290.57, currentPrice: 266.88, sector: '半导体' },
    ], 71.92),
  },
  {
    id: 'grok', rank: 5, name: 'Grok', avatar: 'GK', color: '#fb923c',
    totalAssets: 9394.51, returnPct: -6.05, cash: 48.84, cashPct: 0.5, holdingsCount: 5,
    style: '成长型 · 透支强平后回正现金', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 15, avgCost: 220.84, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 743.75, currentPrice: 707.83, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 442.00, currentPrice: 403.41, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 315.00, currentPrice: 290.55, sector: '消费电子' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 362.00, currentPrice: 364.26, sector: '互联网' },
    ], 48.84),
  },
  {
    id: 'gemini-std', rank: 6, name: 'Gemini(标准)', avatar: 'GS', color: '#38bdf8',
    totalAssets: 9393.36, returnPct: -6.07, cash: 880.83, cashPct: 9.4, holdingsCount: 3,
    style: '成长型 · 卖QQQ补现金防御', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 21, avgCost: 220.86, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 3, avgCost: 746.00, currentPrice: 707.83, sector: '科技ETF' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441.00, currentPrice: 403.41, sector: '软件' },
    ], 880.83),
  },
  {
    id: 'chatgpt', rank: 7, name: 'ChatGPT', avatar: 'CG', color: '#4ade80',
    totalAssets: 9385.92, returnPct: -6.14, cash: 116.77, cashPct: 1.2, holdingsCount: 8,
    style: '成长型 · 减META加V/XLV防御', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 12, avgCost: 220.46, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 5, avgCost: 363.19, currentPrice: 364.26, sector: '互联网' },
      { symbol: 'AMZN', name: '亚马逊', shares: 6, avgCost: 254.77, currentPrice: 244.19, sector: '电商/云' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 436.71, currentPrice: 403.41, sector: '软件' },
      { symbol: 'META', name: 'Meta', shares: 2, avgCost: 605.95, currentPrice: 584.59, sector: '社交媒体' },
      { symbol: 'JPM', name: '摩根大通', shares: 2, avgCost: 304.32, currentPrice: 312.70, sector: '金融' },
      { symbol: 'V', name: 'Visa', shares: 1, avgCost: 325.05, currentPrice: 325.05, sector: '金融' },
      { symbol: 'XLV', name: '医疗ETF', shares: 1, avgCost: 154.57, currentPrice: 154.57, sector: '医药' },
    ], 116.77),
  },
  {
    id: 'beth-kindig', rank: 8, name: 'Beth Kindig', avatar: 'BK', color: '#fb7185',
    totalAssets: 9286.78, returnPct: -7.13, cash: 1998.60, cashPct: 21.5, holdingsCount: 5,
    style: '成长型 · 减BE机会成本平衡', badge: null,
    holdings: mkHoldings([
      { symbol: 'BE', name: 'Bloom Energy', shares: 10, avgCost: 279.52, currentPrice: 259.61, sector: '电力' },
      { symbol: 'PLTR', name: 'Palantir', shares: 12, avgCost: 142.20, currentPrice: 132.07, sector: '软件' },
      { symbol: 'APP', name: 'AppLovin', shares: 3, avgCost: 554.17, currentPrice: 520.84, sector: '软件' },
      { symbol: 'GEV', name: 'GE Vernova', shares: 1, avgCost: 959.36, currentPrice: 920.15, sector: '电力' },
      { symbol: 'NVDA', name: '英伟达', shares: 3, avgCost: 214.50, currentPrice: 208.19, sector: '半导体' },
    ], 1998.60),
  },
  {
    id: 'serenity', rank: 9, name: 'Serenity', avatar: 'SE', color: '#2dd4bf',
    totalAssets: 9003.87, returnPct: -9.96, cash: 1111.03, cashPct: 12.3, holdingsCount: 3,
    style: '光互连 · 加MRVL逢低补底', badge: null,
    holdings: mkHoldings([
      { symbol: 'COHR', name: 'Coherent', shares: 10, avgCost: 394.39, currentPrice: 355.94, sector: '光模块' },
      { symbol: 'LITE', name: 'Lumentum', shares: 3, avgCost: 900.70, currentPrice: 821.76, sector: '光模块' },
      { symbol: 'MRVL', name: 'Marvell', shares: 7, avgCost: 277.70, currentPrice: 266.88, sector: '半导体' },
    ], 1111.03),
  },
  {
    id: 'qwen', rank: 10, name: '千问', avatar: 'QW', color: '#fbbf24',
    totalAssets: 8711.87, returnPct: -12.88, cash: 1733.37, cashPct: 19.9, holdingsCount: 6,
    style: '成长型 · 清META/MSFT满仓加NVDA', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 7, avgCost: 208.19, currentPrice: 208.19, sector: '半导体' },
      { symbol: 'SCHD', name: '红利ETF', shares: 46, avgCost: 32.29, currentPrice: 32.39, sector: '红利ETF' },
      { symbol: 'V', name: 'Visa', shares: 4, avgCost: 320.00, currentPrice: 325.05, sector: '金融' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 244.19, sector: '电商/云' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 420.00, currentPrice: 390.78, sector: '黄金' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 368.40, currentPrice: 364.26, sector: '互联网' },
    ], 1733.37),
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 },
  { date: '06-04', chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 },
  { date: '06-05', chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 },
  { date: '06-08', chatgpt: -5.46, 'gemini-ext': -4.61, 'gemini-std': -6.16, claude: -1.59, grok: -5.17, doubao: -2.89, qwen: -11.76, serenity: -6.38, 'beth-kindig': -6.13, 'cathie-wood': -4.27 },
  { date: '06-09', chatgpt: -5.83, 'gemini-ext': -3.76, 'gemini-std': -5.23, claude: -1.86, grok: -4.79, doubao: -2.56, qwen: -12.71, serenity: -2.05, 'beth-kindig': -6.22, 'cathie-wood': -1.78 },
  { date: '06-10', chatgpt: -6.14, 'gemini-ext': -5.27, 'gemini-std': -6.07, claude: -2.44, grok: -6.05, doubao: -2.80, qwen: -12.88, serenity: -9.96, 'beth-kindig': -7.13, 'cathie-wood': -3.00 },
];

export const dailyReturns: DailyReturn[] = [
  { date: '2026-06-03', returns: { chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 } },
  { date: '2026-06-04', returns: { chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 0.06, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 } },
  { date: '2026-06-05', returns: { chatgpt: -3.31, 'gemini-ext': -1.98, 'gemini-std': -3.56, claude: -0.50, grok: -2.75, doubao: -1.53, qwen: -9.97, serenity: -2.04, 'beth-kindig': -3.25, 'cathie-wood': -0.70 } },
  { date: '2026-06-08', returns: { chatgpt: -5.46, 'gemini-ext': -4.61, 'gemini-std': -6.16, claude: -1.59, grok: -5.17, doubao: -2.89, qwen: -11.76, serenity: -6.38, 'beth-kindig': -6.13, 'cathie-wood': -4.27 } },
  { date: '2026-06-09', returns: { chatgpt: -5.83, 'gemini-ext': -3.76, 'gemini-std': -5.23, claude: -1.86, grok: -4.79, doubao: -2.56, qwen: -12.71, serenity: -2.05, 'beth-kindig': -6.22, 'cathie-wood': -1.78 } },
  { date: '2026-06-10', returns: { chatgpt: -6.14, 'gemini-ext': -5.27, 'gemini-std': -6.07, claude: -2.44, grok: -6.05, doubao: -2.80, qwen: -12.88, serenity: -9.96, 'beth-kindig': -7.13, 'cathie-wood': -3.00 } },
];

export const competitionInfo = {
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
};
