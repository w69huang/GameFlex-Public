"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
exports.__esModule = true;
exports.LoadCardsPopupComponent = void 0;
var core_1 = require("@angular/core");
var dialog_1 = require("@angular/material/dialog");
var core_2 = require("@angular/core");
var deckObject = /** @class */ (function () {
    function deckObject() {
    }
    return deckObject;
}());
var LoadCardsPopupComponent = /** @class */ (function () {
    function LoadCardsPopupComponent(dialogRef, data, deckService, middleWare) {
        var _this = this;
        this.dialogRef = dialogRef;
        this.data = data;
        this.deckService = deckService;
        this.middleWare = middleWare;
        this.decks = [];
        this.selectedDecks = [];
        this.viewDeckBool = false;
        this.selectedDeck = null;
        this.deckNameEmitter = new core_1.EventEmitter();
        var username = this.middleWare.getUsername();
        this.deckService.list(username).subscribe(function (data) {
            for (var i = 0; i < data.length; i++) {
                var deckData = data[i];
                console.log(deckData);
                _this.decks.push({ deckID: deckData._id, deckName: deckData.deckName });
                console.log(_this.decks);
            }
        });
    }
    LoadCardsPopupComponent.prototype.ngOnInit = function () {
        // setTimeout(() => {this.deckNameEmitter.emit(this.deckNameData)} ,100); 
    };
    LoadCardsPopupComponent.prototype.selected = function (deckName) {
        var index = this.selectedDecks.indexOf(deckName);
        if (index != -1) {
            this.selectedDecks.splice(index, 1);
        }
        else {
            this.selectedDecks.push(deckName);
        }
        console.log(this.selectedDecks);
    };
    LoadCardsPopupComponent.prototype.removeFromSelecred = function (deckName) {
        var index = this.selectedDecks.indexOf(deckName);
        if (index > -1) {
            this.selectedDecks.splice(index, 1);
        }
    };
    LoadCardsPopupComponent.prototype.cancel = function () {
        this.dialogRef.close({ name: null });
    };
    LoadCardsPopupComponent.prototype.select = function () {
        this.dialogRef.close({ name: this.selectedDecks });
    };
    LoadCardsPopupComponent.prototype.back = function () {
        document.getElementById("def").style.display = "block";
        document.getElementById("loadedCards").style.display = "none";
        this.viewDeckBool = false;
    };
    LoadCardsPopupComponent.prototype.viewDeck = function (deckName) {
        document.getElementById("deckDisplay").innerHTML = '';
        this.selectedDeck = deckName;
        this.deckNameEmitter.emit(deckName);
        document.getElementById("def").style.display = "none";
        document.getElementById("loadedCards").style.display = "block";
        this.viewDeckBool = true;
        // $("#loadedCards").show();
        // const username: string = this.middleWare.getUsername();
        // let dialogRef = this.dialog.open(UploadCardsPopupComponent, {
        //   height: '70%',
        //   width: '70%',
        //   data: { 
        //     deckNameData: deckName,
        //     userID: username
        //   }
        // });
        // dialogRef.afterClosed().subscribe(deckData => {
        //   const deckName: string = deckData.name;
        //   const username: string = this.middleWare.getUsername();
        //   deckData.files?.forEach(file => {  
        //     this.uploadFile(file, deckName, username);  
        //   });
        // });
    };
    __decorate([
        core_1.ViewChild('errorsDiv')
    ], LoadCardsPopupComponent.prototype, "errorsDiv");
    LoadCardsPopupComponent = __decorate([
        core_1.Component({
            selector: 'app-load-cards-popup',
            templateUrl: './load-cards-popup.component.html',
            styleUrls: ['./load-cards-popup.component.scss']
        }),
        __param(1, core_2.Inject(dialog_1.MAT_DIALOG_DATA))
    ], LoadCardsPopupComponent);
    return LoadCardsPopupComponent;
}());
exports.LoadCardsPopupComponent = LoadCardsPopupComponent;
