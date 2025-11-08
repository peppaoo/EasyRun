import { Injectable, inject } from '@angular/core';

import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';


export interface Corrida {
  uid: string;
  distancia: number;   // km
  duracao: number;     // segundos
  ritmo: number;       // seg/km
  inicio: Date;
  fim: Date;
  criadoEm: Date;
}

@Injectable({ providedIn: 'root' })
export class HistoricoService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private collRef() {
    return collection(this.firestore, 'corridas');
  }

  /** Salva corrida no Firestore */
  async salvarCorrida(data: Omit<Corrida, 'uid' | 'criadoEm'>) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const payload: Corrida = {
      uid: user.uid,
      ...data,
      criadoEm: new Date(),
    };

    await addDoc(this.collRef(), payload);
  }

  async listarUltimasCorridas(limitCount = 5): Promise<any[]> {
  const user = this.auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');

  try {
    const q = query(this.collRef(), where('uid', '==', user.uid));
    const snap = await getDocs(q);

    const toDate = (v: any): Date =>
      v?.toDate ? v.toDate() : (v instanceof Date ? v : new Date(v ?? Date.now()));

    const items = snap.docs.map(d => {
      const raw: any = d.data();
      return {
        id: d.id,
        uid: raw.uid,
        distancia: Number(raw.distancia) || 0,
        duracao: Number(raw.duracao) || 0,
        ritmo: Number(raw.ritmo) || 0,
        inicio: toDate(raw.inicio),
        fim: toDate(raw.fim),
        criadoEm: toDate(raw.criadoEm),
      };
    });

    items.sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    return items.slice(0, limitCount);
  } catch (err) {
    console.error('Erro ao listar corridas:', err);
    return [];
  }
}
}
