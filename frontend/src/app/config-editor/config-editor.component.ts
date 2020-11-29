import { HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ConfigurationService } from 'src/app/services/configuration.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
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
import { CreateCounterPopupComponent } from '../popups/create-counter-popup/create-counter-popup.component';
import { SaveConfigurationPopupComponent } from '../popups/save-configuration-popup/save-configuration-popup.component';
import { MiddleWare } from '../services/middleware';


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
  // public gameState: GameState;

  configuration: Configuration;

  constructor(
    private configurationService: ConfigurationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private middleware: MiddleWare
  ) {
    this.configuration = new Configuration(this.middleware.getUsername(), "", 1, true, [], []);
  }

  ngOnInit(): void {
    setTimeout(_ => this.initialize(), 100);

    // this.route.params.subscribe((params: Params) => this.configurationId = params.configurationId)
    // this.configurationService.getConfiguration(this.configurationId)
    // this.configurationService.getConfiguration()
    //   .subscribe((configuration: Configuration) => this.configuration = configuration)

  }

  initialize() {
    this.phaserScene = new ConfigScene(this, this.sceneWidth, this.sceneHeight, this.handBeginY);

    this.config = {
      type: Phaser.AUTO,
      height: this.sceneHeight,
      width: this.sceneWidth,
      scene: [this.phaserScene],
      parent: 'configEditorContainer',
    };
    this.phaserGame = new Phaser.Game(this.config);

  }

  saveConfig() {
    // if(configurationId){ this.configurationService.updateConfiguration(........)} else {}
    
    let dialogRef = this.dialog.open(SaveConfigurationPopupComponent, {
      height: '500px',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(saveConfigData => {
      if (saveConfigData) {
        this.configuration.name = saveConfigData.name;
        
        // Convert Decks to Deck model
        let decks = [];
        this.configuration.decks?.forEach(deck => decks.push(new DeckMin(deck))) //TODO: This does nothing rn. Is the reason it's not saving because of the backend model not matching up maybe?
        this.configuration.decks = decks;
        console.log('Saving: ');
        console.log(this.configuration);
        // Convert Counters to Counter model
        // TODO To be implemented 

        this.configurationService.createConfiguration(this.configuration)
          .subscribe((configuration: Configuration) => {
            this.configuration._id = configuration._id;

          });

      }
    });

  }
/**
 * Get:
 * - Figure out backend bug with SavedConfigurations still existing, why can't we get it?
 * - Actually Render each thing 
 * - Assign the proper objects so they get all the parameters
 * Save/Update:
 * - Strip out the _id and add it too ****DONE****
 * - Add _id to the model ***DONE***
 */

  updateConfig() {
    this.configuration.decks = [];
    // this.gameState.decks?.forEach(deck => this.configuration.decks.push(deck));
    this.configurationService.updateConfiguration(this.configuration)
      .subscribe((configuration: Configuration) => {
        console.log("Updated to... ", configuration);
      })
  }

  deleteConfig(configurationId: string = this?.configuration._id) {
    this.configurationService.deleteConfiguration(configurationId)
      .subscribe(() => {
        console.log('Deletion has returned.');
        this.configuration = new Configuration(this.middleware.getUsername(), '', 0, false, [], []);
      })
  }

  getConfig(configurationId: string) {
    // TODO: auto save before get (maybe)
    // saveConfig()

    this.configurationService.getConfiguration(configurationId)
      .subscribe((configuration: Configuration) => {
        let newConfiguration = this.processConfigurationFromBackend(configuration);
        this.renderConfiguration(newConfiguration);
        this.configuration = newConfiguration;
      })

  }

  initDeck() {
    // Just for the create deck button
    let deck: Deck = new Deck(this.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250);
    HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick, deck.x, deck.y);
  }

  initCounter() {

    let dialogRef = this.dialog.open(CreateCounterPopupComponent, {
      height: '500px',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(createCounterData => {
      if (createCounterData) {
        console.log(createCounterData);

        // Just for the create counter button
        // this.highestID++;
        // let counter: Counter = new Counter(this.highestID, "counter" + this.highestID, 80, 80); //TODO: Take in meaningful names
        // HelperFunctions.createCounter(this, counter, SharedActions.onDragMove);
      }
    });

  }

  /**
   * Set's the prototypes and parameters that are necessary but not included in the backend 
   * @param configurationObj a configuration as an object, usually as returned from the backend.
   */
  processConfigurationFromBackend(configurationObj: Configuration) {
    // Object.setPrototypeOf(configurationObj, Configuration.prototype)
    Object.assign(configurationObj, Configuration);

    configurationObj.decks.forEach(deckObj => {
      // Object.setPrototypeOf(configurationObj, Configuration.prototype)
      Object.assign(deckObj, Deck);

      //TODO:  Move these to the model, I see no reason why they're here
      deckObj.type = "deck"; //TODO This is probably not needed later 
      deckObj.imagePath = "assets/images/playing-cards/deck.png";
    });

    configurationObj.counters.forEach(counterObj => {
      // Object.setPrototypeOf(configurationObj, Configuration.prototype)
      Object.assign(counterObj, Counter);
    });

    // Correct the date format since the backend auto-formats it
    configurationObj.date = new Date(configurationObj.date);

    //TODO: Delete this line
    console.log(configurationObj);

    return configurationObj
  }
  
  /**
   * Removes on screen elements and renders passed in configuration
   * @param configuration 
   */
  renderConfiguration(configuration: Configuration) {
    // if(this.configuration) {
    //   this.phaserScene. // TODO: Remove the shit that's there already if needed
    // }

    configuration.decks.forEach(deck => {
      HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick, deck.x, deck.y)
    });
    // configuration.counters.forEach(counter => {
    //   //deck.id = null;
    //   counter.type = "counter"; //TODO This is probably not needed later OR see other comment about renderableObject
    //   HelperFunctions.createCounter(this, counter, SharedActions.onDragMove)
    // });
  }

  counterText(id: number, inputObject: any) {
    //var inputText = this.getChildByName('nameField');

    //  Have they entered anything?
    if (inputObject.value !== '') {
      // //  Turn off the click events
      // this.removeListener('click');

      // //  Hide the login element
      // this.setVisible(false);
      console.log('inputText == ', inputObject.value);
    }
  }
}
