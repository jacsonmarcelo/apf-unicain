import React from 'react';
import { X, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleSignIn, EmailSignIn } from '@/lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export function LoginModal({ isOpen, onClose, onOpenPrivacy, onOpenTerms }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-card-bg border border-card-border rounded-[2.5rem] shadow-2xl p-8 md:p-10 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
        
        {/* Close button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full h-8 w-8 z-10"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-accent-green/10 border border-accent-green/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-5 h-5 text-accent-green" />
          </div>
          <span className="text-[10px] font-bold text-accent-green uppercase tracking-[0.2em] bg-accent-green/10 px-3 py-1 rounded-full border border-accent-green/20 mb-2 inline-block">
            Área do Usuário
          </span>
          <h2 className="text-2xl font-bold mb-1 text-slate-100">Acessar o Finanza</h2>
          <p className="text-slate-400 text-xs font-medium">Digite seu e-mail cadastrado ou entre com o Google</p>
        </div>

        <div className="space-y-6">
          <EmailSignIn />
          
          <div className="relative flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-card-border" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ou continue com</span>
            <div className="h-[1px] flex-1 bg-card-border" />
          </div>

          <GoogleSignIn />

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium bg-slate-900/40 py-3 px-4 rounded-xl border border-card-border/50">
            <Lock className="w-3.5 h-3.5 text-accent-green shrink-0" />
            <span>Ambiente seguro • Proteção LGPD</span>
          </div>
        </div>

        <p className="mt-6 text-center text-[10px] text-slate-500 font-medium leading-relaxed">
          Ao continuar, você concorda com nossos{' '}
          <button onClick={onOpenTerms} className="text-slate-400 hover:underline font-bold">
            termos de uso
          </button>{' '}
          e com nossa{' '}
          <button onClick={onOpenPrivacy} className="text-accent-green hover:underline font-bold">
            política de privacidade
          </button>.
        </p>
      </div>
    </div>
  );
}
