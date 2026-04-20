export type PdfType = 'invoice' | 'report'

export interface Metric {
  label: string
  value: string
  icon: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'purple'
}

export interface ChartDataPoint {
  name: string
  value: number
  fill?: string
}

export interface ChartData {
  bar: ChartDataPoint[]
  pie: ChartDataPoint[]
  line: ChartDataPoint[]
}

export interface AnalysisResult {
  title: string
  subtitle?: string
  metrics: Metric[]
  chartData: ChartData
  summary: string
  highlights: string[]
  anomalies: string[]
  tags: string[]
  downloadId: string
  truncated?: boolean
  usedOcr?: boolean
}

export interface HistoryEntry {
  id: string
  filename: string
  type: PdfType
  title: string
  date: string
  analysis: AnalysisResult
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}
