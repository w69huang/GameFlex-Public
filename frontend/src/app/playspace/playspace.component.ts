import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import Phaser from 'phaser';
import Card from '../models/card';

declare var Peer: any;

// TODO: How would this work if someone joined a game with a deck? Would be unable to be pre-loaded for the host/original players.
// --> Will probably need to look into dynamic loading.

class MainScene extends Phaser.Scene {
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
    // One solution to making batches of cards is having a smaller cards object (that does not extend Phaser.GameObjects.Image) and using that in this loop to create "CardObjects" (what we'd call the ones that extend phaser's images)

    this.cards.push(new Card(this, 250, 250, "1", 1, 'assets/images/playing-cards/ace_of_spades.png'));
    this.cards.forEach(card => {
        //card.gameObject = this.add.image(250, 250, card.id.toString()); -- we would use this if we were not doing extending the image and using "new"
        card.setInteractive();
        this.input.setDraggable(card);
        this.input.on('drag', this.dragCallback);
        card.displayWidth = 200;
        card.displayHeight = 300;
        this.add.existing(card);
    })
    console.log('create method');
  }

  preload() {
    //this.cards.forEach(card => {
      this.load.image("1", 'assets/images/playing-cards/ace_of_spades.png');
    //});
    console.log('preload method');
  }

  // update() {}
}

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
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [ this.phaserScene ],
      parent: 'gameContainer',
    };
  }

  ngOnInit(): void {

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
        conn.on('data', (data) => {
          this.changeXAndY(data);
        });
      });
    });
  }
  
  onDragMove(pointer: Phaser.Input.Pointer, gameObject: Card, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
    console.log(gameObject);

    // TODO: Figure out if we REALLY need to extend image -- gameObject.texture.key contains the id that we used upon loading the image
    // --> Maybe it's still worthwhile so that we can add extra properties down the line?
    if (this.conn) {
      this.conn.send({
        'id': gameObject.id,
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
    var card: Card = null;
    for (var i = 0; i < this.phaserScene.cards.length; i++) {
      if (this.phaserScene.cards[i].id == data['id']) {
        card = this.phaserScene.cards[i];
      }
    }
    if (card != null) {
      card.setX(data['x']);
      card.setY(data['y']);
    }
  }
}
