import { oneday } from '../onedaycloud/client';

export interface SnapshotPayload {
  participants: Array<{
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
  }>;
  myHoldings?: Array<{
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
  }>;
  performanceHistory?: Array<{
    date: string;
    value: number;
    benchmark: number;
  }>;
}

export interface Snapshot {
  snapshot_date: string;
  day_n: number;
  payload: SnapshotPayload;
  created_at: string;
}

export async function fetchLatestSnapshot(): Promise<Snapshot | null> {
  const { data, error } = await oneday.supabase
    .from('ai_invest_snapshots')
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('fetchLatestSnapshot error:', error);
    return null;
  }
  return data as Snapshot | null;
}

export async function fetchSnapshotByDate(date: string): Promise<Snapshot | null> {
  const { data, error } = await oneday.supabase
    .from('ai_invest_snapshots')
    .select('*')
    .eq('snapshot_date', date)
    .maybeSingle();

  if (error) {
    console.error('fetchSnapshotByDate error:', error);
    return null;
  }
  return data as Snapshot | null;
}

export async function fetchAllSnapshots(): Promise<Snapshot[]> {
  const { data, error } = await oneday.supabase
    .from('ai_invest_snapshots')
    .select('snapshot_date, day_n, created_at')
    .order('snapshot_date', { ascending: true });

  if (error) {
    console.error('fetchAllSnapshots error:', error);
    return [];
  }
  return (data || []) as Snapshot[];
}
