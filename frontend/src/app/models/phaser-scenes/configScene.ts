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
    // Nothing right now
  }

  preload() {
    this.configEditorComponent.configuration.decks.forEach(deck => {
      this.load.image(deck.imagePath, deck.imagePath);
    });
    this.configEditorComponent.configuration.counters.forEach(counter => {
      this.load.image('assets/images/playing-cards/counter.png', 'assets/images/playing-cards/counter.png'); //TODO: refactor so this is in counter OR better (imo) there is a object with all image paths OR EVEN BETTER jsut preload everything we know exists and hide it
    });
    this.load.image('grey-background', 'assets/images/backgrounds/grey.png');
  }

}
