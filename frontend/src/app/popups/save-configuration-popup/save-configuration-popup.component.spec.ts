import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveConfigurationPopupComponent } from './save-configuration-popup.component';

describe('SaveConfigurationPopupComponent', () => {
  let component: SaveConfigurationPopupComponent;
  let fixture: ComponentFixture<SaveConfigurationPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveConfigurationPopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveConfigurationPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
