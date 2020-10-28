import { TestBed } from '@angular/core/testing';

import { OnlineGamesService } from './online-games.service';

describe('OnlineGamesService', () => {
  let service: OnlineGamesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OnlineGamesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
