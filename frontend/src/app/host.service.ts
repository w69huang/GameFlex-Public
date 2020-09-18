import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HostService {
  hostID: string = null;

  constructor() { 
    if (!this.hostID) {
      this.hostID = Math.round(Math.random()*10000).toString();
    }
  }

  getHostID() {
    return this.hostID;
  }
}
