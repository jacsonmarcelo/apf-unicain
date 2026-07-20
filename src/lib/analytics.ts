import { collection, addDoc, query, where, getDocs, limit, serverTimestamp, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export type AnalyticsEventName =
  | 'user_registered'
  | 'first_login'
  | 'first_income_created'
  | 'first_expense_created'
  | 'dashboard_opened'
  | 'annual_report_opened'
  | 'app_error';

interface LogEventOptions {
  eventName: AnalyticsEventName;
  userId: string;
  screen: string;
  metadata?: Record<string, any>;
}

const SINGLE_OCCURRENCE_EVENTS: AnalyticsEventName[] = [
  'first_login',
  'first_income_created',
  'first_expense_created'
];

/**
 * Gets the current date string in local timezone format (YYYY-MM-DD).
 */
export function getLocalDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Updates or creates the daily metric document for the given user and date.
 * Ensures each user has exactly one document per day in user_metrics.
 */
export async function updateDailyMetric(
  userId: string,
  updates: {
    incrementLaunches?: boolean;
    dashboardOpened?: boolean;
    reportsOpened?: boolean;
  }
): Promise<void> {
  if (!userId) return;

  try {
    const dateStr = getLocalDateString();
    const docId = `${userId}_${dateStr}`;
    const docRef = doc(db, 'user_metrics', docId);

    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const updateData: Record<string, any> = {
        lastActivity: serverTimestamp(),
        activeToday: true
      };

      if (updates.incrementLaunches) {
        updateData.launchesCount = increment(1);
      }
      if (updates.dashboardOpened) {
        updateData.dashboardOpened = true;
      }
      if (updates.reportsOpened) {
        updateData.reportsOpened = true;
      }

      await updateDoc(docRef, updateData);
    } else {
      const initialData = {
        userId,
        date: dateStr,
        launchesCount: updates.incrementLaunches ? 1 : 0,
        dashboardOpened: !!updates.dashboardOpened,
        reportsOpened: !!updates.reportsOpened,
        activeToday: true,
        lastActivity: serverTimestamp()
      };

      await setDoc(docRef, initialData);
    }
  } catch (error) {
    console.warn('[Analytics] Error updating daily metric:', error);
  }
}

/**
 * Clean metadata to strip out any potential financial details or personally identifiable information (PII).
 */
function sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
  if (!metadata) return undefined;
  
  const clean = { ...metadata };
  
  // Sensitive keys to strictly remove to prevent financial and personal data leakage
  const blacklistedKeys = [
    'amount', 'value', 'price', 'cost', 'revenue', 'expense', 'income',
    'description', 'title', 'category', 'categoryId', 'categoryName',
    'email', 'name', 'displayName', 'userName', 'password', 'phone', 'address'
  ];
  
  for (const key of Object.keys(clean)) {
    const lowerKey = key.toLowerCase();
    if (blacklistedKeys.some(blocked => lowerKey.includes(blocked))) {
      delete clean[key];
    }
  }
  
  return clean;
}

/**
 * Track an analytics event in Firebase Firestore.
 * This is fully decoupled and handles errors gracefully so it never interferes with primary app usage.
 */
export async function trackEvent(options: LogEventOptions): Promise<void> {
  const { eventName, userId, screen, metadata } = options;
  
  if (!userId) return;

  try {
    // 1. Check if the event is a single-occurrence event and check if already logged
    if (SINGLE_OCCURRENCE_EVENTS.includes(eventName)) {
      const cacheKey = `finanzas_analytics_${userId}_${eventName}`;
      
      // Quick local storage check to avoid redundant Firestore queries
      if (localStorage.getItem(cacheKey)) {
        return;
      }

      // Query Firestore to verify across sessions/devices
      const q = query(
        collection(db, 'analytics_events'),
        where('userId', '==', userId),
        where('eventName', '==', eventName),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        localStorage.setItem(cacheKey, 'true');
        return;
      }
      
      // Set cache key prior to write
      localStorage.setItem(cacheKey, 'true');
    }

    // 2. Sanitize metadata
    const cleanMetadata = sanitizeMetadata(metadata);

    // 3. Write event to Firestore
    await addDoc(collection(db, 'analytics_events'), {
      eventName,
      userId,
      timestamp: serverTimestamp(),
      screen,
      ...(cleanMetadata && Object.keys(cleanMetadata).length > 0 ? { metadata: cleanMetadata } : {})
    });
  } catch (error) {
    // Gracefully fail-safe in production so user flows are never blocked by telemetry issues
    console.warn(`[Analytics] Fail-safe active for event ${eventName}:`, error);
  }
}
