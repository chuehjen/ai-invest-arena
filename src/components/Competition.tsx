import React from 'react';
import { competitionInfo } from '../data/mockData';

const rules = [
  { icon: 'fa-coins', label: '初始资金', value: '¥1,000,000' },
  { icon: 'fa-ban', label: '杠杆限制', value: '禁止使用杠杆' },
  { icon: 'fa-repeat', label: '每日交易上限', value: '50次' },
  { icon: 'fa-clock', label: '交易时段', value: '09:30 - 15:00' },
  { icon: 'fa-chart-pie', label: '单股仓位上限', value: '30%' },
  { icon: 'fa-shield-halved', label: '止损要求', value: '最大回撤 ≤ 30%' },
];

const prizes = [
  { rank: 1, icon: 'fa-crown', color: 'from-amber-400 to-yellow-500', textColor: 'text-amber-400', amount: '¥200,000', label: '冠军' },
  { rank: 2, icon: 'fa-medal', color: 'from-gray-300 to-gray-400', textColor: 'text-gray-300', amount: '¥100,000', label: '亚军' },
  { rank: 3, icon: 'fa-award', color: 'from-orange-400 to-amber-600', textColor: 'text-orange-400', amount: '¥50,000', label: '季军' },
  { rank: 4, icon: 'fa-star', color: 'from-blue-400 to-blue-600', textColor: 'text-blue-400', amount: '¥30,000', label: '4-5名' },
  { rank: 5, icon: 'fa-thumbs-up', color: 'from-purple-400 to-purple-600', textColor: 'text-purple-400', amount: '¥20,000', label: '6-10名' },
  { rank: 6, icon: 'fa-gift', color: 'from-green-400 to-green-600', textColor: 'text-green-400', amount: '¥10,000', label: '最佳策略奖' },
];

const timeline = [
  { phase: '报名期', date: '2025-11-01 ~ 2025-12-31', status: 'done', desc: '参赛者注册与资格审核' },
  { phase: '热身赛', date: '2026-01-01 ~ 2026-01-31', status: 'done', desc: '模拟交易，熟悉平台规则' },
  { phase: '正式赛', date: '2026-02-01 ~ 2026-11-30', status: 'active', desc: '正式计入成绩的交易阶段' },
  { phase: '决赛', date: '2026-12-01 ~ 2026-12-20', status: 'upcoming', desc: '前10名进入决赛冲刺' },
  { phase: '颁奖典礼', date: '2026-12-31', status: 'upcoming', desc: '年度总结与奖项颁发' },
];

const Competition: React.FC = () => {
  const progress = 45;
  const gapToSecond = 7.2;

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-8 border border-blue-700/30">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-8 w-48 h-48 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute bottom-4 left-8 w-32 h-32 rounded-full bg-purple-400 blur-2xl"></div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blue-500/30 border border-blue-400/40 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
              <i className="fa-solid fa-circle-play mr-1"></i>进行中
            </span>
            <span className="text-gray-400 text-xs">Season 3</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">AI投资精英挑战赛 2026 S3</h1>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">¥500,000</div>
              <div className="text-gray-400 text-sm mt-1">总奖金池</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-2xl font-bold text-white">128</div>
              <div className="text-gray-400 text-sm mt-1">参赛人数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">211</div>
              <div className="text-gray-400 text-sm mt-1">剩余天数</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">赛事进度</span>
          <span className="text-sm text-blue-400 font-semibold">{progress}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>2026-01-01 开始</span>
          <span>2026-12-31 结束</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-blue-400"></i>赛事规则
          </h3>
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <i className={`fa-solid ${rule.icon} w-4 text-center text-blue-400`}></i>
                  <span>{rule.label}</span>
                </div>
                <span className="text-white text-sm font-medium">{rule.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-trophy text-amber-400"></i>奖励设置
          </h3>
          <div className="space-y-2">
            {prizes.map((prize) => (
              <div key={prize.rank} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors">
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${prize.color} flex items-center justify-center flex-shrink-0`}>
                  <i className={`fa-solid ${prize.icon} text-white text-xs`}></i>
                </div>
                <span className="text-gray-400 text-sm flex-1">{prize.label}</span>
                <span className={`font-bold text-sm ${prize.textColor}`}>{prize.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 mb-5 flex items-center gap-2">
          <i className="fa-solid fa-timeline text-purple-400"></i>赛程时间线
        </h3>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-700"></div>
          <div className="space-y-5">
            {timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4 pl-10 relative">
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  item.status === 'done' ? 'bg-green-500/20 border-green-500' :
                  item.status === 'active' ? 'bg-blue-500/20 border-blue-500' :
                  'bg-gray-800 border-gray-600'
                }`}>
                  <i className={`fa-solid text-xs ${
                    item.status === 'done' ? 'fa-check text-green-400' :
                    item.status === 'active' ? 'fa-circle-dot text-blue-400' :
                    'fa-clock text-gray-500'
                  }`}></i>
                </div>
                <div className="flex-1 pb-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-semibold text-sm ${
                      item.status === 'active' ? 'text-blue-400' :
                      item.status === 'done' ? 'text-gray-300' : 'text-gray-500'
                    }`}>{item.phase}</span>
                    {item.status === 'active' && (
                      <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">当前阶段</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mb-1">{item.date}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-5 border border-blue-700/30">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-user-check text-blue-400"></i>我的参赛状态
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center bg-gray-900/60 rounded-xl p-4">
            <div className="text-3xl font-bold text-amber-400 mb-1">#1</div>
            <div className="text-xs text-gray-400">当前排名</div>
            <div className="mt-2 flex items-center justify-center gap-1 text-amber-400 text-xs">
              <i className="fa-solid fa-crown"></i>
              <span>领先</span>
            </div>
          </div>
          <div className="text-center bg-gray-900/60 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-400 mb-1">+38.6%</div>
            <div className="text-xs text-gray-400">总收益率</div>
            <div className="mt-2 text-xs text-gray-500">初始 ¥1,000,000</div>
          </div>
          <div className="text-center bg-gray-900/60 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-400 mb-1">+{gapToSecond}%</div>
            <div className="text-xs text-gray-400">领先第2名</div>
            <div className="mt-2 text-xs text-gray-500">优势稳固</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Competition;
