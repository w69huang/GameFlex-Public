"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.GameInstanceComponent = void 0;
var core_1 = require("@angular/core");
var retrieve_game_state_popup_component_1 = require("../popups/retrieve-game-state-popup/retrieve-game-state-popup.component");
var save_game_state_popup_component_1 = require("../popups/save-game-state-popup/save-game-state-popup.component");
var GameInstanceComponent = /** @class */ (function () {
    function GameInstanceComponent(route, savedGameStateService, dialog, middleware, fileService) {
        this.route = route;
        this.savedGameStateService = savedGameStateService;
        this.dialog = dialog;
        this.middleware = middleware;
        this.fileService = fileService;
        this.amHost = false;
        this.saveGameStateEmitter = new core_1.EventEmitter();
        this.getAllSavedGameStatesEmitter = new core_1.EventEmitter();
        this.uploadCardToGameStateEmitter = new core_1.EventEmitter();
    }
    GameInstanceComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.route.queryParams.subscribe(function (params) {
            _this.mainHostID = params['host'];
            _this.onlineGameID = params['onlineGameID'];
        });
        document.getElementById('onlineGameCode').style.setProperty('display', 'none');
    };
    GameInstanceComponent.prototype.receiveOnlineGameData = function (onlineGame) {
        this.onlineGame = onlineGame;
        document.getElementById('onlineGameCode').style.setProperty('display', 'unset');
    };
    GameInstanceComponent.prototype.receivePlayerData = function (playerData) {
        this.playerData = playerData;
    };
    GameInstanceComponent.prototype.receiveAmHost = function (amHost) {
        this.amHost = amHost;
    };
    GameInstanceComponent.prototype.getAllSavedGameStates = function () {
        var _this = this;
        var dialogRef = this.dialog.open(retrieve_game_state_popup_component_1.RetrieveGameStatePopupComponent, {
            height: '225',
            width: '300px'
        });
        dialogRef.afterClosed().subscribe(function (savedGameState) {
            _this.getAllSavedGameStatesEmitter.emit(savedGameState);
        });
    };
    GameInstanceComponent.prototype.saveGameState = function () {
        var _this = this;
        var dialogRef = this.dialog.open(save_game_state_popup_component_1.SaveGameStatePopupComponent, {
            height: '225px',
            width: '300px'
        });
        dialogRef.afterClosed().subscribe(function (formData) {
            if (formData.name) {
                _this.saveGameStateEmitter.emit(formData.name);
            }
        });
    };
    GameInstanceComponent.prototype.deleteAllSaves = function () {
        this.savedGameStateService.deleteAll().subscribe();
    };
    GameInstanceComponent.prototype.clearCachedSave = function () {
        localStorage.removeItem('cachedGameState');
    };
    GameInstanceComponent.prototype.uploadCard = function () {
        var _this = this;
        this.fileService.list('TestDeck', 'test2').subscribe(function (data) {
            console.log("GameInstance Componenet Pulled Files:");
            console.log(data);
            _this.uploadCardToGameStateEmitter.emit(data);
        });
    };
    GameInstanceComponent = __decorate([
        core_1.Component({
            selector: 'app-game-instance',
            templateUrl: './game-instance.component.html',
            styleUrls: ['./game-instance.component.scss']
        })
    ], GameInstanceComponent);
    return GameInstanceComponent;
}());
exports.GameInstanceComponent = GameInstanceComponent;
