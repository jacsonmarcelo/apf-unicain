import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  CalendarDays, 
  Settings2, 
  Repeat, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  Wallet,
  ShieldAlert,
  ShieldCheck,
  Activity,
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface ShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentMonth: Date;
  setCurrentMonth: (date: Date) => void;
  onExport: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export function Shell({ 
  children, 
  activeTab, 
  setActiveTab, 
  currentMonth, 
  setCurrentMonth, 
  onExport,
  onLogout,
  isAdmin
}: ShellProps) {
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const monthLabel = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const navItems = [
    { id: 'dashboard', label: 'Lançamentos', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'annual', label: 'Visão Anual', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'budgets', label: 'Metas', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'recurring', label: 'Recorrentes', icon: <Repeat className="w-4 h-4" /> },
    { id: 'feedback', label: 'Contribuições', icon: <MessageSquare className="w-4 h-4" /> },
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: <ShieldAlert className="w-4 h-4" /> });
    navItems.push({ id: 'analytics', label: 'Analytics', icon: <Activity className="w-4 h-4" /> });
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-50 font-sans flex flex-col justify-between">
      <div>
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 border-b border-card-border bg-brand-bg/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-slate-900" />
                </div>
                <span className="font-bold text-2xl tracking-tight">
                  Finanza<span className="text-accent-green">Pulse</span>
                </span>
                
                {/* Premium LGPD Active Badge */}
                <button 
                  onClick={() => setIsPrivacyOpen(true)}
                  className="ml-3 px-2.5 py-1 rounded-lg bg-accent-green/10 border border-accent-green/20 text-accent-green text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-accent-green/20 transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-accent-green/40"
                  title="Seus dados estão protegidos conforme a LGPD brasileira. Clique para ler a política de privacidade."
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">LGPD Ativa</span>
                </button>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-label font-medium mt-1">
                Financial Analysis & Strategic Planning
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-card-border">
                <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-slate-800 text-slate-400">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-4 text-xs font-bold uppercase tracking-widest text-slate-300 min-w-[150px] text-center">
                  {monthLabel}
                </div>
                <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-slate-800 text-slate-400">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              <Button variant="outline" size="sm" onClick={onExport} className="bg-card-border/30 border-card-border hover:bg-card-border/50 text-slate-300 hidden sm:flex">
                <Download className="w-4 h-4 mr-2" /> Exportar CSV
              </Button>

              <Button variant="ghost" size="icon" onClick={onLogout} className="text-slate-500 hover:text-accent-rose">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 h-12">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative h-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2",
                  activeTab === item.id ? "text-accent-green" : "text-label hover:text-slate-200"
                )}
              >
                {item.icon}
                {item.label}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-green"
                  />
                )}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Persistent Secure Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-8 border-t border-card-border/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-label gap-4 mt-12 bg-transparent">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center sm:text-left">
          <span>© 2026 FinanzaPulse • Inteligência Financeira</span>
          <span className="hidden sm:inline text-card-border">•</span>
          <button 
            onClick={() => setIsPrivacyOpen(true)}
            className="hover:text-accent-green hover:underline focus:outline-none font-bold text-accent-green/80"
          >
            Política de Privacidade & LGPD
          </button>
        </div>
        <div className="flex items-center gap-2.5 opacity-80 text-slate-400 bg-slate-900/40 border border-card-border/50 px-3.5 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-accent-green shrink-0" />
          <span>Servidor Seguro SSL • Dados Criptografados no Firebase</span>
        </div>
      </footer>

      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}
