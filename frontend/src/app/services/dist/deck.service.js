"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DeckService = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var DeckService = /** @class */ (function () {
    function DeckService(httpClient, webService) {
        this.httpClient = httpClient;
        this.webService = webService;
        this.deckList = new Array();
        this.deckList$ = new rxjs_1.Subject();
    }
    DeckService.prototype.createDeck = function (userID, deckName) {
        console.log('Deck creation in progress...');
        return this.webService.post('new-deck', { userID: userID, deckName: deckName }, true);
    };
    DeckService.prototype.findExistingDeck = function (userID) {
        //this.webService.get()
    };
    DeckService.prototype.deleteDeck = function (userID, deckName) {
        console.log("delete deck service call");
        return this.webService["delete"]("delete-deck?userID=" + userID + "&deckName=" + deckName, true);
    };
    DeckService.prototype.list = function (userID) {
        return this.webService.post('get', { userID: userID }, true);
        //return this.fileList$;
    };
    DeckService = __decorate([
        core_1.Injectable({
            providedIn: 'root'
        })
    ], DeckService);
    return DeckService;
}());
exports.DeckService = DeckService;
