import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Player, Event } from '../types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const isLiveDb = typeof window !== 'undefined' && firebaseConfig.apiKey;

let db: any = null;

if (isLiveDb) {
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
  } catch (err) {
    console.error("Firebase initialization failed, falling back to local storage.", err);
  }
}

// Helper to handle localStorage fallback in client
const getLocalData = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setLocalData = <T>(key: string, data: T): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

export const dbService = {
  isLive: () => {
    return !!db;
  },

  // ----------------------------------------------------
  // PLAYERS API
  // ----------------------------------------------------
  getPlayers: async (): Promise<Player[]> => {
    if (db) {
      try {
        const playersCol = collection(db, 'players');
        const q = query(playersCol, orderBy('points', 'desc'));
        const playerSnapshot = await getDocs(q);
        const playerList = playerSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Player[];
        return playerList;
      } catch (err) {
        console.error("Error reading from Firestore, falling back to local storage.", err);
      }
    }
    return getLocalData<Player[]>('vna_players', []);
  },

  savePlayer: async (player: Player): Promise<void> => {
    if (db) {
      try {
        const playerDoc = doc(db, 'players', player.id);
        const { id, ...data } = player;
        await setDoc(playerDoc, data);
        return;
      } catch (err) {
        console.error("Error writing to Firestore, falling back to local storage.", err);
      }
    }
    
    // Local fallback
    const current = getLocalData<Player[]>('vna_players', []);
    const exists = current.some(p => p.id === player.id);
    let updated;
    if (exists) {
      updated = current.map(p => p.id === player.id ? player : p);
    } else {
      updated = [...current, player];
    }
    setLocalData('vna_players', updated);
  },

  deletePlayer: async (id: string): Promise<void> => {
    if (db) {
      try {
        const playerDoc = doc(db, 'players', id);
        await deleteDoc(playerDoc);
        return;
      } catch (err) {
        console.error("Error deleting from Firestore, falling back to local storage.", err);
      }
    }

    // Local fallback
    const current = getLocalData<Player[]>('vna_players', []);
    const updated = current.filter(p => p.id !== id);
    setLocalData('vna_players', updated);
  },

  // ----------------------------------------------------
  // EVENTS API
  // ----------------------------------------------------
  getEvents: async (): Promise<Event[]> => {
    if (db) {
      try {
        const eventsCol = collection(db, 'events');
        const eventSnapshot = await getDocs(eventsCol);
        const eventList = eventSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Event[];
        // Sort events by date descending
        return eventList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } catch (err) {
        console.error("Error reading events from Firestore, falling back to local storage.", err);
      }
    }
    const local = getLocalData<Event[]>('vna_events', []);
    return local.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveEvent: async (event: Event): Promise<void> => {
    if (db) {
      try {
        const eventDoc = doc(db, 'events', event.id);
        const { id, ...data } = event;
        await setDoc(eventDoc, data);
        return;
      } catch (err) {
        console.error("Error writing event to Firestore, falling back to local storage.", err);
      }
    }

    // Local fallback
    const current = getLocalData<Event[]>('vna_events', []);
    const exists = current.some(e => e.id === event.id);
    let updated;
    if (exists) {
      updated = current.map(e => e.id === event.id ? event : e);
    } else {
      updated = [...current, event];
    }
    setLocalData('vna_events', updated);
  },

  deleteEvent: async (id: string): Promise<void> => {
    if (db) {
      try {
        const eventDoc = doc(db, 'events', id);
        await deleteDoc(eventDoc);
        return;
      } catch (err) {
        console.error("Error deleting event from Firestore, falling back to local storage.", err);
      }
    }

    // Local fallback
    const current = getLocalData<Event[]>('vna_events', []);
    const updated = current.filter(e => e.id !== id);
    setLocalData('vna_events', updated);
  }
};
