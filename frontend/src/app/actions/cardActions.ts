import { PlayspaceComponent } from '../playspace/playspace.component';
import Card from '../models/card';
import OptionObject, { OptionObjectConfig } from '../models/optionObject';
import PopupScene from '../models/phaser-scenes/popupScene';
import { EGameObjectType, EActionTypes } from '../models/gameState';

import * as HelperFunctions from '../helper-functions';

function popupClose(popupScene: PopupScene, card: Card, component: any): void {
    component.phaserScene.scene.remove(popupScene.key);
    card.rightClick = false;
}

export function cardRightClick(card: Card, component: any, pointer: Phaser.Input.Pointer, optionObjectConfig?: OptionObjectConfig): void {
    if (pointer.rightButtonDown() && card.rightClick === false) {

        let optionWidth = 200;
        let optionHeight = 75;
        let optionObjects = [];
        let optionSeparation = 10;
        optionObjects.push(new OptionObject("flipCard", flipCard, 'assets/images/buttons/flipCard.png', optionWidth, optionHeight));
        let width = 250;
        let height = optionHeight*optionObjects.length + (optionObjects.length - 1)*optionSeparation;

        let handle = "popup" + component.popupCount++;
        
        let popupScene = new PopupScene(handle, pointer.x, pointer.y, component, card, width, height, optionObjects, optionSeparation);

        component.phaserScene.scene.add(handle, popupScene, true);
        card.rightClick = true;
    }
}

export function flipCard(popupScene: PopupScene, card: Card, playspaceComponent: PlayspaceComponent, optionObjectConfig: OptionObjectConfig, pointer: Phaser.Input.Pointer): void {
    playspaceComponent.gameState.flipCard(card.id);
    popupClose(popupScene, card, playspaceComponent);
}
