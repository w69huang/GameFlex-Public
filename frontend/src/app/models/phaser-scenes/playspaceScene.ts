import { PlayspaceComponent } from '../../playspace/playspace.component';
import Card from '../card';
import Deck from '../deck';

import * as HF from '../../helper-functions';
import * as DeckActions from '../../actions/deckActions';
import * as SharedActions from '../../actions/sharedActions';
import * as HA from '../../actions/handActions';

export default class PlayspaceScene extends Phaser.Scene {
    playspaceComponent: PlayspaceComponent;
    initialCardList: Card[];
    initialDeckList: Deck[];
    addHandButton: Phaser.GameObjects.Image;
    delHandButton: Phaser.GameObjects.Image;
    nextHandButton: Phaser.GameObjects.Image;
    prevHandButton: Phaser.GameObjects.Image;
    handTrackerText: Phaser.GameObjects.Text;
  
    constructor(playspaceComponent: PlayspaceComponent) {
      super({ key: 'main' });
      this.playspaceComponent = playspaceComponent;
    }
  
    create() {  
      if (this.playspaceComponent.gameState.myHand.gameObject == null) {
        let hand = this.add.image(0, HF.handBeginY, 'grey-background').setOrigin(0);
        hand.setInteractive();
        hand.setDisplaySize(HF.sceneWidth, HF.sceneHeight - HF.handBeginY);
      }
  
      this.initialCardList.forEach(card => {
        HF.createCard(card, this.playspaceComponent, HF.EDestination.TABLE);
      });
  
      this.initialDeckList.forEach(deck => {
        HF.createDeck(deck, this.playspaceComponent);
      });
      
      this.events.once('update', () => {
        this.playspaceComponent.startConnectionProcess();
      });
      this.handTrackerText = this.add.text(850, 625, '', {color: 'black', fontStyle: 'bold'});
      this.addHandButton = HF.createPhaserImageButton(this, 960, 630, 30, 30, 'add-hand', () => { HA.createHand(this.playspaceComponent) });
      this.delHandButton = HF.createPhaserImageButton(this, 30, 630, 30, 30, 'del-hand', () => { HA.deleteMyHand(this.playspaceComponent) } );
      this.nextHandButton = HF.createPhaserImageButton(this, 960, 820, 30, 30, 'next-hand', () => { HA.nextHand(this.playspaceComponent) });
      this.prevHandButton = HF.createPhaserImageButton(this, 30, 820, 30, 30, 'prev-hand', () => { HA.previousHand(this.playspaceComponent) } );

    }
  
    preload() {
      this.initialCardList = [];

      this.initialDeckList = [new Deck(this.playspaceComponent.highestID++, "assets/images/playing-cards-extras/deck.png", [], 400, 250)];

      this.initialCardList.forEach(card => {
        this.load.image(card.imagePath, card.imagePath);
      });
      this.initialDeckList.forEach(deck => {
        this.load.image(deck.imagePath, deck.imagePath);
      });
      this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
      this.load.image('del-hand', 'assets/images/buttons/x.png');
      this.load.image('add-hand', 'assets/images/buttons/plus.png');
      this.load.image('next-hand', 'assets/images/buttons/right-arrow.png');
      this.load.image('prev-hand', 'assets/images/buttons/left-arrow.png');
      this.load.image('flipped-card', 'assets/images/playing-cards-extras/flipped-card.png');
    }


  }
  