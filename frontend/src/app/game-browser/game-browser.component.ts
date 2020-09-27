import { Component, OnInit } from '@angular/core';
import { HostService } from 'src/app/host.service';
import { OnlineGamesService } from 'src/app/online-games.service';
import { MatDialog } from '@angular/material/dialog';

import { GameBrowserPopupComponent } from '../popups/game-browser-password-popup/game-browser-password-popup.component';
import { GameSetupPopupComponent } from '../popups/game-setup-popup/game-setup-popup.component';

import OnlineGame from '../models/onlineGame';

@Component({
  selector: 'app-game-browser',
  templateUrl: './game-browser.component.html',
  styleUrls: ['./game-browser.component.scss']
})
export class GameBrowserComponent implements OnInit {
  
  onlineGames: OnlineGame[];

  constructor(private hostService: HostService,
              private onlineGamesService: OnlineGamesService, 
              private dialog: MatDialog) { 
    this.onlineGames = [];
  }

  ngOnInit(): void { 
    this.getAllGames();
  }

  joinGame(onlineGame: OnlineGame): void {
    if (onlineGame.passwordProtected) {
      let dialogRef = this.dialog.open(GameBrowserPopupComponent, {
        height: '225px',
        width: '300px',
      });
  
      dialogRef.afterClosed().subscribe(password => {
        if (password) {
          this.onlineGamesService.verifyGamePassword(onlineGame, password);
        }
      });
    } else {
      this.onlineGamesService.verifyGamePassword(onlineGame, "");
    }
  }

  getAllGames(): void {
    this.onlineGamesService.getAll().subscribe(
      (onlineGames: OnlineGame[]) => {
        this.onlineGames = onlineGames;
      }
    );
  }

  createGame(): void {
    let dialogRef = this.dialog.open(GameSetupPopupComponent, {
      height: '500px',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(gameSetupData => {
      if (gameSetupData) {
        console.log(gameSetupData);
        const onlineGame: OnlineGame = new OnlineGame(this.hostService.getHostID(), gameSetupData.name, gameSetupData.maxPlayers, gameSetupData.privateGame, gameSetupData.password != "" ? true : false, gameSetupData.password, 1);
        this.onlineGamesService.create(onlineGame);
      }
    });
  }
}
