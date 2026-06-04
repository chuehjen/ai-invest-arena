import React, { createContext, useContext, useState, useCallback } from 'react';
import { participants as baseParticipants, Agent, HoldingItem } from './competitionData';

type PriceMap = Record<string, number>;

interface PriceContextType {
  prices: PriceMap;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

const PriceContext = createContext<PriceContextType | null>(null);

const ALL_SYMBOLS = Array.from(
  new Set(baseParticipants.flatMap(p => p.holdings.map(h => h.symbol)))
);

async function fetchStockPrices(): Promise<PriceMap> {
  const symbols = ALL_SYMBOLS.join(',');
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${symbols}&range=1d&interval=1d`;
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooUrl)}`;

  const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const json = await res.json();
  if (!json.contents) throw new Error('Empty response from proxy');

  const data = JSON.parse(json.contents);
  const prices: PriceMap = {};

  for (const [symbol, info] of Object.entries(data.spark?.result ?? {})) {
    const arr = (info as any)?.response?.[0]?.meta;
    if (arr?.regularMarketPrice) prices[symbol] = arr.regularMarketPrice;
  }

  if (Object.keys(prices).length === 0) {
    // Fallback: try v7 quote endpoint
    const yahooV7 = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols}`;
    const proxyV7 = `https://api.allorigins.win/get?url=${encodeURIComponent(yahooV7)}`;
    const res2 = await fetch(proxyV7, { signal: AbortSignal.timeout(15000) });
    if (res2.ok) {
      const json2 = await res2.json();
      const data2 = JSON.parse(json2.contents);
      for (const q of data2?.quoteResponse?.result ?? []) {
        if (q.symbol && q.regularMarketPrice) prices[q.symbol] = q.regularMarketPrice;
      }
    }
  }

  return prices;
}

export const PriceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<PriceMap>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await fetchStockPrices();
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
    <PriceContext.Provider value={{ prices, loading, error, lastUpdated, refresh }}>
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
