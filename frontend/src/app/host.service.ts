import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MiddleWare } from './services/middleware';

@Injectable({
  providedIn: 'root'
})
export class HostService {
  hostID: string = null;

  constructor(private router: Router, private middleware: MiddleWare) { 
    if (!this.hostID) {
      if (middleware.isLoggedIn()) {
        this.hostID = middleware.getUsername();
      } else {
        this.hostID = Math.round(Math.random()*10000).toString();
      }
    }
  }

  getHostID() {
    return this.hostID;
  }
}
