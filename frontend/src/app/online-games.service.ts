import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from './web.service';
import OnlineGame from './models/onlineGame';

@Injectable({
  providedIn: 'root'
})
export class OnlineGamesService {

  constructor (private webService: WebService, private router: Router) { }

  verifyGamePassword(onlineGame: OnlineGame, password: string): void {
    this.webService.post('online-games/verifyGamePassword', { onlineGame: onlineGame, password: password }).subscribe((object: any) => {
      if (object.hostID) {
        this.router.navigate(['/playspace'], { queryParams: { host: object.hostID, onlineGameID: onlineGame.id } });
      } else {
        alert('Password incorrect.');
      }
    });

  }

  get(id: number): any {
    return this.webService.get(`online-games/get?id=${id}`);
  }

  getAll(): any {
    return this.webService.get('online-games/getAll');
  }

  create(onlineGame: OnlineGame): void {
    this.webService.post('online-games/post', onlineGame)
        .subscribe(
          (data) => {
            this.router.navigate(['/playspace'], { queryParams: { host: onlineGame.hostID, onlineGameID: onlineGame.id } });
          }
        );
  }

  deleteAll(): any {
    return this.webService.delete('online-games/delete');
  }

  confirmActive(onlineGame: OnlineGame): void {
    this.webService.patch('online-games/confirmActive', onlineGame)
        .subscribe(
          (data) => {
            console.log("Patched!");
          }
        );
  }

  updateHostID(onlineGame: OnlineGame, password: string): void {
    this.webService.patch('online-games/updateHostID', { onlineGame: onlineGame, password: password })
    .subscribe(
      (data) => {
        console.log("Patched!");
      }
    );
  }

  getIDAndCode(): any {
    return this.webService.get('online-games/getIDAndCode');
  }
}
