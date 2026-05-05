import { FinancialEntry } from '../types/finance';
import { FINANCIAL_TABLES } from '../constants/finance';

export function exportToCSV(entries: FinancialEntry[], fileName: string) {
  if (entries.length === 0) return;

  const headers = ['Data', 'Descrição', 'Tabela', 'Categoria', 'Valor'];
  const rows = entries.map(entry => [
    new Date(entry.date).toLocaleDateString('pt-BR'),
    entry.description,
    FINANCIAL_TABLES[entry.tableId]?.name || entry.tableId,
    entry.categoryId,
    entry.amount.toFixed(2).replace('.', ',')
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
