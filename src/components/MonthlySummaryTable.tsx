import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FinancialEntry, TransactionType } from '@/types/finance';
import { FINANCIAL_TABLES } from '@/constants/finance';
import { cn } from '@/lib/utils';

interface MonthlySummaryTableProps {
  entries: FinancialEntry[];
}

export function MonthlySummaryTable({ entries }: MonthlySummaryTableProps) {
  // Group entries by table
  const grouped = Object.keys(FINANCIAL_TABLES).reduce((acc, tableId) => {
    acc[tableId] = entries.filter(e => e.tableId === tableId);
    return acc;
  }, {} as Record<string, FinancialEntry[]>);

  const calculateTotal = (tableId: string) => {
    return grouped[tableId].reduce((sum, e) => sum + e.amount, 0);
  };

  const getTableColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return 'text-accent-green';
      case TransactionType.EXPENSE: return 'text-accent-rose';
      case TransactionType.INVESTMENT: return 'text-blue-400';
      case TransactionType.DEBT: return 'text-accent-amber';
      default: return 'text-label';
    }
  };

  const getTableBorderColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.INCOME: return 'border-accent-green/30';
      case TransactionType.EXPENSE: return 'border-accent-rose/30';
      case TransactionType.INVESTMENT: return 'border-blue-400/30';
      case TransactionType.DEBT: return 'border-accent-amber/30';
      default: return 'border-card-border';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {(Object.entries(FINANCIAL_TABLES) as [string, any][]).map(([id, table]) => {
        const tableEntries = grouped[id];
        const total = calculateTotal(id);
        
        return (
          <div key={id} className="bg-card-bg rounded-xl border border-card-border p-5 flex flex-col h-full shadow-lg">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-card-border/50">
              <h3 className={cn("font-bold uppercase text-[10px] tracking-[0.2em]", getTableColor(table.type))}>
                Table: {table.name}
              </h3>
              <div className={cn("font-mono font-bold text-sm", getTableColor(table.type))}>
                R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="flex-1">
              {tableEntries.length > 0 ? (
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-1">
                    {tableEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center py-3 border-b border-card-border/30 last:border-0 hover:bg-slate-800/10 transition-colors px-1">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-200 text-sm font-medium">{entry.description}</span>
                          <span className="text-label text-[9px] uppercase font-bold tracking-wider">{entry.categoryId}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[10px] font-mono">
                            {new Date(entry.date).getDate()}/{new Date(entry.date).getMonth() + 1}
                          </span>
                          <span className={cn("font-mono font-semibold text-sm", table.type === TransactionType.INCOME ? "text-accent-green" : "text-accent-rose")}>
                            {table.type === TransactionType.INCOME ? "+" : "-"} R$ {entry.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-label text-[11px] italic uppercase tracking-widest opacity-40">
                  Nenhum lançamento
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
