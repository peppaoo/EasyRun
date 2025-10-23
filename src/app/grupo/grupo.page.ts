import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; // ← importa o Router
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonFooter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonList,
  IonButton,
  IonItem,
  IonThumbnail,
  IonLabel,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.page.html',
  styleUrls: ['./grupo.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    CommonModule,
    FormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonFooter,
    IonList,
    IonButton,
    IonItem,
    IonThumbnail,
    IonLabel,
  ],
})
export class GrupoPage implements OnInit {
  constructor(private router: Router) {} // ← injeta o Router

  ngOnInit() {}

  goHome() {
    this.router.navigateByUrl('/home', { replaceUrl: true }); // ← navega pro Home
  }
}
