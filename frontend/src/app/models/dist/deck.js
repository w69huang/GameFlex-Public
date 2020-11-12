"use strict";
exports.__esModule = true;
var Deck = /** @class */ (function () {
    function Deck(id, imagePath, cards, x, y) {
        this.gameObject = null;
        this.type = "deck";
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.rightClick = false;
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
