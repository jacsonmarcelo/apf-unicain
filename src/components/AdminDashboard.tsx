import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
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
  Users
} from 'lucide-react';
import { UserProfile } from '@/lib/auth';

export function AdminDashboard() {
  const [users, setUsers] = useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New User Form State
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);

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
    if (!newEmail || creating) return;

    setCreating(true);
    try {
      // Create a "bare" user profile. 
      // Note: We use a random ID or email-based ID if preferred. 
      // Firestore will allow this because of the rules (isAdmin).
      const userRef = doc(collection(db, 'users'));
      await setDoc(userRef, {
        email: newEmail.toLowerCase(),
        displayName: newName || 'Convidado',
        isSubscribed: true,
        isAdmin: false,
        createdAt: serverTimestamp()
      });
      setNewEmail('');
      setNewName('');
    } catch (error) {
      console.error("Error creating user: ", error);
    }
    setCreating(false);
  };

  const toggleSubscription = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isSubscribed: !currentStatus
      });
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  const filteredUsers = users.filter(user => 
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
              className="bg-slate-900 border-card-border h-12 rounded-xl focus:ring-accent-green/20"
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
              className="bg-slate-900 border-card-border h-12 rounded-xl focus:ring-accent-green/20"
            />
          </div>
          <Button 
            disabled={creating}
            className="bg-accent-green hover:opacity-90 text-slate-900 font-bold h-12 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all active:scale-95"
          >
            {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Cadastrar e Inscrever'}
          </Button>
        </form>
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
                      onClick={() => toggleSubscription(user.id, user.isSubscribed)}
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
    </div>
  );
}
