import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Metric } from '../lib/types'

interface StatsCardProps {
  metric: Metric
  index: number
}

const colorMap = {
  green:  { bg: 'from-emerald-500 to-teal-600',     light: 'bg-emerald-50 dark:bg-emerald-900/20',  text: 'text-emerald-700 dark:text-emerald-300' },
  red:    { bg: 'from-rose-500 to-red-600',          light: 'bg-rose-50 dark:bg-rose-900/20',        text: 'text-rose-700 dark:text-rose-300' },
  blue:   { bg: 'from-blue-500 to-indigo-600',       light: 'bg-blue-50 dark:bg-blue-900/20',        text: 'text-blue-700 dark:text-blue-300' },
  yellow: { bg: 'from-amber-400 to-orange-500',      light: 'bg-amber-50 dark:bg-amber-900/20',      text: 'text-amber-700 dark:text-amber-300' },
  purple: { bg: 'from-violet-500 to-purple-600',     light: 'bg-violet-50 dark:bg-violet-900/20',    text: 'text-violet-700 dark:text-violet-300' }
}

const trendMap = {
  up:      { icon: TrendingUp,   color: 'text-emerald-500', label: 'Up' },
  down:    { icon: TrendingDown, color: 'text-rose-500',    label: 'Down' },
  neutral: { icon: Minus,        color: 'text-slate-400',   label: '' }
}

export function StatsCard({ metric, index }: StatsCardProps) {
  const colors = colorMap[metric.color ?? 'blue']
  const trend = trendMap[metric.trend ?? 'neutral']
  const TrendIcon = trend.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md dark:hover:shadow-slate-900/40 transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Icon badge */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-lg shadow-sm`}>
          <span>{metric.icon}</span>
        </div>
        {/* Trend badge */}
        {metric.trend && metric.trend !== 'neutral' && (
          <span className={`flex items-center gap-0.5 text-xs font-medium ${trend.color}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {trend.label}
          </span>
        )}
      </div>

      <div>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
          {metric.label}
        </p>
        <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight break-words">
          {metric.value}
        </p>
      </div>
    </motion.div>
  )
}
