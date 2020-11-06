import { PlayspaceComponent } from './playspace/playspace.component';
import Card from './models/card';
import Deck from './models/deck';

export enum DestinationEnum {
    TABLE = "Table",
    HAND = "Hand"
}

export function createCard(card: Card, playspaceComponent: PlayspaceComponent, dragMove: Function, dragEnd: Function, destination: string, x: number, y: number) {
    if (playspaceComponent.phaserScene.textures.exists(card.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        card.gameObject = playspaceComponent.phaserScene.add.image(x, y, card.imagePath);
        card.gameObject.setInteractive();
        playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
        card.gameObject.on('drag', dragMove.bind(this, card, playspaceComponent));
        card.gameObject.on('dragend', dragEnd.bind(this, card, playspaceComponent));
        card.gameObject.displayWidth = 200;
        card.gameObject.displayHeight = 300;
        if (destination === DestinationEnum.TABLE) {
            playspaceComponent.gameState.addCardToTable(card);
        } else {
            playspaceComponent.gameState.addCardToOwnHand(card);
        }
    } else {
        // Otherwise, we have to dynamically load it
        playspaceComponent.phaserScene.load.image(card.imagePath, card.imagePath);
        playspaceComponent.phaserScene.load.once("complete", cardCreationCallback.bind(this, card, playspaceComponent, dragMove, dragEnd, destination, x, y));
        playspaceComponent.phaserScene.load.start();
    }
}

export function cardCreationCallback(card: Card, playspaceComponent: PlayspaceComponent, dragMove: Function, dragEnd: Function, destination: string, x: number, y: number) {
    card.gameObject = playspaceComponent.phaserScene.add.image(x, y, card.imagePath);
    card.gameObject.setInteractive();
    playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
    card.gameObject.on('drag', dragMove.bind(this, card, playspaceComponent));
    card.gameObject.on('dragend', dragEnd.bind(this, card, playspaceComponent));
    card.gameObject.displayWidth = 200;
    card.gameObject.displayHeight = 300;
    if (destination === DestinationEnum.TABLE) {
        playspaceComponent.gameState.addCardToTable(card);
    } else {
        playspaceComponent.gameState.addCardToOwnHand(card);
    }
}

export function createDeck(deck: Deck, playspaceComponent: PlayspaceComponent, dragMove: Function, rightClick: Function, x: number, y: number) {
    if (playspaceComponent.phaserScene.textures.exists(deck.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        deck.gameObject = playspaceComponent.phaserScene.add.image(x, y, deck.imagePath);
        deck.gameObject.setInteractive();
        playspaceComponent.phaserScene.input.setDraggable(deck.gameObject);
        deck.gameObject.on('drag', dragMove.bind(this, deck, playspaceComponent));
        deck.gameObject.on('pointerdown', rightClick.bind(this, deck, playspaceComponent));
        deck.gameObject.displayWidth = 200;
        deck.gameObject.displayHeight = 300;
        playspaceComponent.gameState.addDeckToTable(deck);
    } else {
        // Otherwise, we have to dynamically load it
        playspaceComponent.phaserScene.load.image(deck.imagePath, deck.imagePath);
        playspaceComponent.phaserScene.load.once("complete", deckCreationCallback.bind(this, deck, playspaceComponent, dragMove, rightClick, x, y));
        playspaceComponent.phaserScene.load.start();
    }
}

export function deckCreationCallback(deck: Deck, playspaceComponent: PlayspaceComponent, dragMove: Function, rightClick: Function, x: number, y: number) {
    deck.gameObject = playspaceComponent.phaserScene.add.image(x, y, deck.imagePath);
    deck.gameObject.setInteractive();
    playspaceComponent.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('drag', dragMove.bind(this, deck, playspaceComponent));
    deck.gameObject.on('pointerdown', rightClick.bind(this, deck, playspaceComponent));
    deck.gameObject.displayWidth = 200;
    deck.gameObject.displayHeight = 300;
    playspaceComponent.gameState.addDeckToTable(deck);
}