import { oneday } from '../onedaycloud/client';
import type { CompetitionSnapshot } from '../data/competitionData';

export interface SnapshotRow {
  snapshot_date: string;
  day_n: number;
  payload: CompetitionSnapshot;
  created_at?: string;
}

const TABLE = 'ai_invest_snapshots';

export async function fetchLatestSnapshot(): Promise<SnapshotRow | null> {
  const { data, error } = await oneday.supabase
    .from(TABLE)
    .select('*')
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('fetchLatestSnapshot error:', error);
    return null;
  }
  return (data as SnapshotRow) || null;
}

export async function fetchSnapshotByDate(date: string): Promise<SnapshotRow | null> {
  const { data, error } = await oneday.supabase
    .from(TABLE)
    .select('*')
    .eq('snapshot_date', date)
    .maybeSingle();

  if (error) {
    console.error('fetchSnapshotByDate error:', error);
    return null;
  }
  return (data as SnapshotRow) || null;
}

export async function fetchAllSnapshots(): Promise<Array<{ snapshot_date: string; day_n: number; created_at?: string }>> {
  const { data, error } = await oneday.supabase
    .from(TABLE)
    .select('snapshot_date, day_n, created_at')
    .order('snapshot_date', { ascending: true });

  if (error) {
    console.error('fetchAllSnapshots error:', error);
    return [];
  }
  return (data as Array<{ snapshot_date: string; day_n: number; created_at?: string }>) || [];
}
