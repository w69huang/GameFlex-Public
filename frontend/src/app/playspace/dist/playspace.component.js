"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.PlayspaceComponent = void 0;
var core_1 = require("@angular/core");
var peerjs_1 = require("peerjs");
var phaser_1 = require("phaser");
var load_game_state_popup_component_1 = require("../popups/load-game-state-popup/load-game-state-popup.component");
var gameState_1 = require("../models/gameState");
var savedGameState_1 = require("../models/savedGameState");
var playspaceScene_1 = require("../models/phaser-scenes/playspaceScene");
var PlayspaceComponent = /** @class */ (function () {
    function PlayspaceComponent(hostService, onlineGamesService, savedGameStateService, router, middleware, dialog) {
        var _this = this;
        this.hostService = hostService;
        this.onlineGamesService = onlineGamesService;
        this.savedGameStateService = savedGameStateService;
        this.router = router;
        this.middleware = middleware;
        this.dialog = dialog;
        this.popupCount = 0;
        this.sceneWidth = 1000;
        this.sceneHeight = 1000;
        this.handBeginY = 600;
        this.highestID = 1;
        this.saveGameStateEmitter = new core_1.EventEmitter();
        this.getAllSavedGameStatesEmitter = new core_1.EventEmitter();
        this.uploadCardToGameStateEmitter = new core_1.EventEmitter();
        this.undoGameStateEmitter = new core_1.EventEmitter();
        // To Game Instance
        this.playerDataEmitter = new core_1.EventEmitter();
        this.onlineGameEmitter = new core_1.EventEmitter();
        this.amHostEmitter = new core_1.EventEmitter();
        this.firstConnectionAttempt = false;
        this.connOpenedSuccessfully = false;
        this.connectionClosedIntentionally = false;
        this.openConnectionAttempts = 0;
        this.initialStateRequest = false;
        this.gameState = new gameState_1["default"]([], [], [], []);
        this.gameState.myPeerID = hostService.getHostID();
        // NOTE: Launch a local peer server:
        // 1. npm install -g peer
        // 2. peerjs --port 9000 --key peerjs --path /peerserver
        this.peer = new peerjs_1["default"](this.gameState.myPeerID, {
            // host: 'localhost',
            host: '35.215.71.108',
            port: 9000,
            path: '/peerserver' // Make sure this path matches the path you used to launch it
        });
        this.peer.on('connection', function (conn) {
            console.log("Received connection request from peer with id " + conn.peer + ".");
            conn.on('open', function () {
                // Check if there are duplicate connections, if so filter out
                _this.gameState.connections = _this.closeAndFilterDuplicateConnections(conn);
                _this.gameState.connections.push(conn);
                _this.onlineGame.numPlayers++;
                _this.onlineGamesService.update(_this.onlineGame).subscribe();
            });
            conn.on('data', function (data) {
                _this.gameState.handleData(data, _this);
            });
            // Catches the case of a browser being closed
            conn.peerConnection.oniceconnectionstatechange = function () {
                if (conn.peerConnection.iceConnectionState == 'disconnected') {
                    console.log("Peer-to-Peer Error: Other party disconnected.");
                    _this.hostHandleConnectionClose(conn);
                }
            };
            conn.on('close', function () {
                console.log("Peer-to-Peer Error: Other party disconnected.");
                _this.hostHandleConnectionClose(conn);
            });
            conn.on('error', function (err) {
                console.log("Unspecified Peer-to-Peer Error:");
                console.log(err);
                _this.hostHandleConnectionClose(conn);
            });
        });
    }
    PlayspaceComponent.prototype.hostHandleConnectionClose = function (conn) {
        this.gameState.connections = this.filterOutPeer(this.gameState.connections, conn);
        var playerData = null;
        this.gameState.playerDataObjects.forEach(function (playerDataObject) {
            if (playerDataObject.peerID === conn.peer) {
                playerData = playerDataObject;
            }
        });
        if (playerData) {
            this.gameState.playerDataObjects = this.filterOutID(this.gameState.playerDataObjects, playerData);
            this.playerDataEmitter.emit(this.gameState.playerDataObjects);
            this.onlineGame.numPlayers--;
            this.onlineGamesService.update(this.onlineGame).subscribe();
        }
    };
    PlayspaceComponent.prototype.ngOnInit = function () {
        var _this = this;
        // TODO: Band-aid solution, find a better one at some point
        setTimeout(function (_) { return _this.initialize(); }, 100);
        this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 5000);
        this.getAllSavedGameStates();
        this.saveGameState();
        this.uploadCards();
        this.undoGameState();
    };
    PlayspaceComponent.prototype.ngOnDestroy = function () {
        this.connectionClosedIntentionally = true;
        clearInterval(this.updateOnlineGameInterval);
        this.finishConnectionProcess();
        if (this.gameState.connections.length > 0) {
            this.gameState.connections.forEach(function (connection) {
                connection.close();
            });
        }
        this.peer.destroy();
        this.phaserGame.destroy(true);
    };
    PlayspaceComponent.prototype.initialize = function () {
        this.phaserScene = new playspaceScene_1["default"](this, this.sceneWidth, this.sceneHeight, this.handBeginY);
        this.config = {
            type: phaser_1["default"].AUTO,
            height: this.sceneHeight,
            width: this.sceneWidth,
            scene: [this.phaserScene],
            parent: 'gameContainer'
        };
        this.phaserGame = new phaser_1["default"].Game(this.config);
    };
    PlayspaceComponent.prototype.getAllSavedGameStates = function () {
        var _this = this;
        this.getAllSavedGameStatesEmitter.subscribe(function (savedGameState) {
            if (savedGameState) { // If they actually chose a saved game state
                _this.gameState.buildGameStateFromSavedState(savedGameState, _this);
                _this.gameState.playerDataObjects.forEach(function (playerDataObject) {
                    if (playerDataObject.id != _this.gameState.playerID) {
                        console.log("Sending updated state.");
                        _this.gameState.sendGameStateToPeers(playerDataObject.peerID);
                    }
                });
            }
        });
    };
    PlayspaceComponent.prototype.uploadCards = function () {
        var _this = this;
        console.log("Uploaded?");
        this.uploadCardToGameStateEmitter.subscribe(function (cards) {
            cards.map(function (card) {
                console.log("Card data?");
                _this.gameState.addCardToGame(card, _this);
            });
        });
    };
    PlayspaceComponent.prototype.undoGameState = function () {
        var _this = this;
        this.undoGameStateEmitter.subscribe(function (count) {
            _this.gameState.buildGameFromCache(_this, false, count);
        });
    };
    PlayspaceComponent.prototype.saveGameState = function () {
        var _this = this;
        this.saveGameStateEmitter.subscribe(function (name) {
            _this.savedGameStateService.create(new savedGameState_1["default"](_this.middleware.getUsername(), name, _this.gameState, _this.gameState.playerDataObjects));
        });
    };
    PlayspaceComponent.prototype.updateOnlineGame = function () {
        if (this.gameState.getAmHost() && this.onlineGame) {
            this.onlineGame.lastUpdated = Date.now();
            this.onlineGamesService.update(this.onlineGame).subscribe();
        }
    };
    PlayspaceComponent.prototype.filterOutID = function (objectListToFilter, object) {
        return objectListToFilter.filter(function (refObject) {
            return object.id !== refObject.id;
        });
    };
    PlayspaceComponent.prototype.filterOutPeer = function (connectionListToFilter, connection) {
        return connectionListToFilter.filter(function (refConnection) {
            return connection.peer !== refConnection.peer;
        });
    };
    PlayspaceComponent.prototype.closeAndFilterDuplicateConnections = function (conn) {
        var _a;
        var newConnectionList = [];
        (_a = this.gameState.connections) === null || _a === void 0 ? void 0 : _a.forEach(function (connection) {
            if (connection.peer === conn.peer) {
                connection.close();
            }
            else {
                newConnectionList.push(connection);
            }
        });
        return newConnectionList;
    };
    PlayspaceComponent.prototype.buildFromCacheDialog = function () {
        var _this = this;
        var dialogRef = this.dialog.open(load_game_state_popup_component_1.LoadGameStatePopupComponent, {
            height: '290px',
            width: '350px'
        });
        dialogRef.afterClosed().subscribe(function (object) {
            if (object.loadFromCache === true) {
                _this.gameState.buildGameFromCache(_this, true);
            }
            else if (object.loadFromCache === false) {
                _this.gameState.clearCache();
            }
            else {
                console.log('Error loading game from cache.');
            }
            _this.gameState.setCachingEnabled(true);
        });
    };
    PlayspaceComponent.prototype.finishConnectionProcess = function () {
        this.openConnectionAttempts = 0;
        if (this.checkIfCanOpenConnectionInterval) {
            clearInterval(this.checkIfCanOpenConnectionInterval);
        }
        if (this.openConnectionInterval) {
            clearInterval(this.openConnectionInterval);
        }
        document.getElementById('loading').style.display = "none";
        document.getElementById('loadingText').style.display = "none";
    };
    PlayspaceComponent.prototype.checkIfCanOpenConnection = function () {
        if (!this.connOpenedSuccessfully) {
            document.getElementById('loading').removeAttribute('style');
            document.getElementById('loadingText').removeAttribute('style');
            if (this.firstConnectionAttempt) { // If the first connection attempt has occurred but the connection was not opened successfully
                this.openConnectionInterval = setInterval(this.startConnectionProcess.bind(this), 5000);
                clearInterval(this.checkIfCanOpenConnectionInterval);
            }
        }
    };
    PlayspaceComponent.prototype.startConnectionProcess = function () {
        var _this = this;
        if (this.onlineGameID) {
            this.onlineGamesService.get(this.onlineGameID).subscribe(function (onlineGames) {
                _this.onlineGame = onlineGames[0];
                if (_this.onlineGame) { // If the online game's hostID has updated (b/c the host disconnects), update our local hostID reference
                    _this.mainHostID = _this.onlineGame.hostID;
                    _this.onlineGameEmitter.emit(_this.onlineGame);
                }
                if (!_this.onlineGame && _this.mainHostID != _this.gameState.myPeerID) { // I'm not the host and I couldn't find the game
                    alert('Could not find game.');
                    _this.router.navigate(['gameBrowser']);
                }
                else if (_this.mainHostID != _this.gameState.myPeerID) { // My ID does not match the host's
                    if (_this.onlineGame.username === _this.middleware.getUsername()) { // i.e. I, the host, DC'd and was granted a new hostID
                        // Update the hostID of the online game
                        _this.gameState.setAmHost(true, _this.amHostEmitter, _this.middleware.getUsername());
                        _this.onlineGame.hostID = _this.gameState.myPeerID;
                        _this.onlineGamesService.update(_this.onlineGame).subscribe(function (data) {
                            _this.buildFromCacheDialog();
                            _this.updateOnlineGameInterval = setInterval(_this.updateOnlineGame.bind(_this), 300000); // Tell the backend that this game still exists every 5 mins
                            _this.finishConnectionProcess();
                        });
                    }
                    else { // I am not the host
                        _this.gameState.setAmHost(false, _this.amHostEmitter);
                        _this.openConnection();
                        if (_this.openConnectionAttempts >= 5) {
                            alert('Could not connect to host.');
                            _this.router.navigate(['gameBrowser']);
                        }
                    }
                }
                else { // I am the host
                    _this.gameState.setAmHost(true, _this.amHostEmitter, _this.middleware.getUsername());
                    _this.buildFromCacheDialog();
                    _this.updateOnlineGameInterval = setInterval(_this.updateOnlineGame.bind(_this), 300000); // Tell the backend that this game still exists every 5 mins
                    _this.finishConnectionProcess();
                }
            });
        }
        else {
            this.finishConnectionProcess();
        }
    };
    PlayspaceComponent.prototype.openConnection = function () {
        var _this = this;
        var conn = this.peer.connect(this.mainHostID);
        this.firstConnectionAttempt = true;
        this.openConnectionAttempts++;
        conn === null || conn === void 0 ? void 0 : conn.on('open', function () {
            console.log("Connection to " + _this.mainHostID + " opened successfully.");
            _this.gameState.connections.push(conn);
            _this.connOpenedSuccessfully = true;
            _this.firstConnectionAttempt = true;
            _this.finishConnectionProcess();
            // Receive messages
            conn.on('data', function (data) {
                _this.gameState.handleData(data, _this);
            });
            // Catches the case where the browser is closed
            conn.peerConnection.oniceconnectionstatechange = function () {
                if (conn.peerConnection.iceConnectionState == 'disconnected') {
                    console.log("Peer-to-Peer Error: Other party disconnected.");
                    _this.clientHandleConnectionClose(conn);
                }
            };
            conn.on('close', function () {
                console.log("Peer-to-Peer Error: Other party disconnected.");
                _this.clientHandleConnectionClose(conn);
            });
            conn.on('error', function (err) {
                console.log("Unspecified Peer-to-Peer Error: ");
                console.log(err);
                _this.clientHandleConnectionClose(conn);
            });
            _this.gameState.sendPeerData(gameState_1.EActionTypes.sendState, null);
        });
    };
    PlayspaceComponent.prototype.clientHandleConnectionClose = function (conn) {
        if (!this.connectionClosedIntentionally) {
            this.gameState.connections = this.filterOutPeer(this.gameState.connections, conn);
            this.connOpenedSuccessfully = false;
            this.finishConnectionProcess();
            this.checkIfCanOpenConnectionInterval = setInterval(this.checkIfCanOpenConnection.bind(this), 2000);
        }
    };
    __decorate([
        core_1.Input()
    ], PlayspaceComponent.prototype, "mainHostID");
    __decorate([
        core_1.Input()
    ], PlayspaceComponent.prototype, "onlineGameID");
    __decorate([
        core_1.Input()
    ], PlayspaceComponent.prototype, "saveGameStateEmitter");
    __decorate([
        core_1.Input()
    ], PlayspaceComponent.prototype, "getAllSavedGameStatesEmitter");
    __decorate([
        core_1.Input()
    ], PlayspaceComponent.prototype, "uploadCardToGameStateEmitter");
    __decorate([
        core_1.Input()
    ], PlayspaceComponent.prototype, "undoGameStateEmitter");
    __decorate([
        core_1.Output()
    ], PlayspaceComponent.prototype, "playerDataEmitter");
    __decorate([
        core_1.Output()
    ], PlayspaceComponent.prototype, "onlineGameEmitter");
    __decorate([
        core_1.Output()
    ], PlayspaceComponent.prototype, "amHostEmitter");
    PlayspaceComponent = __decorate([
        core_1.Component({
            selector: 'app-playspace',
            templateUrl: './playspace.component.html',
            styleUrls: ['./playspace.component.scss']
        })
    ], PlayspaceComponent);
    return PlayspaceComponent;
}());
exports.PlayspaceComponent = PlayspaceComponent;
