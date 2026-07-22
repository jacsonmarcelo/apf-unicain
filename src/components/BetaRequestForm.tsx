import React, { useState } from 'react';
import { motion } from 'motion/react';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  Heart,
  MessageSquare
} from 'lucide-react';

interface BetaRequestFormProps {
  onBackToHome: () => void;
}

export function BetaRequestForm({ onBackToHome }: BetaRequestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [motivation, setMotivation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !motivation.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        motivation: motivation.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      if (whatsapp.trim()) {
        payload.whatsapp = whatsapp.trim();
      }

      await addDoc(collection(db, 'beta_requests'), payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Erro ao enviar solicitação Beta:', err);
      setError('Ocorreu um erro ao enviar sua solicitação. Por favor, tente novamente em alguns instantes.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-bg text-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-xl w-full bg-card-bg border border-card-border p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative text-center"
        >
          <div className="w-20 h-20 bg-accent-green/10 border border-accent-green/20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(16,185,129,0.15)]">
            <CheckCircle2 className="w-10 h-10 text-accent-green" />
          </div>

          <span className="inline-block px-4 py-1.5 mb-4 rounded-full bg-slate-900 border border-card-border text-accent-green text-[10px] font-bold uppercase tracking-[0.25em]">
            Solicitação Confirmada
          </span>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Você está quase lá!
          </h1>

          <div className="space-y-4 text-slate-300 text-sm md:text-base leading-relaxed text-left bg-slate-900/60 p-6 rounded-2xl border border-card-border/80 mb-8">
            <p>
              Recebemos sua solicitação.
            </p>
            <p className="text-slate-400">
              Neste momento o Finanza está em fase Beta.
            </p>
            <p className="text-slate-300 font-medium">
              Os acessos são liberados manualmente para que eu consiga acompanhar cada novo usuário de perto e evoluir o sistema com base no uso real.
            </p>
            <p className="text-slate-400">
              Assim que seu acesso for aprovado você receberá um e-mail informando que já pode acessar o sistema.
            </p>
            <p className="text-accent-green font-semibold pt-2 border-t border-card-border/50 flex items-center gap-2">
              <Heart className="w-4 h-4 fill-accent-green/20 text-accent-green" />
              Enquanto isso, obrigado por fazer parte desta primeira fase do Finanza.
            </p>
          </div>

          <Button 
            onClick={onBackToHome}
            className="w-full bg-accent-green hover:opacity-90 text-slate-900 font-bold h-14 rounded-xl text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para página inicial
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-50 flex items-center justify-center p-6 relative overflow-hidden py-16">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[700px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.1),transparent_50%)] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-card-bg border border-card-border p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-card-border">
          <button 
            onClick={onBackToHome} 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-accent-green" />
            Voltar para a página inicial
          </button>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-accent-green/10 text-accent-green px-3 py-1 rounded-full border border-accent-green/20">
            Acesso Beta Exclusivo
          </span>
        </div>

        <div className="text-center md:text-left mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Solicitar Acesso ao <span className="text-accent-green">Finanza Beta</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Preencha os dados abaixo para entrar na fila de convites prioritários e evoluir sua disciplina financeira.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Seu Nome Completo *
            </Label>
            <Input 
              id="name"
              type="text"
              placeholder="Ex: Roberto Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={200}
              className="bg-slate-950 border-card-border focus:border-accent-green/50 rounded-xl h-12 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Seu E-mail Principal *
            </Label>
            <Input 
              id="email"
              type="email"
              placeholder="Ex: roberto@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={200}
              className="bg-slate-950 border-card-border focus:border-accent-green/50 rounded-xl h-12 text-sm text-slate-100"
            />
            <p className="text-[11px] text-slate-500">
              Este e-mail será utilizado para liberar o seu acesso ao sistema.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>WhatsApp</span>
              <span className="text-[10px] text-slate-500 lowercase font-normal">(opcional)</span>
            </Label>
            <Input 
              id="whatsapp"
              type="tel"
              placeholder="Ex: (51) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              maxLength={50}
              className="bg-slate-950 border-card-border focus:border-accent-green/50 rounded-xl h-12 text-sm text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-xs font-bold uppercase tracking-wider text-slate-300">
              O que motivou você a querer participar do Beta? *
            </Label>
            <textarea 
              id="motivation"
              rows={4}
              placeholder="Conte resumidamente sobre seus desafios atuais na gestão financeira e o que mais você busca no Finanza..."
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              required
              maxLength={2000}
              className="w-full bg-slate-950 border border-card-border focus:border-accent-green/50 rounded-xl p-3 text-sm text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-accent-green/50"
            />
          </div>

          <div className="pt-2 space-y-3">
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-accent-green hover:opacity-90 text-slate-900 font-bold h-14 rounded-xl text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando solicitação...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Solicitar Acesso</span>
                </>
              )}
            </Button>

            <Button 
              type="button"
              variant="ghost"
              onClick={onBackToHome}
              className="w-full text-slate-500 hover:text-slate-300 text-xs font-medium h-10"
            >
              Cancelar e voltar
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 bg-slate-900/40 p-3 rounded-xl border border-card-border/50 text-center">
            <ShieldCheck className="w-4 h-4 text-accent-green shrink-0" />
            <span>Seus dados são confidenciais e protegidos pela LGPD. Sem spam.</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
