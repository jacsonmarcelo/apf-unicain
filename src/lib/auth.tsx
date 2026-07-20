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
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn, Mail, Send, Loader2, KeyRound, ArrowRight, ExternalLink } from 'lucide-react';
import { trackEvent } from './analytics';

export interface UserProfile {
  email: string;
  displayName: string;
  isApproved?: boolean;
  isSubscribed: boolean;
  isAdmin: boolean;
  createdAt: any;
}

export function GoogleSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [isIframe, setIsIframe] = useState(false);

  useEffect(() => {
    // Detect if inside iframe
    setIsIframe(window.self !== window.top);
  }, []);

  const handleSignIn = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Error signing in: ", err);
      if (err.code === 'auth/popup-blocked') {
        setError('O popup de login foi bloqueado pelo seu navegador. Por favor, libere popups ou abra o app em uma nova aba.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O login com Google não está habilitado no Console do Firebase.');
      } else {
        setError('Não foi possível conectar com o Google dentro deste painel (iframe). Por favor, use o login por e-mail ou abra em uma nova aba.');
      }
    }
  };

  return (
    <div className="space-y-4 w-full">
      <Button onClick={handleSignIn} size="lg" className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-12 h-16 rounded-2xl text-lg shadow-xl flex items-center justify-center gap-3 w-full border-2 border-slate-100 transition-all active:scale-95">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 shrink-0" />
        Entrar com Google
      </Button>

      {error && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-center text-xs text-amber-400 font-medium leading-relaxed space-y-2 animate-in fade-in duration-200">
          <p>{error}</p>
          <div className="pt-1 flex justify-center">
            <a 
              href={window.location.href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-accent-green hover:underline inline-flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider"
            >
              Abrir App em Nova Aba <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {isIframe && !error && (
        <p className="text-[10px] text-slate-500 text-center leading-relaxed px-2">
          💡 <strong className="text-slate-400">Dica do Iframe:</strong> Navegadores bloqueiam popups do Google dentro de painéis integrados. Para entrar com Google, <a href={window.location.href} target="_blank" rel="noopener noreferrer" className="text-accent-green hover:underline font-bold">abra em uma nova aba <ExternalLink className="inline-block w-2.5 h-2.5 ml-0.5" /></a> ou use o login por e-mail acima.
        </p>
      )}
    </div>
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
        await signInWithCustomToken(auth, data.customToken);
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
          let userSnap = await getDoc(userRef);
          
          const targetEmail = u.email?.toLowerCase().trim();
          let preRegData: UserProfile | null = null;
          
          if (targetEmail) {
            try {
              const emailRef = doc(db, 'users', targetEmail);
              const emailSnap = await getDoc(emailRef);
              if (emailSnap.exists()) {
                preRegData = emailSnap.data() as UserProfile;
              }
            } catch (err) {
              console.warn("Could not check email-based pre-registration document:", err);
            }
          }
          
          if (userSnap.exists()) {
            const currentProfile = userSnap.data() as UserProfile;
            const needsSync = preRegData && (
              (preRegData.isSubscribed && !currentProfile.isSubscribed) ||
              (preRegData.isAdmin && !currentProfile.isAdmin)
            );
            
            if (needsSync && preRegData) {
              const updatedProfile = {
                ...currentProfile,
                isSubscribed: preRegData.isSubscribed ?? currentProfile.isSubscribed,
                isAdmin: preRegData.isAdmin ?? currentProfile.isAdmin,
              };
              await updateDoc(userRef, {
                isSubscribed: updatedProfile.isSubscribed,
                isAdmin: updatedProfile.isAdmin
              });
              setProfile(updatedProfile);
            } else {
              setProfile(currentProfile);
            }
          } else {
            if (preRegData) {
              const newProfileData = {
                email: targetEmail || '',
                displayName: u.displayName || preRegData.displayName || (targetEmail ? targetEmail.split('@')[0] : 'Convidado'),
                isSubscribed: preRegData.isSubscribed ?? true,
                isAdmin: targetEmail === 'jacsonmarcelo@gmail.com' || (preRegData.isAdmin ?? false),
                createdAt: preRegData.createdAt || serverTimestamp()
              };
              
              await setDoc(userRef, newProfileData);
              setProfile(newProfileData);
            } else {
              const defaultProfile = {
                email: targetEmail || '',
                displayName: u.displayName || (targetEmail ? targetEmail.split('@')[0] : 'Usuário'),
                isSubscribed: targetEmail === 'jacsonmarcelo@gmail.com',
                isAdmin: targetEmail === 'jacsonmarcelo@gmail.com',
                createdAt: serverTimestamp()
              };
              await setDoc(userRef, defaultProfile);
              setProfile(defaultProfile);
            }
            
            // Track user_registered
            trackEvent({
              eventName: 'user_registered',
              userId: u.uid,
              screen: 'auth'
            }).catch(err => console.warn('Error tracking user_registered:', err));
          }
          
          // Track first_login (with internal single-occurrence check)
          trackEvent({
            eventName: 'first_login',
            userId: u.uid,
            screen: 'auth'
          }).catch(err => console.warn('Error tracking first_login:', err));
        } catch (error) {
          console.error("Error fetching/migrating profile:", error);
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
