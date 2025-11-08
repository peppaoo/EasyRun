import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton,
  IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-homelogado',
  standalone: true,
  templateUrl: './homelogado.page.html',
  styleUrls: ['./homelogado.page.scss'],
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonGrid, IonRow, IonCol,
    RouterLink,
  ],
})
export class HomeLogadoPage {
  constructor(private router: Router, private auth: Auth) {}

  goRun() { this.router.navigateByUrl('/run'); }


  goHistorico() { this.router.navigateByUrl('/historico'); }

  async logout() {
    await this.auth.signOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
