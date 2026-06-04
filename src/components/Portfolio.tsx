import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { participants } from '../data/competitionData';

const sectorColors: Record<string, string> = {
  '半导体': '#8b5cf6', '软件': '#3b82f6', '互联网': '#06b6d4', '电商/云': '#f59e0b',
  '社交媒体': '#ec4899', '消费电子': '#10b981', '金融': '#6366f1', '科技ETF': '#64748b',
  '宽基ETF': '#78716c', '红利ETF': '#84cc16', '黄金': '#eab308', '能源': '#f97316', '医药': '#14b8a6',
  '光模块': '#2dd4bf', '云计算': '#0ea5e9', '电力': '#f43f5e', '汽车': '#ef4444', '生物科技': '#a855f7',
};

const Portfolio: React.FC = () => {
  const [activeId, setActiveId] = useState(participants[0].id);
  const agent = participants.find(p => p.id === activeId);
  if (!agent) return null;

  const holdings = agent.holdings;
  const stockTotal = holdings.reduce((s, h) => s + h.marketValue, 0);
  const totalAssets = Math.min(stockTotal + agent.cash, 10000);
  const totalPnl = holdings.reduce((s, h) => s + h.pnl, 0);

  const sectorData = Object.entries(
    holdings.reduce<Record<string, number>>((acc, h) => {
      acc[h.sector] = (acc[h.sector] || 0) + h.marketValue;
      return acc;
    }, {})
  ).map(([sector, value]) => ({ sector, value: Math.round(value) })).sort((a, b) => b.value - a.value);

  const fmt = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const pnlColor = (v: number) => v >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总资产', value: fmt(totalAssets), color: 'text-white' },
          { label: '总盈亏', value: `${totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)}`, color: pnlColor(totalPnl) },
          { label: '持仓数', value: `${holdings.length} 只`, color: 'text-blue-400' },
          { label: '现金', value: `${fmt(agent.cash)} (${agent.cashPct}%)`, color: 'text-gray-400' },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-2">{card.label}</div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {participants.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveId(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeId === p.id ? 'text-gray-900 font-bold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
            style={activeId === p.id ? { backgroundColor: p.color } : {}}
          >
            <span className="mr-1.5" style={activeId !== p.id ? { color: p.color } : {}}>{p.avatar}</span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">{agent.name} 持仓明细</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-gray-500 border-b border-gray-800">
                  {['股票', '板块', '持仓', '成本价', '现价', '市值', '盈亏', '仓位'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {holdings.map(h => (
                  <tr key={h.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{h.symbol}</div>
                      <div className="text-gray-400 text-xs">{h.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: `${sectorColors[h.sector] || '#6b7280'}22`, color: sectorColors[h.sector] || '#6b7280' }}>
                        {h.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{h.shares}</td>
                    <td className="px-4 py-3 text-gray-300">{fmt(h.avgCost)}</td>
                    <td className="px-4 py-3 text-white font-medium">{fmt(h.currentPrice)}</td>
                    <td className="px-4 py-3 text-gray-300">{fmt(h.marketValue)}</td>
                    <td className="px-4 py-3">
                      <div className={pnlColor(h.pnl)}>{h.pnl >= 0 ? '+' : ''}{fmt(h.pnl)}</div>
                      <div className={`text-xs ${pnlColor(h.pnlPercent)}`}>{h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%</div>
                    </td>
                    <td className="px-4 py-3 w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500" style={{ width: `${h.weight}%` }} />
                        </div>
                        <span className="text-gray-400 text-xs w-8 text-right">{h.weight}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">行业分布</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={sectorData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="sector" tick={{ fill: '#9ca3af', fontSize: 10 }} width={56} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, '市值']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {sectorData.map(entry => (
                  <Cell key={entry.sector} fill={sectorColors[entry.sector] || '#6b7280'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {sectorData.map(s => (
              <div key={s.sector} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: sectorColors[s.sector] || '#6b7280' }} />
                  <span className="text-gray-400">{s.sector}</span>
                </div>
                <span className="text-gray-300">${s.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
