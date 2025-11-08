import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle,
  IonInput, IonButton, IonText, IonNote, IonSpinner,
  IonInputPasswordToggle
} from '@ionic/angular/standalone';

import {
  Auth, onAuthStateChanged, updatePassword, deleteUser,
  reauthenticateWithCredential, EmailAuthProvider,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, deleteDoc } from '@angular/fire/firestore';

@Component({
  standalone: true,
  selector: 'app-altersenha',
  templateUrl: './altersenha.page.html',
  styleUrls: ['./altersenha.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonContent, IonHeader, IonToolbar, IonTitle,
    IonInput, IonButton, IonText, IonNote, IonSpinner,
    IonInputPasswordToggle
  ]
})
export class AlterarSenhaPage implements OnInit {

  email = '';
  currentPassword = '';   
  newPassword = '';
  confirmPassword = '';

  providerId: string | null = null; 
  loading = false;
  message = '';
  error = '';

  constructor(private auth: Auth, private db: Firestore, private router: Router) {}

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (u) => {
      this.email = u?.email ?? '';
      this.providerId = u?.providerData?.[0]?.providerId ?? null;
    });
  }

  get isEmailPassword(): boolean {
    return this.providerId === 'password';
  }

  private clearFeedback() {
    this.message = '';
    this.error = '';
  }

  async alterarSenha() {
  this.clearFeedback();

  if (!this.newPassword || this.newPassword.length < 6) {
    this.error = 'A nova senha precisa ter pelo menos 6 caracteres.';
    return;
  }
  if (this.newPassword !== this.confirmPassword) {
    this.error = 'As senhas não conferem.';
    return;
  }

  const u = this.auth.currentUser;
  if (!u) {
    this.error = 'Nenhum usuário logado.';
    return;
  }

  this.loading = true;
  try {
    await updatePassword(u, this.newPassword);
    this.message = 'Senha atualizada com sucesso!';
    this.currentPassword = this.newPassword = this.confirmPassword = '';
    setTimeout(() => {
      this.router.navigateByUrl('/homelogado', { replaceUrl: true });
    }, 1000);

  } catch (e: any) {
    if (e?.code === 'auth/requires-recent-login' && this.isEmailPassword) {
      try {
        if (!u.email) throw new Error('Usuário sem e-mail.');
        if (!this.currentPassword) throw new Error('Informe a senha atual.');
        const cred = EmailAuthProvider.credential(u.email, this.currentPassword);
        await reauthenticateWithCredential(u, cred);
        await updatePassword(u, this.newPassword);

        this.message = 'Senha atualizada com sucesso!';
        this.currentPassword = this.newPassword = this.confirmPassword = '';

        setTimeout(() => {
          this.router.navigateByUrl('/homelogado', { replaceUrl: true });
        }, 1000);

      } catch (e2: any) {
        this.error = this.prettyError(e2);
      }
    } else {
      this.error = this.prettyError(e);
    }
  } finally {
    this.loading = false;
  }
}

  async enviarEmailRedefinicao() {
    this.clearFeedback();
    if (!this.email) { this.error = 'Sem e-mail para enviar redefinição.'; return; }
    this.loading = true;
    try {
      await sendPasswordResetEmail(this.auth, this.email);
      this.message = 'E-mail de redefinição enviado. Verifique sua caixa de entrada.';
    } catch (e: any) {
      this.error = this.prettyError(e);
    } finally {
      this.loading = false;
    }
  }

  async excluirConta() {
    this.clearFeedback();
    const confirmar = confirm('Tem certeza que deseja excluir sua conta? Essa ação é irreversível!');
    if (!confirmar) return;

    const u = this.auth.currentUser;
    if (!u) {
      this.error = 'Nenhum usuário logado.';
      return;
    }

    this.loading = true;
    try {
      try {
        await deleteDoc(doc(this.db, 'users', u.uid));
      } catch (_) {}

      await deleteUser(u);
      this.message = 'Conta excluída com sucesso.';

      this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch (e: any) {
      if (e?.code === 'auth/requires-recent-login' && this.isEmailPassword) {
        try {
          if (!u.email) throw new Error('Usuário sem e-mail.');
          if (!this.currentPassword) throw new Error('Informe a senha atual.');
          const cred = EmailAuthProvider.credential(u.email, this.currentPassword);
          await reauthenticateWithCredential(u, cred);
          await deleteUser(u);
          this.message = 'Conta excluída com sucesso.';
          this.router.navigateByUrl('/login', { replaceUrl: true });
        } catch (e2: any) {
          this.error = this.prettyError(e2);
        }
      } else {
        this.error = this.prettyError(e);
      }
    } finally {
      this.loading = false;
    }
  }

  voltar() {
    this.router.navigateByUrl('/homelogado', { replaceUrl: true });
  }

  private prettyError(e: any): string {
    const code = e?.code || '';
    switch (code) {
      case 'auth/wrong-password': return 'Senha atual incorreta.';
      case 'auth/weak-password': return 'A nova senha é muito fraca.';
      case 'auth/requires-recent-login': return 'Por segurança, faça login novamente.';
      case 'auth/too-many-requests': return 'Muitas tentativas. Aguarde e tente novamente.';
      default: return e?.message || 'Ocorreu um erro. Tente novamente.';
    }
  }
}
