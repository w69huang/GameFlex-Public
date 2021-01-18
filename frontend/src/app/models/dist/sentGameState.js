"use strict";
exports.__esModule = true;
var hand_1 = require("./hand");
var cardMin_1 = require("./cardMin");
var deckMin_1 = require("./deckMin");
var handMin_1 = require("./handMin");
var SentGameState = /** @class */ (function () {
    function SentGameState(gameState, playerID) {
        var _this = this;
        this.cardMins = [];
        this.deckMins = [];
        this.base64Cards = [];
        this.base64Decks = [];
        this.base64Hands = [];
        this.playerID = playerID;
        gameState === null || gameState === void 0 ? void 0 : gameState.cards.forEach(function (card) {
            if (card.base64 == false) {
                _this.cardMins.push(new cardMin_1["default"](card));
            }
            else {
                // card.imagePath = null;
                // this.base64Cards.push(new base64CardMin(card));
                var cardMin = new cardMin_1["default"](card);
                cardMin.id = card.base64Id;
                cardMin.base64 = true;
                cardMin.deckName = card.base64Deck;
                _this.cardMins.push(cardMin);
            }
        });
        gameState === null || gameState === void 0 ? void 0 : gameState.decks.forEach(function (deck) {
            // if(deck.base64 == false) {
            _this.deckMins.push(new deckMin_1["default"](deck));
            // } else {
            //     this.base64Decks.push(new base64DeckMin(deck)); 
            // }
        });
        var handFound = false;
        for (var i = 0; i < (gameState === null || gameState === void 0 ? void 0 : gameState.hands.length); i++) {
            if ((gameState === null || gameState === void 0 ? void 0 : gameState.hands[i].playerID) === this.playerID) {
                // if (gameState?.hands[i].base64 == false) {
                this.handMin = new handMin_1["default"](gameState === null || gameState === void 0 ? void 0 : gameState.hands[i]);
                handFound = true;
                break;
                // } 
                // else {
                //     this.base64HandMin = new base64HandMin(gameState?.hands[i]);
                //     handFound = true;
                //     break; 
                // }
            }
        }
        if (!handFound) {
            this.handMin = new handMin_1["default"](new hand_1["default"](this.playerID, []));
            // this.base64HandMin = new base64HandMin(new Hand(this.playerID, []));
        }
    }
    return SentGameState;
}());
exports["default"] = SentGameState;
