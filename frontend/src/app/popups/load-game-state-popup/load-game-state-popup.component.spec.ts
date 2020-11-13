import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadGameStatePopupComponent } from './load-game-state-popup.component';

describe('LoadGameStatePopupComponent', () => {
  let component: LoadGameStatePopupComponent;
  let fixture: ComponentFixture<LoadGameStatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadGameStatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadGameStatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
