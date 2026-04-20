import { motion } from 'framer-motion'
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell
} from 'recharts'
import type { ChartData } from '../lib/types'
import { cleanChartData } from '../lib/api'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6']

interface Props {
  chartData: ChartData
  type: 'invoice' | 'report'
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">{title}</h3>
      {children}
    </motion.div>
  )
}

const tooltipStyle = {
  backgroundColor: 'transparent',
  border: 'none',
  boxShadow: 'none'
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string; fill?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      {label && <p className="font-semibold text-slate-600 dark:text-slate-300 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill || COLORS[i % COLORS.length] }} className="font-medium">
          {p.name ? `${p.name}: ` : ''}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-slate-700 dark:text-slate-200">{payload[0].name}</p>
      <p className="text-slate-500 dark:text-slate-400">{payload[0].value.toLocaleString()}</p>
    </div>
  )
}

export function ChartSection({ chartData, type }: Props) {
  const barData = cleanChartData(chartData?.bar ?? [])
  const pieData = cleanChartData(chartData?.pie ?? [])
  const lineData = cleanChartData(chartData?.line ?? [])

  const tickStyle = { fontSize: 11, fill: '#94a3b8' }

  return (
    <div className="space-y-4">
      {/* Bar + Pie side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <ChartCard title={type === 'invoice' ? 'Line Items Breakdown' : 'Key Metrics Comparison'}>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
                <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No bar data available</div>
          )}
        </ChartCard>

        {/* Pie Chart */}
        <ChartCard title={type === 'invoice' ? 'Cost Distribution' : 'Segment Breakdown'}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={v => <span style={{ color: '#94a3b8', fontSize: 11 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">No distribution data</div>
          )}
        </ChartCard>
      </div>

      {/* Line Chart full width */}
      <ChartCard title={type === 'invoice' ? 'Billing Trend' : 'Performance Over Time'}>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.6} />
              <XAxis dataKey="name" tick={tickStyle} axisLine={false} tickLine={false} />
              <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={48} tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: '#6366f1' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-sm text-slate-400">No trend data available</div>
        )}
      </ChartCard>
    </div>
  )
}
