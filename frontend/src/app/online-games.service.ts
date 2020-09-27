import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { WebService } from './web.service';
import OnlineGame from './models/onlineGame';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnlineGamesService {

  constructor (private webService: WebService, private router: Router) { }

  verifyGamePassword(onlineGame: OnlineGame, password: string): void {
    // TODO: Replace with http.get request for the hostID, passing in the password
    // The backend will reply with the host's ID if it is either not password protected or it is and the password is correct
    let hostID: string = onlineGame.hostID; // (in reality the onlineGame.hostID field will not be populated on the frontend, this is temporary)

    // The hostID returned by the backend will then be used for the redirect
    this.router.navigate(['/playspace'], { queryParams: { host: hostID } });
  }

  getAll(): any {
    return this.webService.get('online-games/get');
  }

  create(onlineGame: OnlineGame): void {
    this.webService.post('online-games/post', onlineGame)
        .subscribe(
          (data) => {
            this.router.navigate(['/playspace'], { queryParams: { host: onlineGame.hostID } });
          }
        )
  }
}
