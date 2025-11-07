import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, IonButton, 
  IonGrid, IonRow, IonCol, AlertController, LoadingController, IonicSafeString 
} from '@ionic/angular/standalone';
import { Auth } from '@angular/fire/auth';


// ⬇️ caminho do service (em src/app/services/historico.service.ts)
import { HistoricoService } from '../historico.service';

@Component({
  selector: 'app-homelogado',
  standalone: true,
  templateUrl: './homelogado.page.html',
  styleUrls: ['./homelogado.page.scss'],
  imports: [CommonModule, IonContent, IonHeader, IonTitle, IonToolbar, IonButton, IonGrid, IonRow, IonCol],
})
export class HomeLogadoPage {
  constructor(
    private router: Router,
    private auth: Auth,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private historico: HistoricoService
  ) {}

  goRun() {
    this.router.navigateByUrl('/run');
  }

  // ✅ abre ALERTA com últimas corridas (sem navegar)
  async mostrarHistorico() {
  const loading = await this.loadingCtrl.create({ message: 'Carregando histórico...' });
  await loading.present();

  try {
    const corridas = (await this.historico.listarUltimasCorridas(5)) || [];
    console.log('📊 Corridas carregadas:', corridas);

    await loading.dismiss();

    if (!corridas.length) {
      const alert = await this.alertCtrl.create({
        header: 'Histórico vazio 🏃‍♂️',
        message: 'Você ainda não registrou nenhuma corrida.',
        buttons: ['OK'],
      });
      return alert.present();
    }

    const toDate = (v: any): Date =>
      v?.toDate ? v.toDate() : (v instanceof Date ? v : new Date(v ?? Date.now()));

    const fmtDur = (sec: number) => {
      const n = Number(sec) || 0;
      const h = Math.floor(n / 3600).toString().padStart(2, '0');
      const m = Math.floor((n % 3600) / 60).toString().padStart(2, '0');
      const s = Math.floor(n % 60).toString().padStart(2, '0');
      return `${h}:${m}:${s}`;
    };

    const fmtPace = (p: number) => {
      const n = Number(p);
      if (!isFinite(n) || n <= 0) return '--';
      const m = Math.floor(n / 60);
      const s = Math.floor(n % 60).toString().padStart(2, '0');
      return `${m}:${s} min/km`;
    };

    // ✨ HTML bonito, legível e seguro
    const html = `
      <div style="
        text-align:left;
        line-height:1.5;
        font-size:14px;
        color:#fff;
      ">
        ${corridas.map((c: any, i: number) => {
          const data = toDate(c.fim || c.criadoEm)
  .toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
          const dist = (Number(c.distancia) || 0).toFixed(2);
          const dur = fmtDur(c.duracao);
          const pace = fmtPace(c.ritmo);

          return `
            <div style="padding:8px 0; border-bottom:1px solid rgba(255,255,255,0.15)">
              <div style="font-weight:600; color:#6cf;">🏁 Corrida ${i + 1}</div>
              <div>📅 ${data}</div>
              <div>📏 ${dist} km</div>
              <div>⏱ ${dur} • 🐢 ${pace}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const alert = await this.alertCtrl.create({
      header: 'Últimas Corridas',
      message: html,
      buttons: ['Fechar'],
    });

    await alert.present();

  } catch (err: any) {
    console.error('❌ Erro ao carregar histórico:', err);
    await loading.dismiss();

    const alert = await this.alertCtrl.create({
      header: 'Erro',
      message: `Não foi possível carregar o histórico.<br><small>${err?.message || err}</small>`,
      buttons: ['OK'],
    });
    await alert.present();
  }

  // ⏱ funções auxiliares internas:
  function formatDur(sec: number) {
    if (!sec || sec < 0) return '--';
    const h = Math.floor(sec / 3600).toString().padStart(2, '0');
    const m = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function formatPace(p: number) {
    if (!p || !isFinite(p)) return '--';
    const m = Math.floor(p / 60);
    const s = Math.floor(p % 60).toString().padStart(2, '0');
    return `${m}:${s} min/km`;
  }
}



  async logout() {
    await this.auth.signOut();
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }
}
