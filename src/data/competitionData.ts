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
  const total = Math.min(stockVal + cash, 10000);
  return items.map(h => {
    const mv = h.shares * h.currentPrice;
    const pnl = (h.currentPrice - h.avgCost) * h.shares;
    const pnlPct = h.avgCost > 0 ? ((h.currentPrice - h.avgCost) / h.avgCost) * 100 : 0;
    return { ...h, marketValue: mv, pnl, pnlPercent: pnlPct, weight: Math.round((mv / total) * 1000) / 10 };
  });
};

export const participants: Agent[] = [
  {
    id: 'chatgpt', rank: 1, name: 'ChatGPT', avatar: 'CG', color: '#4ade80',
    totalAssets: 10000, returnPct: 0, cash: 23.91, cashPct: 0.2, holdingsCount: 8,
    style: '成长型 · AI主线集中', badge: 'gold',
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 222.82, currentPrice: 222.82, sector: '半导体' },
      { symbol: 'AVGO', name: '博通', shares: 3, avgCost: 481.57, currentPrice: 481.57, sector: '半导体' },
      { symbol: 'GOOGL', name: '谷歌', shares: 4, avgCost: 361.85, currentPrice: 361.85, sector: '互联网' },
      { symbol: 'AMZN', name: '亚马逊', shares: 5, avgCost: 256.52, currentPrice: 256.52, sector: '电商/云' },
      { symbol: 'META', name: 'Meta', shares: 2, avgCost: 597.63, currentPrice: 597.63, sector: '社交媒体' },
      { symbol: 'TSM', name: '台积电', shares: 2, avgCost: 446.69, currentPrice: 446.69, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 2, avgCost: 441.31, currentPrice: 441.31, sector: '软件' },
      { symbol: 'JPM', name: '摩根大通', shares: 2, avgCost: 300.96, currentPrice: 300.96, sector: '金融' },
    ], 23.91),
  },
  {
    id: 'gemini-ext', rank: 2, name: 'Gemini(深度)', avatar: 'GE', color: '#60a5fa',
    totalAssets: 10000, returnPct: 0, cash: 153, cashPct: 1.5, holdingsCount: 5,
    style: '成长型 · 行业集中', badge: 'silver',
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 223, currentPrice: 223, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 441, sector: '软件' },
      { symbol: 'GOOGL', name: '谷歌', shares: 6, avgCost: 362, currentPrice: 362, sector: '互联网' },
      { symbol: 'MRVL', name: 'Marvell', shares: 6, avgCost: 291, currentPrice: 291, sector: '半导体' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 2, avgCost: 747, currentPrice: 747, sector: '科技ETF' },
    ], 153),
  },
  {
    id: 'gemini-std', rank: 3, name: 'Gemini(标准)', avatar: 'GS', color: '#38bdf8',
    totalAssets: 10000, returnPct: 0, cash: 815, cashPct: 8.2, holdingsCount: 3,
    style: '成长型 · 行业集中', badge: 'bronze',
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 18, avgCost: 222, currentPrice: 222, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 5, avgCost: 441, currentPrice: 441, sector: '软件' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 4, avgCost: 746, currentPrice: 746, sector: '科技ETF' },
    ], 815),
  },
  {
    id: 'claude', rank: 4, name: 'Claude', avatar: 'CL', color: '#a78bfa',
    totalAssets: 10000, returnPct: 0, cash: 1527, cashPct: 15.3, holdingsCount: 6,
    style: '均衡型 · 科技+双重对冲', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 8, avgCost: 223, currentPrice: 223, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 415, currentPrice: 415, sector: '软件' },
      { symbol: 'GOOGL', name: '谷歌', shares: 4, avgCost: 364, currentPrice: 364, sector: '互联网' },
      { symbol: 'GLD', name: '黄金ETF', shares: 3, avgCost: 420, currentPrice: 420, sector: '黄金' },
      { symbol: 'AAPL', name: '苹果', shares: 4, avgCost: 314, currentPrice: 314, sector: '消费电子' },
      { symbol: 'XOM', name: '埃克森美孚', shares: 7, avgCost: 151, currentPrice: 151, sector: '能源' },
    ], 1527),
  },
  {
    id: 'grok', rank: 5, name: 'Grok', avatar: 'GK', color: '#fb923c',
    totalAssets: 10000, returnPct: 0, cash: 1019, cashPct: 10.2, holdingsCount: 5,
    style: '成长型 · AI主题集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 12, avgCost: 223, currentPrice: 223, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 442, currentPrice: 442, sector: '软件' },
      { symbol: 'AAPL', name: '苹果', shares: 5, avgCost: 315, currentPrice: 315, sector: '消费电子' },
      { symbol: 'QQQ', name: '纳指ETF', shares: 3, avgCost: 746, currentPrice: 746, sector: '科技ETF' },
      { symbol: 'GOOGL', name: '谷歌', shares: 2, avgCost: 362, currentPrice: 362, sector: '互联网' },
    ], 1019),
  },
  {
    id: 'doubao', rank: 6, name: '豆包', avatar: 'DB', color: '#f472b6',
    totalAssets: 10000, returnPct: 0, cash: 385.59, cashPct: 3.9, holdingsCount: 6,
    style: '均衡分散 · 宽基+防御', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 9, avgCost: 222.82, currentPrice: 222.82, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 4, avgCost: 441.31, currentPrice: 441.31, sector: '软件' },
      { symbol: 'VOO', name: '标普500ETF', shares: 5, avgCost: 698.27, currentPrice: 698.27, sector: '宽基ETF' },
      { symbol: 'SCHD', name: '红利ETF', shares: 12, avgCost: 32.37, currentPrice: 32.37, sector: '红利ETF' },
      { symbol: 'JNJ', name: '强生', shares: 3, avgCost: 223, currentPrice: 223, sector: '医药' },
      { symbol: 'QQQM', name: '纳指100ETF', shares: 7, avgCost: 185, currentPrice: 185, sector: '科技ETF' },
    ], 385.59),
  },
  {
    id: 'qwen', rank: 7, name: '千问', avatar: 'QW', color: '#fbbf24',
    totalAssets: 10000, returnPct: 0, cash: 0, cashPct: 0, holdingsCount: 6,
    style: '成长型 · 进攻+防御对冲', badge: null,
    holdings: mkHoldings([
      { symbol: 'NVDA', name: '英伟达', shares: 10, avgCost: 260, currentPrice: 260, sector: '半导体' },
      { symbol: 'MSFT', name: '微软', shares: 6, avgCost: 450, currentPrice: 450, sector: '软件' },
      { symbol: 'AMZN', name: '亚马逊', shares: 6, avgCost: 190, currentPrice: 190, sector: '电商/云' },
      { symbol: 'META', name: 'Meta', shares: 4, avgCost: 500, currentPrice: 500, sector: '社交媒体' },
      { symbol: 'V', name: 'Visa', shares: 4, avgCost: 320, currentPrice: 320, sector: '金融' },
      { symbol: 'GLD', name: '黄金ETF', shares: 2, avgCost: 140, currentPrice: 140, sector: '黄金' },
    ], 0),
  },
  {
    id: 'serenity', rank: 8, name: 'Serenity', avatar: 'SE', color: '#2dd4bf',
    totalAssets: 10000, returnPct: 0, cash: 1002.34, cashPct: 10.0, holdingsCount: 5,
    style: '光互连 · AI算力瓶颈集中', badge: null,
    holdings: mkHoldings([
      { symbol: 'LITE', name: 'Lumentum', shares: 3, avgCost: 900.70, currentPrice: 900.70, sector: '光模块' },
      { symbol: 'COHR', name: 'Coherent', shares: 6, avgCost: 398.00, currentPrice: 398.00, sector: '光模块' },
      { symbol: 'MRVL', name: 'Marvell', shares: 5, avgCost: 282.03, currentPrice: 282.03, sector: '半导体' },
      { symbol: 'NBIS', name: 'Nebius', shares: 6, avgCost: 240.90, currentPrice: 240.90, sector: '云计算' },
      { symbol: 'MU', name: '美光', shares: 1, avgCost: 1052.01, currentPrice: 1052.01, sector: '半导体' },
    ], 1002.34),
  },
  {
    id: 'beth-kindig', rank: 9, name: 'Beth Kindig', avatar: 'BK', color: '#fb7185',
    totalAssets: 10000, returnPct: 0, cash: 1251.67, cashPct: 12.5, holdingsCount: 7,
    style: '成长型 · 电力主线+软件', badge: null,
    holdings: mkHoldings([
      { symbol: 'BE', name: 'Bloom Energy', shares: 7, avgCost: 287.32, currentPrice: 287.32, sector: '电力' },
      { symbol: 'PLTR', name: 'Palantir', shares: 12, avgCost: 142.20, currentPrice: 142.20, sector: '软件' },
      { symbol: 'MRVL', name: 'Marvell', shares: 4, avgCost: 301.65, currentPrice: 301.65, sector: '半导体' },
      { symbol: 'APP', name: 'AppLovin', shares: 2, avgCost: 570.83, currentPrice: 570.83, sector: '软件' },
      { symbol: 'MU', name: '美光', shares: 1, avgCost: 1079.57, currentPrice: 1079.57, sector: '半导体' },
      { symbol: 'GEV', name: 'GE Vernova', shares: 1, avgCost: 959.36, currentPrice: 959.36, sector: '电力' },
      { symbol: 'NVDA', name: '英伟达', shares: 3, avgCost: 214.50, currentPrice: 214.50, sector: '半导体' },
    ], 1251.67),
  },
  {
    id: 'cathie-wood', rank: 10, name: '木头姐', avatar: 'CW', color: '#818cf8',
    totalAssets: 10000, returnPct: 0, cash: 1235.60, cashPct: 12.4, holdingsCount: 9,
    style: '颠覆创新 · 五大平台收敛', badge: null,
    holdings: mkHoldings([
      { symbol: 'TSLA', name: '特斯拉', shares: 3, avgCost: 423.70, currentPrice: 423.70, sector: '汽车' },
      { symbol: 'SHOP', name: 'Shopify', shares: 11, avgCost: 112.94, currentPrice: 112.94, sector: '电商/云' },
      { symbol: 'AMD', name: 'AMD', shares: 2, avgCost: 542.52, currentPrice: 542.52, sector: '半导体' },
      { symbol: 'TEM', name: 'Tempus AI', shares: 22, avgCost: 47.51, currentPrice: 47.51, sector: '医药' },
      { symbol: 'PLTR', name: 'Palantir', shares: 7, avgCost: 142.20, currentPrice: 142.20, sector: '软件' },
      { symbol: 'HOOD', name: 'Robinhood', shares: 12, avgCost: 82.85, currentPrice: 82.85, sector: '金融' },
      { symbol: 'CRSP', name: 'CRISPR', shares: 18, avgCost: 52.08, currentPrice: 52.08, sector: '生物科技' },
      { symbol: 'COIN', name: 'Coinbase', shares: 4, avgCost: 163.22, currentPrice: 163.22, sector: '金融' },
      { symbol: 'CRCL', name: 'Circle', shares: 6, avgCost: 90.13, currentPrice: 90.13, sector: '金融' },
    ], 1235.60),
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '06-03', chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 },
];

export const dailyReturns: DailyReturn[] = [
  { date: '2026-06-03', returns: { chatgpt: 0, 'gemini-ext': 0, 'gemini-std': 0, claude: 0, grok: 0, doubao: 0, qwen: 0, serenity: 0, 'beth-kindig': 0, 'cathie-wood': 0 } },
];

export const competitionInfo = {
  name: 'AI 美股投资竞赛',
  season: 'S1',
  startDate: '2026-06-03',
  endDate: '2026-07-03',
  totalParticipants: 10,
  initialCapital: 10000,
  daysRemaining: 30,
};
