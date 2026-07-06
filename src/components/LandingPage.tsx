import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Target, PieChart, Clock } from 'lucide-react';
import { GoogleSignIn, EmailSignIn } from '@/lib/auth';

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage() {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-50 font-sans selection:bg-accent-green/30">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden md:pt-24 lg:pt-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-900 border border-card-border text-accent-green text-[10px] font-bold uppercase tracking-[0.3em]"
            >
              Finance Intelligence Platform
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]"
            >
              Elevate Your <br />
              <span className="text-accent-green">Financial Life.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mb-12 mx-auto lg:mx-0"
            >
              A inteligência estratégica para sua vida financeira. Planeje, acompanhe e otimize seu patrimônio com elegância e precisão técnica.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex flex-col sm:flex-row items-center gap-4"
            >
              <Button size="lg" className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-10 h-14 rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.15)]" onClick={() => document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' })}>
                Entrar Agora
              </Button>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-md mx-auto bg-card-bg border border-card-border p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative"
            id="login-card"
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Seja bem-vindo</h2>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Escolha como deseja acessar</p>
            </div>

            <div className="space-y-8">
              <EmailSignIn />
              
              <div className="relative flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-card-border" />
                <span className="text-[10px] font-bold text-label uppercase tracking-widest">Ou continue com</span>
                <div className="h-[1px] flex-1 bg-card-border" />
              </div>

              <GoogleSignIn />
            </div>

            <p className="mt-8 text-center text-[10px] text-slate-500 font-medium">
              Ao continuar, você concorda com nossos termos de uso e política de privacidade.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<PieChart className="w-6 h-6 text-accent-green" />}
            title="Professional Analysis"
            description="Visualize cada centavo com precisão cirúrgica e segmentação por centros de custo."
          />
          <FeatureCard 
            icon={<Target className="w-6 h-6 text-accent-green" />}
            title="Spending Guard"
            description="Estabeleça limites dinâmicos e receba alertas proativos antes do orçamento ser comprometido."
          />
          <FeatureCard 
            icon={<Clock className="w-6 h-6 text-accent-green" />}
            title="Fiscal Automation"
            description="Sincronize despesas recorrentes e projeções anuais de forma totalmente autônoma."
          />
        </div>
      </section>

      <footer className="py-12 px-6 text-center text-label text-[11px] font-bold uppercase tracking-[0.2em] border-t border-card-border/50">
        © 2026 FinanzaPulse. Strategic Financial Planning.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card group hover:bg-slate-800/40 transition-all border border-card-border p-10 rounded-3xl">
      <div className="w-14 h-14 bg-slate-900 border border-card-border rounded-2xl flex items-center justify-center mb-8 group-hover:border-accent-green transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm font-medium">{description}</p>
    </div>
  );
}
