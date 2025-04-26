import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

export interface Court {
  id: string;
  amenities: string[];
  images: string[];
  location: {
    address: string;
    geo: {
      latitude: number;
      longitude: number;
    };
  };
  phone: string;
  name: string;
  sports: string[];
  type: 'indoor' | 'outdoor';
}

export interface PlayerRequest {
  id: string;
  createdAt: Date | any;
  position: string;
  sport: string;
  userId: string;
  userName: string;
}

export interface Team {
  id: string;
  competitiveness: 'casual' | 'competitive';
  createdAt: Date | any;
  creatorId: string;
  currentPlayers: number;
  datetime: Date | any;
  description: string;
  location: {
    address: string;
    courtId: string;
    name: string;
  };
  members: Array<{
    joinedAt: Date | any;
    userId: string;
    position?: string;
  }>;
  neededPlayers: number;
  positionsFilled: Record<string, number>;
  positionsNeeded: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  sport: string;
  status: 'forming' | 'active' | 'completed';
}

export interface User {
  id: string;
  createdAt: Date | any;
  displayName: string;
  email: string;
  lastUpdated: Date | any;
  username: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);

  isAdmin = false;
  isLoading = true;
  activeTab = 'users';

  users$: Observable<User[]> = of([]);
  courts$: Observable<Court[]> = of([]);
  teams$: Observable<Team[]> = of([]);
  playerRequests$: Observable<PlayerRequest[]> = of([]);

  constructor() {
    this.checkAdminStatus();
  }

  async checkAdminStatus() {
    const user = await this.authService.getCurrentUser();
    if (user) {
      this.isAdmin = await this.authService.isAdmin(user.uid);
      if (this.isAdmin) {
        this.loadData();
      }
    }
    this.isLoading = false;
  }

  loadData() {
    this.users$ = collectionData(collection(this.firestore, 'users'), { idField: 'id' }) as Observable<User[]>;
    this.courts$ = collectionData(collection(this.firestore, 'courts'), { idField: 'id' }) as Observable<Court[]>;
    this.teams$ = collectionData(collection(this.firestore, 'teams'), { idField: 'id' }) as Observable<Team[]>;
    this.playerRequests$ = collectionData(collection(this.firestore, 'playerRequests'), { idField: 'id' }) as Observable<PlayerRequest[]>;
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleString();
  }
}