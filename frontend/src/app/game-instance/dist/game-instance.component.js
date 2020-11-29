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
    function GameInstanceComponent(route, savedGameStateService, dialog, middleware) {
        this.route = route;
        this.savedGameStateService = savedGameStateService;
        this.dialog = dialog;
        this.middleware = middleware;
        this.amHost = false;
        this.undoCounter = 0;
        this.timer = false;
        this.saveGameStateEmitter = new core_1.EventEmitter();
        this.getAllSavedGameStatesEmitter = new core_1.EventEmitter();
        this.undoGameStateEmitter = new core_1.EventEmitter();
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
    GameInstanceComponent.prototype.clearCache = function () {
        // localStorage.clear();
        localStorage.removeItem('gameStateHistory');
        console.log("Cleared");
    };
    GameInstanceComponent.prototype.undo = function () {
        var _this = this;
        clearTimeout(this.timerFunc);
        this.undoCounter += 1;
        console.log(this.undoCounter);
        this.timerFunc = setTimeout(function (count) {
            _this.undoGameStateEmitter.emit(count);
            _this.timer = false;
            _this.undoCounter = 0;
        }, 2000, this.undoCounter);
    };
    GameInstanceComponent.prototype.deleteAllSaves = function () {
        this.savedGameStateService.deleteAll().subscribe();
    };
    GameInstanceComponent.prototype.clearCachedSave = function () {
        localStorage.removeItem('cachedGameState');
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
