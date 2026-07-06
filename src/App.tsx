/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LandingPage } from './components/LandingPage';
import { Shell } from './components/Shell';
import { EntryForm } from './components/EntryForm';
import { MonthlySummaryTable } from './components/MonthlySummaryTable';
import { AnnualSummary } from './components/AnnualSummary';
import { BudgetManager } from './components/BudgetManager';
import { RecurringManager } from './components/RecurringManager';
import { AdminDashboard } from './components/AdminDashboard';
import { useFinanceData } from './hooks/useFinanceData';
import { exportToCSV } from './lib/export';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { DollarSign, ArrowUpCircle, ArrowDownCircle, PieChart, Loader2, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth, GoogleSignIn } from './lib/auth';
import { Button } from './components/ui/button';
import { testFirestoreConnection } from './lib/firebase';

export default function App() {
  const { user, profile, loadingProfile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { 
    entries, 
    budgets, 
    recurring, 
    loading,
    addEntry, 
    addBudget, 
    addRecurring, 
    deleteRecurring 
  } = useFinanceData(user);

  // Test Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Effect to generate recurring entries for the current month
  useEffect(() => {
    if (user && profile?.isSubscribed && recurring.length > 0) {
      const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
      const existingInMonth = entries.filter(e => e.date.startsWith(monthStr) && e.description.includes('(Recorrente)'));
      
      recurring.forEach(rec => {
        const alreadyExists = existingInMonth.some(e => e.description === `${rec.description} (Recorrente)`);
        if (!alreadyExists) {
          const entryDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), rec.dayOfMonth);
          addEntry({
            date: entryDate.toISOString(),
            description: `${rec.description} (Recorrente)`,
            tableId: rec.tableId,
            categoryId: rec.categoryId,
            amount: rec.amount,
            createdAt: new Date().toISOString()
          });
        }
      });
    }
  }, [user, profile?.isSubscribed, currentMonth, recurring.length, entries.length]);

  if (!user) {
    return <LandingPage />;
  }

  if (loadingProfile || (profile?.isSubscribed && loading)) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
      </div>
    );
  }

  if (!profile?.isSubscribed && !profile?.isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md bg-card-bg border border-card-border p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-2 bg-accent-amber" />
          <div className="bg-accent-amber/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <ShieldAlert className="w-10 h-10 text-accent-amber" />
          </div>
          <h2 className="text-3xl font-bold mb-4 tracking-tight">Parece que você ainda não está inscrito!</h2>
          <p className="text-slate-400 leading-relaxed mb-10">
            Sua conta foi criada com sucesso, mas você ainda não possui uma assinatura ativa para acessar as ferramentas estratégicas.
          </p>
          <div className="space-y-4">
            <Button 
              className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold h-16 rounded-2xl text-lg shadow-xl"
              onClick={() => window.open('https://wa.me/5551989232128?text=Olá,%20gostaria%20de%20ativar%20minha%20inscrição%20no%20FinanzaPulse', '_blank')}
            >
              Falar com Suporte via WhatsApp
            </Button>
            <Button variant="ghost" onClick={signOut} className="w-full text-slate-500 hover:text-slate-300">
              Sair da Conta
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthEntries = entries.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === currentMonth.getFullYear() && d.getMonth() === currentMonth.getMonth();
  });

  const totalIn = monthEntries
    .filter(e => ['RECEITA', 'RECEITA_EXTRA'].includes(e.tableId))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalOut = monthEntries
    .filter(e => ['DESPESAS_ESSENCIAIS', 'DESPESAS_VIVO_SEM', 'PARCELAS_E_EMPRESTIMOS'].includes(e.tableId))
    .reduce((sum, e) => sum + e.amount, 0);

  const totalInvest = monthEntries
    .filter(e => e.tableId === 'INVESTIMENTOS')
    .reduce((sum, e) => sum + e.amount, 0);

  const balance = totalIn - totalOut - totalInvest;

  const handleExport = () => {
    const fileName = activeTab === 'annual' 
      ? `Resumo_Anual_${currentMonth.getFullYear()}` 
      : `Extrato_${monthStr}`;
    
    const dataToExport = activeTab === 'annual'
      ? entries.filter(e => new Date(e.date).getFullYear() === currentMonth.getFullYear())
      : monthEntries;

    exportToCSV(dataToExport, fileName);
  };

  return (
    <Shell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentMonth={currentMonth}
      setCurrentMonth={setCurrentMonth}
      onExport={handleExport}
      onLogout={signOut}
      isAdmin={profile?.isAdmin}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard title="Receita Mensal" amount={totalIn} icon={<ArrowUpCircle className="text-accent-green" />} />
            <SummaryCard title="Despesas Totais" amount={totalOut + totalInvest} icon={<ArrowDownCircle className="text-accent-rose" />} isNegative />
            <SummaryCard title="Saldo Projetado" amount={balance} icon={<DollarSign className={cn(balance >= 0 ? "text-accent-green" : "text-accent-rose")} />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-label border-b border-card-border pb-2">Novo Lançamento</h2>
                <EntryForm onSubmit={addEntry} />
              </section>
            </div>

            <div className="lg:col-span-2">
              <section className="space-y-4">
                <h2 className="text-xs font-bold uppercase tracking-widest text-label border-b border-card-border pb-2">Alocação Mensal: <span className="text-accent-green">{currentMonth.toLocaleDateString('pt-BR', { month: 'long' })}</span></h2>
                <MonthlySummaryTable entries={monthEntries} />
              </section>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'annual' && (
        <section className="space-y-6">
          <AnnualSummary entries={entries} year={currentMonth.getFullYear()} />
        </section>
      )}

      {activeTab === 'budgets' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold">Metas de Gastos</h1>
            <p className="text-slate-400">Defina orçamentos para categorias críticas e acompanhe seu progresso.</p>
          </div>
          <BudgetManager 
            budgets={budgets} 
            entries={monthEntries} 
            onAddBudget={addBudget} 
            month={monthStr} 
          />
        </section>
      )}

      {activeTab === 'recurring' && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold">Lançamentos Recorrentes</h1>
            <p className="text-slate-400">Configure gastos ou receitas que se repetem todos os meses.</p>
          </div>
          <RecurringManager 
            recurringEntries={recurring} 
            onAdd={addRecurring} 
            onDelete={deleteRecurring} 
          />
        </section>
      )}

      {activeTab === 'admin' && profile?.isAdmin && (
        <section className="space-y-6">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-bold">Painel Administrativo</h1>
            <p className="text-slate-400">Gerencie o acesso de usuários e aprovações do sistema.</p>
          </div>
          <AdminDashboard />
        </section>
      )}
    </Shell>
  );
}

function SummaryCard({ title, amount, icon, isNegative }: { title: string, amount: number, icon: React.ReactNode, isNegative?: boolean }) {
  return (
    <Card className="bg-card-bg border-card-border shadow-2xl rounded-xl overflow-hidden">
      <CardContent className="pt-6 pb-6 text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label mb-3 block">{title}</span>
        <div className="flex items-center justify-center gap-3">
          <div className={cn(
            "text-2xl font-bold tracking-tight",
            title === "Receita Mensal" ? "text-accent-green" : 
            isNegative ? "text-accent-rose" : "text-white"
          )}>
            R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
