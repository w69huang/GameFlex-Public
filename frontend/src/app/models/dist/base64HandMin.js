"use strict";
exports.__esModule = true;
var base64CardMin_1 = require("./base64CardMin");
var base64HandMin = /** @class */ (function () {
    function base64HandMin(hand) {
        var _this = this;
        this.playerID = hand.playerID;
        this.base64CardMins = [];
        hand.cards.forEach(function (card) {
            _this.base64CardMins.push(new base64CardMin_1["default"](card));
        });
    }
    return base64HandMin;
}());
exports["default"] = base64HandMin;
