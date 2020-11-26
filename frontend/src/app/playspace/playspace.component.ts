import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataConnection } from 'peerjs';
import { Router } from '@angular/router';

import { HostService } from '../services/host.service';
import { OnlineGamesService } from '../services/online-games.service';
import { SavedGameStateService } from '../services/saved-game-state.service';
import { MiddleWare } from '../services/middleware';

import Peer from 'peerjs';
import Phaser from 'phaser';
import Hand from '../models/hand';
import GameState, { EActionTypes } from '../models/gameState';
import PlayerData from '../models/playerData';
import SavedGameState from '../models/savedGameState';
import OnlineGame from '../models/onlineGame';
import PlayspaceScene from '../models/phaser-scenes/playspaceScene';


@Component({
  selector: 'app-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.scss']
})
export class PlayspaceComponent implements OnInit {
  public phaserGame: Phaser.Game;
  public phaserScene: PlayspaceScene;
  public config: Phaser.Types.Core.GameConfig;
  public aceOfSpades: Phaser.GameObjects.Image;
  public popupCount: number = 0;
  public sceneWidth: number = 1000;
  public sceneHeight: number = 1000;
  public handBeginY: number = 600;
  public highestID: number = 1;

  // From Game Instance
  @Input() private mainHostID: string;
  @Input() private onlineGameID: string;
  @Input() private saveGameStateEmitter: EventEmitter<string> = new EventEmitter<string>();
  @Input() private getAllSavedGameStatesEmitter: EventEmitter<SavedGameState> = new EventEmitter<SavedGameState>();
  @Input() private undoGameStateEmitter: EventEmitter<integer> = new EventEmitter<integer>();
  // To Game Instance
  @Output() public playerDataEmitter: EventEmitter<PlayerData[]> = new EventEmitter<PlayerData[]>();
  @Output() private onlineGameEmitter: EventEmitter<OnlineGame> = new EventEmitter<OnlineGame>();
  @Output() private amHostEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();


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
    private middleware: MiddleWare
   ) {
    this.gameState = new GameState([], [], []);
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

    this.peer.on('connection', (conn) => { 
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
      conn.on('close', () => {
        console.log("Peer-to-Peer Error: Other party disconnected.");
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
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error:");
        console.log(err);
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
      });
    });
   }

  ngOnInit() {
    // TODO: Band-aid solution, find a better one at some point
    setTimeout(_=> this.initialize(), 100);
    this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 5000);
    this.getAllSavedGameStates();
    this.saveGameState();
    this.undoGameStateEmitter.subscribe((count: integer) => {
      console.log("Undo??")
      this.gameState.buildGameFromCache(this, count);
    })
    
  }
  
  ngOnDestroy() {
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
    this.phaserScene = new PlayspaceScene(this, this.sceneWidth, this.sceneHeight, this.handBeginY);
    this.config = {
      type: Phaser.AUTO,
      height: this.sceneHeight,
      width: this.sceneWidth,
      scene: [ this.phaserScene ],
      parent: 'gameContainer',
    };

    this.phaserGame = new Phaser.Game(this.config);
  }

  getAllSavedGameStates() {
    this.getAllSavedGameStatesEmitter.subscribe((savedGameState: SavedGameState) => {
      if (savedGameState) { // If they actually chose a saved game state
        this.gameState.buildGameStateFromSavedState(savedGameState, this);      
  
        this.gameState.playerDataObjects.forEach((playerDataObject: PlayerData) => {
          if (playerDataObject.id != this.gameState.playerID) {      
            console.log("Sending updated state.");
            this.gameState.sendGameStateToPeers(playerDataObject.peerID);
          }
        });  
      }
    });
  }

  undoGameState() {
    console.log("Hello??")
    this.undoGameStateEmitter.subscribe((count: integer) => {
      console.log("Undo??")
      this.gameState.buildGameFromCache(this, count);
    })
  }

  saveGameState() {
    this.saveGameStateEmitter.subscribe(name => {
      this.savedGameStateService.create(new SavedGameState(this.middleware.getUsername(), name, this.gameState, this.gameState.playerDataObjects));
    });
  }

  updateOnlineGame() {
    if (this.gameState.getAmHost() && this.onlineGame) {
      this.onlineGame.lastUpdated = Date.now();
      this.onlineGamesService.update(this.onlineGame).subscribe();
    }
  }

  filterOutID(objectListToFilter: any[], object: any) {
    return objectListToFilter.filter( (refObject: any) => {
      return object.id !== refObject.id;
    });
  }

  filterOutPeer(connectionListToFilter: DataConnection[], connection: DataConnection) {
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

  finishConnectionProcess() {
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

  startConnectionProcess() {
    if (this.onlineGameID) {
      this.onlineGamesService.get(this.onlineGameID).subscribe((onlineGames: OnlineGame) => {
        this.onlineGame = onlineGames[0];

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
              this.gameState.buildGameFromCache(this);
              this.updateOnlineGameInterval = setInterval(this.updateOnlineGame.bind(this), 300000); // Tell the backend that this game still exists every 5 mins
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
          this.gameState.buildGameFromCache(this);
          this.updateOnlineGameInterval = setInterval(this.updateOnlineGame.bind(this), 300000); // Tell the backend that this game still exists every 5 mins
          this.finishConnectionProcess();
        }
      }); 
    } else {
      this.finishConnectionProcess();
    }
  }

  openConnection() {
    var conn = this.peer.connect(this.mainHostID);
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
      conn.on('close', () => {
        console.log("Peer-to-Peer Error: Connection closed.");
        if (!this.connectionClosedIntentionally) {
          this.gameState.connections = this.filterOutPeer(this.gameState.connections, conn);
          this.connOpenedSuccessfully = false;
          this.finishConnectionProcess();
          this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 2000);
        }
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error: ");
        console.log(err);
        if (!this.connectionClosedIntentionally) {
          this.gameState.connections = this.filterOutPeer(this.gameState.connections, conn);
          this.connOpenedSuccessfully = false;
          this.finishConnectionProcess();
          this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 2000);
        }
      });
      this.gameState.sendPeerData(EActionTypes.SENDSTATE, null);
    });
  }
}
