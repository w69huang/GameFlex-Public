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

  get(id: string): any {
    return this.webService.get(`online-games/get?id=${id}`);
  }

  getAll(): any {
    return this.webService.get('online-games/getAll');
  }

  getIDAndCode(): any {
    return this.webService.get('online-games/getIDAndCode');
  }

  getHashAndJoin(onlineGame: OnlineGame, gamePassword: string): any {
    this.webService.get(`online-games/getHash?onlineGameID=${onlineGame.id}&gamePassword=${gamePassword}`).subscribe((result: { hash: string, message: string}) => {
      if (result.hash) {
        localStorage.setItem('hashPair', `${onlineGame.hostID}-${result.hash}`);
        this.router.navigate(['/gameInstance'], { queryParams: { onlineGameID: onlineGame.id } });
      } else {
        alert(result.message);
      }
    });
  }

  checkHash(onlineGameID: string, hash: string): any {
    return this.webService.get(`online-games/checkHash?onlineGameID=${onlineGameID}&hash=${hash}`);
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
}