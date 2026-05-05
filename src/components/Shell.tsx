import React from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  ];

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: <ShieldAlert className="w-4 h-4" /> });
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-50 font-sans">
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
  );
}
