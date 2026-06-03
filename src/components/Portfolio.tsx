import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { myHoldings, recentTrades } from '../data/mockData';

const sectorColors: Record<string, string> = {
  科技: '#3b82f6',
  半导体: '#8b5cf6',
  新能源: '#10b981',
  电商: '#f59e0b',
  其他: '#6b7280',
};

const Portfolio: React.FC = () => {
  const totalValue = myHoldings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalPnl = myHoldings.reduce((sum, h) => sum + h.pnl, 0);
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100;
  const todayPnl = 12480;

  const sectorData = Object.entries(
    myHoldings.reduce<Record<string, number>>((acc, h) => {
      acc[h.sector] = (acc[h.sector] || 0) + h.marketValue;
      return acc;
    }, {})
  ).map(([sector, value]) => ({ sector, value: Math.round(value / 1000) }));

  const fmt = (n: number) =>
    n >= 0 ? `+¥${n.toLocaleString()}` : `-¥${Math.abs(n).toLocaleString()}`;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '总市值', value: `¥${totalValue.toLocaleString()}`, sub: null, color: 'text-white' },
          { label: '总盈亏', value: fmt(totalPnl), sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`, color: totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: '今日盈亏', value: fmt(todayPnl), sub: '+0.91%', color: 'text-green-400' },
          { label: '持仓数量', value: `${myHoldings.length} 只`, sub: '6个行业', color: 'text-blue-400' },
        ].map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-xs text-gray-400 mb-2">{card.label}</div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
            {card.sub && <div className={`text-xs mt-1 ${card.color} opacity-70`}>{card.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">持仓明细</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors">
                <i className="fa-solid fa-plus mr-1"></i>买入
              </button>
              <button className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-medium rounded-lg transition-colors">
                <i className="fa-solid fa-minus mr-1"></i>卖出
              </button>
            </div>
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
                {myHoldings.map(h => (
                  <tr key={h.symbol} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-white">{h.symbol}</div>
                      <div className="text-gray-400 text-xs">{h.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ background: `${sectorColors[h.sector] || sectorColors['其他']}22`, color: sectorColors[h.sector] || sectorColors['其他'] }}
                      >
                        {h.sector}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{h.shares}</td>
                    <td className="px-4 py-3 text-gray-300">${h.avgCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white font-medium">${h.currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-300">¥{h.marketValue.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className={h.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        {h.pnl >= 0 ? '+' : ''}¥{h.pnl.toLocaleString()}
                      </div>
                      <div className={`text-xs ${h.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {h.pnlPercent >= 0 ? '+' : ''}{h.pnlPercent.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 w-28">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${h.weight}%` }}
                          />
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
              <YAxis type="category" dataKey="sector" tick={{ fill: '#9ca3af', fontSize: 11 }} width={48} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number) => [`¥${v}K`, '市值']}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {sectorData.map(entry => (
                  <Cell key={entry.sector} fill={sectorColors[entry.sector] || sectorColors['其他']} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {sectorData.map(s => (
              <div key={s.sector} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: sectorColors[s.sector] || sectorColors['其他'] }} />
                  <span className="text-gray-400">{s.sector}</span>
                </div>
                <span className="text-gray-300">¥{s.value}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">最近交易</h2>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              {['日期', '操作', '股票', '数量', '价格', '金额', '盈亏'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recentTrades.map(t => (
              <tr key={t.id} className="border-b border-gray-800/50 hover:bg-gray-800/40 transition-colors">
                <td className="px-5 py-3 text-gray-400">{t.date}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${t.action === 'buy' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'}`}>
                    {t.action === 'buy' ? '买入' : '卖出'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="font-bold text-white">{t.symbol}</span>
                  <span className="text-gray-400 ml-1">{t.name}</span>
                </td>
                <td className="px-5 py-3 text-gray-300">{t.shares} 股</td>
                <td className="px-5 py-3 text-gray-300">${t.price.toFixed(2)}</td>
                <td className="px-5 py-3 text-gray-300">¥{t.amount.toLocaleString()}</td>
                <td className="px-5 py-3">
                  {t.pnl !== null ? (
                    <span className={t.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {t.pnl >= 0 ? '+' : ''}¥{t.pnl.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Portfolio;
