import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  Agent, HoldingItem, PerformancePoint, DailyReturn, CompetitionInfo, CompetitionSnapshot,
} from './competitionData';

type PriceMap = Record<string, number>;

interface DataContextType {
  // 静态/快照数据（优先 jsdelivr CDN，回落 Supabase / bundled）
  participants: Agent[];
  performanceHistory: PerformancePoint[];
  dailyReturns: DailyReturn[];
  competitionInfo: CompetitionInfo | null;
  snapshotDate: string;
  dataReady: boolean;
  dataError: string | null;
  dataSource: 'jsdelivr' | 'supabase' | 'bundled' | null;
  dataLoading: boolean;
  reloadData: () => Promise<void>;

  // 实时股价
  prices: PriceMap;
  pricesLoading: boolean;
  pricesError: string | null;
  lastPriceUpdate: Date | null;
  priceProgress: string;
  refreshPrices: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

const TWELVE_DATA_KEY = '6bc32203d6de416698c9b17a59459f93';
const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 62_000;

// jsdelivr CDN：拉 GitHub raw 的 latest.json，OneDay 不必重新部署
// 通过 ?v=timestamp 绕 jsdelivr 边缘缓存
const JSDELIVR_URL = 'https://cdn.jsdelivr.net/gh/chuehjen/ai-invest-arena@main/public/data/latest.json';

// 静态快照通过 webpack JSON import 内联进 bundle（jsdelivr 不可达时离线兜底）
import bundledSnapshot from './snapshot.json';
// Supabase 双源：通过 OneDay SDK 走 supabase（`@ali/oneday-frontend-sdk`），失败回落 bundledSnapshot
import { fetchLatestSnapshot } from '../services/snapshotService';

async function fetchBatch(symbols: string[]): Promise<PriceMap> {
  const url = `https://api.twelvedata.com/price?symbol=${symbols.join(',')}&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data?.code && data.status === 'error') throw new Error(data.message || 'API error');

  const prices: PriceMap = {};
  if (symbols.length === 1 && data?.price !== undefined) {
    const price = parseFloat(data.price);
    if (!isNaN(price) && price > 0) prices[symbols[0]] = price;
  } else {
    for (const [sym, info] of Object.entries(data)) {
      const price = parseFloat((info as any)?.price);
      if (!isNaN(price) && price > 0) prices[sym] = price;
    }
  }
  return prices;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [snapshot, setSnapshot] = useState<CompetitionSnapshot | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'jsdelivr' | 'supabase' | 'bundled' | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  const [prices, setPrices] = useState<PriceMap>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [pricesError, setPricesError] = useState<string | null>(null);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<Date | null>(null);
  const [priceProgress, setPriceProgress] = useState('');

  const reloadData = useCallback(async () => {
    setDataError(null);
    setDataLoading(true);
    const bundled = bundledSnapshot as unknown as CompetitionSnapshot;

    // 1) 优先：jsdelivr CDN 拉最新 latest.json（带 ?v=timestamp 绕边缘缓存）
    try {
      const url = `${JSDELIVR_URL}?v=${Date.now()}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
      if (res.ok) {
        const cdn = (await res.json()) as CompetitionSnapshot;
        if (cdn?.snapshot_date && cdn?.participants?.length) {
          setSnapshot(cdn);
          setDataSource('jsdelivr');
          setDataLoading(false);
          return;
        }
      }
      throw new Error(`jsdelivr HTTP ${res.status}`);
    } catch (err) {
      console.warn('jsdelivr 拉取失败，尝试 Supabase / bundled:', err);
    }

    // 2) 次选：Supabase（仅当 date >= bundled 才用，避免 1D 沙箱写入的 Day6 旧数据胜出）
    try {
      const row = await fetchLatestSnapshot();
      if (row && row.payload && row.snapshot_date && row.snapshot_date >= bundled.snapshot_date) {
        setSnapshot(row.payload);
        setDataSource('supabase');
        setDataLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Supabase 拉取失败，回落 bundled snapshot:', err);
    }

    // 3) 兜底：webpack 内联的 snapshot.json（永远存在，最差也是上次 push 时的快照）
    setSnapshot(bundled);
    setDataSource('bundled');
    setDataLoading(false);
  }, []);

  useEffect(() => { reloadData(); }, [reloadData]);

  const refreshPrices = useCallback(async () => {
    if (!snapshot) return;
    const allSymbols = Array.from(
      new Set(snapshot.participants.flatMap(p => p.holdings.map(h => h.symbol))),
    );
    setPricesLoading(true);
    setPricesError(null);
    setPriceProgress('');
    try {
      const total = allSymbols.length;
      const all: PriceMap = {};
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = allSymbols.slice(i, i + BATCH_SIZE);
        const got = await fetchBatch(batch);
        Object.assign(all, got);
        setPriceProgress(`${Math.min(i + BATCH_SIZE, total)}/${total}`);
        if (i + BATCH_SIZE < total) await sleep(BATCH_DELAY_MS);
      }
      if (Object.keys(all).length === 0) throw new Error('未获取到任何股价数据');
      setPrices(all);
      setLastPriceUpdate(new Date());
    } catch (err) {
      setPricesError((err as Error).message || '获取股价失败');
    } finally {
      setPricesLoading(false);
    }
  }, [snapshot]);

  const value: DataContextType = {
    participants: snapshot?.participants ?? [],
    performanceHistory: snapshot?.performanceHistory ?? [],
    dailyReturns: snapshot?.dailyReturns ?? [],
    competitionInfo: snapshot?.competitionInfo ?? null,
    snapshotDate: snapshot?.snapshot_date ?? '',
    dataReady: snapshot !== null,
    dataError,
    dataSource,
    dataLoading,
    reloadData,
    prices,
    pricesLoading,
    pricesError,
    lastPriceUpdate,
    priceProgress,
    refreshPrices,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be inside DataProvider');
  return ctx;
};

// 兼容老 API：保留 usePriceContext 别名
export const usePriceContext = () => {
  const ctx = useDataContext();
  return {
    prices: ctx.prices,
    loading: ctx.pricesLoading,
    error: ctx.pricesError,
    lastUpdated: ctx.lastPriceUpdate,
    progress: ctx.priceProgress,
    refresh: ctx.refreshPrices,
  };
};

/**
 * 用最新价格重算 participants（落后则用 latest.json 自带 currentPrice）。
 * 若 dataReady=false 返回空数组（组件应做 loading 守卫）。
 */
export function useComputedParticipants(): Agent[] {
  const { participants, prices } = useDataContext();
  const hasPrices = Object.keys(prices).length > 0;
  if (participants.length === 0) return [];

  return participants
    .map(p => {
      if (!hasPrices) return p;
      const holdings: HoldingItem[] = p.holdings.map(h => {
        const cur = prices[h.symbol] ?? h.currentPrice;
        const mv = h.shares * cur;
        const pnl = (cur - h.avgCost) * h.shares;
        const pnlPct = h.avgCost > 0 ? ((cur - h.avgCost) / h.avgCost) * 100 : 0;
        return { ...h, currentPrice: cur, marketValue: mv, pnl, pnlPercent: pnlPct, weight: 0 };
      });
      const stockVal = holdings.reduce((s, h) => s + h.marketValue, 0);
      const total = stockVal + p.cash;
      const ret = ((total - 10000) / 10000) * 100;
      const cashPct = Math.round((p.cash / total) * 1000) / 10;
      const holdingsWithWeight = holdings.map(h => ({
        ...h,
        weight: Math.round((h.marketValue / total) * 1000) / 10,
      }));
      return {
        ...p,
        holdings: holdingsWithWeight,
        totalAssets: Math.round(total * 100) / 100,
        returnPct: Math.round(ret * 100) / 100,
        cashPct,
        holdingsCount: holdingsWithWeight.length,
      };
    })
    .sort((a, b) => b.totalAssets - a.totalAssets)
    .map((p, i) => ({
      ...p,
      rank: i + 1,
      badge: i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : null,
    }));
}

// 兼容旧 import 名
export const PriceProvider = DataProvider;
