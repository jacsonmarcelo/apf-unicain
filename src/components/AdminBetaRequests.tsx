import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc,
  getDoc,
  query, 
  orderBy, 
  serverTimestamp
} from 'firebase/firestore';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Search, 
  MessageSquare, 
  Phone, 
  Mail, 
  Loader2,
  Users,
  Volume2,
  VolumeX,
  Send,
  Settings,
  BellRing,
  HelpCircle
} from 'lucide-react';
import { playNotificationSound } from '@/lib/sound';
import { getTelegramConfig, saveTelegramConfig, sendTelegramNotification } from '@/lib/telegram';

export interface BetaRequest {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export function AdminBetaRequests() {
  const [requests, setRequests] = useState<BetaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Notifications State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showTelegramModal, setShowTelegramModal] = useState(false);
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramStatus, setTelegramStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [newRequestBanner, setNewRequestBanner] = useState<string | null>(null);

  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Load stored Telegram credentials
    const config = getTelegramConfig();
    setTelegramToken(config.botToken);
    setTelegramChatId(config.chatId);

    const q = query(collection(db, 'beta_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BetaRequest[];

      // Check for newly added documents after initial load
      if (!isInitialLoad.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const newReq = change.doc.data() as BetaRequest;
            
            // Trigger sound alert
            if (soundEnabled) {
              playNotificationSound();
            }

            // Show visual notification banner
            setNewRequestBanner(`🎉 Nova solicitação recebida de ${newReq.name || 'um novo candidato'}!`);
            setTimeout(() => setNewRequestBanner(null), 8000);
          }
        });
      } else {
        isInitialLoad.current = false;
      }

      setRequests(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [soundEnabled]);

  const handleSaveTelegramConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveTelegramConfig(telegramToken, telegramChatId);
    setTelegramStatus({ success: true, message: 'Configurações do Telegram salvas no navegador!' });
  };

  const handleTestTelegram = async () => {
    setTestingTelegram(true);
    setTelegramStatus(null);

    // Temp save before testing
    saveTelegramConfig(telegramToken, telegramChatId);

    const result = await sendTelegramNotification({
      name: 'Teste Admin Finanza',
      email: 'teste@finanza.app',
      phone: '(11) 99999-9999',
      motivation: 'Esta é uma mensagem de teste enviada diretamente do painel Admin do Finanza!',
    });

    setTelegramStatus(result);
    setTestingTelegram(false);
  };

  const handleApprove = async (reqItem: BetaRequest) => {
    setProcessingId(reqItem.id);
    try {
      const targetEmail = reqItem.email.toLowerCase().trim();
      const userRef = doc(db, 'users', targetEmail);

      // Check if user document already exists
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        await updateDoc(userRef, {
          isSubscribed: true
        });
      } else {
        await setDoc(userRef, {
          email: targetEmail,
          displayName: reqItem.name || 'Convidado Beta',
          isSubscribed: true,
          isAdmin: false,
          createdAt: serverTimestamp()
        });
      }

      // Update beta request status
      await updateDoc(doc(db, 'beta_requests', reqItem.id), {
        status: 'approved'
      });
    } catch (err) {
      console.error('Erro ao aprovar solicitação Beta:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reqId: string) => {
    setProcessingId(reqId);
    try {
      await updateDoc(doc(db, 'beta_requests', reqId), {
        status: 'rejected'
      });
    } catch (err) {
      console.error('Erro ao rejeitar solicitação Beta:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.motivation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="bg-card-bg rounded-[2rem] border border-card-border p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Solicitações de Acesso Beta</h2>
              <p className="text-slate-400 text-xs">
                Aprove ou rejeite os cadastros solicitados através da nova Landing Page.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sound Toggle & Test */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playNotificationSound();
              }}
              className={`text-xs h-9 rounded-xl border-card-border gap-2 font-semibold ${
                soundEnabled 
                  ? 'bg-accent-green/10 text-accent-green border-accent-green/30' 
                  : 'bg-slate-900 text-slate-400'
              }`}
              title={soundEnabled ? 'Som de notificação ativado' : 'Som desativado'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-accent-green" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              <span>{soundEnabled ? 'Alerta Sonoro On' : 'Alerta Sonoro Off'}</span>
            </Button>

            {soundEnabled && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => playNotificationSound()}
                className="text-[11px] h-9 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl px-2.5"
                title="Testar efeito sonoro"
              >
                🔊 Testar Som
              </Button>
            )}

            {/* Telegram Config Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTelegramModal(true)}
              className="text-xs h-9 rounded-xl border-card-border bg-slate-900 hover:bg-slate-800 text-slate-200 gap-2 font-semibold"
            >
              <Send className="w-4 h-4 text-sky-400" />
              <span>Configurar Telegram</span>
              {telegramToken && telegramChatId && (
                <span className="w-2 h-2 rounded-full bg-accent-green" title="Telegram Ativo" />
              )}
            </Button>

            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 text-xs">
              {pendingCount} Pendente{pendingCount !== 1 ? 's' : ''}
            </Badge>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Buscar solicitação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-slate-950 border-card-border focus:border-accent-green/50 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Live Registration Alert Banner */}
        {newRequestBanner && (
          <div className="mb-6 p-4 rounded-xl bg-accent-green/10 border border-accent-green/30 text-accent-green text-sm font-bold flex items-center justify-between animate-bounce">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 animate-pulse" />
              <span>{newRequestBanner}</span>
            </div>
            <button 
              onClick={() => setNewRequestBanner(null)} 
              className="text-xs text-accent-green hover:underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {loading ? (
          <div className="py-12 flex items-center justify-center text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin text-accent-green" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhuma solicitação beta encontrada.
          </div>
        ) : (
          <div className="border border-card-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-900/60">
                <TableRow className="border-card-border hover:bg-transparent">
                  <TableHead className="text-xs font-bold text-slate-400">Candidato</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400">Contato</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400">Motivação</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400">Status</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400 text-right">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((reqItem) => (
                  <TableRow key={reqItem.id} className="border-card-border hover:bg-slate-900/40">
                    <TableCell className="font-semibold text-slate-200">
                      <div>
                        <p className="text-sm">{reqItem.name}</p>
                        <p className="text-[10px] text-slate-500">{new Date(reqItem.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <p className="flex items-center gap-1.5 text-slate-300">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          {reqItem.email}
                        </p>
                        {reqItem.whatsapp && (
                          <p className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                            {reqItem.whatsapp}
                          </p>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="max-w-xs">
                      <p className="text-xs text-slate-300 line-clamp-3 italic bg-slate-950/60 p-2.5 rounded-lg border border-card-border/50">
                        "{reqItem.motivation}"
                      </p>
                    </TableCell>

                    <TableCell>
                      {reqItem.status === 'pending' && (
                        <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px] gap-1">
                          <Clock className="w-3 h-3" />
                          Pendente
                        </Badge>
                      )}
                      {reqItem.status === 'approved' && (
                        <Badge className="bg-accent-green/10 text-accent-green border-accent-green/20 text-[10px] gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Aprovado
                        </Badge>
                      )}
                      {reqItem.status === 'rejected' && (
                        <Badge className="bg-accent-rose/10 text-accent-rose border-accent-rose/20 text-[10px] gap-1">
                          <XCircle className="w-3 h-3" />
                          Rejeitado
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      {reqItem.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            disabled={processingId === reqItem.id}
                            onClick={() => handleApprove(reqItem)}
                            className="bg-accent-green hover:opacity-90 text-slate-900 font-bold text-xs h-8 px-3 rounded-lg"
                          >
                            {processingId === reqItem.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Aprovar'}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={processingId === reqItem.id}
                            onClick={() => handleReject(reqItem.id)}
                            className="text-slate-400 hover:text-accent-rose hover:bg-accent-rose/10 text-xs h-8 px-2 rounded-lg"
                          >
                            Rejeitar
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500">Processado</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Telegram Configuration Modal */}
      {showTelegramModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div 
            className="relative w-full max-w-lg bg-card-bg border border-card-border rounded-[2rem] shadow-2xl p-6 md:p-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-card-border">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-lg">Notificações no Telegram</h3>
                  <p className="text-[11px] text-slate-400">Receba alertas em tempo real no seu celular ao receber novos cadastros.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTelegramModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTelegramConfig} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Bot Token (fornecido pelo @BotFather)</label>
                <Input
                  type="password"
                  placeholder="Ex: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ..."
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  className="bg-slate-950 border-card-border focus:border-sky-400/50 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Seu Chat ID (ou ID do Grupo)</label>
                <Input
                  placeholder="Ex: 987654321"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  className="bg-slate-950 border-card-border focus:border-sky-400/50 rounded-xl text-xs font-mono"
                />
              </div>

              {/* Instructions Box */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-card-border/80 text-[11px] text-slate-400 space-y-2">
                <p className="font-bold text-slate-200 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                  Como criar e obter os dados em 2 minutos:
                </p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-400">
                  <li>No Telegram, busque por <code className="text-sky-300 font-mono">@BotFather</code> e envie o comando <code className="text-sky-300 font-mono">/newbot</code>.</li>
                  <li>Siga as instruções para dar nome e copiar o <strong>HTTP API Token</strong>.</li>
                  <li>Inicie uma conversa com seu novo bot e clique em <strong>INICIAR / START</strong>.</li>
                  <li>Busque por <code className="text-sky-300 font-mono">@userinfobot</code> no Telegram para ver o seu <strong>Chat ID</strong> numérico.</li>
                </ol>
              </div>

              {telegramStatus && (
                <div className={`p-3 rounded-xl text-xs font-medium border ${
                  telegramStatus.success 
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/30' 
                    : 'bg-accent-rose/10 text-accent-rose border-accent-rose/30'
                }`}>
                  {telegramStatus.message}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={testingTelegram || !telegramToken || !telegramChatId}
                  onClick={handleTestTelegram}
                  className="flex-1 border-card-border hover:bg-slate-800 text-slate-200 text-xs font-bold h-11 rounded-xl"
                >
                  {testingTelegram ? <Loader2 className="w-4 h-4 animate-spin" /> : '🚀 Testar Envio'}
                </Button>

                <Button
                  type="submit"
                  className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs h-11 rounded-xl"
                >
                  Salvar Configuração
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
