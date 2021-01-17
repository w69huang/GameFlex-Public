import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameInstanceComponent } from './game-instance.component';

describe('GameInstanceComponent', () => {
  let component: GameInstanceComponent;
  let fixture: ComponentFixture<GameInstanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GameInstanceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GameInstanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
