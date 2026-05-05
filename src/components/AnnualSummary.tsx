import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FinancialEntry, TransactionType } from '@/types/finance';
import { FINANCIAL_TABLES, CATEGORIES_BY_TABLE } from '@/constants/finance';
import { cn } from '@/lib/utils';

interface AnnualSummaryProps {
  entries: FinancialEntry[];
  year: number;
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function AnnualSummary({ entries, year }: AnnualSummaryProps) {
  // Filter entries for the specific year
  const yearEntries = entries.filter(e => new Date(e.date).getFullYear() === year);

  const calculateMonthlyTotalForTable = (tableId: string, monthIndex: number) => {
    return yearEntries
      .filter(e => e.tableId === tableId && new Date(e.date).getMonth() === monthIndex)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const calculateAnnualTotalForTable = (tableId: string) => {
    return yearEntries
      .filter(e => e.tableId === tableId)
      .reduce((sum, e) => sum + e.amount, 0);
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

  return (
    <div className="space-y-12">
      {(Object.entries(FINANCIAL_TABLES) as [string, any][]).map(([id, table]) => {
        const annualTotal = calculateAnnualTotalForTable(id);
        
        return (
          <div key={id} className="bg-card-bg shadow-2xl rounded-xl border border-card-border overflow-hidden">
            <div className="px-8 py-6 border-b border-card-border flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className={cn("text-xs font-bold uppercase tracking-[0.2em]", getTableColor(table.type))}>
                  Table: {table.name}
                </h2>
                <p className="text-[10px] text-label mt-1 font-medium">Consolidated views for the current fiscal year</p>
              </div>
              <div className="text-right">
                <span className="text-label text-[10px] font-bold uppercase tracking-widest block mb-1">Annual Total ({year})</span>
                <span className={cn("text-2xl font-bold tracking-tight", getTableColor(table.type))}>
                  R$ {annualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <Table>
                <TableHeader className="bg-slate-900/20">
                  <TableRow className="border-card-border hover:bg-transparent">
                    <TableHead className="w-[180px] text-label font-bold uppercase text-[10px] tracking-wider pl-8">Category</TableHead>
                    {MONTHS.map(m => (
                      <TableHead key={m} className="text-right text-label font-bold uppercase text-[10px] tracking-wider min-w-[90px]">
                        {m}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-label font-bold uppercase text-[10px] tracking-wider min-w-[120px] bg-slate-950/40 pr-8">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CATEGORIES_BY_TABLE[id].map((cat) => {
                    const catEntries = yearEntries.filter(e => e.tableId === id && e.categoryId === cat);
                    const catAnnualTotal = catEntries.reduce((sum, e) => sum + e.amount, 0);

                    return (
                      <TableRow key={cat} className="border-card-border/50 hover:bg-slate-800/10">
                        <TableCell className="font-medium text-slate-300 text-sm pl-8">{cat}</TableCell>
                        {MONTHS.map((_, mIdx) => {
                          const val = catEntries
                            .filter(e => new Date(e.date).getMonth() === mIdx)
                            .reduce((sum, e) => sum + e.amount, 0);
                          return (
                            <TableCell key={mIdx} className="text-right font-mono text-xs text-slate-500">
                              {val > 0 ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-mono font-bold text-sm bg-slate-950/20 text-slate-200 pr-8">
                          {catAnnualTotal > 0 ? catAnnualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow className="border-t-2 border-slate-700 bg-slate-950/40 font-bold">
                    <TableCell className="text-slate-100 uppercase text-[10px] tracking-[0.2em] font-black pl-8">Total {table.name}</TableCell>
                    {MONTHS.map((_, mIdx) => {
                      const mTotal = calculateMonthlyTotalForTable(id, mIdx);
                      return (
                        <TableCell key={mIdx} className="text-right font-mono text-sm text-slate-300">
                          {mTotal > 0 ? mTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell className={cn("text-right font-bold text-xl pr-8 tracking-tight", getTableColor(table.type))}>
                      R$ {annualTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
