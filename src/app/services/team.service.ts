import { Injectable } from "@angular/core";
import { Observable, firstValueFrom, from, map, take } from "rxjs";
import { 
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  docData,
  query,
  where,
  orderBy,
  getDocs,
  DocumentReference,
  arrayRemove,
  arrayUnion,
  getDoc,
  increment,
  updateDoc,
  writeBatch
} from '@angular/fire/firestore';
import { Auth, authState, User } from '@angular/fire/auth';

interface Team {
  id?: string;
  creatorId: string;
  sport: string;
  location: {
    courtId: string;
    name: string;
    address: string;
  };
  datetime: Date;
  neededPlayers: number;
  currentPlayers: number;
  members: Array<{
    userId: string;
    joinedAt: Date;
    position?: string;
  }>;
  skillLevel: string;
  competitiveness: string;
  positionsNeeded: string[];
  description?: string;
  status: 'forming' | 'full' | 'cancelled';
  createdAt: Date;
}

interface JoinRequest {
  id?: string;
  teamId: string;
  userId: string;
  userDisplayName?: string;  // Added optional field
  position?: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  message?: string;  // Added optional field
}

@Injectable({
  providedIn: 'root'
})
export class TeamService {
  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  // New method to fetch the current user
  private async getCurrentUser() {
    const user = await firstValueFrom(authState(this.auth));
    if (!user) throw new Error('User not authenticated');
    return user;
  }

  async createTeam(teamData: Partial<Team>): Promise<string> {
    try {
      const user = await this.getCurrentUser();
      
      const team: Team = {
        ...teamData,
        creatorId: user.uid,
        currentPlayers: 1,
        members: [{
          userId: user.uid,
          joinedAt: new Date()
        }],
        status: 'forming',
        createdAt: new Date()
      } as Team;

      const docRef = await addDoc(collection(this.firestore, 'teams'), team);
      console.log('Team created with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error in createTeam:', error);
      throw error; // Re-throw for handling in component
    }
  }

  getPositionsForSport(sport: string): string[] {
    const positionMap: Record<string, string[]> = {
      football: ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'],
      basketball: ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'],
      volleyball: ['Setter', 'Outside Hitter', 'Middle Blocker', 'Opposite Hitter', 'Libero'],
      tennis: ['Singles', 'Doubles']
    };
    return positionMap[sport] || [];
  }

  getTeams(filters: {
    sport?: string;
    skillLevel?: string;
    dateRange?: { start?: Date | null; end?: Date | null };
  } = {}): Observable<Team[]> {
    return new Observable<Team[]>(subscriber => {
      (async () => {
        try {
          const teamsRef = collection(this.firestore, 'teams');
          
          // Base query with required index fields first
          let q = query(
            teamsRef,
            where('status', '==', 'forming'),
            orderBy('datetime')
          );

          // Add sport filter if provided
          if (filters.sport) {
            q = query(q, where('sport', '==', filters.sport));
          }

          // Add skill level filter if provided
          if (filters.skillLevel) {
            q = query(q, where('skillLevel', '==', filters.skillLevel));
          }

          // Date range filters
          if (filters.dateRange?.start) {
            q = query(q, where('datetime', '>=', filters.dateRange.start));
          }
          if (filters.dateRange?.end) {
            q = query(q, where('datetime', '<=', filters.dateRange.end));
          }

          const querySnapshot = await getDocs(q);
          const teams = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Team));

          subscriber.next(teams);
          subscriber.complete();
        } catch (error) {
          console.error('Error fetching teams:', error);
          subscriber.error(error);
        }
      })();
    });
  }

  getTeam(teamId: string): Observable<Team | undefined> {
    const teamRef = doc(this.firestore, `teams/${teamId}`);
    return docData(teamRef, { idField: 'id' }) as Observable<Team | undefined>;
  }

  

  async requestToJoin(teamId: string, position: string): Promise<void> {
    console.log('1. Starting request to join for team:', teamId);
    
    try {
      console.log('2. Getting current user...');
      const user = await firstValueFrom(
        authState(this.auth).pipe(take(1))
      );
      
      if (!user) {
        console.error('3. No user - not authenticated');
        throw new Error('Not authenticated');
      }
      
      console.log('4. User found:', user.uid);
      
      const request = {
        teamId,
        userId: user.uid,
        userDisplayName: user.displayName || 'Anonymous',
        position,
        status: 'pending',
        requestedAt: new Date()
      };
    
      console.log('5. Creating request:', request);
      
      const docRef = await addDoc(
        collection(this.firestore, 'joinRequests'), 
        request
      );
      
      console.log('6. Success! Request ID:', docRef.id);
      
    } catch (error) {
      console.error('7. Error in requestToJoin:',);
      throw error;
    }
  }



  // In your team.service.ts
  async processJoinRequest(requestId: string, action: 'accept' | 'reject'): Promise<void> {
    try {
      const user = await this.getCurrentUser(); // Ensure user is authenticated
      if (!user) {
        throw new Error('User not authenticated');
      }
  
      const requestRef = doc(this.firestore, `joinRequests/${requestId}`);
      const requestSnap = await getDoc(requestRef);
  
      if (!requestSnap.exists()) {
        throw new Error('Request not found');
      }
  
      const request = requestSnap.data() as JoinRequest;
      const teamRef = doc(this.firestore, `teams/${request.teamId}`);
  
      // Fetch team data and check if user is team creator
      const teamSnap = await getDoc(teamRef);
      const teamData = teamSnap.data() as Team; // Type assertion here
  
      if (!teamData || teamData.creatorId !== user.uid) {
        throw new Error('You are not authorized to process this request');
      }
  
      // Update request status
      const batch = writeBatch(this.firestore);
  
      // Updating the join request
      batch.update(requestRef, {
        status: action,
        processedAt: new Date() // Add processedAt timestamp
      });
  
      if (action === 'accept') {
        // Add user to team
        batch.update(teamRef, {
          currentPlayers: increment(1),
          members: arrayUnion({
            userId: request.userId,
            joinedAt: new Date(),
            position: request.position || null
          })
        });
  
        // Check if team becomes full
        if (teamData.currentPlayers + 1 >= teamData.neededPlayers) {
          batch.update(teamRef, { status: 'full' });
        }
      }
  
      await batch.commit();
      console.log(`Request ${action}ed successfully.`);
    } catch (error) {
      console.error('Failed to process request:', error);
      throw error;
    }
  }
  
  

  getJoinRequests(teamId: string): Observable<JoinRequest[]> {
    const q = query(
      collection(this.firestore, 'joinRequests'),
      where('teamId', '==', teamId),
      where('status', '==', 'pending')
    );
    return collectionData(q, { idField: 'id' }).pipe(
      map((requests: any[]) =>
        requests.map((request: any) => ({
          ...request,
          userDisplayName: request.userDisplayName || 'Unknown',  // Default value
          message: request.message || ''  // Default value
        }))
      )
    ) as Observable<JoinRequest[]>;
  }
}
