import React from 'react';
import { ShieldCheck, Lock, Eye, Database, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
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
              <ShieldCheck className="w-6 h-6 text-accent-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Segurança & Privacidade</h2>
              <p className="text-[10px] text-accent-green uppercase font-bold tracking-wider">Conformidade com a LGPD & Criptografia Ativa</p>
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
          
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-card-border flex gap-4 items-start">
            <Lock className="w-8 h-8 text-accent-green shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-100 mb-1">Seus dados são 100% confidenciais</h3>
              <p className="text-slate-400 text-xs">
                As informações inseridas no FinanzaPulse pertencem exclusivamente a você. Não vendemos, compartilhamos, nem utilizamos suas informações financeiras para nenhuma outra finalidade que não seja a sua própria análise.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <Database className="w-4 h-4 text-accent-green" />
              1. Armazenamento Blindado no Firebase
            </h4>
            <p className="text-slate-400 text-xs pl-6">
              Todos os seus registros de receitas, despesas, metas e patrimônio são salvos em bancos de dados isolados utilizando o <strong>Google Cloud Firebase Firestore</strong>. O Firebase emprega os mais rigorosos padrões internacionais de segurança da informação, protegendo os servidores físicos e virtuais contra qualquer acesso não autorizado.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <ShieldCheck className="w-4 h-4 text-accent-green" />
              2. Conexão Segura SSL & Criptografia em Trânsito
            </h4>
            <p className="text-slate-400 text-xs pl-6">
              A comunicação entre seu navegador e os nossos servidores é totalmente protegida através de criptografia <strong>SSL/TLS ponta-a-ponta</strong>. Isso impede que os seus dados sejam interceptados ou visualizados enquanto viajam pela rede.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <Eye className="w-4 h-4 text-accent-green" />
              3. Diretrizes de Conformidade com a LGPD
            </h4>
            <div className="text-slate-400 text-xs pl-6 space-y-2">
              <p>O FinanzaPulse está em total conformidade com a <strong>Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>, garantindo seus direitos fundamentais:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Direito de Consentimento:</strong> Você decide quando criar ou utilizar a plataforma.</li>
                <li><strong>Direito de Acesso e Correção:</strong> Você pode visualizar, editar ou atualizar todas as suas informações em tempo real no dashboard.</li>
                <li><strong>Direito de Exclusão Definitiva:</strong> Garantimos o direito ao esquecimento. Caso queira deletar permanentemente seus dados do nosso servidor de nuvem, basta solicitar ao suporte e faremos a purga completa das suas coleções do Firestore.</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-100 flex items-center gap-2 text-base">
              <FileText className="w-4 h-4 text-accent-green" />
              4. Acesso sem Senhas Tradicionais (Mais Seguro)
            </h4>
            <p className="text-slate-400 text-xs pl-6">
              Para elevar a sua segurança cibernética, não armazenamos senhas comuns em nosso banco de dados. Os acessos são validados por provedor de login seguro da <strong>Google (Google OAuth)</strong> ou através de <strong>Códigos de Acesso Únicos (OTP)</strong> enviados por e-mail. Isso elimina o risco de vazamentos de senhas cruzadas.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-card-border bg-slate-900/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <span className="text-[10px] bg-accent-green/10 text-accent-green border border-accent-green/20 px-3 py-1 rounded-full font-bold">LGPD COMPLIANT</span>
            <span className="text-[10px] bg-slate-800 text-slate-400 border border-card-border px-3 py-1 rounded-full font-bold">AES-256 ENCRYPTED</span>
          </div>
          <Button onClick={onClose} className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-6">
            Entendi e Concordo
          </Button>
        </div>
      </div>
    </div>
  );
}
