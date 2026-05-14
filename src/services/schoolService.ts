import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  updateDoc,
  limit,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db, auth, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface NewsItem {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  date: string;
  category: string;
  createdAt?: any;
}

export interface Achievement {
  id?: string;
  title: string;
  winner: string;
  rank: string;
  year: string;
  category?: string;
  image?: string;
  description?: string;
  createdAt?: any;
}

export interface Staff {
  id?: string;
  name: string;
  role: string;
  subject?: string;
  image?: string;
  order?: number;
}

export interface Extracurricular {
  id?: string;
  name: string;
  description: string;
  category: string;
  mentor?: string;
  schedule?: string;
  image?: string;
  icon?: string;
}

export interface GalleryItem {
  id?: string;
  title: string;
  image: string;
  category: string;
  createdAt?: any;
}

export interface SchoolProgram {
  id?: string;
  name: string;
  startYear: string;
  description: string;
  image?: string;
  documents?: { title: string; url: string }[];
  createdAt?: any;
  updatedAt?: any;
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  motto: string;
  vision: string;
  mission: string[];
  headmasterName: string;
  headmasterQuote: string;
  headmasterGreeting?: string;
  headmasterImage: string;
  address?: string;
  phone?: string;
  email?: string;
  mapsUrl?: string;
  instagram?: string;
  studentCount?: string;
  teacherCount?: string;
  classCount?: string;
  accreditation?: string;
}

export const handleFirestoreError = (error: any, operation: string, path: string | null = null) => {
  if (error?.code === 'permission-denied') {
    const errorInfo = {
      error: error.message,
      code: error.code,
      operationType: operation,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid || 'anonymous',
        email: auth.currentUser?.email || 'none',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser ? auth.currentUser.isAnonymous : true,
      }
    };
    console.error('Firestore Permission Error:', JSON.stringify(errorInfo, null, 2));
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

export const handleStorageError = (error: any, path: string) => {
  const errorInfo = {
    error: error.message,
    code: error.code,
    path: path,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || 'none',
    }
  };
  console.error('Storage Error:', JSON.stringify(errorInfo, null, 2));
  throw new Error(`Upload failed (${error.code}): ${error.message}`);
};

// ... DATA SERVICES ---

export const getNews = (callback: (news: NewsItem[]) => void) => {
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(q, (snapshot) => {
    const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NewsItem));
    callback(news);
  }, (err) => handleFirestoreError(err, 'list', 'news'));
};

export const getAchievements = (callback: (items: Achievement[]) => void) => {
  const q = query(collection(db, 'achievements'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement));
    callback(items);
  }, (err) => handleFirestoreError(err, 'list', 'achievements'));
};

export const getStaff = (callback: (items: Staff[]) => void) => {
  const q = query(collection(db, 'staff'), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Staff));
    callback(items);
  }, (err) => handleFirestoreError(err, 'list', 'staff'));
};

export const getExtracurriculars = (callback: (items: Extracurricular[]) => void) => {
  const q = query(collection(db, 'extracurriculars'), orderBy('name', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Extracurricular));
    callback(items);
  }, (err) => handleFirestoreError(err, 'list', 'extracurriculars'));
};

export const getGallery = (callback: (items: GalleryItem[]) => void) => {
  const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'), limit(20));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GalleryItem));
    callback(items);
  }, (err) => handleFirestoreError(err, 'list', 'gallery'));
};

export const getPrograms = (callback: (items: SchoolProgram[]) => void) => {
  const q = query(collection(db, 'programs'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolProgram));
    callback(items);
  }, (err) => handleFirestoreError(err, 'list', 'programs'));
};

export const getProgramById = async (id: string): Promise<SchoolProgram | null> => {
  try {
    const docRef = doc(db, 'programs', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as SchoolProgram;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, 'get', `programs/${id}`);
    return null;
  }
};

export const addProgram = async (data: Omit<SchoolProgram, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'programs'), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    handleFirestoreError(err, 'create', 'programs');
  }
};

export const updateProgram = async (id: string, data: Partial<SchoolProgram>) => {
  try {
    const docRef = doc(db, 'programs', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (err) {
    handleFirestoreError(err, 'update', `programs/${id}`);
  }
};

export const deleteProgram = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'programs', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `programs/${id}`);
  }
};

export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const fileRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    return getDownloadURL(snapshot.ref);
  } catch (err) {
    handleStorageError(err, path);
    throw err;
  }
};

export const getSchoolSettings = async (): Promise<SchoolSettings | null> => {
  try {
    const docRef = doc(db, 'settings', 'global');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SchoolSettings;
    }
    return null;
  } catch (err) {
    handleFirestoreError(err, 'get', 'settings/global');
    return null;
  }
};

export const deleteNews = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'news', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `news/${id}`);
  }
};

export const deleteAchievement = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'achievements', id));
  } catch (err) {
    handleFirestoreError(err, 'delete', `achievements/${id}`);
  }
};
