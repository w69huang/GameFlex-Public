import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinByCodeComponent } from './join-by-code.component';

describe('JoinByCodeComponent', () => {
  let component: JoinByCodeComponent;
  let fixture: ComponentFixture<JoinByCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JoinByCodeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinByCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
