import { ConfigurationService } from 'src/app/services/configuration.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Component, EventEmitter, OnInit } from '@angular/core';

import Phaser from 'phaser';
import Deck from '../models/deck';
import DeckMin from '../models/deckMin';
import Counter from '../models/counter';
import Configuration from '../models/configuration'
import ConfigScene from '../models/phaser-scenes/configScene';

import { CreateCounterPopupComponent } from '../popups/create-counter-popup/create-counter-popup.component';
import { SaveConfigurationPopupComponent } from '../popups/save-configuration-popup/save-configuration-popup.component';
import { MiddleWare } from '../services/middleware';
import { CounterActionObject, ECounterActions } from '../counter/counter.component';

import * as HF from '../helper-functions';
import * as CoA from '../actions/counterActions';

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
  public playerID: number = 1;

  configuration: Configuration;

  /**
   * An emitter used to output counter actions to the counter component
   */
  public sendCounterActionEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  constructor(
    private configurationService: ConfigurationService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private middleware: MiddleWare
  ) {
    this.initConfig();
  }

  ngOnInit(): void {
    setTimeout(_ => this.initialize(), 100);

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

  ngOnDestroy() {
    this.phaserGame.destroy(true);
  }

  receiveCounterAction(counterActionObject: CounterActionObject) {
    switch (counterActionObject.counterAction) {
      case ECounterActions.addCounter:
        CoA.addCounter(counterActionObject.counter, null, null, this);
        break;
      
      case ECounterActions.removeCounter:
        CoA.removeCounter(counterActionObject.counter, null, null, this);
        break;

      case ECounterActions.changeCounterValue:
        CoA.changeCounterValue(counterActionObject.counter, null, null, this);
        break;
        
      default:
        break;
    }
  }

  // API CALLS

  saveConfig() {
    // if(configurationId){ this.configurationService.updateConfiguration(........)} else {}
    
    let dialogRef = this.dialog.open(SaveConfigurationPopupComponent, {
      height: '500px',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe(saveConfigData => {
      if (saveConfigData) {
        this.configuration.name = saveConfigData.name;
        // remove the _id if it exists, such that mongoDb will assign a new one and we won't collide with an already existing one
        delete this.configuration._id;

        let processedConfiguration = this.processConfigurationForBackend(this.configuration);
        this.configurationService.createConfiguration(processedConfiguration)
          .subscribe((configuration: Configuration) => {
            this.configuration._id = configuration._id;
          });
      }
    });
  }

  updateConfig() {
    let processedConfiguration = this.processConfigurationForBackend(this.configuration);
    this.configurationService.updateConfiguration(processedConfiguration)
      .subscribe((configuration: Configuration) => {});
  }

  deleteConfig(configurationId: string = this?.configuration._id) { //TODO: Should this attempt to grab from the input box first?
    this.configurationService.deleteConfiguration(configurationId)
      .subscribe(() => {
        this.clearConfig();
      });
  }

  getConfig(configurationId: string) {
    // TODO: auto save before get (maybe)
    // saveConfig()

    // Reset the highestID since we are getting a new config
    this.highestID = 1;

    this.configurationService.getConfiguration(configurationId)
      .subscribe((configuration: Configuration) => {
        let newConfiguration = this.processConfigurationFromBackend(configuration);
        this.renderConfiguration(newConfiguration);
        this.configuration = newConfiguration;
        this.sendCounterActionEmitter.emit({ counterAction: ECounterActions.replaceCounters, counters: configuration.counters });
      });

  }

  // HELPER FUNCTIONS

  /**
   * Remove any config that is on the screen and set a fresh empty one.
   */
  clearConfig() {
    if(this.configuration) {
      this.configuration.decks.forEach(deck => deck.gameObject.destroy());
    }
    this.initConfig();
  }

  /**
   * Set a blank config.
   */
  initConfig() {
    this.configuration = new Configuration(this.middleware.getUsername(), "", 1, true, [], []);
  }

  /**
   * Creates a deck.
   */
  initDeck() {
    let deck: Deck = new Deck(this.highestID++, "assets/images/playing-cards-extras/deck.png", [], 400, 250);
    HF.createDeck(deck, this);
  }

  /**
   * Set's the prototypes and parameters that are necessary but not included in the backend 
   * @param configurationObj a configuration as an object, usually as returned from the backend.
   */
  processConfigurationFromBackend(configurationObj: Configuration) : Configuration {

    // TODO: See if I can get this Object.setPrototypeOf thing working.
    // Object.setPrototypeOf(configurationObj, Configuration.prototype)
    Object.assign(configurationObj, Configuration);

    configurationObj.decks.forEach(deckObj => {
      // Object.setPrototypeOf(configurationObj, Configuration.prototype)
      Object.assign(deckObj, Deck);

      //TODO:  Move these to the model, I see no reason why they're here
      deckObj.type = "deck"; //TODO This is probably not needed later 
      deckObj.imagePath = "assets/images/playing-cards-extras/deck.png";
      deckObj.id = this.highestID++;
    });

    // Corrects the date format since the backend auto-formats it
    configurationObj.date = new Date(configurationObj.date);

    return configurationObj;
  }

  /**
   * Strips out additional data, so that we do not transmit unneeded information ot the backend.
   * @param configuration any Configuration type. Usually this.configuration.
   */
  processConfigurationForBackend(configuration: Configuration) : Configuration {
    // Convert Decks to Deck model
    let decks = [];
    configuration.decks?.forEach(deck => decks.push(new DeckMin(deck)));
    let processedConfiguration = Object.assign({}, configuration);
    processedConfiguration.decks = decks;
    
    return processedConfiguration;
  }

  /**
   * Removes on screen elements and renders passed in configuration
   * @param configuration any Configuration type. Usually this.configuration.
   */
  renderConfiguration(configuration: Configuration) {
   this.clearConfig();

    configuration.decks.forEach(deck => {
      HF.createDeck(deck, this);
    });

    // Counters are rendered by the html
  }

  /**
   * Updates the counter object with the actual value on change.
   * @param id of the counter.
   * @param inputObject the input field containing the new information.
   */
  onChangeCounterText(counter) {
    let input : HTMLInputElement = <HTMLInputElement>document.getElementById('counter' + counter.id);
    counter.value = input.value;
  }
}
