import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import { TeamService } from '../../services/team.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getAuth } from '@angular/fire/auth'; // Correct import for modular SDK
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-team-form',
  standalone: true,
  templateUrl: './team-form.component.html',
  styleUrls: ['./team-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIcon,
    RouterModule,
    CommonModule
  ],
})
export class TeamFormComponent {
  teamForm: FormGroup;
  loading = false;

  sports = ['football', 'basketball', 'tennis', 'volleyball'];
  skillLevels = ['beginner', 'intermediate', 'advanced'];
  competitivenessLevels = ['casual', 'competitive', 'tournament'];

  auth = getAuth(); // Use getAuth() from modular SDK directly

  constructor(
    private fb: FormBuilder,
    public teamService: TeamService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.teamForm = this.fb.group({
      sport: ['', Validators.required],
      location: this.fb.group({
        courtId: ['', Validators.required],
        name: ['', Validators.required],
        address: ['', Validators.required]
      }),
      datetime: ['', [Validators.required, this.futureDateValidator]],
      neededPlayers: [1, [Validators.required, Validators.min(1)]],
      skillLevel: ['intermediate', Validators.required],
      competitiveness: ['casual', Validators.required],
      positionsNeeded: this.fb.array([]),
      description: ['']
    });

    this.teamForm.get('sport')?.valueChanges.subscribe(() => this.onSportChange());
  }

  futureDateValidator(control: AbstractControl) {
    const selectedDate = new Date(control.value);
    return selectedDate > new Date() ? null : { pastDate: true };
  }

  get positionsNeeded() {
    return this.teamForm.get('positionsNeeded') as FormArray;
  }

  onSportChange() {
    const sport = this.teamForm.get('sport')?.value;
    const positions = this.teamService.getPositionsForSport(sport);

    this.positionsNeeded.clear();
    positions.forEach(pos => {
      this.positionsNeeded.push(this.fb.control(false));
    });
  }

  async onSubmit() {
    if (this.teamForm.invalid) return;

    this.loading = true;
    try {
      const formValue = this.teamForm.value;
      const selectedPositions = this.getSelectedPositions();

      const teamData = {
        ...formValue,
        positionsNeeded: selectedPositions,
        datetime: new Date(formValue.datetime)
      };

      await this.teamService.createTeam(teamData);
      this.snackBar.open('Team created successfully!', 'Close', { duration: 3000 });
      this.router.navigate(['/teams']);
    } catch (error) {
      console.error('Team creation failed:', error);
      this.snackBar.open('Failed to create team. ' + (error as Error).message, 'Close', { duration: 5000 });
    } finally {
      this.loading = false; // Ensures loading stops even on error
    }
  }

  private getSelectedPositions(): string[] {
    const positions = this.teamService.getPositionsForSport(this.teamForm.value.sport);
    return this.positionsNeeded.controls
      .map((control, i) => control.value ? positions[i] : null)
      .filter((pos): pos is string => pos !== null);
  }
}
