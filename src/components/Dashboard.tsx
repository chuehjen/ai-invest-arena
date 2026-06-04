import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { performanceHistory, competitionInfo } from '../data/competitionData';
import { useComputedParticipants } from '../data/usePrices';

const Dashboard: React.FC = () => {
  const participants = useComputedParticipants();
  const sorted = [...participants].sort((a, b) => b.totalAssets - a.totalAssets);
  const leader = sorted[0];
  const avgReturn = participants.reduce((s, p) => s + p.returnPct, 0) / participants.length;
  const totalPool = participants.reduce((s, p) => s + p.totalAssets, 0);
  const minCash = participants.reduce((m, p) => p.cashPct < m.cashPct ? p : m, participants[0]);

  const STAT_CARDS = [
    { label: '参赛智能体', value: `${participants.length}`, sub: `初始 $${competitionInfo.initialCapital.toLocaleString()}`, icon: 'fa-robot', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: '当前领先', value: leader.name, sub: leader.style.split(' · ')[0], icon: 'fa-crown', color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: '平均收益', value: `${avgReturn.toFixed(2)}%`, sub: '建仓日', icon: 'fa-chart-line', color: 'text-green-400', bg: 'bg-green-500/10' },
    { label: '最激进', value: minCash.name, sub: `现金 ${minCash.cashPct}%`, icon: 'fa-fire', color: 'text-red-400', bg: 'bg-red-500/10' },
  ];

  const positionData = participants.map(p => ({
    name: p.name,
    stocks: Math.round(p.holdings.reduce((s, h) => s + h.marketValue, 0)),
    cash: Math.round(p.cash),
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4 hover:border-gray-700 transition-colors">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`fa-solid ${card.icon} ${card.color} text-sm`}></i>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-400 mb-1">{card.label}</div>
              <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">累计收益率走势</div>
              <div className="text-xs text-gray-400 mt-0.5">{participants.length} 个智能体对比</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={performanceHistory} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number) => [`${value.toFixed(2)}%`]}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {participants.map(p => (
                <Line key={p.id} type="monotone" dataKey={p.id} name={p.name} stroke={p.color} strokeWidth={2} dot={{ fill: p.color, r: 3 }} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-1">仓位对比</div>
          <div className="text-xs text-gray-400 mb-3">股票市值 vs 现金</div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={positionData} layout="vertical" margin={{ left: 0, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} width={72} />
              <Tooltip
                contentStyle={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(v: number, n: string) => [`$${v.toLocaleString()}`, n === 'stocks' ? '股票' : '现金']}
              />
              <Bar dataKey="stocks" stackId="a" fill="#3b82f6" />
              <Bar dataKey="cash" stackId="a" fill="#374151" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="text-sm font-semibold text-white mb-4">策略速览</div>
        <div className="grid grid-cols-5 gap-3">
          {participants.map(p => (
            <div key={p.id} className="bg-gray-800 rounded-xl p-3 text-center hover:bg-gray-750 transition-colors">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${p.color}25` }}>
                <span className="text-sm font-bold" style={{ color: p.color }}>{p.avatar}</span>
              </div>
              <div className="text-xs font-semibold text-white mb-1">{p.name}</div>
              <div className="text-xs text-gray-500 mb-2">{p.style.split(' · ')[0]}</div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>{p.holdingsCount}只</span>
                <span>现金{p.cashPct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
