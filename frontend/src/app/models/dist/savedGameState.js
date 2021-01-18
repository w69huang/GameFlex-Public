"use strict";
exports.__esModule = true;
var cardMin_1 = require("./cardMin");
var deckMin_1 = require("./deckMin");
var handMin_1 = require("./handMin");
var savedPlayerData_1 = require("../models/savedPlayerData");
var SavedGameState = /** @class */ (function () {
    function SavedGameState(username, name, gameState, playerData) {
        var _this = this;
        this.cardMins = [];
        this.deckMins = [];
        this.handMins = [];
        this.savedPlayerData = [];
        this.base64Decks = [];
        this.username = username;
        this.name = name;
        this.date = new Date(); // Now
        gameState.cards.forEach(function (card) {
            if (card.base64 == false) {
                _this.cardMins.push(new cardMin_1["default"](card));
            }
            else {
                var cardMin = new cardMin_1["default"](card);
                cardMin.id = card.base64Id;
                cardMin.base64 = true;
                cardMin.deckName = card.base64Deck;
                _this.cardMins.push(cardMin);
            }
        });
        gameState.decks.forEach(function (deck) {
            _this.deckMins.push(new deckMin_1["default"](deck));
        });
        gameState.hands.forEach(function (hand) {
            _this.handMins.push(new handMin_1["default"](hand));
        });
        playerData.forEach(function (data) {
            _this.savedPlayerData.push(new savedPlayerData_1["default"](data));
        });
        this.base64Decks = gameState.base64Decks;
    }
    return SavedGameState;
}());
exports["default"] = SavedGameState;
