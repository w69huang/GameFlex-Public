import { TestBed } from '@angular/core/testing';

import { SavedGameStateService } from './saved-game-state.service';

describe('SavedGameStateService', () => {
  let service: SavedGameStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SavedGameStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
