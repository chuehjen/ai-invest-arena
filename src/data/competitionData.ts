/**
 * 竞赛数据类型定义。
 * 实际数据从 public/data/latest.json 异步加载（见 dataLoader.ts）。
 * 历史快照存放在 public/data/archive/{YYYY-MM-DD}.json。
 */

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

export interface PerformancePoint {
  date: string;
  [agentId: string]: string | number;
}

export interface DailyReturn {
  date: string;
  returns: { [agentId: string]: number };
}

export interface CompetitionInfo {
  name: string;
  season: string;
  startDate: string;
  endDate: string;
  totalParticipants: number;
  initialCapital: number;
}

export interface CompetitionSnapshot {
  schema_version: string;
  snapshot_date: string;
  day_n: number;
  competitionInfo: CompetitionInfo;
  participants: Agent[];
  performanceHistory: PerformancePoint[];
  dailyReturns: DailyReturn[];
}
