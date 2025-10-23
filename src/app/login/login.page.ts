import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// 1. Importações do Ionic Standalone (Adicionando os componentes necessários)
import { IonContent, IonHeader, IonInput, IonButton, IonInputPasswordToggle, NavController, LoadingController, AlertController } from '@ionic/angular/standalone';

// 2. Importações do Firebase (SDK Modular)
import { Auth, signInWithEmailAndPassword } from 'firebase/auth';

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
    CommonModule, 
    FormsModule,
    IonInputPasswordToggle,
    RouterLink,
  ]
})
export class LoginPage implements OnInit {

  // Variáveis para capturar os dados do formulário (ligadas via [(ngModel)] no HTML)
  email: string = '';
  senha: string = '';

  // 3. Injeção de Dependências (Usando inject() para Standalone Components)
  private auth: Auth = inject(Auth);
  private navCtrl = inject(NavController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);


  constructor() { }

  ngOnInit() {
  }

  /**
   * Função principal para realizar o login com email e senha.
   * Chamada pelo (click) do botão no template.
   */
  async fazerLogin() {
    const loading = await this.loadingCtrl.create({
      message: 'Autenticando...'
    });
    await loading.present();

    try {
      // 4. CHAMADA AO FIREBASE AUTH
      // Tenta fazer o login com as credenciais fornecidas
      await signInWithEmailAndPassword(this.auth, this.email, this.senha);
      
      await loading.dismiss();
      
      // 5. NAVEGAÇÃO
      // Se for bem-sucedido, navega para a página '/home' e limpa o histórico de navegação (root)
      this.navCtrl.navigateRoot('/home'); 

    } catch (error: any) {
      await loading.dismiss();
      
      // 6. TRATAMENTO DE ERROS
      // Exibe uma mensagem de erro amigável ao usuário
      const alert = await this.alertCtrl.create({
        header: 'Erro no Login',
        message: this.formatarErro(error.code),
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  /**
   * Função auxiliar para traduzir códigos de erro do Firebase.
   */
  private formatarErro(errorCode: string): string {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Usuário não encontrado. Verifique o e-mail.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/invalid-email':
        return 'Formato de e-mail inválido.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Tente novamente mais tarde.';
      default:
        return 'Erro desconhecido. Tente novamente.';
    }
  }
}
