import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCounterPopupComponent } from './create-counter-popup.component';

describe('CreateCounterPopupComponent', () => {
  let component: CreateCounterPopupComponent;
  let fixture: ComponentFixture<CreateCounterPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateCounterPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCounterPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
