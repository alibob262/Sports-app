import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, orderBy, collectionData } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

interface Notification {
  id?: string;
  userId: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
  data?: Record<string, any>; // More specific type
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async sendNotification(
    userId: string,
    message: string,
    type: string,
    data: Record<string, any> = {} // Default empty object
  ): Promise<void> {
    try {
      await addDoc(collection(this.firestore, 'notifications'), {
        userId,
        message,
        type,
        data,
        read: false,
        createdAt: new Date()
      });
      console.log('Notification sent successfully');
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  getUserNotifications(userId: string): Observable<Notification[]> {
    const q = query(
      collection(this.firestore, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return collectionData(q, { idField: 'id' }) as Observable<Notification[]>;
  }

  markAsRead(notificationId: string): Promise<void> {
    return Promise.resolve();
  }
}