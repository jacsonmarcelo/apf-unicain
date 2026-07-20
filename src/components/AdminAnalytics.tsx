import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity, 
  CalendarDays, 
  Settings2, 
  AlertOctagon, 
  Percent, 
  TrendingUp, 
  Loader2, 
  RefreshCw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line
} from 'recharts';

interface UserMetric {
  userId: string;
  date: string;
  launchesCount: number;
  dashboardOpened: boolean;
  reportsOpened: boolean;
  activeToday: boolean;
  lastActivity: any;
}

interface ErrorLog {
  id: string;
  timestamp: string;
  screen: string;
  error: string;
  operationType?: string;
  path?: string;
  filename?: string;
  lineno?: number;
}

export function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Indicators State
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeToday, setActiveToday] = useState(0);
  const [active7Days, setActive7Days] = useState(0);
  const [active30Days, setActive30Days] = useState(0);
  const [avgLaunches, setAvgLaunches] = useState(0);
  const [firstLaunchPct, setFirstLaunchPct] = useState(0);
  const [annualReportPct, setAnnualReportPct] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  // Graphical & Logs State
  const [chartData, setChartData] = useState<any[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);

  const getLocalDateString = (): string => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDatesInRange = (days: number): string[] => {
    const dates: string[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${year}-${month}-${day}`);
    }
    return dates;
  };

  const loadAnalyticsData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch Users List
      const usersSnap = await getDocs(collection(db, 'users'));
      const rawUsers = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];

      // Group by lowercase email to get correct unique user count
      const uniqueUsersMap: Record<string, any> = {};
      rawUsers.forEach(u => {
        const emailKey = u.email?.toLowerCase().trim();
        if (!emailKey) return;
        const isUid = u.id !== emailKey; // Prefer UID-based records
        if (!uniqueUsersMap[emailKey] || isUid) {
          uniqueUsersMap[emailKey] = u;
        }
      });
      const uniqueUsersCount = Object.keys(uniqueUsersMap).length;
      setTotalUsers(uniqueUsersCount);

      // 2. Fetch User Metrics
      const metricsSnap = await getDocs(collection(db, 'user_metrics'));
      const metricsList = metricsSnap.docs.map(doc => doc.data()) as UserMetric[];

      // Calculations for Active Users
      const todayStr = getLocalDateString();
      const last7DaysList = getDatesInRange(7);
      const last30DaysList = getDatesInRange(30);

      const activeTodayUserIds = new Set(
        metricsList
          .filter(m => m.date === todayStr && m.activeToday)
          .map(m => m.userId)
      );
      setActiveToday(activeTodayUserIds.size);

      const active7DaysUserIds = new Set(
        metricsList
          .filter(m => last7DaysList.includes(m.date) && m.activeToday)
          .map(m => m.userId)
      );
      setActive7Days(active7DaysUserIds.size);

      const active30DaysUserIds = new Set(
        metricsList
          .filter(m => last30DaysList.includes(m.date) && m.activeToday)
          .map(m => m.userId)
      );
      setActive30Days(active30DaysUserIds.size);

      // Average Launches
      const totalLaunches = metricsList.reduce((sum, m) => sum + (m.launchesCount || 0), 0);
      const calculatedAvgLaunches = uniqueUsersCount > 0 ? totalLaunches / uniqueUsersCount : 0;
      setAvgLaunches(calculatedAvgLaunches);

      // 3. Query specific event logs from analytics_events
      // Query first launch events (first_income_created, first_expense_created)
      const firstLaunchEventsSnap = await getDocs(
        query(
          collection(db, 'analytics_events'),
          where('eventName', 'in', ['first_income_created', 'first_expense_created'])
        )
      );
      const uniqueFirstLaunchUserIds = new Set(firstLaunchEventsSnap.docs.map(doc => doc.data().userId));
      const calculatedFirstLaunchPct = uniqueUsersCount > 0
        ? (uniqueFirstLaunchUserIds.size / uniqueUsersCount) * 100
        : 0;
      setFirstLaunchPct(calculatedFirstLaunchPct);

      // Query annual summary opened events
      const annualReportEventsSnap = await getDocs(
        query(
          collection(db, 'analytics_events'),
          where('eventName', '==', 'annual_report_opened')
        )
      );
      const uniqueAnnualReportUserIds = new Set(annualReportEventsSnap.docs.map(doc => doc.data().userId));
      const calculatedAnnualReportPct = uniqueUsersCount > 0
        ? (uniqueAnnualReportUserIds.size / uniqueUsersCount) * 100
        : 0;
      setAnnualReportPct(calculatedAnnualReportPct);

      // Query app errors
      const errorsEventsSnap = await getDocs(
        query(
          collection(db, 'analytics_events'),
          where('eventName', '==', 'app_error')
        )
      );
      setTotalErrors(errorsEventsSnap.size);

      // Format Error Logs
      const formattedErrors = errorsEventsSnap.docs.map(doc => {
        const data = doc.data();
        let timeStr = '-';
        if (data.timestamp) {
          if (typeof data.timestamp.toDate === 'function') {
            timeStr = data.timestamp.toDate().toLocaleString('pt-BR');
          } else {
            timeStr = new Date(data.timestamp).toLocaleString('pt-BR');
          }
        }
        return {
          id: doc.id,
          timestamp: timeStr,
          screen: data.screen || 'unknown',
          error: data.metadata?.error || 'Erro não especificado',
          operationType: data.metadata?.operationType,
          path: data.metadata?.path,
          filename: data.metadata?.filename,
          lineno: data.metadata?.lineno
        };
      }).sort((a, b) => b.timestamp.localeCompare(a.timestamp)); // Sort descending (latest first)
      setErrorLogs(formattedErrors.slice(0, 10)); // Keep latest 10 errors for performance

      // 4. Generate Graph Data for the last 7 days
      const formattedChartData = last7DaysList.map(dateStr => {
        const dayMetrics = metricsList.filter(m => m.date === dateStr);
        const dayActiveUsers = new Set(dayMetrics.filter(m => m.activeToday).map(m => m.userId)).size;
        const dayLaunches = dayMetrics.reduce((sum, m) => sum + (m.launchesCount || 0), 0);

        const [, month, day] = dateStr.split('-');
        return {
          date: `${day}/${month}`,
          usuariosAtivos: dayActiveUsers,
          lancamentos: dayLaunches
        };
      }).reverse(); // Chronological order (oldest to newest)
      setChartData(formattedChartData);

    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="w-8 h-8 text-accent-green animate-spin" />
        <p className="text-xs uppercase tracking-widest text-label font-bold">Carregando métricas do sistema...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-900/10 p-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Acompanhe estatísticas consolidadas de uso e saúde da plataforma em tempo real.</p>
        </div>
        <Button 
          variant="outline" 
          disabled={refreshing} 
          onClick={() => loadAnalyticsData(true)}
          className="bg-card-bg border-card-border hover:bg-slate-800 text-slate-300 rounded-xl h-10 px-4 self-start md:self-auto flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Dados'}
        </Button>
      </div>

      {/* Grid Row 1: Core User Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden relative">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Total de Usuários</span>
              <div className="bg-accent-green/10 p-2 rounded-xl">
                <Users className="w-4 h-4 text-accent-green" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">
              {totalUsers}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Contas únicas e pré-cadastros</p>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Ativos Hoje (DAU)</span>
              <div className="bg-accent-green/10 p-2 rounded-xl">
                <Activity className="w-4 h-4 text-accent-green" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1 flex items-baseline gap-2">
              {activeToday}
              {totalUsers > 0 && (
                <span className="text-xs font-bold text-accent-green">
                  ({((activeToday / totalUsers) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Acessaram o sistema nas últimas 24h</p>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Ativos 7 Dias (WAU)</span>
              <div className="bg-accent-green/10 p-2 rounded-xl">
                <CalendarDays className="w-4 h-4 text-accent-green" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1 flex items-baseline gap-2">
              {active7Days}
              {totalUsers > 0 && (
                <span className="text-xs font-bold text-accent-green">
                  ({((active7Days / totalUsers) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Acessaram nos últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Ativos 30 Dias (MAU)</span>
              <div className="bg-accent-green/10 p-2 rounded-xl">
                <TrendingUp className="w-4 h-4 text-accent-green" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1 flex items-baseline gap-2">
              {active30Days}
              {totalUsers > 0 && (
                <span className="text-xs font-bold text-accent-green">
                  ({((active30Days / totalUsers) * 100).toFixed(0)}%)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Acessaram nos últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 2: Performance and Error indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Média de Lançamentos</span>
              <div className="bg-[#3b82f6]/10 p-2 rounded-xl">
                <PlusCircle className="w-4 h-4 text-[#3b82f6]" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">
              {avgLaunches.toFixed(1)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Lançamentos por usuário cadastrado</p>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Conversão 1º Lançamento</span>
              <div className="bg-[#8b5cf6]/10 p-2 rounded-xl">
                <Percent className="w-4 h-4 text-[#8b5cf6]" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">
              {firstLaunchPct.toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Criaram pelo menos 1 lançamento</p>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Adesão ao Relatório Anual</span>
              <div className="bg-[#eab308]/10 p-2 rounded-xl">
                <Settings2 className="w-4 h-4 text-[#eab308]" />
              </div>
            </div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">
              {annualReportPct.toFixed(1)}%
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Acessaram a Visão Anual</p>
          </CardContent>
        </Card>

        <Card className="bg-card-bg border-card-border shadow-2xl rounded-2xl overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-label">Erros do Aplicativo</span>
              <div className={totalErrors > 0 ? "bg-accent-rose/10 p-2 rounded-xl" : "bg-accent-green/10 p-2 rounded-xl"}>
                <AlertOctagon className={`w-4 h-4 ${totalErrors > 0 ? 'text-accent-rose' : 'text-accent-green'}`} />
              </div>
            </div>
            <div className={`text-3xl font-bold tracking-tight mb-1 ${totalErrors > 0 ? 'text-accent-rose' : 'text-white'}`}>
              {totalErrors}
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Exceções de runtime registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 3: Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Graph 1: DAU Line Chart */}
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Atividade Diária (DAU)</h3>
              <p className="text-xs text-slate-500 mt-1">Evolução de usuários ativos nos últimos 7 dias</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="usuariosAtivos" 
                  name="Usuários Ativos"
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Graph 2: Launches Bar Chart */}
        <Card className="bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Novos Lançamentos Diários</h3>
              <p className="text-xs text-slate-500 mt-1">Volume de transações inseridas nos últimos 7 dias</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                />
                <Bar 
                  dataKey="lancamentos" 
                  name="Lançamentos"
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Grid Row 4: Error Diagnostic Log */}
      <Card className="bg-card-bg border-card-border shadow-2xl rounded-[2rem] overflow-hidden">
        <div className="p-6 border-b border-card-border flex items-center justify-between bg-slate-900/20">
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-200">Log de Erros e Diagnósticos</h3>
            <p className="text-xs text-slate-500 mt-1">Últimos erros de tempo de execução reportados automaticamente</p>
          </div>
          <Badge className={totalErrors > 0 ? "bg-accent-rose/10 text-accent-rose border-accent-rose/20" : "bg-accent-green/10 text-accent-green border-accent-green/20"}>
            {totalErrors > 0 ? `${totalErrors} incidentes` : 'Sistema Estável'}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-900/40">
              <TableRow className="border-card-border hover:bg-transparent">
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pl-8 py-4">Data/Hora</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Tela/Componente</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Detalhes do Erro</TableHead>
                <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pr-8 py-4 text-right">Contexto adicional</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {errorLogs.map((log) => (
                <TableRow key={log.id} className="border-card-border/50 hover:bg-slate-800/10 transition-colors">
                  <TableCell className="pl-8 py-4 text-xs font-mono text-slate-400">
                    {log.timestamp}
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant="outline" className="text-xs uppercase bg-slate-900 border-card-border">
                      {log.screen}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-xs font-medium text-slate-200 max-w-md truncate" title={log.error}>
                    {log.error}
                  </TableCell>
                  <TableCell className="pr-8 py-4 text-xs text-right text-slate-500 font-mono">
                    {log.path ? `path: ${log.path}` : log.filename ? `${log.filename}:${log.lineno}` : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
              {errorLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-label text-[11px] italic uppercase tracking-[0.2em] opacity-40">
                    Nenhum erro registrado. Tudo funcionando perfeitamente!
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
