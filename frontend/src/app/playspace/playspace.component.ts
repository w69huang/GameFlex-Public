import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataConnection } from 'peerjs';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { HostService } from '../services/host.service';
import { OnlineGamesService } from '../services/online-games.service';
import { SavedGameStateService } from '../services/saved-game-state.service';
import { MiddleWare } from '../services/middleware';

import Peer from 'peerjs';
import Phaser from 'phaser';
import Card from '../models/card';
import CardMin from '../models/cardMin';
import Deck from '../models/deck';
import DeckMin from '../models/deckMin';
import Hand from '../models/hand';
import GameState, { GameObjectProperties, EGameObjectType, GameObjectExtraProperties } from '../models/gameState';
import PlayerData from '../models/playerData';
import SavedGameState from '../models/savedGameState';
import SentGameState from '../models/sentGameState';
import OnlineGame from '../models/onlineGame';
import PlayspaceScene from '../models/phaser-scenes/playspaceScene';

import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';
import * as DeckActions from '../actions/deckActions';

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

  // To Game Instance
  @Output() private onlineGameEmitter: EventEmitter<OnlineGame> = new EventEmitter<OnlineGame>();
  @Output() private playerDataEmitter: EventEmitter<PlayerData[]> = new EventEmitter<PlayerData[]>();
  @Output() private amHostEmitter: EventEmitter<boolean> = new EventEmitter<boolean>();
  
  // Peer
  public peer: any;
  public myPeerID: string;
  public connections: DataConnection[] = [];
  public firstConnectionAttempt: boolean = false;
  public connOpenedSuccessfully: boolean = false;
  public connectionClosedIntentionally: boolean = false;
  public openConnectionAttempts: number = 0;

  // State
  public playerID: number = 1;
  public playerDataObjects: PlayerData[] = [];
  public gameState: GameState;
  public onlineGame: OnlineGame;
  public initialStateRequest: boolean = false;

  // Interval Fxns
  public updateOnlineGameInterval: any;
  public checkIfCanOpenConnectionInterval: any;
  public openConnectionInterval: any;

  // TODO: SHOULD BE POPULATED AT CREATION TIME -- MAKE IT A QUERY PARAMETER
  public amHost: boolean = false;
  
  constructor(
    private hostService: HostService, 
    private onlineGamesService: OnlineGamesService, 
    private savedGameStateService: SavedGameStateService,
    private router: Router,
    private middleware: MiddleWare
   ) {
    this.myPeerID = hostService.getHostID();
    this.gameState = new GameState([], [], [], new Hand(this.playerID, []));
    this.playerDataObjects.push(new PlayerData(this.playerID, this.myPeerID));

    // NOTE: Launch a local peer server:
    // 1. npm install -g peer
    // 2. peerjs --port 9000 --key peerjs --path /peerserver
    this.peer = new Peer(this.myPeerID, { // You can pass in a specific ID as the first argument if you want to hardcode the peer ID
      host: 'localhost',
      // host: '35.215.71.108', // This is reserved for the external IP of the mongo DB instance. Replace this IP with the new IP generated when starting up the 
      port: 9000,
      path: '/peerserver' // Make sure this path matches the path you used to launch it
    }); 

    this.peer.on('connection', (conn) => { 
      console.log(`Received connection request from peer with id ${conn.peer}.`);

      conn.on('open', () => {
        // Check if there are duplicate connections, if so filter out
        this.connections = this.closeAndFilterDuplicateConnections(conn);
        this.connections.push(conn);

        this.onlineGame.numPlayers++;
        this.onlineGamesService.update(this.onlineGame).subscribe();
      });
      conn.on('data', (data) => {
        this.handleData(data);
      });
      conn.on('close', () => {
        console.log("Peer-to-Peer Error: Other party disconnected.");
        this.connections = this.filterOutPeer(this.connections, conn);

        let playerData: PlayerData = null;
        this.playerDataObjects.forEach((playerDataObject: PlayerData) => {
          if (playerDataObject.peerID === conn.peer) {
            playerData = playerDataObject;
          }
        });

        if (playerData) {
          this.playerDataObjects = this.filterOutID(this.playerDataObjects, playerData);
          this.playerDataEmitter.emit(this.playerDataObjects);

          this.onlineGame.numPlayers--;
          this.onlineGamesService.update(this.onlineGame).subscribe();
        }
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error:");
        console.log(err);
        this.connections = this.filterOutPeer(this.connections, conn);
        
        let playerData: PlayerData = null;
        this.playerDataObjects.forEach((playerDataObject: PlayerData) => {
          if (playerDataObject.peerID === conn.peer) {
            playerData = playerDataObject;
          }
        });

        if (playerData) {
          this.playerDataObjects = this.filterOutID(this.playerDataObjects, playerData);
          this.playerDataEmitter.emit(this.playerDataObjects);

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
  }
  
  ngOnDestroy() {
    this.connectionClosedIntentionally = true;
    clearInterval(this.updateOnlineGameInterval);
    this.finishConnectionProcess();
    if (this.connections.length > 0) {
      this.connections.forEach((connection: DataConnection) => {
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
  
        this.playerDataObjects.forEach((playerDataObject: PlayerData) => {
          if (playerDataObject.id != this.playerID) {      
            console.log("Sending updated state.");
            this.gameState.sendGameStateToPeers(this.myPeerID, this.playerID, this.playerDataObjects, this.connections, playerDataObject.peerID);
          }
        });  
      }
    });
  }

  saveGameState() {
    this.saveGameStateEmitter.subscribe(name => {
      this.savedGameStateService.create(new SavedGameState(this.middleware.getUsername(), name, this.gameState, this.playerDataObjects));
    });
  }

  updateOnlineGame() {
    if (this.amHost && this.onlineGame) {
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
    this.connections?.forEach((connection: DataConnection) => {
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

        if (!this.onlineGame && this.mainHostID != this.myPeerID) { // I'm not the host and I couldn't find the game
          alert('Could not find game.');
          this.router.navigate(['gameBrowser']);
        } else if (this.mainHostID != this.myPeerID) { // My ID does not match the host's
          if (this.onlineGame.username === this.middleware.getUsername()) { // i.e. I, the host, DC'd and was granted a new hostID
            // Update the hostID of the online game
            this.amHost = true;
            this.gameState.amHost = true;
            this.amHostEmitter.emit(true);
            this.onlineGame.hostID = this.myPeerID;
            this.onlineGamesService.update(this.onlineGame).subscribe((data) => {
              this.gameState.buildGameFromCache(this);
              this.updateOnlineGameInterval = setInterval(this.updateOnlineGame.bind(this), 300000); // Tell the backend that this game still exists every 5 mins
              this.finishConnectionProcess();
            });
          } else { // I am not the host
            this.amHost = false;
            this.gameState.amHost = false;
            this.openConnection();

            if (this.openConnectionAttempts >= 5) {
              alert('Could not connect to host.');
              this.router.navigate(['gameBrowser']);
            }
          }
        } else { // I am the host
          this.amHost = true;
          this.gameState.amHost = true;
          this.amHostEmitter.emit(true);
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
      this.connections.push(conn);
      this.connOpenedSuccessfully = true;
      this.firstConnectionAttempt = true;
      this.finishConnectionProcess();
      // Receive messages
      conn.on('data', (data) => {
        this.handleData(data);
      });
      conn.on('close', () => {
        console.log("Peer-to-Peer Error: Connection closed.");
        if (!this.connectionClosedIntentionally) {
          this.connections = this.filterOutPeer(this.connections, conn);
          this.connOpenedSuccessfully = false;
          this.finishConnectionProcess();
          this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 2000);
        }
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error: ");
        console.log(err);
        if (!this.connectionClosedIntentionally) {
          this.connections = this.filterOutPeer(this.connections, conn);
          this.connOpenedSuccessfully = false;
          this.finishConnectionProcess();
          this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 2000);
        }
      });
      conn.send({
        'action': 'sendState',
        'amHost': this.amHost,
        'playerID': null,
        'peerID': this.myPeerID
      });
    });
  }

  handleData(JSONdata: string) {
    let data: GameObjectProperties = JSON.parse(JSONdata);
    if (this.amHost && data.amHost) {
      // Error! Both parties claim to the be the host! Abort!
      console.log("Fatal error: both parties claim to be the host.");
      return;
    }

    switch(data.action) {

      // Received by the host after being sent by the player upon connection to the host, in which the player asks for the game state
      case 'sendState':
        let playerID = data.playerID;
        if (!playerID) {
          // They are new, generate a new ID for them
          let playerIDArray: number[] = [];

          this.playerDataObjects.forEach((playerData) => {
            playerIDArray.push(playerData.id);
          });

          let i: number = 1;
          while (playerIDArray.includes(i)) {
            i++; 
          }
          playerID = i; // Assign the player the first playerID that is not taken already
        }

        this.playerDataObjects.push(new PlayerData(playerID, data.peerID));
        this.playerDataEmitter.emit(this.playerDataObjects);

        console.log("Sending state.");
        this.gameState.sendGameStateToPeers(this.myPeerID, this.playerID, this.playerDataObjects, this.connections, data.peerID);

        break;

      case 'replicateState':
        console.log("Received state.");
        const receivedGameState: SentGameState = data.extras.state;
        this.playerID = receivedGameState.playerID;

        this.gameState.cleanUp();

        this.gameState = new GameState([], [], [], this.gameState.myHand);

        receivedGameState.cardMins.forEach((cardMin: CardMin) => {
          let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
          HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
        });
        receivedGameState.deckMins.forEach((deckMin: DeckMin) => {
          let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
          HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick, deck.x, deck.y);
        });
        receivedGameState.handMin.cardMins.forEach((cardMin: CardMin) => {
          let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, true);
          HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.HAND, card.x, card.y);
        });

        document.getElementById('loading').style.display = "none";
        document.getElementById('loadingText').style.display = "none";
        break;

      case 'move':
        if (data.extras.type === EGameObjectType.CARD) {
          
          let card: Card = this.gameState.getCardByID(data.extras.id, data.playerID).card;

          if (card) {
            card.x = data.extras.x;
            card.y = data.extras.y;
            if (card.gameObject) { 
              card.gameObject.setX(data.extras.x);
              card.gameObject.setY(data.extras.y);

              this.gameState.sendPeerData(
                new GameObjectProperties(
                  this.amHost,
                  'move',
                  this.myPeerID,
                  this.playerID,
                  {
                    id: card.id,
                    type: card.type,
                    x: data.extras.x,
                    y: data.extras.y
                  }
                ),
                this.connections,
                [data.peerID]
              );
            }
          }
        } else if (data.extras.type === EGameObjectType.DECK) {
          let deck: Deck = this.gameState.getDeckByID(data.extras.id);

          if (deck) {
            deck.x = data.extras.x;
            deck.y = data.extras.y;
            deck.gameObject.setX(data.extras.x);
            deck.gameObject.setY(data.extras.y);

            this.gameState.sendPeerData(
              new GameObjectProperties(
                this.amHost,
                'move',
                this.myPeerID,
                this.playerID,
                {
                  id: deck.id,
                  type: deck.type,
                  x: data.extras.x,
                  y: data.extras.y
                }
              ),
              this.connections,
              [data.peerID]
            );
          }
        }

        // TODO: will be able to do this in the game state class when handleData is moved into the game state class
        if (data.extras.finishedMoving) { // If they have finished moving a card/deck, save to cache
          this.gameState.saveToCache();
          this.gameState.saveToHistory();
        }
        break;

      // The host receives this action, which was sent by a non-host requesting the top card of the deck
      case 'retrieveTopCard':
        if (data.extras.type === EGameObjectType.CARD && this.amHost) {
          let deck: Deck = this.gameState.getDeckByID(data.extras.deckID);

          if (deck && deck.cards.length > 0) {
            let card: Card = this.gameState.getCardFromDeck(deck.cards.length - 1, deck.id, true);

            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

            this.gameState.sendPeerData(
              new GameObjectProperties(
                this.amHost,
                'sendTopCard',
                this.myPeerID,
                this.playerID,
                {
                  cardID: card.id,
                  deckID: deck.id,
                  type: EGameObjectType.CARD,
                  x: deck.x,
                  y: deck.y,
                  imagePath: card.imagePath
                }
              ),
              this.connections
            );
          }
        }
        break;

      // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
      case 'sendTopCard':
        if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
          let deck: Deck = this.gameState.getDeckByID(data.extras.deckID);

          if (deck) {

            let card: Card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y);
            card.inDeck = false;

            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);
          }
        }
        break;

      // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
      case 'insertIntoDeck':
        if (data.extras.type === EGameObjectType.CARD && this.amHost) {
          let card: Card = this.gameState.getCardByID(data.extras.cardID, data.playerID, true, true).card;
          let deck: Deck = this.gameState.getDeckByID(data.extras.deckID);

          if (card && deck) {
            if (this.amHost) {
              // If I am the host, tell everyone else that this card was inserted
              // Assuming they can actually see the card all ready -- if it was in the person's hand, no point in telling them

              this.gameState.sendPeerData(
                new GameObjectProperties(
                  this.amHost,
                  'insertIntoDeck',
                  this.myPeerID,
                  this.playerID,
                  {
                    cardID: card.id,
                    deckID: deck.id,
                    type: EGameObjectType.CARD,
                    x: card.x,
                    y: card.y,
                    imagePath: card.imagePath
                  }
                ),
                this.connections,
                [data.peerID]
              );
            }

            this.gameState.addCardToDeck(card, deck.id);
          }
        } else if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
          // If I am not the host and someone inserts a card into the deck, completely remove all reference to it
          // Passing in true, true means that even though the card object is returned, it is destroyed
          this.gameState.getCardByID(data.extras.cardID, data.playerID, true, true);
        }
        break;

      // Anyone can receive this action, which is sent by someone who inserts a card into their hand
      case 'insertIntoHand':
        // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
        if (data.extras.type === EGameObjectType.CARD) {
          let card: Card = this.gameState.getCardByID(data.extras.cardID, data.playerID, true, true).card;

          if (card) {
            if (this.amHost) {
              // If I am the host, first we will tell any other players that the action occured

              this.gameState.sendPeerData(
                new GameObjectProperties(
                  this.amHost,
                  'insertIntoHand',
                  this.myPeerID,
                  this.playerID,
                  {
                    cardID: card.id,
                    type: EGameObjectType.CARD,
                  }
                ),
                this.connections,
                [data.peerID]
              );

              // Then, add it to the appropriate player's hand in the game state (will only actually take effect if host)
              this.gameState.addCardToPlayerHand(card, data.playerID);
            }
          }
        }

        break;        

      // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a deck)
      case 'removeFromHand':
        if (data.extras.type === EGameObjectType.CARD) {
          let card: Card = null;
          if (this.amHost) {
            // Card already exists if I'm the host, since I know everyone's hands
            card = this.gameState.getCardByID(data.extras.cardID, data.playerID, true, true).card;

            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, data.extras.x, data.extras.y)

            // Tell other possible peers that this card was removed from a hand
            this.gameState.sendPeerData(
              new GameObjectProperties(
                this.amHost,
                'removeFromHand',
                this.myPeerID,
                this.playerID,
                {
                  cardID: card.id,
                  type: EGameObjectType.CARD,
                  imagePath: card.imagePath,
                  x: card.x,
                  y: card.y,
                }
              ),
              this.connections,
              [data.peerID]
            );        
          } else {
            card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y);
            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, data.extras.x, data.extras.y);
          }
        }

        break;

      case 'importDeck':
        if (data.extras.type === EGameObjectType.DECK && this.amHost) {
          let deck: Deck = this.gameState.getDeckByID(data.extras.deckID);

          if (deck) {
            let imagePaths: string[] = data.extras.imagePaths;

            imagePaths.forEach((imagePath: string) => {
              deck.cards.push(new Card(this.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y));
            });
          }
        }
        break;

      default:
        console.log('Received action did not match any existing action.');
        break;
    }
  }
}
