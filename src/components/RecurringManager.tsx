import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FINANCIAL_TABLES, CATEGORIES_BY_TABLE } from '@/constants/finance';
import { RecurringEntry } from '@/types/finance';
import { PlusCircle, Trash2, Repeat } from 'lucide-react';

interface RecurringManagerProps {
  recurringEntries: RecurringEntry[];
  onAdd: (data: Omit<RecurringEntry, 'id' | 'userId' | 'active'>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function RecurringManager({ recurringEntries, onAdd, onDelete }: RecurringManagerProps) {
  const [description, setDescription] = useState('');
  const [tableId, setTableId] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !tableId || !category || !amount || !day) return;
    onAdd({
      description,
      tableId,
      categoryId: category,
      amount: parseFloat(amount.replace(',', '.')),
      dayOfMonth: parseInt(day)
    });
    setDescription('');
    setAmount('');
  };

  return (
    <div className="space-y-8">
      {/* Add Recurring Form */}
      <form onSubmit={handleSubmit} className="bg-card-bg p-6 rounded-xl border border-card-border shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        <div className="space-y-1.5">
          <Label className="text-label text-[11px] font-bold uppercase tracking-wider">Descrição</Label>
          <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-brand-bg border-slate-700/50 h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-label text-[11px] font-bold uppercase tracking-wider">Tabela & Categoria</Label>
          <Select value={`${tableId}:${category}`} onValueChange={(val) => {
            const [t, c] = val.split(':');
            setTableId(t);
            setCategory(c);
          }}>
            <SelectTrigger className="bg-brand-bg border-slate-700/50 h-10 text-xs">
              <SelectValue placeholder="Selecione" />
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
        <div className="space-y-1.5">
          <Label className="text-label text-[11px] font-bold uppercase tracking-wider">Valor (R$)</Label>
          <Input value={amount} onChange={e => setAmount(e.target.value)} className="bg-brand-bg border-slate-700/50 h-10 font-mono" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-label text-[11px] font-bold uppercase tracking-wider">Dia do Mês</Label>
          <Input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)} className="bg-brand-bg border-slate-700/50 h-10 font-mono" />
        </div>
        <Button className="bg-accent-green text-slate-900 font-bold h-10 uppercase tracking-widest text-[11px] transition-all hover:opacity-90">
          <PlusCircle className="w-4 h-4 mr-2" /> Agendar
        </Button>
      </form>

      {/* List */}
      <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden shadow-2xl">
        <Table>
          <TableHeader className="bg-slate-900/40">
            <TableRow className="border-card-border hover:bg-transparent">
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pl-8 py-4">Dia</TableHead>
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Descrição</TableHead>
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Tabela / Categoria</TableHead>
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest text-right py-4 pr-8">Valor</TableHead>
              <TableHead className="w-[80px] pr-8"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recurringEntries.map((rec) => (
              <TableRow key={rec.id} className="border-card-border/50 hover:bg-slate-800/10 transition-colors">
                <TableCell className="font-mono text-slate-400 pl-8">Dia {rec.dayOfMonth}</TableCell>
                <TableCell className="font-bold text-slate-100">{rec.description}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-accent-green text-[9px] uppercase font-bold tracking-wider">{FINANCIAL_TABLES[rec.tableId].name}</span>
                    <span className="text-slate-400 text-xs">{rec.categoryId}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-slate-200 pr-8">
                  R$ {rec.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="pr-8 text-right">
                  <Button variant="ghost" size="icon" onClick={() => onDelete(rec.id)} className="text-slate-600 hover:text-accent-rose hover:bg-accent-rose/10 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {recurringEntries.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-label text-[11px] italic uppercase tracking-[0.2em] opacity-40">
                  <Repeat className="w-6 h-6 mx-auto mb-3 opacity-20" />
                  Nenhum lançamento recorrente configurado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
