import React from 'react';
import { FileText, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfUseModal({ isOpen, onClose }: TermsOfUseModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-2xl max-h-[85vh] bg-card-bg border border-card-border rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-card-border flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Termos de Uso</h2>
              <p className="text-[10px] text-accent-green uppercase font-bold tracking-wider">Diretrizes da Plataforma Finanza</p>
            </div>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-sm leading-relaxed scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              1. Aceitação dos Termos
            </h3>
            <p className="text-slate-400 text-xs">
              Ao utilizar a plataforma Finanza, você concorda expressamente com os presentes termos. O Finanza é um sistema de evolução e organização financeira projetado para ajudar no desenvolvimento de hábitos diários consistentes.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              2. Responsabilidade sobre os Dados Financeiros
            </h3>
            <p className="text-slate-400 text-xs">
              O Finanza é uma ferramenta de gestão, planejamento e organização pessoal. Os valores e movimentações inseridos são de inteira responsabilidade do usuário. O sistema não realiza operações bancárias nem transações financeiras reais em seu nome.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-accent-green" />
              3. Acesso à Fase Beta
            </h3>
            <p className="text-slate-400 text-xs">
              Durante a fase de testes Beta, o acesso é liberado mediante aprovação prévia. Reservamo-nos o direito de ajustar, aprimorar ou evoluir as funcionalidades com base no feedback contínuo dos participantes.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              4. Privacidade e Propriedade Intelectual
            </h3>
            <p className="text-slate-400 text-xs">
              Todos os seus registros são estritamente confidenciais. A metodologia, o design do sistema e os elementos gráficos são protegidos por direitos de propriedade intelectual da plataforma Finanza.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-card-border bg-slate-900/20 flex items-center justify-between">
          <span className="text-[10px] bg-slate-800 text-slate-400 border border-card-border px-3 py-1 rounded-full font-bold">
            VERSÃO BETA 2026
          </span>
          <Button onClick={onClose} className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-6">
            Compreendi
          </Button>
        </div>
      </div>
    </div>
  );
}
