import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { DataConnection } from 'peerjs';
import Phaser, { GameObjects } from 'phaser';
import Card from '../models/card';
import CardMin from '../models/cardMin';
import Deck from '../models/deck';
import DeckMin from '../models/deckMin';
import Hand from '../models/hand';
import HandMin from '../models/handMin';
import GameState from '../models/gameState';
import SentGameState from '../models/sentGameState';

declare var Peer: any;

enum DestinationEnum {
  TABLE = "Table",
  HAND = "Hand"
}

class OptionObject {
  optionKey: string;
  optionFunction: Function;
  optionImage: string;
  optionWidth: number;
  optionHeight: number;

  constructor (optionKey, optionFunction, optionImage, optionWidth, optionHeight) {
    this.optionKey = optionKey;
    this.optionFunction = optionFunction;
    this.optionImage = optionImage;
    this.optionWidth = optionWidth;
    this.optionHeight = optionHeight;
  }
}

class PopupScene extends Phaser.Scene {

    key: string;
    playspaceComponent: PlayspaceComponent;
    deck: Deck;
    x: number;
    y: number;
    width: number;
    height: number;
    optionSeparation: number;
    optionObjects: OptionObject[];

    constructor (handle, x, y, playspaceComponent, deck, width, height, optionObjects: OptionObject[], optionSeparation: number) {
        super(handle);
        this.key = handle;
        this.x = x;
        this.y = y;
        this.playspaceComponent = playspaceComponent;
        this.deck = deck;
        this.width = width;
        this.height = height;
        this.optionObjects = optionObjects;
        this.optionSeparation = optionSeparation;
    }
    create () {
        this.cameras.main.setViewport(this.x, this.y, this.width, this.height);

        var popup = this.add.image(0, 0, 'grey-background').setOrigin(0);
        popup.displayWidth = this.width;
        popup.displayHeight = this.height;

        var closeButton = this.add.image(225, 0, 'close').setOrigin(0);
        closeButton.setInteractive();
        closeButton.on('pointerdown', this.playspaceComponent.popupClose.bind(this, this, this.playspaceComponent));
        closeButton.displayWidth = 25;
        closeButton.displayHeight = 25;

        var verticalPosition = 0;
        this.optionObjects.forEach((object: OptionObject) => {
          var button = this.add.image(0, verticalPosition, object.optionKey).setOrigin(0);
          button.setInteractive();
          button.on('pointerdown', object.optionFunction.bind(this, this, this.deck, this.playspaceComponent));
          button.displayWidth = object.optionWidth;
          button.displayHeight = object.optionHeight;

          verticalPosition += object.optionHeight + this.optionSeparation;
        });
    }

    preload() {
      this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
      this.load.image('close', 'assets/images/buttons/close.png');
      this.optionObjects.forEach((object) => {
        this.load.image(object.optionKey, object.optionImage);
      });
    }
}

class MainScene extends Phaser.Scene {
  playspaceComponent: PlayspaceComponent;
  width: number;
  height: number;
  handBeginY: number;

  constructor(playspaceComponent: PlayspaceComponent, width: number, height: number, handBeginY: number) {
    super({ key: 'main' });
    this.playspaceComponent = playspaceComponent;
    this.width = width;
    this.height = height;
    this.handBeginY = handBeginY;
  }

  create() {
    this.input.mouse.disableContextMenu();

    let cardList: Card[] = [new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_spades.png", 250, 250),
                            new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_clubs.png", 550, 250),
                            new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_hearts.png", 250, 350),
                            new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_diamonds.png", 550, 350)];
    let deckList: Deck[] = [new Deck(this.playspaceComponent.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250)];


    if (this.playspaceComponent.gameState.myHand.gameObject == null) {
      this.playspaceComponent.gameState.myHand.gameObject = this.add.image(0, this.handBeginY, 'grey-background').setOrigin(0); // SET ORIGIN IS THE KEY TO HAVING IT PLACED IN THE CORRECT POSITION! Why??
      this.playspaceComponent.gameState.myHand.gameObject.setInteractive();
      this.playspaceComponent.gameState.myHand.gameObject.displayWidth = this.width;
      this.playspaceComponent.gameState.myHand.gameObject.displayHeight = this.height - this.handBeginY;
    }

    cardList.forEach(card => {
        this.playspaceComponent.createCard(card, this.playspaceComponent, DestinationEnum.TABLE, card.x, card.y);
    });

    deckList.forEach(deck => {
      this.playspaceComponent.createDeck(deck, this.playspaceComponent, deck.x, deck.y);
    });

  }

  preload() {
    this.playspaceComponent.gameState.cards.forEach(card => {
      this.load.image(card.imagePath, card.imagePath);
    });
    this.playspaceComponent.gameState.decks.forEach(deck => {
      this.load.image(deck.imagePath, deck.imagePath);
    });
    this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
  }

  // update() {}
}

// TODO: Consider using a hashmap of keys to card objects (an associative array/object)

@Component({
  selector: 'app-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.scss']
})
export class PlayspaceComponent implements OnInit {
  public phaserGame: Phaser.Game;
  public phaserScene: MainScene;
  public config: Phaser.Types.Core.GameConfig;
  public aceOfSpades: Phaser.GameObjects.Image;
  public popupCount: number = 0;
  public sceneWidth: number = 1000;
  public sceneHeight: number = 1000;
  public handBeginY: number = 600;
  public peer: any;
  public peerId: string;
  public otherPeerId: string;
  public conn: DataConnection;
  public highestID: number = 1;

  // State
  public playerID: number = 1;
  public gameState: GameState;
  

  // NOTE: In the future, this should be populated by a DB call for a specific game
  public amHost: boolean = true;
  
  constructor() { 
    this.phaserScene = new MainScene(this, this.sceneWidth, this.sceneHeight, this.handBeginY);
    this.config = {
      type: Phaser.AUTO,
      height: this.sceneHeight,
      width: this.sceneWidth,
      scene: [ this.phaserScene ],
      parent: 'gameContainer',
    };
  }

  ngOnInit(): void {
    // TODO: Based off player ID, need to ensure the other person has a different playerID
    this.gameState = new GameState([], [], [], new Hand(this.playerID, []));

    this.phaserGame = new Phaser.Game(this.config);

    // NOTE: Launch a local peer server:
    // 1. npm install -g peer
    // 2. peerjs --port 9000 --key peerjs --path /peerserver
    this.peer = new Peer({ // You can pass in a specific ID as the first argument if you want to hardcode the peer ID
      host: 'localhost',
      // host: '35.236.57.123', This is reserved for the external IP of the mongo DB instance. Replace this IP with the new IP generated when starting up the 
      // Mongo instance.
      port: 9000,
      path: '/peerserver' // Make sure this path matches the path you used to launch it
    }); 
    this.peer.on('open', (id) => {
      this.peerId = id;
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('connection', (conn) => { 
      console.log(`Received connection request from peer with id ${conn.peer}.`);

      // For now, if I receive a connection request I am not the host
      this.amHost = false;
      // For now, we default the other person's playerID to be 2
      this.playerID = 2;

      this.conn = conn;
      this.otherPeerId = conn.peer;

      this.conn.on('data', (data) => {
        this.handleData(data);
      });
      this.conn.on('close', () => {
        console.log("Peer-to-Peer Error: Other party disconnected.");
        this.conn = null;
        this.otherPeerId = null;
      });
      this.conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error:");
        console.log(err);
        this.conn = null;
        this.otherPeerId = null;
      });

      this.conn.on('open', () => {
        this.conn.send({
          'action': 'sendState',
          'amHost': this.amHost,
          'playerID': this.playerID
        });
      });
    });
  }

  startConnection(peerID: string) {
    this.otherPeerId = peerID;
    var conn = this.peer.connect(this.otherPeerId);
    this.conn = conn;
    conn.on('open', () => {
      // Receive messages
      conn.on('data', (data) => {
        this.handleData(data);
      });
      conn.on('close', () => {
        console.log("Peer-to-Peer Error: Other party disconnected.");
        this.conn = null;
        this.otherPeerId = null;
      });
      conn.on('error', (err) => {
        console.log("Unspecified Peer-to-Peer Error:");
        console.log(err);
        this.conn = null;
        this.otherPeerId = null;
      });
    });

  }
  
  onDragMove(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (object.type == 'deck' || object.type == 'card') {
      object.x = dragX;
      object.y = dragY;
      object.gameObject.setX(dragX);
      object.gameObject.setY(dragY);
  
      if (playspaceComponent.conn) {
        playspaceComponent.conn.send({
          'action': 'move',
          'type': object.type,
          'id': object.id,
          'x': dragX,
          'y': dragY,
          'amHost': playspaceComponent.amHost,
          'playerID': playspaceComponent.playerID
        });
      }
    }
  }

  filterOutID(objectListToFilter: any[], object: any) {
    return objectListToFilter.filter( (refObject: any) => {
      return object.id !== refObject.id;
    });
  }

  onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    if (object.type == 'card') {
      // Step 1: Find Card

      let card: Card = null;
      let found = false;
      let foundInHand = false;

      playspaceComponent.gameState.myHand.cards.forEach((refCard: Card) => {
        if (object.id === refCard.id) {
          card = refCard;
          found = true;
          foundInHand = true;
        }
      });

      if (!found) {
        playspaceComponent.gameState.cards.forEach((refCard: Card) => {
          if (object.id === refCard.id) {
            card = refCard;
            found = true;
          }
        });
      }

      if (found) {
        let myCenterX = object.gameObject.x + object.gameObject.displayWidth/2;
        let myCenterY = object.gameObject.y + object.gameObject.displayHeight/2;
        let inserted = false;
        let handOverlap = false;
        let hand = playspaceComponent.gameState.myHand;

        // Step 2: Detect overlap with deck or hand

        if (myCenterX > hand.gameObject.x && myCenterX < hand.gameObject.x + hand.gameObject.displayWidth && myCenterY > hand.gameObject.y && myCenterY < hand.gameObject.y + hand.gameObject.displayHeight) {
          handOverlap = true;
          if (!card.inHand) {
            inserted = true;
            card.inHand = true;
            hand.cards.push(card);

            if (playspaceComponent.conn) {
              playspaceComponent.conn.send({
                'action': 'insertIntoHand',
                'type': object.type,
                'cardID': card.id,
                'amHost': playspaceComponent.amHost,
                'playerID': playspaceComponent.playerID
              });
            }
  
            playspaceComponent.gameState.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.cards, card);
          }
        } else {
          playspaceComponent.gameState.decks.forEach((deck: Deck) => {
            if (!inserted && myCenterX > deck.gameObject.x && myCenterX < deck.gameObject.x + deck.gameObject.displayWidth && myCenterY > deck.gameObject.y && myCenterY < deck.gameObject.y + deck.gameObject.displayHeight) {
              // If card overlapping with deck
              
              inserted = true;
              card.inDeck = true;
              card.inHand = false;

              if (playspaceComponent.amHost) {
                // If we're not the host, we don't know what's in the deck
                deck.cards.push(card);
              }

              if (playspaceComponent.conn) {
                playspaceComponent.conn.send({
                  'action': 'insertIntoDeck',
                  'type': object.type,
                  'cardID': object.id,
                  'deckID': deck.id,
                  'imagePath': object.imagePath,
                  'x': object.gameObject.x,
                  'y': object.gameObject.y,
                  'foundInHand': foundInHand,
                  'amHost': playspaceComponent.amHost,
                  'playerID': playspaceComponent.playerID
                });
              }

              card.gameObject.destroy();
              card.gameObject = null;

              // We need to remove the card from where it originated
              if (foundInHand) {
                playspaceComponent.gameState.myHand.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.myHand.cards, card);
              } else {
                playspaceComponent.gameState.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.cards, card);
              }
            }
          });

          // If card removed from hand and not inserted in a deck
          if (!inserted && !handOverlap && card.inHand) {
            card.inHand = false;
            playspaceComponent.gameState.cards.push(card);

            if (playspaceComponent.conn) {
              playspaceComponent.conn.send({
                'action': 'removeFromHand',
                'type': object.type,
                'cardID': object.id,
                'imagePath': object.imagePath,
                'x': object.gameObject.x,
                'y': object.gameObject.y,
                'amHost': playspaceComponent.amHost,
                'playerID': playspaceComponent.playerID
              });
            }

            playspaceComponent.gameState.myHand.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.myHand.cards, card);
          }
        }
      }
    }
  }

  deckRightClick(deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
      let optionWidth = 200;
      let optionHeight = 75;
      let optionObjects = [];
      let optionSeparation = 10;
      optionObjects.push(new OptionObject("retrieveCard", playspaceComponent.retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', optionWidth, optionHeight));
      optionObjects.push(new OptionObject("shuffleDeck", playspaceComponent.shuffleDeck, 'assets/images/buttons/shuffleDeck.png', optionWidth, optionHeight));
      optionObjects.push(new OptionObject("importDeck", playspaceComponent.importDeck, 'assets/images/buttons/importDeck.png', optionWidth, optionHeight));
      let width = 250;
      let height = optionHeight*optionObjects.length + (optionObjects.length - 1)*optionSeparation;

      let handle = "popup" + playspaceComponent.popupCount++;
      
      let popupScene = new PopupScene(handle, pointer.x, pointer.y, playspaceComponent, deck, width, height, optionObjects, optionSeparation);
  
      playspaceComponent.phaserScene.scene.add(handle, popupScene, true);
    }
  }

  retrieveTopCard(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    if (playspaceComponent.amHost) {
      var card = deck.cards.pop();

      if (card) {
        if (card.gameObject == null) {
          card.inDeck = false;

          playspaceComponent.createCard(card, playspaceComponent, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

          if (playspaceComponent.conn) {
            playspaceComponent.conn.send({
              'action': 'sendTopCard',
              'type': 'card',
              'cardID': card.id,
              'imagePath': card.imagePath,
              'deckID': deck.id,
              'x': deck.gameObject.x,
              'y': deck.gameObject.y,
              'amHost': playspaceComponent.amHost,
              'playerID': playspaceComponent.playerID
            });
          }
        }
      }
    } else if (playspaceComponent.conn) {
      playspaceComponent.conn.send({
        'action': 'retrieveTopCard',
        'type': 'card',
        'deckID': deck.id,
        'amHost': playspaceComponent.amHost,
        'playerID': playspaceComponent.playerID
      });
    }

    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  shuffleDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (playspaceComponent.amHost) {
      let shuffled = deck.cards.map((card) => ({randomVal: Math.random(), card: card}))
                               .sort((object1, object2) => object1.randomVal - object2.randomVal)
                               .map((object) => object.card);

      deck.cards = shuffled;

      let shuffledCardIDs = [];

      shuffled.forEach((card: Card) => {
      shuffledCardIDs.push(card.id);
      });

      // TODO: Only host can shuffle, and host is not sending shuffled data to players
      // Can change if necessary

      //if (playspaceComponent.conn) {
      //  playspaceComponent.conn.send({
      //  'action': 'shuffle',
      //  'type': 'deck',
      //  'deckID': deck.id,
      //  'shuffledCardIDs': shuffledCardIDs,
      //  'amHost': playspaceComponent.amHost,
      //  'playerID': playspaceComponent.playerID
      //  });
      //}
    }
  
    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  importDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    let imagePaths: string[] = ["assets/images/playing-cards/king_of_hearts.png", "assets/images/playing-cards/king_of_hearts.png"];

    if (playspaceComponent.amHost) {
      imagePaths.forEach((imagePath: string) => {
        deck.cards.push(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y));
      });
    }

    if (playspaceComponent.conn && !playspaceComponent.amHost) { // If the host imports a deck, the other players don't need that info
      playspaceComponent.conn.send({
        'action': 'importDeck',
        'type': 'deck',
        'imagePaths': imagePaths,
        'deckID': deck.id,
        'amHost': playspaceComponent.amHost,
        'playerID': playspaceComponent.playerID
      });
    }

    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  
  popupClose(popupScene: PopupScene, playspaceComponent: PlayspaceComponent) {
    playspaceComponent.phaserScene.scene.remove(popupScene.key);
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
        const sentGameState: SentGameState = new SentGameState(this.gameState, data['playerID']);

        console.log("Sending state.");
        this.conn.send({
          'action': 'replicateState',
          'state': sentGameState,
          'amHost': this.amHost,
          'playerID': this.playerID
        });
        break;

      case 'replicateState':
        console.log("Received state.");
        const receivedGameState: SentGameState = data['state'];

        this.cleanUpGameState();

        this.gameState = new GameState([], [], [], this.gameState.myHand);

        receivedGameState.cardMins.forEach((cardMin: CardMin) => {
          let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
          this.createCard(card, this, DestinationEnum.TABLE, card.x, card.y);
        });
        receivedGameState.deckMins.forEach((deckMin: DeckMin) => {
          let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
          this.createDeck(deck, this, deck.x, deck.y);
        });
        receivedGameState.handMin.cardMins.forEach((cardMin: CardMin) => {
          let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, true);
          this.createCard(card, this, DestinationEnum.HAND, card.x, card.y);
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
            this.createCard(card, this, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

            deck.cards = this.filterOutID(deck.cards, card);

            this.conn.send({
              'action': 'sendTopCard',
              'type': 'card',
              'cardID': card.id,
              'imagePath': card.imagePath,
              'deckID': deck.id,
              'x': deck.gameObject.x,
              'y': deck.gameObject.y,
              'amHost': this.amHost,
              'playerID': this.playerID
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

            this.createCard(card, this, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);
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
              // If I am the host, add it to the appropriate player's hand in the game state

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
                    this.createCard(card, this, DestinationEnum.TABLE, data['x'], data['y'])
                    break;
                  }
                }
                break;
              }
            }
          } else {
            card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);
            this.createCard(card, this, DestinationEnum.TABLE, data['x'], data['y']);
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
        break;
    }
  }

  createCard(card: Card, playspaceComponent: PlayspaceComponent, destination: string, x: number, y: number) {
    if (playspaceComponent.phaserScene.textures.exists(card.imagePath)) {
      // If the image already exists in the texture manager's cache, we can create the object now

      card.gameObject = playspaceComponent.phaserScene.add.image(x, y, card.imagePath);
      card.gameObject.setInteractive();
      playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
      card.gameObject.on('drag', playspaceComponent.onDragMove.bind(this, card, playspaceComponent));
      card.gameObject.on('dragend', playspaceComponent.onDragEnd.bind(this, card, playspaceComponent));
      card.gameObject.displayWidth = 200;
      card.gameObject.displayHeight = 300;
      if (destination === DestinationEnum.TABLE) {
        playspaceComponent.gameState.cards.push(card);
      } else {
        playspaceComponent.gameState.myHand.cards.push(card);
      }
    } else {
      // Otherwise, we have to dynamically load it
      playspaceComponent.phaserScene.load.image(card.imagePath, card.imagePath);
      playspaceComponent.phaserScene.load.once("complete", playspaceComponent.cardCreationCallback.bind(this, card, playspaceComponent, destination, x, y));
      playspaceComponent.phaserScene.load.start();
    }
  }

  cardCreationCallback(card: Card, playspaceComponent: PlayspaceComponent, destination: string, x: number, y: number) {
    card.gameObject = playspaceComponent.phaserScene.add.image(x, y, card.imagePath);
    card.gameObject.setInteractive();
    playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
    card.gameObject.on('drag', playspaceComponent.onDragMove.bind(this, card, playspaceComponent));
    card.gameObject.on('dragend', playspaceComponent.onDragEnd.bind(this, card, playspaceComponent));
    card.gameObject.displayWidth = 200;
    card.gameObject.displayHeight = 300;
    if (destination === DestinationEnum.TABLE) {
      playspaceComponent.gameState.cards.push(card);
    } else {
      playspaceComponent.gameState.myHand.cards.push(card);
    }
  }

  createDeck(deck: Deck, playspaceComponent: PlayspaceComponent, x: number, y: number) {
    if (playspaceComponent.phaserScene.textures.exists(deck.imagePath)) {
      // If the image already exists in the texture manager's cache, we can create the object now

      deck.gameObject = playspaceComponent.phaserScene.add.image(x, y, deck.imagePath);
      deck.gameObject.setInteractive();
      playspaceComponent.phaserScene.input.setDraggable(deck.gameObject);
      deck.gameObject.on('drag', playspaceComponent.onDragMove.bind(this, deck, playspaceComponent));
      deck.gameObject.on('pointerdown', playspaceComponent.deckRightClick.bind(this, deck, playspaceComponent));
      deck.gameObject.displayWidth = 200;
      deck.gameObject.displayHeight = 300;
      playspaceComponent.gameState.decks.push(deck);
    } else {
      // Otherwise, we have to dynamically load it
      playspaceComponent.phaserScene.load.image(deck.imagePath, deck.imagePath);
      playspaceComponent.phaserScene.load.once("complete", playspaceComponent.deckCreationCallback.bind(this, deck, playspaceComponent, x, y));
      playspaceComponent.phaserScene.load.start();
    }
  }

  deckCreationCallback(deck: Deck, playspaceComponent: PlayspaceComponent, x: number, y: number) {
    deck.gameObject = playspaceComponent.phaserScene.add.image(x, y, deck.imagePath);
    deck.gameObject.setInteractive();
    playspaceComponent.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('drag', playspaceComponent.onDragMove.bind(this, deck, playspaceComponent));
    deck.gameObject.on('pointerdown', playspaceComponent.deckRightClick.bind(this, deck, playspaceComponent));
    deck.gameObject.displayWidth = 200;
    deck.gameObject.displayHeight = 300;
    playspaceComponent.gameState.decks.push(deck);
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
