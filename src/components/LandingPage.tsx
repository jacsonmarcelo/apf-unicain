import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  PieChart, 
  Clock, 
  ShieldCheck, 
  Lock, 
  Database, 
  Award,
  Eye,
  Layers,
  Zap,
  Brain,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Send,
  Sparkles,
  BookOpen,
  ChevronRight,
  X,
  FileText,
  Mail,
  Shield,
  Laptop
} from 'lucide-react';
import { GoogleSignIn, EmailSignIn } from '@/lib/auth';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { TermsOfUseModal } from './TermsOfUseModal';
import { AboutModal } from './AboutModal';
import { BetaRequestForm } from './BetaRequestForm';

type LandingPageMode = 'main' | 'beta' | 'login';

export function LandingPage() {
  const [mode, setMode] = useState<LandingPageMode>('main');
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // If in beta application form mode
  if (mode === 'beta') {
    return <BetaRequestForm onBackToHome={() => setMode('main')} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-slate-50 font-sans selection:bg-accent-green/30 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.07),transparent_60%)] pointer-events-none" />

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-card-border/50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setMode('main')}>
            <div className="w-9 h-9 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sparkles className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-100">FINANZA</span>
              <span className="text-[9px] text-accent-green uppercase tracking-[0.2em] font-bold block leading-none">Sistema de Evolução</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => {
                setMode('main');
                setTimeout(() => {
                  document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }} 
              className="text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl h-10 px-4"
            >
              Já tenho acesso
            </Button>
            <Button 
              onClick={() => setMode('beta')}
              className="bg-accent-green hover:opacity-90 text-slate-900 font-bold text-xs uppercase tracking-wider h-10 px-5 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              Quero participar do Beta
            </Button>
          </div>
        </div>
      </header>

      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 px-6 md:pt-20 lg:pt-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-slate-900 border border-card-border text-accent-green text-[10px] font-bold uppercase tracking-[0.2em] shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent-green" />
              <span>Sistema de Evolução Financeira • Vagas Beta Limitadas</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
            >
              Construa sua evolução financeira <br className="hidden md:block" />
              <span className="text-accent-green">um dia de cada vez.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-300 text-base md:text-xl max-w-2xl leading-relaxed mb-8 mx-auto lg:mx-0 font-normal"
            >
              O Finanza transforma princípios sólidos de organização financeira em hábitos diários simples de executar.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setMode('beta')}
                  className="w-full sm:w-auto bg-accent-green hover:opacity-90 text-slate-900 font-bold px-8 h-14 rounded-xl text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Garantir Minha Vaga no Beta</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Button 
                  size="lg"
                  variant="outline"
                  onClick={() => {
                    document.getElementById('login-card')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto border-card-border hover:bg-slate-800/80 text-slate-200 font-bold px-8 h-14 rounded-xl text-base transition-all cursor-pointer"
                >
                  Já tenho acesso
                </Button>
              </div>

              {/* CRO Guarantees & Friction Reducers */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-[11px] text-slate-400 font-medium pt-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                  Inscrição rápida em 1 min
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                  100% Gratuito na fase Beta
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent-green" />
                  Sem necessidade de cartão
                </span>
              </div>
            </motion.div>
          </div>

          {/* Login Card Integration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-5 w-full max-w-md mx-auto bg-card-bg border border-card-border p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative"
            id="login-card"
          >
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="text-center mb-8">
              <span className="text-[10px] font-bold text-accent-green uppercase tracking-[0.2em] bg-accent-green/10 px-3 py-1 rounded-full border border-accent-green/20 mb-3 inline-block">
                Área do Usuário
              </span>
              <h2 className="text-2xl font-bold mb-1">Acessar o Finanza</h2>
              <p className="text-slate-400 text-xs font-medium">Digite seu e-mail ou utilize sua conta Google</p>
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
                <span>Ambiente criptografado SSL e LGPD ativa</span>
              </div>
            </div>

            <p className="mt-6 text-center text-[10px] text-slate-500 font-medium leading-relaxed">
              Ao continuar, você concorda com nossos{' '}
              <button onClick={() => setIsTermsOpen(true)} className="text-slate-400 hover:underline font-bold">
                termos de uso
              </button>{' '}
              e com nossa{' '}
              <button onClick={() => setIsPrivacyOpen(true)} className="text-accent-green hover:underline font-bold">
                política de privacidade (LGPD)
              </button>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. COMO SURGIU O FINANZA (Nossa História) */}
      <section className="py-20 px-6 bg-slate-950/40 border-y border-card-border/50 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">
              A Origem do Método
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
              Como surgiu o Finanza
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
              Uma trajetória fundamentada na prática diária, resolução de gargalos reais e rigor técnico.
            </p>
          </div>

          <div className="bg-card-bg border border-card-border p-8 md:p-12 rounded-[2.5rem] shadow-xl space-y-6 text-slate-300 text-sm md:text-base leading-relaxed">
            <p>
              O Finanza nasceu da aplicação prática da metodologia do <strong>Plano Perfeito</strong>, da Aliança Divergente. A proposta metodológica trazia uma visão clara, lógica e profunda sobre a separação financeira.
            </p>
            <p>
              Entretanto, no uso diário do método, surgiram dificuldades operacionais reais — em especial para registrar e agrupar múltiplas movimentações sob a mesma categoria sem perder a clareza nem gastar tempo excessivo.
            </p>
            <p>
              Para resolver essa fricção, desenvolvi uma planilha personalizada. Ela foi construída unindo a formação acadêmica em <strong>Sistemas de Informação</strong>, a certificação técnica em <strong>Análise e Planejamento Financeiro</strong> e anos de testes contínuos com dados reais.
            </p>
            <p>
              À medida que a estrutura se consolidou, aquela planilha evoluiu naturalmente para o aplicativo Finanza: um software moderno desenhado para eliminar burocracias e tornar o acompanhamento diário fluido e intuitivo.
            </p>
            <div className="p-6 bg-slate-900/80 rounded-2xl border-l-4 border-accent-green flex items-start gap-4 mt-6">
              <Target className="w-6 h-6 text-accent-green shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-100 text-sm mb-1">Nosso Propósito Central</h4>
                <p className="text-slate-400 text-xs md:text-sm">
                  O objetivo do Finanza não é substituir planilhas. O objetivo é tornar a aplicação da disciplina financeira simples, automática e prazerosa no seu dia a dia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OS CINCO PILARES */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">
              Fundamentos Universais
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
              Os Cinco Pilares da Evolução
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Princípios universais projetados para construir consistência e maturidade financeira.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <PillarCard 
              icon={<Eye className="w-6 h-6 text-accent-green" />}
              title="Clareza"
              description="Registrar diariamente para saber exatamente para onde o dinheiro está indo."
            />
            <PillarCard 
              icon={<Layers className="w-6 h-6 text-accent-green" />}
              title="Organização"
              description="Separar corretamente receitas, investimentos, despesas essenciais, despesas não essenciais e financiamentos."
            />
            <PillarCard 
              icon={<Zap className="w-6 h-6 text-accent-green" />}
              title="Disciplina"
              description="Criar o hábito de acompanhar a vida financeira todos os dias sem esforço."
            />
            <PillarCard 
              icon={<Brain className="w-6 h-6 text-accent-green" />}
              title="Consciência"
              description="Tomar decisões baseadas em informação transparente e nunca em impulso."
            />
            <PillarCard 
              icon={<TrendingUp className="w-6 h-6 text-accent-green" />}
              title="Evolução"
              description="Comparar sua evolução ao longo do tempo e construir patrimônio com constância."
            />
          </div>
        </div>
      </section>

      {/* 4. O QUE O FINANZA FAZ */}
      <section className="py-24 px-6 bg-slate-950/60 border-t border-card-border/50 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 space-y-8">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">
                Recursos Estratégicos
              </span>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
                O que o Finanza faz por você
              </h2>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed">
                Tudo o que você precisa para dominar suas finanças em um ambiente rápido, bonito e eficiente.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FeatureCheck text="Registro rápido" />
              <FeatureCheck text="Categorias pré-configuradas" />
              <FeatureCheck text="Dashboard financeiro" />
              <FeatureCheck text="Evolução mensal" />
              <FeatureCheck text="Evolução anual" />
              <FeatureCheck text="Planejamento financeiro" />
              <FeatureCheck text="Controle patrimonial" />
              <FeatureCheck text="Segurança de nível bancário" />
            </div>

            <div className="pt-4">
              <Button 
                onClick={() => setMode('beta')}
                className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-8 h-12 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] flex items-center gap-2 cursor-pointer"
              >
                <span>Quero participar do Beta</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Interactive Interface Showcase Card */}
          <div className="lg:col-span-6 bg-card-bg border border-card-border p-6 md:p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-card-border/60 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <div className="w-3 h-3 rounded-full bg-slate-700" />
                <span className="text-[10px] text-slate-500 font-mono ml-2">finanza.app / dashboard</span>
              </div>
              <span className="text-[10px] bg-accent-green/10 text-accent-green border border-accent-green/20 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest">
                Visão Geral
              </span>
            </div>

            {/* Mock Dashboard Widgets */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-card-border/60">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Receitas</p>
                  <p className="text-sm font-bold text-accent-green">R$ 14.500,00</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-card-border/60">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Despesas</p>
                  <p className="text-sm font-bold text-accent-rose">R$ 8.240,00</p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-card-border/60">
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">Investido</p>
                  <p className="text-sm font-bold text-emerald-400">R$ 3.200,00</p>
                </div>
              </div>

              {/* Mock Recent Activity List */}
              <div className="bg-slate-950 p-4 rounded-xl border border-card-border/60 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Registros Recentes</p>
                
                <div className="flex items-center justify-between py-1.5 border-b border-card-border/30 text-xs">
                  <span className="text-slate-300">Aporte Tesouro Selic</span>
                  <span className="text-accent-green font-bold">+ R$ 2.000,00</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-card-border/30 text-xs">
                  <span className="text-slate-300">Supermercado Mensal</span>
                  <span className="text-slate-400 font-medium">- R$ 850,00</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-slate-300">Reserva de Emergência</span>
                  <span className="text-accent-green font-bold">+ R$ 1.200,00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. PARA QUEM É (Pre-qualificação e Transparência) */}
      <section className="py-20 px-6 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">
              Fase de Testes Beta Fechada
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
              O Finanza é para você?
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Buscamos pessoas comprometidas em construir hábitos financeiros consistentes para crescer conosco.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* É para você */}
            <div className="bg-card-bg border border-accent-green/30 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-card-border">
                <div className="w-10 h-10 rounded-xl bg-accent-green/10 border border-accent-green/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-accent-green" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">É para você se:</h3>
                  <p className="text-[10px] text-accent-green font-bold uppercase tracking-wider">Perfil Recomendado</p>
                </div>
              </div>
              <ul className="space-y-4 text-xs md:text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                  <span>Deseja criar a disciplina de acompanhar suas finanças diariamente em menos de 2 minutos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                  <span>Quer clareza absoluta sobre para onde vai cada centavo da sua receita.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                  <span>Busca uma ferramenta sem poluição visual e desenhada para acelerar sua construção patrimonial.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-accent-green shrink-0 mt-0.5" />
                  <span>Deseja testar ativamente a plataforma e nos ajudar com feedbacks reais.</span>
                </li>
              </ul>
            </div>

            {/* NÃO é para você */}
            <div className="bg-card-bg border border-card-border/80 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-card-border">
                <div className="w-10 h-10 rounded-xl bg-accent-rose/10 border border-accent-rose/30 flex items-center justify-center">
                  <X className="w-6 h-6 text-accent-rose" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">Não é para você se:</h3>
                  <p className="text-[10px] text-accent-rose font-bold uppercase tracking-wider">Fora do Escopo</p>
                </div>
              </div>
              <ul className="space-y-4 text-xs md:text-sm text-slate-400">
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-accent-rose/70 shrink-0 mt-0.5" />
                  <span>Procura promessas mágicas de enriquecimento rápido ou rendimentos automáticos.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-accent-rose/70 shrink-0 mt-0.5" />
                  <span>Espera um aplicativo que faça tudo por você sem nenhum acompanhamento pessoal.</span>
                </li>
                <li className="flex items-start gap-3">
                  <X className="w-4 h-4 text-accent-rose/70 shrink-0 mt-0.5" />
                  <span>Deseja usar a plataforma sem nenhum compromisso com a própria clareza financeira.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. COMO FUNCIONA (Timeline) */}
      <section className="py-24 px-6 bg-slate-950/40 border-t border-card-border/50 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">
              Processo Transparente
            </span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mt-4 mb-4">
              Como funciona o acesso
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
              Um processo simples e rápido para você ingressar na comunidade Beta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            <TimelineStep 
              number="1"
              badge="< 1 min"
              title="Solicite acesso"
              desc="Preencha o formulário rápido com seu nome e e-mail."
            />
            <TimelineStep 
              number="2"
              badge="Até 24h"
              title="Análise do perfil"
              desc="Acompanhamento próximo de cada novo participante."
            />
            <TimelineStep 
              number="3"
              badge="Via E-mail"
              title="Acesso liberado"
              desc="Instruções e confirmação enviadas na sua caixa de entrada."
            />
            <TimelineStep 
              number="4"
              badge="Imediato"
              title="Comece a utilizar"
              desc="Inicie seus registros e veja a clareza se formar."
            />
            <TimelineStep 
              number="5"
              badge="Contínuo"
              title="Evolução diária"
              desc="Dê opiniões e ajude a lapidar as próximas funções."
            />
          </div>
        </div>
      </section>

      {/* 6.5. FAQ - DÚVIDAS FREQUENTES */}
      <section className="py-20 px-6 relative border-t border-card-border/50 bg-slate-950/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20">
              Respostas Claras
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mt-4 mb-3">
              Perguntas Frequentes
            </h2>
            <p className="text-slate-400 text-xs md:text-sm">
              Tudo o que você precisa saber sobre a fase Beta do Finanza.
            </p>
          </div>

          <div className="space-y-4">
            <FaqCard 
              question="O Finanza é 100% gratuito durante a fase Beta?"
              answer="Sim! Todos os usuários convidados na fase Beta têm acesso gratuito completo às funcionalidades do sistema."
            />
            <FaqCard 
              question="Preciso cadastrar cartão de crédito para solicitar o acesso?"
              answer="Não. Nenhuma informação bancária ou cartão de crédito é exigido na solicitação de acesso."
            />
            <FaqCard 
              question="Como é garantida a segurança das minhas informações financeiras?"
              answer="Utilizamos infraestrutura criptografada em nuvem do Google Firestore e Firebase Auth com rígida conformidade à LGPD. Seus dados são estritamente confidenciais e protegidos."
            />
            <FaqCard 
              question="Quanto tempo leva para meu convite ser aprovado?"
              answer="Como fazemos a liberação manual para acompanhar cada usuário de perto, o prazo médio de aprovação varia entre algumas horas e 24 horas."
            />
          </div>
        </div>
      </section>

      {/* 7. CHAMADA FINAL */}
      <section className="py-24 px-6 relative">
        <div className="max-w-5xl mx-auto bg-gradient-to-b from-card-bg to-slate-950 border border-card-border p-10 md:p-16 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-green/10 blur-3xl rounded-full pointer-events-none" />

          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-accent-green bg-accent-green/10 px-4 py-1.5 rounded-full border border-accent-green/20 mb-6 inline-block">
            Transformação Diária
          </span>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto leading-tight">
            A prosperidade começa com pequenas decisões diárias.
          </h2>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Desenvolva clareza, organização e disciplina contínua para acelerar sua construção patrimonial.
          </p>

          <Button 
            size="lg" 
            onClick={() => setMode('beta')}
            className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-10 h-14 rounded-xl text-base transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.2)] inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Quero participar do Beta</span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* 8. RODAPÉ */}
      <footer className="py-16 px-6 border-t border-card-border/50 bg-slate-950/80 text-slate-400">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Main Footer Nav Links */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-card-border/40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-green" />
              <span className="text-lg font-bold text-slate-100 tracking-tight">FINANZA</span>
              <span className="text-[10px] text-accent-green font-bold uppercase px-2 py-0.5 bg-accent-green/10 rounded-full border border-accent-green/20">
                Versão Beta
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold">
              <button onClick={() => setIsAboutOpen(true)} className="hover:text-accent-green transition-colors">
                Sobre
              </button>
              <button onClick={() => setIsPrivacyOpen(true)} className="hover:text-accent-green transition-colors">
                Política de Privacidade
              </button>
              <button onClick={() => setIsTermsOpen(true)} className="hover:text-accent-green transition-colors">
                Termos de Uso
              </button>
              <a 
                href="https://wa.me/5551989232128?text=Olá,%20gostaria%20de%20tirar%20uma%20dúvida%20sobre%20o%20Finanza" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-accent-green transition-colors"
              >
                Contato
              </a>
            </div>
          </div>

          {/* Security & Trust Badges (Estritamente Mantidos) */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-card-border/50 px-4 py-2.5 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-accent-green shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider leading-none mb-0.5">Conformidade LGPD</p>
                <p className="text-[9px] text-slate-500 font-semibold leading-none">Dados 100% Protegidos</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-card-border/50 px-4 py-2.5 rounded-xl">
              <Lock className="w-5 h-5 text-accent-green shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider leading-none mb-0.5">SSL Criptografado</p>
                <p className="text-[9px] text-slate-500 font-semibold leading-none">Conexão 100% Segura</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-card-border/50 px-4 py-2.5 rounded-xl">
              <Database className="w-5 h-5 text-accent-green shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider leading-none mb-0.5">Firebase Cloud</p>
                <p className="text-[9px] text-slate-500 font-semibold leading-none">Banco Google Firestore</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-900/60 border border-card-border/50 px-4 py-2.5 rounded-xl">
              <Award className="w-5 h-5 text-accent-green shrink-0" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-200 uppercase tracking-wider leading-none mb-0.5">Google Trust</p>
                <p className="text-[9px] text-slate-500 font-semibold leading-none">Certificado de Autoridade</p>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              © 2026 Finanza. Todos os direitos reservados.
            </p>
            <p className="text-[10px] text-slate-600">
              Desenvolvido com foco em disciplina, clareza e evolução patrimonial diária.
            </p>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
      <TermsOfUseModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}

function PillarCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card-bg border border-card-border p-6 rounded-2xl hover:border-accent-green/50 transition-all flex flex-col justify-between group">
      <div>
        <div className="w-12 h-12 bg-slate-900 border border-card-border rounded-xl flex items-center justify-center mb-5 group-hover:border-accent-green/50 transition-colors">
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2 text-slate-100">{title}</h3>
        <p className="text-slate-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function FeatureCheck({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 bg-slate-900/40 p-3.5 rounded-xl border border-card-border/60">
      <CheckCircle2 className="w-5 h-5 text-accent-green shrink-0" />
      <span className="text-xs md:text-sm font-semibold text-slate-200">{text}</span>
    </div>
  );
}

function TimelineStep({ number, badge, title, desc }: { number: string; badge?: string; title: string; desc: string }) {
  return (
    <div className="bg-card-bg border border-card-border p-6 rounded-2xl relative text-center flex flex-col items-center hover:border-accent-green/40 transition-colors">
      {badge && (
        <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wider text-accent-green bg-accent-green/10 border border-accent-green/20 px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="w-8 h-8 rounded-full bg-accent-green/10 border border-accent-green/30 text-accent-green font-bold text-xs flex items-center justify-center mb-4">
        {number}
      </div>
      <h4 className="font-bold text-slate-100 text-sm mb-1">{title}</h4>
      <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
    </div>
  );
}

function FaqCard({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)} 
      className="bg-card-bg border border-card-border rounded-2xl p-5 cursor-pointer hover:border-accent-green/40 transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <h4 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2">
          <ChevronRight className={`w-4 h-4 text-accent-green transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
          {question}
        </h4>
        <span className="text-slate-500 text-xs font-mono">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <p className="mt-3 text-xs md:text-sm text-slate-400 leading-relaxed pl-6 border-l-2 border-accent-green/30">
          {answer}
        </p>
      )}
    </div>
  );
}
