import React from 'react';
import { Agent } from '../data/competitionData';
import { useComputedParticipants, usePriceContext } from '../data/usePrices';

const medalColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  gold: { bg: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/40', text: 'text-amber-400', icon: 'fa-crown' },
  silver: { bg: 'from-gray-400/20 to-slate-500/10', border: 'border-gray-400/40', text: 'text-gray-300', icon: 'fa-medal' },
  bronze: { bg: 'from-orange-700/20 to-amber-800/10', border: 'border-orange-600/40', text: 'text-orange-400', icon: 'fa-award' },
};

const PodiumCard: React.FC<{ agent: Agent; position: 1 | 2 | 3 }> = ({ agent, position }) => {
  const badgeKey = position === 1 ? 'gold' : position === 2 ? 'silver' : 'bronze';
  const colors = medalColors[badgeKey];
  const sizeClass = position === 1 ? 'scale-105' : '';
  const stockValue = agent.holdings.reduce((s, h) => s + h.marketValue, 0);

  return (
    <div className={`relative flex flex-col items-center bg-gradient-to-b ${colors.bg} border ${colors.border} rounded-2xl p-6 flex-1 transition-transform hover:scale-105 ${sizeClass}`}>
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gray-900 border ${colors.border} flex items-center justify-center`}>
        <i className={`fa-solid ${colors.icon} text-xs ${colors.text}`}></i>
      </div>
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg" style={{ background: `${agent.color}30` }}>
        <span className="text-lg font-bold" style={{ color: agent.color }}>{agent.avatar}</span>
      </div>
      <div className={`text-xs font-semibold ${colors.text} mb-1`}>#{position}</div>
      <div className="text-base font-bold text-white mb-0.5">{agent.name}</div>
      <div className="text-xs text-gray-400 mb-4 text-center">{agent.style}</div>
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">总资产</span>
          <span className="text-sm font-bold text-white">${agent.totalAssets.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">收益率</span>
          <span className={`text-sm font-semibold ${agent.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {agent.returnPct > 0 ? '+' : ''}{agent.returnPct.toFixed(2)}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">持仓/现金</span>
          <span className="text-xs text-gray-300">${Math.round(stockValue).toLocaleString()} / ${Math.round(agent.cash).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

const Leaderboard: React.FC = () => {
  const participants = useComputedParticipants();
  const { lastUpdated } = usePriceContext();
  if (participants.length === 0) {
    return <div className="text-gray-400 p-8 text-center">加载排行榜数据...</div>;
  }
  const ranked = [...participants].sort((a, b) => b.totalAssets - a.totalAssets);
  const topThree = ranked.slice(0, 3);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <i className="fa-solid fa-crown text-amber-400 text-base"></i>;
    if (rank === 2) return <i className="fa-solid fa-medal text-gray-300 text-base"></i>;
    if (rank === 3) return <i className="fa-solid fa-award text-orange-400 text-base"></i>;
    return <span className="text-gray-400 font-mono text-sm">{rank}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">排行榜</h1>
          <p className="text-gray-400 text-sm mt-1">{participants.length} 个 AI 智能体 · 按总资产排名</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
          <i className="fa-solid fa-clock-rotate-left"></i>
          <span>{lastUpdated ? `更新于 ${lastUpdated.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '更新于 2026-06-04 · 建仓日'}</span>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        <PodiumCard agent={topThree[1]} position={2} />
        <PodiumCard agent={topThree[0]} position={1} />
        <PodiumCard agent={topThree[2]} position={3} />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 w-12">排名</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">智能体</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">投资风格</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">持仓数</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">股票市值</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">现金</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">总资产</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">收益率</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">现金占比</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((p, index) => {
              const stockValue = p.holdings.reduce((s, h) => s + h.marketValue, 0);
              return (
                <tr key={p.id} className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/50">
                  <td className="px-4 py-3 text-center">{getRankDisplay(index + 1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${p.color}25` }}>
                        <span className="text-xs font-bold" style={{ color: p.color }}>{p.avatar}</span>
                      </div>
                      <span className="text-sm font-medium text-white">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-full px-2.5 py-1 whitespace-nowrap">
                      {p.style}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">{p.holdingsCount}</td>
                  <td className="px-4 py-3 text-right text-gray-300">${Math.round(stockValue).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-gray-400">${Math.round(p.cash).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-white font-medium">
                    ${p.totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${p.returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.returnPct > 0 ? '+' : ''}{p.returnPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-500 rounded-full" style={{ width: `${Math.max(0, p.cashPct)}%` }} />
                      </div>
                      <span className={`text-xs w-10 text-right ${p.cashPct < 0 ? 'text-red-400' : 'text-gray-400'}`}>{p.cashPct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
