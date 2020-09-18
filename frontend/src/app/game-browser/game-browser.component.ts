import { Component, OnInit } from '@angular/core';
import { HostService } from 'src/app/host.service';
import OnlineGame from '../models/onlineGame';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game-browser',
  templateUrl: './game-browser.component.html',
  styleUrls: ['./game-browser.component.scss']
})
export class GameBrowserComponent implements OnInit {
  
  onlineGames: OnlineGame[];

  constructor(private hostService: HostService, private router: Router) { 
    this.onlineGames = [
      new OnlineGame(hostService.getHostID(), "Game1", 8, false, false, "", 1),
      new OnlineGame(hostService.getHostID(), "Game2", 5, false, false, "", 2),
      new OnlineGame(hostService.getHostID(), "Game3", 2, false, false, "", 12),
      new OnlineGame(hostService.getHostID(), "Game4", 4, false, false, "", 3),
      new OnlineGame(hostService.getHostID(), "Game5", 3, false, false, "", 4),
      new OnlineGame(hostService.getHostID(), "Game6", 6, false, false, "", 1),
    ];
  }

  ngOnInit(): void { }

  joinGame(): void {
    this.router.navigate(['/playspace']);
  }

}
