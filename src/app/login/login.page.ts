import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonInput, 
  IonButton, 
  IonInputPasswordToggle, 
  NavController, 
  LoadingController, 
  AlertController 
} from '@ionic/angular/standalone';

import { Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonInput,
    IonButton,
    IonInputPasswordToggle,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class LoginPage implements OnInit {

  email: string = '';
  senha: string = '';

  private auth = inject(Auth);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  constructor() {}

  ngOnInit() {}

  async fazerLogin() {
    const loading = await this.loadingCtrl.create({
      message: 'Autenticando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        this.email,
        this.senha
      );

      await loading.dismiss();

      const successAlert = await this.alertCtrl.create({
        header: 'Login realizado!',
        message: `Bem-vindo(a), ${userCredential.user.email}!`,
        buttons: ['OK'],
      });
      await successAlert.present();

      this.navCtrl.navigateRoot('/homelogado');

    } catch (error: any) {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Erro no Login',
        message: this.formatarErro(error.code),
        buttons: ['OK'],
      });
      await alert.present();
    }
  }

 private formatarErro(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Usuário não encontrado. Verifique o e-mail.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Senha incorreta.';
    case 'auth/invalid-email':
      return 'Formato de e-mail inválido.';
    case 'auth/missing-password':
      return 'Informe a senha.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';
    default:
      return 'Erro ao fazer login. Verifique as credenciais.';
  }
}
}
