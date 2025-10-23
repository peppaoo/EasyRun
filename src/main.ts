import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// Importações do Firebase
import { initializeApp } from 'firebase/app';
import { provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth'; // Importe para Autenticação
// import { getFirestore, provideFirestore } from '@angular/fire/firestore'; // Exemplo para Firestore

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Suas configurações do Firebase
const firebaseConfig = environment.firebase;

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),

    // 1. Inicializa o Firebase (App)
    importProvidersFrom(provideFirebaseApp(() => initializeApp(firebaseConfig))),

    // 2. Disponibiliza o serviço de Autenticação (Auth)
    importProvidersFrom(provideAuth(() => getAuth())),
    
    // ... outros provedores do Firebase (Firestore, Storage, etc.)
  ],
});