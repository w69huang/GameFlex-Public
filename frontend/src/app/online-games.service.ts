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
    // TODO: Replace with http.get request for the hostID, passing in the password
    // The backend will reply with the host's ID if it is either not password protected or it is and the password is correct
    let hostID: string = onlineGame.hostID; // (in reality the onlineGame.hostID field will not be populated on the frontend, this is temporary)

    // The hostID returned by the backend will then be used for the redirect
    this.router.navigate(['/playspace'], { queryParams: { host: hostID } });
  }

  getAll() {
    this.webService.get('online-games/get')
        .subscribe(
          (data) => {
            console.log(data);
          }
        );
  }

  create(onlineGame: OnlineGame) {
    this.webService.post('online-games/post', onlineGame)
        .subscribe(
          (data) => {
            console.log(data);
          }
        )
  }
}
