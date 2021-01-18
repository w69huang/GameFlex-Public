"use strict";
exports.__esModule = true;
var gameState_1 = require("../models/gameState");
var Deck = /** @class */ (function () {
    /**
     * Used to create a new deck
     * @param id - The ID for the deck
     * @param imagePath - The image path for the deck's phaser game object
     * @param cards - The cards to put in the deck at creation time
     * @param x - The starting x position of the deck
     * @param y - The starting y position of the deck
     */
    function Deck(id, imagePath, cards, x, y) {
        /**
         * The phaser game object for the deck
         */
        this.gameObject = null;
        /**
         * The deck's type in string form
         */
        this.type = gameState_1.EGameObjectType.DECK;
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.rightClick = false;
        this.base64 = false;
        this.base64DeckName = null;
        if (cards) {
            this.cards = cards;
        }
        else {
            this.cards = [];
        }
    }
    return Deck;
}());
exports["default"] = Deck;
