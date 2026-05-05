import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { FinancialEntry, BudgetLimit, RecurringEntry } from '../types/finance';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function useFinanceData() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [budgets, setBudgets] = useState<BudgetLimit[]>([]);
  const [recurring, setRecurring] = useState<RecurringEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Entries Listener
    const entriesQuery = query(
      collection(db, 'entries'), 
      where('userId', '==', user.uid),
      orderBy('date', 'desc')
    );
    const unsubEntries = onSnapshot(entriesQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FinancialEntry));
      setEntries(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'entries');
    });

    // Budgets Listener
    const budgetsQuery = query(collection(db, 'budgets'), where('userId', '==', user.uid));
    const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BudgetLimit));
      setBudgets(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'budgets');
    });

    // Recurring Listener
    const recurringQuery = query(collection(db, 'recurring'), where('userId', '==', user.uid));
    const unsubRecurring = onSnapshot(recurringQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecurringEntry));
      setRecurring(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'recurring');
    });

    return () => {
      unsubEntries();
      unsubBudgets();
      unsubRecurring();
    };
  }, [auth.currentUser]);

  const addEntry = async (entry: Omit<FinancialEntry, 'id' | 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'entries'), {
        ...entry,
        userId: user.uid,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'entries');
    }
  };

  const addBudget = async (budget: Omit<BudgetLimit, 'id' | 'userId'>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'budgets'), {
        ...budget,
        userId: user.uid
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'budgets');
    }
  };

  const addRecurring = async (rec: Omit<RecurringEntry, 'id' | 'userId' | 'active'>) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'recurring'), {
        ...rec,
        userId: user.uid,
        active: true
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'recurring');
    }
  };

  const deleteRecurring = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'recurring', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `recurring/${id}`);
    }
  };

  return {
    entries,
    budgets,
    recurring,
    loading,
    addEntry,
    addBudget,
    addRecurring,
    deleteRecurring
  };
}
