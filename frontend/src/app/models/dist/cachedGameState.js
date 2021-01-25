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
        // base64Cards: base64CardMin[] = [];
        // base64Decks: base64DeckMin[] = [];
        // base64Hands: base64HandMin[] = [];
        this.base64Decks = [];
        gameState.cards.forEach(function (card) {
            if (card.base64 == false) {
                _this.cardMins.push(new cardMin_1["default"](card));
            }
            else {
                card.imagePath = null;
                // this.base64Cards.push(new base64CardMin(card));
                var cardMin = new cardMin_1["default"](card);
                cardMin.base64 = true;
                cardMin.deckName = card.base64Deck;
                cardMin.id = card.base64Id;
                _this.cardMins.push(cardMin);
            }
        });
        gameState.decks.forEach(function (deck) {
            _this.deckMins.push(new deckMin_1["default"](deck));
        });
        gameState.hands.forEach(function (hand) {
            _this.handMins.push(new handMin_1["default"](hand));
        });
        this.base64Decks = gameState.base64Decks;
    }
    return CachedGameState;
}());
exports["default"] = CachedGameState;