import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonInput, 
  IonButton, 
  NavController, 
  LoadingController, 
  AlertController 
} from '@ionic/angular/standalone';

import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonInput,
    IonButton,
    CommonModule,
    FormsModule,
  ],
})
export class CadastroPage {

  email: string = '';
  senha: string = '';

  private auth = inject(Auth);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);

  constructor() {}

  async cadastrarUsuario() {
    const loading = await this.loadingCtrl.create({
      message: 'Cadastrando...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await createUserWithEmailAndPassword(this.auth, this.email, this.senha);

      await loading.dismiss();
      const successAlert = await this.alertCtrl.create({
        header: 'Cadastro realizado!',
        message: 'Usuário criado com sucesso.',
        buttons: [{
          text: 'OK',
          handler: () => {
            this.navCtrl.navigateRoot('/home');
          }
        }],
      });

      await successAlert.present();

    } catch (error: any) {
      await loading.dismiss();

      const alert = await this.alertCtrl.create({
        header: 'Erro no cadastro',
        message: this.formatarErro(error.code),
        buttons: ['OK'],
      });

      await alert.present();
    }
  }

  private formatarErro(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/weak-password':
        return 'A senha deve ter pelo menos 6 caracteres.';
      default:
        return 'Erro ao cadastrar. Tente novamente.';
    }
  }

  voltarHome() {
    this.navCtrl.navigateRoot('/home');
  }
}
