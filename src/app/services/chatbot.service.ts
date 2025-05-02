import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { Firestore, collection, collectionData, addDoc, query, where, doc, getDoc } from '@angular/fire/firestore';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

interface ReservationData {
  location?: string;
  date?: string;
  time?: string;
  sport?: string;
  courtId?: string;
  courtName?: string;
}

interface ReservationState {
  inProgress: boolean;
  collectedData: ReservationData;
  currentStep: number;
}
interface Court {
  id: string;
  name: string;
  location: {
    address: string;
    area?: string;
    [key: string]: any; // For any additional properties
  };
  amenities?: string[];
  contact?: {
    phone?: string;
    [key: string]: any;
  };
  sportType: string;
  [key: string]: any; // For any other properties
}
@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private firestore = inject(Firestore);
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = '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';


  private playerSearchPhrases = [
    'find player', 'looking for player', 'need player', 
    'available players', 'players without team', 'free agents',
    'who needs team', 'search player', 'player search',
  ];

  private teamSearchPhrases = [
    'find team', 'looking for team', 'need team',
    'available teams', 'teams recruiting', 'join team',
    'who needs players', 'search team', 'team search'
  ];

  private reservationState: ReservationState = {
    inProgress: false,
    collectedData: {},
    currentStep: 0
  };

  constructor(private http: HttpClient) {}

  sendChatMessage(prompt: string): Observable<string> {
    const lowerPrompt = prompt.toLowerCase();
    
    // Check if we're in reservation flow
    if (this.reservationState.inProgress) {
      // Check if user is selecting a court number
      const courtNumber = parseInt(prompt);
      if (!isNaN(courtNumber)) {
        return this.confirmReservation(courtNumber);
      }
      return this.handleReservationFlow(prompt);
    }
    
    // Check for court reservation requests
    if (this.isCourtReservationRequest(lowerPrompt)) {
      return this.startCourtReservation();
    }
    
    // Check for player requests
    if (this.isFootballPlayerRequest(lowerPrompt)) {
      return this.handlePlayerSearchRequest();
    }
    
    // Check for team requests
    if (this.isTeamSearchRequest(lowerPrompt)) {
      return this.handleTeamSearchRequest();
    }
    
    // Fallback to generic chat
    return this.handleGenericChat(prompt);
  }

  // Court Reservation Methods
  private isCourtReservationRequest(prompt: string): boolean {
    const triggers = [
      'reserve court', 'book court', 'court reservation',
      'find court', 'available courts', 'need court',
      'looking for court', 'play football', 'play basketball'
    ];
    return triggers.some(phrase => prompt.includes(phrase));
  }

  private startCourtReservation(): Observable<string> {
    this.reservationState = {
      inProgress: true,
      collectedData: {},
      currentStep: 0
    };
    return of("Let's reserve a court! Please provide:\n1. Location (e.g. Beirut, Hamra)\n2. Date (DD/MM/YYYY)\n3. Time (HH:MM)\n4. Sport type\n\nYou can provide all at once or one by one.");
  }

  private handleReservationFlow(prompt: string): Observable<string> {
    // Extract information from user input
    this.extractReservationData(prompt);
    
    // Check if we have all required data
    if (this.hasAllReservationData()) {
      return this.processCourtReservation();
    }
    
    // Ask for missing information
    return this.requestMissingReservationData();
  }

  private extractReservationData(prompt: string): void {
    // Extract location
    const locations = ['hamra', 'beirut', 'achrafieh', 'verdun'];
    const foundLocation = locations.find(loc => prompt.includes(loc));
    if (foundLocation) {
      this.reservationState.collectedData.location = foundLocation;
    }

    // Extract date
    const dateMatch = prompt.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/);
    if (dateMatch) {
      this.reservationState.collectedData.date = dateMatch[0];
    }

    // Extract time
    const timeMatch = prompt.match(/\d{1,2}:\d{2}/);
    if (timeMatch) {
      this.reservationState.collectedData.time = timeMatch[0];
    }

    // Extract sport
    const sports = ['football', 'basketball', 'tennis', 'volleyball'];
    const foundSport = sports.find(sport => prompt.includes(sport));
    if (foundSport) {
      this.reservationState.collectedData.sport = foundSport;
    }
  }

  private hasAllReservationData(): boolean {
    const data = this.reservationState.collectedData;
    return !!data.location && !!data.date && !!data.time && !!data.sport;
  }

  private requestMissingReservationData(): Observable<string> {
    const data = this.reservationState.collectedData;
    const missing = [];
    if (!data.location) missing.push('location');
    if (!data.date) missing.push('date');
    if (!data.time) missing.push('time');
    if (!data.sport) missing.push('sport type');
    return of(`Please provide: ${missing.join(', ')}`);
  }

  private processCourtReservation(): Observable<string> {
    return this.findAvailableCourts().pipe(
      map(courts => {
        if (courts.length === 0) {
          this.reservationState.inProgress = false;
          return "No available courts match your criteria. Please try different parameters.";
        }

        let response = "🏟 Available Courts:\n\n";
        courts.forEach((court, index) => {
          response += `${index + 1}. ${court.name}\n`;
          response += `   - Address: ${court.location?.address || 'N/A'}\n`;
          response += `   - Amenities: ${court.amenities?.join(', ') || 'N/A'}\n`;
          response += `   - Phone: ${court.contact?.phone || 'N/A'}\n\n`;
        });

        response += "Reply with the number of the court you want to reserve.";
        return response;
      }),
      catchError(error => {
        console.error('Court search error:', error);
        this.reservationState.inProgress = false;
        return of("Error searching for courts. Please try again.");
      })
    );
  }

  private findAvailableCourts(): Observable<any[]> {
    const courtsRef = collection(this.firestore, 'courts');
    let q = query(courtsRef);

    // Add filters based on collected data
    if (this.reservationState.collectedData.location) {
      q = query(q, where('location.area', '==', this.reservationState.collectedData.location));
    }
    if (this.reservationState.collectedData.sport) {
      q = query(q, where('sportType', '==', this.reservationState.collectedData.sport));
    }

    return collectionData(q, { idField: 'id' }).pipe(
      tap(courts => console.log('Found courts:', courts)),
      catchError(error => {
        console.error('Firestore error:', error);
        return of([]);
      })
    );
  }

  private confirmReservation(courtNumber: number): Observable<string> {
    return this.findAvailableCourts().pipe(
      switchMap(courts => {
        if (courtNumber < 1 || courtNumber > courts.length) {
          return of("Invalid court number. Please try again.");
        }

        const selectedCourt = courts[courtNumber - 1];
        this.reservationState.collectedData.courtId = selectedCourt.id;
        this.reservationState.collectedData.courtName = selectedCourt.name;

        const reservationsRef = collection(this.firestore, 'reservations');
        return from(addDoc(reservationsRef, {
          ...this.reservationState.collectedData,
          userId: 'current-user-id', // Replace with actual user ID
          status: 'pending',
          createdAt: new Date().toISOString()
        })).pipe(
          map(() => {
            this.reservationState.inProgress = false;
            return `✅ Reservation confirmed for ${selectedCourt.name}! You'll receive a confirmation shortly.`;
          }),
          catchError(error => {
            console.error('Reservation error:', error);
            return of("⚠️ Failed to create reservation. Please try again.");
          })
        );
      })
    );
  }

  // Player Search Methods
  private isFootballPlayerRequest(prompt: string): boolean {
    const footballTriggers = ['football', 'soccer', 'defender', 'striker', 'midfielder', 'goalkeeper'];
    return this.playerSearchPhrases.some(phrase => prompt.includes(phrase)) || 
           footballTriggers.some(trigger => prompt.includes(trigger));
  }

  private handlePlayerSearchRequest(): Observable<string> {
    return this.getAvailablePlayers().pipe(
      map(players => {
        const footballPlayers = players.filter(p => p.sport?.toLowerCase() === 'football');
        
        if (footballPlayers.length === 0) {
          return "No football players available currently.";
        }

        let response = "⚽ Available Football Players:\n\n";
        footballPlayers.slice(0, 5).forEach(player => {
          response += `• ${player.userName || 'Player'}\n`;
          response += `  - Position: ${player.position || 'Any'}\n`;
          if (player.createdAt) {
            response += `  - Active since: ${this.formatDate(player.createdAt)}\n`;
          }
          response += `\n`;
        });
        return response;
      }),
      catchError(error => {
        console.error('Database error:', error);
        return of("⚠️ Couldn't access player data. Please try again later.");
      })
    );
  }

  // Team Search Methods
  private isTeamSearchRequest(prompt: string): boolean {
    return this.teamSearchPhrases.some(phrase => prompt.includes(phrase));
  }

  private handleTeamSearchRequest(): Observable<string> {
    return this.getAvailableTeams().pipe(
      map(teams => {
        if (teams.length === 0) {
          return "No teams are currently recruiting players.";
        }

        let response = "🏟️ Teams Looking for Players:\n\n";
        teams.slice(0, 5).forEach(team => {
          response += `• ${team.name || 'Team'}\n`;
          if (team.sportType) response += `  - Sport: ${team.sportType}\n`;
          if (team.neededPositions) response += `  - Positions needed: ${team.neededPositions.join(', ')}\n`;
          response += `\n`;
        });
        return response;
      }),
      catchError(error => {
        console.error('Database error:', error);
        return of("⚠️ Couldn't access team data. Please try again later.");
      })
    );
  }

  // Database Access Methods
  getAvailablePlayers(): Observable<any[]> {
    const playersRef = collection(this.firestore, 'playerRequests');
    return collectionData(playersRef, { idField: 'id' }).pipe(
      catchError(error => {
        console.error('Firestore Error:', error);
        return of([]);
      })
    );
  }

  getAvailableTeams(): Observable<any[]> {
    const teamsRef = collection(this.firestore, 'teams');
    const q = query(teamsRef, where('isRecruiting', '==', true));
    return collectionData(q, { idField: 'id' }).pipe(
      catchError(error => {
        console.error('Firestore Error:', error);
        return of([]);
      })
    );
  }

  // Generic Chat Method
  private handleGenericChat(prompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { 
          role: 'system', 
          content: "You are a sports chatbot. Respond concisely about courts, players, and teams."
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
        return of("Sorry, I encountered an error. Please try again.");
      })
    );
  }

  private formatDate(timestamp: any): string {
    if (!timestamp) return 'Unknown date';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric'
        });
      }
      return new Date(timestamp).toLocaleDateString();
    } catch (e) {
      console.warn('Date formatting error:', e);
      return 'Unknown date';
    }
  }
}