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

      // For now, if I receive a connection request I am not the host
      this.amHost = false;

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
          'y': dragY,
          'amHost': playspaceComponent.amHost
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
                'amHost': playspaceComponent.amHost
              });
            }
  
            playspaceComponent.phaserScene.cards = playspaceComponent.filterOutID(playspaceComponent.phaserScene.cards, card);
          }
        } else {
          playspaceComponent.phaserScene.decks.forEach((deck: Deck) => {
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
                  'cardID': parseInt(object.gameObject.texture.key),
                  'deckID': deck.id,
                  'imagePath': object.imagePath,
                  'x': object.gameObject.x,
                  'y': object.gameObject.y,
                  'amHost': playspaceComponent.amHost
                });
              }

              card.gameObject.destroy();
              card.gameObject = null;

              // We need to remove the card from where it originated
              if (foundInHand) {
                playspaceComponent.phaserScene.hand.cards = playspaceComponent.filterOutID(playspaceComponent.phaserScene.hand.cards, card);
              } else {
                playspaceComponent.phaserScene.cards = playspaceComponent.filterOutID(playspaceComponent.phaserScene.cards, card);
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
                'amHost': playspaceComponent.amHost
              });
            }

            playspaceComponent.phaserScene.hand.cards = playspaceComponent.filterOutID(playspaceComponent.phaserScene.hand.cards, card);
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
              'action': 'sendTopCard',
              'type': 'card',
              'cardID': card.id,
              'imagePath': card.imagePath,
              'deckID': deck.id,
              'x': deck.gameObject.x,
              'y': deck.gameObject.y,
              'amHost': playspaceComponent.amHost
            });
          }
        }
      }
    } else if (playspaceComponent.conn) {
      playspaceComponent.conn.send({
        'action': 'retrieveTopCard',
        'type': 'card',
        'deckID': deck.id,
        'amHost': playspaceComponent.amHost
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
      //  'amHost': playspaceComponent.amHost
      //  });
      //}
    }
  
    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  // TODO: Figure out how we are going to tell the other peers that a card's image has not been loaded.
  // Is it a variable within the card object? Perhaps upon clicking import deck it sends a P2P data object that tells it the image paths to load & their keys (arrays probably)?
  // --> The latter sounds pretty reasonable
  importDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    let card: Card = new Card(10 + Math.round(Math.random()*90), "assets/images/playing-cards/king_of_hearts.png", 100, 150);
    playspaceComponent.phaserScene.load.image(card.id.toString(), card.imagePath);
    playspaceComponent.phaserScene.load.once("complete", playspaceComponent.importCallback.bind(this, card, deck));
    playspaceComponent.phaserScene.load.start();

    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  importCallback(card: Card, deck: Deck) {
    deck.cards.push(card);
  }

  
  popupClose(popupScene: PopupScene, playspaceComponent: PlayspaceComponent) {
    playspaceComponent.phaserScene.scene.remove(popupScene.key);
  }

  handleData(data: String) {
    if (this.amHost && data['amHost']) {
      // Error! Both parties claim to the be the host! Abort!
      console.log("Fatal error: both parties claim to be the host.");
      return;
    }

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

      // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
      case 'insertIntoDeck':
        if (data['type'] === 'card' && this.amHost) {
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

            if (card.gameObject) {
              card.gameObject.destroy();
              card.gameObject = null;
            }

            this.phaserScene.cards = this.filterOutID(this.phaserScene.cards, card);
          }
        } else if (data['type'] === 'card' && !this.amHost) {
          let card: Card = null;

          for (let i = 0; i < this.phaserScene.cards.length; i++) {
            if (this.phaserScene.cards[i].id === data['cardID']) {
              card = this.phaserScene.cards[i];
            }
          }

          if (card) {
            // If I am not the host and someone inserts a card into the deck, completely remove all reference to it

            card.gameObject.destroy();
            this.phaserScene.cards = this.filterOutID(this.phaserScene.cards, card);
          }
        }
        break;

      // The host receives this action, which was sent by a non-host requesting the top card of the deck
      case 'retrieveTopCard':
        if (data['type'] === 'card' && this.amHost) {
          let deck: Deck = null;

          for (let i = 0; i < this.phaserScene.decks.length; i++) {
            if (this.phaserScene.decks[i].id === data['deckID']) {
              deck = this.phaserScene.decks[i];
            }
          }
  
          if (deck && deck.cards.length > 0) {
            let card: Card = deck.cards[deck.cards.length - 1];

            card.gameObject = this.phaserScene.add.image(deck.gameObject.x, deck.gameObject.y, card.id.toString());
            card.gameObject.setInteractive();
            this.phaserScene.input.setDraggable(card.gameObject);
            card.gameObject.on('drag', this.onDragMove.bind(this, card, this));
            card.gameObject.on('dragend', this.onDragEnd.bind(this, card, this));
            card.gameObject.displayWidth = 200;
            card.gameObject.displayHeight = 300;
            this.phaserScene.cards.push(card);

            deck.cards = this.filterOutID(deck.cards, card);

            this.conn.send({
              'action': 'sendTopCard',
              'type': 'card',
              'cardID': card.id,
              'imagePath': card.imagePath,
              'deckID': deck.id,
              'x': deck.gameObject.x,
              'y': deck.gameObject.y,
              'amHost': this.amHost
            });
          }
        }
        break;

      // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
      case 'sendTopCard':
        if (data['type'] === 'card' && !this.amHost) {
          let deck: Deck = null;

          for (let i = 0; i < this.phaserScene.decks.length; i++) {
            if (this.phaserScene.decks[i].id === data['deckID']) {
              deck = this.phaserScene.decks[i];
            }
          }

          if (deck) {
  
            let card: Card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);

            card.inDeck = false;

            if (this.phaserScene.textures.exists(card.id.toString())) {
              // If the image already exists in the texture manager's cache, we can create the object now

              card.gameObject = this.phaserScene.add.image(data['x'], data['y'], data['cardID'].toString());
              card.gameObject.setInteractive();
              this.phaserScene.input.setDraggable(card.gameObject);
              card.gameObject.on('drag', this.onDragMove.bind(this, card, this));
              card.gameObject.on('dragend', this.onDragEnd.bind(this, card, this));
              card.gameObject.displayWidth = 200;
              card.gameObject.displayHeight = 300;
              this.phaserScene.cards.push(card);
            } else {
              // Otherwise, we have to dynamically load it
              this.phaserScene.load.image(card.id.toString(), card.imagePath);
              this.phaserScene.load.once("complete", this.cardCreationCallback.bind(this, card, data));
              this.phaserScene.load.start();
            }
          }
        }
        break;

      // Anyone can receive this action, which is sent by someone who inserts a card into their hand
      case 'insertIntoHand':
        // TODO: The host needs to keep a copy of what cards should be in each person's hand to prevent cheating?

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
            this.phaserScene.cards = this.filterOutID(this.phaserScene.cards, card);
          }
        }

        break;        

      // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a)
      case 'removeFromHand':
        if (data['type'] === 'card') {
          let card: Card = new Card(data['cardID'], data['imagePath'], data['x'], data['y']);
          if (this.phaserScene.textures.exists(card.id.toString())) {
            // If the image already exists in the texture manager's cache, we can create the object now
  
            card.gameObject = this.phaserScene.add.image(data['x'], data['y'], data['cardID'].toString());
            card.gameObject.setInteractive();
            this.phaserScene.input.setDraggable(card.gameObject);
            card.gameObject.on('drag', this.onDragMove.bind(this, card, this));
            card.gameObject.on('dragend', this.onDragEnd.bind(this, card, this));
            card.gameObject.displayWidth = 200;
            card.gameObject.displayHeight = 300;
            this.phaserScene.cards.push(card);
          } else {
            // Otherwise, we have to dynamically load it
            this.phaserScene.load.image(card.id.toString(), card.imagePath);
            this.phaserScene.load.once("complete", this.cardCreationCallback.bind(this, card, data));
            this.phaserScene.load.start();
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

  cardCreationCallback(card: Card, data: any) {
    // TODO: Needs testing, may fail because of 'this' reference

    card.gameObject = this.phaserScene.add.image(data['x'], data['y'], data['cardID'].toString());
    card.gameObject.setInteractive();
    this.phaserScene.input.setDraggable(card.gameObject);
    card.gameObject.on('drag', this.onDragMove.bind(this, card, this));
    card.gameObject.on('dragend', this.onDragEnd.bind(this, card, this));
    card.gameObject.displayWidth = 200;
    card.gameObject.displayHeight = 300;
    this.phaserScene.cards.push(card);
  }
}
