import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Star, 
  MessageSquare, 
  TrendingUp, 
  Smile, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  Search, 
  Award,
  Flame,
  ThumbsUp,
  User,
  Lightbulb
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdminFeedbackItem {
  id: string;
  userId: string;
  createdAt: any;
  rating: number;
  nps: number;
  mostUseful: string[];
  difficulty: string;
  suggestion: string;
  userEmail?: string;
  userDisplayName?: string;
}

const MOST_USEFUL_LABELS: Record<string, string> = {
  'lancamentos': 'Lançamentos de Transações',
  'metas': 'Controle de Metas',
  'visao_anual': 'Visão Anual Consolidada',
  'recorrentes': 'Transações Recorrentes',
  'diagnostico': 'Indicadores Financeiros'
};

export function AdminFeedback() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [feedbacks, setFeedbacks] = useState<AdminFeedbackItem[]>([]);
  
  // Computed metrics
  const [avgRating, setAvgRating] = useState(0);
  const [avgNps, setAvgNps] = useState(0);
  const [npsScore, setNpsScore] = useState(0); // Official NPS Index (-100 to 100)
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);

  const loadFeedbacksData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Users to Map IDs to Name and Email
      const usersSnap = await getDocs(collection(db, 'users'));
      const usersMap: Record<string, { email: string; displayName: string }> = {};
      usersSnap.docs.forEach(doc => {
        const data = doc.data();
        usersMap[doc.id] = {
          email: data.email || '',
          displayName: data.displayName || 'Usuário Sem Nome'
        };
      });

      // 2. Fetch Feedbacks
      const feedbacksSnap = await getDocs(
        query(collection(db, 'feedbacks'), orderBy('createdAt', 'desc'))
      );
      
      const items = feedbacksSnap.docs.map(docDoc => {
        const data = docDoc.data();
        const userId = data.userId || '';
        
        // Find mapped user info or look up legacy keys
        let userEmail = '';
        let userDisplayName = 'Convidado';

        if (usersMap[userId]) {
          userEmail = usersMap[userId].email;
          userDisplayName = usersMap[userId].displayName;
        } else {
          // Fallback search in keys
          const matchingUser = Object.values(usersMap).find(u => u.email.toLowerCase() === userId.toLowerCase());
          if (matchingUser) {
            userEmail = matchingUser.email;
            userDisplayName = matchingUser.displayName;
          }
        }

        return {
          id: docDoc.id,
          userId,
          rating: data.rating || 5,
          nps: data.nps ?? 10,
          mostUseful: data.mostUseful || [],
          difficulty: data.difficulty || '',
          suggestion: data.suggestion || '',
          createdAt: data.createdAt,
          userEmail,
          userDisplayName
        };
      }) as AdminFeedbackItem[];

      setFeedbacks(items);
      setTotalFeedbacks(items.length);

      if (items.length > 0) {
        // Average Rating
        const sumRating = items.reduce((sum, item) => sum + item.rating, 0);
        setAvgRating(sumRating / items.length);

        // Average NPS
        const sumNps = items.reduce((sum, item) => sum + item.nps, 0);
        setAvgNps(sumNps / items.length);

        // Official NPS Index calculation (% Promoters - % Detractors)
        // Promoters: 9-10, Passives: 7-8, Detractors: 0-6
        const promotersCount = items.filter(i => i.nps >= 9).length;
        const detractorsCount = items.filter(i => i.nps <= 6).length;
        const promotersPct = (promotersCount / items.length) * 100;
        const detractorsPct = (detractorsCount / items.length) * 100;
        setNpsScore(promotersPct - detractorsPct);

        // Rank Most Useful Features
        const counts: Record<string, number> = {};
        Object.keys(MOST_USEFUL_LABELS).forEach(k => { counts[k] = 0; });

        items.forEach(item => {
          if (Array.isArray(item.mostUseful)) {
            item.mostUseful.forEach(featureId => {
              counts[featureId] = (counts[featureId] || 0) + 1;
            });
          }
        });

        const formattedRanking = Object.entries(counts).map(([id, count]) => ({
          name: MOST_USEFUL_LABELS[id] || id,
          votos: count
        })).sort((a, b) => b.votos - a.votos);

        setRankingData(formattedRanking);
      } else {
        setAvgRating(0);
        setAvgNps(0);
        setNpsScore(0);
        setRankingData([]);
      }

    } catch (err) {
      console.error('Error fetching admin feedbacks:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadFeedbacksData();
  }, []);

  const filteredFeedbacks = feedbacks.filter(item => 
    item.userDisplayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.suggestion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.difficulty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
        <p className="text-xs uppercase tracking-widest text-label font-bold">Carregando contribuições...</p>
      </div>
    );
  }

  // Get highlights / most frequent suggestions (limit to non-empty suggestions)
  const suggestionsWithContent = feedbacks.filter(f => f.suggestion && f.suggestion !== 'Nenhuma sugestão informada').slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900/10 p-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contribuições dos Aliados</h1>
          <p className="text-slate-400 text-sm mt-1">Veja o que os aliados dizem, suas dores e suas melhores sugestões para o produto.</p>
        </div>
        <Button 
          variant="outline" 
          disabled={refreshing} 
          onClick={() => loadFeedbacksData(true)}
          className="bg-card-bg border-card-border hover:bg-slate-800 text-slate-300 rounded-xl h-10 px-4 self-start md:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* Row 1: Core Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Feedbacks */}
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Contribuições</span>
              <div className="bg-accent-green/10 p-2 rounded-xl">
                <MessageSquare className="w-4 h-4 text-accent-green" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">
              {totalFeedbacks}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Feedbacks totais recebidos</p>
          </CardContent>
        </Card>

        {/* Card 2: Average Rating */}
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Nota Média</span>
              <div className="bg-accent-amber/10 p-2 rounded-xl">
                <Star className="w-4 h-4 text-accent-amber fill-accent-amber" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1 flex items-baseline gap-2">
              {avgRating.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
            </div>
            <div className="flex gap-0.5 text-accent-amber mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 ${i < Math.round(avgRating) ? 'fill-accent-amber text-accent-amber' : 'text-slate-700'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pure NPS Average */}
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Média de Recomendação</span>
              <div className="bg-blue-500/10 p-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">
              {avgNps.toFixed(1)} <span className="text-xs text-slate-400 font-normal">/ 10</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Média simples da nota de indicação</p>
          </CardContent>
        </Card>

        {/* Card 4: Formal NPS Index */}
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Zona NPS (Index)</span>
              <div className="bg-purple-500/10 p-2 rounded-xl">
                <Award className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            <div className={`text-3xl font-bold tracking-tight mb-1 ${
              npsScore >= 75 ? 'text-accent-green' : npsScore >= 50 ? 'text-accent-amber' : 'text-accent-rose'
            }`}>
              {npsScore > 0 ? `+${npsScore.toFixed(0)}` : npsScore.toFixed(0)}
            </div>
            <Badge variant="outline" className={`text-[10px] font-bold uppercase ${
              npsScore >= 75 ? 'border-accent-green/30 text-accent-green bg-accent-green/5' : 
              npsScore >= 50 ? 'border-accent-amber/30 text-accent-amber bg-accent-amber/5' : 
              'border-accent-rose/30 text-accent-rose bg-accent-rose/5'
            }`}>
              {npsScore >= 75 ? 'Excelente / Encantamento' : npsScore >= 50 ? 'Qualidade' : 'Aperfeiçoamento'}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Graph Ranking & Most Frequent Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recharts Bar Chart of Useful Features */}
        <Card className="lg:col-span-7 bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Ranking de Funcionalidades</h3>
              <p className="text-xs text-slate-500 mt-1">Quais ferramentas agregaram mais valor para os aliados</p>
            </div>
          </div>
          
          <div className="h-64 w-full">
            {rankingData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
                Aguardando primeiros feedbacks para renderizar ranking...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" stroke="#94a3b8" fontSize={10} width={130} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }} 
                    labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                  />
                  <Bar 
                    dataKey="votos" 
                    name="Indicações" 
                    fill="#10b981" 
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Right: Selected Suggestions Feed */}
        <Card className="lg:col-span-5 bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden">
          <div className="p-6 border-b border-card-border flex items-center gap-3 bg-slate-900/10">
            <div className="w-10 h-10 bg-[#8b5cf6]/10 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-[#8b5cf6]" />
            </div>
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Idéias & Melhorias</h3>
              <p className="text-xs text-slate-500 mt-1">Últimas sugestões dos aliados para o sistema</p>
            </div>
          </div>
          <CardContent className="p-6 max-h-64 overflow-y-auto space-y-4">
            {suggestionsWithContent.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs italic uppercase tracking-wider">
                Nenhuma sugestão registrada
              </div>
            ) : (
              suggestionsWithContent.map((item) => (
                <div key={item.id} className="p-4 rounded-xl bg-slate-950/40 border border-card-border space-y-1">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                    <span>{item.userDisplayName}</span>
                    <span>NPS {item.nps}/10</span>
                  </div>
                  <p className="text-xs text-slate-200 font-medium">"{item.suggestion}"</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Complete Feedbacks Table */}
      <Card className="bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-card-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-900/10">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Tabela de Feedbacks Completos</h3>
            <p className="text-xs text-slate-500 mt-1">Inspeção detalhada de cada contribuição enviada</p>
          </div>
          
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Buscar por aliado, e-mail ou sugestão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 border-card-border rounded-xl pl-10 pr-4 h-10 text-xs w-full focus:border-accent-green/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/30">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pl-8 py-4">Aliado / Data</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Avaliação</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Recomendação</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Dificuldade</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pr-8 py-4">Sugeriu melhorar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedbacks.map((item) => {
                let dateLabel = '-';
                if (item.createdAt) {
                  if (typeof item.createdAt.toDate === 'function') {
                    dateLabel = item.createdAt.toDate().toLocaleDateString('pt-BR');
                  } else {
                    dateLabel = new Date(item.createdAt).toLocaleDateString('pt-BR');
                  }
                }

                return (
                  <TableRow key={item.id} className="border-card-border/50 hover:bg-slate-800/10 transition-colors">
                    {/* User profile info */}
                    <TableCell className="pl-8 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-slate-200 text-xs">{item.userDisplayName}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{item.userEmail || item.userId}</span>
                        <span className="text-[9px] text-slate-600 mt-1">{dateLabel}</span>
                      </div>
                    </TableCell>

                    {/* Rating stars score */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg w-max border border-card-border">
                        <span className="text-xs font-bold text-accent-amber">{item.rating}</span>
                        <Star className="w-3.5 h-3.5 fill-accent-amber text-accent-amber" />
                      </div>
                    </TableCell>

                    {/* NPS score */}
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`font-mono font-bold text-xs ${
                        item.nps >= 9 ? 'border-accent-green/30 text-accent-green bg-accent-green/5' : 
                        item.nps >= 7 ? 'border-accent-amber/30 text-accent-amber bg-accent-amber/5' : 
                        'border-accent-rose/30 text-accent-rose bg-accent-rose/5'
                      }`}>
                        NPS {item.nps}/10
                      </Badge>
                    </TableCell>

                    {/* Difficulty */}
                    <TableCell className="py-4 text-xs font-medium text-slate-300 max-w-xs truncate" title={item.difficulty}>
                      {item.difficulty || '-'}
                    </TableCell>

                    {/* Suggestion text */}
                    <TableCell className="pr-8 py-4 text-xs text-slate-200 max-w-sm truncate" title={item.suggestion}>
                      {item.suggestion || '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredFeedbacks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-label text-[11px] italic uppercase tracking-[0.2em] opacity-40">
                    Nenhuma contribuição encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
