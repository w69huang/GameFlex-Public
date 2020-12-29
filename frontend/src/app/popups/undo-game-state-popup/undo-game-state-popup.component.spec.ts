import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoGameStatePopupComponent } from './undo-game-state-popup.component';

describe('UndoGameStatePopupComponent', () => {
  let component: UndoGameStatePopupComponent;
  let fixture: ComponentFixture<UndoGameStatePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UndoGameStatePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoGameStatePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
