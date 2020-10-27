import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameSetupPopupComponent } from './game-setup-popup.component';

describe('GameSetupPopupComponent', () => {
  let component: GameSetupPopupComponent;
  let fixture: ComponentFixture<GameSetupPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameSetupPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameSetupPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
