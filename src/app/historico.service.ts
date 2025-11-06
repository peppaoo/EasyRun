import { Injectable, inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  deleteDoc
} from '@angular/fire/firestore';

// 🔹 Interface (estrutura de cada corrida)
export interface Corrida {
  uid: string;         // ID do usuário logado
  distancia: number;   // km
  duracao: number;     // segundos
  ritmo: number;       // segundos por km
  inicio: Date;        // horário de início
  fim: Date;           // horário de término
  criadoEm: Date;      // data de criação no banco
}

@Injectable({
  providedIn: 'root'
})
export class HistoricoService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private collRef() {
    return collection(this.firestore, 'corridas'); // nome da coleção no Firestore
  }

  // 🔸 Salvar uma nova corrida no Firestore
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

  // 🔹 Listar últimas corridas do usuário (página inicial)
  async listarPrimeiraPagina(limitCount = 5) {
    const user = this.auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado');

    const q = query(
      this.collRef(),
      where('uid', '==', user.uid),
      orderBy('criadoEm', 'desc'),
      limit(limitCount)
    );

    const snap = await getDocs(q);
    const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as Corrida) }));
    const cursor = snap.docs.length ? snap.docs[snap.docs.length - 1] : null;

    return { items, cursor };
  }

  // 🔸 Excluir uma corrida específica
  async excluirCorrida(id: string) {
    await deleteDoc(doc(this.firestore, 'corridas', id));
  }
}
