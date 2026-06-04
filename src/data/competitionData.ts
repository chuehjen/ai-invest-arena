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
    id: 'chatgpt', rank: 8, name: 'ChatGPT', avatar: 'CG', color: '#4ade80',
    totalAssets: 9660.55, returnPct: -3.39, cash: 200.41, cashPct: 2.1, holdingsCount: 7,
    style: '成长型 · 平台科技均衡', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 222.82, currentPrice: 214.75, sector: '半导体' },
      { symbol: 'META', name: 'Meta', shares: 3, avgCost: 605.95, currentPrice: 623.00, sector: '社交媒体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 4, avgCost: 361.85, currentPrice: 358.99, sector: '互联网' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 436.71, currentPrice: 427.50, sector: '软件' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 250.02, sector: '电商/云' },
      { symbol: 'TSM', name: '台积电', shares: 2, avgCost: 446.69, currentPrice: 436.69, sector: '半导体' },
      { symbol: 'JPM', name: '摩根大通', shares: 2, avgCost: 300.96, currentPrice: 300.85, sector: '金融' },
    ], 200.41),
  },
  {
    id: 'gemini-ext', rank: 5, name: 'Gemini(深度)', avatar: 'GE', color: '#60a5fa',
    totalAssets: 9968.52, returnPct: -0.31, cash: 169.20, cashPct: 1.7, holdingsCount: 5,
    style: '成长型 · 行业集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'GOOGL', name: '谷歌', shares: 8, avgCost: 362, currentPrice: 362.00, sector: '互联网' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 441.00, sector: '软件' },
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 223, currentPrice: 214.75, sector: '半导体' },
      { symbol: 'MRVL', name: 'Marvell', shares: 6, avgCost: 291, currentPrice: 301.77, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 1, avgCost: 747, currentPrice: 740.20, sector: '科技ETF' },
    ], 169.20),
  },
  {
    id: 'gemini-std', rank: 7, name: 'Gemini(标准)', avatar: 'GS', color: '#38bdf8',
    totalAssets: 9818.00, returnPct: -1.82, cash: 173.00, cashPct: 1.8, holdingsCount: 3,
    style: '成长型 · 行业集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 21, avgCost: 220.86, currentPrice: 214.00, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 441.00, sector: '软件' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 746, currentPrice: 736.50, sector: '科技ETF' },
    ], 173.00),
  },
  {
    id: 'claude', rank: 3, name: 'Claude', avatar: 'CL', color: '#a78bfa',
    totalAssets: 9997.00, returnPct: -0.03, cash: 1775.00, cashPct: 17.8, holdingsCount: 6,
    style: '均衡偏防御 · 科技+能源对冲', badge: 'bronze',
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 8, avgCost: 223, currentPrice: 221.00, sector: '半导体' },
      { symbol: 'XOM', name: '埃克森美孚', shares: 11, avgCost: 151, currentPrice: 150.00, sector: '能源' },
      { symbol: 'GOOGL', name: '谷歌', shares: 4, avgCost: 364, currentPrice: 358.00, sector: '互联网' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 415, currentPrice: 428.00, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 4, avgCost: 314, currentPrice: 312.00, sector: '消费电子' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 420, currentPrice: 420.00, sector: '黄金' },
    ], 1775),
  },
  {
    id: 'grok', rank: 6, name: 'Grok', avatar: 'GK', color: '#fb923c',
    totalAssets: 9852.00, returnPct: -1.48, cash: 282.00, cashPct: 2.9, holdingsCount: 5,
    style: '成长型 · AI主题集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 12, avgCost: 223, currentPrice: 218.50, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 442, currentPrice: 430.00, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 315, currentPrice: 312.00, sector: '消费电子' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 743.75, currentPrice: 737.00, sector: '科技ETF' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 362, currentPrice: 360.00, sector: '互联网' },
    ], 282.00),
  },
  {
    id: 'doubao', rank: 9, name: '豆包', avatar: 'DB', color: '#f472b6',
    totalAssets: 9852.44, returnPct: -1.48, cash: 1204.50, cashPct: 12.2, holdingsCount: 5,
    style: '均衡分散 · 宽基+高股息防御', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 11, avgCost: 221.38, currentPrice: 214.75, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 3, avgCost: 441.31, currentPrice: 427.34, sector: '软件' },
      { symbol: 'VOO', name: '标普500ETF', shares: 5, avgCost: 698.27, currentPrice: 692.10, sector: '宽基ETF' },
      { symbol: 'SCHD', name: '红利ETF', shares: 27, avgCost: 32.45, currentPrice: 32.51, sector: '红利ETF' },
      { symbol: 'JNJ', name: '强生', shares: 3, avgCost: 223, currentPrice: 221.80, sector: '医药' },
    ], 1204.50),
  },
  {
    id: 'qwen', rank: 1, name: '千问', avatar: 'QW', color: '#fbbf24',
    totalAssets: 10333.52, returnPct: 3.34, cash: 0, cashPct: 0, holdingsCount: 7,
    style: '成长型 · 进攻+防御对冲', badge: 'gold',
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 5, avgCost: 260, currentPrice: 213.41, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 6, avgCost: 450, currentPrice: 432.23, sector: '软件' },
      { symbol: 'AMZN', name: '亚马逊', shares: 6, avgCost: 190, currentPrice: 253.34, sector: '电商/云' },
      { symbol: 'META', name: 'Meta', shares: 4, avgCost: 500, currentPrice: 631.66, sector: '社交媒体' },
      { symbol: 'V', name: 'Visa', shares: 4, avgCost: 320, currentPrice: 319.84, sector: '金融' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 140, currentPrice: 140.00, sector: '黄金' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 260, currentPrice: 213.41, sector: '消费电子' },
    ], 0),
  },
  {
    id: 'serenity', rank: 2, name: 'Serenity', avatar: 'SE', color: '#2dd4bf',
    totalAssets: 9979.66, returnPct: -0.20, cash: 214.64, cashPct: 2.2, holdingsCount: 5,
    style: '光互连 · AI算力瓶颈集中', badge: 'silver',
    holdings: mkHoldings([
      { symbol: 'LITE', name: 'Lumentum', shares: 3, avgCost: 900.70, currentPrice: 899.60, sector: '光模块' },
      { symbol: 'COHR', name: 'Coherent', shares: 8, avgCost: 396.96, currentPrice: 393.85, sector: '光模块' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 282.03, currentPrice: 285.60, sector: '半导体' },
      { symbol: 'NBIS', name: 'Nebius', shares: 6, avgCost: 240.90, currentPrice: 244.00, sector: '云计算' },
      { symbol: 'MU', name: '美光', shares: 1, avgCost: 1052.01, currentPrice: 1023.42, sector: '半导体' },
    ], 214.64),
  },
  {
    id: 'beth-kindig', rank: 10, name: 'Beth Kindig', avatar: 'BK', color: '#fb7185',
    totalAssets: 9856.34, returnPct: -1.44, cash: 880.09, cashPct: 8.9, holdingsCount: 6,
    style: '成长型 · 电力主线+软件', badge: null,
    holdings: mkHoldings([
      { symbol: 'BE', name: 'Bloom Energy', shares: 12, avgCost: 283.85, currentPrice: 279.00, sector: '电力' },
      { symbol: 'PLTR', name: 'Palantir', shares: 12, avgCost: 142.20, currentPrice: 145.78, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 4, avgCost: 301.65, currentPrice: 285.60, sector: '半导体' },
      { symbol: 'APP', name: 'AppLovin', shares: 2, avgCost: 570.83, currentPrice: 573.00, sector: '软件' },
      { symbol: 'GEV', name: 'GE Vernova', shares: 1, avgCost: 959.36, currentPrice: 949.00, sector: '电力' },
      { symbol: 'NVDA', name: '英伟达', shares: 3, avgCost: 214.50, currentPrice: 213.83, sector: '半导体' },
    ], 880.09),
  },
  {
    id: 'cathie-wood', rank: 4, name: '木头姐', avatar: 'CW', color: '#818cf8',
    totalAssets: 9983.67, returnPct: -0.16, cash: 1269.16, cashPct: 12.7, holdingsCount: 9,
    style: '颠覆创新 · 五大平台收敛', badge: null,
    holdings: mkHoldings([
      { symbol: 'TSLA', name: '特斯拉', shares: 3, avgCost: 423.70, currentPrice: 419.85, sector: '汽车' },
      { symbol: 'SHOP', name: 'Shopify', shares: 11, avgCost: 112.94, currentPrice: 115.52, sector: '电商/云' },
      { symbol: 'TEM', name: 'Tempus AI', shares: 30, avgCost: 47.38, currentPrice: 47.03, sector: '医药' },
      { symbol: 'PLTR', name: 'Palantir', shares: 7, avgCost: 142.20, currentPrice: 145.78, sector: '软件' },
      { symbol: 'CRSP', name: 'CRISPR', shares: 20, avgCost: 52.13, currentPrice: 52.59, sector: '生物科技' },
      { symbol: 'AMD', name: 'AMD', shares: 1, avgCost: 542.52, currentPrice: 514.98, sector: '半导体' },
      { symbol: 'HOOD', name: 'Robinhood', shares: 12, avgCost: 82.85, currentPrice: 83.17, sector: '金融' },
      { symbol: 'COIN', name: 'Coinbase', shares: 4, avgCost: 163.22, currentPrice: 162.66, sector: '金融' },
      { symbol: 'CRCL', name: 'Circle', shares: 6, avgCost: 90.13, currentPrice: 89.57, sector: '金融' },
    ], 1269.16),
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 },
  { date: '06-04', chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 3.34, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 },
];

export const dailyReturns: DailyReturn[] = [
  { date: '2026-06-03', returns: { chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 } },
  { date: '2026-06-04', returns: { chatgpt: -3.39, 'gemini-ext': -0.31, 'gemini-std': -1.82, claude: -0.03, grok: -1.48, doubao: -1.48, qwen: 3.34, serenity: -0.20, 'beth-kindig': -1.44, 'cathie-wood': -0.16 } },
];

export const competitionInfo = {
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
  daysRemaining: 29,
};
