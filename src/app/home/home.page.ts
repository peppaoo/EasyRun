import { Component } from '@angular/core';
import { IonHeader, IonContent, IonButton } from '@ionic/angular/standalone';
// PASSO 1: Importe o RouterLink do módulo de rotas do Angular
import { RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader, 
    IonContent, 
    IonButton,
    RouterLink
  ],
  standalone: true, 
})
export class HomePage {
  constructor() {}
}