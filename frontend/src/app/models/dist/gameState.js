"use strict";
exports.__esModule = true;
exports.EOverlapType = exports.ECardLocation = exports.OverlapObject = exports.CardLocationObject = exports.GameObjectExtraProperties = exports.EGameObjectType = exports.EActionTypes = void 0;
var card_1 = require("./card");
var deck_1 = require("./deck");
var hand_1 = require("./hand");
var cachedGameState_1 = require("./cachedGameState");
var HelperFunctions = require("../helper-functions");
var sentGameState_1 = require("./sentGameState");
var playerData_1 = require("./playerData");
/**
 * An enum representing all types of actions
 * TODO: Move all references to these strings over to enums
 */
var EActionTypes;
(function (EActionTypes) {
    EActionTypes["replicateState"] = "replicateState";
    EActionTypes["sendState"] = "sendState";
    EActionTypes["move"] = "move";
    EActionTypes["insertIntoDeck"] = "insertIntoDeck";
    EActionTypes["insertIntoHand"] = "insertIntoHand";
    EActionTypes["retrieveTopCard"] = "retrieveTopCard";
    EActionTypes["sendTopCard"] = "sendTopCard";
    EActionTypes["removeFromHand"] = "removeFromHand";
    EActionTypes["importDeck"] = "importDeck";
    EActionTypes["updateRenderOrder"] = "updateRenderOrder";
})(EActionTypes = exports.EActionTypes || (exports.EActionTypes = {}));
/**
 * An enum representing the types of all game objects
 */
var EGameObjectType;
(function (EGameObjectType) {
    EGameObjectType["CARD"] = "card";
    EGameObjectType["DECK"] = "deck";
    EGameObjectType["HAND"] = "hand";
})(EGameObjectType = exports.EGameObjectType || (exports.EGameObjectType = {}));
/**
 * A class representing all the required and extra data be used to form a request to another peer, such as the action being taken
 */
var GameObjectProperties = /** @class */ (function () {
    function GameObjectProperties(amHost, action, peerID, playerID, extras) {
        this.amHost = amHost;
        this.action = action;
        this.peerID = peerID;
        this.playerID = playerID;
        this.extras = extras;
    }
    return GameObjectProperties;
}());
/**
 * A class representing all extra data that COULD (NOT "will") be used to form a request to another peer, such as the location of a card
 * The reason this class is being used is strictly to make it easier to visualize what is usually passed as data
 */
var GameObjectExtraProperties = /** @class */ (function () {
    function GameObjectExtraProperties() {
    }
    return GameObjectExtraProperties;
}());
exports.GameObjectExtraProperties = GameObjectExtraProperties;
/**
 * Used when getting a card by ID to grab both the card and the location it was grabbed from
 */
var CardLocationObject = /** @class */ (function () {
    function CardLocationObject() {
    }
    return CardLocationObject;
}());
exports.CardLocationObject = CardLocationObject;
/**
 * Used when handling overlap to return both the type of overlap (what the card overlapped with) and any additional needed information (such as the ID of the deck overlapped with)
 */
var OverlapObject = /** @class */ (function () {
    function OverlapObject() {
    }
    return OverlapObject;
}());
exports.OverlapObject = OverlapObject;
/**
 * An enum representing all the possible locations a card could be in
 */
var ECardLocation;
(function (ECardLocation) {
    ECardLocation[ECardLocation["NONE"] = 0] = "NONE";
    ECardLocation[ECardLocation["TABLE"] = 1] = "TABLE";
    ECardLocation[ECardLocation["DECK"] = 2] = "DECK";
    ECardLocation[ECardLocation["MYHAND"] = 3] = "MYHAND";
    ECardLocation[ECardLocation["OTHERHAND"] = 4] = "OTHERHAND";
})(ECardLocation = exports.ECardLocation || (exports.ECardLocation = {}));
/**
 * An enum representing all the possible objects a card could overlap with
 */
var EOverlapType;
(function (EOverlapType) {
    EOverlapType[EOverlapType["TABLE"] = 0] = "TABLE";
    EOverlapType[EOverlapType["HAND"] = 1] = "HAND";
    EOverlapType[EOverlapType["ALREADYINHAND"] = 2] = "ALREADYINHAND";
    EOverlapType[EOverlapType["DECK"] = 3] = "DECK";
})(EOverlapType = exports.EOverlapType || (exports.EOverlapType = {}));
/**
 * The game state class, which is responsible for holding the current state of the game
 */
var GameState = /** @class */ (function () {
    /**
     * The constructor for the game state
     * @param cards - The cards to add to the table at initialization time
     * @param decks - The decks to add to the table at initialization time
     * @param hands - The hand information to record at initialization time
     * @param counters - The counter information to record at initialization time
     */
    function GameState(cards, decks, hands, counters) {
        /**
         * Whether caching of the game state is enabled
         */
        this.cachingEnabled = false;
        /**
         * A history of saved game states to allow for undoing
         */
        this.gameStateHistory = [];
        /**
         * Controls the maximum number of game states that can be cahced
         */
        this.maxNumOfCachedStates = 10;
        /**
         * Because of how actions are set up, it is possible that a single action could involve 2 writes to the cache: for example, removing a card from a deck and then adding it to the table
         * In this scenario, we do not want the game state history to record the "in between" move -- removing the card from the deck
         * Thus, if multiple saves are called within a very short period of time, we can be sure that it was because of the code and not because of a player, and thus we'll only save the final state out of the batch of save calls
         */
        this.batchStateHistory = [];
        /**
         * The amount of time to wait for another save call before saving in milliseconds
         */
        this.batchStateWaitTime = 200;
        /**
         * A boolean representing whether this player is the host, used to control branching paths
         */
        this.amHost = false;
        /**
         * My player ID
         */
        this.playerID = null;
        /**
         * A list of player data objects that links peer IDs to player IDs to usernames
         */
        this.playerDataObjects = [];
        /**
         * A list of connections that all game information will be sent to
         */
        this.connections = [];
        /**
         * The highest z-index of any element
         */
        this.highestDepth = 0;
        this._cards = cards;
        this._decks = decks;
        this._hands = hands;
        this.myHand = new hand_1["default"](null, []);
        this._counters = counters;
    }
    Object.defineProperty(GameState.prototype, "cards", {
        /**
         * A public accessor to get all cards
         */
        get: function () {
            return this._cards;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameState.prototype, "decks", {
        /**
         * A public accessor to get all decks
         */
        get: function () {
            return this._decks;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameState.prototype, "hands", {
        /**
         * A public accessor to get all hands
         */
        get: function () {
            return this._hands;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameState.prototype, "counters", {
        /**
         * A public accessor to get all counters
         */
        get: function () {
            return this._counters;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Used to filter objects out of an object list that match an ID
     * @param objectListToFilter - The list to remove objects from
     * @param object - The object to be removed by ID
     */
    GameState.prototype.filterOutID = function (objectListToFilter, object) {
        objectListToFilter = objectListToFilter.filter(function (refObject) {
            return object.id !== refObject.id;
        });
        this.delay(this.saveToCache());
        return objectListToFilter;
    };
    /**
     * Used to remove a card from the general hands array that the host keeps track of
     * @param card - The card to remove
     */
    GameState.prototype.removeFromHandsArray = function (card) {
        var _this = this;
        this._hands.forEach(function (hand) {
            for (var i = 0; i < hand.cards.length; i++) {
                if (hand.cards[i].id === card.id) {
                    hand.cards = _this.filterOutID(hand.cards, card);
                    return;
                }
            }
        });
    };
    /**
     * A method used to set yourself as the host, taking care of anything required to make this happen
     * @param amHost - Whether or not I am the host
     */
    GameState.prototype.setAmHost = function (amHost, amHostEmitter, username) {
        if (username === void 0) { username = null; }
        if (amHost) {
            this.amHost = true;
            this.playerID = 1;
            this.playerDataObjects.push(new playerData_1["default"](this.playerID, this.myPeerID, username));
            amHostEmitter.emit(true);
        }
        else {
        }
    };
    /**
     * A method used to check whether or not you are the host
     */
    GameState.prototype.getAmHost = function () {
        return this.amHost;
    };
    GameState.prototype.addCardToGame = function (cardData, playspaceComponent) {
        var card = new card_1["default"](Math.floor(Math.random() * 100000000), cardData, 50, 50);
        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, 0, true);
        console.log("Built?");
    };
    GameState.prototype.setCachingEnabled = function (enable) {
        this.cachingEnabled = enable;
    };
    /**
     * Used to save the current game state to the user's local storage
     */
    // ISSUE 1: When the deck is rightclicked, and closed, it saved the state twice.
    /* ISSUE 2: When the other player (Not the host) makes a move, the save seems weird.
            Its like the host saved the state between the desitnation and the origin of where the other player moved it
            since when it's the host's actions, they save properly.
            Possibly has something to do with how currentMove is initialized in the constructor? Or just the delay of the
            data being sent between the host and the user?
    */
    GameState.prototype.saveToCache = function () {
        if (this.cachingEnabled && this.amHost) {
            var cachedGameState = new cachedGameState_1["default"](this);
            localStorage.setItem('cachedGameState', JSON.stringify(cachedGameState));
            this.batchStateHistory.push(cachedGameState);
            clearTimeout(this.timerFunc);
            this.timerFunc = setTimeout(this.saveGameHistory.bind(this), this.batchStateWaitTime);
        }
    };
    GameState.prototype.saveGameHistory = function () {
        this.currentMove = this.batchStateHistory.pop();
        this.batchStateHistory = [];
        if (this.currentMove != null || this.currentMove != undefined) {
            this.gameStateHistory.push(this.currentMove);
            if (this.gameStateHistory.length > this.maxNumOfCachedStates) {
                this.gameStateHistory.shift();
            }
            localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
        }
    };
    /**
     * Used to send data to peer(s)
     * @param action - The action to perform
     * @param extras - An array of extra game object properties that the user wants to include
     * @param doNotSendTo - a list of peerIDs not to send the data to
     */
    GameState.prototype.sendPeerData = function (action, extras, doNotSendTo, onlySendTo) {
        var _this = this;
        if (doNotSendTo === void 0) { doNotSendTo = []; }
        if (onlySendTo === void 0) { onlySendTo = []; }
        this.connections.forEach(function (connection) {
            if (onlySendTo.length > 0) {
                if (onlySendTo.includes(connection.peer)) {
                    connection.send(new GameObjectProperties(_this.amHost, action, _this.myPeerID, _this.playerID, extras));
                }
            }
            else if (!doNotSendTo.includes(connection.peer)) {
                connection.send(new GameObjectProperties(_this.amHost, action, _this.myPeerID, _this.playerID, extras));
            }
        });
    };
    /**
     * Used to very quickly and easily send the current game state to all peers
     * @param onlySendTo - An optional var specifying to only send data to a specific peer
     * @param doNotSendTo - An optional var specfying not to send data to a specific peer
     */
    GameState.prototype.sendGameStateToPeers = function (onlySendTo, doNotSendTo) {
        var _this = this;
        if (onlySendTo === void 0) { onlySendTo = ""; }
        if (doNotSendTo === void 0) { doNotSendTo = ""; }
        if (this.amHost) {
            // TODO: Make sentGameState from current gameState and send to all peers
            this.playerDataObjects.forEach(function (playerData) {
                for (var i = 0; i < _this.connections.length; i++) {
                    if (playerData.peerID === _this.connections[i].peer) {
                        if (((onlySendTo !== "" && onlySendTo === playerData.peerID) || onlySendTo === "") && (doNotSendTo === "" || (doNotSendTo !== playerData.peerID))) {
                            var sentGameState = new sentGameState_1["default"](_this, playerData.id);
                            _this.connections[i].send(new GameObjectProperties(_this.amHost, 'replicateState', _this.myPeerID, _this.playerID, { 'state': sentGameState }));
                            break;
                        }
                    }
                }
            });
        }
    };
    /**
     * Used to send a pre-made sentGameState object to a peer
     * @param sentGameState
     * @param peerID
     */
    GameState.prototype.sendAlreadyMadeGameStateToPeer = function (sentGameState, peerID) {
        if (this.amHost) {
            for (var i = 0; i < this.connections.length; i++) {
                if (this.connections[i].peer === peerID) {
                    this.connections[i].send(new GameObjectProperties(this.amHost, 'replicateState', this.myPeerID, this.playerID, { 'state': sentGameState }));
                }
            }
        }
    };
    /**
     * A method to build the game state from the cache
     * @param playspaceComponent - A reference to the playspace component, needed to create the cards and decks
     * @param initialBuild - If this is the very first time we're building from the cache in this browser session
     * @param undo - The number of times undo has been called
     */
    GameState.prototype.buildGameFromCache = function (playspaceComponent, initialBuild, undo) {
        var _this = this;
        if (undo === void 0) { undo = 0; }
        if (this.amHost) {
            var cache_1 = { gamestate: null };
            if (undo > 0) {
                this.gameStateHistory = JSON.parse(localStorage.getItem('gameStateHistory'));
                for (var i = 0; i < undo; i++) {
                    if (this.gameStateHistory.length > 1) {
                        this.gameStateHistory.pop();
                        cache_1.gamestate = this.gameStateHistory[this.gameStateHistory.length - 1];
                    }
                }
                if (cache_1.gamestate) {
                    localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
                    localStorage.setItem('cachedGameState', JSON.stringify(cache_1.gamestate));
                }
            }
            else {
                cache_1.gamestate = JSON.parse(localStorage.getItem('cachedGameState'));
                if (initialBuild) {
                    this.gameStateHistory.push(cache_1.gamestate);
                    localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
                }
            }
            if (cache_1.gamestate != null) {
                this.setCachingEnabled(false);
                this.cleanUp();
                cache_1.gamestate.cardMins.forEach(function (cardMin) {
                    var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                    HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth);
                });
                cache_1.gamestate.deckMins.forEach(function (deckMin) {
                    var cardList = [];
                    deckMin.cardMins.forEach(function (cardMin) {
                        cardList.push(new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y));
                    });
                    var deck = new deck_1["default"](deckMin.id, deckMin.imagePath, cardList, deckMin.x, deckMin.y);
                    HelperFunctions.createDeck(deck, playspaceComponent, deckMin.depth);
                });
                var _loop_1 = function (i) {
                    cache_1.gamestate.handMins[i].cardMins.forEach(function (cardMin) {
                        if (cache_1.gamestate.handMins[i].playerID === _this.playerID) {
                            var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                            _this.addCardToOwnHand(card);
                            HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth);
                        }
                        else {
                            _this.addCardToPlayerHand(new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y), cache_1.gamestate.handMins[i].playerID);
                        }
                    });
                };
                for (var i = 0; i < cache_1.gamestate.handMins.length; i++) {
                    _loop_1(i);
                }
                // Just a temporary thing for now. Ask Zach where the host sends the game state on load.
                if (undo > 0) {
                    this.sendGameStateToPeers();
                    this.currentMove = new cachedGameState_1["default"](this);
                }
                this.setCachingEnabled(true);
            }
        }
    };
    /**
     * A method to clear the cache of the cached game state
     */
    GameState.prototype.clearCache = function () {
        localStorage.removeItem('cachedGameState');
        this.gameStateHistory.push(new cachedGameState_1["default"](this));
        localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
    };
    /**
     * A method to build the game state from a saved game state
     * @param savedGameState - The saved game state to build from
     * @param playspaceComponent - A reference to the playspace component, needed to create cards and decks
     */
    GameState.prototype.buildGameStateFromSavedState = function (savedGameState, playspaceComponent) {
        var _this = this;
        if (this.amHost) {
            this.cachingEnabled = false;
            this.cleanUp();
            savedGameState.cardMins.forEach(function (cardMin) {
                var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth);
            });
            savedGameState.deckMins.forEach(function (deckMin) {
                var cardList = [];
                deckMin.cardMins.forEach(function (cardMin) {
                    cardList.push(new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y));
                });
                var deck = new deck_1["default"](deckMin.id, deckMin.imagePath, cardList, deckMin.x, deckMin.y);
                HelperFunctions.createDeck(deck, playspaceComponent, deckMin.depth);
            });
            var _loop_2 = function (i) {
                savedGameState.handMins[i].cardMins.forEach(function (cardMin) {
                    if (savedGameState.handMins[i].playerID === _this.playerID) {
                        var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                        _this.addCardToOwnHand(card);
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth);
                    }
                    else {
                        _this.addCardToPlayerHand(new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y), savedGameState.handMins[i].playerID);
                    }
                });
            };
            for (var i = 0; i < savedGameState.handMins.length; i++) {
                _loop_2(i);
            }
            this.cachingEnabled = true;
            this.delay(this.saveToCache());
        }
    };
    /**
     * Used to add a card to the table
     * @param card - The card to add
     */
    GameState.prototype.addCardToTable = function (card) {
        this._cards.push(card);
        this.delay(this.saveToCache());
    };
    /**
     * Used to remove a card fom the table
     * @param cardID - The ID of the card to remove
     * @param destroy - Whether or not to destroy the game object associated with the card
     */
    GameState.prototype.removeCardFromTable = function (cardID, destroy) {
        if (destroy === void 0) { destroy = false; }
        var card = this.getCardByID(cardID, this.playerID).card;
        if (card) {
            this._cards = this.filterOutID(this._cards, card);
            if (destroy && card.gameObject) {
                card.gameObject.destroy();
                card.gameObject = null;
            }
            this.delay(this.saveToCache());
        }
    };
    /**
     * Used to add a card to a deck
     * @param card - The card to add
     * @param deckID - The ID of the deck to add to
     */
    GameState.prototype.addCardToDeck = function (card, deckID) {
        var deck = this.getDeckByID(deckID);
        if (deck) {
            card.inDeck = true;
            if (this.amHost) {
                deck.cards.push(card);
            }
        }
        this.delay(this.saveToCache());
    };
    /**
     * Used to add a deck to the table
     * @param deck - The deck to add
     */
    GameState.prototype.addDeckToTable = function (deck) {
        this._decks.push(deck);
        this.delay(this.saveToCache());
    };
    /**
     * Used to add a card to the player's own hand, which also adds the card to the overall hands array if the player is the host
     * @param card - The card to add
     * @param playerID - The ID of the player adding it
     */
    GameState.prototype.addCardToOwnHand = function (card) {
        card.inHand = true;
        this.myHand.cards.push(card);
        if (this.amHost) {
            this.addCardToPlayerHand(card, this.playerID);
        }
    };
    /**
     * Used to remove a card from the player's own hand, which also removes the card from the overall hands array if the player is the host
     * @param cardID - The ID of the card to remove
     * @param destroy - Whether or not to destroy the game object associated with that card
     */
    GameState.prototype.removeCardFromOwnHand = function (cardID, destroy) {
        if (destroy === void 0) { destroy = false; }
        var card = this.getCardByID(cardID, this.playerID).card;
        if (card) {
            card.inHand = false;
            this.myHand.cards = this.filterOutID(this.myHand.cards, card);
            if (destroy && card.gameObject) {
                card.gameObject.destroy();
                card.gameObject = null;
            }
            if (this.amHost) {
                this.removeCardFromPlayerHand(cardID, this.playerID);
            }
        }
    };
    /**
     * Used to add a card to the overall hands array, used by hosts
     * @param card - The card to add
     * @param playerID - The ID of the player whose hand is being added to
     */
    GameState.prototype.addCardToPlayerHand = function (card, playerID) {
        if (this.amHost) {
            var inserted = false;
            for (var i = 0; i < this._hands.length; i++) {
                if (this._hands[i].playerID === playerID) {
                    this._hands[i].cards.push(card);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) {
                this._hands.push(new hand_1["default"](playerID, [card]));
            }
            card.inHand = true;
            this.delay(this.saveToCache());
        }
    };
    /**
    * Used to remove a card to the overall hands array, used by hosts
    * @param card - The card to remove
    * @param playerID - The ID of the player whose hand is being removed from
    */
    GameState.prototype.removeCardFromPlayerHand = function (cardID, playerID) {
        if (this.amHost) {
            var card = this.getCardByID(cardID, playerID).card;
            if (card) {
                for (var i = 0; i < this._hands.length; i++) {
                    if (this._hands[i].playerID === playerID) {
                        this._hands[i].cards = this.filterOutID(this._hands[i].cards, card);
                        break;
                    }
                }
                card.inHand = false;
                this.delay(this.saveToCache());
            }
        }
    };
    /**
     * Used to retrieve a card from a deck
     * @param index - The index of the card in the deck that is wanted
     * @param deckID - The deck to retrieve the card from
     * @param removeOnRetrieve - Whether or not the card should be removed from the deck upon retrieval
     */
    GameState.prototype.getCardFromDeck = function (index, deckID, removeOnRetrieve) {
        if (removeOnRetrieve === void 0) { removeOnRetrieve = false; }
        var deck = this.getDeckByID(deckID);
        var card = deck.cards[index];
        if (deck && card) {
            if (removeOnRetrieve) {
                deck.cards = this.filterOutID(deck.cards, card);
                card.inDeck = false;
                this.delay(this.saveToCache());
            }
            card.x = deck.x;
            card.y = deck.y;
            return card;
        }
        else {
            return null;
        }
    };
    /**
     * Used to replace all the cards in a deck
     * @param cardList - The cards to replace the deck's cards with
     * @param deckID - The ID of the deck to have its cards replaced
     */
    GameState.prototype.replaceCardsInDeck = function (cardList, deckID) {
        var deck = this.getDeckByID(deckID);
        if (deck) {
            deck.cards = cardList;
            this.delay(this.saveToCache());
        }
    };
    /**
     * Used to check overlap of an object on hands and decks
     * @param id - The id of the object overlap is being checked for (card/deck)
     * @param playerID - The id of the player responsible for firing this check
     */
    GameState.prototype.checkForOverlap = function (id) {
        var cardLocationObject = this.getCardByID(id, this.playerID);
        var card = cardLocationObject === null || cardLocationObject === void 0 ? void 0 : cardLocationObject.card;
        var cardLocation = cardLocationObject === null || cardLocationObject === void 0 ? void 0 : cardLocationObject.location;
        var image = this.myHand.gameObject;
        if (card) {
            if (card.gameObject.x > image.x && card.gameObject.x < image.x + image.displayWidth && card.gameObject.y > image.y && card.gameObject.y < image.y + image.displayHeight) {
                if (cardLocation !== ECardLocation.MYHAND) {
                    this._cards = this.filterOutID(this._cards, card);
                    this.addCardToOwnHand(card);
                    return { overlapType: EOverlapType.HAND };
                }
                return { overlapType: EOverlapType.ALREADYINHAND };
            }
            else {
                for (var i = 0; i < this._decks.length; i++) {
                    image = this.decks[i].gameObject;
                    if (card.gameObject.x > image.x - image.displayWidth && card.gameObject.x < image.x + image.displayWidth && card.gameObject.y > image.y - image.displayHeight && card.gameObject.y < image.y + image.displayHeight) {
                        if (cardLocation === ECardLocation.MYHAND) {
                            this.removeCardFromOwnHand(card.id, true);
                        }
                        else if (cardLocation === ECardLocation.TABLE) {
                            this.removeCardFromTable(card.id, true);
                        }
                        this.addCardToDeck(card, this.decks[i].id);
                        return { overlapType: EOverlapType.DECK, deckID: this.decks[i].id };
                    }
                }
            }
            if (cardLocation === ECardLocation.MYHAND) {
                this.addCardToTable(card);
                this.removeCardFromOwnHand(card.id);
                return { overlapType: EOverlapType.TABLE, wasInHand: true };
            }
            else {
                this.delay(this.saveToCache());
                return { overlapType: EOverlapType.TABLE, wasInHand: false };
            }
        }
        else {
            var deck = this.getDeckByID(id);
            this.delay(this.saveToCache());
            return { overlapType: EOverlapType.TABLE };
        }
    };
    GameState.prototype.delay = function (func) {
        setTimeout(function () { func; }, 200);
    };
    /**
     * Used to get a card (and its location) by ID
     * @param id - The ID of the card to get
     * @param playerIDOfWhoActedOnCard - The id of the player who acted on the card
     * @param removeAndDestroyFromTable - Whether or not the card should be removed and have its image destroyed when found on the table
     * @param removeAndDestroyFromHand - Whether or not the card should be removed and have its image destroyed when found in a hand
     */
    GameState.prototype.getCardByID = function (id, playerIDOfWhoActedOnCard, removeAndDestroyFromTable, removeAndDestroyFromHand) {
        if (removeAndDestroyFromTable === void 0) { removeAndDestroyFromTable = false; }
        if (removeAndDestroyFromHand === void 0) { removeAndDestroyFromHand = false; }
        var found = false;
        var card = null;
        for (var i = 0; i < this._cards.length; i++) {
            if (this._cards[i].id === id) {
                card = this._cards[i];
                found = true;
                if (removeAndDestroyFromTable) {
                    this.removeCardFromTable(card.id, true);
                }
                return { card: card, location: ECardLocation.TABLE };
            }
        }
        if (!found) {
            for (var i = 0; i < this.myHand.cards.length; i++) {
                if (this.myHand.cards[i].id === id) {
                    card = this.myHand.cards[i];
                    found = true;
                    if (removeAndDestroyFromHand) {
                        card.inHand = false;
                        this.removeCardFromOwnHand(card.id, true);
                    }
                    return { card: card, location: ECardLocation.MYHAND };
                }
            }
        }
        if (!found && this.amHost) {
            for (var i = 0; i < this._hands.length; i++) {
                if (playerIDOfWhoActedOnCard === this._hands[i].playerID) {
                    for (var j = 0; j < this._hands[i].cards.length; j++) {
                        if (this._hands[i].cards[j].id === id) {
                            card = this._hands[i].cards[j];
                            if (removeAndDestroyFromHand) {
                                card.inHand = false;
                                this.removeCardFromPlayerHand(card.id, playerIDOfWhoActedOnCard);
                            }
                            return { card: card, location: ECardLocation.OTHERHAND };
                        }
                    }
                    break;
                }
            }
        }
        return null;
    };
    /**
     * Used to get a deck by ID
     * @param id - The ID of the deck to get
     */
    GameState.prototype.getDeckByID = function (id) {
        for (var i = 0; i < this.decks.length; i++) {
            if (this.decks[i].id === id) {
                return this.decks[i];
            }
        }
        return null;
    };
    /**
     * Used to clean up the game state, i.e. destroy all game objects and wipe all arrays
     */
    GameState.prototype.cleanUp = function () {
        this._cards.forEach(function (card) {
            var _a;
            (_a = card.gameObject) === null || _a === void 0 ? void 0 : _a.destroy();
        });
        this._cards = [];
        this._decks.forEach(function (deck) {
            var _a;
            (_a = deck.gameObject) === null || _a === void 0 ? void 0 : _a.destroy();
        });
        this._decks = [];
        this.myHand.cards.forEach(function (card) {
            var _a;
            (_a = card.gameObject) === null || _a === void 0 ? void 0 : _a.destroy();
        });
        this._hands = [];
        this.myHand.cards = [];
        this._counters = [];
    };
    /**
     * Used to handle data received from P2P connections
     */
    GameState.prototype.handleData = function (data, playspaceComponent) {
        var _this = this;
        var _a, _b;
        if (this.amHost && data.amHost) {
            // Error! Both parties claim to the be the host! Abort!
            console.log("Fatal error: both parties claim to be the host.");
            return;
        }
        switch (data.action) {
            // Received by the host after being sent by the player upon connection to the host, in which the player asks for the game state
            case EActionTypes.sendState:
                var playerID = data.playerID;
                if (!playerID) {
                    // They are new, generate a new ID for them
                    var playerIDArray_1 = [];
                    this.playerDataObjects.forEach(function (playerData) {
                        playerIDArray_1.push(playerData.id);
                    });
                    var i = 1;
                    while (playerIDArray_1.includes(i)) {
                        i++;
                    }
                    playerID = i; // Assign the player the first playerID that is not taken already
                }
                this.playerDataObjects.push(new playerData_1["default"](playerID, data.peerID));
                playspaceComponent.playerDataEmitter.emit(this.playerDataObjects);
                console.log("Sending state.");
                this.sendGameStateToPeers(data.peerID);
                break;
            case EActionTypes.replicateState:
                console.log("Received state.");
                var receivedGameState = data.extras.state;
                this.playerID = receivedGameState.playerID;
                this.cleanUp();
                receivedGameState.cardMins.forEach(function (cardMin) {
                    var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                    HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth);
                });
                receivedGameState.deckMins.forEach(function (deckMin) {
                    var deck = new deck_1["default"](deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
                    HelperFunctions.createDeck(deck, playspaceComponent, deckMin.depth);
                });
                receivedGameState.handMin.cardMins.forEach(function (cardMin) {
                    var card = new card_1["default"](cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, true);
                    HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth);
                });
                document.getElementById('loading').style.display = "none";
                document.getElementById('loadingText').style.display = "none";
                break;
            case EActionTypes.move:
                if (data.extras.type === EGameObjectType.CARD) {
                    var card = (_a = this.getCardByID(data.extras.id, data.playerID)) === null || _a === void 0 ? void 0 : _a.card;
                    if (card) {
                        card.x = data.extras.x;
                        card.y = data.extras.y;
                        if (card.gameObject) {
                            card.gameObject.setX(data.extras.x);
                            card.gameObject.setY(data.extras.y);
                            this.sendPeerData(EActionTypes.move, {
                                id: card.id,
                                type: card.type,
                                x: data.extras.x,
                                y: data.extras.y
                            }, [data.peerID]);
                        }
                    }
                }
                else if (data.extras.type === EGameObjectType.DECK) {
                    var deck = this.getDeckByID(data.extras.id);
                    if (deck) {
                        deck.x = data.extras.x;
                        deck.y = data.extras.y;
                        deck.gameObject.setX(data.extras.x);
                        deck.gameObject.setY(data.extras.y);
                        this.sendPeerData(EActionTypes.move, {
                            id: deck.id,
                            type: deck.type,
                            x: data.extras.x,
                            y: data.extras.y
                        }, [data.peerID]);
                    }
                }
                if (data.extras.finishedMoving) { // If they have finished moving a card/deck, save to cache
                    this.delay(this.saveToCache());
                }
                break;
            // The host receives this action, which was sent by a non-host requesting the top card of the deck
            case EActionTypes.retrieveTopCard:
                if (data.extras.type === EGameObjectType.CARD && this.amHost) {
                    var deck = this.getDeckByID(data.extras.deckID);
                    if (deck && deck.cards.length > 0) {
                        var card = this.getCardFromDeck(deck.cards.length - 1, deck.id, true);
                        card.x = data.extras.destination === HelperFunctions.EDestination.TABLE ? deck.x : playspaceComponent.gameState.myHand.gameObject.x + 150;
                        card.y = data.extras.destination === HelperFunctions.EDestination.TABLE ? deck.y : playspaceComponent.gameState.myHand.gameObject.y + 200;
                        if (data.extras.destination === HelperFunctions.EDestination.TABLE) {
                            HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE);
                        }
                        else if (data.extras.destination === HelperFunctions.EDestination.HAND) {
                            this.addCardToPlayerHand(card, data.playerID);
                        }
                        this.sendPeerData(EActionTypes.sendTopCard, {
                            cardID: card.id,
                            deckID: deck.id,
                            type: EGameObjectType.CARD,
                            x: card.x,
                            y: card.y,
                            imagePath: card.imagePath,
                            destination: data.extras.destination
                        }, [], data.extras.destination === HelperFunctions.EDestination.HAND ? [data.peerID] : []);
                    }
                }
                break;
            // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
            case EActionTypes.sendTopCard:
                if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
                    var deck = this.getDeckByID(data.extras.deckID);
                    if (deck) {
                        var card = new card_1["default"](data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y);
                        card.inDeck = false;
                        HelperFunctions.createCard(card, playspaceComponent, data.extras.destination);
                    }
                }
                break;
            // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
            case EActionTypes.insertIntoDeck:
                if (data.extras.type === EGameObjectType.CARD && this.amHost) {
                    var card = this.getCardByID(data.extras.cardID, data.playerID, true, true).card;
                    var deck = this.getDeckByID(data.extras.deckID);
                    if (card && deck) {
                        if (this.amHost) {
                            // If I am the host, tell everyone else that this card was inserted
                            // Assuming they can actually see the card all ready -- if it was in the person's hand, no point in telling them
                            this.sendPeerData(EActionTypes.insertIntoDeck, {
                                cardID: card.id,
                                deckID: deck.id,
                                type: EGameObjectType.CARD,
                                x: card.x,
                                y: card.y,
                                imagePath: card.imagePath
                            }, [data.peerID]);
                        }
                        this.addCardToDeck(card, deck.id);
                    }
                }
                else if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
                    // If I am not the host and someone inserts a card into the deck, completely remove all reference to it
                    // Passing in true, true means that even though the card object is returned, it is destroyed
                    this.getCardByID(data.extras.cardID, data.playerID, true, true);
                }
                break;
            // Anyone can receive this action, which is sent by someone who inserts a card into their hand
            case EActionTypes.insertIntoHand:
                // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
                if (data.extras.type === EGameObjectType.CARD) {
                    var card = this.getCardByID(data.extras.cardID, data.playerID, true, true).card;
                    if (card) {
                        if (this.amHost) {
                            // If I am the host, first we will tell any other players that the action occured
                            this.sendPeerData(EActionTypes.insertIntoHand, {
                                cardID: card.id,
                                type: EGameObjectType.CARD
                            }, [data.peerID]);
                            // Then, add it to the appropriate player's hand in the game state (will only actually take effect if host)
                            this.addCardToPlayerHand(card, data.playerID);
                        }
                    }
                }
                break;
            // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a deck)
            case EActionTypes.removeFromHand:
                if (data.extras.type === EGameObjectType.CARD) {
                    var card = null;
                    if (this.amHost) {
                        // Card already exists if I'm the host, since I know everyone's hands
                        card = this.getCardByID(data.extras.cardID, data.playerID, true, true).card;
                        card.x = data.extras.x;
                        card.y = data.extras.y;
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE);
                        // Tell other possible peers that this card was removed from a hand
                        this.sendPeerData(EActionTypes.removeFromHand, {
                            cardID: card.id,
                            type: EGameObjectType.CARD,
                            imagePath: card.imagePath,
                            x: card.x,
                            y: card.y
                        }, [data.peerID]);
                    }
                    else {
                        card = new card_1["default"](data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y);
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE);
                    }
                }
                break;
            case EActionTypes.importDeck:
                if (data.extras.type === EGameObjectType.DECK && this.amHost) {
                    var deck_2 = this.getDeckByID(data.extras.deckID);
                    if (deck_2) {
                        var imagePaths = data.extras.imagePaths;
                        imagePaths.forEach(function (imagePath) {
                            _this.addCardToDeck(new card_1["default"](playspaceComponent.highestID++, imagePath, deck_2.gameObject.x, deck_2.gameObject.y), deck_2.id);
                        });
                    }
                }
                break;
            case EActionTypes.updateRenderOrder:
                var object = null;
                if (data.extras.type === EGameObjectType.CARD) {
                    object = (_b = this.getCardByID(data.extras.id, data.playerID)) === null || _b === void 0 ? void 0 : _b.card;
                }
                else if (data.extras.type === EGameObjectType.DECK) {
                    object = this.getDeckByID(data.extras.id);
                }
                if (object) {
                    this.highestDepth = data.extras.highestDepth;
                    object.gameObject.setDepth(this.highestDepth);
                }
                if (this.amHost) {
                    playspaceComponent.gameState.sendPeerData(EActionTypes.updateRenderOrder, {
                        id: object.id,
                        type: object.type,
                        highestDepth: playspaceComponent.gameState.highestDepth
                    }, [data.peerID]);
                }
            default:
                console.log('Received action did not match any existing action.');
                break;
        }
    };
    return GameState;
}());
exports["default"] = GameState;
