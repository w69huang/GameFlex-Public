import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { WebService } from './web.service';
import { HostService } from './host.service';
import { MiddleWare } from './middleware';
import OnlineGame from '../models/onlineGame';

@Injectable({
  providedIn: 'root'
})
export class OnlineGamesService {

  constructor (
    private router: Router,
    private webService: WebService,
    private middleware: MiddleWare
  ) { }

  verify(onlineGame: OnlineGame, password: string): void {
    this.webService.post('online-games/verify', { onlineGame: onlineGame, password: password }).subscribe((object: any) => {
      if (object.hostID) {
        this.router.navigate(['/gameInstance'], { queryParams: { host: object.hostID, onlineGameID: onlineGame.id } });
      } else {
        alert(object.message);
      }
    });
  }

  joinByCode(code: string, name: string) {
    this.webService.post('online-games/joinByCode', { onlineGameCode: code })
      .subscribe(
        (data: any) => {
          if (data.message) {
            alert(data.message);
          } else if (data.hostID && data.id) {
            this.router.navigate(['/gameInstance'], { queryParams: { host: data.hostID, onlineGameID: data.id } });
          }
        }
      );
  }

  get(id: string): any {
    return this.webService.get(`online-games/get?id=${id}`);
  }

  getAll(): any {
    return this.webService.get('online-games/getAll');
  }

  create(onlineGame: OnlineGame): void {
    this.webService.post('online-games/post', onlineGame)
        .subscribe(
          (data) => {
            this.router.navigate(['/gameInstance'], { queryParams: { host: onlineGame.hostID, onlineGameID: onlineGame.id } });
          }
        );
  }

  deleteAll(): any {
    return this.webService.delete('online-games/delete');
  }

  update(onlineGame: OnlineGame): any {
    return this.webService.patch('online-games/update', { onlineGame: onlineGame, accountUsername: this.middleware.getUsername(), accountPassword: this.middleware.getPassword() });
  }

  getIDAndCode(): any {
    return this.webService.get('online-games/getIDAndCode');
  }
}