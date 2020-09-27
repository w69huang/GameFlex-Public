import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigurationService } from 'src/app/services/configuration.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

import Configuration from '../models/configuration'
import Deck from '../models/deck';
import DeckMin from '../models/deckMin';
import Hand from '../models/hand';
import HandMin from '../models/handMin';
import GameState from '../models/gameState';
import SentGameState from '../models/sentGameState';


class OptionObject {
  optionKey: string;
  optionFunction: Function;
  optionImage: string;
  optionWidth: number;
  optionHeight: number;

  constructor(optionKey, optionFunction, optionImage, optionWidth, optionHeight) {
    this.optionKey = optionKey;
    this.optionFunction = optionFunction;
    this.optionImage = optionImage;
    this.optionWidth = optionWidth;
    this.optionHeight = optionHeight;
  }
}

class PopupScene extends Phaser.Scene {

  key: string;
  configEditorComponent: ConfigEditorComponent;
  deck: Deck;
  x: number;
  y: number;
  width: number;
  height: number;
  optionSeparation: number;
  optionObjects: OptionObject[];

  constructor(handle, x, y, configEditorComponent, deck, width, height, optionObjects: OptionObject[], optionSeparation: number) {
    super(handle);
    this.key = handle;
    this.x = x;
    this.y = y;
    this.configEditorComponent = configEditorComponent;
    this.deck = deck;
    this.width = width;
    this.height = height;
    this.optionObjects = optionObjects;
    this.optionSeparation = optionSeparation;
  }

  create() {
    this.cameras.main.setViewport(this.x, this.y, this.width, this.height);

    var popup = this.add.image(0, 0, 'grey-background').setOrigin(0);
    popup.displayWidth = this.width;
    popup.displayHeight = this.height;

    var closeButton = this.add.image(225, 0, 'close').setOrigin(0);
    closeButton.setInteractive();
    closeButton.on('pointerdown', this.configEditorComponent.popupClose.bind(this, this, this.configEditorComponent));
    closeButton.displayWidth = 25;
    closeButton.displayHeight = 25;

    var verticalPosition = 0;
    this.optionObjects.forEach((object: OptionObject) => {
      var button = this.add.image(0, verticalPosition, object.optionKey).setOrigin(0);
      button.setInteractive();
      button.on('pointerdown', object.optionFunction.bind(this, this, this.deck, this.configEditorComponent));
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
  configEditorComponent: ConfigEditorComponent;
  width: number;
  height: number;
  handBeginY: number;

  constructor(configEditorComponent: ConfigEditorComponent, width: number, height: number, handBeginY: number) {
    super({ key: 'main' });
    this.configEditorComponent = configEditorComponent;
    this.width = width;
    this.height = height;
    this.handBeginY = handBeginY;
  }

  create() {
    this.input.mouse.disableContextMenu();

    let deckList: Deck[] = [new Deck(this.configEditorComponent.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250)];

    if (this.configEditorComponent.gameState.myHand.gameObject == null) {
      this.configEditorComponent.gameState.myHand.gameObject = this.add.image(0, this.handBeginY, 'grey-background').setOrigin(0); // SET ORIGIN IS THE KEY TO HAVING IT PLACED IN THE CORRECT POSITION! Why??
      this.configEditorComponent.gameState.myHand.gameObject.setInteractive();
      this.configEditorComponent.gameState.myHand.gameObject.displayWidth = this.width;
      this.configEditorComponent.gameState.myHand.gameObject.displayHeight = this.height - this.handBeginY;
    }

    deckList.forEach(deck => {
      this.configEditorComponent.createDeck(deck, this.configEditorComponent, deck.x, deck.y);
    });

  }

  preload() {
    this.configEditorComponent.gameState.decks.forEach(deck => {
      this.load.image(deck.imagePath, deck.imagePath);
    });
    this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
  }

  // update() {}
}

@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.scss']
})
export class ConfigEditorComponent implements OnInit {
  public phaserGame: Phaser.Game;
  public phaserScene: MainScene;

  public config: Phaser.Types.Core.GameConfig;
  public aceOfSpades: Phaser.GameObjects.Image;
  public popupCount: number = 0;
  public sceneWidth: number = 1000;
  public sceneHeight: number = 1000;
  public handBeginY: number = 600;
  public otherPeerId: string;
  public highestID: number = 1;

  // State
  public playerID: number = 1;
  public gameState: GameState;

  configuration: Configuration;
  //configurationId: string;

  constructor(
    private configurationService: ConfigurationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.phaserScene = new MainScene(this, this.sceneWidth, this.sceneHeight, this.handBeginY);
    this.config = {
      type: Phaser.AUTO,
      height: this.sceneHeight,
      width: this.sceneWidth,
      scene: [this.phaserScene],
      parent: 'configEditorContainer',
    };
    this.configuration = new Configuration(1, "BIG TURD", 3, true, [], []);
  }

  ngOnInit(): void {
    this.gameState = new GameState([], [], [], new Hand(this.playerID, []));

    this.phaserGame = new Phaser.Game(this.config);

    // this.route.params.subscribe((params: Params) => this.configurationId = params.configurationId)
    // this.configurationService.getConfiguration(this.configurationId)
    // this.configurationService.getConfiguration()
    //   .subscribe((configuration: Configuration) => this.configuration = configuration)

  }

  saveConfig(configurationId: number) {
    // if(configurationId){ this.configurationService.updateConfiguration(........)} else {}
    this.configurationService.createConfiguration(this.configuration)
      .subscribe()
    //.subscribe(() => this.router.navigate(['../'], { relativeTo: this.route })) // We want it to navigate to configuration/:configurationId:
  }

  addConfig(configurationId: number) {
    this.configurationService.createConfiguration(this.configuration)
      .subscribe(() => this.router.navigate(['../'], { relativeTo: this.route }))
  }

  getConfig(configurationId: number) {
    const config1 = this.configurationService.getConfiguration('5f6d5a615064133767b40710')
      .subscribe((configuration: Configuration) => this.configuration = configuration)
    console.log(config1, this.configuration);
  }


  popupClose(popupScene: PopupScene, configEditorComponent: ConfigEditorComponent) {
    configEditorComponent.phaserScene.scene.remove(popupScene.key);
  }

  initDeck() {
    // Just for the create deck button
    let deck: Deck = new Deck(this.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250);
    this.createDeck(deck, this, deck.x, deck.y);
  }

  createDeck(deck: Deck, configEditorComponent: ConfigEditorComponent, x: number, y: number) {
    if (configEditorComponent.phaserScene.textures.exists(deck.imagePath)) {
      // If the image already exists in the texture manager's cache, we can create the object now

      deck.gameObject = configEditorComponent.phaserScene.add.image(x, y, deck.imagePath);
      deck.gameObject.setInteractive();
      configEditorComponent.phaserScene.input.setDraggable(deck.gameObject);
      deck.gameObject.on('drag', configEditorComponent.onDragMove.bind(this, deck, configEditorComponent));
      deck.gameObject.on('pointerdown', configEditorComponent.deckRightClick.bind(this, deck, configEditorComponent));
      deck.gameObject.displayWidth = 200;
      deck.gameObject.displayHeight = 300;
      configEditorComponent.gameState.decks.push(deck);
    } else {
      // Otherwise, we have to dynamically load it
      configEditorComponent.phaserScene.load.image(deck.imagePath, deck.imagePath);
      configEditorComponent.phaserScene.load.once("complete", configEditorComponent.deckCreationCallback.bind(this, deck, configEditorComponent, x, y));
      configEditorComponent.phaserScene.load.start();
    }
  }

  deckCreationCallback(deck: Deck, configEditorComponent: ConfigEditorComponent, x: number, y: number) {
    deck.gameObject = configEditorComponent.phaserScene.add.image(x, y, deck.imagePath);
    deck.gameObject.setInteractive();
    configEditorComponent.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('drag', configEditorComponent.onDragMove.bind(this, deck, configEditorComponent));
    deck.gameObject.on('pointerdown', configEditorComponent.deckRightClick.bind(this, deck, configEditorComponent));
    deck.gameObject.displayWidth = 200;
    deck.gameObject.displayHeight = 300;
    configEditorComponent.gameState.decks.push(deck);
  }

  onDragMove(object: any, configEditorComponent: ConfigEditorComponent, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (object.type == 'deck' || object.type == 'card') {
      object.x = dragX;
      object.y = dragY;
      object.gameObject.setX(dragX);
      object.gameObject.setY(dragY);

      // if (configEditorComponent.conn) {
      //   configEditorComponent.conn.send({
      //     'action': 'move',
      //     'type': object.type,
      //     'id': object.id,
      //     'x': dragX,
      //     'y': dragY,
      //     'amHost': configEditorComponent.amHost,
      //     'playerID': configEditorComponent.playerID
      //   });
      // }
    }
  }

  deckRightClick(deck: Deck, configEditorComponent: ConfigEditorComponent, pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
      let optionWidth = 200;
      let optionHeight = 75;
      let optionObjects = [];
      let optionSeparation = 10;
      // optionObjects.push(new OptionObject("retrieveCard", configEditorComponent.retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', optionWidth, optionHeight));
      // optionObjects.push(new OptionObject("shuffleDeck", configEditorComponent.shuffleDeck, 'assets/images/buttons/shuffleDeck.png', optionWidth, optionHeight));
      // optionObjects.push(new OptionObject("importDeck", configEditorComponent.importDeck, 'assets/images/buttons/importDeck.png', optionWidth, optionHeight));
      let width = 250;
      let height = optionHeight * optionObjects.length + (optionObjects.length - 1) * optionSeparation;

      let handle = "popup" + configEditorComponent.popupCount++;

      let popupScene = new PopupScene(handle, pointer.x, pointer.y, configEditorComponent, deck, width, height, optionObjects, optionSeparation);

      configEditorComponent.phaserScene.scene.add(handle, popupScene, true);
    }
  }

  // cleanUpGameState() {
  //   this.gameState.cards.forEach((card: Card) => {
  //     card.gameObject.destroy();
  //   });
  //   this.gameState.cards = [];
  //   this.gameState.decks.forEach((deck: Deck) => {
  //     deck.gameObject.destroy();
  //   });
  //   this.gameState.decks = [];
  //   this.gameState.myHand.cards.forEach((card: Card) => {
  //     card.gameObject.destroy();
  //   });
  //   this.gameState.myHand.cards = [];
  // }

}
