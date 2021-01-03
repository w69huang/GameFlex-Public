"use strict";
exports.__esModule = true;
var cardMin_1 = require("./cardMin");
var deckMin_1 = require("./deckMin");
var handMin_1 = require("./handMin");
var CachedGameState = /** @class */ (function () {
    function CachedGameState(gameState) {
        var _this = this;
        this.cardMins = [];
        this.deckMins = [];
        this.handMins = [];
        gameState.cards.forEach(function (card) {
            if (card.base64 == false) {
                _this.cardMins.push(new cardMin_1["default"](card));
            }
        });
        gameState.decks.forEach(function (deck) {
            _this.deckMins.push(new deckMin_1["default"](deck));
        });
        gameState.hands.forEach(function (hand) {
            _this.handMins.push(new handMin_1["default"](hand));
        });
    }
    return CachedGameState;
}());
exports["default"] = CachedGameState;
