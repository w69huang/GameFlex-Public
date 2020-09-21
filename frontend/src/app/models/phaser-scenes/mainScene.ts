import { PlayspaceComponent } from '../../playspace/playspace.component';
import Card from '../card';
import Deck from '../deck';

import * as HelperFunctions from '../../helper-functions';

export default class MainScene extends Phaser.Scene {
    playspaceComponent: PlayspaceComponent;
    width: number;
    height: number;
    handBeginY: number;
  
    constructor(playspaceComponent: PlayspaceComponent, width: number, height: number, handBeginY: number) {
      super({ key: 'main' });
      this.playspaceComponent = playspaceComponent;
      this.width = width;
      this.height = height;
      this.handBeginY = handBeginY;
    }
  
    create() {
      this.input.mouse.disableContextMenu();
  
      let cardList: Card[] = [new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_spades.png", 250, 250),
                              new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_clubs.png", 550, 250),
                              new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_hearts.png", 250, 350),
                              new Card(this.playspaceComponent.highestID++, "assets/images/playing-cards/ace_of_diamonds.png", 550, 350)];
      let deckList: Deck[] = [new Deck(this.playspaceComponent.highestID++, "assets/images/playing-cards/deck.png", [], 400, 250)];
  
  
      if (this.playspaceComponent.gameState.myHand.gameObject == null) {
        this.playspaceComponent.gameState.myHand.gameObject = this.add.image(0, this.handBeginY, 'grey-background').setOrigin(0); // SET ORIGIN IS THE KEY TO HAVING IT PLACED IN THE CORRECT POSITION! Why??
        this.playspaceComponent.gameState.myHand.gameObject.setInteractive();
        this.playspaceComponent.gameState.myHand.gameObject.displayWidth = this.width;
        this.playspaceComponent.gameState.myHand.gameObject.displayHeight = this.height - this.handBeginY;
      }
  
      cardList.forEach(card => {
        HelperFunctions.createCard(card, this.playspaceComponent, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
      });
  
      deckList.forEach(deck => {
        HelperFunctions.createDeck(deck, this.playspaceComponent, deck.x, deck.y);
      });
  
    }
  
    preload() {
      this.playspaceComponent.gameState.cards.forEach(card => {
        this.load.image(card.imagePath, card.imagePath);
      });
      this.playspaceComponent.gameState.decks.forEach(deck => {
        this.load.image(deck.imagePath, deck.imagePath);
      });
      this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
    }
  
    // update() {}
  }
  