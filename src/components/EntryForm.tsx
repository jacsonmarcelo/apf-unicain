import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { FINANCIAL_TABLES, CATEGORIES_BY_TABLE } from '@/constants/finance';
import { TransactionType } from '@/types/finance';

interface EntryFormProps {
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

export function EntryForm({ onSubmit, loading }: EntryFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [tableId, setTableId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !tableId || !category || !amount) return;

    await onSubmit({
      date: date.toISOString(),
      description,
      tableId,
      categoryId: category,
      amount: parseFloat(amount.replace(',', '.')),
      createdAt: new Date().toISOString()
    });

    // Reset fields except date if desired, but user might want to enter same date
    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 bg-card-bg p-6 rounded-xl border border-card-border shadow-xl">
      <div className="flex flex-col gap-5">
        {/* Date Field */}
        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-label text-[11px] font-bold uppercase tracking-wider">Transaction Date</Label>
          <Popover>
            <PopoverTrigger className="w-full">
              <div
                className={cn(
                  "w-full flex items-center justify-start text-left font-normal bg-brand-bg border border-slate-700/50 rounded-md px-3 h-10 cursor-pointer text-sm transition-colors hover:border-accent-green/50",
                  !date && "text-slate-500"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-accent-green" />
                {date ? format(date, "dd/MM/yyyy") : <span>Selecione a data</span>}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-card-bg border-card-border" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                initialFocus
                className="bg-card-bg text-slate-200"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-label text-[11px] font-bold uppercase tracking-wider">Descrição</Label>
          <Input
            id="description"
            placeholder="e.g. Weekly Market Shopping"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-brand-bg border-slate-700/50 h-10 focus-visible:ring-accent-green focus-visible:border-accent-green"
          />
        </div>

        {/* Category Selector */}
        <div className="space-y-1.5">
          <Label htmlFor="category" className="text-label text-[11px] font-bold uppercase tracking-wider">Table & Category</Label>
          <Select value={`${tableId}:${category}`} onValueChange={(val) => {
            const [t, c] = val.split(':');
            setTableId(t);
            setCategory(c);
          }}>
            <SelectTrigger className="bg-brand-bg border-slate-700/50 h-10 focus:ring-accent-green">
              <SelectValue placeholder="Selecione categoria" />
            </SelectTrigger>
            <SelectContent className="bg-card-bg border-card-border text-slate-200">
              {(Object.entries(CATEGORIES_BY_TABLE) as [string, string[]][]).map(([tableKey, categories]) => (
                <SelectGroup key={tableKey}>
                  <SelectLabel className="text-accent-green font-bold uppercase text-[9px] tracking-[0.2em] px-2 py-2 mt-2 border-t border-card-border/50 bg-slate-900/30">
                    {FINANCIAL_TABLES[tableKey].name}
                  </SelectLabel>
                  {categories.map((cat) => (
                    <SelectItem key={`${tableKey}:${cat}`} value={`${tableKey}:${cat}`} className="text-xs">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Amount Field */}
        <div className="space-y-1.5">
          <Label htmlFor="amount" className="text-label text-[11px] font-bold uppercase tracking-wider">Amount (BRL)</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R$</span>
            <Input
              id="amount"
              type="text"
              placeholder="0,00"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d,.]/g, '');
                setAmount(val);
              }}
              className="bg-brand-bg border-slate-700/50 h-10 pl-9 font-mono focus-visible:ring-accent-green"
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          disabled={loading || !description || !tableId || !category || !amount}
          className="w-full bg-accent-green hover:opacity-90 text-slate-900 font-bold uppercase tracking-widest text-[11px] h-10 transition-all active:scale-[0.98]"
        >
          {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <PlusCircle className="mr-2 h-3 w-3" />}
          Record Transaction
        </Button>
      </div>
    </form>
  );
}
