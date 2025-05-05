import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Firestore, collection, collectionData, query, where } from '@angular/fire/firestore';
import { map, catchError, switchMap, retryWhen, delay, take, tap } from 'rxjs/operators';

interface Court {
  id: string;
  name: string;
  location: {
    address: string;
    geo?: { latitude: number; longitude: number };
    phone?: string;
  };
  amenities?: string[];
  images?: string[];
  sports?: string[];
  type?: string;
  distance?: number;
}

interface PlayerRequest {
  id: string;
  userName: string;
  sport: string;
  position?: string;
  createdAt?: any;
  skillLevel?: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  positionsNeeded?: string[];  // Firebase field
  skillLevel?: string;
  status: string; // "forming" means recruiting
  location?: {
    address?: string;
    courtId?: string;
  };
}

interface UserLocation {
  address?: string;
  coordinates?: { latitude: number; longitude: number };
}

interface ConversationState {
  context?: 'courtLocation' | 'playerSearch' | 'teamSearch';
  userLocation?: UserLocation;
  sportPreference?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  private firestore = inject(Firestore);
  private apiUrl = 'https://api.openai.com/v1/chat/completions';
  private apiKey = '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'; // 👈 Replace with your key
  private lastRequestTime = 0;
  private requestDelay = 1000;
  private cache = new Map<string, string>();
  private conversationState: ConversationState = {};

  constructor(private http: HttpClient) {}

  sendChatMessage(prompt: string): Observable<string> {
    const cachedResponse = this.getCachedResponse(prompt);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    const now = Date.now();
    const delayNeeded = Math.max(0, this.requestDelay - (now - this.lastRequestTime));

    return of(null).pipe(
      delay(delayNeeded),
      switchMap(() => {
        this.lastRequestTime = Date.now();
        return this.processUserMessage(prompt);
      }),
      retryWhen(errors => errors.pipe(delay(1000), take(3))),
      tap(response => this.cacheResponse(prompt, response)),
      catchError(() => of("Yalla, I'm a bit busy right now. Try again in a moment!"))
    );
  }

  private processUserMessage(prompt: string): Observable<string> {
    if (this.isTerminationMessage(prompt)) {
      this.resetConversation();
      return of("Shukran for using Malaabna! See you next time! 🏆");
    }

    if (this.conversationState.context === 'courtLocation') {
      return this.handleCourtLocationFlow(prompt);
    }

    return this.determineUserIntent(prompt).pipe(
      switchMap(intent => {
        switch (intent.type) {
          case 'courts':
            this.conversationState.context = 'courtLocation';
            return of("Yalla! Let's find you a court. Where are you located?");
          case 'players':
            return this.getAvailablePlayers().pipe(
              switchMap(players => this.formatPlayerResponse(players, prompt))
            );
          case 'teams':
            return this.getAvailableTeams().pipe(
              switchMap(teams => this.formatTeamResponse(teams, prompt))
            );
          default:
            return of("Malaabna is all about sports! Ask me about courts, players, or teams.");
        }
      })
    );
  }

  private handleCourtLocationFlow(locationInput: string): Observable<string> {
    this.conversationState.userLocation = { address: locationInput };

    return this.getAvailableCourts().pipe(
      map(courts => {
        const nearbyCourts = courts.filter(court =>
          court.location.address &&
          court.location.address.toLowerCase().includes(locationInput.toLowerCase())
        );

        if (nearbyCourts.length === 0) {
          this.resetConversation();
          const suggestions = courts.slice(0, 3).map(c => c.location.address).join(', ');
          return `No courts found in ${locationInput}. Yalla, try these areas: ${suggestions}`;
        }

        this.resetConversation();
        return this.formatCourtsResponse(nearbyCourts);
      })
    );
  }

  private determineUserIntent(prompt: string): Observable<{ type: 'courts' | 'players' | 'teams' | 'unknown' }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    });

    const systemMessage = `Determine if the user wants info about:
    1. Sports courts (respond with {"type": "courts"})
    2. Players looking for teams ({"type": "players"})
    3. Teams looking for players ({"type": "teams"})
    4. None of these ({"type": "unknown"})
    Only respond with the JSON object.`;

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt }
      ],
      max_tokens: 50,
      temperature: 0.1,
      response_format: { type: "json_object" }
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => {
        try {
          const result = JSON.parse(response.choices[0].message.content);
          const validTypes = ['courts', 'players', 'teams', 'unknown'] as const;
          if (result && validTypes.includes(result.type)) {
            return { type: result.type as typeof validTypes[number] };
          }
          return { type: 'unknown' as const };
        } catch {
          return { type: 'unknown' as const };
        }
      }),
      catchError(() => of({ type: 'unknown' as const }))
    );
  }

  private formatPlayerResponse(players: PlayerRequest[], prompt: string): Observable<string> {
    if (!players.length) {
      return of("Yalla, no players looking right now. Check back later or create your own request!");
    }

    const playerData = players.slice(0, 5).map(p => ({
      name: p.userName,
      position: p.position || 'Any position',
      sport: p.sport,
      level: p.skillLevel || 'All levels'
    }));

    return this.generateAIResponse(
      `Create a friendly message listing players looking for teams.`,
      playerData,
      prompt,
      () => {
        let response = '⚽ Players ready to play:\n\n';
        playerData.forEach(player => {
          response += `• ${player.name} - ${player.position} (${player.sport}, ${player.level})\n`;
        });
        return response + '\nYalla, find your perfect teammate!';
      }
    );
  }

  private formatTeamResponse(teams: Team[], prompt: string): Observable<string> {
    if (!teams.length) {
      return of("No teams recruiting right now. Malaabna can help you create one!");
    }

    const teamData = teams.slice(0, 5).map(t => ({
      name: t.name || 'Unnamed Team',
      sport: t.sport || 'Not specified',
      needs: t.positionsNeeded?.join(', ') || 'Any position',
      location: t.location?.address || 'Anywhere'
    }));

    return this.generateAIResponse(
      `Create an engaging message about teams looking for players.`,
      teamData,
      prompt,
      () => {
        let response = '🏟️ Teams looking for players:\n\n';
        teamData.forEach(team => {
          response += `• ${team.name} - ${team.sport} (Needs: ${team.needs}, Location: ${team.location})\n`;
        });
        return response + '\nJoin the Malaabna community today!';
      }
    );
  }

  private formatCourtsResponse(courts: Court[]): string {
    let response = '🏀 Courts ready for you:\n\n';
    courts.slice(0, 5).forEach((court, index) => {
      response += `${index + 1}. ${court.name}\n`;
      response += `   - Address: ${court.location.address}\n`;
      response += `   - Sports: ${court.sports?.join(', ') || 'Not specified'}\n`;
      response += `   - Amenities: ${court.amenities?.join(', ') || 'Not specified'}\n`;
      response += `   - Phone: ${court.location.phone || 'Contact available upon booking'}\n\n`;
    });
    return response + '\nYalla, book your game at Malaabna!';
  }

  private generateAIResponse(
    systemPrompt: string,
    data: any,
    originalPrompt: string,
    fallback: () => string
  ): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `${systemPrompt} Data: ${JSON.stringify(data)}` },
        { role: 'user', content: originalPrompt }
      ],
      max_tokens: 250,
      temperature: 0.7
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => response.choices[0]?.message?.content?.trim() || fallback()),
      catchError(() => of(fallback()))
    );
  }

  private handleWithAI(prompt: string): Observable<string> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
    });

    const body = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: `You are Malaabna assistant. Be friendly, sports only.` },
        { role: 'user', content: prompt }
      ],
      max_tokens: 200,
      temperature: 0.7
    };

    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => response.choices[0]?.message?.content?.trim() || "Yalla, I'm having trouble responding."),
      catchError(() => of("Yalla, I'm having trouble responding."))
    );
  }

  private getAvailablePlayers(): Observable<PlayerRequest[]> {
    return collectionData(collection(this.firestore, 'playerRequests'), { idField: 'id' }).pipe(
      map(data => data as PlayerRequest[]),
      catchError(() => of([]))
    );
  }

  private getAvailableTeams(): Observable<Team[]> {
    return collectionData(
      query(collection(this.firestore, 'teams'), where('status', '==', 'forming')),
      { idField: 'id' }
    ).pipe(
      map(data => data as Team[]),
      catchError(() => of([]))
    );
  }

  private getAvailableCourts(): Observable<Court[]> {
    return collectionData(collection(this.firestore, 'courts'), { idField: 'id' }).pipe(
      map(data => data as Court[]),
      catchError(() => of([]))
    );
  }

  private isTerminationMessage(message: string): boolean {
    return ['bye', 'goodbye', 'exit', 'quit', 'stop', 'leave', 'maasalama', 'khalas']
      .some(phrase => message.toLowerCase().includes(phrase));
  }

  private resetConversation(): void {
    this.conversationState = {};
  }

  private getCachedResponse(prompt: string): string | null {
    return this.cache.get(prompt) || null;
  }

  private cacheResponse(prompt: string, response: string): void {
    if (response && response.length > 5) {
      this.cache.set(prompt, response);
    }
  }
}
