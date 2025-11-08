import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
  IonContent, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonRefresher, IonRefresherContent, IonButton, IonIcon,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refresh, trash } from 'ionicons/icons';
import { AlertController } from '@ionic/angular';
import { HistoricoService } from '../historico.service';

@Component({
  selector: 'app-historico',
  standalone: true,
  templateUrl: './historico.page.html',
  styleUrls: ['./historico.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton,
    IonContent, IonList, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonRefresher, IonRefresherContent, IonButton, IonIcon,
    IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class HistoricoPage {
  corridas: any[] = [];

  pageSize = 10;
  shown = 0;

  constructor(
    private historico: HistoricoService,
    private alertCtrl: AlertController
  ) {
    addIcons({ refresh, trash });
  }

  ionViewWillEnter() { this.recarregar(); }

  async recarregar(ev?: any) {
    try {

      this.corridas = await this.historico.listarUltimasCorridas(200);
      this.shown = Math.min(this.pageSize, this.corridas.length);
    } catch (e: any) {
      const a = await this.alertCtrl.create({
        header: 'Erro',
        message: e?.message || 'Falha ao carregar histórico.',
        buttons: ['OK']
      });
      await a.present();
    } finally {
      ev?.target?.complete?.();
    }
  }

  get visiveis() {
    return this.corridas.slice(0, this.shown);
  }

  loadMore(ev: any) {

    setTimeout(() => {
      this.shown = Math.min(this.shown + this.pageSize, this.corridas.length);
      ev.target.complete();
      if (this.shown >= this.corridas.length) ev.target.disabled = true;
    }, 250);
  }

  dataStr(c: any) {
    const d = (c?.fim?.toDate?.() || c?.criadoEm?.toDate?.() || c?.criadoEm || new Date());
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
  durStr(seg: any) {
    const n = Number(seg) || 0;
    const h = Math.floor(n/3600).toString().padStart(2,'0');
    const m = Math.floor((n%3600)/60).toString().padStart(2,'0');
    const s = Math.floor(n%60).toString().padStart(2,'0');
    return `${h}:${m}:${s}`;
  }
  paceStr(p: any) {
    const n = Number(p);
    if (!isFinite(n) || n <= 0) return '--';
    const m = Math.floor(n/60);
    const s = Math.floor(n%60).toString().padStart(2,'0');
    return `${m}:${s} min/km`;
  }
}
