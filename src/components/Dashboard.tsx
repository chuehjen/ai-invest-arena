import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { performanceHistory, competitionInfo } from '../data/competitionData';
import { useComputedParticipants, usePriceContext } from '../data/usePrices';
import { fetchLatestSnapshot, Snapshot } from '../services/snapshotService';

const AGENT_COLORS: Record<string, string> = {
  claude: '#a78bfa',
  doubao: '#f472b6',
  'cathie-wood': '#818cf8',
  'gemini-ext': '#60a5fa',
  grok: '#fb923c',
  'gemini-std': '#38bdf8',
  chatgpt: '#4ade80',
  'beth-kindig': '#fb7185',
  serenity: '#2dd4bf',
  qwen: '#fbbf24',
};

const PIE_COLORS = ['#a78bfa', '#f472b6', '#818cf8', '#60a5fa', '#fb923c', '#38bdf8', '#4ade80', '#fb7185', '#2dd4bf', '#fbbf24'];

const Dashboard: React.FC = () => {
  const participants = useComputedParticipants();
  const { refresh, loading, lastUpdated, progress } = usePriceContext();
  const [latestSnapshot, setLatestSnapshot] = useState<Snapshot | null>(null);
  const [snapshotLoading, setSnapshotLoading] = useState(true);

  useEffect(() => {
    fetchLatestSnapshot().then(data => {
      setLatestSnapshot(data);
      setSnapshotLoading(false);
    });
  }, []);

  const leader = participants[0];
  const totalParticipants = participants.length;
  const avgReturn = participants.reduce((s, p) => s + p.returnPct, 0) / totalParticipants;
  const bestReturn = participants[0]?.returnPct ?? 0;
  const worstReturn = participants[participants.length - 1]?.returnPct ?? 0;

  const statCards = [
    {
      label: '领先者',
      value: leader?.name ?? '-',
      sub: `收益率 ${leader?.returnPct >= 0 ? '+' : ''}${leader?.returnPct?.toFixed(2)}%`,
      icon: 'fa-crown',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      label: '参赛智能体',
      value: `${totalParticipants} 个`,
      sub: `初始资金 $${competitionInfo.initialCapital.toLocaleString()}`,
      icon: 'fa-robot',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },
    {
      label: '平均收益率',
      value: `${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(2)}%`,
      sub: '全体均值',
      icon: 'fa-chart-line',
      color: avgReturn >= 0 ? 'text-green-400' : 'text-red-400',
      bg: avgReturn >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
    },
    {
      label: '最大差距',
      value: `${(bestReturn - worstReturn).toFixed(2)}%`,
      sub: `最高 vs 最低`,
      icon: 'fa-arrows-up-down',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },
  ];

  const agentIds = participants.map(p => p.id);
  const chartLines = agentIds.slice(0, 5);

  const pieData = participants.map(p => ({
    name: p.name,
    value: Math.abs(p.totalAssets),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{competitionInfo.name}</h1>
          <p className="text-gray-400 text-sm mt-1">
            {competitionInfo.startDate} ~ {competitionInfo.endDate} · Season {competitionInfo.season}
          </p>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          <i className={`fa-solid fa-rotate-right text-xs ${loading ? 'animate-spin' : ''}`}></i>
          {loading ? (progress ? `${progress} 获取中...` : '获取中...') : '刷新股价'}
        </button>
      </div>

      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2 w-fit">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
          <span>股价已更新 · {lastUpdated.toLocaleTimeString('zh-CN')}</span>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-4 hover:border-gray-700 transition-colors">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center flex-shrink-0`}>
              <i className={`fa-solid ${card.icon} ${card.color} text-sm`}></i>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-400 mb-1">{card.label}</div>
              <div className={`text-lg font-bold ${card.color} truncate`}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-3 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-semibold text-white">累计收益率走势</div>
              <div className="text-xs text-gray-400 mt-0.5">各智能体对比（前5名）</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {chartLines.map(id => {
                const agent = participants.find(p => p.id === id);
                return (
                  <span key={id} className="flex items-center gap-1 text-xs text-gray-400">
                    <span className="w-2.5 h-0.5 rounded inline-block" style={{ background: AGENT_COLORS[id] || '#6b7280' }}></span>
                    {agent?.name}
                  </span>
                );
              })}
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
                formatter={(value: number, name: string) => {
                  const agent = participants.find(p => p.id === name);
                  return [`${value >= 0 ? '+' : ''}${value}%`, agent?.name || name];
                }}
              />
              {chartLines.map(id => (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={AGENT_COLORS[id] || '#6b7280'}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-1">资产分布</div>
          <div className="text-xs text-gray-400 mb-3">各智能体当前总资产</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => [`$${value.toFixed(2)}`]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-1 mt-2">
            {participants.slice(0, 6).map((p, index) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                <span className="text-xs text-gray-400 truncate">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-white">实时排名</div>
          {!snapshotLoading && latestSnapshot && (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
              <span>快照 Day {latestSnapshot.day_n} · {latestSnapshot.snapshot_date}</span>
            </div>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 border-b border-gray-800">
              <th className="text-left pb-3 font-medium w-10">排名</th>
              <th className="text-left pb-3 font-medium">智能体</th>
              <th className="text-left pb-3 font-medium">策略风格</th>
              <th className="text-right pb-3 font-medium">总资产</th>
              <th className="text-right pb-3 font-medium">收益率</th>
              <th className="text-right pb-3 font-medium">持仓数</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(p => (
              <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="py-3">
                  {p.rank === 1 ? <i className="fa-solid fa-crown text-amber-400"></i>
                    : p.rank === 2 ? <i className="fa-solid fa-medal text-gray-300"></i>
                    : p.rank === 3 ? <i className="fa-solid fa-award text-orange-400"></i>
                    : <span className="text-gray-500 text-xs">#{p.rank}</span>}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: `${p.color}25`, color: p.color }}>
                      {p.avatar}
                    </div>
                    <span className="font-medium text-white">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-400 text-xs max-w-xs truncate">{p.style}</td>
                <td className="py-3 text-right text-gray-300 font-mono">${p.totalAssets.toFixed(2)}</td>
                <td className="py-3 text-right">
                  <span className={`font-bold ${p.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {p.returnPct >= 0 ? '+' : ''}{p.returnPct.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3 text-right text-gray-400">{p.holdingsCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
