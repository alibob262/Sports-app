import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNameModalComponent } from './edit-name-modal.component';

describe('EditNameModalComponent', () => {
  let component: EditNameModalComponent;
  let fixture: ComponentFixture<EditNameModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNameModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditNameModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
