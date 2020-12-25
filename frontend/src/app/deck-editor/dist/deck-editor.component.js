"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.DeckEditorComponent = void 0;
var core_1 = require("@angular/core");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var upload_cards_popup_component_1 = require("../popups/create-deck-popup/upload-cards-popup.component");
var deckObject = /** @class */ (function () {
    function deckObject() {
    }
    return deckObject;
}());
var DeckEditorComponent = /** @class */ (function () {
    function DeckEditorComponent(deckService, fileService, dialog, middleWare) {
        var _this = this;
        this.deckService = deckService;
        this.fileService = fileService;
        this.dialog = dialog;
        this.middleWare = middleWare;
        this.files = [];
        this.deckList$ = [];
        var username = this.middleWare.getUsername();
        this.deckService.list(username).subscribe(function (data) {
            for (var i = 0; i < data.length; i++) {
                var deckData = data[i];
                console.log(deckData);
                _this.deckList$.push({ deckID: deckData._id, deckName: deckData.deckName });
                console.log(_this.deckList$);
            }
        });
    }
    DeckEditorComponent.prototype.ngOnInit = function () { };
    //TEST THIS! DEC 15th
    DeckEditorComponent.prototype.createDeck = function (deckName) {
        var _this = this;
        var username = this.middleWare.getUsername();
        this.deckService.createDeck(username, deckName).subscribe(function (data) {
            if (data.deck) {
                _this.deckList$.push(data.deck);
            }
        });
    };
    DeckEditorComponent.prototype.editDeck = function (deckName) {
        var _this = this;
        var username = this.middleWare.getUsername();
        var dialogRef = this.dialog.open(upload_cards_popup_component_1.UploadCardsPopupComponent, {
            height: '70%',
            width: '70%',
            data: {
                deckNameData: deckName,
                userID: username
            }
        });
        dialogRef.afterClosed().subscribe(function (deckData) {
            var _a;
            var deckName = deckData.name;
            var username = _this.middleWare.getUsername();
            (_a = deckData.files) === null || _a === void 0 ? void 0 : _a.forEach(function (file) {
                _this.uploadFile(file, deckName, username);
            });
        });
    };
    DeckEditorComponent.prototype.findExistingDeck = function (name) { };
    DeckEditorComponent.prototype.deleteDeck = function (deckName) {
        var _this = this;
        var username = this.middleWare.getUsername();
        console.log("delete deck: " + deckName);
        this.deckService.deleteDeck(username, deckName).subscribe(function (data) {
            _this.deckList$ = _this.deckList$.filter(function (deck) {
                return deck.deckName !== deckName;
            });
        });
    };
    DeckEditorComponent.prototype.download = function (fileName) {
        //TODO: Dont have this hard coded! File names and ID's should be accesible
        fileName = fileName;
        this.fileService.download(fileName).subscribe(function (data) {
            //render base64 image to screen
            console.log(data);
            var outputImage = document.createElement('img');
            outputImage.height = 200;
            outputImage.width = 200;
            outputImage.src = 'data:image/jpg;base64,' + data;
            document.body.appendChild(outputImage);
        });
    };
    DeckEditorComponent.prototype.remove = function (fileName) {
        this.fileService.remove(fileName);
    };
    // TODO: Take the deckName and pass it into the service call to the backend when we upload a file
    // That way, we can associate the file with a name on the backend
    // --> Also, we'll probably want to pass in the player's username
    DeckEditorComponent.prototype.uploadFile = function (file, deckName, username) {
        var formData = new FormData();
        formData.append('file', file.data);
        formData.append('deckName', deckName);
        formData.append('username', username);
        //Using the "new" fileService
        //this.fileService.upload(file.data.name, formData)
        file.inProgress = true;
        console.log("uploading now...");
        this.fileService.upload(file.data, formData).pipe(
        // map(event => {  
        //   switch (event.type) {  
        //     case HttpEventType.UploadProgress:  
        //       file.progress = Math.round(event.loaded * 100 / event.total);  
        //       break;  
        //     case HttpEventType.Response:  
        //       return event;  
        //   }  
        // }),  
        operators_1.catchError(function (error) {
            file.inProgress = false;
            return rxjs_1.of(file.data.name + " upload failed.");
        })).subscribe(function (event) {
            if (typeof (event) === 'object') {
                console.log(event.body);
            }
        });
    };
    __decorate([
        core_1.ViewChild("fileUpload", { static: false })
    ], DeckEditorComponent.prototype, "fileUpload");
    DeckEditorComponent = __decorate([
        core_1.Component({
            selector: 'app-deck-editor',
            templateUrl: './deck-editor.component.html',
            styleUrls: ['./deck-editor.component.scss']
        })
    ], DeckEditorComponent);
    return DeckEditorComponent;
}());
exports.DeckEditorComponent = DeckEditorComponent;
