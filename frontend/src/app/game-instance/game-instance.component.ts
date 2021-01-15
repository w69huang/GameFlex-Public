import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import OnlineGame from '../models/onlineGame';
import PlayerData from '../models/playerData';
import SavedGameState from '../models/savedGameState';
import { RetrieveGameStatePopupComponent } from '../popups/retrieve-game-state-popup/retrieve-game-state-popup.component';
import { SaveGameStatePopupComponent } from '../popups/save-game-state-popup/save-game-state-popup.component';
import { MiddleWare } from '../services/middleware';
import { SavedGameStateService } from '../services/saved-game-state.service';

@Component({
  selector: 'app-game-instance',
  templateUrl: './game-instance.component.html',
  styleUrls: ['./game-instance.component.scss']
})
export class GameInstanceComponent implements OnInit {

  public mainHostID: string;
  public onlineGameID: string;
  public onlineGame: OnlineGame;
  public playerData: PlayerData[];
  public amHost: boolean = false;

  public saveGameStateEmitter: EventEmitter<string> = new EventEmitter<string>();
  public getAllSavedGameStatesEmitter: EventEmitter<SavedGameState> = new EventEmitter<SavedGameState>();
  public undoGameStateEmitter: EventEmitter<integer> = new EventEmitter<integer>();

  constructor(
    private route: ActivatedRoute,
    private savedGameStateService: SavedGameStateService,
    private dialog: MatDialog,
    public middleware: MiddleWare
    ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mainHostID = params['host'];
      this.onlineGameID = params['onlineGameID'];
    });

    document.getElementById('onlineGameCode').style.setProperty('display', 'none');
  }

  receiveOnlineGameData(onlineGame: OnlineGame) {
    this.onlineGame = onlineGame;
    document.getElementById('onlineGameCode').style.setProperty('display', 'unset');
  }

  receivePlayerData(playerData: PlayerData[]) {
    this.playerData = playerData;
  }

  receiveAmHost(amHost: boolean) {
    this.amHost = amHost;
  }

  getAllSavedGameStates() {
    let dialogRef = this.dialog.open(RetrieveGameStatePopupComponent, {
      height: '225',
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((savedGameState: SavedGameState) => {
      this.getAllSavedGameStatesEmitter.emit(savedGameState);
    });
  }

  saveGameState() {
    let dialogRef = this.dialog.open(SaveGameStatePopupComponent, {
      height: '225px',
      width: '300px',
    });

    dialogRef.afterClosed().subscribe(formData => {
      if (formData.name) {
        this.saveGameStateEmitter.emit(formData.name);
      }
    });
  }

  undo(undoCount: any){
    if (!isNaN(undoCount)) {
      this.undoGameStateEmitter.emit(parseInt(undoCount));
    }
  }

  deleteAllSaves() {
    this.savedGameStateService.deleteAll().subscribe();
  }
}
