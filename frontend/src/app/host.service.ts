import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

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
}
