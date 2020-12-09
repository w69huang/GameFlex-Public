import { PlayspaceComponent } from '../../playspace/playspace.component';
import Card from '../card';
import Deck from '../deck';

import * as HelperFunctions from '../../helper-functions';
import * as DeckActions from '../../actions/deckActions';
import * as SharedActions from '../../actions/sharedActions';

export default class PlayspaceScene extends Phaser.Scene {
    playspaceComponent: PlayspaceComponent;
    width: number;
    height: number;
    handBeginY: number;
    initialCardList: Card[];
    initialDeckList: Deck[];
  
    constructor(playspaceComponent: PlayspaceComponent, width: number, height: number, handBeginY: number) {
      super({ key: 'main' });
      this.playspaceComponent = playspaceComponent;
      this.width = width;
      this.height = height;
      this.handBeginY = handBeginY;
    }
  
    create() {  
      if (this.playspaceComponent.gameState.myHand.gameObject == null) {
        this.playspaceComponent.gameState.myHand.gameObject = this.add.image(0, this.handBeginY, 'grey-background').setOrigin(0); // SET ORIGIN IS THE KEY TO HAVING IT PLACED IN THE CORRECT POSITION! Why??
        this.playspaceComponent.gameState.myHand.gameObject.setInteractive();
        this.playspaceComponent.gameState.myHand.gameObject.displayWidth = this.width;
        this.playspaceComponent.gameState.myHand.gameObject.displayHeight = this.height - this.handBeginY;
      }
  
      this.initialCardList.forEach(card => {
        HelperFunctions.createCard(card, this.playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.EDestination.TABLE);
      });
  
      this.initialDeckList.forEach(deck => {
        HelperFunctions.createDeck(deck, this.playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick);
      });
      
      this.events.once('update', () => {
        this.playspaceComponent.startConnectionProcess();
      });
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
    }
  }
  