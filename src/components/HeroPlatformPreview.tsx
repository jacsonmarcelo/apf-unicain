import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Wallet, 
  PieChart, 
  CheckCircle2, 
  PlusCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
  BarChart2,
  Calendar,
  Zap
} from 'lucide-react';

export function HeroPlatformPreview() {
  const [activeTab, setActiveTab] = useState<'overview' | 'evolution' | 'daily'>('overview');

  return (
    <div className="w-full bg-card-bg border border-card-border p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
      {/* Glow Effects */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 blur-2xl rounded-full pointer-events-none" />

      {/* Top Header Mockup Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-card-border/70 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] text-slate-400 font-mono ml-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-accent-green" />
            finanza.app / demo
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-card-border/80 text-[10px] font-bold">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-accent-green text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Visão Geral
          </button>
          <button 
            onClick={() => setActiveTab('evolution')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'evolution' 
                ? 'bg-accent-green text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Evolução
          </button>
          <button 
            onClick={() => setActiveTab('daily')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              activeTab === 'daily' 
                ? 'bg-accent-green text-slate-900 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Diário
          </button>
        </div>
      </div>

      {/* Dynamic Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {/* Top Stat Cards Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-card-border/70 hover:border-accent-green/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Receitas</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-accent-green" />
                </div>
                <p className="text-sm font-bold text-accent-green">R$ 14.500,00</p>
                <span className="text-[9px] text-emerald-400 font-medium">+12% este mês</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-card-border/70 hover:border-accent-rose/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Despesas</span>
                  <ArrowDownRight className="w-3.5 h-3.5 text-accent-rose" />
                </div>
                <p className="text-sm font-bold text-slate-200">R$ 8.240,00</p>
                <span className="text-[9px] text-emerald-400 font-medium">-5% economia</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-2xl border border-card-border/70 hover:border-emerald-400/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Aportes</span>
                  <Wallet className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-emerald-400">R$ 3.200,00</p>
                <span className="text-[9px] text-accent-green font-medium">Meta 100% ok</span>
              </div>
            </div>

            {/* Allocation Progress Bar */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-card-border/70 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-2">
                  <PieChart className="w-3.5 h-3.5 text-accent-green" />
                  Divisão de Recursos (Regra de Ouro)
                </span>
                <span className="text-[10px] text-accent-green font-bold">22% Guardado</span>
              </div>

              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden flex gap-1 p-0.5 border border-card-border/40">
                <div className="h-full bg-accent-green rounded-full w-[45%]" title="Essenciais 45%" />
                <div className="h-full bg-emerald-400 rounded-full w-[22%]" title="Aportes 22%" />
                <div className="h-full bg-teal-500 rounded-full w-[20%]" title="Estilo de Vida 20%" />
                <div className="h-full bg-slate-600 rounded-full w-[13%]" title="Reserva 13%" />
              </div>

              <div className="grid grid-cols-4 text-[9px] text-slate-400 font-medium pt-1">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-accent-green" />
                  <span>Essenciais</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Aportes</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span>Estilo</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                  <span>Reserva</span>
                </div>
              </div>
            </div>

            {/* Quick Activity Row */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-card-border/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center text-accent-green">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200 text-xs">Hábito Diário Cumprido</p>
                  <p className="text-[10px] text-slate-400">3 lançamentos hoje em 12 segundos</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-accent-green bg-accent-green/10 px-2.5 py-1 rounded-full border border-accent-green/20">
                100% em Dia
              </span>
            </div>
          </motion.div>
        )}

        {activeTab === 'evolution' && (
          <motion.div 
            key="evolution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-slate-950 p-4 rounded-2xl border border-card-border/70 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evolução de Patrimônio</p>
                  <p className="text-lg font-bold text-slate-100">R$ 68.450,00</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-accent-green bg-accent-green/10 px-2.5 py-1 rounded-full border border-accent-green/20 inline-block mb-0.5">
                    +R$ 14.200 (6 meses)
                  </span>
                  <p className="text-[9px] text-slate-500">Crescimento constante</p>
                </div>
              </div>

              {/* Simulated Chart Bars */}
              <div className="h-32 flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { month: 'Jan', value: 45, valText: '54k' },
                  { month: 'Fev', value: 55, valText: '57k' },
                  { month: 'Mar', value: 62, valText: '60k' },
                  { month: 'Abr', value: 72, valText: '63k' },
                  { month: 'Mai', value: 85, valText: '66k' },
                  { month: 'Jun', value: 100, valText: '68k', active: true },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[8px] font-mono text-slate-400">{bar.valText}</span>
                    <div 
                      style={{ height: `${bar.value}%` }} 
                      className={`w-full rounded-t-lg transition-all ${
                        bar.active 
                          ? 'bg-gradient-to-t from-emerald-600 to-accent-green shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                    />
                    <span className="text-[9px] text-slate-400 font-bold">{bar.month}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium bg-slate-950/60 py-2.5 rounded-xl border border-card-border/50">
              📊 Acompanhe o crescimento patrimonial acumulado mês a mês com gráficos automáticos.
            </p>
          </motion.div>
        )}

        {activeTab === 'daily' && (
          <motion.div 
            key="daily"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="bg-slate-950 p-4 rounded-2xl border border-card-border/70 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-card-border/50">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-accent-green" />
                  Registro Ultrarrápido (&lt; 15s)
                </span>
                <span className="text-[10px] text-accent-green font-mono font-bold">Hoje</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-card-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      REC
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Salário / Receita Principal</p>
                      <p className="text-[9px] text-slate-500">Receitas Fixas</p>
                    </div>
                  </div>
                  <span className="font-bold text-accent-green">+ R$ 14.500,00</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-card-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-[10px]">
                      INV
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Aporte Tesouro IPCA+</p>
                      <p className="text-[9px] text-slate-500">Construção de Futuro</p>
                    </div>
                  </div>
                  <span className="font-bold text-emerald-400">+ R$ 3.200,00</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-card-border/50 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-[10px]">
                      DES
                    </div>
                    <div>
                      <p className="font-bold text-slate-200">Supermercado da Semana</p>
                      <p className="text-[9px] text-slate-500">Alimentação Essencial</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-300">- R$ 420,00</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-card-border/50">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-4 h-4 text-accent-green" />
                Agrupamento automático por categorias
              </span>
              <span className="font-bold text-accent-green">Sem complicação</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Banner Inside Mockup */}
      <div className="mt-5 pt-4 border-t border-card-border/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          Interface de alta performance
        </span>
        <span className="font-bold text-slate-300">
          Versão Beta 2026
        </span>
      </div>
    </div>
  );
}
