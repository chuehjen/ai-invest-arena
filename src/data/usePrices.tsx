import React, { createContext, useContext, useState, useCallback } from 'react';
import { participants as baseParticipants, Agent, HoldingItem } from './competitionData';

type PriceMap = Record<string, number>;

interface PriceContextType {
  prices: PriceMap;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  progress: string;          // e.g. "12/26"
  refresh: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | null>(null);

const TWELVE_DATA_KEY = '6bc32203d6de416698c9b17a59459f93';
const BATCH_SIZE = 8;        // free tier: 8 credits / min
const BATCH_DELAY_MS = 62_000; // 62s between batches

const ALL_SYMBOLS = Array.from(
  new Set(baseParticipants.flatMap(p => p.holdings.map(h => h.symbol)))
);

/** Twelve Data /price batch — returns { "NVDA": { price: "215.86" }, ... } */
async function fetchBatch(symbols: string[]): Promise<PriceMap> {
  const url = `https://api.twelvedata.com/price?symbol=${symbols.join(',')}&apikey=${TWELVE_DATA_KEY}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data?.code && data.status === 'error') throw new Error(data.message || 'API error');

  const prices: PriceMap = {};
  for (const [sym, info] of Object.entries(data)) {
    const price = parseFloat((info as any)?.price);
    if (!isNaN(price) && price > 0) prices[sym] = price;
  }
  return prices;
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Fetch all stock prices via Twelve Data, batched to respect the 8 credits/min free-tier limit.
 * 26 symbols → 4 batches (8+8+8+2), ~3 minutes total.
 */
async function fetchStockPrices(
  onProgress?: (fetched: number, total: number) => void,
): Promise<PriceMap> {
  const total = ALL_SYMBOLS.length;
  const allPrices: PriceMap = {};

  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = ALL_SYMBOLS.slice(i, i + BATCH_SIZE);
    const prices = await fetchBatch(batch);
    Object.assign(allPrices, prices);
    onProgress?.(Math.min(i + BATCH_SIZE, total), total);

    // Wait before next batch (skip after last batch)
    if (i + BATCH_SIZE < total) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  return allPrices;
}

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [progress, setProgress] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProgress('');
    try {
      const p = await fetchStockPrices((fetched, total) => {
        setProgress(`${fetched}/${total}`);
      });
      if (Object.keys(p).length === 0) throw new Error('未获取到任何股价数据');
      setPrices(p);
      setLastUpdated(new Date());
    } catch (err) {
      setError((err as Error).message || '获取股价失败');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <PriceContext.Provider value={{ prices, loading, error, lastUpdated, progress, refresh }}>
      {children}
    </PriceContext.Provider>
  );
};

export const usePriceContext = () => {
  const ctx = useContext(PriceContext);
  if (!ctx) throw new Error('usePriceContext must be inside PriceProvider');
  return ctx;
};

/**
 * 基于最新价格重新计算所有智能体的持仓指标和排名。
 * 如果尚未刷新价格，则返回 competitionData.ts 中的静态数据。
 */
export function useComputedParticipants(): Agent[] {
  const { prices } = usePriceContext();
  const hasPrices = Object.keys(prices).length > 0;

  return baseParticipants
    .map(p => {
      if (!hasPrices) return p;

      const holdings: HoldingItem[] = p.holdings.map(h => {
        const curPrice = prices[h.symbol] ?? h.currentPrice;
        const mv = h.shares * curPrice;
        const pnl = (curPrice - h.avgCost) * h.shares;
        const pnlPct = h.avgCost > 0 ? ((curPrice - h.avgCost) / h.avgCost) * 100 : 0;
        return { ...h, currentPrice: curPrice, marketValue: mv, pnl, pnlPercent: pnlPct, weight: 0 };
      });

      const stockVal = holdings.reduce((s, h) => s + h.marketValue, 0);
      const total = stockVal + p.cash;
      const ret = ((total - 10000) / 10000) * 100;
      const cashPct = Math.round((p.cash / total) * 1000) / 10;

      // Compute weights after knowing total
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
