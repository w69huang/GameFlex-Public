import Card from './models/card';
import Deck from './models/deck';
import Counter from './models/counter';

export enum DestinationEnum {
    TABLE = "Table",
    HAND = "Hand"
}

export function createCard(card: Card, component: any, dragMove: Function, dragEnd: Function, destination: string, x: number, y: number) {
    if (component.phaserScene.textures.exists(card.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        card.gameObject = component.phaserScene.add.image(x, y, card.imagePath);
        card.gameObject.setInteractive();
        component.phaserScene.input.setDraggable(card.gameObject);
        card.gameObject.on('drag', dragMove.bind(this, card, component));
        card.gameObject.on('dragend', dragEnd.bind(this, card, component));
        card.gameObject.displayWidth = 200;
        card.gameObject.displayHeight = 300;
        if (destination === DestinationEnum.TABLE) {
            component.gameState?.addCardToTable(card);
        } else {
            component.gameState?.addCardToOwnHand(card, component.playerID);
        }
    } else {
        // Otherwise, we have to dynamically load it
        component.phaserScene.load.image(card.imagePath, card.imagePath);
        component.phaserScene.load.once("complete", cardCreationCallback.bind(this, card, component, dragMove, dragEnd, destination, x, y));
        component.phaserScene.load.start();
    }
}

export function cardCreationCallback(card: Card, component: any, dragMove: Function, dragEnd: Function, destination: string, x: number, y: number) {
    card.gameObject = component.phaserScene.add.image(x, y, card.imagePath);
    card.gameObject.setInteractive();
    component.phaserScene.input.setDraggable(card.gameObject);
    card.gameObject.on('drag', dragMove.bind(this, card, component));
    card.gameObject.on('dragend', dragEnd.bind(this, card, component));
    card.gameObject.displayWidth = 200;
    card.gameObject.displayHeight = 300;
    if (destination === DestinationEnum.TABLE) {
        component.gameState?.addCardToTable(card);
    } else {
        component.gameState?.addCardToOwnHand(card, component.playerID);
    }
}

export function createDeck(deck: Deck, component: any, dragMove: Function, dragEnd: Function, rightClick: Function, x: number, y: number) {
    if (component.phaserScene.textures.exists(deck.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        deck.gameObject = component.phaserScene.add.image(x, y, deck.imagePath);
        deck.gameObject.setInteractive();
        component.phaserScene.input.setDraggable(deck.gameObject);
        deck.gameObject.on('drag', dragMove.bind(this, deck, component));
        deck.gameObject.on('dragend', dragEnd.bind(this, deck, component));
        deck.gameObject.on('pointerdown', rightClick.bind(this, deck, component));
        deck.gameObject.displayWidth = 200;
        deck.gameObject.displayHeight = 300;
        if (component.gameState) {
            component.gameState.addDeckToTable(deck);
        } else if (component.configuration) {
            component.configuration.decks.push(deck);
        }
    } else {
        // Otherwise, we have to dynamically load it
        component.phaserScene.load.image(deck.imagePath, deck.imagePath);
        component.phaserScene.load.once("complete", deckCreationCallback.bind(this, deck, component, dragMove, rightClick, x, y));
        component.phaserScene.load.start();
    }
}

export function deckCreationCallback(deck: Deck, component: any, dragMove: Function, rightClick: Function, x: number, y: number) {
    deck.gameObject = component.phaserScene.add.image(x, y, deck.imagePath);
    deck.gameObject.setInteractive();
    component.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('drag', dragMove.bind(this, deck, component));
    deck.gameObject.on('pointerdown', rightClick.bind(this, deck, component));
    deck.gameObject.displayWidth = 200;
    deck.gameObject.displayHeight = 300;
    if (component.gameState) {
        component.gameState.addDeckToTable(deck);
    } else if (component.configuration) {
        component.configuration.decks.push(deck);
    }
}