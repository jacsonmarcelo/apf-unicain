import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Target, PieChart, ShieldCheck, Zap, Clock, Wallet } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  loginComponent?: React.ReactNode;
}

export function LandingPage({ onStart, loginComponent }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-brand-bg text-slate-50 font-sans selection:bg-accent-green/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden text-center lg:text-left">
        {/* Abstract Background Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.08),transparent_50%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="max-w-3xl">
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
              className="text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mb-12"
            >
              A inteligência estratégica para sua vida financeira. Planeje, acompanhe e otimize seu patrimônio com elegância e precisão técnica.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Button size="lg" className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-10 h-14 rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.15)] w-full sm:w-auto" onClick={() => document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="border-card-border hover:bg-slate-900 text-slate-300 px-10 h-14 rounded-xl w-full sm:w-auto">
                Explore Demo
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
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

      {/* Hero Section Call to Action */}
      <section className="py-32 px-6" id="login-section">
        <div className="max-w-5xl mx-auto bg-card-bg border border-card-border p-12 md:p-24 rounded-[3rem] shadow-2xl relative overflow-hidden text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(16,185,129,0.05),transparent_70%)]" />
          
          <h2 className="text-4xl md:text-6xl font-bold mb-8 relative z-10 leading-tight tracking-tight">Pronto para transformar <br/>seu futuro?</h2>
          <p className="text-slate-400 mb-12 italic text-lg relative z-10 max-w-2xl mx-auto leading-relaxed font-light">
            "A melhor maneira de prever o futuro é construí-lo. FinanzaPulse é o cockpit estratégico que você precisa."
          </p>
          <div id="login-btn" className="relative z-10 flex justify-center">
            {loginComponent ? (
              <div className="scale-110">
                {loginComponent}
              </div>
            ) : (
              <Button size="lg" className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-12 h-16 rounded-2xl text-lg" onClick={onStart}>
                Entrar com Google
              </Button>
            )}
          </div>
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
