import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDeckPopupComponent } from './create-deck-popup.component';

describe('CreateDeckPopupComponent', () => {
  let component: CreateDeckPopupComponent;
  let fixture: ComponentFixture<CreateDeckPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateDeckPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDeckPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
