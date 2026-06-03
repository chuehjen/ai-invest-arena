export interface Participant {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  team: string;
  totalReturn: number;
  weeklyReturn: number;
  portfolioValue: number;
  trades: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  strategy: string;
  badge: 'gold' | 'silver' | 'bronze' | null;
}

export interface StockHolding {
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

export interface TradeRecord {
  id: string;
  date: string;
  symbol: string;
  name: string;
  action: 'buy' | 'sell';
  shares: number;
  price: number;
  amount: number;
  pnl: number | null;
}

export interface PerformancePoint {
  date: string;
  value: number;
  benchmark: number;
}

export const participants: Participant[] = [
  {
    id: '1',
    rank: 1,
    name: '张伟',
    avatar: 'ZW',
    team: 'Alpha量化团队',
    totalReturn: 38.6,
    weeklyReturn: 4.2,
    portfolioValue: 1386000,
    trades: 142,
    winRate: 68.3,
    sharpeRatio: 2.41,
    maxDrawdown: -8.2,
    strategy: '动量因子 + 机器学习',
    badge: 'gold',
  },
  {
    id: '2',
    rank: 2,
    name: '李娜',
    avatar: 'LN',
    team: 'Beta策略组',
    totalReturn: 31.4,
    weeklyReturn: 2.8,
    portfolioValue: 1314000,
    trades: 98,
    winRate: 72.4,
    sharpeRatio: 2.18,
    maxDrawdown: -6.5,
    strategy: '价值投资 + 基本面分析',
    badge: 'silver',
  },
  {
    id: '3',
    rank: 3,
    name: '王磊',
    avatar: 'WL',
    team: 'Gamma对冲基金',
    totalReturn: 27.9,
    weeklyReturn: 3.1,
    portfolioValue: 1279000,
    trades: 215,
    winRate: 61.8,
    sharpeRatio: 1.95,
    maxDrawdown: -11.3,
    strategy: '高频交易 + 套利策略',
    badge: 'bronze',
  },
  {
    id: '4',
    rank: 4,
    name: '陈静',
    avatar: 'CJ',
    team: 'Delta智能投顾',
    totalReturn: 24.3,
    weeklyReturn: 1.9,
    portfolioValue: 1243000,
    trades: 76,
    winRate: 65.8,
    sharpeRatio: 1.82,
    maxDrawdown: -9.7,
    strategy: 'LSTM神经网络预测',
    badge: null,
  },
  {
    id: '5',
    rank: 5,
    name: '刘洋',
    avatar: 'LY',
    team: 'Epsilon趋势跟踪',
    totalReturn: 21.7,
    weeklyReturn: 2.4,
    portfolioValue: 1217000,
    trades: 183,
    winRate: 58.2,
    sharpeRatio: 1.67,
    maxDrawdown: -13.8,
    strategy: '趋势跟踪 + 均值回归',
    badge: null,
  },
  {
    id: '6',
    rank: 6,
    name: '赵敏',
    avatar: 'ZM',
    team: 'Zeta事件驱动',
    totalReturn: 18.9,
    weeklyReturn: -0.8,
    portfolioValue: 1189000,
    trades: 54,
    winRate: 74.1,
    sharpeRatio: 1.54,
    maxDrawdown: -7.2,
    strategy: '事件驱动 + 情绪分析',
    badge: null,
  },
  {
    id: '7',
    rank: 7,
    name: '孙浩',
    avatar: 'SH',
    team: 'Eta多因子模型',
    totalReturn: 15.6,
    weeklyReturn: 1.2,
    portfolioValue: 1156000,
    trades: 127,
    winRate: 62.3,
    sharpeRatio: 1.38,
    maxDrawdown: -10.4,
    strategy: '多因子 + 风险平价',
    badge: null,
  },
  {
    id: '8',
    rank: 8,
    name: '周芳',
    avatar: 'ZF',
    team: 'Theta波动率套利',
    totalReturn: 12.4,
    weeklyReturn: 0.6,
    portfolioValue: 1124000,
    trades: 89,
    winRate: 59.6,
    sharpeRatio: 1.21,
    maxDrawdown: -15.6,
    strategy: '波动率套利 + 期权策略',
    badge: null,
  },
];

export const myHoldings: StockHolding[] = [
  {
    symbol: 'AAPL',
    name: '苹果公司',
    shares: 500,
    avgCost: 168.5,
    currentPrice: 189.3,
    marketValue: 94650,
    pnl: 10400,
    pnlPercent: 12.34,
    weight: 22.8,
    sector: '科技',
  },
  {
    symbol: 'NVDA',
    name: '英伟达',
    shares: 200,
    avgCost: 420.0,
    currentPrice: 875.4,
    marketValue: 175080,
    pnl: 91080,
    pnlPercent: 108.43,
    weight: 42.2,
    sector: '半导体',
  },
  {
    symbol: 'MSFT',
    name: '微软',
    shares: 150,
    avgCost: 380.2,
    currentPrice: 415.6,
    marketValue: 62340,
    pnl: 5310,
    pnlPercent: 9.31,
    weight: 15.0,
    sector: '科技',
  },
  {
    symbol: 'TSLA',
    name: '特斯拉',
    shares: 300,
    avgCost: 245.0,
    currentPrice: 218.7,
    marketValue: 65610,
    pnl: -7890,
    pnlPercent: -10.73,
    weight: 15.8,
    sector: '新能源',
  },
  {
    symbol: 'AMZN',
    name: '亚马逊',
    shares: 80,
    avgCost: 178.0,
    currentPrice: 192.4,
    marketValue: 15392,
    pnl: 1152,
    pnlPercent: 8.09,
    weight: 3.7,
    sector: '电商',
  },
  {
    symbol: 'GOOGL',
    name: '谷歌',
    shares: 60,
    avgCost: 140.5,
    currentPrice: 158.9,
    marketValue: 9534,
    pnl: 1104,
    pnlPercent: 13.09,
    weight: 2.3,
    sector: '科技',
  },
];

export const recentTrades: TradeRecord[] = [
  {
    id: 't1',
    date: '2026-06-03',
    symbol: 'NVDA',
    name: '英伟达',
    action: 'buy',
    shares: 50,
    price: 875.4,
    amount: 43770,
    pnl: null,
  },
  {
    id: 't2',
    date: '2026-06-02',
    symbol: 'TSLA',
    name: '特斯拉',
    action: 'sell',
    shares: 100,
    price: 222.3,
    amount: 22230,
    pnl: -2270,
  },
  {
    id: 't3',
    date: '2026-06-01',
    symbol: 'AAPL',
    name: '苹果公司',
    action: 'buy',
    shares: 100,
    price: 186.2,
    amount: 18620,
    pnl: null,
  },
  {
    id: 't4',
    date: '2026-05-30',
    symbol: 'MSFT',
    name: '微软',
    action: 'sell',
    shares: 50,
    price: 418.9,
    amount: 20945,
    pnl: 1935,
  },
  {
    id: 't5',
    date: '2026-05-29',
    symbol: 'AMZN',
    name: '亚马逊',
    action: 'buy',
    shares: 30,
    price: 190.5,
    amount: 5715,
    pnl: null,
  },
];

export const performanceHistory: PerformancePoint[] = [
  { date: '2026-01-01', value: 1000000, benchmark: 1000000 },
  { date: '2026-01-15', value: 1023000, benchmark: 1008000 },
  { date: '2026-02-01', value: 1058000, benchmark: 1015000 },
  { date: '2026-02-15', value: 1042000, benchmark: 1011000 },
  { date: '2026-03-01', value: 1089000, benchmark: 1022000 },
  { date: '2026-03-15', value: 1124000, benchmark: 1031000 },
  { date: '2026-04-01', value: 1156000, benchmark: 1038000 },
  { date: '2026-04-15', value: 1198000, benchmark: 1045000 },
  { date: '2026-05-01', value: 1231000, benchmark: 1052000 },
  { date: '2026-05-15', value: 1267000, benchmark: 1061000 },
  { date: '2026-06-01', value: 1314000, benchmark: 1068000 },
  { date: '2026-06-03', value: 1386000, benchmark: 1072000 },
];

export const competitionInfo = {
  name: 'AI投资精英挑战赛 2026',
  season: 'S3',
  startDate: '2026-01-01',
  endDate: '2026-12-31',
  totalParticipants: 128,
  prizePool: '¥500,000',
  daysRemaining: 211,
  myRank: 1,
  myReturn: 38.6,
  initialCapital: 1000000,
};
