import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import SavedGameState from './models/savedGameState';

@Injectable({
  providedIn: 'root'
})
export class SavedGameStateService {

  constructor(private webService: WebService) { }

  getAll(): any {
    return this.webService.get('saved-game-state/getAll', true);
  }

  create(savedGameState: SavedGameState): void {
    this.webService.post('saved-game-state/post', savedGameState, true).subscribe(
      (data) => {
        console.log(data);
      }
    );
  }
}
