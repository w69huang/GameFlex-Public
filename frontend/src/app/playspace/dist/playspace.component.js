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
var phaser_1 = require("phaser");
var card_1 = require("../models/card");
var deck_1 = require("../models/deck");
var hand_1 = require("../models/hand");
var gameState_1 = require("../models/gameState");
var sentGameState_1 = require("../models/sentGameState");
var mainScene_1 = require("../models/phaser-scenes/mainScene");
var HelperFunctions = require("../helper-functions");
var SharedActions = require("../actions/sharedActions");
var DeckActions = require("../actions/deckActions");
// TODO: Consider using a hashmap of keys to card objects (an associative array/object)
var PlayspaceComponent = /** @class */ (function () {
    function PlayspaceComponent() {
        this.popupCount = 0;
        this.sceneWidth = 1000;
        this.sceneHeight = 1000;
        this.handBeginY = 600;
        this.highestID = 1;
        // State
        this.playerID = 1;
        // NOTE: In the future, this should be populated by a DB call for a specific game
        this.amHost = true;
    }
    PlayspaceComponent.prototype.ngOnInit = function () {
        var _this = this;
        setTimeout(function (_) { return _this.initialize(); }, 100);
    };
    PlayspaceComponent.prototype.initialize = function () {
        var _this = this;
        this.phaserScene = new mainScene_1["default"](this, this.sceneWidth, this.sceneHeight, this.handBeginY);
        this.config = {
            type: phaser_1["default"].AUTO,
            height: this.sceneHeight,
            width: this.sceneWidth,
            scene: [this.phaserScene],
            parent: 'gameContainer'
        };
        // TODO: Based off player ID, need to ensure the other person has a different playerID
        this.gameState = new gameState_1["default"]([], [], [], new hand_1["default"](this.playerID, []));
        this.phaserGame = new phaser_1["default"].Game(this.config);
        // NOTE: Launch a local peer server:
        // 1. npm install -g peer
        // 2. peerjs --port 9000 --key peerjs --path /peerserver
        this.peer = new Peer({
            // host: 'localhost',
            host: '35.215.71.108',
            port: 9000,
            path: '/peerserver' // Make sure this path matches the path you used to launch it
        });
        this.peer.on('open', function (id) {
            _this.peerId = id;
            console.log('My peer ID is: ' + id);
        });
        this.peer.on('connection', function (conn) {
            console.log("Received connection request from peer with id " + conn.peer + ".");
            // For now, if I receive a connection request I am not the host
            _this.amHost = false;
            // For now, we default the other person's playerID to be 2
            _this.playerID = 2;
            _this.conn = conn;
            _this.otherPeerId = conn.peer;
            _this.conn.on('data', function (data) {
                _this.handleData(data);
            });
            _this.conn.on('close', function () {
                console.log("Peer-to-Peer Error: Other party disconnected.");
                _this.conn = null;
                _this.otherPeerId = null;
            });
            _this.conn.on('error', function (err) {
                console.log("Unspecified Peer-to-Peer Error:");
                console.log(err);
                _this.conn = null;
                _this.otherPeerId = null;
            });
            _this.conn.on('open', function () {
                _this.conn.send({
                    'action': 'sendState',
                    'amHost': _this.amHost,
                    'playerID': _this.playerID
                });
            });
        });
    };
    PlayspaceComponent.prototype.startConnection = function (peerID) {
        var _this = this;
        this.otherPeerId = peerID;
        var conn = this.peer.connect(this.otherPeerId);
        this.conn = conn;
        conn.on('open', function () {
            // Receive messages
            conn.on('data', function (data) {
                _this.handleData(data);
            });
            conn.on('close', function () {
                console.log("Peer-to-Peer Error: Other party disconnected.");
                _this.conn = null;
                _this.otherPeerId = null;
            });
            conn.on('error', function (err) {
                console.log("Unspecified Peer-to-Peer Error:");
                console.log(err);
                _this.conn = null;
                _this.otherPeerId = null;
            });
        });
    };
    PlayspaceComponent.prototype.filterOutID = function (objectListToFilter, object) {
        return objectListToFilter.filter(function (refObject) {
            return object.id !== refObject.id;
        });
    };
    PlayspaceComponent.prototype.handleData = function (data) {
        var _this = this;
        if (this.amHost && data['amHost']) {
            // Error! Both parties claim to the be the host! Abort!
            console.log("Fatal error: both parties claim to be the host.");
            return;
        }
        switch (data['action']) {
            // Received by the host after being sent by the player upon connection to the host, in which the player asks for the game state
            case 'sendState':
                var sentGameState = new sentGameState_1["default"](this.gameState, data['playerID']);
                console.log("Sending state.");
                this.conn.send({
                    'action': 'replicateState',
                    'state': sentGameState,
                    'amHost': this.amHost,
                    'playerID': this.playerID
                });
                break;
            case 'replicateState':
                console.log("Received state.");
                var receivedGameState = data['state'];
                this.cleanUpGameState();
                this.gameState = new gameState_1["default"]([], [], [], this.gameState.myHand);
                receivedGameState.cardMins.forEach(function (cardMin) {
                    var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                    HelperFunctions.createCard(card, _this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
                });
                receivedGameState.deckMins.forEach(function (deckMin) {
                    var deck = new deck_1["default"](deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
                    HelperFunctions.createDeck(deck, _this, SharedActions.onDragMove, DeckActions.deckRightClick, deck.x, deck.y);
                });
                receivedGameState.handMin.cardMins.forEach(function (cardMin) {
                    var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, true);
                    HelperFunctions.createCard(card, _this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.HAND, card.x, card.y);
                });
                break;
            case 'move':
                if (data['type'] === 'card') {
                    var card = null;
                    var found = true;
                    for (var i = 0; i < this.gameState.cards.length; i++) {
                        if (this.gameState.cards[i].id === data['id']) {
                            card = this.gameState.cards[i];
                            found = false;
                            break;
                        }
                    }
                    if (!found && this.amHost) {
                        for (var i = 0; i < this.gameState.hands.length; i++) {
                            if (data['playerID'] === this.gameState.hands[i].playerID) {
                                for (var j = 0; j < this.gameState.hands[i].cards.length; j++) {
                                    if (this.gameState.hands[i].cards[j].id === data['id']) {
                                        card = this.gameState.hands[i].cards[j];
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    if (card) {
                        card.x = data['x'];
                        card.y = data['y'];
                        if (card.gameObject) {
                            card.gameObject.setX(data['x']);
                            card.gameObject.setY(data['y']);
                        }
                    }
                }
                else if (data['type'] === 'deck') {
                    var deck = null;
                    for (var i = 0; i < this.gameState.decks.length; i++) {
                        if (this.gameState.decks[i].id === data['id']) {
                            deck = this.gameState.decks[i];
                            break;
                        }
                    }
                    if (deck) {
                        deck.x = data['x'];
                        deck.y = data['y'];
                        deck.gameObject.setX(data['x']);
                        deck.gameObject.setY(data['y']);
                    }
                }
                break;
            // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
            case 'insertIntoDeck':
                if (data['type'] === 'card' && this.amHost) {
                    var card = null;
                    var deck = null;
                    var handIndex = null;
                    var foundInHand = data['foundInHand'];
                    if (!foundInHand) {
                        for (var i = 0; i < this.gameState.cards.length; i++) {
                            if (this.gameState.cards[i].id === data['cardID']) {
                                card = this.gameState.cards[i];
                                break;
                            }
                        }
                    }
                    else {
                        for (var i = 0; i < this.gameState.hands.length; i++) {
                            if (this.gameState.hands[i].playerID === data['playerID']) {
                                var hand = this.gameState.hands[i];
                                handIndex = i;
                                for (var j = 0; j < hand.cards.length; j++) {
                                    if (hand.cards[j].id === data['cardID']) {
                                        card = hand.cards[j];
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    for (var i = 0; i < this.gameState.decks.length; i++) {
                        if (this.gameState.decks[i].id === data['deckID']) {
                            deck = this.gameState.decks[i];
                            break;
                        }
                    }
                    if (card && deck) {
                        deck.cards.push(card);
                        if (card.gameObject) {
                            card.gameObject.destroy();
                            card.gameObject = null;
                        }
                        if (!foundInHand) {
                            this.gameState.cards = this.filterOutID(this.gameState.cards, card);
                        }
                        else {
                            card.inHand = false;
                            this.gameState.hands[handIndex].cards = this.filterOutID(this.gameState.hands[handIndex].cards, card);
                        }
                    }
                }
                else if (data['type'] === 'card' && !this.amHost) {
                    var card = null;
                    for (var i = 0; i < this.gameState.cards.length; i++) {
                        if (this.gameState.cards[i].id === data['cardID']) {
                            card = this.gameState.cards[i];
                            break;
                        }
                    }
                    if (card) {
                        // If I am not the host and someone inserts a card into the deck, completely remove all reference to it
                        card.gameObject.destroy();
                        this.gameState.cards = this.filterOutID(this.gameState.cards, card);
                    }
                }
                break;
            // The host receives this action, which was sent by a non-host requesting the top card of the deck
            case 'retrieveTopCard':
                if (data['type'] === 'card' && this.amHost) {
                    var deck = null;
                    for (var i = 0; i < this.gameState.decks.length; i++) {
                        if (this.gameState.decks[i].id === data['deckID']) {
                            deck = this.gameState.decks[i];
                            break;
                        }
                    }
                    if (deck && deck.cards.length > 0) {
                        var card = deck.cards[deck.cards.length - 1];
                        card.inDeck = false;
                        HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);
                        deck.cards = this.filterOutID(deck.cards, card);
                        this.conn.send({
                            'action': 'sendTopCard',
                            'type': 'card',
                            'cardID': card.id,
                            'imagePath': card.imagePath,
                            'deckID': deck.id,
                            'x': deck.gameObject.x,
                            'y': deck.gameObject.y,
                            'amHost': this.amHost,
                            'playerID': this.playerID
                        });
                    }
                }
                break;
            // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
            case 'sendTopCard':
                if (data['type'] === 'card' && !this.amHost) {
                    var deck = null;
                    for (var i = 0; i < this.gameState.decks.length; i++) {
                        if (this.gameState.decks[i].id === data['deckID']) {
                            deck = this.gameState.decks[i];
                            break;
                        }
                    }
                    if (deck) {
                        var card = new card_1["default"](data['cardID'], data['imagePath'], data['x'], data['y']);
                        card.inDeck = false;
                        HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);
                    }
                }
                break;
            // Anyone can receive this action, which is sent by someone who inserts a card into their hand
            case 'insertIntoHand':
                // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
                if (data['type'] === 'card') {
                    var card = null;
                    for (var i = 0; i < this.gameState.cards.length; i++) {
                        if (this.gameState.cards[i].id === data['cardID']) {
                            card = this.gameState.cards[i];
                            break;
                        }
                    }
                    if (card) {
                        // Delete the card
                        card.gameObject.destroy();
                        card.gameObject = null;
                        if (this.amHost) {
                            // If I am the host, add it to the appropriate player's hand in the game state
                            card.inHand = true;
                            var hand_2 = null;
                            this.gameState.hands.forEach(function (refHand) {
                                if (data['playerID'] === refHand.playerID) {
                                    hand_2 = refHand;
                                }
                            });
                            if (!hand_2) {
                                this.gameState.hands.push(new hand_1["default"](data['playerID'], [card]));
                            }
                            else {
                                hand_2.cards.push(card);
                            }
                        }
                        this.gameState.cards = this.filterOutID(this.gameState.cards, card);
                    }
                }
                break;
            // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a deck)
            case 'removeFromHand':
                if (data['type'] === 'card') {
                    var card = null;
                    if (this.amHost) {
                        // Card already exists
                        for (var i = 0; i < this.gameState.hands.length; i++) {
                            if (this.gameState.hands[i].playerID === data['playerID']) {
                                for (var j = 0; j < this.gameState.hands[i].cards.length; j++) {
                                    if (this.gameState.hands[i].cards[j].id === data['cardID']) {
                                        card = this.gameState.hands[i].cards[j];
                                        card.inHand = false;
                                        this.gameState.hands[i].cards = this.filterOutID(this.gameState.hands[i].cards, card);
                                        HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, data['x'], data['y']);
                                        break;
                                    }
                                }
                                break;
                            }
                        }
                    }
                    else {
                        card = new card_1["default"](data['cardID'], data['imagePath'], data['x'], data['y']);
                        HelperFunctions.createCard(card, this, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, data['x'], data['y']);
                    }
                }
                break;
            case 'importDeck':
                if (data['type'] === 'deck' && this.amHost) {
                    var deck_2 = null;
                    for (var i = 0; i < this.gameState.decks.length; i++) {
                        if (this.gameState.decks[i].id === data['deckID']) {
                            deck_2 = this.gameState.decks[i];
                        }
                    }
                    if (deck_2) {
                        var imagePaths = data['imagePaths'];
                        imagePaths.forEach(function (imagePath) {
                            deck_2.cards.push(new card_1["default"](_this.highestID++, imagePath, deck_2.gameObject.x, deck_2.gameObject.y));
                        });
                    }
                }
                break;
            case 'shuffle':
                // TODO: Right now, only hosts can shuffle because only they know what is in the deck, and so no one should be receiving this call
                // Can change if necessary
                //if (data['type'] === 'deck' && this.amHost) {
                //  let deck: Deck = null;
                //
                //  for (let i = 0; i < this.phaserScene.decks.length; i++) {
                //    if (this.phaserScene.decks[i].id === data['deckID']) {
                //      deck = this.phaserScene.decks[i];
                //    }
                //  }
                //
                //  if (deck) {
                //    let shuffled = [];
                //    data['shuffledCardIDs'].forEach((id) => {
                //      for (let i = 0; i < deck.cards.length; i++) {
                //        if (id === deck.cards[i].id) {
                //          shuffled.push(deck.cards[i]);
                //          break;
                //        }
                //      }
                //    });
                //
                //    deck.cards = shuffled;
                //  }
                //}
                break;
            default:
                break;
        }
    };
    PlayspaceComponent.prototype.cleanUpGameState = function () {
        this.gameState.cards.forEach(function (card) {
            card.gameObject.destroy();
        });
        this.gameState.cards = [];
        this.gameState.decks.forEach(function (deck) {
            deck.gameObject.destroy();
        });
        this.gameState.decks = [];
        this.gameState.myHand.cards.forEach(function (card) {
            card.gameObject.destroy();
        });
        this.gameState.myHand.cards = [];
    };
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
