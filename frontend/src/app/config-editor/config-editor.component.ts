import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigurationService } from 'src/app/services/configuration.service';
import { Router, ActivatedRoute, Params } from '@angular/router';


import { Component, OnInit } from '@angular/core';
import { DataConnection } from 'peerjs';
import Phaser from 'phaser';
import Card from '../models/card';
import CardMin from '../models/cardMin';
import Deck from '../models/deck';
import DeckMin from '../models/deckMin';
import Counter from '../models/counter';
import Hand from '../models/hand';
import HandMin from '../models/handMin';
import GameState from '../models/gameState';
import Configuration from '../models/configuration'
import SentGameState from '../models/sentGameState';
import ConfigScene from '../models/phaser-scenes/configScene';
import PopupScene from '../models/phaser-scenes/popupScene';
import OptionObject from '../models/optionObject';

import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';
import * as DeckActions from '../actions/deckActions';
import { NewTaskComponent } from '../pages/new-task/new-task.component';


@Component({
  selector: 'app-config-editor',
  templateUrl: './config-editor.component.html',
  styleUrls: ['./config-editor.component.scss']
})
export class ConfigEditorComponent implements OnInit {
  public phaserGame: Phaser.Game;
  public phaserScene: ConfigScene;

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
  configurationId: string;

  constructor(
    private configurationService: ConfigurationService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.phaserScene = new ConfigScene(this, this.sceneWidth, this.sceneHeight, this.handBeginY);
    this.config = {
      type: Phaser.AUTO,
      height: this.sceneHeight,
      width: this.sceneWidth,
      scene: [this.phaserScene],
      parent: 'configEditorContainer',
    };
  }

  ngOnInit(): void {
    setTimeout(_ => this.initialize(), 100);

    // this.route.params.subscribe((params: Params) => this.configurationId = params.configurationId)
    // this.configurationService.getConfiguration(this.configurationId)
    // this.configurationService.getConfiguration()
    //   .subscribe((configuration: Configuration) => this.configuration = configuration)

  }

  initialize() {
    this.gameState = new GameState([], [], [], new Hand(this.playerID, []));

    this.phaserGame = new Phaser.Game(this.config);

  }

  saveConfig() {
    // if(configurationId){ this.configurationService.updateConfiguration(........)} else {}

    // Convert Decks to Deck model
    let decks = [];
    this.gameState.decks?.forEach(deck => decks.push(new DeckMin(deck))) //TODO: This does nothing rn. Is the reason it's not saving because of the backend model not matching up maybe?

    // Convert Counters to Counter model
    // TODO To be implemented 

    this.configuration = new Configuration(1, "_RiskLife_", 3, true, decks, []);
    this.configurationService.createConfiguration(this.configuration)
      .subscribe((configuration: Configuration) => {
        this.configuration = configuration;
        this.configurationId = configuration._id;
      })

  }

  updateConfig() {
    this.configuration.decks = [];
    this.gameState.decks?.forEach(deck => this.configuration.decks.push(deck));
    this.configurationService.updateConfiguration(this.configuration)
      .subscribe((configuration: Configuration) => {
        this.configuration = configuration;
        this.configurationId = configuration._id;
        console.log("Updated to... ", configuration);
      })
  }

  deleteConfig(configurationId: string = this?.configuration._id) {
    this.configurationService.deleteConfiguration(configurationId)
      .subscribe(() => {
        console.log('Deletion has returned.');
        this.configurationId = null;
        this.configuration = new Configuration(0, '', 0, false, [], []);
      })
  }

  getConfig(configurationId: string) {
    // TODO: auto save before get (maybe)
    // saveConfig()

    // delete all current decks and counters
    this.gameState.decks?.forEach(deck => deck.gameObject.destroy());
    this.gameState.decks = [];

    this.gameState.counters?.forEach(deck => deck.gameObject.destroy());
    this.gameState.counters = [];


    this.configurationService.getConfiguration(configurationId)
      .subscribe((configuration: Configuration) => {
        this.configuration = configuration;
        this.configurationId = configuration._id; //TODO Figure out how to do this properly we should be able to just reference if it exists
        this.renderConfiguration(configuration);
        // render all the new decks and counters
        console.log(this.configuration);
      })

  }

  initDeck() {
    // Just for the create deck button
    let deck: Deck = new Deck(this.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250);
    HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, DeckActions.deckRightClick, deck.x, deck.y);
  }

  initCounter() {
    // Just for the create counter button
    this.highestID++;
    let counter: Counter = new Counter(this.highestID, "counter" + this.highestID, 80, 80); //TODO: Take in meaningful names
    HelperFunctions.createCounter(this, counter, SharedActions.onDragMove);
  }

  renderConfiguration(configuration: Configuration) {
    console.log(configuration);
    configuration.decks.forEach(deck => {
      //deck.id = null;
      deck.type = "deck"; //TODO This is probably not needed later
      deck.imagePath = "assets/images/playing-cards/deck.png";
      HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, DeckActions.deckRightClick, deck.x, deck.y)
    });
    // configuration.counters.forEach(counter => {
    //   //deck.id = null;
    //   counter.type = "counter"; //TODO This is probably not needed later OR see other comment about renderableObject
    //   HelperFunctions.createCounter(this, counter, SharedActions.onDragMove)
    // });
  }


}
