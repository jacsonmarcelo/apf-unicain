import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth, db } from '@/lib/firebase';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser,
  signInWithCustomToken
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, Mail, Send, Loader2, KeyRound, ArrowRight } from 'lucide-react';

export interface UserProfile {
  email: string;
  displayName: string;
  isApproved?: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  createdAt: any;
}

export function GoogleSignIn() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || 'Usuário',
          isSubscribed: false,
          isAdmin: user.email === 'jacsonmarcelo@gmail.com',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <Button onClick={handleSignIn} size="lg" className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-12 h-16 rounded-2xl text-lg shadow-xl flex items-center gap-3 w-full border-2 border-slate-100 transition-all active:scale-95">
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
      Entrar com Google
    </Button>
  );
}

export function EmailSignIn() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError('');
    setWarning('');
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      if (response.ok) {
        if (data.warning) {
          setWarning(data.warning);
        }
        setStep('otp');
      } else {
        setError(data.error || 'Erro ao enviar código');
      }
    } catch (err) {
      setError('Falha na comunicação com o servidor');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return;

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      
      const data = await response.json();
      if (response.ok && data.customToken) {
        const result = await signInWithCustomToken(auth, data.customToken);
        const u = result.user;
        
        // Finalize profile creation if new
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            email: u.email,
            displayName: u.displayName || email.split('@')[0],
            isSubscribed: false,
            isAdmin: u.email === 'jacsonmarcelo@gmail.com',
            createdAt: serverTimestamp()
          });
        }
      } else {
        setError(data.error || 'Código inválido');
      }
    } catch (err) {
      setError('Falha na verificação');
    }
    setLoading(false);
  };

  if (step === 'otp') {
    return (
      <form onSubmit={handleVerifyOtp} className="space-y-4 w-full">
        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm">
            Digite o código de 6 dígitos enviado para<br/>
            <strong className="text-slate-200">{email}</strong>
          </p>
        </div>
        {warning && (
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-3 text-center mb-2 whitespace-pre-line">
            <p className="text-amber-400 text-xs font-semibold leading-relaxed">
              {warning}
            </p>
          </div>
        )}
        <div className="relative">
          <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input 
            type="text" 
            placeholder="000000" 
            value={otp}
            maxLength={6}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="bg-slate-900 border-card-border h-16 pl-12 rounded-2xl text-2xl tracking-[0.5em] font-mono text-center focus:ring-accent-green/20"
            required
            autoFocus
          />
        </div>
        {error && <p className="text-accent-rose text-xs text-center font-bold uppercase tracking-wider">{error}</p>}
        <Button 
          type="submit" 
          disabled={loading || otp.length !== 6}
          className="bg-accent-green hover:opacity-90 text-slate-900 font-bold h-16 rounded-2xl text-lg w-full transition-all active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Verificar Código <ArrowRight className="w-5 h-5" /></>}
        </Button>
        <button 
          type="button"
          onClick={() => setStep('email')}
          className="w-full text-[10px] text-slate-500 uppercase tracking-widest font-bold hover:text-slate-300 transition-colors"
        >
          Alterar E-mail
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendOtp} className="space-y-4 w-full">
      <div className="relative">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input 
          type="email" 
          placeholder="Seu melhor e-mail" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-slate-900 border-card-border h-16 pl-12 rounded-2xl text-lg focus:ring-accent-green/20"
          required
        />
      </div>
      {error && <p className="text-accent-rose text-xs text-center font-bold uppercase tracking-wider">{error}</p>}
      <Button 
        type="submit" 
        disabled={loading}
        className="bg-accent-green hover:opacity-90 text-slate-900 font-bold h-16 rounded-2xl text-lg w-full transition-all active:scale-95 shadow-[0_0_30_rgba(16,185,129,0.15)]"
      >
        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Receber Código por E-mail'}
      </Button>
    </form>
  );
}

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        setLoadingProfile(true);
        try {
          const userRef = doc(db, 'users', u.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(userSnap.data() as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
        setLoadingProfile(false);
      } else {
        setProfile(null);
        setLoadingProfile(false);
      }
    });
    return unsubscribe;
  }, []);

  return { user, profile, loadingProfile, signOut: () => signOut(auth) };
}
