import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore, addDoc, collection, where, orderBy, collectionData, query } from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async sendNotification(userId: string, message: string, type: string): Promise<void> {
    await addDoc(collection(this.firestore, 'notifications'), {
      userId,
      message,
      type,
      read: false,
      createdAt: new Date()
    });
  }

  getUserNotifications(userId: string): Observable<Notification[]> {
    const q = query(
      collection(this.firestore, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }
}