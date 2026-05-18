import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, writeBatch, getDocs, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface ChatMessage {
  id: string;
  text: string;
  senderName: string;
  senderUid: string;
  createdAt: Timestamp | null;
}

export interface QueueItem {
  id: string;
  movieId: string;
  addedBy: string;
  addedByName: string;
  order: number;
  createdAt: Timestamp | null;
}

export function subscribeToMessages(callback: (messages: ChatMessage[]) => void) {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(snapshotDoc => {
      const data = snapshotDoc.data();
      return {
        id: snapshotDoc.id,
        text: data.text,
        senderName: data.senderName,
        senderUid: data.senderUid,
        createdAt: data.createdAt as Timestamp | null
      } as ChatMessage;
    });
    callback(messages);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'messages'));
}

export async function addMessage(text: string, senderName: string, senderUid: string) {
  try {
    const messageDoc = doc(collection(db, 'messages'));
    await setDoc(messageDoc, {
      text,
      senderName,
      senderUid,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'messages');
  }
}

export function subscribeToQueue(callback: (queue: QueueItem[]) => void) {
  const q = query(collection(db, 'queue'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const queue = snapshot.docs.map(snapshotDoc => {
      const data = snapshotDoc.data();
      return {
        id: snapshotDoc.id,
        movieId: data.movieId,
        addedBy: data.addedBy,
        addedByName: data.addedByName,
        order: data.order,
        createdAt: data.createdAt as Timestamp | null
      } as QueueItem;
    });
    callback(queue);
  }, (error) => handleFirestoreError(error, OperationType.LIST, 'queue'));
}

export async function addToQueue(movieId: string, addedBy: string, addedByName: string) {
  try {
    const qSnapshot = await getDocs(collection(db, 'queue'));
    let maxOrder = -1;
    qSnapshot.forEach(snapshotDoc => {
      const data = snapshotDoc.data();
      if (data.order > maxOrder) {
        maxOrder = data.order;
      }
    });
    
    const queueDoc = doc(collection(db, 'queue'));
    await setDoc(queueDoc, {
      movieId,
      addedBy,
      addedByName,
      order: maxOrder + 1,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'queue');
  }
}

export async function removeFromQueue(itemId: string) {
  try {
    await deleteDoc(doc(db, 'queue', itemId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `queue/${itemId}`);
  }
}

export async function updateQueueOrder(items: QueueItem[]) {
  try {
    const batch = writeBatch(db);
    items.forEach((item, index) => {
      const ref = doc(db, 'queue', item.id);
      batch.update(ref, { order: index });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'queue');
  }
}

// Mood Feature
export interface SharedMood {
  text: string;
  updatedBy: string;
  updatedByName: string;
  updatedAt: Timestamp | null;
}

export function subscribeToMood(callback: (mood: SharedMood | null) => void) {
  const moodRef = doc(db, 'settings', 'mood');
  return onSnapshot(moodRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as SharedMood);
    } else {
      callback(null);
    }
  }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/mood'));
}

export async function updateMood(text: string, updatedBy: string, updatedByName: string) {
  try {
    const moodRef = doc(db, 'settings', 'mood');
    await setDoc(moodRef, {
      text,
      updatedBy,
      updatedByName,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'settings/mood');
  }
}
