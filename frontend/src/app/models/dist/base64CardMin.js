"use strict";
exports.__esModule = true;
var base64CardMin = /** @class */ (function () {
    function base64CardMin(card) {
        this.id = card.id;
        // this.imagePath = card.imagePath;
        this.x = card.x;
        this.y = card.y;
        this.depth = card.gameObject ? card.gameObject.depth : 0;
        this.deckName = card.base64Deck;
    }
    return base64CardMin;
}());
exports["default"] = base64CardMin;
