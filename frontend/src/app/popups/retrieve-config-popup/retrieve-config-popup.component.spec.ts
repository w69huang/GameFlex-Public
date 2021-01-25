import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveConfigPopupComponent } from './retrieve-config-popup.component';

describe('RetrieveConfigPopupComponent', () => {
  let component: RetrieveConfigPopupComponent;
  let fixture: ComponentFixture<RetrieveConfigPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RetrieveConfigPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrieveConfigPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
