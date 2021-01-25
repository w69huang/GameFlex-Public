import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DataConnection } from 'peerjs';
import Peer from 'peerjs';
import Phaser from 'phaser';

import { HostService } from '../services/host.service';
import { OnlineGamesService } from '../services/online-games.service';
import { SavedGameStateService } from '../services/saved-game-state.service';
import { MiddleWare } from '../services/middleware';
import { LoadGameStatePopupComponent } from '../popups/load-game-state-popup/load-game-state-popup.component';
import { ECounterActions, CounterActionObject } from '../counter/counter.component';

import GameState, { EActionTypes } from '../models/gameState';
import PlayerData from '../models/playerData';
import SavedGameState from '../models/savedGameState';
import OnlineGame from '../models/onlineGame';
import PlayspaceScene from '../models/phaser-scenes/playspaceScene';
import SentGameState from '../models/sentGameState';

import * as CoA from '../actions/counterActions';
import * as HF from '../helper-functions';

@Component({
  selector: 'app-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.scss']
})
export class PlayspaceComponent implements OnInit {
  public phaserGame: Phaser.Game;
  public phaserScene: PlayspaceScene;
  public config: Phaser.Types.Core.GameConfig;
  public popupCount: number = 0;
  public highestID: number = 1;

  // From Game Instance
  @Input() private mainHostID: string;
  @Input() private onlineGameID: string;
  @Input() private saveGameStateEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Input() private getAllSavedGameStatesEmitter: EventEmitter<SavedGameState> = new EventEmitter<SavedGameState>();
  @Input() private undoGameStateEmitter: EventEmitter<number> = new EventEmitter<number>();
  @Input() private counterActionInputEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  // To Game Instance
  @Output() public playerDataEmitter: EventEmitter<PlayerData[]> = new EventEmitter<PlayerData[]>();
  @Output() private onlineGameEmitter: EventEmitter<OnlineGame> = new EventEmitter<OnlineGame>();
  @Output() private amHostEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() public counterActionOutputEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  // Peer
  public peer: any;
  public firstConnectionAttempt: boolean = false;
  public connOpenedSuccessfully: boolean = false;
  public connectionClosedIntentionally: boolean = false;
  public openConnectionAttempts: number = 0;

  // State
  public gameState: GameState;
  public onlineGame: OnlineGame;
  public initialStateRequest: boolean = false;

  // Interval Fxns
  public updateOnlineGameInterval: any;
  public checkIfCanOpenConnectionInterval: any;
  public openConnectionInterval: any;
  
  constructor(
    private hostService: HostService, 
    private onlineGamesService: OnlineGamesService, 
    private savedGameStateService: SavedGameStateService,
    private router: Router,
    private middleware: MiddleWare,
    private dialog: MatDialog
   ) {
    this.gameState = new GameState([], [], [], []);
    this.gameState.myPeerID = hostService.getHostID();

    // NOTE: Launch a local peer server:
    // 1. npm install -g peer
    // 2. peerjs --port 9000 --key peerjs --path /peerserver
    this.peer = new Peer(this.gameState.myPeerID, { // You can pass in a specific ID as the first argument if you want to hardcode the peer ID
      // host: 'localhost',
      host: '35.215.71.108', // This is reserved for the external IP of the mongo DB instance. Replace this IP with the new IP generated when starting up the 
      port: 9000,
      path: '/peerserver' // Make sure this path matches the path you used to launch it
    });

    this.peer.on('connection', (conn: DataConnection) => { 
      console.log(`Received connection request from peer with id ${conn.peer}.`);

      conn.on('open', () => {
        // Check if there are duplicate connections, if so filter out
        this.gameState.connections = this.closeAndFilterDuplicateConnections(conn);
        this.gameState.connections.push(conn);

        this.onlineGame.numPlayers++;
        this.onlineGamesService.update(this.onlineGame).subscribe();
      });
      conn.on('data', (data) => {
        this.gameState.handleData(data, this);
      });

      // Catches the case of a browser being closed
      conn.peerConnection.oniceconnectionstatechange = () => {
        if(conn.peerConnection.iceConnectionState == 'disconnected') {
          console.log("Peer-to-Peer Error 1: Other party disconnected.");
          this.hostHandleConnectionClose(conn);
        }
      }
      conn.on('close', () => {
        console.log("Peer-to-Peer Error 2: Other party disconnected.");
        this.hostHandleConnectionClose(conn);
      });
      conn.on('disconnected', () => {
        console.log('Peer-to-Peer Error 3: Peer disconnected from signalling server.');
        this.hostHandleConnectionClose(conn);
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error:");
        console.log(err);
        this.hostHandleConnectionClose(conn);
      });
    });
  }

  hostHandleConnectionClose(conn: DataConnection): void {
    conn.close();
    this.gameState.connections = this.filterOutPeer(this.gameState.connections, conn);
    
    let playerData: PlayerData = null;
    this.gameState.playerDataObjects.forEach((playerDataObject: PlayerData) => {
      if (playerDataObject.peerID === conn.peer) {
        playerData = playerDataObject;
      }
    });

    if (playerData) {
      this.gameState.playerDataObjects = this.filterOutID(this.gameState.playerDataObjects, playerData);
      this.playerDataEmitter.emit(this.gameState.playerDataObjects);

      this.onlineGame.numPlayers--;
      this.onlineGamesService.update(this.onlineGame).subscribe();
    }
  }

  ngOnInit(): void {
    // TODO: Band-aid solution, find a better one at some point
    setTimeout(_ => this.initialize(), 100);
    this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 5000);
    this.setUpEmitters();
  }

  ngOnDestroy(): void {
    this.connectionClosedIntentionally = true;
    clearInterval(this.updateOnlineGameInterval);
    this.finishConnectionProcess();
    if (this.gameState.connections.length > 0) {
      this.gameState.connections.forEach((connection: DataConnection) => {
        connection.close();
      });
    }
    this.peer.destroy();
    this.phaserGame.destroy(true);
  }

  initialize(): void {
    this.phaserScene = new PlayspaceScene(this);
    this.config = {
      type: Phaser.AUTO,
      height: HF.sceneHeight,
      width: HF.sceneWidth,
      scene: [this.phaserScene],
      parent: 'gameContainer',
    };

    this.phaserGame = new Phaser.Game(this.config);
  }

  setUpEmitters(): void {
    this.getAllSavedGameStatesEmitter.subscribe((savedGameState: SavedGameState) => {
      if (savedGameState) { // If they actually chose a saved game state
        // let processedSavedGameState = processSavedGameState(savedGameState, true, false);

        this.gameState.buildGameStateFromSavedState(savedGameState, this);      
      }
    });

    this.undoGameStateEmitter.subscribe((count: number) => {
      if (!this.gameState.undoInProgress) {
        this.gameState.buildGameFromCache(this, false, count);
      }
    });

    this.saveGameStateEmitter.subscribe((name: string) => {
      this.savedGameStateService.create(new SavedGameState(this.middleware.getUsername(), name, this.gameState));
    });

    this.counterActionInputEmitter.subscribe((counterActionObject: CounterActionObject) => {
      switch (counterActionObject.counterAction) {
        case ECounterActions.addCounter:
          CoA.addCounter(counterActionObject.counter, null, this.gameState, null, true);
          break;
        
        case ECounterActions.removeCounter:
          CoA.removeCounter(counterActionObject.counter, null, this.gameState, null, true);
          break;

        case ECounterActions.changeCounterValue:
          CoA.changeCounterValue(counterActionObject.counter, null, this.gameState, null, true);
          break;
          
        default:
          break;
      }
    });
  }

  updateOnlineGame(): void {
    if (this.gameState.getAmHost() && this.onlineGame) {
      this.onlineGame.lastUpdated = Date.now();
      this.onlineGamesService.update(this.onlineGame).subscribe();
    }
  }

  filterOutID(objectListToFilter: any[], object: any): any[] {
    return objectListToFilter.filter( (refObject: any) => {
      return object.id !== refObject.id;
    });
  }

  filterOutPeer(connectionListToFilter: DataConnection[], connection: DataConnection): DataConnection[] {
    return connectionListToFilter.filter( (refConnection: DataConnection) => {
      return connection.peer !== refConnection.peer;
    });
  }

  closeAndFilterDuplicateConnections(conn: DataConnection): DataConnection[] {
    let newConnectionList: DataConnection[] = [];
    this.gameState.connections?.forEach((connection: DataConnection) => {
      if (connection.peer === conn.peer) {
        connection.close();
      } else {
        newConnectionList.push(connection);
      }
    });
    return newConnectionList;
  }

  buildFromCacheDialog(): void {
    if (JSON.parse(localStorage.getItem('cachedGameState'))?.numMoves > 0) {
      let dialogRef = this.dialog.open(LoadGameStatePopupComponent, {
        height: '290px',
        width: '350px',
      });
  
      dialogRef.afterClosed().subscribe(object => {
        if (object.loadFromCache === true) {
          this.gameState.buildGameFromCache(this, true);
        } else if (object.loadFromCache === false) {
          this.gameState.clearCache();
        } else {
          console.log('Error loading game from cache.');
        }
      });
    } else {
      this.gameState.clearCache();
    }
  }

  finishConnectionProcess(): void {
    this.openConnectionAttempts = 0;

    if (this.checkIfCanOpenConnectionInterval) {
      clearInterval(this.checkIfCanOpenConnectionInterval);
    }
    if (this.openConnectionInterval) {
      clearInterval(this.openConnectionInterval);
    }

    document.getElementById('loading').style.display = "none";
    document.getElementById('loadingText').style.display = "none";
  }

  checkIfCanOpenConnection() {
    if (!this.connOpenedSuccessfully) {
      document.getElementById('loading').removeAttribute('style');
      document.getElementById('loadingText').removeAttribute('style');
      if (this.firstConnectionAttempt) { // If the first connection attempt has occurred but the connection was not opened successfully
        this.openConnectionInterval = setInterval(this.startConnectionProcess.bind(this), 5000);
        clearInterval(this.checkIfCanOpenConnectionInterval);
      }
    }
  }

  startConnectionProcess(): void {
    if (this.onlineGameID) {
      this.onlineGamesService.get(this.onlineGameID).subscribe((onlineGames: OnlineGame) => {
        this.onlineGame = onlineGames[0];
        this.onlineGame.numPlayers = 1;

        if (this.onlineGame) { // If the online game's hostID has updated (b/c the host disconnects), update our local hostID reference
          this.mainHostID = this.onlineGame.hostID;
          this.onlineGameEmitter.emit(this.onlineGame);
        }

        if (!this.onlineGame && this.mainHostID != this.gameState.myPeerID) { // I'm not the host and I couldn't find the game
          alert('Could not find game.');
          this.router.navigate(['gameBrowser']);
        } else if (this.mainHostID != this.gameState.myPeerID) { // My ID does not match the host's
          if (this.onlineGame.username === this.middleware.getUsername()) { // i.e. I, the host, DC'd and was granted a new hostID
            // Update the hostID of the online game
            this.gameState.setAmHost(true, this.amHostEmitter, this.middleware.getUsername());
            this.onlineGame.hostID = this.gameState.myPeerID;
            this.onlineGamesService.update(this.onlineGame).subscribe((data) => {
              this.buildFromCacheDialog();
              this.updateOnlineGameInterval = setInterval(this.updateOnlineGame.bind(this), 120000); // Tell the backend that this game still exists every 5 mins
              this.finishConnectionProcess();
            });
          } else { // I am not the host
            this.gameState.setAmHost(false, this.amHostEmitter);
            this.openConnection();

            if (this.openConnectionAttempts >= 5) {
              alert('Could not connect to host.');
              this.router.navigate(['gameBrowser']);
            }
          }
        } else { // I am the host
          this.gameState.setAmHost(true, this.amHostEmitter, this.middleware.getUsername());
          this.buildFromCacheDialog();
          this.updateOnlineGameInterval = setInterval(this.updateOnlineGame.bind(this), 300000); // Tell the backend that this game still exists every 5 mins
          this.finishConnectionProcess();
        }
      });
    } else {
      this.finishConnectionProcess();
    }
  }

  openConnection(): void {
    var conn: DataConnection = this.peer.connect(this.mainHostID);
    this.firstConnectionAttempt = true;
    this.openConnectionAttempts++;
    conn?.on('open', () => {
      console.log(`Connection to ${this.mainHostID} opened successfully.`);
      this.gameState.connections.push(conn);
      this.connOpenedSuccessfully = true;
      this.firstConnectionAttempt = true;
      this.finishConnectionProcess();
      // Receive messages
      conn.on('data', (data) => {
        this.gameState.handleData(data, this);
      });

      // Catches the case where the browser is closed
      conn.peerConnection.oniceconnectionstatechange = () => {
        if(conn.peerConnection.iceConnectionState == 'disconnected') {
          console.log("Peer-to-Peer Error 4: Other party disconnected.");
          this.clientHandleConnectionClose(conn);
        }
      }
      conn.on('close', () => {
        console.log("Peer-to-Peer Error 5: Other party disconnected.");
        this.clientHandleConnectionClose(conn);
      });
      conn.on('disconnected', () => {
        console.log('Peer-to-Peer Error 6: Peer disconnected from signalling server.');
        this.hostHandleConnectionClose(conn);
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error: ");
        console.log(err);
        this.clientHandleConnectionClose(conn);
      });
      this.gameState.sendPeerData(EActionTypes.sendState, null);
    });
  }

  clientHandleConnectionClose(conn: DataConnection): void {
    if (!this.connectionClosedIntentionally) {
      this.gameState.connections = this.filterOutPeer(this.gameState.connections, conn);
      this.connOpenedSuccessfully = false;
      this.finishConnectionProcess();
      this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 2000);
    }
  }

}
