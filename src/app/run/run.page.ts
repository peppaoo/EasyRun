import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

declare var google: any;

@Component({
  selector: 'app-run',
  templateUrl: './run.page.html',
  styleUrls: ['./run.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class RunPage implements AfterViewInit, OnDestroy {
  map: any;
  watchId: any;
  hasStarted = false;
  isPaused = false;

  tempo = 0;
  distancia = 0;
  lastPosition: any = null;
  timerInterval: any;

  tempoDisplay = '00:00:00';
  paceDisplay = '0:00';

  pathCoords: any[] = [];
  routePolyline: any;
  userMarker: any = null;

  avisoDistancia = 1; // em km
  avisoTexto = '1km'; // texto digitado pelo usuário
  proximoAviso = 1;

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.clearTracking();
  }

  // 🔊 Fala (usada durante corrida)
  async falar(texto: string) {
    try {
      await TextToSpeech.speak({
        text: texto,
        lang: 'pt-BR',
        rate: 1.0,
        pitch: 1.0,
      });
    } catch (error) {
      console.error('Erro ao falar:', error);
    }
  }

  // ⚙️ Lê o texto e converte pra km automaticamente
  atualizarAviso() {
    if (!this.avisoTexto) return;

    const texto = this.avisoTexto.trim().toLowerCase();

    if (texto.endsWith('m')) {
      const valor = parseFloat(texto.replace('m', '').replace(',', '.'));
      this.avisoDistancia = valor / 1000; // metros → km
    } else if (texto.endsWith('km')) {
      const valor = parseFloat(texto.replace('km', '').replace(',', '.'));
      this.avisoDistancia = valor;
    } else {
      // Se não colocar unidade, assume km
      const valor = parseFloat(texto.replace(',', '.'));
      this.avisoDistancia = valor;
    }

    if (isNaN(this.avisoDistancia) || this.avisoDistancia <= 0) {
      alert('⚠️ Digite uma distância válida. Ex: 400m ou 1.5km');
      this.avisoDistancia = 1;
    }

    console.log(`⚙️ Avisar a cada ${this.avisoDistancia} km`);
  }

  // 🗺️ Inicializa o mapa
  initMap() {
    const mapEl = document.getElementById('map') as HTMLElement;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const posicaoInicial = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        this.map = new google.maps.Map(mapEl, {
          center: posicaoInicial,
          zoom: 18,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        this.userMarker = new google.maps.Marker({
          position: posicaoInicial,
          map: this.map,
          icon: {
            url: 'assets/boneco.png',
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 25),
          },
          title: 'Você está aqui 🏁',
        });

        this.routePolyline = new google.maps.Polyline({
          path: [],
          geodesic: true,
          strokeColor: '#007AFF',
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });
        this.routePolyline.setMap(this.map);
      },
      (err) => {
        console.error('Erro ao pegar localização inicial:', err);
        alert('Ative o GPS e tente novamente.');
      },
      { enableHighAccuracy: true }
    );
  }

  async centerMapOnUser() {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const currentPos = new google.maps.LatLng(lat, lng);

      this.map?.setCenter(currentPos);
      this.map?.setZoom(19);
      this.userMarker?.setPosition(currentPos);
    } catch (error) {
      console.error('Erro ao centralizar:', error);
    }
  }

  // 🏃 Inicia corrida
  startRun() {
    this.atualizarAviso(); // 👈 lê o valor digitado

    this.hasStarted = true;
    this.isPaused = false;
    this.tempo = 0;
    this.distancia = 0;
    this.pathCoords = [];
    this.routePolyline.setPath(this.pathCoords);
    this.lastPosition = null;
    this.proximoAviso = this.avisoDistancia;

    // ⏱️ Timer
    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.tempo++;
        this.updateDisplays();
      }
    }, 1000);

    // 📍 Rastreamento
    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (this.isPaused) return;

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const currentPos = new google.maps.LatLng(lat, lng);

        if (this.lastPosition) {
          const delta = google.maps.geometry?.spherical?.computeDistanceBetween(
            this.lastPosition,
            currentPos
          );
          if (delta && !isNaN(delta)) {
            this.distancia += delta / 1000;
          }
        }

        this.pathCoords.push(currentPos);
        this.routePolyline.setPath(this.pathCoords);
        this.userMarker.setPosition(currentPos);
        this.map.setCenter(currentPos);
        this.lastPosition = currentPos;

        this.updateDisplays();
        this.checkAviso();
      },
      (err) => console.error('Erro no watchPosition:', err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }
isSpeaking = false; // adiciona no topo da classe (junto com as outras variáveis)

async checkAviso() {
  // se já estiver falando, não repete
  if (this.isSpeaking) return;

  if (this.distancia >= this.proximoAviso) {
    this.isSpeaking = true; // bloqueia novas falas temporariamente

    const totalMin = Math.floor(this.tempo / 60);
    const totalSeg = this.tempo % 60;
    const tempoFalado =
      `${totalMin} ${totalMin === 1 ? 'minuto' : 'minutos'} e ` +
      `${totalSeg} ${totalSeg === 1 ? 'segundo' : 'segundos'}`;

    const paceFormatado =
      this.paceDisplay.replace(':', ' minutos e ') + ' por quilômetro';

    const texto = `Você completou ${this.proximoAviso.toFixed(
      2
    )} quilômetros. Tempo total: ${tempoFalado}. Pace médio: ${paceFormatado}.`;

    try {
      await this.falar(texto); // espera a fala terminar
    } catch (err) {
      console.error('Erro ao falar:', err);
    }

    this.proximoAviso += this.avisoDistancia; // define próximo marco

    // desbloqueia a fala depois de 3 segundos (pra evitar repetições)
    setTimeout(() => {
      this.isSpeaking = false;
    }, 3000);
  }
}

  pauseRun() {
    this.isPaused = true;
  }

  resumeRun() {
    this.isPaused = false;
  }

  stopRun() {
    this.clearTracking();

    const distanciaFinal = this.distancia.toFixed(2);
    const tempoFinal = this.tempoDisplay;
    const paceFinal = this.paceDisplay;

    alert(
      `🏁 Corrida finalizada!\n\n` +
      `Distância total: ${distanciaFinal} km\n` +
      `Tempo total: ${tempoFinal}\n` +
      `Pace médio: ${paceFinal} / km`
    );
  }

  clearTracking() {
    if (this.watchId) navigator.geolocation.clearWatch(this.watchId);
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.hasStarted = false;
    this.isPaused = false;
  }

  updateDisplays() {
    const h = Math.floor(this.tempo / 3600);
    const m = Math.floor((this.tempo % 3600) / 60);
    const s = this.tempo % 60;
    this.tempoDisplay = `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

    if (this.distancia > 0) {
      const pace = this.tempo / 60 / this.distancia;
      const paceMin = Math.floor(pace);
      const paceSec = Math.round((pace - paceMin) * 60);
      this.paceDisplay = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;
    } else {
      this.paceDisplay = '0:00';
    }
  }

  goHome() {
    this.clearTracking();
    this.router.navigate(['/home']);
  }
}
