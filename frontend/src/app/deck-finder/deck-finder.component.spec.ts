import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckFinderComponent } from './deck-finder.component';

describe('DeckFinderComponent', () => {
  let component: DeckFinderComponent;
  let fixture: ComponentFixture<DeckFinderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeckFinderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckFinderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
