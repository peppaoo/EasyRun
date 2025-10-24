import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

// Importações do Firebase SDK e AngularFire
import { initializeApp, provideFirebaseApp } from '@angular/fire/app'; // Função do AngularFire para inicialização
import { getAuth, provideAuth } from '@angular/fire/auth'; // Função do AngularFire para autenticação

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment'; // Importação CORRETA

if (environment.production) {
  enableProdMode();
}

// Suas configurações do Firebase (vem do environment.ts)
const firebaseConfig = environment.firebase;

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),

    // 1. Inicializa o Firebase (App) - Usando provideFirebaseApp()
    provideFirebaseApp(() => initializeApp(firebaseConfig)),

    // 2. Disponibiliza o serviço de Autenticação (Auth) - Usando provideAuth()
    // Isso injeta o serviço 'Auth' que você precisa nos componentes
    provideAuth(() => getAuth()),
    
    // ... outros provedores do Firebase (Firestore, Storage, etc.)
  ],
});
