import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface Movie {
  id: string;
  title: string;
  year: number;
  isCartoon: boolean;
  addedBy: string;
  isShared: boolean;
  imageUrl?: string;
  genre?: string;
  description?: string;
  likedBy?: string[];
  createdAt?: any;
}

export function subscribeToMovies(callback: (movies: Movie[]) => void) {
  const q = query(collection(db, 'movies'), where('isShared', '==', true), orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const movies = snapshot.docs.map(snapshotDoc => ({
      id: snapshotDoc.id,
      ...snapshotDoc.data()
    } as Movie));
    // Filter out movies not shared, though the security rule allows list if isShared == true
    callback(movies.filter(m => m.isShared));
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'movies');
  });
}

export async function addMovie(title: string, year: number, userId: string, genre: string) {
  try {
    const id = Date.now().toString(); // simple ID gen for now
    const imageUrl = `https://image.pollinations.ai/prompt/Cinematic%20movie%20poster%20for%20${encodeURIComponent(title)}?width=400&height=600&nologo=true`;
    
    await setDoc(doc(db, 'movies', id), {
      title,
      year,
      isCartoon: genre.toLowerCase().includes('anime') || genre.toLowerCase().includes('cartoon') || genre.toLowerCase().includes('ghibli'),
      addedBy: userId,
      isShared: true,
      imageUrl: String(imageUrl).substring(0, 2400),
      genre: genre,
      description: "", 
      likedBy: [],
      createdAt: serverTimestamp()
    });
  } catch (error) {
     handleFirestoreError(error, OperationType.CREATE, 'movies');
  }
}

export async function addCustomMovie(data: {
  title: string;
  year: number;
  userId: string;
  genre: string;
  description: string;
  imageUrl: string;
}) {
  try {
    const id = Date.now().toString();
    await setDoc(doc(db, 'movies', id), {
      title: data.title,
      year: data.year,
      isCartoon: data.genre.toLowerCase().includes('anime') || data.genre.toLowerCase().includes('cartoon') || data.genre.toLowerCase().includes('ghibli'),
      addedBy: data.userId,
      isShared: true,
      imageUrl: data.imageUrl ? String(data.imageUrl).substring(0, 2400) : "",
      genre: data.genre || "Cinema",
      description: data.description ? String(data.description).substring(0, 1990) : "",
      likedBy: [],
      createdAt: serverTimestamp()
    });
  } catch (error) {
     handleFirestoreError(error, OperationType.CREATE, 'movies');
  }
}

export async function deleteMovie(id: string) {
   try {
     await deleteDoc(doc(db, 'movies', id));
   } catch (error) {
     handleFirestoreError(error, OperationType.DELETE, 'movies');
   }
}
