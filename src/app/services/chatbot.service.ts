import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = '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';
  private firestore = inject(Firestore);

  constructor(private http: HttpClient) {}

  sendChatMessage(prompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: "You are a chatbot for a sports app 'Malaabna'. You provide information about teams, courts, player requests, and related sports topics. Please only respond with data relevant to the app. If a user asks about unrelated topics, tell them you're designed for sports-related queries."
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => response.choices[0].message.content.trim()),
      catchError(error => {
        console.error('API Error:', error);
        return of('Sorry, I encountered an error. Please try again.');
      })
    );
  }

  getPlayerRequests(): Observable<any[]> {
    const requestsRef = collection(this.firestore, 'playerRequests');
    return collectionData(requestsRef, { idField: 'id' }).pipe(
      catchError(error => {
        console.error('Firestore Error:', error);
        return of([]);
      })
    );
  }
}