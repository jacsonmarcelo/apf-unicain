import React, { useState, useEffect } from 'react';
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
  Users
} from 'lucide-react';

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

  useEffect(() => {
    const q = query(collection(db, 'beta_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BetaRequest[];
      setRequests(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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

          <div className="flex items-center gap-3">
            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 text-xs">
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
    </div>
  );
}
