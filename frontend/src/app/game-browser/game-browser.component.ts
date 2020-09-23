import { Component, OnInit } from '@angular/core';
import { HostService } from 'src/app/host.service';
import { OnlineGamesService } from 'src/app/online-games.service';
import { MatDialog } from '@angular/material/dialog';

import { PopupComponent } from '../popup/popup.component';

import OnlineGame from '../models/onlineGame';

@Component({
  selector: 'app-game-browser',
  templateUrl: './game-browser.component.html',
  styleUrls: ['./game-browser.component.scss']
})
export class GameBrowserComponent implements OnInit {
  
  onlineGames: OnlineGame[];

  constructor(private hostService: HostService, private onlineGamesService: OnlineGamesService, private dialog: MatDialog) { 
    this.onlineGames = [
      new OnlineGame(hostService.getHostID(), "Game1", 8, false, true, "", 1),
      new OnlineGame(hostService.getHostID(), "Game2", 5, false, false, "", 2),
      new OnlineGame(hostService.getHostID(), "Game3", 2, false, true, "", 12),
      new OnlineGame(hostService.getHostID(), "Game4", 4, false, false, "", 3),
      new OnlineGame(hostService.getHostID(), "Game5", 3, false, false, "", 4),
      new OnlineGame(hostService.getHostID(), "Game6", 6, false, false, "", 1),
    ];
  }

  ngOnInit(): void { }

  joinGame(onlineGame: OnlineGame): void {
    if (onlineGame.passwordProtected) {
      let dialogRef = this.dialog.open(PopupComponent, {
        height: '175px',
        width: '300px',
      });
  
      dialogRef.afterClosed().subscribe(password => {
        this.onlineGamesService.verifyGamePassword(onlineGame, password);
      });
    } else {
      this.onlineGamesService.verifyGamePassword(onlineGame, "");
    }
  }

  getAllGames(): void {
    this.onlineGamesService.getAll();
  }

  createGame(): void {
    const onlineGame: OnlineGame = this.onlineGames[Math.round(Math.random()*5)];

    this.onlineGamesService.create(onlineGame);
  }
}
