import { inject, Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc, where, collectionData, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
    return collectionData(q, { idField: 'id' }) as Observable<PlayerRequest[]>;
  }
}