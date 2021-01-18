"use strict";
exports.__esModule = true;
exports.importDeck = exports.shuffleDeck = exports.retrieveTopCard = exports.deckRightClick = void 0;
var card_1 = require("../models/card");
var optionObject_1 = require("../models/optionObject");
var popupScene_1 = require("../models/phaser-scenes/popupScene");
var gameState_1 = require("../models/gameState");
var HelperFunctions = require("../helper-functions");
function popupClose(popupScene, deck, component) {
    component.phaserScene.scene.remove(popupScene.key);
    deck.rightClick = false;
}
function deckRightClick(deck, component, pointer, optionObjectConfig) {
    if (pointer.rightButtonDown() && deck.rightClick == false) {
        var optionWidth = 200;
        var optionHeight = 75;
        var optionObjects = [];
        var optionSeparation = 10;
        optionObjects.push(new optionObject_1["default"]("retrieveCard", retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', optionWidth, optionHeight, { destination: HelperFunctions.EDestination.TABLE }));
        optionObjects.push(new optionObject_1["default"]("addTopCardToHand", retrieveTopCard, 'assets/images/buttons/addTopCardToHand.png', optionWidth, optionHeight, { destination: HelperFunctions.EDestination.HAND }));
        optionObjects.push(new optionObject_1["default"]("shuffleDeck", shuffleDeck, 'assets/images/buttons/shuffleDeck.png', optionWidth, optionHeight));
        optionObjects.push(new optionObject_1["default"]("importDeck", importDeck, 'assets/images/buttons/importDeck.png', optionWidth, optionHeight));
        var width = 250;
        var height = optionHeight * optionObjects.length + (optionObjects.length - 1) * optionSeparation;
        var handle = "popup" + component.popupCount++;
        var popupScene = new popupScene_1["default"](handle, pointer.x, pointer.y, component, deck, width, height, optionObjects, optionSeparation);
        component.phaserScene.scene.add(handle, popupScene, true);
        deck.rightClick = true;
    }
}
exports.deckRightClick = deckRightClick;
function retrieveTopCard(popupScene, deck, playspaceComponent, optionObjectConfig, pointer) {
    if (playspaceComponent.gameState.getAmHost()) {
        var card = playspaceComponent.gameState.getCardFromDeck(deck.cards.length - 1, deck.id, true);
        if (card) {
            if (card.gameObject == null) {
                card.inDeck = false;
                card.x = optionObjectConfig.destination === HelperFunctions.EDestination.TABLE ? deck.x : playspaceComponent.gameState.myHand.gameObject.x + 150;
                card.y = optionObjectConfig.destination === HelperFunctions.EDestination.TABLE ? deck.y : playspaceComponent.gameState.myHand.gameObject.y + 200;
                if (card.base64 == false) {
                    HelperFunctions.createCard(card, playspaceComponent, optionObjectConfig.destination);
                }
                else {
                    HelperFunctions.createCard(card, playspaceComponent, optionObjectConfig.destination, undefined, true);
                }
                if (optionObjectConfig.destination === HelperFunctions.EDestination.TABLE) {
                    playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.sendTopCard, {
                        cardID: card.id,
                        deckID: deck.id,
                        imagePath: card.imagePath,
                        type: gameState_1.EGameObjectType.CARD,
                        x: deck.x,
                        y: deck.y,
                        destination: optionObjectConfig.destination
                    });
                }
            }
        }
    }
    else {
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.retrieveTopCard, {
            deckID: deck.id,
            type: gameState_1.EGameObjectType.CARD,
            destination: optionObjectConfig.destination
        });
    }
    popupClose(popupScene, deck, playspaceComponent);
}
exports.retrieveTopCard = retrieveTopCard;
function shuffleDeck(popupScene, deck, playspaceComponent, pointer) {
    if (playspaceComponent.gameState.getAmHost()) {
        var shuffled = deck.cards.map(function (card) { return ({ randomVal: Math.random(), card: card }); })
            .sort(function (object1, object2) { return object1.randomVal - object2.randomVal; })
            .map(function (object) { return object.card; });
        playspaceComponent.gameState.replaceCardsInDeck(shuffled, deck.id);
    }
    popupClose(popupScene, deck, playspaceComponent);
}
exports.shuffleDeck = shuffleDeck;
function importDeck(popupScene, deck, playspaceComponent) {
    var imagePaths = [];
    var baseURL = "assets/images/playing-cards/";
    var prefixes = ["ace_of_", "two_of_", "three_of_", "four_of_", "five_of_", "six_of_", "seven_of_", "eight_of_", "nine_of_", "ten_of_", "jack_of_", "queen_of_", "king_of_"];
    var suffixes = ["hearts.png", "spades.png", "diamonds.png", "clubs.png"];
    prefixes.forEach(function (prefix) {
        suffixes.forEach(function (suffix) {
            imagePaths.push(baseURL + prefix + suffix);
        });
    });
    if (playspaceComponent.gameState.getAmHost()) {
        imagePaths.forEach(function (imagePath) {
            playspaceComponent.gameState.addCardToDeck(new card_1["default"](playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y), deck.id);
        });
    }
    if (!playspaceComponent.gameState.getAmHost()) {
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.importDeck, {
            deckID: deck.id,
            type: gameState_1.EGameObjectType.DECK,
            imagePaths: imagePaths
        });
    }
    popupClose(popupScene, deck, playspaceComponent);
}
exports.importDeck = importDeck;
