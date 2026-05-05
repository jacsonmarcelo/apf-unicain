import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FINANCIAL_TABLES, CATEGORIES_BY_TABLE } from '@/constants/finance';
import { BudgetLimit, FinancialEntry } from '@/types/finance';
import { PlusCircle, Target, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BudgetManagerProps {
  budgets: BudgetLimit[];
  entries: FinancialEntry[];
  onAddBudget: (budget: Omit<BudgetLimit, 'id' | 'userId'>) => Promise<void>;
  month: string; // YYYY-MM
}

export function BudgetManager({ budgets, entries, onAddBudget, month }: BudgetManagerProps) {
  const [tableId, setTableId] = useState('');
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');

  const activeBudgets = budgets.filter(b => b.month === month);

  const calculateSpent = (b: BudgetLimit) => {
    return entries
      .filter(e => e.tableId === b.tableId && e.categoryId === b.categoryId)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableId || !category || !limit) return;
    await onAddBudget({
      tableId,
      categoryId: category,
      limitAmount: parseFloat(limit),
      month
    });
    setLimit('');
  };

  return (
    <div className="space-y-8">
      {/* Add Budget Form */}
      <form onSubmit={handleAdd} className="bg-card-bg p-6 rounded-xl border border-card-border shadow-xl flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px] space-y-1.5">
          <Label className="text-label text-[11px] font-bold uppercase tracking-wider">Categoria</Label>
          <Select value={`${tableId}:${category}`} onValueChange={(val) => {
            const [t, c] = val.split(':');
            setTableId(t);
            setCategory(c);
          }}>
            <SelectTrigger className="bg-brand-bg border-slate-700/50 h-10">
              <SelectValue placeholder="Selecione categoria" />
            </SelectTrigger>
            <SelectContent className="bg-card-bg border-card-border">
              {(Object.entries(CATEGORIES_BY_TABLE) as [string, string[]][]).map(([tableKey, categories]) => (
                <SelectGroup key={tableKey}>
                  <SelectLabel className="text-accent-green font-bold uppercase text-[9px] tracking-[0.2em] px-2 py-2 border-t border-card-border/50 bg-slate-900/30">
                    {FINANCIAL_TABLES[tableKey].name}
                  </SelectLabel>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={`${tableKey}:${cat}`} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[150px] space-y-1.5">
          <Label className="text-label text-[11px] font-bold uppercase tracking-wider">Meta (R$)</Label>
          <Input 
            placeholder="0,00" 
            value={limit} 
            onChange={e => setLimit(e.target.value)}
            className="bg-brand-bg border-slate-700/50 h-10"
          />
        </div>
        <Button className="bg-accent-green text-slate-900 font-bold h-10 uppercase tracking-widest text-[11px]">
          <PlusCircle className="w-4 h-4 mr-2" /> Definir Meta
        </Button>
      </form>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeBudgets.map(b => {
          const spent = calculateSpent(b);
          const percent = Math.min((spent / b.limitAmount) * 100, 100);
          const isOver = spent > b.limitAmount;
          const isClose = percent > 85;

          return (
            <div key={b.id} className="bg-card-bg shadow-2xl p-6 rounded-xl border border-card-border transition-all hover:bg-slate-800/40">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <h4 className="font-bold text-slate-100 flex items-center">
                    <Target className="w-4 h-4 mr-2 text-accent-green" />
                    {b.categoryId}
                  </h4>
                  <span className="text-[9px] text-label uppercase font-bold tracking-[0.2em]">
                    {FINANCIAL_TABLES[b.tableId].name}
                  </span>
                </div>
                <div className="text-right">
                  <span className={cn("text-xl font-bold", isOver ? "text-accent-rose" : "text-accent-green")}>
                    R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-label text-[10px] block font-bold uppercase mt-1">de R$ {b.limitAmount.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isOver ? "bg-accent-rose" : isClose ? "bg-accent-amber" : "bg-accent-green"
                    )}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className={cn(isOver ? "text-accent-rose" : "text-label")}>
                    {percent.toFixed(0)}% Utilizado
                  </span>
                  {isOver ? (
                    <span className="text-accent-rose flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Critical limit reached
                    </span>
                  ) : isClose ? (
                    <span className="text-accent-amber flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Close to limit
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
