import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCardsPopupComponent } from './load-cards-popup.component';

describe('LoadCardsPopupComponent', () => {
  let component: LoadCardsPopupComponent;
  let fixture: ComponentFixture<LoadCardsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadCardsPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCardsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
