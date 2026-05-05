import React from 'react';
import { Button } from '@/components/ui/button';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { LogIn } from 'lucide-react';

export interface UserProfile {
  email: string;
  displayName: string;
  isApproved: boolean;
  isAdmin: boolean;
  createdAt: any;
}

export function GoogleSignIn() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if profile exists, if not create it
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName || 'Usuário',
          isApproved: false,
          isAdmin: user.email === 'jacsonmarcelo@gmail.com',
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <Button onClick={handleSignIn} size="lg" className="bg-accent-green hover:opacity-90 text-slate-900 font-bold px-12 h-16 rounded-2xl text-lg shadow-[0_0_30px_rgba(16,185,129,0.15)] flex items-center gap-3">
      <LogIn className="w-6 h-6" /> Entrar com Google
    </Button>
  );
}

export function useAuth() {
  const [user, setUser] = React.useState<FirebaseUser | null>(auth.currentUser);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        setLoadingProfile(true);
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile(userSnap.data() as UserProfile);
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
