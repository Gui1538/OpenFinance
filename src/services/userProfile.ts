import { doc, getDoc, setDoc } from 'firebase/firestore';
import { DEFAULT_CATEGORIES, type Category, type UserProfile } from '@/types';
import { db } from './firebase';
import { createRepository } from './repository';

const categoryRepo = createRepository<Category>('categories');

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.id), profile);
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', id));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** IDs fixos: se o seed rodar duas vezes, sobrescreve o mesmo documento em vez de duplicar. */
export async function seedDefaultCategories(uid: string): Promise<void> {
  for (const c of DEFAULT_CATEGORIES) {
    await categoryRepo.create(
      uid,
      { nome: c.nome, tipo: c.tipo, descricao: c.descricao, icone: c.icone, cor: c.cor },
      `default-${c.key}`,
    );
  }
}
