import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Star, 
  Send, 
  Loader2, 
  CheckCircle2, 
  MessageSquare, 
  History, 
  TrendingUp, 
  Smile,
  AlertTriangle,
  HelpCircle,
  ThumbsUp
} from 'lucide-react';

interface FeedbackHistoryItem {
  id: string;
  createdAt: any;
  rating: number;
  nps: number;
  mostUseful: string[];
  difficulty: string;
  suggestion: string;
}

const MOST_USEFUL_OPTIONS = [
  { id: 'lancamentos', label: 'Lançamentos de Despesas/Receitas' },
  { id: 'metas', label: 'Controle de Metas de Gastos' },
  { id: 'visao_anual', label: 'Visualização Anual Consolidada' },
  { id: 'recorrentes', label: 'Transações Recorrentes Mensais' },
  { id: 'diagnostico', label: 'Métricas de Saúde Financeira' }
];

export function AllyFeedback() {
  const { user } = useAuth();
  
  // Form State
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [mostUseful, setMostUseful] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [suggestion, setSuggestion] = useState<string>('');
  const [nps, setNps] = useState<number>(10);
  
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // History State
  const [history, setHistory] = useState<FeedbackHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchFeedbackHistory = async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'feedbacks'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FeedbackHistoryItem[];
      setHistory(items);
    } catch (error) {
      console.error('Error fetching feedback history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchFeedbackHistory();
  }, [user]);

  const handleToggleMostUseful = (id: string) => {
    if (mostUseful.includes(id)) {
      setMostUseful(mostUseful.filter(item => item !== id));
    } else {
      setMostUseful([...mostUseful, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;

    if (mostUseful.length === 0) {
      setErrorMessage('Por favor, selecione pelo menos um recurso que foi mais útil para você.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const feedbackData = {
        userId: user.uid,
        createdAt: serverTimestamp(),
        rating,
        nps,
        mostUseful,
        difficulty: difficulty.trim() || 'Nenhuma dificuldade informada',
        suggestion: suggestion.trim() || 'Nenhuma sugestão informada'
      };

      await addDoc(collection(db, 'feedbacks'), feedbackData);
      
      setSubmitSuccess(true);
      
      // Reset form
      setRating(5);
      setMostUseful([]);
      setDifficulty('');
      setSuggestion('');
      setNps(10);
      
      // Refresh history log
      await fetchFeedbackHistory();

      // Clear success banner after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error saving feedback:', error);
      setErrorMessage('Ocorreu um erro ao enviar seu feedback. Por favor, tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="bg-slate-900/10 p-1">
        <h1 className="text-3xl font-bold tracking-tight">Contribuições dos Aliados</h1>
        <p className="text-slate-400 text-sm mt-1">Sua voz ajuda a moldar a evolução do Finanza. Envie suas percepções e sugestões!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Feedback Form */}
        <div className="lg:col-span-7">
          <Card className="bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-card-border bg-slate-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-accent-green" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Enviar Novo Feedback</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Preencha o formulário rápido de contribuição</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {submitSuccess && (
                <div className="mb-6 p-4 rounded-xl bg-accent-green/10 border border-accent-green/20 text-accent-green flex items-start gap-3 text-sm font-medium animate-in fade-in duration-300">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold">Feedback enviado com sucesso!</span>
                    <p className="text-xs text-slate-400 mt-0.5">Obrigado pela sua contribuição preciosa. Ela foi registrada em nosso histórico.</p>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose flex items-start gap-3 text-sm font-medium animate-in fade-in duration-300">
                  <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Rating Stars */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-200 block">
                    1. Avaliação geral da experiência <span className="text-accent-rose">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-8 h-8 cursor-pointer transition-colors ${
                            star <= (hoverRating ?? rating)
                              ? 'fill-accent-amber text-accent-amber'
                              : 'text-slate-600 hover:text-slate-500'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs text-slate-500 ml-2 font-mono">
                      ({rating} de 5 estrelas)
                    </span>
                  </div>
                </div>

                {/* 2. Most Useful Checklist */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-200 block">
                    2. O que foi mais útil para você até agora? <span className="text-accent-rose">*</span>
                  </Label>
                  <p className="text-xs text-slate-500 mb-2">Selecione uma ou mais funcionalidades que agregaram mais valor.</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {MOST_USEFUL_OPTIONS.map((opt) => {
                      const isSelected = mostUseful.includes(opt.id);
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleToggleMostUseful(opt.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? 'bg-accent-green/5 border-accent-green/30 text-white font-medium'
                              : 'bg-slate-900/30 border-card-border hover:bg-slate-900/50 text-slate-300'
                          }`}
                        >
                          <span className="text-xs">{opt.label}</span>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                            isSelected ? 'bg-accent-green border-accent-green text-slate-950' : 'border-slate-600'
                          }`}>
                            {isSelected && <span className="text-[10px] font-bold">✓</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Difficulties */}
                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-sm font-semibold text-slate-200 block">
                    3. Encontrou alguma dificuldade ou barreira no uso?
                  </Label>
                  <p className="text-xs text-slate-500">Ex: bugs, lentidão, botões confusos ou termos difíceis.</p>
                  <Input
                    id="difficulty"
                    placeholder="Ex: Tive dúvidas sobre como cadastrar metas de gastos"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    maxLength={1000}
                    className="bg-slate-950 border-card-border focus:border-accent-green/50 rounded-xl h-11 text-xs"
                  />
                </div>

                {/* 4. Suggestion */}
                <div className="space-y-2">
                  <Label htmlFor="suggestion" className="text-sm font-semibold text-slate-200 block">
                    4. Se você pudesse melhorar apenas uma coisa no Finanza, qual seria?
                  </Label>
                  <p className="text-xs text-slate-500">Sua melhor ideia de melhoria ou nova funcionalidade.</p>
                  <textarea
                    id="suggestion"
                    placeholder="Ex: Eu adicionaria um recurso para gerar relatórios detalhados em PDF ou gráficos extras..."
                    value={suggestion}
                    onChange={(e) => setSuggestion(e.target.value)}
                    maxLength={5000}
                    rows={4}
                    className="bg-slate-950 border-card-border focus:border-accent-green/50 rounded-xl text-xs resize-none p-3 w-full text-slate-100"
                  />
                </div>

                {/* 5. NPS Score */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-200 block">
                    5. Em uma escala de 0 a 10, quanto você recomendaria o Finanza para outro aliado?
                  </Label>
                  <p className="text-xs text-slate-500">Onde 0 é "Jamais recomendaria" e 10 é "Com certeza recomendaria".</p>
                  
                  <div className="flex flex-wrap justify-between gap-1.5 p-2 bg-slate-950 rounded-2xl border border-card-border">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = nps === num;
                      let numColor = 'hover:bg-slate-800 text-slate-400';
                      if (isSelected) {
                        if (num >= 9) numColor = 'bg-accent-green text-slate-950 font-bold';
                        else if (num >= 7) numColor = 'bg-accent-amber text-slate-950 font-bold';
                        else numColor = 'bg-accent-rose text-slate-950 font-bold';
                      }
                      return (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setNps(num)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer text-xs ${numColor}`}
                        >
                          {num}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1 uppercase tracking-wider">
                    <span>Detratores (0-6)</span>
                    <span>Neutros (7-8)</span>
                    <span>Promotores (9-10)</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-accent-green hover:bg-accent-green-hover text-slate-950 font-bold h-12 rounded-xl transition-all shadow-lg shadow-accent-green/10 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando contribuição...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Contribuição
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Feedback History Log */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden">
            <CardHeader className="p-8 border-b border-card-border bg-slate-900/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-amber/10 rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5 text-accent-amber" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">Seu Histórico</CardTitle>
                  <CardDescription className="text-slate-400 text-xs">Suas contribuições anteriores enviadas</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 max-h-[700px] overflow-y-auto space-y-6">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-accent-amber" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Carregando histórico...</span>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <Smile className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-400">Nenhum feedback enviado ainda.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Sua primeira contribuição aparecerá aqui.</p>
                </div>
              ) : (
                history.map((item) => {
                  let dateLabel = '-';
                  if (item.createdAt) {
                    if (typeof item.createdAt.toDate === 'function') {
                      dateLabel = item.createdAt.toDate().toLocaleDateString('pt-BR');
                    } else {
                      dateLabel = new Date(item.createdAt).toLocaleDateString('pt-BR');
                    }
                  }

                  return (
                    <div key={item.id} className="p-5 rounded-2xl bg-slate-900/40 border border-card-border space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono text-slate-500">{dateLabel}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-accent-amber">{item.rating}</span>
                          <Star className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NPS Recomendação:</span>
                          <span className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                            item.nps >= 9 ? 'bg-accent-green/20 text-accent-green' : item.nps >= 7 ? 'bg-accent-amber/20 text-accent-amber' : 'bg-accent-rose/20 text-accent-rose'
                          }`}>
                            {item.nps}/10
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Útil:</span>
                          <div className="flex flex-wrap gap-1">
                            {item.mostUseful?.map(uid => {
                              const label = MOST_USEFUL_OPTIONS.find(o => o.id === uid)?.label || uid;
                              return (
                                <span key={uid} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-card-border text-slate-300">
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {item.difficulty && item.difficulty !== 'Nenhuma dificuldade informada' && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dificuldade:</span>
                            <p className="text-xs text-slate-300 italic">"{item.difficulty}"</p>
                          </div>
                        )}

                        {item.suggestion && item.suggestion !== 'Nenhuma sugestão informada' && (
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Melhoria sugerida:</span>
                            <p className="text-xs text-slate-200">"{item.suggestion}"</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
