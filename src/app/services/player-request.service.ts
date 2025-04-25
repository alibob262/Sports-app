import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc, where, collectionData, query, getDocs } from '@angular/fire/firestore';
import { Observable } from 'rxjs';  // <-- Import Observable
import { PlayerRequest } from '../models/player-request.model';

@Injectable({ providedIn: 'root' })
export class PlayerRequestService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  // Submit a new request
  async addRequest(request: Omit<PlayerRequest, 'id' | 'createdAt'>) {
    const requestsRef = collection(this.firestore, 'playerRequests');
    await addDoc(requestsRef, {
      ...request,
      userId: this.auth.currentUser?.uid,
      createdAt: new Date(),
    });
  }

  // Fetch requests by position (for team owners)
  getRequestsByPosition(position: string): Observable<PlayerRequest[]> {
    const requestsRef = collection(this.firestore, 'playerRequests');
    const q = query(requestsRef, where('position', '==', position));
    return collectionData(q, { idField: 'id' }) as Observable<PlayerRequest[]>;  // <-- Return as Observable
  }

  // Fetch players by sport and position using Observable
  getPlayersBySportAndPosition(sport: string, position: string): Observable<any[]> {
    console.log('Fetching players for:', sport, position);
    
    const q = query(
      collection(this.firestore, 'playerRequests'),
      where('sport', '==', sport),
      where('position', '==', position)
    );
    
    return collectionData(q, { idField: 'id' }) as Observable<any[]>;  // <-- Return as Observable
  }
}