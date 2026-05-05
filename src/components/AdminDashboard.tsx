import React from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from 'firebase/firestore';
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
import { UserCheck, UserX, ShieldCheck, Mail, Calendar } from 'lucide-react';
import { UserProfile } from '@/lib/auth';

export function AdminDashboard() {
  const [users, setUsers] = React.useState<(UserProfile & { id: string })[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isApproved: !currentStatus
      });
    } catch (error) {
      console.error("Error updating user status: ", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-green"></div>
      </div>
    );
  }

  return (
    <div className="bg-card-bg rounded-xl border border-card-border overflow-hidden shadow-2xl">
      <Table>
        <TableHeader className="bg-slate-900/40">
          <TableRow className="border-card-border hover:bg-transparent">
            <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest pl-8 py-4">Usuário</TableHead>
            <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Status</TableHead>
            <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Cargo</TableHead>
            <TableHead className="text-label font-bold uppercase text-[10px] tracking-widest py-4">Cadastro</TableHead>
            <TableHead className="text-right py-4 pr-8 text-label font-bold uppercase text-[10px] tracking-widest">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
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
                {user.isApproved ? (
                  <Badge className="bg-accent-green/20 text-accent-green border-accent-green/30 hover:bg-accent-green/20">Aprovado</Badge>
                ) : (
                  <Badge variant="outline" className="text-label border-card-border">Pendente</Badge>
                )}
              </TableCell>
              <TableCell>
                {user.isAdmin && (
                  <div className="flex items-center gap-1 text-accent-amber text-[10px] font-bold uppercase">
                    <ShieldCheck className="w-3 h-3" /> Admin
                  </div>
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
                    onClick={() => toggleApproval(user.id, user.isApproved)}
                    className={user.isApproved ? "text-accent-rose hover:bg-accent-rose/10" : "text-accent-green hover:bg-accent-green/10"}
                  >
                    {user.isApproved ? (
                      <><UserX className="w-4 h-4 mr-2" /> Revogar</>
                    ) : (
                      <><UserCheck className="w-4 h-4 mr-2" /> Aprovar</>
                    )}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {users.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-20 text-label text-[11px] italic uppercase tracking-[0.2em] opacity-40">
                Nenhum usuário cadastrado
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
