import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    importProvidersFrom(  // For Material components
      MatDialogModule
    ),
    provideFirebaseApp(() => initializeApp({ 
      projectId: "malaabna-sports-app-2025",
      appId: "1:516750375189:web:3b26eebc27d5e977ae511c",
      databaseURL: "https://malaabna-sports-app-2025-default-rtdb.europe-west1.firebasedatabase.app",
      storageBucket: "malaabna-sports-app-2025.firebasestorage.app",
      apiKey: "AIzaSyCz2_UDyQs7UV8CFiruVWq2Qwvz6vyJtrQ",
      authDomain: "malaabna-sports-app-2025.firebaseapp.com",
      messagingSenderId: "516750375189"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage())
  ]
};