import { Component } from '@angular/core';
import Deck from '../deck';
import OptionObject from '../optionObject';

function popupClose(popupScene: PopupScene, deck: Deck, component: any) {

    component.phaserScene.scene.remove(popupScene.key);
    deck.rightClick = false;
}

export default class PopupScene extends Phaser.Scene {
    key: string;
    component: Component;
    deck: Deck;
    x: number;
    y: number;
    width: number;
    height: number;
    optionSeparation: number;
    optionObjects: OptionObject[];

    constructor (handle, x, y, component, deck, width, height, optionObjects: OptionObject[], optionSeparation: number) {
        super(handle);
        if (x+width > component.sceneWidth) {
          x = component.sceneWidth - width;
        }
        if (y+height > component.sceneWidth){
          y = component.sceneHeight - height;
        }
        this.key = handle;
        this.x = x;
        this.y = y;
        this.component = component;
        this.deck = deck;
        this.width = width;
        this.height = height;
        this.optionObjects = optionObjects;
        this.optionSeparation = optionSeparation;
    }
    create () {
        // if (this.x + this.width > this.component.screenwidth)
        this.cameras.main.setViewport(this.x, this.y, this.width, this.height);

        var popup = this.add.image(0, 0, 'grey-background').setOrigin(0);
        popup.displayWidth = this.width;
        popup.displayHeight = this.height;

        var closeButton = this.add.image(225, 0, 'close').setOrigin(0);
        closeButton.setInteractive();
        closeButton.on('pointerdown', popupClose.bind(this, this, this.deck, this.component));
        closeButton.displayWidth = 25;
        closeButton.displayHeight = 25;

        var verticalPosition = 0;
        this.optionObjects.forEach((object: OptionObject) => {
          var button = this.add.image(0, verticalPosition, object.optionKey).setOrigin(0);
          button.setInteractive();
          button.on('pointerdown', object.optionFunction.bind(this, this, this.deck, this.component, object.optionObjectConfig));
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