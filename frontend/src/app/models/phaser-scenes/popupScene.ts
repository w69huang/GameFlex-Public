import { PlayspaceComponent } from '../../playspace/playspace.component';
import Deck from '../deck';
import OptionObject from '../optionObject';

function popupClose(popupScene: PopupScene, playspaceComponent: PlayspaceComponent) {
    playspaceComponent.phaserScene.scene.remove(popupScene.key);
}

export default class PopupScene extends Phaser.Scene {
    key: string;
    playspaceComponent: PlayspaceComponent;
    deck: Deck;
    x: number;
    y: number;
    width: number;
    height: number;
    optionSeparation: number;
    optionObjects: OptionObject[];

    constructor (handle, x, y, playspaceComponent, deck, width, height, optionObjects: OptionObject[], optionSeparation: number) {
        super(handle);
        this.key = handle;
        this.x = x;
        this.y = y;
        this.playspaceComponent = playspaceComponent;
        this.deck = deck;
        this.width = width;
        this.height = height;
        this.optionObjects = optionObjects;
        this.optionSeparation = optionSeparation;
    }
    create () {
        this.cameras.main.setViewport(this.x, this.y, this.width, this.height);

        var popup = this.add.image(0, 0, 'grey-background').setOrigin(0);
        popup.displayWidth = this.width;
        popup.displayHeight = this.height;

        var closeButton = this.add.image(225, 0, 'close').setOrigin(0);
        closeButton.setInteractive();
        closeButton.on('pointerdown', popupClose.bind(this, this, this.playspaceComponent));
        closeButton.displayWidth = 25;
        closeButton.displayHeight = 25;

        var verticalPosition = 0;
        this.optionObjects.forEach((object: OptionObject) => {
          var button = this.add.image(0, verticalPosition, object.optionKey).setOrigin(0);
          button.setInteractive();
          button.on('pointerdown', object.optionFunction.bind(this, this, this.deck, this.playspaceComponent));
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