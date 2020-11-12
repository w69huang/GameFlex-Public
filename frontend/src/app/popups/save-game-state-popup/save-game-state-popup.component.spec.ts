import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveGameStatePopupComponent } from './save-game-state-popup.component';

describe('SaveGameStatePopupComponent', () => {
  let component: SaveGameStatePopupComponent;
  let fixture: ComponentFixture<SaveGameStatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveGameStatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveGameStatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
