"use strict";
exports.__esModule = true;
var gameState_1 = require("../models/gameState");
var Hand = /** @class */ (function () {
    /**
     * Used to create a hand
     * @param playerID - The ID of the player who owns the hand
     * @param cards - The cards to put in the hand at creation time
     */
    function Hand(playerID, cards) {
        /**
         * The phaser game object for the hand
         */
        this.gameObject = null;
        /**
         * The hand's type in string form
         */
        this.type = gameState_1.EGameObjectType.HAND;
        this.playerID = playerID;
        this.base64 = false;
        if (cards) {
            this.cards = cards;
        }
        else {
            this.cards = [];
        }
    }
    return Hand;
}());
exports["default"] = Hand;
