"use strict";
exports.__esModule = true;
exports.deckCreationCallback = exports.createDeck = exports.cardCreationCallback = exports.createCard = exports.EDestination = void 0;
var SA = require("./actions/sharedActions");
var DA = require("./actions/deckActions");
var playspace_component_1 = require("./playspace/playspace.component");
var config_editor_component_1 = require("./config-editor/config-editor.component");
/**
 * An enum representing the possible destinations for a card after being moved/retrieved from a deck/etc
 */
var EDestination;
(function (EDestination) {
    EDestination["TABLE"] = "Table";
    EDestination["HAND"] = "Hand";
})(EDestination = exports.EDestination || (exports.EDestination = {}));
function createCard(card, playspaceComponent, destination, depth) {
    // Need to ensure the card is added to table/hand, and not delayed by the cardCreationCallback
    if (destination === EDestination.TABLE) {
        playspaceComponent.gameState.addCardToTable(card);
    }
    else {
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
    }
    else {
        // Otherwise, we have to dynamically load it
        playspaceComponent.phaserScene.load.image(card.imagePath, card.imagePath);
        playspaceComponent.phaserScene.load.once("complete", cardCreationCallback.bind(this, card, playspaceComponent, destination, depth));
        playspaceComponent.phaserScene.load.start();
    }
}
exports.createCard = createCard;
function cardCreationCallback(card, playspaceComponent, destination, depth) {
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
exports.cardCreationCallback = cardCreationCallback;
function createDeck(deck, component, depth) {
    if (component instanceof playspace_component_1.PlayspaceComponent) {
        component.gameState.addDeckToTable(deck);
    }
    else if (component instanceof config_editor_component_1.ConfigEditorComponent) {
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
        if (component instanceof playspace_component_1.PlayspaceComponent) {
            deck.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, deck, component));
            deck.gameObject.on('dragend', SA.onDragEnd.bind(this, deck, component));
            deck.gameObject.on('pointerdown', DA.deckRightClick.bind(this, deck, component));
            component.gameState.highestDepth++;
            deck.gameObject.setDepth(depth ? depth : component.gameState.highestDepth);
        }
    }
    else {
        // Otherwise, we have to dynamically load it
        component.phaserScene.load.image(deck.imagePath, deck.imagePath);
        component.phaserScene.load.once("complete", deckCreationCallback.bind(this, deck, component, depth));
        component.phaserScene.load.start();
    }
}
exports.createDeck = createDeck;
function deckCreationCallback(deck, component, depth) {
    deck.gameObject = component.phaserScene.add.image(deck.x, deck.y, deck.imagePath);
    deck.gameObject.setInteractive();
    component.phaserScene.input.setDraggable(deck.gameObject);
    deck.gameObject.on('drag', SA.onDragMove.bind(this, deck, component));
    deck.gameObject.displayWidth = 100;
    deck.gameObject.displayHeight = 150;
    if (component instanceof playspace_component_1.PlayspaceComponent) {
        deck.gameObject.on('dragstart', SA.updateRenderOrder.bind(this, deck, component));
        deck.gameObject.on('dragend', SA.onDragEnd.bind(this, deck, component));
        deck.gameObject.on('pointerdown', DA.deckRightClick.bind(this, deck, component));
        component.gameState.highestDepth++;
        deck.gameObject.setDepth(depth ? depth : component.gameState.highestDepth);
    }
}
exports.deckCreationCallback = deckCreationCallback;
