import { Component } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/angular/standalone';
// PASSO 1: Importe o RouterLink do módulo de rotas do Angular
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonButton,
    RouterLink // PASSO 2: Adicione o RouterLink ao array de imports
  ],
  standalone: true, // Adicionado para clareza (assumindo que estava faltando)
})
export class HomePage {
  constructor() {}
}