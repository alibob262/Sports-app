// team.model.ts
export interface Team {
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
  positionsFilled?: { [position: string]: number }; // Made optional
  description?: string;
  status: 'forming' | 'full' | 'cancelled';
  createdAt: Date;
}



export interface JoinRequest {
  id?: string;
  teamId: string;
  userId: string;
  userDisplayName?: string;  
  position?: string;
  status: 'pending' | 'accepted' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  message?: string;  
}
