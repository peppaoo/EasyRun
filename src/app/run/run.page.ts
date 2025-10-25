import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

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

  tempo = 0;
  distancia = 0;
  lastPosition: any = null;
  timerInterval: any;

  tempoDisplay = '00:00:00';
  paceDisplay = '0:00';

  pathCoords: any[] = [];
  routePolyline: any;
  userMarker: any = null; // 🔹 marcador do boneco

  constructor(private router: Router) {}

  ngAfterViewInit() {
    this.initMap();
  }

  ngOnDestroy() {
    this.clearTracking();
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

        // 🔹 Pino mostrando onde você está (boneco)
        this.userMarker = new google.maps.Marker({
          position: posicaoInicial,
          map: this.map,
          title: 'Você está aqui 🏁',
          icon: {
            url: 'assets/boneco.png',
            scaledSize: new google.maps.Size(50, 50), // ajusta tamanho se quiser
            anchor: new google.maps.Point(25, 25),
          },
        });

        // 🔹 Cria a linha da rota
        this.routePolyline = new google.maps.Polyline({
          path: this.pathCoords,
          geodesic: true,
          strokeColor: '#007AFF',
          strokeOpacity: 1.0,
          strokeWeight: 5,
        });

        this.routePolyline.setMap(this.map);

        // 🔹 Atualiza a posição do boneco em tempo real
        this.watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const currentPos = new google.maps.LatLng(lat, lng);

            // Atualiza posição do boneco
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
    // Usa o plugin nativo de localização do Capacitor
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const currentPos = new google.maps.LatLng(lat, lng);

    // Atualiza mapa e marcador (boneco)
    if (this.map) {
      this.map.setCenter(currentPos);
      this.map.setZoom(19); // estilo Strava
    }

    if (this.userMarker) {
      this.userMarker.setPosition(currentPos);
    } else {
      // Se o marcador ainda não existir, cria um novo
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
        this.userMarker.setPosition(currentPos); // 🧍 boneco segue você

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

  goHome() {
    this.clearTracking();
    this.router.navigate(['/home']);
  }
}
