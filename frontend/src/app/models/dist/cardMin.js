"use strict";
exports.__esModule = true;
var CardMin = /** @class */ (function () {
    function CardMin(card) {
        this.id = card.id;
        this.imagePath = card.imagePath;
        this.x = card.x;
        this.y = card.y;
        this.depth = card.gameObject ? card.gameObject.depth : 0;
        this.base64 = false;
        this.deckName = card.base64Deck;
    }
    return CardMin;
}());
exports["default"] = CardMin;
