import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import OnlineGame from './models/onlineGame';

@Injectable({
  providedIn: 'root'
})
export class HostService {
  hostID: string = null;

  constructor(private router: Router,) { 
    if (!this.hostID) {
      this.hostID = Math.round(Math.random()*10000).toString();
    }
  }

  getHostID() {
    return this.hostID;
  }

  // TODO: Is this worth moving to a different service?
  verifyGamePassword(onlineGame: OnlineGame, password: string) {
    // TODO: Replace with http.get request for the hostID, passing in the password
    // The backend will reply with the host's ID if it is either not password protected or it is and the password is correct
    let hostID: string = onlineGame.hostID; // (in reality the onlineGame.hostID field will not be populated on the frontend, this is temporary)

    // The hostID returned by the backend will then be used for the redirect
    this.router.navigate(['/playspace'], { queryParams: { host: hostID } });
  }
}
