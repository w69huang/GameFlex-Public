import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLargeThumbnailPopupComponent } from './card-large-thumbnail-popup.component';

describe('CardLargeThumbnailPopupComponent', () => {
  let component: CardLargeThumbnailPopupComponent;
  let fixture: ComponentFixture<CardLargeThumbnailPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardLargeThumbnailPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardLargeThumbnailPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
