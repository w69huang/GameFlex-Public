import Card from './models/card';
import Deck from './models/deck';
import Counter from './models/counter';
import * as SA from './actions/sharedActions';
import * as DA from './actions/deckActions';
import { PlayspaceComponent } from './playspace/playspace.component';
import { ConfigEditorComponent } from './config-editor/config-editor.component';
import { DeckEditorComponent } from './deck-editor/deck-editor.component';
import { Config } from 'protractor';
import { platform } from 'os';

/**
 * An enum representing the possible destinations for a card after being moved/retrieved from a deck/etc
 */
export enum EDestination {
    TABLE = "Table",
    HAND = "Hand"
}

export function createCard(card: Card, playspaceComponent: PlayspaceComponent, destination: string, depth?: number, base64?: boolean): void {
    // Need to ensure the card is added to table/hand, and not delayed by the cardCreationCallback
    if (destination === EDestination.TABLE) {
        playspaceComponent.gameState.addCardToTable(card);
    } else {
        playspaceComponent.gameState.addCardToOwnHand(card);
    }

    if (playspaceComponent.phaserScene.textures.exists(card.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        card.gameObject = playspaceComponent.phaserScene.add.image(card.x, card.y, card.imagePath);
        card.gameObject.setInteractive();
        playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
        card.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, card, playspaceComponent));
        card.gameObject.on('drag', SA.onDragMove.bind(this, card, playspaceComponent));
        card.gameObject.on('dragend', SA.onDragEnd.bind(this, card, playspaceComponent));
        card.gameObject.displayWidth = 100;
        card.gameObject.displayHeight = 150;
        playspaceComponent.gameState.highestDepth++;
        card.gameObject.setDepth(depth ? depth : playspaceComponent.gameState.highestDepth);
    } else {
        // Otherwise, we have to dynamically load it
        if (base64 == true) {
            let string = 'data:image/png;base64,'

            // let counter = 0;
            // playspaceComponent.phaserScene.textures.addBase64(String(card.id), string + card.imagePath);
            // playspaceComponent.phaserScene.textures.on('onload', function() {
            //     counter ++;
            // });
            // let customTimer = playspaceComponent.phaserScene.time.addEvent({ delay: 500, callback: function callback() {

            //     if (counter === 1) {
            //         customTimer.remove(false);
            //         playspaceComponent.phaserScene.add.sprite(100, 100, String(card.id));
            //     }
            // }});

            playspaceComponent.phaserScene.textures.once('addtexture', function() {
                card.gameObject = playspaceComponent.phaserScene.add.image(400,400, String(card.imagePath));
                card.gameObject.setInteractive();
                playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
                card.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, card, playspaceComponent));
                card.gameObject.on('drag', SA.onDragMove.bind(this, card, playspaceComponent));
                card.gameObject.on('dragend', SA.onDragEnd.bind(this, card, playspaceComponent));
                card.gameObject.displayWidth = 100;
                card.gameObject.displayHeight = 150;
                playspaceComponent.gameState.highestDepth++;
                card.gameObject.setDepth(depth ? depth : playspaceComponent.gameState.highestDepth);
            }, playspaceComponent.phaserScene);

            playspaceComponent.phaserScene.textures.addBase64(String(card.imagePath), string + card.imagePath);

        } else {
            playspaceComponent.phaserScene.load.image(card.imagePath, card.imagePath);
            playspaceComponent.phaserScene.load.once("complete", cardCreationCallback.bind(this, card, playspaceComponent, destination, depth));
            playspaceComponent.phaserScene.load.start();
        }
    }
}

export function cardCreationCallback(card: Card, playspaceComponent: PlayspaceComponent, destination: string, depth?: number): void {
    card.gameObject = playspaceComponent.phaserScene.add.image(card.x, card.y, card.imagePath);
    card.gameObject.setInteractive();
    playspaceComponent.phaserScene.input.setDraggable(card.gameObject);
    card.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, card, playspaceComponent));
    card.gameObject.on('drag', SA.onDragMove.bind(this, card, playspaceComponent));
    card.gameObject.on('dragend', SA.onDragEnd.bind(this, card, playspaceComponent));
    card.gameObject.displayWidth = 100;
    card.gameObject.displayHeight = 150;
    playspaceComponent.gameState.highestDepth++;
    card.gameObject.setDepth(depth ? depth : playspaceComponent.gameState.highestDepth);
}

export function createDeck(deck: Deck, component: PlayspaceComponent | ConfigEditorComponent, depth?: number): void {
    if (component instanceof PlayspaceComponent) {
        component.gameState.addDeckToTable(deck);
    } else if (component instanceof ConfigEditorComponent) {
        component.configuration.decks.push(deck);
    }

    if (component.phaserScene.textures.exists(deck.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        deck.gameObject = component.phaserScene.add.image(deck.x, deck.y, deck.imagePath);
        deck.gameObject.setInteractive();
        component.phaserScene.input.setDraggable(deck.gameObject);
        deck.gameObject.on('drag', SA.onDragMove.bind(this, deck, component));
        deck.gameObject.displayWidth = 100;
        deck.gameObject.displayHeight = 150;

        if (component instanceof PlayspaceComponent) {
            deck.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, deck, component));
            deck.gameObject.on('dragend', SA.onDragEnd.bind(this, deck, component));
            deck.gameObject.on('pointerdown', DA.deckRightClick.bind(this, deck, component));
            component.gameState.highestDepth++;
            deck.gameObject.setDepth(depth ? depth : component.gameState.highestDepth);
        }
    } else {
        // Otherwise, we have to dynamically load it
        component.phaserScene.load.image(deck.imagePath, deck.imagePath);
        component.phaserScene.load.once("complete", deckCreationCallback.bind(this, deck, component, depth));
        component.phaserScene.load.start();
    }
}

export function deckCreationCallback(deck: Deck, component: PlayspaceComponent | ConfigEditorComponent, depth?: number): void {
    deck.gameObject = component.phaserScene.add.image(deck.x, deck.y, deck.imagePath);
    deck.gameObject.setInteractive();
    component.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('drag', SA.onDragMove.bind(this, deck, component));
    deck.gameObject.displayWidth = 100;
    deck.gameObject.displayHeight = 150;

    if (component instanceof PlayspaceComponent) {
        deck.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, deck, component));
        deck.gameObject.on('dragend', SA.onDragEnd.bind(this, deck, component));
        deck.gameObject.on('pointerdown', DA.deckRightClick.bind(this, deck, component));
        component.gameState.highestDepth++;
        deck.gameObject.setDepth(depth ? depth : component.gameState.highestDepth);
    }
}