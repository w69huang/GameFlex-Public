"use strict";
exports.__esModule = true;
exports.importDeck = exports.shuffleDeck = exports.retrieveTopCard = exports.deckRightClick = void 0;
var card_1 = require("../models/card");
var optionObject_1 = require("../models/optionObject");
var popupScene_1 = require("../models/phaser-scenes/popupScene");
var HelperFunctions = require("../helper-functions");
var SharedActions = require("../actions/sharedActions");
var DestinationEnum;
(function (DestinationEnum) {
    DestinationEnum["TABLE"] = "Table";
    DestinationEnum["HAND"] = "Hand";
})(DestinationEnum || (DestinationEnum = {}));
function popupClose(popupScene, deck, component) {
    component.phaserScene.scene.remove(popupScene.key);
    deck.rightClick = false;
}
function deckRightClick(deck, component, pointer) {
    if (pointer.rightButtonDown() && deck.rightClick == false) {
        var optionWidth = 200;
        var optionHeight = 75;
        var optionObjects = [];
        var optionSeparation = 10;
        optionObjects.push(new optionObject_1["default"]("retrieveCard", retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', optionWidth, optionHeight));
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
function retrieveTopCard(popupScene, deck, playspaceComponent, pointer) {
    if (playspaceComponent.amHost) {
        var card = deck.cards.pop();
        if (card) {
            if (card.gameObject == null) {
                card.inDeck = false;
                HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);
                if (playspaceComponent.conn) {
                    playspaceComponent.conn.send({
                        'action': 'sendTopCard',
                        'type': 'card',
                        'cardID': card.id,
                        'imagePath': card.imagePath,
                        'deckID': deck.id,
                        'x': deck.gameObject.x,
                        'y': deck.gameObject.y,
                        'amHost': playspaceComponent.amHost,
                        'playerID': playspaceComponent.playerID
                    });
                }
            }
        }
    }
    else if (playspaceComponent.conn) {
        playspaceComponent.conn.send({
            'action': 'retrieveTopCard',
            'type': 'card',
            'deckID': deck.id,
            'amHost': playspaceComponent.amHost,
            'playerID': playspaceComponent.playerID
        });
    }
    popupClose(popupScene, deck, playspaceComponent);
}
exports.retrieveTopCard = retrieveTopCard;
function shuffleDeck(popupScene, deck, playspaceComponent, pointer) {
    if (playspaceComponent.amHost) {
        var shuffled = deck.cards.map(function (card) { return ({ randomVal: Math.random(), card: card }); })
            .sort(function (object1, object2) { return object1.randomVal - object2.randomVal; })
            .map(function (object) { return object.card; });
        deck.cards = shuffled;
        var shuffledCardIDs_1 = [];
        shuffled.forEach(function (card) {
            shuffledCardIDs_1.push(card.id);
        });
        // TODO: Only host can shuffle, and host is not sending shuffled data to players
        // Can change if necessary
        //if (playspaceComponent.conn) {
        //  playspaceComponent.conn.send({
        //  'action': 'shuffle',
        //  'type': 'deck',
        //  'deckID': deck.id,
        //  'shuffledCardIDs': shuffledCardIDs,
        //  'amHost': playspaceComponent.amHost,
        //  'playerID': playspaceComponent.playerID
        //  });
        //}
    }
    popupClose(popupScene, deck, playspaceComponent);
}
exports.shuffleDeck = shuffleDeck;
function importDeck(popupScene, deck, playspaceComponent, pointer) {
    var imagePaths = ["assets/images/playing-cards/king_of_hearts.png", "assets/images/playing-cards/king_of_hearts.png"];
    if (playspaceComponent.amHost) {
        imagePaths.forEach(function (imagePath) {
            deck.cards.push(new card_1["default"](playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y));
        });
    }
    if (playspaceComponent.conn && !playspaceComponent.amHost) { // If the host imports a deck, the other players don't need that info
        playspaceComponent.conn.send({
            'action': 'importDeck',
            'type': 'deck',
            'imagePaths': imagePaths,
            'deckID': deck.id,
            'amHost': playspaceComponent.amHost,
            'playerID': playspaceComponent.playerID
        });
    }
    popupClose(popupScene, deck, playspaceComponent);
}
exports.importDeck = importDeck;
