import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth'; // Use modular SDK
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideAnimations } from '@angular/platform-browser/animations';
import { importProvidersFrom } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatOptionModule } from '@angular/material/core';

// ReactiveFormsModule
import { ReactiveFormsModule } from '@angular/forms';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    provideAnimations(),
    importProvidersFrom(
      MatFormFieldModule,
      MatInputModule,
      MatSelectModule,
      MatCheckboxModule,
      MatSnackBarModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MatButtonModule,
      MatDialogModule,
      MatDialog,
      MatProgressSpinnerModule,
      MatOptionModule,
      ReactiveFormsModule 
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
    provideAuth(() => getAuth()),  // Using the modular SDK's getAuth function
    provideFirestore(() => getFirestore()),
    provideDatabase(() => getDatabase()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage())
  ]
};
