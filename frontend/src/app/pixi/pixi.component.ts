import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text, InteractionData, InteractionEvent } from 'pixi.js';
import SpriteData from 'src/app/models/spriteData';

declare var PIXI: any; // Instead of importing pixi
declare var Peer: any;

@Component({
  selector: 'app-pixi',
  templateUrl: './pixi.component.html',
  styleUrls: ['./pixi.component.scss']
})
export class PixiComponent implements OnInit, AfterViewInit {

  @ViewChild('pixiContainer') pixiContainer: ElementRef; // Allows us to reference and load stuff into the div container

  public pixiApp: Application; // This will be the pixi application
  public aceOfSpades: SpriteData;
  public peer: any;
  public peerId: String;
  public otherPeerId: String;
  public conn: any;

  constructor() { }

  ngOnInit(): void {
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

  ngAfterViewInit() {
    this.pixiApp = new PIXI.Application({ width: 800, height: 600}); // Creates the pixi application
    this.pixiContainer.nativeElement.appendChild(this.pixiApp.view); // Places the pixi application onto the viewable document

    this.createAceOfSpades();
  }

  createAceOfSpades() {
    this.aceOfSpades = PIXI.Sprite.from('assets/images/playing-cards/ace_of_spades.png');

    this.aceOfSpades.id = 1;
    this.aceOfSpades.interactive = true; // Enable it to be interactive, i.e. respond to mouse and touch events
    this.aceOfSpades.buttonMode = true; // Makes cursor a pointer when hovering overtop of it
    this.aceOfSpades.anchor.set(0.5);
    this.aceOfSpades.x = this.pixiApp.screen.width / 2;
    this.aceOfSpades.y = this.pixiApp.screen.height / 2;
    this.aceOfSpades.width = 200;
    this.aceOfSpades.height = 300;

    this.pixiApp.stage.addChild(this.aceOfSpades);

    this.setupEvents(this.aceOfSpades);
  }

  setupEvents(sprite: Sprite) {
      sprite
        // events for drag start
        .on('mousedown', (event) => {
          this.onDragStart(event);
        })
        // events for drag end
        .on('mouseup', (event) => {
          this.onDragEnd(event);
        })
        .on('mouseupoutside', (event) => {
          this.onDragEnd(event);
        })
        // events for drag move
        .on('mousemove',(event) => {
          this.onDragMove(event);
        })
  }

  onDragStart(event: InteractionEvent) {
    // store a reference to the data
    // the reason for this is because of multitouch
    // we want to track the movement of this particular touch
    // @ts-ignore
    this.data = event.data;
    // @ts-ignore
    this.alpha = 0.5;
    // @ts-ignore
    this.dragging = true;
  }
  
  onDragEnd(event: InteractionEvent) {

    // @ts-ignore
    this.alpha = 1;
    // @ts-ignore
    this.dragging = false;
    // set the interaction data to null
    // @ts-ignore
    this.data = null;
    // @ts-ignore
    console.log(event.target.id);
  }
  
  onDragMove(event: InteractionEvent) {
    // @ts-ignore
    if (this.dragging)
    {
        // @ts-ignore
        var newPosition = this.data.getLocalPosition(event.target.parent);
        event.target.position.x = newPosition.x;
        event.target.position.y = newPosition.y;

        if (this.conn) {
          this.conn.send({
            'x': event.target.position.x,
            'y': event.target.position.y
          });
        }
    }
  }

  startConnection(peerID: String) {
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
    this.aceOfSpades.x = parseInt(data['x']);
    this.aceOfSpades.y = parseInt(data['y']);
  }
}