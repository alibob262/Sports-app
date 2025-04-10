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

  async addDummyCourts() {
    const courtsRef = collection(this.firestore, 'courts');


    const courtData = [
      // Court 1: Very close (Downtown Beirut)
      {
        name: 'Downtown Sports Hub',
        sports: ['basketball', 'padel'],
        type: 'indoor',
        location: {
          address: '123 Downtown Ave, Beirut',
          geo: { latitude: 33.8965, longitude: 35.5007 }, // Near city center
          phone: '+961 1 111111'
        },
        amenities: ['ac', 'cafe', 'lockers'],
        images: ['downtown1.jpg', 'downtown2.jpg']
      },
      // Court 2: Medium distance (Hamra area)
      {
        name: 'Hamra Athletic Club',
        sports: ['football', 'tennis'],
        type: 'outdoor',
        location: {
          address: '456 Hamra St, Beirut',
          geo: { latitude: 33.8992, longitude: 35.4831 }, // 2-3km from center
          phone: '+961 1 222222'
        },
        amenities: ['showers', 'parking'],
        images: ['hamra1.jpg', 'hamra2.jpg']
      },
      // Court 3: Far away (Jounieh area)
      {
        name: 'Jounieh Sports Complex',
        sports: ['football', 'basketball', 'volleyball'],
        type: 'indoor',
        location: {
          address: '789 Coastal Rd, Jounieh',
          geo: { latitude: 33.9800, longitude: 35.6175 }, // ~20km north
          phone: '+961 9 333333'
        },
        amenities: ['restaurant', 'pool', 'sauna'],
        images: ['jounieh1.jpg', 'jounieh2.jpg']
      }
    ];

    try {
      // Add all courts in a batch
      const promises = courtData.map(court => addDoc(courtsRef, court));
      await Promise.all(promises);
      console.log('3 new test courts added successfully!');
      return true;
    } catch (error) {
      console.error('Error adding dummy courts:', error);
      return false;
    }
  }
}
