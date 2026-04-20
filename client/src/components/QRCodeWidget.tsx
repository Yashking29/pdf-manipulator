import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Download } from 'lucide-react'

interface QRCodeWidgetProps {
  downloadUrl: string
}

export function QRCodeWidget({ downloadUrl }: QRCodeWidgetProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-full right-0 mb-3 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 dark:border-slate-700 p-4 w-44"
          >
            <div className="bg-white rounded-xl p-2 mb-2">
              <QRCodeSVG
                value={downloadUrl}
                size={128}
                bgColor="#ffffff"
                fgColor="#1e293b"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex items-center gap-1.5 text-center justify-center">
              <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scan to download</p>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 right-3 w-3 h-3 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invisible trigger dot — only visible on hover as a tiny pulsing indicator */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="cursor-pointer"
        aria-label="Scan QR code to download PDF"
      >
        <div
          className={`w-2 h-2 rounded-full transition-all duration-300 ${
            hovered
              ? 'w-5 h-5 bg-indigo-500 shadow-lg shadow-indigo-500/50'
              : 'bg-indigo-400 qr-pulse opacity-60'
          }`}
        />
      </div>
    </div>
  )
}
