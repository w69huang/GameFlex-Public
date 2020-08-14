import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Phaser from 'phaser';
import Card from '../models/card';

declare var Peer: any;

// TODO: How would this work if someone joined a game with a deck? Would be unable to be pre-loaded for the host/original players.
// --> Will probably need to look into dynamic loading.

class MainScene extends Phaser.Scene {
  playspaceComponent: PlayspaceComponent;
  cards: Card[] = [];
  dragCallback: Function;

  constructor(dragCallback: Function) {
    super({ key: 'main' });
    this.dragCallback = dragCallback;
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
          this.input.on('drag', this.dragCallback);
          card.gameObject.displayWidth = 200;
          card.gameObject.displayHeight = 300;
        }
    })
    console.log('create method');
  }

  preload() {
    this.cards.forEach(card => {
      this.load.image(card.id.toString(), card.imagePath);
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
    this.phaserScene = new MainScene(this.onDragMove);
    this.phaserScene.playspaceComponent = this;
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

    this.phaserGame = new Phaser.Game(this.config);
    this.peer = new Peer();
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
  
  onDragMove(pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.Image, dragX, dragY) {
    // NOTE: This is a callback where "this" refers to the FUNCTION'S scope as it was called from MainScene
    // This is why we are using ts-ignores
    gameObject.setX(dragX);
    gameObject.setY(dragY);
    
    var myCenterX = gameObject.x + gameObject.displayWidth/2;
    var myCenterY = gameObject.y + gameObject.displayHeight/2;

    // Detect overlap
    // @ts-ignore
    this.scene.cards.forEach((card) => {
      // If we are not comparing with ourselves
      if (gameObject.texture.key != card.id.toString()) {
        var refCardX = card.gameObject.x;
        var refCardY = card.gameObject.y;
        var refCardWidth = card.gameObject.displayWidth;
        var refCardHeight = card.gameObject.displayHeight;

        // If the center point of the card being dragged overlaps with any reference card
        if (myCenterX > refCardX && myCenterX < refCardX + refCardWidth && myCenterY > refCardY && myCenterY < refCardY + refCardHeight) {
          console.log("Overlap!");
        }
      }
    });

    // @ts-ignore
    if (this.scene.playspaceComponent.conn) {
      // @ts-ignore
      this.scene.playspaceComponent.conn.send({
        'id': gameObject.texture.key,
        'x': dragX,
        'y': dragY
      });
    }
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
