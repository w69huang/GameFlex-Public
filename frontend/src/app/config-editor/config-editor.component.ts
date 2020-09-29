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
  //configurationId: string;

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

  initDeck() {
    // Just for the create deck button
    let deck: Deck = new Deck(this.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250);
    HelperFunctions.createDeck(deck, this, SharedActions.onDragMove, DeckActions.deckRightClick, deck.x, deck.y);
  }


}
