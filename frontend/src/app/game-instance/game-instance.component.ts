import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { CounterInitData } from '../counter/counter.component';
import Counter from '../models/counter';

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
   * An emitter used to send a new counter's ID to the counter component
   */
  public counterIdEmitter: EventEmitter<CounterInitData> = new EventEmitter<CounterInitData>();

  /**
   * An emitter used to request an ID for a new counter from the playspace
   */
  public requestCounterIdEmitter: EventEmitter<CounterInitData> = new EventEmitter<CounterInitData>();

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

  /**
   * Handles the retrieval of online game data from the playspace in order to display an online game code, if there is one
   * @param onlineGame - The online game data retrieved
   */
  receiveOnlineGameData(onlineGame: OnlineGame) {
    this.onlineGame = onlineGame;
    document.getElementById('onlineGameCode').style.setProperty('display', 'unset');
  }

  /**
   * Handles the retrieval of player data from the playspace in order to display a player list
   * @param playerData - The player data retrieved
   */
  receivePlayerData(playerData: PlayerData[]) {
    this.playerData = playerData;
  }

  /**
   * Handles the retrieval of the amHost variable from the playspace in order to determine whether or not to display certain items in the sidebar
   * @param amHost - Whether or not this cleint is the game host
   */
  receiveAmHost(amHost: boolean) {
    this.amHost = amHost;
  }

  /**
   * Handles the retrieval of all counter data from the coutner component
   * @param counters - All the counters and their data
   */
  receiveCounters(counters: Counter[]) {
    // TODO
  }

  /**
   * Handles a request from the counter component to retrieve an ID for a new counter
   * @param counterInitData - The initialization data for a new counter with an empty ID
   */
  receiveIdRequest(counterInitData: CounterInitData) {
    this.requestCounterIdEmitter.emit(counterInitData);
  }

  /**
   * Handles the retrieval of a new counter ID from the playspace
   * @param counterInitData - The initialization data for the new counter, which now contains the ID to use
   */
  receiveCounterId(counterInitData: CounterInitData) {
    this.counterIdEmitter.emit(counterInitData);
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
