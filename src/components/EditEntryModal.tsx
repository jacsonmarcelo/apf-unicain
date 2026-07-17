import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, Save, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { FINANCIAL_TABLES, CATEGORIES_BY_TABLE } from '@/constants/finance';
import { FinancialEntry } from '@/types/finance';

interface EditEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: FinancialEntry | null;
  onSave: (id: string, data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function EditEntryModal({ isOpen, onClose, entry, onSave, onDelete }: EditEntryModalProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [description, setDescription] = useState('');
  const [tableId, setTableId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (entry) {
      setDate(new Date(entry.date));
      setDescription(entry.description);
      setTableId(entry.tableId);
      setCategory(entry.categoryId);
      setAmount(entry.amount.toString().replace('.', ','));
      setShowConfirmDelete(false);
    }
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !tableId || !category || !amount) return;

    setIsSaving(true);
    try {
      await onSave(entry.id, {
        date: date.toISOString(),
        description,
        tableId,
        categoryId: category,
        amount: parseFloat(amount.replace(',', '.')),
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = async () => {
    if (!showConfirmDelete) {
      setShowConfirmDelete(true);
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(entry.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-card-border flex items-center justify-between bg-slate-900/40">
          <div>
            <h2 className="text-lg font-bold text-slate-100">Editar Lançamento</h2>
            <p className="text-[10px] text-accent-green uppercase font-bold tracking-wider">Ajuste as informações da transação</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full h-8 w-8"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date Field */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-date" className="text-label text-[11px] font-bold uppercase tracking-wider">Data do Lançamento</Label>
            <Popover>
              <PopoverTrigger className="w-full">
                <div
                  className="w-full flex items-center justify-start text-left font-normal bg-brand-bg border border-slate-700/50 rounded-xl px-3 h-11 cursor-pointer text-sm transition-colors hover:border-accent-green/50 text-slate-200"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-accent-green" />
                  {format(date, "dd/MM/yyyy")}
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
            <Label htmlFor="edit-description" className="text-label text-[11px] font-bold uppercase tracking-wider">Descrição</Label>
            <Input
              id="edit-description"
              placeholder="Ex: Mercado Semanal"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-brand-bg border-slate-700/50 h-11 rounded-xl text-slate-200 focus-visible:ring-accent-green focus-visible:border-accent-green"
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-category" className="text-label text-[11px] font-bold uppercase tracking-wider">Tabela & Categoria</Label>
            <Select value={`${tableId}:${category}`} onValueChange={(val) => {
              const [t, c] = val.split(':');
              setTableId(t);
              setCategory(c);
            }}>
              <SelectTrigger className="bg-brand-bg border-slate-700/50 h-11 rounded-xl text-slate-200 focus:ring-accent-green">
                <SelectValue placeholder="Selecione categoria" />
              </SelectTrigger>
              <SelectContent className="bg-card-bg border-card-border text-slate-200">
                {(Object.entries(CATEGORIES_BY_TABLE) as [string, string[]][]).map(([tableKey, categories]) => (
                  <SelectGroup key={tableKey}>
                    <SelectLabel className="text-accent-green font-bold uppercase text-[9px] tracking-[0.2em] px-2 py-2 mt-2 border-t border-card-border/50 bg-slate-900/30">
                      {FINANCIAL_TABLES[tableKey].name}
                    </SelectLabel>
                    {categories.map((cat) => (
                      <SelectItem key={`${tableKey}:${cat}`} value={`${tableKey}:${cat}`} className="text-xs cursor-pointer">
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
            <Label htmlFor="edit-amount" className="text-label text-[11px] font-bold uppercase tracking-wider">Valor (BRL)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">R$</span>
              <Input
                id="edit-amount"
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^\d,.]/g, '');
                  setAmount(val);
                }}
                className="bg-brand-bg border-slate-700/50 h-11 pl-9 rounded-xl font-mono text-slate-200 focus-visible:ring-accent-green"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-4 border-t border-card-border/50 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
            {/* Delete button or Confirm delete state */}
            <div>
              {showConfirmDelete ? (
                <div className="flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    disabled={isDeleting}
                    onClick={handleDeleteClick}
                    className="bg-accent-rose hover:bg-accent-rose/90 text-white font-bold h-9 px-3 rounded-lg text-xs"
                  >
                    {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
                    Confirmar Exclusão
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowConfirmDelete(false)}
                    className="text-slate-400 hover:text-slate-200 h-9 px-3 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleDeleteClick}
                  className="text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 h-9 px-3 rounded-lg text-xs flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Excluir Lançamento
                </Button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-200 h-10 px-4 rounded-xl text-xs"
              >
                Voltar
              </Button>
              <Button 
                type="submit" 
                disabled={isSaving || !description || !tableId || !category || !amount}
                className="bg-accent-green hover:opacity-90 text-slate-900 font-bold uppercase tracking-wider text-xs h-10 px-5 rounded-xl flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Salvar Alterações
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
