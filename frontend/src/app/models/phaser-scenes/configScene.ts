import { ConfigEditorComponent } from '../../config-editor/config-editor.component';
import Card from '../card';
import Deck from '../deck';
import Counter from '../counter';


import * as HelperFunctions from '../../helper-functions';
import * as DeckActions from '../../actions/deckActions';
import * as SharedActions from '../../actions/sharedActions';

export default class ConfigScene extends Phaser.Scene {
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

    // let cardList: Card[] = [];
    let deckList: Deck[] = [];
    let counterList: Counter[] = [];

    // this.add.dom(400, 0).createFromCache('nameform');

    // if (this.configEditorComponent.gameState.myHand.gameObject == null) {
    //   this.configEditorComponent.gameState.myHand.gameObject = this.add.image(0, this.handBeginY, 'grey-background').setOrigin(0); // SET ORIGIN IS THE KEY TO HAVING IT PLACED IN THE CORRECT POSITION! Why??
    //   this.configEditorComponent.gameState.myHand.gameObject.setInteractive();
    //   this.configEditorComponent.gameState.myHand.gameObject.displayWidth = this.width;
    //   this.configEditorComponent.gameState.myHand.gameObject.displayHeight = this.height - this.handBeginY;
    // }

    // cardList.forEach(card => {
    //   HelperFunctions.createCard(card, this.configEditorComponent, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
    // });

    deckList.forEach(deck => {
      HelperFunctions.createDeck(deck, this.configEditorComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick, deck.x, deck.y);
    });
  }

  preload() {

    // this.load.html('nameform', '../../config-editor/nameForm.html');


    // this.configEditorComponent.configuration.cards.forEach(card => {
    //   this.load.image(card.imagePath, card.imagePath);
    // });
    this.configEditorComponent.configuration.decks.forEach(deck => {
      this.load.image(deck.imagePath, deck.imagePath);
    });
    this.configEditorComponent.configuration.counters.forEach(counter => {
      this.load.image('assets/images/playing-cards/counter.png', 'assets/images/playing-cards/counter.png'); //TODO: refactor so this is in counter OR better (imo) there is a object with all image paths OR EVEN BETTER jsut preload everything we know exists and hide it
    });
    this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
  }
  // update() {}
}
