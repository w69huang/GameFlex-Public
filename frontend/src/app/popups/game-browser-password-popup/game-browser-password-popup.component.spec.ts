import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameBrowserPopupComponent } from './game-browser-password-popup.component';

describe('GameBrowserPopupComponent', () => {
  let component: GameBrowserPopupComponent;
  let fixture: ComponentFixture<GameBrowserPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GameBrowserPopupComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameBrowserPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
