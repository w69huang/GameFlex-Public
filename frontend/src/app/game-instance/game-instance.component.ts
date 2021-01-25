import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

import OnlineGame from '../models/onlineGame';
import PlayerData from '../models/playerData';
import SavedGameState from '../models/savedGameState';
import { LoadCardsPopupComponent } from '../popups/load-cards-popup/load-cards-popup.component';
import { RetrieveGameStatePopupComponent } from '../popups/retrieve-game-state-popup/retrieve-game-state-popup.component';
import { SaveGameStatePopupComponent } from '../popups/save-game-state-popup/save-game-state-popup.component';
import { FileService } from '../services/file.service';
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
  public uploadCardToGameStateEmitter: EventEmitter<Object> = new EventEmitter<Object>();
  
  public undoGameStateEmitter: EventEmitter<integer> = new EventEmitter<integer>();

  constructor(
    private route: ActivatedRoute,
    private savedGameStateService: SavedGameStateService,
    private dialog: MatDialog,
    public middleware: MiddleWare,
    private fileService: FileService
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

  clearCachedSave() {
    localStorage.removeItem('cachedGameState');
  }

  uploadCard(){
    if(this.amHost){
      let dialogRef = this.dialog.open(LoadCardsPopupComponent, {
        height: 'auto',
        width: 'auto',
      });

      dialogRef.afterClosed().subscribe(formData => {
        console.log("Closed Data:");
        console.log(formData.name);
        if (formData.name != null ){
          var username = this.middleware.getUsername();
          var i;
          for(i = 0; i < formData.name.length; i ++) {
            this.fileService.list(formData.name[i], username).subscribe(function(formData, i, data) {
              var payload = {
                deckName: formData.name[i],
                cards: data.dataFiles,
                ids: data.ids,
              };
              console.log("GameInstance Componenet Pulled Files:")
              console.log(payload)
              this.uploadCardToGameStateEmitter.emit(payload);
          
            }.bind(this, formData, i));
          }
        }
      });
      // this.fileService.list('TestDeck2', 'test2').subscribe((data) => {
      //   console.log("GameInstance Componenet Pulled Files:")
      //   console.log(data)
      //   this.uploadCardToGameStateEmitter.emit(data);

      // })
    }
  }
}

