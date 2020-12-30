import { PlayspaceComponent } from './playspace/playspace.component';
import Card from './models/card';
import Deck from './models/deck';
import * as SA from './actions/sharedActions';
import * as DA from './actions/deckActions';

/**
 * An enum representing the possible destinations for a card after being moved/retrieved from a deck/etc
 */
export enum EDestination {
    TABLE = "Table",
    HAND = "Hand"
}

export function createCard(card: Card, playspaceComponent: PlayspaceComponent, destination: string, depth?: number): void {
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
        if (destination === EDestination.TABLE) {
            playspaceComponent.gameState.addCardToTable(card);
        } else {
            playspaceComponent.gameState.addCardToOwnHand(card);
        }
    } else {
        // Otherwise, we have to dynamically load it
        playspaceComponent.phaserScene.load.image(card.imagePath, card.imagePath);
        playspaceComponent.phaserScene.load.once("complete", cardCreationCallback.bind(this, card, playspaceComponent, destination, depth));
        playspaceComponent.phaserScene.load.start();
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
    if (destination === EDestination.TABLE) {
        playspaceComponent.gameState.addCardToTable(card);
    } else {
        playspaceComponent.gameState.addCardToOwnHand(card);
    }
}

export function createDeck(deck: Deck, playspaceComponent: PlayspaceComponent, depth?: number): void {
    if (playspaceComponent.phaserScene.textures.exists(deck.imagePath)) {
        // If the image already exists in the texture manager's cache, we can create the object now

        deck.gameObject = playspaceComponent.phaserScene.add.image(deck.x, deck.y, deck.imagePath);
        deck.gameObject.setInteractive();
        playspaceComponent.phaserScene.input.setDraggable(deck.gameObject);
        deck.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, deck, playspaceComponent));
        deck.gameObject.on('drag', SA.onDragMove.bind(this, deck, playspaceComponent));
        deck.gameObject.on('dragend', SA.onDragEnd.bind(this, deck, playspaceComponent));
        deck.gameObject.on('pointerdown', DA.deckRightClick.bind(this, deck, playspaceComponent));
        deck.gameObject.displayWidth = 100;
        deck.gameObject.displayHeight = 150;
        playspaceComponent.gameState.highestDepth++;
        deck.gameObject.setDepth(depth ? depth : playspaceComponent.gameState.highestDepth);
        playspaceComponent.gameState.addDeckToTable(deck);
    } else {
        // Otherwise, we have to dynamically load it
        playspaceComponent.phaserScene.load.image(deck.imagePath, deck.imagePath);
        playspaceComponent.phaserScene.load.once("complete", deckCreationCallback.bind(this, deck, playspaceComponent, depth));
        playspaceComponent.phaserScene.load.start();
    }
}

export function deckCreationCallback(deck: Deck, playspaceComponent: PlayspaceComponent, depth?: number): void {
    deck.gameObject = playspaceComponent.phaserScene.add.image(deck.x, deck.y, deck.imagePath);
    deck.gameObject.setInteractive();
    playspaceComponent.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, deck, playspaceComponent));
    deck.gameObject.on('drag', SA.onDragMove.bind(this, deck, playspaceComponent));
    deck.gameObject.on('dragend', SA.onDragEnd.bind(this, deck, playspaceComponent));
    deck.gameObject.on('pointerdown', DA.deckRightClick.bind(this, deck, playspaceComponent));
    deck.gameObject.displayWidth = 100;
    deck.gameObject.displayHeight = 150;
    playspaceComponent.gameState.highestDepth++;
    deck.gameObject.setDepth(depth ? depth : playspaceComponent.gameState.highestDepth);
    playspaceComponent.gameState.addDeckToTable(deck);
}

export function createPhaserImageButton(scene: Phaser.Scene, x : integer, y : integer, width: integer, height: integer, image : string, func : Function): Phaser.GameObjects.Image {

    var enterButtonHoverState = () => button.setTintFill(0xB4B4B4);
    var enterButtonRestState = () => button.clearTint();
    var enterButtonActiveState = () => button.setTintFill(0x551A8B);

    var button = scene.add.image(x, y, image)
        .setDisplaySize(width, height)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => enterButtonHoverState() )
        .on('pointerout', () => enterButtonRestState() )
        .on('pointerdown', () => enterButtonActiveState() )
        .on('pointerup', () => {
            enterButtonHoverState();
            func();
        });

    return button;
}
