import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

declare var google: any;

@Component({
  selector: 'app-run',
  templateUrl: './run.page.html',
  styleUrls: ['./run.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class RunPage implements AfterViewInit, OnDestroy {
  map: any;
  watchId: any;
  hasStarted = false;
  isPaused = false;

  tempo = 0; // segundos
  distancia = 0; // km
  lastPosition: any = null;
  timerInterval: any;

  tempoDisplay = '00:00:00';
  paceDisplay = '0:00';

  // 🔹 Array de coordenadas para desenhar o trajeto
  pathCoords: any[] = [];
  routePolyline: any;

  constructor() {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.clearTracking();
  }

  initMap() {
    const mapEl = document.getElementById('map') as HTMLElement;
    const posicaoInicial = { lat: -23.5505, lng: -46.6333 };

    this.map = new google.maps.Map(mapEl, {
      center: posicaoInicial,
      zoom: 16,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    // 🔹 Cria a linha da rota (vazia no início)
    this.routePolyline = new google.maps.Polyline({
      path: this.pathCoords,
      geodesic: true,
      strokeColor: '#007AFF', // azul padrão iOS
      strokeOpacity: 1.0,
      strokeWeight: 5,
    });

    this.routePolyline.setMap(this.map);
  }

  startRun() {
    this.hasStarted = true;
    this.isPaused = false;
    this.tempo = 0;
    this.distancia = 0;
    this.lastPosition = null;
    this.pathCoords = [];
    this.routePolyline.setPath(this.pathCoords);

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

        // 🔹 Atualiza a rota
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

        this.updateDisplays();
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
  }

  pauseRun() {
    this.isPaused = true;
  }

  resumeRun() {
    this.isPaused = false;
  }

  stopRun() {
    this.clearTracking();
    alert(
      `🏁 Corrida finalizada!\n\nTempo: ${this.tempoDisplay}\nDistância: ${this.distancia.toFixed(
        2
      )} km\nPace médio: ${this.paceDisplay} min/km`
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
}
