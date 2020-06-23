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
  public otherPeerId: String;
  public conn: any;

  constructor() { }

  ngOnInit(): void {
    this.peer = new Peer();
    this.peer.on('open', function(id) {
      console.log('My peer ID is: ' + id);
    });
    this.peer.on('connection', function(conn) { 
      console.log(`Received connection request from peer with id ${conn.peer}.`);
      this.conn = conn;
      this.otherPeer = conn.peer;
      this.conn.on('open', function() {
        // Receive messages
        conn.on('data', function(data) {
          console.log('Received', data);
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
        .on('mousedown', this.onDragStart)
        // events for drag end
        .on('mouseup', this.onDragEnd)
        .on('mouseupoutside', this.onDragEnd)
        // events for drag move
        .on('mousemove', this.onDragMove)
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
    }
  }

  startConnection(peerID: String) {
    this.otherPeerId = peerID;
    var conn = this.peer.connect(this.otherPeerId);
    this.conn = conn;
    conn.on('open', function() {
      // Receive messages
      conn.on('data', function(data) {
        console.log('Received', data);
      });
    });
  }

  sendData(data: String) {
    console.log(`Data being sent to peer with ID ${this.otherPeerId}.`)
    this.conn.send(data);
  }
}