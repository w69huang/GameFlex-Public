import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CounterActionObject } from '../counter/counter.component';

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

  /**
   * An emitter used to tell the playspace to save the game with a given name
   */
  public saveGameStateEmitter: EventEmitter<string> = new EventEmitter<string>();

  /**
   * An emitter used to send the playspace a saved game state that was retrieved from the database so that it can be loaded
   */
  public getAllSavedGameStatesEmitter: EventEmitter<SavedGameState> = new EventEmitter<SavedGameState>();

  /**
   * An emitter used to tell the playspace to undo a # of moves
   */
  public undoGameStateEmitter: EventEmitter<number> = new EventEmitter<number>();

  /**
   * An emitter used to output counter actions to the playspace component
   */
  public ctrActionOutputToPlayspaceCmpEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  /**
   * An emitter used to output counter actions to the counter component
   */
  public ctrActionOutputToCounterCmpEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  /**
   * The constructor
   */
  constructor(
    private route: ActivatedRoute,
    private savedGameStateService: SavedGameStateService,
    private dialog: MatDialog,
    public middleware: MiddleWare
    ) { }

  /**
   * Runs on initialization
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mainHostID = params['host'];
      this.onlineGameID = params['onlineGameID'];
    });

    document.getElementById('onlineGameCode').style.setProperty('display', 'none');
  }

  /**
   * Handles the retrieval of online game data from the playspace in order to display an online game code, if there is one
   * @param onlineGame - The online game data retrieved
   */
  receiveOnlineGameData(onlineGame: OnlineGame): void  {
    this.onlineGame = onlineGame;
    document.getElementById('onlineGameCode').style.setProperty('display', 'unset');
  }

  /**
   * Handles the retrieval of player data from the playspace in order to display a player list
   * @param playerData - The player data retrieved
   */
  receivePlayerData(playerData: PlayerData[]): void {
    this.playerData = playerData;
  }

  /**
   * Handles the retrieval of the amHost variable from the playspace in order to determine whether or not to display certain items in the sidebar
   * @param amHost - Whether or not this cleint is the game host
   */
  receiveAmHost(amHost: boolean): void {
    this.amHost = amHost;
  }

  /**
   * Handles a counter action received from the playspace component
   * @param counterActionObject - The counter action object received
   */
  rcvCtrActionFromPlayspaceCmp(counterActionObject: CounterActionObject): void {
    this.ctrActionOutputToCounterCmpEmitter.emit(counterActionObject); // Ferry the action to the playspace component
  }

  /**
   * Handles a counter aciton retrieved from the counter component
   * @param counterActionObject - The counter action object received
   */
  rcvCtrActionFromCounterCmp(counterActionObject: CounterActionObject): void {
    this.ctrActionOutputToPlayspaceCmpEmitter.emit(counterActionObject); // Ferry the action to the counter component
  }

  /**
   * Open a popup to retrieve a saved game state from the DB
   */
  getAllSavedGameStates(): void {
    let dialogRef = this.dialog.open(RetrieveGameStatePopupComponent, {
      height: '225',
      width: '300px',
    });

    dialogRef.afterClosed().subscribe((savedGameState: SavedGameState) => {
     this.getAllSavedGameStatesEmitter.emit(savedGameState);
    });
  }

  /**
   * Opens a popup to save the current game to the database
   */
  saveGameState(): void {
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

  /**
   * An action ferried to the playspace component that requests the playspace to undo a certain # of moves
   * @param undoCount - The # of moves to undo
   */
  undo(undoCount: any){
    if (!isNaN(undoCount)) {
      this.undoGameStateEmitter.emit(parseInt(undoCount));
    }
  }

  /**
   * Deletes all saved games from the database
   */
  deleteAllSaves() {
    this.savedGameStateService.deleteAll().subscribe();
  }
}
