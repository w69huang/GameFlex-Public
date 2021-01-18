"use strict";
exports.__esModule = true;
var base64CardMin_1 = require("./base64CardMin");
var base64DeckMin = /** @class */ (function () {
    function base64DeckMin(deck) {
        var _this = this;
        var _a;
        this.width = 99;
        this.height = 98;
        this.rotation = 180;
        this.onInsertVisible = true;
        this.numberOfVisibleCards = 10;
        this.id = deck.id;
        this.imagePath = deck.imagePath;
        this.x = deck.x;
        this.y = deck.y;
        this.depth = deck.gameObject ? deck.gameObject.depth : 0;
        this.base64CardMin = [];
        (_a = deck.cards) === null || _a === void 0 ? void 0 : _a.forEach(function (card) {
            if (card.base64 == false) {
                _this.base64CardMin.push(new base64CardMin_1["default"](card));
            }
        });
    }
    return base64DeckMin;
}());
exports["default"] = base64DeckMin;
