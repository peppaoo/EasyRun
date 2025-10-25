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

  // ⚙️ Configuração de aviso
  avisoDistancia = 1; // padrão: 1 km
  unidadeAviso: 'km' | 'm' = 'km';
  proximoAviso = 1; // próximo marco a ser falado (em km)

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.clearTracking();
  }

  // 🔊 fala usando o alto-falante do celular
  async falar(texto: string) {
    try {
      await TextToSpeech.speak({
        text: texto,
        lang: 'pt-BR',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'playback',
      });
    } catch (error) {
      console.error('Erro ao falar:', error);
    }
  }

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
          title: 'Você está aqui 🏁',
          icon: {
            url: 'assets/boneco.png',
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 25),
          },
        });

        this.routePolyline = new google.maps.Polyline({
          path: this.pathCoords,
          geodesic: true,
          strokeColor: '#007AFF',
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });

        this.routePolyline.setMap(this.map);

        // rastreamento inicial
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const currentPos = new google.maps.LatLng(lat, lng);

            this.userMarker.setPosition(currentPos);
            this.map.setCenter(currentPos);
          },
          (err) => console.error('Erro ao rastrear localização:', err),
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
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
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const currentPos = new google.maps.LatLng(lat, lng);

      if (this.map) {
        this.map.setCenter(currentPos);
        this.map.setZoom(19);
      }

      if (this.userMarker) {
        this.userMarker.setPosition(currentPos);
      } else {
        this.userMarker = new google.maps.Marker({
          position: currentPos,
          map: this.map,
          icon: {
            url: 'assets/boneco.png',
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 25),
          },
          title: 'Você está aqui 🏁',
        });
      }
    } catch (error) {
      console.error('Erro ao centralizar:', error);
      alert('❌ Não foi possível centralizar. Verifique o GPS e tente novamente.');
    }
  }

  startRun() {
    this.hasStarted = true;
    this.isPaused = false;
    this.tempo = 0;
    this.distancia = 0;
    this.lastPosition = null;
    this.pathCoords = [];
    this.routePolyline.setPath(this.pathCoords);
    this.proximoAviso = this.avisoDistancia / (this.unidadeAviso === 'm' ? 1000 : 1);

    this.timerInterval = setInterval(() => {
      if (!this.isPaused) {
        this.tempo++;
        this.updateDisplays();
      }
    }, 1000);

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => {
        if (this.isPaused) return;

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const currentPos = new google.maps.LatLng(lat, lng);

        this.pathCoords.push(currentPos);
        this.routePolyline.setPath(this.pathCoords);

        if (this.lastPosition) {
          const delta = google.maps.geometry.spherical.computeDistanceBetween(
            this.lastPosition,
            currentPos
          );
          this.distancia += delta / 1000;
        }

        this.lastPosition = currentPos;
        this.map.setCenter(currentPos);
        this.userMarker.setPosition(currentPos);

        this.updateDisplays();
        this.checkAviso(); // ✅ checa e fala
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }

  async checkAviso() {
    if (this.distancia >= this.proximoAviso) {
      const tempoFormatado = this.tempoDisplay.replace(/^0+/, '');
      const paceFormatado = this.paceDisplay.replace(':', ' minutos e ') + ' por quilômetro';

      const texto = `Você completou ${this.proximoAviso.toFixed(2)} quilômetros.
      Tempo total: ${tempoFormatado}.
      Pace médio: ${paceFormatado}.`;

      await this.falar(texto);

      this.proximoAviso += this.avisoDistancia / (this.unidadeAviso === 'm' ? 1000 : 1);
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
    const textoFinal = `Corrida finalizada!
    Distância total: ${this.distancia.toFixed(2)} quilômetros.
    Tempo total: ${this.tempoDisplay.replace(':', ' minutos e ').replace(':', ' segundos')}.
    Pace médio: ${this.paceDisplay.replace(':', ' minutos e ')} por quilômetro.`;
    this.falar(textoFinal);
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
