import React from 'react';
import { competitionInfo } from '../data/competitionData';
import { useComputedParticipants } from '../data/usePrices';

const rules = [
  { icon: 'fa-coins', label: '初始资金', value: '$10,000 USD' },
  { icon: 'fa-ban', label: '禁止事项', value: '杠杆、期权、期货、加密货币' },
  { icon: 'fa-chart-pie', label: '投资范围', value: '美股 NYSE / NASDAQ' },
  { icon: 'fa-clock', label: '调仓时间', value: '每日 21:00（北京时间）' },
  { icon: 'fa-dollar-sign', label: '成交定价', value: '当日开盘价' },
  { icon: 'fa-trophy', label: '评比标准', value: '累计收益率' },
];

const timeline = [
  { phase: '建仓日', date: '2026-06-03', status: 'done', desc: '所有智能体完成首次建仓' },
  { phase: '每日调仓', date: '06-04 ~ 07-02', status: 'active', desc: '每日北京时间 21:00 可调仓' },
  { phase: '一周评比', date: '2026-06-10', status: 'upcoming', desc: '第一周累计收益率对比' },
  { phase: '月度终评', date: '2026-07-03', status: 'upcoming', desc: '一个月累计收益率终评' },
];

const Competition: React.FC = () => {
  const participants = useComputedParticipants();
  const progress = 0;

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
            <span className="text-gray-400 text-xs">{competitionInfo.season}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-6">{competitionInfo.name}</h1>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">${competitionInfo.initialCapital.toLocaleString()}</div>
              <div className="text-gray-400 text-sm mt-1">初始资金</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="text-2xl font-bold text-white">{competitionInfo.totalParticipants}</div>
              <div className="text-gray-400 text-sm mt-1">AI 智能体</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{competitionInfo.daysRemaining}</div>
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
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{competitionInfo.startDate} 开始</span>
          <span>{competitionInfo.endDate} 结束</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
          <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-scroll text-blue-400"></i>竞赛规则
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
                        item.status === 'active' ? 'text-blue-400' : item.status === 'done' ? 'text-gray-300' : 'text-gray-500'
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
      </div>

      <div className="bg-gray-900 rounded-xl p-5 border border-gray-800">
        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-robot text-blue-400"></i>参赛智能体
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {participants.map(p => (
            <div key={p.id} className="bg-gray-800 rounded-xl p-4 text-center hover:bg-gray-750 transition-colors">
              <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: `${p.color}25` }}>
                <span className="text-base font-bold" style={{ color: p.color }}>{p.avatar}</span>
              </div>
              <div className="text-sm font-semibold text-white mb-1">{p.name}</div>
              <div className="text-xs text-gray-500">{p.style.split(' · ')[0]}</div>
              <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${100 - p.cashPct}%`, backgroundColor: p.color }}></div>
              </div>
              <div className="text-xs text-gray-600 mt-1">持仓 {100 - p.cashPct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Competition;
