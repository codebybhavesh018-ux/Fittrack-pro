import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, orderBy, limit, addDoc, serverTimestamp, getDocs, updateDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestoreUtils";

interface FitnessUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  totalSteps: number;
  totalDistance: number;
  totalCalories: number;
  xp: number;
  level: number;
  badges: string[];
  dailyGoal: number;
  waterGoal: number;
  currentWater: number;
  weight: number;
  targetWeight: number;
}

interface Habit {
  id: string;
  name: string;
  category: "Physical" | "Mental" | "Nutrition";
  completed: boolean;
  streak: number;
}

interface FitnessContextType {
  user: FitnessUser | null;
  loading: boolean;
  authError: string | null;
  activeTab: string;
  habits: Habit[];
  setActiveTab: (tab: string) => void;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserStats: (steps: number, distance: number, calories: number) => Promise<void>;
  updateWater: (amount: number) => Promise<void>;
  updateWeight: (weight: number) => Promise<void>;
  addHabit: (name: string, category: string) => Promise<void>;
  toggleHabit: (habitId: string, completed: boolean) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  resetAllData: () => Promise<void>;
  resetNutritionData: () => Promise<void>;
  requestNotifications: () => Promise<void>;
  notificationPermission: NotificationPermission;
  dailyHistory: any[];
}

const FitnessContext = createContext<FitnessContextType | undefined>(undefined);

export function FitnessProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FitnessUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dailyHistory, setDailyHistory] = useState<any[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setAuthError(null);
        const userDocRef = doc(db, "users", fbUser.uid);
        
        // Listen to user data changes
        const unsubDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as FitnessUser);
            
            // Fetch history when user changes or loads
            const historyRef = collection(db, 'users', fbUser.uid, 'history');
            const q = query(historyRef, orderBy('date', 'desc'), limit(30));
            const historySnap = await getDocs(q);
            setDailyHistory(historySnap.docs.map(d => d.data()));
          } else {
            // Initialize new user
            const newUser: FitnessUser = {
              uid: fbUser.uid,
              displayName: fbUser.displayName || "User",
              email: fbUser.email || "",
              photoURL: fbUser.photoURL || "",
              totalSteps: 0,
              totalDistance: 0,
              totalCalories: 0,
              xp: 0,
              level: 0,
              badges: [],
              dailyGoal: 10000,
              waterGoal: 8,
              currentWater: 0,
              weight: 0,
              targetWeight: 0
            };
            setDoc(userDocRef, newUser).catch(e => handleFirestoreError(e, OperationType.WRITE, `users/${fbUser.uid}`));
            setUser(newUser);
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}`);
        });

        // Listen to habits
        const habitsRef = collection(db, 'users', fbUser.uid, 'habits');
        const unsubHabits = onSnapshot(habitsRef, (snap) => {
          setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() } as Habit)));
        }, (error) => {
           handleFirestoreError(error, OperationType.GET, `users/${fbUser.uid}/habits`);
        });

        return () => {
          unsubDoc();
          unsubHabits();
        };
      } else {
        setUser(null);
        setDailyHistory([]);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  const login = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-blocked') {
        setAuthError("Popup blocked by browser. Please allow popups for this site or open in a new tab.");
      } else {
        setAuthError(error.message || "Authentication failed. Please try again.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserStats = async (steps: number, distance: number, calories: number) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      const newSteps = (user.totalSteps || 0) + steps;
      const newDistance = (user.totalDistance || 0) + distance;
      const newCalories = (user.totalCalories || 0) + calories;
      const newXP = (user.xp || 0) + Math.floor(steps / 10);

      await setDoc(userDocRef, {
        totalSteps: newSteps,
        totalDistance: newDistance,
        totalCalories: newCalories,
        xp: newXP
      }, { merge: true });

      // Update daily history snapshot
      const today = new Date().toISOString().split('T')[0];
      const historyDocRef = doc(db, 'users', user.uid, 'history', today);
      await setDoc(historyDocRef, {
        date: today,
        steps: newSteps,
        calories: newCalories,
        distance: newDistance
      }, { merge: true });

    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateWater = async (amount: number) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, {
        currentWater: Math.max(0, (user.currentWater || 0) + amount)
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const updateWeight = async (weight: number) => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      await setDoc(userDocRef, {
        weight: weight
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const addHabit = async (name: string, category: string) => {
    if (!user) return;
    const habitsRef = collection(db, 'users', user.uid, 'habits');
    try {
      await addDoc(habitsRef, {
        name,
        category,
        completed: false,
        streak: 0,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/habits`);
    }
  };

  const toggleHabit = async (habitId: string, completed: boolean) => {
    if (!user) return;
    const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);
    try {
      await updateDoc(habitDocRef, {
        completed: completed
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    const habitDocRef = doc(db, 'users', user.uid, 'habits', habitId);
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(habitDocRef);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const resetAllData = async () => {
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
      // 1. Reset main user stats in Firestore
      // Using setDoc with merge: true is often more reliable than updateDoc
      await setDoc(userDocRef, {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        xp: 0,
        level: 0,
        currentWater: 0,
        weight: 0,
        targetWeight: 0,
        badges: []
      }, { merge: true });

      // 2. Clear today's history entry specifically
      const today = new Date().toISOString().split('T')[0];
      const historyDocRef = doc(db, 'users', user.uid, 'history', today);
      await setDoc(historyDocRef, {
        date: today,
        steps: 0,
        calories: 0,
        distance: 0
      }, { merge: true });

      // 3. Clear habits completions
      const habitsRef = collection(db, 'users', user.uid, 'habits');
      const habitsSnap = await getDocs(habitsRef);
      const { writeBatch } = await import("firebase/firestore");
      const batch = writeBatch(db);
      habitsSnap.docs.forEach(d => {
        batch.update(d.ref, { completed: false });
      });
      await batch.commit();
      
      // Update local state immediately for snappy UI
      setDailyHistory([]);
      
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
    }
  };

  const resetNutritionData = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "nutrition"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);
      
      // Unfortunately Firestore doesn't have a batch delete by query in the client SDK easily
      // but we can iterate and delete if it's a small amount, or just ignore and let the UI 
      // handle the ephemeral reset if we don't want to block.
      // However, for a "Reset" we should really clear them.
      
      // Batch delete
      const { writeBatch } = await import("firebase/firestore");
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Trigger a refresh by updating a timestamp or just letting onSnapshot handle it if there was one
      // But Nutrition doesn't use onSnapshot, it uses useEffect + fetchMeals.
      // So we might need to tell the Nutrition component to refresh.
      
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, "nutrition");
    }
  };

  const requestNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
  };

  return (
    <FitnessContext.Provider value={{ 
      user, 
      loading, 
      authError, 
      activeTab,
      habits,
      setActiveTab,
      login, 
      logout, 
      updateUserStats,
      updateWater,
      updateWeight,
      addHabit,
      toggleHabit,
      deleteHabit,
      resetAllData,
      resetNutritionData,
      requestNotifications,
      notificationPermission,
      dailyHistory
    }}>
      {children}
    </FitnessContext.Provider>
  );
}

export function useFitness() {
  const context = useContext(FitnessContext);
  if (context === undefined) {
    throw new Error("useFitness must be used within a FitnessProvider");
  }
  return context;
}
