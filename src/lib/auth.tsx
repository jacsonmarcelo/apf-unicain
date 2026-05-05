import React from 'react';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { LogIn } from 'lucide-react';

export function GoogleSignIn() {
  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  return (
    <Button onClick={handleSignIn} size="lg" className="bg-emerald-600 hover:bg-emerald-500">
      <LogIn className="w-4 h-4 mr-2" /> Entrar com Google
    </Button>
  );
}

export function useAuth() {
  const [user, setUser] = React.useState(auth.currentUser);

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return unsubscribe;
  }, []);

  return { user, signOut: () => signOut(auth) };
}
