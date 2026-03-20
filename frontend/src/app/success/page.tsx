'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { CheckCircle, Copy, Check, Download, ArrowRight, Zap, Home, Clock } from 'lucide-react';
import { transactionApi } from '@/lib/api';
import toast from 'react-hot-toast';

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

function SuccessPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txnId = searchParams.get('id');
  const hashParam = searchParams.get('hash');

  const [txn, setTxn] = useState<Record<string, unknown> | null>(null);
  const [copied, setCopied] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (txnId) {
      transactionApi.get(txnId).then(res => setTxn(res.data.data)).catch(() => {});
    }
  }, [txnId]);

  function copyHash() {
    const hash = (txn?.blockchain_hash as string) || hashParam || '';
    navigator.clipboard.writeText(hash);
    setCopied(true);
    toast.success('Hash copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  const amount = (txn?.amount as number) || 10000;
  const finalAmount = (txn?.final_amount as number) || 441.7;
  const fee = (txn?.fee as number) || 50;
  const rate = (txn?.exchange_rate as number) || 0.04417;
  const settlementTime = (txn?.settlement_time as number) || 8.2;
  const hash = (txn?.blockchain_hash as string) || hashParam || '';
  const fromCurrency = (txn?.currency as string) || 'INR';
  const toCurrency = (txn?.target_currency as string) || 'AED';
  const recipientName = (txn?.recipient_name as string) || 'Ahmed Al-Rashidi';

  const savedVsBank = Math.round(amount * 0.035); // 3.5% bank fee vs 0.5% ours

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-600 via-success-500 to-primary-600 flex items-center justify-center p-4">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          colors={['#10B981', '#2563EB', '#7C3AED', '#F59E0B', '#fff']}
          recycle={false}
        />
      )}

      <motion.div
        className="w-full max-w-lg"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <motion.div
            className="w-24 h-24 rounded-3xl bg-white shadow-2xl flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
          >
            <CheckCircle className="w-12 h-12 text-success-500" strokeWidth={2} />
          </motion.div>
        </div>

        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-white mb-2">Payment Sent! 🎉</h1>
          <p className="text-white/80">Your money is on its way to {recipientName}</p>
          <div className="inline-flex items-center gap-1.5 mt-3 bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-yellow-300" />
            Settled in {settlementTime}s — 99.7% faster than banks
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {/* Amount hero */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 p-6 text-center text-white">
            <div className="text-sm opacity-80 mb-1">Recipient Receives</div>
            <div className="text-5xl font-bold num mb-1">{toCurrency === 'AED' ? 'د.إ' : '$'}{finalAmount.toLocaleString()}</div>
            <div className="text-sm opacity-70">{toCurrency}</div>
          </div>

          <div className="p-6 space-y-0">
            {/* Summary rows */}
            {[
              { label: 'You Sent', value: `₹${amount.toLocaleString('en-IN')}`, bold: true },
              { label: 'Exchange Rate', value: `1 ${fromCurrency} = ${rate} ${toCurrency}`, mono: true },
              { label: 'Transaction Fee', value: `₹${fee} (0.5%)`, muted: true },
              { label: 'Settlement Time', value: `⚡ ${settlementTime}s`, green: true },
              { label: 'Transaction ID', value: txnId?.slice(0, 12) + '...', mono: true, muted: true },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between py-3.5 ${i < 4 ? 'border-b border-surface-4' : ''}`}>
                <span className="text-slate-500 text-sm">{row.label}</span>
                <span className={`text-sm ${row.bold ? 'font-bold text-slate-800' : row.green ? 'font-bold text-success-600' : row.mono ? 'font-mono text-slate-600' : row.muted ? 'text-slate-500' : 'text-slate-700'} num`}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Hash */}
            <div className="mt-4 bg-surface-2 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Blockchain Hash</span>
                <button onClick={copyHash} className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 transition-colors">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className="font-mono text-xs text-slate-500 truncate">{hash || '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('')}</div>
            </div>

            {/* Savings */}
            <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
              <div className="text-2xl">💰</div>
              <div>
                <div className="font-bold text-orange-700 text-sm">You saved ₹{savedVsBank.toLocaleString()} + 4 days!</div>
                <div className="text-xs text-orange-600">vs traditional bank wire transfer</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 pb-6 space-y-3">
            <button
              onClick={() => router.push('/send')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 text-white font-semibold flex items-center justify-center gap-2 hover:shadow-glow transition-all"
            >
              Send Another Payment <ArrowRight className="w-4 h-4" />
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/dashboard')}
                className="py-3 rounded-xl border border-surface-4 text-slate-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-surface-2 transition-colors"
              >
                <Clock className="w-4 h-4" /> History
              </button>
              <button
                onClick={() => router.push('/compare')}
                className="py-3 rounded-xl border border-surface-4 text-slate-600 text-sm font-medium flex items-center justify-center gap-2 hover:bg-surface-2 transition-colors"
              >
                <Home className="w-4 h-4" /> Compare
              </button>
            </div>
          </div>
        </motion.div>

        {/* Watermark */}
        <div className="text-center mt-4 text-white/40 text-xs">Hackathon Demo • AutoUPI v1.0</div>
      </motion.div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-success-500 flex items-center justify-center text-white text-xl">Loading...</div>}>
      <SuccessPageInner />
    </Suspense>
  );
}
