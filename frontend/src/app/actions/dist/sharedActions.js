"use strict";
exports.__esModule = true;
exports.onDragEnd = exports.onDragMove = exports.updateRenderOrder = void 0;
var card_1 = require("../models/card");
var gameState_1 = require("../models/gameState");
var deck_1 = require("../models/deck");
function updateRenderOrder(object, playspaceComponent) {
    playspaceComponent.gameState.highestDepth++;
    object.gameObject.setDepth(playspaceComponent.gameState.highestDepth);
    if ((object instanceof card_1["default"] && !object.inHand) || object instanceof deck_1["default"]) {
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.updateRenderOrder, {
            id: object.id,
            type: object.type,
            highestDepth: playspaceComponent.gameState.highestDepth
        });
    }
}
exports.updateRenderOrder = updateRenderOrder;
// Drag move callback for moving objects on the phaser canvas
// Will be used for both the config editor and the playspace
function onDragMove(object, component, pointer, dragX, dragY) {
    if (object.type == gameState_1.EGameObjectType.DECK || object.type == gameState_1.EGameObjectType.CARD) {
        object.x = dragX;
        object.y = dragY;
        object.gameObject.setX(dragX);
        object.gameObject.setY(dragY);
        if (component.gameState && !object.inHand) {
            component.gameState.sendPeerData(gameState_1.EActionTypes.move, {
                id: object.id,
                type: object.type,
                x: dragX,
                y: dragY
            });
        }
    }
}
exports.onDragMove = onDragMove;
// Drag end callback for finishing moving objects on the phaser canvas
// Will only be used in the playspace as right now it only applies to cards
function onDragEnd(object, playspaceComponent, pointer) {
    var _a;
    var card = (_a = playspaceComponent.gameState.getCardByID(object.id, playspaceComponent.gameState.playerID)) === null || _a === void 0 ? void 0 : _a.card;
    var overlapObject = playspaceComponent.gameState.checkForOverlap(object.id);
    if (overlapObject.overlapType === gameState_1.EOverlapType.HAND) {
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.insertIntoHand, {
            cardID: card.id,
            type: object.type
        });
    }
    else if (overlapObject.overlapType === gameState_1.EOverlapType.ALREADYINHAND && !playspaceComponent.gameState.getAmHost()) {
        // If overlapped with the hand and was already in the hand, report movement if NOT the host
        // The host does not need to share its local hand movements b/c the other players do not store the host's hand data
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.move, {
            id: object.id,
            type: object.type,
            x: object.x,
            y: object.y,
            finishedMoving: true
        });
    }
    else if (overlapObject.overlapType === gameState_1.EOverlapType.TABLE && overlapObject.wasInHand === false) {
        // If overlapped with the table and the card was already on the table
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.move, {
            id: object.id,
            type: object.type,
            x: object.x,
            y: object.y,
            finishedMoving: true
        });
    }
    else if (overlapObject.overlapType === gameState_1.EOverlapType.TABLE && overlapObject.wasInHand === true) {
        // If card overlapped with table and it was in my hand previously
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.removeFromHand, {
            cardID: object.id,
            type: object.type,
            imagePath: object.imagePath,
            x: object.x,
            y: object.y,
            finishedMoving: true
        });
    }
    else if (overlapObject.overlapType === gameState_1.EOverlapType.DECK) {
        playspaceComponent.gameState.sendPeerData(gameState_1.EActionTypes.insertIntoDeck, {
            cardID: object.id,
            deckID: overlapObject.deckID,
            type: object.type,
            imagePath: object.imagePath,
            x: object.x,
            y: object.y
        });
    }
}
exports.onDragEnd = onDragEnd;
