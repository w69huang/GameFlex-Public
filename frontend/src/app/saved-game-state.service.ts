import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import { MiddleWare } from './services/middleware';
import SavedGameState from './models/savedGameState';

@Injectable({
  providedIn: 'root'
})
export class SavedGameStateService {

  constructor(private webService: WebService, private middleware: MiddleWare) { }

  getAll(): any {
    return this.webService.get(`saved-game-state/getAll?username=${this.middleware.getUsername()}&password=${this.middleware.getPassword()}`, true);
  }

  create(savedGameState: SavedGameState): void {
    this.webService.post(`saved-game-state/post?username=${this.middleware.getUsername()}&password=${this.middleware.getPassword()}`, savedGameState, true).subscribe();
  }

  deleteAll(): any {
    return this.webService.delete('saved-game-state/delete', true);
  }
}
