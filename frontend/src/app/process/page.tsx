'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { CheckCircle, Circle, Loader2, Zap, Shield, Lock, Database, Rocket, Bell } from 'lucide-react';

const STEP_ICONS: Record<string, React.ElementType> = {
  kyc: Shield, aml: Shield, rate_lock: Lock,
  liquidity: Database, settlement: Rocket, notify: Bell,
};

interface StepLog { step: string; status: string; message: string; timestamp: string; }
interface StepState { id: string; name: string; status: 'pending' | 'processing' | 'done' | 'error'; }

const STEPS_META = [
  { id: 'kyc', name: 'KYC Verification' },
  { id: 'aml', name: 'AML Compliance Check' },
  { id: 'rate_lock', name: 'Exchange Rate Lock' },
  { id: 'liquidity', name: 'Liquidity Pool Check' },
  { id: 'settlement', name: 'Cross-Border Settlement' },
  { id: 'notify', name: 'Recipient Notification' },
];

function ProcessPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const txnId = searchParams.get('id');

  const [steps, setSteps] = useState<StepState[]>(STEPS_META.map(s => ({ ...s, status: 'pending' })));
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<'processing' | 'complete' | 'failed'>('processing');
  const [hash, setHash] = useState('');
  const [progress, setProgress] = useState(0);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!txnId) { router.push('/send'); return; }

    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    const socket = io(WS_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_transaction', txnId);
      addLog('system', 'INFO', `Connected to settlement network`);
      addLog('system', 'INFO', `Transaction ID: ${txnId.slice(0, 8)}...`);
    });

    socket.on('txn_status', ({ status: s }: { status: string }) => {
      if (s === 'PROCESSING') {
        timerRef.current = setInterval(() => setElapsed(e => e + 100), 100);
      }
    });

    socket.on('txn_log', (data: StepLog) => {
      addLog(data.step, data.status, data.message);
      if (data.status === 'INFO') {
        setSteps(prev => prev.map(s => s.id === data.step ? { ...s, status: 'processing' } : s));
      } else if (data.status === 'SUCCESS') {
        setSteps(prev => {
          const updated = prev.map(s => s.id === data.step ? { ...s, status: 'done' as const } : s);
          const done = updated.filter(s => s.status === 'done').length;
          setProgress((done / STEPS_META.length) * 100);
          return updated;
        });
      }
    });

    socket.on('txn_complete', (data: { hash: string; timeTaken: string }) => {
      clearInterval(timerRef.current);
      setHash(data.hash);
      setStatus('complete');
      setProgress(100);
      addLog('system', 'SUCCESS', `🎉 Settlement complete! Hash: ${data.hash.slice(0, 10)}...`);
      setTimeout(() => router.push(`/success?id=${txnId}&hash=${encodeURIComponent(data.hash)}`), 2000);
    });

    socket.on('txn_failed', () => {
      clearInterval(timerRef.current);
      setStatus('failed');
      addLog('system', 'ERROR', '❌ Transaction failed. Please try again.');
    });

    return () => {
      clearInterval(timerRef.current);
      socket.disconnect();
    };
  }, [txnId, router]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  function addLog(step: string, status: string, message: string) {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { step, status, message, timestamp }]);
  }

  const elapsedSec = (elapsed / 1000).toFixed(1);
  const completedSteps = steps.filter(s => s.status === 'done').length;

  const logColor: Record<string, string> = {
    INFO: '#60A5FA', SUCCESS: '#34D399', WARN: '#FBBF24', ERROR: '#F87171',
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Top bar */}
      <div className="bg-slate-900/50 border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white">AutoUPI</span>
          <span className="text-slate-600 text-sm">/ Settlement Processing</span>
        </div>
        <div className="flex items-center gap-3">
          {status === 'processing' && (
            <div className="flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-3 py-1">
              <div className="live-dot" />
              <span className="text-xs text-primary-300 font-medium">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-accent-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-0 max-w-7xl mx-auto w-full p-6 gap-6">
        {/* Left: Steps */}
        <div className="space-y-4">
          {/* Timer */}
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl font-mono font-bold text-white num mb-2">
              {status === 'complete' ? (
                <span className="gradient-text-success">{elapsedSec}s</span>
              ) : (
                <span className={elapsed > 6000 ? 'text-green-400' : elapsed > 3000 ? 'text-yellow-400' : 'text-blue-400'}>
                  {elapsedSec}s
                </span>
              )}
            </div>
            <div className="text-slate-400 text-sm">
              {status === 'complete' ? '🎉 Settlement Complete!' : status === 'failed' ? '❌ Transaction Failed' : 'Processing settlement...'}
            </div>
            <div className="text-xs text-slate-600 mt-1 font-mono">{txnId?.slice(0, 8)}...</div>
          </motion.div>

          {/* Steps */}
          <div className="card !bg-slate-900/50 !border-white/10 space-y-0 !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-white text-sm">Settlement Pipeline</h3>
                <span className="text-xs text-slate-400 num">{completedSteps}/{STEPS_META.length}</span>
              </div>
            </div>
            {steps.map((step, i) => {
              const Icon = STEP_ICONS[step.id] || Circle;
              return (
                <div key={step.id} className="relative">
                  {i < steps.length - 1 && (
                    <div className={`absolute left-[2.35rem] top-[3.5rem] w-0.5 h-4 ${step.status === 'done' ? 'bg-success-500' : 'bg-slate-700'} transition-colors duration-500`} />
                  )}
                  <motion.div
                    className={`flex items-center gap-4 px-5 py-4 transition-colors ${step.status === 'processing' ? 'bg-primary-500/5' : ''}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {/* Icon */}
                    <div className={`relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                      step.status === 'done' ? 'bg-success-500' :
                      step.status === 'processing' ? 'bg-primary-500/20 border border-primary-500/50' :
                      'bg-slate-800 border border-slate-700'
                    }`}>
                      {step.status === 'done' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : step.status === 'processing' ? (
                        <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4 text-slate-600" />
                      )}
                      {step.status === 'processing' && (
                        <div className="absolute inset-0 rounded-xl border border-primary-500/50 animate-ping opacity-50" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold ${step.status === 'done' ? 'text-success-400' : step.status === 'processing' ? 'text-white' : 'text-slate-500'}`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {step.status === 'done' ? 'Completed ✓' : step.status === 'processing' ? 'Processing...' : 'Queued'}
                      </div>
                    </div>

                    <div className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                      step.status === 'done' ? 'bg-success-500/20 text-success-400' :
                      step.status === 'processing' ? 'bg-primary-500/20 text-primary-300 animate-pulse' :
                      'bg-slate-800 text-slate-600'
                    }`}>
                      {step.status === 'done' ? 'DONE' : step.status === 'processing' ? 'ACTIVE' : 'WAIT'}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Network Nodes', value: `${Math.min(completedSteps * 2, 12)}/12` },
              { label: 'Confirmations', value: `${Math.min(completedSteps, 3)}/3` },
              { label: 'Pool Status', value: '87%' },
            ].map(m => (
              <div key={m.label} className="card !bg-slate-900/50 !border-white/10 !py-3 !px-4 text-center">
                <div className="text-lg font-bold text-white num">{m.value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Terminal */}
        <div className="flex flex-col">
          <div className="card !bg-[#0d1117] !border-[#30363d] !rounded-xl flex-1 flex flex-col !p-0 overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border-b border-[#30363d]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              <span className="text-[#8b949e] text-xs ml-2 font-mono">autoupi-settlement — zsh</span>
            </div>

            {/* Logs */}
            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto terminal-scroll space-y-1 min-h-[400px] max-h-[500px]">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex gap-3 leading-relaxed"
                  >
                    <span className="text-[#6e7681] flex-shrink-0">[{log.timestamp}]</span>
                    <span className="flex-shrink-0" style={{ color: logColor[log.status] || '#8b949e' }}>
                      [{log.status}]
                    </span>
                    <span className="text-[#e6edf3] break-all">{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              {status === 'processing' && (
                <div className="flex gap-1 text-[#27c93f] mt-1">
                  <span>▶</span>
                  <span className="cursor-blink" />
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Hash display when complete */}
          <AnimatePresence>
            {hash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 card !bg-success-500/10 !border-success-500/30 !py-3"
              >
                <div className="text-xs font-semibold text-success-400 mb-1">Blockchain Hash</div>
                <div className="text-xs font-mono text-success-300 break-all">{hash.slice(0, 42)}...</div>
                <div className="text-xs text-success-600 mt-1">✓ Confirmed on-chain • Redirecting...</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function ProcessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <ProcessPageInner />
    </Suspense>
  );
}
