import { TransactionType, FinancialTable } from '../types/finance';

export const FINANCIAL_TABLES: Record<string, FinancialTable> = {
  RECEITA: { id: 'RECEITA', name: 'Receita', type: TransactionType.INCOME },
  RECEITA_EXTRA: { id: 'RECEITA_EXTRA', name: 'Receita Extra', type: TransactionType.INCOME },
  INVESTIMENTOS: { id: 'INVESTIMENTOS', name: 'Investimentos', type: TransactionType.INVESTMENT },
  DESPESAS_ESSENCIAIS: { id: 'DESPESAS_ESSENCIAIS', name: 'Despesas Essenciais', type: TransactionType.EXPENSE },
  DESPESAS_VIVO_SEM: { id: 'DESPESAS_VIVO_SEM', name: 'Despesas Vivo Sem', type: TransactionType.EXPENSE },
  PARCELAS_E_EMPRESTIMOS: { id: 'PARCELAS_E_EMPRESTIMOS', name: 'Parcelas e Empréstimos', type: TransactionType.DEBT },
};

export const CATEGORIES_BY_TABLE: Record<string, string[]> = {
  RECEITA: [
    'Salário', 'INSS', 'Pensão', 'Comissão', 'Proventos', 'Pro-Labore', 'Bônus'
  ],
  RECEITA_EXTRA: [
    'Trabalho Extra', 'Juros da Aplicação', 'Inventario', 'Ações'
  ],
  INVESTIMENTOS: [
    'Aplicar na Renda Fixa', 'CDB', 'FIIs', 'Renda Variável'
  ],
  DESPESAS_ESSENCIAIS: [
    'Mercado', 'Farmácia', 'Consulta/Exames', 'Energia Elétrica',
    'Estudo para Crescimento Profissional', 'Condominio', 'IPTU',
    'Estetica/Cabeleireira', 'Banda Larga Wifi', 'Fones/Comunicação/4G',
    'Uniforme', 'Colégio', 'Bazar e utilidades', 'Roupas',
    'Transp Publico/App', 'Manutenção Casa', 'Saneamento/Agua', 'Juros/Multa'
  ],
  DESPESAS_VIVO_SEM: [
    'Bares, Restaurantes, cafés', 'Seguro do Carro', 'Combustível',
    'Plano Saúde/Seguro', 'IPVA', 'TV/Streaming/Assinaturas',
    'Tansp Publico/APP', 'Estética/Cabeleireiro', 'Cinema/Teatro/Shows',
    'Estacionamento/Pedágio', 'Diarista', 'Bazar e utilidades', 'Roupas',
    'Presentes', 'Despesas Casa', 'Clubes/Academia', 'Viagem',
    'Bem Estar e Lazer', 'Balada, Choperia, Eventos, etc'
  ],
  PARCELAS_E_EMPRESTIMOS: [
    'Financiamento', 'Ações', 'Dividas'
  ]
};
