import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Phaser from 'phaser';
import Card from '../models/card';
import Deck from '../models/deck';
import Hand from '../models/hand';

declare var Peer: any;

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

          verticalPosition += verticalPosition + object.optionHeight + this.optionSeparation;
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

// TODO: How would this work if someone joined a game with a deck? Would be unable to be pre-loaded for the host/original players.
// --> Will probably need to look into dynamic loading.

class MainScene extends Phaser.Scene {
  playspaceComponent: PlayspaceComponent;
  width: number;
  height: number;
  handBeginY: number;
  cards: Card[] = [];
  decks: Deck[] = [];
  hand: Hand;

  constructor(playspaceComponent: PlayspaceComponent, width: number, height: number, handBeginY: number) {
    super({ key: 'main' });
    this.playspaceComponent = playspaceComponent;
    this.width = width;
    this.height = height;
    this.handBeginY = handBeginY;
  }

  create() {
    // TODO: Figure out how we are going to create batches of cards, as you can only make new ones in the create method it seems like
    // --> Leads to the question of how to make them during runtime
    // ----> TODO: Investigate whether you can call scene.preload and scene.create whenever new cards are added???? Might be the key!

    if (this.hand.gameObject == null) {
      this.hand.gameObject = this.add.image(0, this.handBeginY, 'grey-background').setOrigin(0); // SET ORIGIN IS THE KEY TO HAVING IT PLACED IN THE CORRECT POSITION! Why??
      this.hand.gameObject.setInteractive();
      this.hand.gameObject.displayWidth = this.width;
      this.hand.gameObject.displayHeight = this.height - this.handBeginY;
    }

    this.cards.forEach(card => {
        if (card.gameObject == null) {
          card.gameObject = this.add.image(card.x, card.y, card.id.toString());
          card.gameObject.setInteractive();
          this.input.setDraggable(card.gameObject);
          card.gameObject.on('drag', this.playspaceComponent.onDragMove.bind(this, card, this.playspaceComponent));
          card.gameObject.on('dragend', this.playspaceComponent.onDragEnd.bind(this, card, this.playspaceComponent));
          card.gameObject.displayWidth = 200;
          card.gameObject.displayHeight = 300;
        }
    });

    this.decks.forEach(deck => {
      if (deck.gameObject == null) {
        deck.gameObject = this.add.image(deck.x, deck.y, deck.id.toString());
        deck.gameObject.setInteractive();
        this.input.mouse.disableContextMenu();
        this.input.setDraggable(deck.gameObject);
        deck.gameObject.on('drag', this.playspaceComponent.onDragMove.bind(this, deck, this.playspaceComponent));
        // Binding allows you to add extra parameters in the callback!
        deck.gameObject.on('pointerdown', this.playspaceComponent.deckRightClick.bind(this, deck, this.playspaceComponent));
        deck.gameObject.displayWidth = 200;
        deck.gameObject.displayHeight = 300;
      }
    });

  }

  preload() {
    this.cards.forEach(card => {
      this.load.image(card.id.toString(), card.imagePath);
    });
    this.decks.forEach(deck => {
      this.load.image(deck.id.toString(), deck.imagePath);
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
  phaserGame: Phaser.Game;
  phaserScene: MainScene;
  config: Phaser.Types.Core.GameConfig;
  aceOfSpades: Phaser.GameObjects.Image;
  popupCount: number = 0;
  sceneWidth: number = 1000;
  sceneHeight: number = 1000;
  handBeginY: number = 600;
  public peer: any;
  public peerId: string;
  public otherPeerId: string;
  public conn: any;
  
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
    this.phaserScene.cards.push(new Card(1, "assets/images/playing-cards/ace_of_spades.png", 250, 250))
    this.phaserScene.cards.push(new Card(2, "assets/images/playing-cards/ace_of_clubs.png", 550, 250))
    this.phaserScene.cards.push(new Card(3, "assets/images/playing-cards/ace_of_hearts.png", 250, 350))
    this.phaserScene.cards.push(new Card(4, "assets/images/playing-cards/ace_of_diamonds.png", 550, 350))
    this.phaserScene.decks.push(new Deck(5, "assets/images/playing-cards/deck.png", null, 400, 250))
    this.phaserScene.hand = new Hand(6, null);

    this.phaserGame = new Phaser.Game(this.config);

    // NOTE: Launch a local peer server:
    // 1. npm install -g peer
    // 2. peerjs --port 9000 --key peerjs --path /peerserver
    this.peer = new Peer({ // You can pass in a specific ID as the first argument if you want to hardcode the peer ID
      host: 'localhost',
      port: 9000,
      path: '/peerserver' // Make sure this path matches the path you used to launch it
    }); 
    this.peer.on('open', (id) => {
      this.peerId = id;
      console.log('My peer ID is: ' + id);
    });

    this.peer.on('connection', (conn) => { 
      console.log(`Received connection request from peer with id ${conn.peer}.`);
      this.conn = conn;
      this.otherPeerId = conn.peer;
      this.conn.on('open', () => {
        // Receive messages
        this.conn.on('data', (data) => {
          this.handleData(data);
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
    });
  }
  
  onDragMove(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (object.type == 'deck' || object.type == 'card') {
      object.gameObject.setX(dragX);
      object.gameObject.setY(dragY);
  
      if (playspaceComponent.conn) {
        playspaceComponent.conn.send({
          'action': 'move',
          'type': object.type,
          'id': parseInt(object.gameObject.texture.key),
          'x': dragX,
          'y': dragY
        });
      }
    }
  }

  onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    if (object.type == 'card') {
      // Step 1: Find Card

      let card: Card = null;
      let found = false;
      let foundInHand = false;

      playspaceComponent.phaserScene.hand.cards.forEach((refCard: Card) => {
        if (object.gameObject.texture.key === refCard.id.toString()) {
          card = refCard;
          found = true;
          foundInHand = true;
        }
      });

      if (!found) {
        playspaceComponent.phaserScene.cards.forEach((refCard: Card) => {
          if (object.gameObject.texture.key === refCard.id.toString()) {
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
        let cardListToFilter = null;
        let hand = playspaceComponent.phaserScene.hand;

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
                'cardID': parseInt(object.gameObject.texture.key),
              });
            }
  
            cardListToFilter = playspaceComponent.phaserScene.cards;
          }
        } else {
          playspaceComponent.phaserScene.decks.forEach((deck: Deck) => {
            if (!inserted && myCenterX > deck.gameObject.x && myCenterX < deck.gameObject.x + deck.gameObject.displayWidth && myCenterY > deck.gameObject.y && myCenterY < deck.gameObject.y + deck.gameObject.displayHeight) {
              inserted = true;
              card.inDeck = true;
              card.inHand = false;
              deck.cards.push(card);

              if (playspaceComponent.conn) {
                playspaceComponent.conn.send({
                  'action': 'insertIntoDeck',
                  'type': object.type,
                  'cardID': parseInt(object.gameObject.texture.key),
                  'deckID': deck.id,
                  'imagePath': object.imagePath,
                  'x': object.gameObject.x,
                  'y': object.gameObject.y,
                });
              }

              card.gameObject.destroy();
              card.gameObject = null;

              if (foundInHand) {
                cardListToFilter = playspaceComponent.phaserScene.hand.cards;
              } else {
                cardListToFilter = playspaceComponent.phaserScene.cards;
              }
            }
          });

          // If card removed from hand and not inserted in a deck
          if (!inserted && !handOverlap && card.inHand) {
            card.inHand = false;
            playspaceComponent.phaserScene.cards.push(card);

            if (playspaceComponent.conn) {
              playspaceComponent.conn.send({
                'action': 'removeFromHand',
                'type': object.type,
                'cardID': parseInt(object.gameObject.texture.key),
                'handID': hand.id,
                'imagePath': object.imagePath,
                'x': object.gameObject.x,
                'y': object.gameObject.y,
              });
            }

            cardListToFilter = playspaceComponent.phaserScene.hand.cards;
          }
        }

        if (cardListToFilter) {
          cardListToFilter = cardListToFilter.filter( (refCard: Card) => {
            return card.id !== refCard.id;
          });
        }
      }
    }
  }

  deckRightClick(deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
      var width = 250;
      var height = 160;
      var optionObjects = [];
      optionObjects.push(new OptionObject("retrieveCard", playspaceComponent.retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', 200, 75));
      optionObjects.push(new OptionObject("shuffleDeck", playspaceComponent.shuffleDeck, 'assets/images/buttons/shuffleDeck.png', 200, 75));
  
      var handle = "popup" + playspaceComponent.popupCount++;
      
      var popupScene = new PopupScene(handle, pointer.x, pointer.y, playspaceComponent, deck, width, height, optionObjects, 10);
  
      playspaceComponent.phaserScene.scene.add(handle, popupScene, true);
    }
  }

  retrieveTopCard(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    var card = deck.cards.pop();

    if (card) {
      if (card.gameObject == null) {
        card.inDeck = false;
        card.gameObject = playspaceComponent.phaserScene.add.image(deck.gameObject.x, deck.gameObject.y, card.id.toString());
        card.gameObject.setInteractive();
        playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
        card.gameObject.on('drag', playspaceComponent.onDragMove.bind(this, card, playspaceComponent));
        card.gameObject.on('dragend', playspaceComponent.onDragEnd.bind(this, card, playspaceComponent));
        card.gameObject.displayWidth = 200;
        card.gameObject.displayHeight = 300;
        playspaceComponent.phaserScene.cards.push(card);

        if (playspaceComponent.conn) {
          playspaceComponent.conn.send({
            'action': 'removeFromDeck',
            'type': 'deck',
            'cardID': card.id,
            'deckID': deck.id,
            'x': deck.gameObject.x,
            'y': deck.gameObject.y
          });
        }
      }
    }

    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  shuffleDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    let shuffled = deck.cards.map((card) => ({randomVal: Math.random(), card: card}))
                             .sort((object1, object2) => object1.randomVal - object2.randomVal)
                             .map((object) => object.card);

    deck.cards = shuffled;

    let shuffledCardIDs = [];

    shuffled.forEach((card: Card) => {
      shuffledCardIDs.push(card.id);
    });

    if (playspaceComponent.conn) {
      playspaceComponent.conn.send({
        'action': 'shuffle',
        'type': 'deck',
        'deckID': deck.id,
        'shuffledCardIDs': shuffledCardIDs
      });
    }

    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  
  popupClose(popupScene: PopupScene, playspaceComponent: PlayspaceComponent) {
    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  handleData(data: String) {
    switch(data['action']) {
      case 'move':
        if (data['type'] === 'card') {
          let gameObject: Phaser.GameObjects.Image = null;
          for (let i = 0; i < this.phaserScene.cards.length; i++) {
            if (this.phaserScene.cards[i].gameObject && parseInt(this.phaserScene.cards[i].gameObject.texture.key) == data['id']) {
              gameObject = this.phaserScene.cards[i].gameObject;
            }
          }
          if (gameObject != null) {
            gameObject.setX(data['x']);
            gameObject.setY(data['y']);
          }
        } else if (data['type'] === 'deck') {
          let gameObject: Phaser.GameObjects.Image = null;
          for (let i = 0; i < this.phaserScene.decks.length; i++) {
            if (this.phaserScene.decks[i].gameObject && parseInt(this.phaserScene.decks[i].gameObject.texture.key) == data['id']) {
              gameObject = this.phaserScene.decks[i].gameObject;
            }
          }
          if (gameObject != null) {
            gameObject.setX(data['x']);
            gameObject.setY(data['y']);
          }
        }
        break;

      case 'insertIntoDeck':
        if (data['type'] === 'card') {
          let card: Card = null;
          let deck: Deck = null;

          for (let i = 0; i < this.phaserScene.cards.length; i++) {
            if (this.phaserScene.cards[i].id === data['cardID']) {
              card = this.phaserScene.cards[i];
            }
          }

          if (!card) {
            // If we could not find the card, it was in someone's hand -- create it
            card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);
            this.phaserScene.cards.push(card);
          }

          for (let i = 0; i < this.phaserScene.decks.length; i++) {
            if (this.phaserScene.decks[i].id === data['deckID']) {
              deck = this.phaserScene.decks[i];
            }
          }

          if (card && deck) {
            deck.cards.push(card);
            card.gameObject.destroy();
            card.gameObject = null;

            this.phaserScene.cards = this.phaserScene.cards.filter( (refCard: Card) => {
              return refCard.id != card.id;
            });
          }
        }
        break;

      case 'insertIntoHand':
        // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
        if (data['type'] === 'card') {
          let card: Card = null;

          for (let i = 0; i < this.phaserScene.cards.length; i++) {
            if (this.phaserScene.cards[i].id === data['cardID']) {
              card = this.phaserScene.cards[i];
            }
          }

          if (card) {
            // Delete the card
            card.gameObject.destroy();
            card.gameObject = null;
            this.phaserScene.cards = this.phaserScene.cards.filter( (refCard: Card) => {
              return refCard.id != card.id;
            });
          }
        }

        break;

      case 'removeFromDeck':
        if (data['type'] === 'deck') {
          let card: Card = null;
          let deck: Deck = null;

          for (let i = 0; i < this.phaserScene.decks.length; i++) {
            if (this.phaserScene.decks[i].id === data['deckID']) {
              deck = this.phaserScene.decks[i];
            }
          }

          if (deck) {
            for (let i = 0; i < deck.cards.length; i++) {
              if (deck.cards[i].id === data['cardID']) {
                card = deck.cards[i];
              }
            }
  
            if (card) {
              card.inDeck = false;
              card.gameObject = this.phaserScene.add.image(data['x'], data['y'], data['cardID'].toString());
              card.gameObject.setInteractive();
              this.phaserScene.input.setDraggable(card.gameObject);
              card.gameObject.on('drag', this.onDragMove.bind(this, card, this));
              card.gameObject.on('dragend', this.onDragEnd.bind(this, card, this));
              card.gameObject.displayWidth = 200;
              card.gameObject.displayHeight = 300;
              this.phaserScene.cards.push(card);
  
              deck.cards = deck.cards.filter( (refCard: Card) => {
                return refCard.id != card.id;
              });
            }
          }
        }
        break;

      case 'removeFromHand':
        let card: Card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);
        card.gameObject = this.phaserScene.add.image(data['x'], data['y'], data['cardID'].toString());
        card.gameObject.setInteractive();
        this.phaserScene.input.setDraggable(card.gameObject);
        card.gameObject.on('drag', this.onDragMove.bind(this, card, this));
        card.gameObject.on('dragend', this.onDragEnd.bind(this, card, this));
        card.gameObject.displayWidth = 200;
        card.gameObject.displayHeight = 300;
        this.phaserScene.cards.push(card);

        break;

      case 'shuffle':
        if (data['type'] === 'deck') {
          let deck: Deck = null;

          for (let i = 0; i < this.phaserScene.decks.length; i++) {
            if (this.phaserScene.decks[i].id === data['deckID']) {
              deck = this.phaserScene.decks[i];
            }
          }

          if (deck) {
            let shuffled = [];
            data['shuffledCardIDs'].forEach((id) => {
              for (let i = 0; i < deck.cards.length; i++) {
                if (id === deck.cards[i].id) {
                  shuffled.push(deck.cards[i]);
                  break;
                }
              }
            });

            deck.cards = shuffled;
          }
        }
        break;

      default:
        break;
    }
  }
}
