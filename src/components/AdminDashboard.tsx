import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  getDoc,
  updateDoc, 
  query, 
  orderBy, 
  setDoc, 
  serverTimestamp,
  addDoc
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
import { Label } from '@/components/ui/label';
import { 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  Mail, 
  UserPlus, 
  Loader2,
  Search,
  Users,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '@/lib/auth';
import { AdminFeedback } from './AdminFeedback';
import { AdminBetaRequests } from './AdminBetaRequests';

export function AdminDashboard() {
  const [adminTab, setAdminTab] = useState<'users' | 'beta' | 'feedbacks'>('users');
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as (UserProfile & { id: string })[];
      setUsers(usersData);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || creating) return;

    setCreating(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const targetEmail = newEmail.toLowerCase().trim();

    try {
      // 1. Check if user is already in the loaded local list
      const emailExists = users.some(u => u.email?.toLowerCase().trim() === targetEmail);
      if (emailExists) {
        throw new Error('Este e-mail já possui um cadastro ou pré-cadastro ativo no sistema.');
      }

      // 2. Double check Firestore directly using email as ID
      const userRef = doc(db, 'users', targetEmail);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        throw new Error('Este e-mail já possui um pré-cadastro ativo.');
      }

      // 3. Create the pre-registration document using the normalized email as the document ID
      await setDoc(userRef, {
        email: targetEmail,
        displayName: newName.trim() || 'Convidado',
        isSubscribed: true,
        isAdmin: false,
        createdAt: serverTimestamp()
      });

      setSuccessMessage(`Usuário com e-mail "${targetEmail}" foi pré-cadastrado e inscrito com sucesso!`);
      setNewEmail('');
      setNewName('');
    } catch (error: any) {
      console.error("Error creating user: ", error);
      setErrorMessage(error.message || 'Ocorreu um erro ao tentar realizar o pré-cadastro.');
    } finally {
      setCreating(false);
    }
  };

  const toggleSubscription = async (user: UserProfile & { id: string }) => {
    const newStatus = !user.isSubscribed;
    try {
      // 1. Update the main clicked document (either email or UID based)
      await updateDoc(doc(db, 'users', user.id), {
        isSubscribed: newStatus
      });

      // 2. If the main document clicked is UID-based, also search and sync the pre-registration (email-based) document
      const emailKey = user.email?.toLowerCase().trim();
      if (emailKey && user.id !== emailKey) {
        try {
          const emailRef = doc(db, 'users', emailKey);
          const emailSnap = await getDoc(emailRef);
          if (emailSnap.exists()) {
            await updateDoc(emailRef, {
              isSubscribed: newStatus
            });
          }
        } catch (e) {
          console.warn("Could not sync email-based document subscription:", e);
        }
      }
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  // Group users by email to avoid duplicates when both email-based and UID-based docs exist
  const uniqueUsersMap: { [email: string]: UserProfile & { id: string } } = {};
  users.forEach(u => {
    const emailKey = u.email?.toLowerCase().trim();
    if (!emailKey) return;
    
    const existing = uniqueUsersMap[emailKey];
    const isUid = u.id !== emailKey; // UID-based document is preferred
    
    if (!existing || isUid) {
      uniqueUsersMap[emailKey] = u;
    }
  });

  const uniqueUsers = Object.values(uniqueUsersMap);

  const filteredUsers = uniqueUsers.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Sub-tabs selection */}
      <div className="flex border-b border-card-border pb-px gap-6 mb-2">
        <button
          onClick={() => setAdminTab('users')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            adminTab === 'users'
              ? 'border-accent-green text-accent-green'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Controle de Usuários
        </button>
        <button
          onClick={() => setAdminTab('beta')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            adminTab === 'beta'
              ? 'border-accent-green text-accent-green'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Solicitações Beta
        </button>
        <button
          onClick={() => setAdminTab('feedbacks')}
          className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all cursor-pointer ${
            adminTab === 'feedbacks'
              ? 'border-accent-green text-accent-green'
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Contribuições dos Aliados
        </button>
      </div>

      {adminTab === 'beta' ? (
        <AdminBetaRequests />
      ) : adminTab === 'feedbacks' ? (
        <AdminFeedback />
      ) : (
        <>
          {/* Create User Form */}
          <div className="bg-card-bg rounded-[2rem] border border-card-border p-8 shadow-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-accent-green/10 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Pré-cadastrar Usuário</h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Adicione e libere acesso instantâneo</p>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-label text-[10px] font-bold uppercase tracking-widest ml-1">E-mail do Usuário</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="exemplo@email.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="bg-slate-900 border-card-border h-12 rounded-xl focus:ring-accent-green/20 text-slate-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-label text-[10px] font-bold uppercase tracking-widest ml-1">Nome (Opcional)</Label>
            <Input 
              id="name"
              placeholder="Nome do cliente"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-slate-900 border-card-border h-12 rounded-xl focus:ring-accent-green/20 text-slate-200"
            />
          </div>
          <Button 
            type="submit"
            disabled={creating}
            className="bg-accent-green hover:opacity-90 text-slate-900 font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all active:scale-95 cursor-pointer w-full flex items-center justify-center gap-2"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cadastrar e Inscrever'}
          </Button>
        </form>

        {successMessage && (
          <div className="mt-6 bg-accent-green/10 border border-accent-green/20 text-accent-green p-4 rounded-xl flex items-start gap-3 text-xs animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 bg-accent-rose/10 border border-accent-rose/20 text-accent-rose p-4 rounded-xl flex items-start gap-3 text-xs animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Users List */}
      <div className="bg-card-bg rounded-[2rem] border border-card-border overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/20">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-label font-bold uppercase text-[10px] tracking-widest">Base de Usuários ({users.length})</span>
          </div>
          
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input 
              placeholder="Buscar por nome ou e-mail..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border-card-border h-10 pl-10 rounded-xl text-sm"
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-900/40">
            <TableRow className="border-card-border hover:bg-transparent">
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pl-8 py-4">Usuário</TableHead>
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Inscrição</TableHead>
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Cargo</TableHead>
              <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Cadastro</TableHead>
              <TableHead className="text-right py-4 pr-8 text-label font-bold uppercase text-[10px] tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id} className="border-card-border/50 hover:bg-slate-800/10 transition-colors">
                <TableCell className="pl-8 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-100">{user.displayName}</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {user.isSubscribed ? (
                    <Badge className="bg-accent-green/20 text-accent-green border-accent-green/30 hover:bg-accent-green/20">Ativa</Badge>
                  ) : (
                    <Badge variant="outline" className="text-label border-card-border opacity-50">Inativa</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.isAdmin ? (
                    <div className="flex items-center gap-1 text-accent-amber text-[10px] font-bold uppercase">
                      <ShieldCheck className="w-3 h-3" /> Admin
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Cliente</span>
                  )}
                </TableCell>
                <TableCell className="text-slate-500 text-xs font-mono">
                  {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString('pt-BR') : '-'}
                </TableCell>
                <TableCell className="text-right pr-8">
                  {user.email !== 'jacsonmarcelo@gmail.com' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => toggleSubscription(user)}
                      className={user.isSubscribed ? "text-accent-rose hover:bg-accent-rose/10" : "text-accent-green hover:bg-accent-green/10"}
                    >
                      {user.isSubscribed ? (
                        <><UserX className="w-4 h-4 mr-2" /> Revogar</>
                      ) : (
                        <><UserCheck className="w-4 h-4 mr-2" /> Inscrever</>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-label text-[11px] italic uppercase tracking-[0.2em] opacity-40">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      </>
      )}
    </div>
  );
}
