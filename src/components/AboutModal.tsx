import React from 'react';
import { Target, Award, BookOpen, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
              <Target className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Sobre o Finanza</h2>
              <p className="text-[10px] text-accent-green uppercase font-bold tracking-wider">Sistema de Evolução Financeira</p>
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
          
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-card-border">
            <h3 className="font-bold text-slate-100 text-base mb-2 flex items-center gap-2">
              <Award className="w-5 h-5 text-accent-green" />
              Metodologia & Fundamentos
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              O Finanza nasceu da integração entre a experiência prática da metodologia do Plano Perfeito (da Aliança Divergente) e anos de bagagem técnica em Sistemas de Informação, somados à certificação em Análise e Planejamento Financeiro.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-accent-green" />
              Princípios Universais
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Sem apelos agressivos ou fórmulas mágicas, o Finanza baseia-se em pilares universais de <strong>disciplina, organização, clareza, responsabilidade, construção de patrimônio e evolução contínua</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-accent-green" />
              Da Planilha ao Software
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              O objetivo do Finanza não é competir nem substituir planilhas tradicionais, mas sim eliminar a fricção diária para que o acompanhamento financeiro se torne um hábito leve, automático e gratificante.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-card-border bg-slate-900/20 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 font-medium">FINANZA • PLATAFORMA DE EVOLUÇÃO</span>
          <Button onClick={onClose} className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-6">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
