import React, { useState } from 'react';
import { participants, Participant } from '../data/mockData';

const medalColors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  gold: { bg: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/40', text: 'text-amber-400', icon: 'fa-crown' },
  silver: { bg: 'from-gray-400/20 to-slate-500/10', border: 'border-gray-400/40', text: 'text-gray-300', icon: 'fa-medal' },
  bronze: { bg: 'from-orange-700/20 to-amber-800/10', border: 'border-orange-600/40', text: 'text-orange-400', icon: 'fa-award' },
};

const avatarColors = [
  'from-blue-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-green-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-red-500 to-pink-600',
  'from-teal-500 to-green-600',
];

const strategies = ['全部策略', '动量因子', '价值投资', '高频交易', 'LSTM神经网络', '趋势跟踪', '事件驱动', '多因子模型', '波动率套利'];

const PodiumCard: React.FC<{ participant: Participant; position: 1 | 2 | 3 }> = ({ participant, position }) => {
  const badgeKey = position === 1 ? 'gold' : position === 2 ? 'silver' : 'bronze';
  const colors = medalColors[badgeKey];
  const avatarColor = avatarColors[(participant.id.charCodeAt(0)) % avatarColors.length];
  const sizeClass = position === 1 ? 'scale-105' : '';

  return (
    <div className={`relative flex flex-col items-center bg-gradient-to-b ${colors.bg} border ${colors.border} rounded-2xl p-6 flex-1 transition-transform hover:scale-105 ${sizeClass}`}>
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-gray-900 border ${colors.border} flex items-center justify-center`}>
        <i className={`fa-solid ${colors.icon} text-xs ${colors.text}`}></i>
      </div>
      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center mb-3 shadow-lg`}>
        <span className="text-lg font-bold text-white">{participant.avatar}</span>
      </div>
      <div className={`text-xs font-semibold ${colors.text} mb-1`}>#{participant.rank}</div>
      <div className="text-base font-bold text-white mb-0.5">{participant.name}</div>
      <div className="text-xs text-gray-400 mb-4 text-center">{participant.team}</div>
      <div className="w-full space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">总收益率</span>
          <span className="text-sm font-bold text-green-400">+{participant.totalReturn}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">夏普比率</span>
          <span className="text-sm font-semibold text-white">{participant.sharpeRatio}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">胜率</span>
          <span className="text-sm font-semibold text-blue-400">{participant.winRate}%</span>
        </div>
      </div>
    </div>
  );
};

const Leaderboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState('全部策略');

  const topThree = participants.slice(0, 3);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch =
      p.name.includes(searchQuery) ||
      p.team.includes(searchQuery) ||
      p.strategy.includes(searchQuery);
    const matchesStrategy =
      selectedStrategy === '全部策略' || p.strategy.includes(selectedStrategy.replace('全部策略', ''));
    return matchesSearch && matchesStrategy;
  });

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
          <p className="text-gray-400 text-sm mt-1">共 {participants.length} 位参赛者 · 实时更新</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-800 rounded-lg px-3 py-2">
          <i className="fa-solid fa-clock-rotate-left"></i>
          <span>更新于 2026-06-03 14:32</span>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        <PodiumCard participant={topThree[1]} position={2} />
        <PodiumCard participant={topThree[0]} position={1} />
        <PodiumCard participant={topThree[2]} position={3} />
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
          <input
            type="text"
            placeholder="搜索参赛者、团队或策略..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <select
          value={selectedStrategy}
          onChange={e => setSelectedStrategy(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
        >
          {strategies.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3 w-12">排名</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">参赛者</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">总收益率</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">周收益</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">交易次数</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">胜率</th>
              <th className="text-right text-xs text-gray-400 font-medium px-4 py-3">最大回撤</th>
              <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">策略</th>
            </tr>
          </thead>
          <tbody>
            {filteredParticipants.map((p, index) => {
              const isMe = p.id === '1';
              const avatarColor = avatarColors[index % avatarColors.length];
              const maxReturn = Math.max(...participants.map(x => x.totalReturn));
              const barWidth = (p.totalReturn / maxReturn) * 100;

              return (
                <tr
                  key={p.id}
                  className={`border-b border-gray-800/50 transition-colors hover:bg-gray-800/50 ${
                    isMe ? 'ring-1 ring-inset ring-blue-500/40 bg-blue-500/5' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    {getRankDisplay(p.rank)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xs font-bold text-white">{p.avatar}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{p.name}</span>
                          {isMe && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded px-1.5 py-0.5">我</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{p.team}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-green-400 w-14 text-right">+{p.totalReturn}%</span>
                      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden min-w-16">
                        <div
                          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full"
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-medium ${p.weeklyReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {p.weeklyReturn >= 0 ? '+' : ''}{p.weeklyReturn}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-300">{p.trades}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-blue-400">{p.winRate}%</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-red-400">{p.maxDrawdown}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-full px-2.5 py-1 whitespace-nowrap">
                      {p.strategy.split(' + ')[0]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredParticipants.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <i className="fa-solid fa-search text-2xl mb-2 block"></i>
            <p className="text-sm">未找到匹配的参赛者</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
