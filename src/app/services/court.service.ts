import { Injectable } from '@angular/core';
import { Firestore, collection, where, collectionData, query, addDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Court {
  id?: string;
  name: string;
  sports: string[];
  type: 'indoor' | 'outdoor';
  location: {
    address: string;
    geo: { latitude: number; longitude: number };
    phone: string;
  };
  amenities?: string[];
  images?: string[];
}

@Injectable({ providedIn: 'root' })
export class CourtService {
  constructor(private firestore: Firestore) {}

  // Existing function to get courts with filters
  getCourts(filters?: { sports?: string[], type?: string }): Observable<Court[]> {
    let courtsRef = collection(this.firestore, 'courts');
    let q = query(courtsRef);

    if (filters?.sports?.length) {
      q = query(q, where('sports', 'array-contains-any', filters.sports));
    }

    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }

    return collectionData(q, { idField: 'id' }) as Observable<Court[]>;
  }

  // Function to add dummy courts
  async addDummyCourts() {
    const courtsRef = collection(this.firestore, 'courts');

    const courtData = [
      {
        name: 'Urban Sports Arena',
        sports: ['football', 'basketball', 'tennis'],
        type: 'indoor',
        location: {
          address: '456 Sports Ave, Beirut',
          geo: { latitude: 33.9023, longitude: 35.4952 },
          phone: '+961 1 234567',
        },
        amenities: ['showers', 'wifi', 'parking'],
        images: ['url1.jpg', 'url2.jpg'],
      },
      {
        name: 'Beachside Courts',
        sports: ['football', 'volleyball', 'padel'],
        type: 'outdoor',
        location: {
          address: '789 Beach St, Beirut',
          geo: { latitude: 33.9010, longitude: 35.4855 },
          phone: '+961 1 987654',
        },
        amenities: ['showers', 'restaurant', 'parking'],
        images: ['beach1.jpg', 'beach2.jpg'],
      },
      // Add more courts here...
    ];

    // Add each court to Firestore
    for (let court of courtData) {
      await addDoc(courtsRef, court);
    }

    console.log('Dummy courts added successfully!');
  }
}
