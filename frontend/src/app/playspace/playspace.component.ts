import { Component, OnInit } from '@angular/core';
import { DataConnection } from 'peerjs';
import { ActivatedRoute } from '@angular/router';
import { HostService } from '../host.service';
import Peer from 'peerjs';
import Phaser from 'phaser';
import Card from '../models/card';
import CardMin from '../models/cardMin';
import Deck from '../models/deck';
import DeckMin from '../models/deckMin';
import Hand from '../models/hand';
import GameState from '../models/gameState';
import SentGameState from '../models/sentGameState';
import PlayspaceScene from '../models/phaser-scenes/playspaceScene';

import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';
import * as DeckActions from '../actions/deckActions';
import OnlineGame from '../models/onlineGame';
import { OnlineGamesService } from '../online-games.service';

class PlayerData {
  id: number; // Player ID
  peerID: string;
  username: string;

  constructor(id: number, peerID: string, username?: string) {
    this.id = id;
    this.peerID = peerID;
    this.username = username;
  }
}

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
  public peer: any;
  public myPeerID: string;
  public connections: DataConnection[] = [];
  public highestID: number = 1;

  // State
  public playerID: number = 1;
  public playerDataObjects: PlayerData[] = [];
  public gameState: GameState;
  public onlineGame: OnlineGame;

  // Interval Fxns
  public updateOnlineGameInterval: any;

  // NOTE: In the future, this should be populated by a DB call for a specific game
  public amHost: boolean = true;
  
  constructor(private route: ActivatedRoute, private hostService: HostService, private onlineGamesService: OnlineGamesService) {
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
      this.onlineGame.numPlayers++;
      this.connections.push(conn);

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
        }
      });
    });

    this.route.queryParams.subscribe(params => {
      let mainHostID = params['host'];
      let onlineGameID = params['onlineGameID'];

      this.onlineGamesService.get(onlineGameID).subscribe((onlineGame: OnlineGame) => {
        this.onlineGame = onlineGame;
        if (mainHostID != this.myPeerID) {
          this.amHost = false;
          var conn = this.peer.connect(mainHostID);
          this.connections.push(conn);
          conn.on('open', () => {
            console.log(`Connection to ${mainHostID} opened successfully.`);
            // Receive messages
            conn.on('data', (data) => {
              this.handleData(data);
            });
            conn.on('close', () => {
              console.log("Peer-to-Peer Error: Other party disconnected.");
              this.connections = this.filterOutPeer(this.connections, conn);
            });
            conn.on('error', (err) => {
              console.log("Unspecified Peer-to-Peer Error:");
              console.log(err);
              this.connections = this.filterOutPeer(this.connections, conn);
            });
          });
        } else {
          this.updateOnlineGameInterval = setInterval(this.updateOnlineGame.bind(this), 300000); // Tell the backend that this game still exists every 5 mins
        }
      });     
    });
   }

  ngOnInit() {
    // TODO: Band-aid solution, find a better one at some point
    setTimeout(_=> this.initialize(), 100);
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

  ngOnDestroy() {
    clearInterval(this.updateOnlineGameInterval);
    if (this.connections.length > 0) {
      this.connections.forEach((connection: DataConnection) => {
        connection.close();
      });
    }
    this.peer.destroy();
    this.phaserGame.destroy(true);
  }

  updateOnlineGame() {
    if (this.amHost && this.onlineGame) {
      this.onlineGamesService.confirmActive(this.onlineGame);
    }
  }

  filterOutID(objectListToFilter: any[], object: any) {
    return objectListToFilter.filter( (refObject: any) => {
      return object.id !== refObject.id;
    });
  }

  filterOutPeer(objectListToFilter: any[], object: any) {
    return objectListToFilter.filter( (refObject: any) => {
      return object.peer !== refObject.peer;
    });
  }

  handleData(data: string) {
    if (this.amHost && data['amHost']) {
      // Error! Both parties claim to the be the host! Abort!
      console.log("Fatal error: both parties claim to be the host.");
      return;
    }

    switch(data['action']) {

      // Received by the host after being sent by the player upon connection to the host, in which the player asks for the game state
      case 'sendState':
        let playerID = data['playerID'];
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
        const sentGameState: SentGameState = new SentGameState(this.gameState, playerID);

        this.playerDataObjects.push(new PlayerData(playerID, data['peerID']));

        console.log("Sending state.");
        this.connections.forEach((connection: DataConnection) => {
          // Only send updated state to the person who asked
          if (connection.peer === data['peerID']) {
            connection.send({
              'action': 'replicateState',
              'state': sentGameState,
              'amHost': this.amHost,
              'playerID': this.playerID,
              'yourPlayerID': playerID,
              'peerID': this.myPeerID
            });
          }
        });
        break;

      case 'replicateState':
        console.log("Received state.");
        const receivedGameState: SentGameState = data['state'];
        this.playerID = data['yourPlayerID'];

        this.cleanUpGameState();

        this.gameState = new GameState([], [], [], this.gameState.myHand);

        receivedGameState.cardMins.forEach((cardMin: CardMin) => {
          let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
          HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
        });
        receivedGameState.deckMins.forEach((deckMin: DeckMin) => {
          let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
          HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, DeckActions.deckRightClick, deck.x, deck.y);
        });
        receivedGameState.handMin.cardMins.forEach((cardMin: CardMin) => {
          let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, true);
          HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.HAND, card.x, card.y);
        });
        break;

      case 'move':
        if (data['type'] === 'card') {
          let card: Card = null;
          let found: boolean = true;
          
          for (let i = 0; i < this.gameState.cards.length; i++) {
            if (this.gameState.cards[i].id === data['id']) {
              card = this.gameState.cards[i];
              found = false;
              break;
            }
          }

          if (!found && this.amHost) {
            for (let i = 0; i < this.gameState.hands.length; i++) {
              if (data['playerID'] === this.gameState.hands[i].playerID) {
                for (let j = 0; j < this.gameState.hands[i].cards.length; j++) {
                  if (this.gameState.hands[i].cards[j].id === data['id']) {
                    card = this.gameState.hands[i].cards[j];
                    break;
                  }
                }
                break;
              }
            }
          }

          if (card) {
            card.x = data['x'];
            card.y = data['y'];
            if (card.gameObject) { 
              card.gameObject.setX(data['x']);
              card.gameObject.setY(data['y']);

              if (this.amHost) {
                this.connections.forEach((connection: DataConnection) => {
                  if (connection.peer != data['peerID']) {
                    connection.send({
                      'action': 'move',
                      'type': card.type,
                      'id': card.id,
                      'x': data['x'],
                      'y': data['y'],
                      'amHost': this.amHost,
                      'playerID': this.playerID,
                      'peerID': this.myPeerID
                    });
                  }
                });
              }
            }
          }
        } else if (data['type'] === 'deck') {
          let deck: Deck = null;
          for (let i = 0; i < this.gameState.decks.length; i++) {
            if (this.gameState.decks[i].id === data['id']) {
              deck = this.gameState.decks[i];
              break;
            }
          }
          if (deck) {
            deck.x = data['x'];
            deck.y = data['y'];
            deck.gameObject.setX(data['x']);
            deck.gameObject.setY(data['y']);

            if (this.amHost) {
              this.connections.forEach((connection: DataConnection) => {
                if (connection.peer != data['peerID']) {
                  connection.send({
                    'action': 'move',
                    'type': deck.type,
                    'id': deck.id,
                    'x': data['x'],
                    'y': data['y'],
                    'amHost': this.amHost,
                    'playerID': this.playerID,
                    'peerID': this.myPeerID
                  });
                }
              });
            }
          }
        }
        break;

      // The host receives this action, which was sent by a non-host requesting the top card of the deck
      case 'retrieveTopCard':
        if (data['type'] === 'card' && this.amHost) {
          let deck: Deck = null;

          for (let i = 0; i < this.gameState.decks.length; i++) {
            if (this.gameState.decks[i].id === data['deckID']) {
              deck = this.gameState.decks[i];
              break;
            }
          }
  
          if (deck && deck.cards.length > 0) {
            let card: Card = deck.cards[deck.cards.length - 1];

            card.inDeck = false;
            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

            deck.cards = this.filterOutID(deck.cards, card);

            this.connections.forEach((connection: DataConnection) => { 
              connection.send({
                'action': 'sendTopCard',
                'type': 'card',
                'cardID': card.id,
                'imagePath': card.imagePath,
                'deckID': deck.id,
                'x': deck.gameObject.x,
                'y': deck.gameObject.y,
                'amHost': this.amHost,
                'playerID': this.playerID,
                'peerID': this.myPeerID
              });
            });
          }
        }
        break;

      // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
      case 'sendTopCard':
        if (data['type'] === 'card' && !this.amHost) {
          let deck: Deck = null;

          for (let i = 0; i < this.gameState.decks.length; i++) {
            if (this.gameState.decks[i].id === data['deckID']) {
              deck = this.gameState.decks[i];
              break;
            }
          }

          if (deck) {

            let card: Card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);
            card.inDeck = false;

            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);
          }
        }
        break;

      // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
      case 'insertIntoDeck':
        if (data['type'] === 'card' && this.amHost) {
          let card: Card = null;
          let deck: Deck = null;
          let handIndex: number = null;
          let foundInHand = data['foundInHand'];

          if (!foundInHand) {
            for (let i = 0; i < this.gameState.cards.length; i++) {
              if (this.gameState.cards[i].id === data['cardID']) {
                card = this.gameState.cards[i];
                break;
              }
            }
          } else {
            for (let i = 0; i < this.gameState.hands.length; i++) {
              if (this.gameState.hands[i].playerID === data['playerID']) {
                let hand: Hand = this.gameState.hands[i];
                handIndex = i;

                for (let j = 0; j < hand.cards.length; j++) {
                  if (hand.cards[j].id === data['cardID']) {
                    card = hand.cards[j];
                    break;
                  }
                }
                break;
              }
            }
          }

          for (let i = 0; i < this.gameState.decks.length; i++) {
            if (this.gameState.decks[i].id === data['deckID']) {
              deck = this.gameState.decks[i];
              break;
            }
          }

          if (card && deck) {
            if (this.amHost && !foundInHand) {
              // If I am the host, tell everyone else that this card was inserted
              // Assuming they can actually see the card all ready -- if it was in the person's hand, no point in telling them

              this.connections.forEach((connection: DataConnection) => {
                if (connection.peer != data['peerID']) {
                  connection.send({
                    'action': 'insertIntoDeck',
                    'type': card.type,
                    'cardID': card.id,
                    'deckID': deck.id,
                    'imagePath': card.imagePath,
                    'x': card.gameObject.x,
                    'y': card.gameObject.y,
                    'foundInHand': foundInHand,
                    'amHost': this.amHost,
                    'playerID': this.playerID,
                    'peerID': this.myPeerID
                  });
                }
              });
            }

            deck.cards.push(card);

            if (card.gameObject) {
              card.gameObject.destroy();
              card.gameObject = null;
            }

            if (!foundInHand) {
              this.gameState.cards = this.filterOutID(this.gameState.cards, card);
            } else {
              card.inHand = false;
              this.gameState.hands[handIndex].cards = this.filterOutID(this.gameState.hands[handIndex].cards, card);
            }
          }
        } else if (data['type'] === 'card' && !this.amHost) {
          let card: Card = null;

          for (let i = 0; i < this.gameState.cards.length; i++) {
            if (this.gameState.cards[i].id === data['cardID']) {
              card = this.gameState.cards[i];
              break;
            }
          }

          if (card) {
            // If I am not the host and someone inserts a card into the deck, completely remove all reference to it

            card.gameObject.destroy();
            this.gameState.cards = this.filterOutID(this.gameState.cards, card);
          }
        }
        break;

      // Anyone can receive this action, which is sent by someone who inserts a card into their hand
      case 'insertIntoHand':
        // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
        if (data['type'] === 'card') {
          let card: Card = null;

          for (let i = 0; i < this.gameState.cards.length; i++) {
            if (this.gameState.cards[i].id === data['cardID']) {
              card = this.gameState.cards[i];
              break;
            }
          }

          if (card) {
            // Delete the card
            card.gameObject.destroy();
            card.gameObject = null;

            if (this.amHost) {
              // If I am the host, first we will tell any other players that the action occured
              this.connections.forEach((connection: DataConnection) => {
                if (connection.peer != data['peerID']) {
                  connection.send({
                    'action': 'insertIntoHand',
                    'type': card.type,
                    'cardID': card.id,
                    'amHost': this.amHost,
                    'playerID': this.playerID,
                    'peerID': this.myPeerID
                  });
                }
              });

              // Then, add it to the appropriate player's hand in the game state

              card.inHand = true;
              let hand: Hand = null;
              this.gameState.hands.forEach((refHand: Hand) => {
                if (data['playerID'] === refHand.playerID) {
                  hand = refHand;
                }
              });

              if (!hand) {
                this.gameState.hands.push(new Hand(data['playerID'], [card]));
              } else {
                hand.cards.push(card);
              }
            }

            this.gameState.cards = this.filterOutID(this.gameState.cards, card);
          }
        }

        break;        

      // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a deck)
      case 'removeFromHand':
        if (data['type'] === 'card') {
          let card: Card = null;
          if (this.amHost) {
            // Card already exists
            for (let i = 0; i < this.gameState.hands.length; i++) {
              if (this.gameState.hands[i].playerID === data['playerID']) {
                for (let j = 0; j < this.gameState.hands[i].cards.length; j++) {
                  if (this.gameState.hands[i].cards[j].id === data['cardID']) {
                    card = this.gameState.hands[i].cards[j];
                    card.inHand = false;
                    this.gameState.hands[i].cards = this.filterOutID(this.gameState.hands[i].cards, card);
                    HelperFunctions.createCard(card, this,  SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, data['x'], data['y'])

                    // Tell other possible peers that this card was removed from a hand
                    this.connections.forEach((connection: DataConnection) => {
                      if (connection.peer != data['peerID']) {
                        connection.send({
                          'action': 'removeFromHand',
                          'type': card.type,
                          'cardID': card.id,
                          'imagePath': card.imagePath,
                          'x': card.gameObject.x,
                          'y': card.gameObject.y,
                          'amHost': this.amHost,
                          'playerID': this.playerID,
                          'peerID': this.myPeerID
                        });
                      }
                    });
                    break;
                  }
                }
                break;
              }
            }
          } else {
            card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);
            HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, data['x'], data['y']);
          }
        }

        break;

      case 'importDeck':
        if (data['type'] === 'deck' && this.amHost) {
          let deck: Deck = null;

          for (let i = 0; i < this.gameState.decks.length; i++) {
            if (this.gameState.decks[i].id === data['deckID']) {
              deck = this.gameState.decks[i];
            }
          }

          if (deck) {
            let imagePaths: string[] = data['imagePaths'];

            imagePaths.forEach((imagePath: string) => {
              deck.cards.push(new Card(this.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y));
            });
          }
        }
        break;

      case 'shuffle':
        // TODO: Right now, only hosts can shuffle because only they know what is in the deck, and so no one should be receiving this call
        // Can change if necessary

        //if (data['type'] === 'deck' && this.amHost) {
        //  let deck: Deck = null;
        //
        //  for (let i = 0; i < this.phaserScene.decks.length; i++) {
        //    if (this.phaserScene.decks[i].id === data['deckID']) {
        //      deck = this.phaserScene.decks[i];
        //    }
        //  }
        //
        //  if (deck) {
        //    let shuffled = [];
        //    data['shuffledCardIDs'].forEach((id) => {
        //      for (let i = 0; i < deck.cards.length; i++) {
        //        if (id === deck.cards[i].id) {
        //          shuffled.push(deck.cards[i]);
        //          break;
        //        }
        //      }
        //    });
        //
        //    deck.cards = shuffled;
        //  }
        //}
        break;

      default:
        console.log('received action');
        break;
    }
  }

  cleanUpGameState() {
    this.gameState.cards.forEach((card: Card) => {
      card.gameObject.destroy();
    });
    this.gameState.cards = [];
    this.gameState.decks.forEach((deck: Deck) => {
      deck.gameObject.destroy();
    });
    this.gameState.decks = [];
    this.gameState.myHand.cards.forEach((card: Card) => {
      card.gameObject.destroy();
    });
    this.gameState.myHand.cards = [];
  }
}
