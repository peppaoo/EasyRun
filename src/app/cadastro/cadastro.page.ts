import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader,  IonInput, IonButton, } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
@Component({
  selector: 'app-cadastro',
  templateUrl: './cadastro.page.html',
  styleUrls: ['./cadastro.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonInput, IonButton, ]
})
export class CadastroPage {
  constructor(private router: Router) {}

  voltarHome() {
    this.router.navigate(['/home']);
  }
}
