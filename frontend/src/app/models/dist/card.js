"use strict";
exports.__esModule = true;
var gameState_1 = require("../models/gameState");
var Card = /** @class */ (function () {
    /**
     * Used to create a new card
     * @param id - The ID for the card
     * @param imagePath - The image path for the card's phaser game object
     * @param x - The starting x position of the card
     * @param y - The starting y position of the card
     * @param inHand - Whether or not the card is in a hand at creation time
     * @param inDeck - Whether or not the card is in a deck at creation time
     */
    function Card(id, imagePath, x, y, inHand, inDeck) {
        if (inHand === void 0) { inHand = false; }
        if (inDeck === void 0) { inDeck = false; }
        /**
         * The phaser game object for the card
         */
        this.gameObject = null;
        /**
         * The card's type in string form
         */
        this.type = gameState_1.EGameObjectType.CARD;
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.inHand = inHand;
        this.inDeck = inDeck;
        this.base64 = false;
    }
    return Card;
}());
exports["default"] = Card;
