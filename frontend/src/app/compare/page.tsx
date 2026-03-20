'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap, ArrowRight, Clock, DollarSign, Eye, AlertTriangle, Globe, MessageSquare } from 'lucide-react';

const ROWS = [
  { icon: Clock, label: 'Settlement Time', bank: '3-5 Business Days', autoupi: '8 Seconds ⚡', bankBad: true },
  { icon: DollarSign, label: 'Transaction Fee', bank: '₹500 – ₹1,500 (3-5%)', autoupi: '₹50 (0.5%)', bankBad: true },
  { icon: Eye, label: 'Tracking & Transparency', bank: 'Minimal ❌', autoupi: '100% Real-Time ✅', bankBad: true },
  { icon: AlertTriangle, label: 'Hidden Charges', bank: 'Yes (Correspondent Bank)', autoupi: 'None ✅', bankBad: true },
  { icon: Globe, label: 'Availability', bank: 'Business Hours Only 🕐', autoupi: '24/7/365 🌍', bankBad: true },
  { icon: MessageSquare, label: 'Support Response', bank: '24-48 Hours', autoupi: 'Instant Chat', bankBad: true },
];

const SAVINGS = [
  { icon: '⏱️', value: '119 Hours', label: 'Time Saved', sub: 'Per transaction', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { icon: '💰', value: '₹1,500', label: 'Money Saved', sub: 'Per transaction', color: 'bg-green-50 border-green-200 text-green-700' },
  { icon: '📊', value: '₹18,000', label: 'Annual Savings', sub: '12 transactions/year', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
];

export default function ComparePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Nav */}
      <nav className="bg-white border-b border-surface-4/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/send')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">AutoUPI</span>
          </button>
          <button onClick={() => router.push('/send')} className="btn-primary text-sm py-2.5">
            Send Money Now <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-4 border border-primary-100">
            <Zap className="w-3 h-3" /> Why AutoUPI Wins
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-4 text-balance">
            Traditional Banks vs{' '}
            <span className="gradient-text">AutoUPI</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            See exactly why 50,000+ customers switched to faster, cheaper, transparent international payments.
          </p>
        </motion.div>

        {/* Comparison cards */}
        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          {/* Traditional Bank */}
          <motion.div
            className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden opacity-80"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 0.85, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-slate-100 border-b border-slate-200 p-5">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🏦</div>
                <div>
                  <div className="font-bold text-slate-700">Traditional Bank Transfer</div>
                  <div className="text-xs text-slate-500">SWIFT / Wire Transfer</div>
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {ROWS.map(row => (
                <div key={row.label} className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <row.icon className="w-4 h-4" />
                    {row.label}
                  </div>
                  <span className="text-sm font-medium text-danger-500">{row.bank}</span>
                </div>
              ))}
            </div>
            <div className="bg-danger-50 border-t border-danger-100 p-4 text-center">
              <span className="text-sm font-bold text-danger-600">Total Cost: ₹1,550+ | Wait: 72-120 Hours</span>
            </div>
          </motion.div>

          {/* AutoUPI */}
          <motion.div
            className="bg-white rounded-2xl border-2 border-primary-400 overflow-hidden shadow-glow"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            style={{ transform: 'scale(1.02)' }}
          >
            {/* Winner badge */}
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-gradient-to-r from-success-500 to-success-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                🏆 99% Better
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-5 relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-3">
                <div className="text-3xl">🚀</div>
                <div>
                  <div className="font-bold text-white">AutoUPI Settlement Layer</div>
                  <div className="text-xs text-white/70">Powered by UPI + Blockchain</div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {ROWS.map((row, i) => (
                <motion.div
                  key={row.label}
                  className="flex items-center justify-between px-5 py-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                >
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <row.icon className="w-4 h-4" />
                    {row.label}
                  </div>
                  <span className="text-sm font-semibold text-success-600 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {row.autoupi}
                  </span>
                </motion.div>
              ))}
            </div>
            <div className="bg-success-50 border-t border-success-100 p-4 text-center">
              <span className="text-sm font-bold text-success-600">Total Cost: ₹50 | Wait: 8 Seconds</span>
            </div>
          </motion.div>
        </div>

        {/* Savings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-slate-800 text-center mb-6">Your Savings with AutoUPI</h2>
          <div className="grid grid-cols-3 gap-4 mb-12">
            {SAVINGS.map(s => (
              <div key={s.label} className={`card border-2 ${s.color} text-center`}>
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="text-2xl font-bold num mb-1">{s.value}</div>
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs opacity-70 mt-0.5">{s.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bar comparison */}
        <motion.div
          className="card mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-bold text-slate-800 mb-6">Visual Comparison</h3>
          {[
            { label: 'Settlement Speed', bankWidth: 5, autoupiWidth: 100, bankLabel: '3-5 days', autoupiLabel: '8 sec' },
            { label: 'Fee', bankWidth: 100, autoupiWidth: 10, bankLabel: '3-5%', autoupiLabel: '0.5%' },
            { label: 'Transparency', bankWidth: 20, autoupiWidth: 100, bankLabel: '20%', autoupiLabel: '100%' },
          ].map((bar, i) => (
            <div key={bar.label} className="mb-5">
              <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
                <span>{bar.label}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">Bank</span>
                  <div className="flex-1 bg-surface-3 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-danger-400 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.bankWidth}%` }}
                      transition={{ delay: 0.7 + i * 0.1, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-danger-500 w-16 text-right">{bar.bankLabel}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-16">AutoUPI</span>
                  <div className="flex-1 bg-surface-3 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${bar.autoupiWidth}%` }}
                      transition={{ delay: 0.8 + i * 0.1, duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-xs font-mono text-success-600 w-16 text-right">{bar.autoupiLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <button
            onClick={() => router.push('/send')}
            className="btn-primary text-base px-10 py-4 shadow-glow"
          >
            Start Saving Now <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-slate-400 text-sm mt-3">No registration fee • Instant setup • Demo mode available</p>
        </motion.div>
      </div>
    </div>
  );
}
