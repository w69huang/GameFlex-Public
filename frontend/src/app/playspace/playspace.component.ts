import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Phaser from 'phaser';
import Card from '../models/card';
import Deck from '../models/deck';

declare var Peer: any;

// TODO: How would this work if someone joined a game with a deck? Would be unable to be pre-loaded for the host/original players.
// --> Will probably need to look into dynamic loading.

class MainScene extends Phaser.Scene {
  playspaceComponent: PlayspaceComponent;
  cards: Card[] = [];
  decks: Deck[] = [];

  constructor(playspaceComponent: PlayspaceComponent) {
    super({ key: 'main' });
    this.playspaceComponent = playspaceComponent;
  }

  create() {
    // TODO: Figure out how we are going to create batches of cards, as you can only make new ones in the create method it seems like
    // --> Leads to the question of how to make them during runtime
    // ----> TODO: Investigate whether you can call scene.preload and scene.create whenever new cards are added???? Might be the key!

    //this.cards.push(new CardObject(this, 250, 250, "1", 1, 'assets/images/playing-cards/ace_of_spades.png')); -- only if we are going to be extending Phaser.GameObjects.Image
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

    console.log('preload method');
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
  public peer: any;
  public peerId: string;
  public otherPeerId: string;
  public conn: any;
  
  constructor() { 
    this.phaserScene = new MainScene(this);
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [ this.phaserScene ],
      parent: 'gameContainer',
    };
  }

  ngOnInit(): void {
    this.phaserScene.cards.push(new Card(1, "assets/images/playing-cards/ace_of_spades.png", 250, 250))
    this.phaserScene.cards.push(new Card(2, "assets/images/playing-cards/ace_of_spades.png", 550, 250))
    this.phaserScene.decks.push(new Deck(3, "assets/images/playing-cards/deck.png", null, 400, 250))

    this.phaserGame = new Phaser.Game(this.config);
    this.peer = new Peer(); // You can pass in a specific ID if you want to hardcode the peer ID
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
          this.changeXAndY(data);
        });
      });
    });
  }
  
  onDragMove(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (object.type == 'deck' || object.type == 'card') {
      object.gameObject.setX(dragX);
      object.gameObject.setY(dragY);
  
      if (playspaceComponent.conn) {
        playspaceComponent.conn.send({
          'id': object.gameObject.texture.key,
          'x': dragX,
          'y': dragY
        });
      }
    }
    
  }

  onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    // TODO: Need to send deletion data and such to peer

    if (object.type == 'card') {
      var myCenterX = object.gameObject.x + object.gameObject.displayWidth/2;
      var myCenterY = object.gameObject.y + object.gameObject.displayHeight/2;
      var cardList = [];
      var inserted = false;
  
      // Detect overlap
      playspaceComponent.phaserScene.decks.forEach((deck: Deck) => {
        // If we are not comparing with ourselves
        if (object.gameObject.texture.key != deck.id.toString()) {
          var deckX = deck.gameObject.x;
          var deckY = deck.gameObject.y;
          var deckWidth = deck.gameObject.displayWidth;
          var deckHeight = deck.gameObject.displayHeight;
  
          // If the center point of the card being dragged overlaps with any deck
          if (myCenterX > deckX && myCenterX < deckX + deckWidth && myCenterY > deckY && myCenterY < deckY + deckHeight) {
            playspaceComponent.phaserScene.cards.forEach((card: Card) => {
              // We only have a game object, so let's find the card it corresponds to
              if (object.gameObject.texture.key === card.id.toString() && !inserted) { // !inserted checks for the case where there are multiple overlapping decks
                console.log("Overlap!");
                inserted = true;
                deck.cards.push(card); // Add the card into the deck
                console.log(deck.cards);
                cardList.push(card);
              }
            });
          }
  
        }
      });
  
      cardList.forEach((card: Card) => {
        card.gameObject.destroy();
        card.gameObject = null;
      });

      playspaceComponent.phaserScene.cards = playspaceComponent.phaserScene.cards.filter( (card: Card) => {
        return !cardList.includes(card);
      });
    }
  }

  deckRightClick(deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData) {
    if (pointer.rightButtonDown()) {

      var card = deck.cards.pop();

      if (card) {
        if (card.gameObject == null) {
          card.gameObject = playspaceComponent.phaserScene.add.image(card.x, card.y, card.id.toString());
          card.gameObject.setInteractive();
          playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
          card.gameObject.on('drag', playspaceComponent.onDragMove.bind(this, card, playspaceComponent));
          card.gameObject.on('dragend', playspaceComponent.onDragEnd.bind(this, card, playspaceComponent));
          card.gameObject.displayWidth = 200;
          card.gameObject.displayHeight = 300;
          playspaceComponent.phaserScene.cards.push(card);
        }
      }
    }
  }

  deckImageLoaded() {
    console.log("hype");
  }

  startConnection(peerID: string) {
    this.otherPeerId = peerID;
    var conn = this.peer.connect(this.otherPeerId);
    this.conn = conn;
    conn.on('open', () => {
      // Receive messages
      conn.on('data', (data) => {
        this.changeXAndY(data);
      });
    });
  }

  changeXAndY(data: String) {
    var gameObject: Phaser.GameObjects.Image = null;
    for (var i = 0; i < this.phaserScene.cards.length; i++) {
      if (this.phaserScene.cards[i].gameObject.texture.key == data['id']) {
        gameObject = this.phaserScene.cards[i].gameObject;
      }
    }
    if (gameObject != null) {
      gameObject.setX(data['x']);
      gameObject.setY(data['y']);
    }
  }
}
