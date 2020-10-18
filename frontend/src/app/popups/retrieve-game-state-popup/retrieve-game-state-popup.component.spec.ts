import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveGameStatePopupComponent } from './retrieve-game-state-popup.component';

describe('RetrieveGameStatePopupComponent', () => {
  let component: RetrieveGameStatePopupComponent;
  let fixture: ComponentFixture<RetrieveGameStatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrieveGameStatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrieveGameStatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
