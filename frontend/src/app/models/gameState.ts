import Card from './card';
import Deck from './deck';
import Hand from './hand';
import Counter from './counter';
import CachedGameState from './cachedGameState'
import SavedGameState from './savedGameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import * as HF from '../helper-functions';
import * as SA from '../actions/sharedActions';
import * as DA from '../actions/deckActions';
import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import SentGameState from './sentGameState';
import PlayerData from './playerData';
import { EventEmitter, OnInit } from '@angular/core';
import { ECounterActions, CounterActionObject } from '../counter/counter.component';

/**
 * An enum representing all types of actions
 * TODO: Move all references to these strings over to enums
 */
export enum EActionTypes {
    replicateState = "replicateState",
    sendState = "sendState",
    move = "move",
    insertIntoDeck = "insertIntoDeck",
    insertIntoHand = "insertIntoHand",
    retrieveTopCard = "retrieveTopCard",
    sendTopCard = "sendTopCard",
    removeFromHand = "removeFromHand",
    importDeck = "importDeck",
    updateRenderOrder = "updateRenderOrder",
    flipCard = "flipCard",
    shuffleDeck = "shuffleDeck",
    confirmUndo = "confirmUndo"
}

/**
 * An enum representing the types of all game objects
 */
export enum EGameObjectType {
    CARD = "card",
    DECK = "deck",
    HAND = "hand"
}

/**
 * A class representing all the required and extra data be used to form a request to another peer, such as the action being taken
 */
class GameObjectProperties {
    amHost: boolean;
    action: string;
    peerID: string;
    playerID: number;
    extras: GameObjectExtraProperties;

    constructor(amHost: boolean, action: string, peerID: string, playerID: number, extras: GameObjectExtraProperties) {
        this.amHost = amHost;
        this.action = action;
        this.peerID = peerID;
        this.playerID = playerID;
        this.extras = extras;
    }
}


/**
 * A class representing all extra data that COULD (NOT "will") be used to form a request to another peer, such as the location of a card
 * The reason this class is being used is strictly to make it easier to visualize what is usually passed as data
 */
export class GameObjectExtraProperties {
    state?: SentGameState;
    type?: string;
    id?: number;
    cardID?: number;
    deckID?: number;
    x?: number;
    y?: number;
    imagePath?: string;
    imagePaths? : string[];
    finishedMoving?: boolean;
    destination?: HF.EDestination;
    highestDepth?: number;
    flippedOver?: boolean;
    undo?: boolean;
}

/**
 * Used when getting a card by ID to grab both the card and the location it was grabbed from
 */
export class CardLocationObject {
    card: Card;
    location: ECardLocation;
}

/**
 * Used when handling overlap to return both the type of overlap (what the card overlapped with) and any additional needed information (such as the ID of the deck overlapped with)
 */
export class OverlapObject {
    overlapType: EOverlapType;
    deckID?: number;
    wasInHand?: boolean;
}

/**
 * An enum representing all the possible locations a card could be in
 */
export enum ECardLocation {
    NONE,
    TABLE,
    DECK,
    MYHAND,
    OTHERHAND
}

/**
 * An enum representing all the possible objects a card could overlap with 
 */
export enum EOverlapType {
    TABLE,
    HAND,
    ALREADYINHAND,
    DECK
}

/**
 * The game state class, which is responsible for holding the current state of the game
 */
export default class GameState {

    /**
     * Whether caching of the game state is enabled
     */
    private cachingEnabled: boolean = false;

    /**
     * A history of saved game states to allow for undoing
     */
     private gameStateHistory: CachedGameState[] = [];

    /**
     * Controls the maximum number of game states that can be cahced
     */
    private maxNumOfCachedStates: number = 100;

    /**
     * Because of how actions are set up, it is possible that a single action could involve 2 writes to the cache: for example, removing a card from a deck and then adding it to the table
     * In this scenario, we do not want the game state history to record the "in between" move -- removing the card from the deck
     * Thus, if multiple saves are called within a very short period of time, we can be sure that it was because of the code and not because of a player, and thus we'll only save the final state out of the batch of save calls
     */
    private batchStateHistory: CachedGameState[] = [];

    /**
     * The amount of time to wait for another save call before saving in milliseconds
     */
    private batchStateWaitTime: number = 200;

    /**
     * The current cached game state
     */
    private currentMove: CachedGameState;

    /**
     * A timer function used to control the batches of game states
     */
    private timerFunc: NodeJS.Timer;

    /**
     * Holds all cards on the table
     */
    private _cards: Card[];

    /**
     * Holds all decks on the table
     */
    private _decks: Deck[];

    /**
     * Holds all hand information for all players (host only)
     */
    private _hands: Hand[];

    /**
     * Holds all counters in the game instance
     */
    private _counters: Counter[];

    /**
     * A boolean representing whether this player is the host, used to control branching paths
     */
    private amHost: boolean = false;

    /**
     * Will contain the peerIDs of people who we are waiting on receiving a confirmation from
     * The way undos will work is that if the host undos, they cannot undo again until they receive confirmation from all other parties that the undo succeeded
     * If they do not receive confirmation from someone on the list after X amount of time, they will check if that person still exists in the connection list
     * If they still exist in the host's connection list, the host will resend the confirmation request up to a max of 3 times; after that, the host will forcefully close the other player's connection
     */
    private undoRequests: DataConnection[] = [];

    /**
     * The number of times an undo request has been sent without receiving full confirmations
     */
    private undoRequestCount: number = 0;
    
    /**
     * A timer function used to check in on the status of undo confirmations
     */
    private undoCheckInInterval: any;

    /**
     * If an undo is in progress (i.e. the host is waiting for confirmation from all parties that it succeeded)
     */
    public undoInProgress: boolean = false;

    /**
     * Holds information about this player's hand only
     */
    public myHand: Hand;

    /**
     * A public accessor to get all cards
     */
    public get cards(): Card[] {
        return this._cards;
    }

    /**
     * A public accessor to get all decks
     */
    public get decks(): Deck[] {
        return this._decks;
    }

    /**
     * A public accessor to get all hands
     */
    public get hands(): Hand[] {
        return this._hands;
    }

    /**
     * A public accessor to get all counters
     */
    public get counters(): Counter[] {
        return this._counters;
    }

    /**
     * My player ID
     */
    public playerID: number = null;

    /**
     * My peer ID
     */
    public myPeerID: string;

    /**
     * A list of player data objects that links peer IDs to player IDs to usernames
     */
    public playerDataObjects: PlayerData[] = [];

    /**
     * A list of connections that all game information will be sent to
     */
    public connections: DataConnection[] = [];

    /**
     * The highest z-index of any element
     */
    public highestDepth: number = 0;

    /**
     * The number of moves that have been made, used to ensure that we don't ask the player to pull a game from the cache if it's one with no moves
     */
    public numCachedMoves: number = 0;

    /**
     * ======================================
     * Game State Creation & Removal
     * ======================================
     */

    /**
     * The constructor for the game state
     * @param cards - The cards to add to the table at initialization time
     * @param decks - The decks to add to the table at initialization time
     * @param hands - The hand information to record at initialization time
     * @param counters - The counter information to record at initialization time
     */
    constructor(cards: Card[], decks: Deck[], hands: Hand[], counters: Counter[]) {
        this._cards = cards;
        this._decks = decks;
        this._hands = hands;
        this.myHand = new Hand(null, []);
        this._counters = counters;
    }

    /**
     * Used to clean up the game state, i.e. destroy all game objects and wipe all arrays
     */
    public cleanUp(): void {
        this._cards.forEach((card: Card) => {
            card.gameObject?.destroy();
        });
        this._cards = [];
        this._decks.forEach((deck: Deck) => {
            deck.gameObject?.destroy();
        });
        this._decks = [];
        this.myHand.cards.forEach((card: Card) => {
            card.gameObject?.destroy();
        });
        this._hands = [];
        this.myHand.cards = [];
        this._counters = [];
    }

    /**
     * ======================================
     * Helper Functions
     * ======================================
     */

    /**
     * Used to filter objects out of an object list that match an ID
     * @param objectListToFilter - The list to remove objects from
     * @param object - The object to be removed by ID
     */
    private filterOutID(objectListToFilter: any[], object: any): any[] {
        objectListToFilter = objectListToFilter.filter( (refObject: any) => {
            return object.id !== refObject.id;
        });

        this.delay(this.saveToCache());
        return objectListToFilter;
    }

    /**
     * Used to filter peers out of a peer connection list
     * @param connectionListToFilter - The connection list to remove connections from
     * @param connection - The connection to be removed
     */
    filterOutPeer(connectionListToFilter: DataConnection[], connection: DataConnection): DataConnection[] {
        return connectionListToFilter.filter( (refConnection: DataConnection) => {
          return connection.peer !== refConnection.peer;
        });
    }

    /**
     * ======================================
     * Host Information
     * ======================================
     */

    /**
     * A method used to set yourself as the host, taking care of anything required to make this happen
     * @param amHost - Whether or not I am the host
     */
    public setAmHost(amHost: boolean, amHostEmitter: EventEmitter<boolean>, username: string = null): void {
        if (amHost) {
            this.amHost = true;
            this.playerID = 1;
            this.playerDataObjects.push(new PlayerData(this.playerID, this.myPeerID, username));
            amHostEmitter.emit(true);
        } else {

        }
    }

    /**
     * A method used to check whether or not you are the host
     */
    public getAmHost(): boolean {
        return this.amHost;
    }

    /**
     * ======================================
     * Saving & Caching
     * ======================================
     */

     /**
      * Used to delay function execution by a certain amount of time
      * @param func - The function to delay execution of
      */
    public delay(func: void) {
        setTimeout(() => { func }, 200);
    }

    /**
     * A method used by the game state and external methods to enable/disable caching
     */
    public setCachingEnabled(enable: boolean) {
        this.cachingEnabled = enable;
    }

    /**
     * Used to save the current game state to the user's local storage
     */
    public saveToCache(): void {
        if (this.cachingEnabled && this.amHost) {
            this.numCachedMoves++;
            const cachedGameState = new CachedGameState(this);
            localStorage.setItem('cachedGameState', JSON.stringify(cachedGameState)); 
            this.batchStateHistory.push(cachedGameState);
            clearTimeout(this.timerFunc);
            this.timerFunc = setTimeout(this.cacheGameHistory.bind(this), this.batchStateWaitTime);
        }
    }

    /**
    * Used to cache the "entire" game state history (right now up to 10 moves)
     */
    private cacheGameHistory(): void  {
        this.currentMove = this.batchStateHistory.pop();
        this.batchStateHistory = [];
        if (this.currentMove != null || this.currentMove != undefined){
            this.gameStateHistory.push(this.currentMove);
            if (this.gameStateHistory.length > this.maxNumOfCachedStates) {
                this.gameStateHistory.shift();
            }
            localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
        }
    }

    /**
     * A method to clear the cache of the cached game state
     */
    public clearCache(): void {
        localStorage.removeItem('cachedGameState');
        this.gameStateHistory.push(new CachedGameState(this));
        localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
    }

    /**
     * A method used to check the status of undo confirmations, and resend replicate state requests if necessary
     */
    private checkUndoConfirmations(): void {
        if (this.undoRequests.length > 0) {
            this.undoRequestCount++;
            if (this.undoRequestCount >= 3) {
                clearInterval(this.undoCheckInInterval);
                this.undoRequests.forEach((connection: DataConnection) => {
                    connection.close();
                    this.filterOutPeer(this.connections, connection);
                });
                this.undoRequests = [];
                this.undoInProgress = false;
            }
        } else {
            clearInterval(this.undoCheckInInterval);
        }
    }

    /**
     * Taking in a minified game state of type CachedGameState or SavedGameState, this method updates the current game state to match it
     * @param gameStateMin - The minified game state being taken in
     * @param playspaceComponent - The playspace component reference
     * @param undo - The number of undos, if applicable
     */
    public buildGame(gameStateMin: CachedGameState | SavedGameState, playspaceComponent: PlayspaceComponent, undo?: number): void {
        this.setCachingEnabled(false);

        this.cleanUp();
        let highestDepth: number = 0;

        gameStateMin.cardMins.forEach((cardMin: CardMin) => {
            const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver);
            HF.createCard(card, playspaceComponent, HF.EDestination.TABLE, cardMin.depth);
            if (cardMin.depth > highestDepth) {
                highestDepth = cardMin.depth;
            }
        });
        gameStateMin.deckMins.forEach((deckMin: DeckMin) => {
            let cardList: Card[] = [];
            deckMin.cardMins.forEach((cardMin: CardMin) => {
                cardList.push(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver));
            });
            const deck: Deck = new Deck(deckMin.id, deckMin.imagePath, cardList, deckMin.x, deckMin.y);
            HF.createDeck(deck, playspaceComponent, deckMin.depth);
            if (deckMin.depth > highestDepth) {
                highestDepth = deckMin.depth;
            }
        });
        for (let i = 0; i < gameStateMin.handMins.length; i++) {
            gameStateMin.handMins[i].cardMins.forEach((cardMin: CardMin) => {
                if (gameStateMin.handMins[i].playerID === this.playerID) {
                    const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver);
                    HF.createCard(card, playspaceComponent, HF.EDestination.HAND, cardMin.depth);
                } else {
                    this.addCardToPlayerHand(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver), gameStateMin.handMins[i].playerID);
                }
                if (cardMin.depth > highestDepth) {
                    highestDepth = cardMin.depth;
                }
            });
        }
        this.replaceCounters(gameStateMin.counters, playspaceComponent.counterActionOutputEmitter);
    
        this.highestDepth = highestDepth;
        this.sendGameStateToPeers(undo > 0 ? true : false);
        this.currentMove = new CachedGameState(this);     

        this.setCachingEnabled(true);

        if (!undo) {
            this.delay(this.saveToCache());
        }
    }

    /**
     * A method to build the game state from the cache
     * @param playspaceComponent - A reference to the playspace component, needed to create the cards and decks
     * @param initialBuild - If this is the very first time we're building from the cache in this browser session
     * @param undo - The number of times undo has been called
     */
    public buildGameFromCache(playspaceComponent: PlayspaceComponent, initialBuild: boolean, undo: number = 0): void {
        if (this.amHost) {
            const cache = {gamestate: null};
            if (undo > 0) {
                this.gameStateHistory = JSON.parse(localStorage.getItem('gameStateHistory'));
          
                for(let i: number = 0; i < undo; i++) {
                    if (this.gameStateHistory.length > 1) {
                        this.gameStateHistory.pop();
                        cache.gamestate = this.gameStateHistory[this.gameStateHistory.length - 1];
                        this.undoInProgress = true;
                        this.undoRequests = this.connections;
                        clearInterval(this.undoCheckInInterval);
                        if (this.undoRequests.length > 0) {
                            this.undoCheckInInterval = setInterval(this.checkUndoConfirmations.bind(this), 200);
                        } else {
                            this.undoInProgress = false;
                        }
                    }
                }

                if (cache.gamestate) {
                    localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
                    localStorage.setItem('cachedGameState', JSON.stringify(cache.gamestate));
                }
            } else {
                cache.gamestate = JSON.parse(localStorage.getItem('cachedGameState'));
                if (initialBuild) {
                    this.gameStateHistory.push(cache.gamestate);
                    localStorage.setItem('gameStateHistory', JSON.stringify(this.gameStateHistory));
                }
            }
            if (cache.gamestate != null) {
                this.buildGame(cache.gamestate, playspaceComponent, undo);
            }            
        }        
    }

    /**
     * A method to build the game state from a saved game state
     * @param savedGameState - The saved game state to build from
     * @param playspaceComponent - A reference to the playspace component, needed to create cards and decks
     */
    public buildGameStateFromSavedState(savedGameState: SavedGameState, playspaceComponent: PlayspaceComponent): void {
        this.buildGame(savedGameState, playspaceComponent);
    }

    /**
     * ======================================
     * Game Objects - Addition
     * ======================================
     */    

    /**
     * Used to add a card to the table
     * @param card - The card to add
     */
    public addCardToTable(card: Card): void {
        this._cards.push(card);
        this.delay(this.saveToCache());
    }

    /**
     * Used to add a card to a deck
     * @param card - The card to add
     * @param deckID - The ID of the deck to add to
     */
    public addCardToDeck(card: Card, deckID: number): void {
        let deck: Deck = this.getDeckByID(deckID);
    
        if (deck) {
            card.inDeck = true;

            if (this.amHost) {
                deck.cards.push(card);
            }
        }

        this.delay(this.saveToCache());
    }

    /**
     * Used to add a deck to the table
     * @param deck - The deck to add
     */
    public addDeckToTable(deck: Deck): void {
        this._decks.push(deck);
        this.delay(this.saveToCache());
    }

    /**
     * Used to add a card to the player's own hand, which also adds the card to the overall hands array if the player is the host
     * @param card - The card to add
     * @param playerID - The ID of the player adding it
     */
    public addCardToOwnHand(card: Card): void {
        card.inHand = true;
        this.myHand.cards.push(card);

        if (this.amHost) {
            this.addCardToPlayerHand(card, this.playerID);
        }
    }

    /**
     * Used to add a card to the overall hands array, used by hosts
     * @param card - The card to add
     * @param playerID - The ID of the player whose hand is being added to
     */
    public addCardToPlayerHand(card: Card, playerID: number): void {
        if (this.amHost) {
            let inserted: boolean = false;

            for (let i: number = 0; i < this._hands.length; i++) {
                if (this._hands[i].playerID === playerID) {
                    this._hands[i].cards.push(card);
                    inserted = true;
                    break;
                }
            }
    
            if (!inserted) {
                this._hands.push(new Hand(playerID, [card]));
            }

            card.inHand = true;
    
            this.delay(this.saveToCache());
        }
    }

    /**
     * Used to add a counter to the overall counters array
     * @param counter - The counter to add
     */
    public addCounter(counter: Counter): void {
        this._counters.push(counter);
        this.delay(this.saveToCache());
    }

    /**
     * ======================================
     * Game Objects - Removal
     * ======================================
     */  

    /**
     * Used to remove a card fom the table
     * @param cardID - The ID of the card to remove
     * @param destroy - Whether or not to destroy the game object associated with the card
     */
    public removeCardFromTable(cardID: number, destroy: boolean = false): void {
        const card: Card = this.getCardByID(cardID, this.playerID).card;

        if (card) {
            this._cards = this.filterOutID(this._cards, card);

            if (destroy && card.gameObject) {
                card.gameObject.destroy();
                card.gameObject = null;
            }

            this.delay(this.saveToCache());
        }
    }

    /**
     * Used to remove a card from the player's own hand, which also removes the card from the overall hands array if the player is the host
     * @param cardID - The ID of the card to remove
     * @param destroy - Whether or not to destroy the game object associated with that card
     */
    public removeCardFromOwnHand(cardID: number, destroy: boolean = false): void {
        const card: Card = this.getCardByID(cardID, this.playerID).card;

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
    }

    
    /**
     * Used to remove a card to the overall hands array, used by hosts
     * @param card - The card to remove
     * @param playerID - The ID of the player whose hand is being removed from
     */
    public removeCardFromPlayerHand(cardID: number, playerID: number): void {
        if (this.amHost) {
            const card: Card = this.getCardByID(cardID, playerID).card;

            if (card) {
                for (let i: number = 0; i < this._hands.length; i++) {
                    if (this._hands[i].playerID === playerID) {
                        this._hands[i].cards = this.filterOutID(this._hands[i].cards, card);
                        break;
                    }
                } 
    
                card.inHand = false;
        
                this.delay(this.saveToCache());
            }
        }
    }

    /**
     * Used to remove a counter
     * @param counter - The counter to remove
     */
    public removeCounter(counter: Counter) {
        this._counters = this.filterOutID(this._counters, counter);
    }

    /**
     * ======================================
     * Game Objects - Retrieval
     * ======================================
     */ 

    /**
     * Used to retrieve a card from a deck
     * @param index - The index of the card in the deck that is wanted
     * @param deckID - The deck to retrieve the card from
     * @param removeOnRetrieve - Whether or not the card should be removed from the deck upon retrieval
     */
    public getCardFromDeck(index: number, deckID: number, removeOnRetrieve: boolean = false): Card {
        const deck: Deck = this.getDeckByID(deckID);
        const card: Card = deck.cards[index];

        if (deck && card) {
            if (removeOnRetrieve) {
                deck.cards = this.filterOutID(deck.cards, card);
                card.inDeck = false;

                this.delay(this.saveToCache());
            }
            card.x = deck.x;
            card.y = deck.y;
            return card;
        } else {
            return null;
        }
    }
 
    /**
     * Used to get a card (and its location) by ID
     * @param id - The ID of the card to get
     * @param playerIDOfWhoActedOnCard - The id of the player who acted on the card
     * @param removeAndDestroyFromTable - Whether or not the card should be removed and have its image destroyed when found on the table
     * @param removeAndDestroyFromHand - Whether or not the card should be removed and have its image destroyed when found in a hand
     */
    public getCardByID(id: number, playerIDOfWhoActedOnCard: number, removeAndDestroyFromTable: boolean = false, removeAndDestroyFromHand: boolean = false): CardLocationObject {
        let found: boolean = false;
        let card: Card = null;

        for (let i = 0; i < this._cards.length; i++) {
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
            for (let i = 0; i < this.myHand.cards.length; i++) {
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
            for (let i = 0; i < this._hands.length; i++) {
                if (playerIDOfWhoActedOnCard === this._hands[i].playerID) {
                    for (let j = 0; j < this._hands[i].cards.length; j++) {
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
    }

    /**
     * Used to get a deck by ID
     * @param id - The ID of the deck to get
     */
    public getDeckByID(id: number): Deck {
        for (let i = 0; i < this.decks.length; i++) {
            if (this.decks[i].id === id) {
                return this.decks[i];
            }
        }
        return null;
    }

    /**
     * Used to check overlap of an object on hands and decks
     * @param id - The id of the object overlap is being checked for (card/deck)
     * @param playerID - The id of the player responsible for firing this check
     */
    public checkForOverlap(id: number): OverlapObject {
        const cardLocationObject: CardLocationObject = this.getCardByID(id, this.playerID);
        const card: Card = cardLocationObject?.card;
        const cardLocation: ECardLocation = cardLocationObject?.location;
        let image: Phaser.GameObjects.Image = this.myHand.gameObject;

        if (card) {
            if (card.gameObject.x > image.x && card.gameObject.x < image.x + image.displayWidth && card.gameObject.y > image.y && card.gameObject.y < image.y + image.displayHeight) {
                if (cardLocation !== ECardLocation.MYHAND) {
                    this._cards = this.filterOutID(this._cards, card);
                    this.addCardToOwnHand(card);
                    return { overlapType: EOverlapType.HAND };
                }
                this.delay(this.saveToCache());
                return { overlapType: EOverlapType.ALREADYINHAND };
            } else {
                for (let i: number = 0; i < this._decks.length; i++) {
                    image = this.decks[i].gameObject;

                    if (card.gameObject.x > image.x - image.displayWidth && card.gameObject.x < image.x + image.displayWidth && card.gameObject.y > image.y - image.displayHeight && card.gameObject.y < image.y + image.displayHeight) {
                        if (cardLocation === ECardLocation.MYHAND) {
                            this.removeCardFromOwnHand(card.id, true);
                        } else if (cardLocation === ECardLocation.TABLE) {
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
            } else {
                this.delay(this.saveToCache());
                return { overlapType: EOverlapType.TABLE, wasInHand: false };
            }
        } else {
            const deck: Deck = this.getDeckByID(id);
            this.delay(this.saveToCache());

            return { overlapType: EOverlapType.TABLE };
        }
    }

    /**
     * Used to get a counter by its ID
     * @param counterID - The ID to get the counter by
     */
    public getCounterByID(counterID: number) {
        for (let i: number = 0; i < this._counters.length; i++) {
            if (counterID === this._counters[i].id) {
                return this._counters[i];
            }
        }
    }

    /**
     * ======================================
     * Game Objects - Modification
     * ======================================
     */ 

    /**
     * Used to replace all the cards in a deck
     * @param cardList - The cards to replace the deck's cards with
     * @param deckID - The ID of the deck to have its cards replaced
     */
    public replaceCardsInDeck(cardList: Card[], deckID: number): void {
        const deck: Deck = this.getDeckByID(deckID);
        
        if (deck) {
            deck.cards = cardList;
            this.delay(this.saveToCache());
        }
    }

    /**
     * Used to replace existing counters with the current counters
     * @param counters - The counters to replace the current ones with
     * @param eventEmitter - The 
     */
    public replaceCounters(counters: Counter[], eventEmitter: EventEmitter<CounterActionObject>): void {
        this._counters = counters;
        this.delay(this.saveToCache());
        eventEmitter.emit({ counterAction: ECounterActions.replaceCounters, counters: [...this._counters] });
    }

    /**
     * Used to change a counter's value
     * @param counter - The ID of the counter to change
     */
    public changeCounterValue(counter: Counter): void {
        const retrievedCounter: Counter = this.getCounterByID(counter.id);
        retrievedCounter.value = counter.value;
        retrievedCounter.minValue = counter.minValue;
        retrievedCounter.maxValue = counter.maxValue;
        this.delay(this.saveToCache());
    }

    /**
     * Used to flip a card
     * @param cardID - The ID of the card to flip
     */
    public flipCard(cardID: number): void {
        const card: Card = this.getCardByID(cardID, this.playerID).card;

        if (card) {
            if (card.flippedOver) {
                card.gameObject.setTexture(card.imagePath);
            } else {
                card.gameObject.setTexture('flipped-card');
            }
            card.gameObject.setDisplaySize(100, 150);
            // Hit area MUST be set to the texture size (NOT display size), which will equate to the width and height of the game object after the texture is loaded
            card.gameObject.input.hitArea.setTo(0, 0, card.gameObject.width, card.gameObject.height);
            card.flippedOver = !card.flippedOver;

            this.delay(this.saveToCache());

            if (!(this.amHost && card.inHand)) {
                this.sendPeerData(
                    EActionTypes.flipCard,
                    {
                        cardID: cardID,
                        flippedOver: card.flippedOver
                    }
                );
            }
        }
    }
    
    /**
     * ======================================
     * Peer-to-Peer Connection
     * ======================================
     */ 

    /**
     * Used to send data to peer(s)
     * @param action - The action to perform
     * @param extras - An array of extra game object properties that the user wants to include
     * @param doNotSendTo - a list of peerIDs not to send the data to
     */
    public sendPeerData(action: string, extras: GameObjectExtraProperties = {}, doNotSendTo: string[] = [], onlySendTo: string[] = []): void {
        this.connections.forEach((connection: DataConnection) => {
            if (onlySendTo.length > 0) {
                if (onlySendTo.includes(connection.peer)) {
                    connection.send(new GameObjectProperties(this.amHost, action, this.myPeerID, this.playerID, extras));
                }
            } else if (!doNotSendTo.includes(connection.peer)) {
                connection.send(new GameObjectProperties(this.amHost, action, this.myPeerID, this.playerID, extras));
            }
        });
    }

    /**
     * Used to very quickly and easily send the current game state to all peers
     * @param onlySendTo - An optional var specifying to only send data to a specific peer
     * @param doNotSendTo - An optional var specfying not to send data to a specific peer
     */
    public sendGameStateToPeers(undo: boolean = false, onlySendTo: string = "", doNotSendTo: string = ""): void {
        if (this.amHost) {
            // TODO: Make sentGameState from current gameState and send to all peers
            this.playerDataObjects.forEach((playerData: PlayerData) => {
                for (let i: number = 0; i < this.connections.length; i++) {
                    if (playerData.peerID === this.connections[i].peer) {
                        if (((onlySendTo !== "" && onlySendTo === playerData.peerID) || onlySendTo === "") && (doNotSendTo === "" || (doNotSendTo !== playerData.peerID))) {
                            let sentGameState: SentGameState = new SentGameState(this, playerData.id);
                            this.connections[i].send(new GameObjectProperties(this.amHost, EActionTypes.replicateState, this.myPeerID, this.playerID, { 'state': sentGameState, 'undo': undo }));
                            break; 
                        }
                    }
                }
            });
        }
    }

    /**
     * Used to handle data received from P2P connections (primarily carrying out requested actions)
     * @param data - An object that holds all the data needed to handle the requested action
     * @param playspaceComponent - A reference to the playspace component
     */
    handleData(data: GameObjectProperties, playspaceComponent: PlayspaceComponent): void {
        if (this.amHost && data.amHost) {
          // Error! Both parties claim to the be the host! Abort!
          console.log("Fatal error: both parties claim to be the host.");
          return;
        }
    
        switch (data.action) {
    
            // Received by the host after being sent by the player upon connection to the host, in which the player asks for the game state
            case EActionTypes.sendState:
                let playerID = data.playerID;
                if (!playerID) {
                // They are new, generate a new ID for them
                let playerIDArray: number[] = [];
        
                this.playerDataObjects.forEach((playerData) => {
                    playerIDArray.push(playerData.id);
                });
        
                let i: number = 1;
                while (playerIDArray.includes(i)) {
                    i++; 
                }
                playerID = i; // Assign the player the first playerID that is not taken already
                }
        
                this.playerDataObjects.push(new PlayerData(playerID, data.peerID));
                playspaceComponent.playerDataEmitter.emit(this.playerDataObjects);
        
                console.log("Sending state.");
                this.sendGameStateToPeers(false, data.peerID);
        
                break;
        
            case EActionTypes.replicateState:
                console.log("Received state.");
                if (data.extras.undo) {
                    this.sendPeerData(EActionTypes.confirmUndo);
                }

                const receivedGameState: SentGameState = data.extras.state;
                this.playerID = receivedGameState.playerID;
        
                this.cleanUp();
        
                receivedGameState.cardMins.forEach((cardMin: CardMin) => {
                    let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver);
                    HF.createCard(card, playspaceComponent, HF.EDestination.TABLE, cardMin.depth);
                });
                receivedGameState.deckMins.forEach((deckMin: DeckMin) => {
                    let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
                    HF.createDeck(deck, playspaceComponent, deckMin.depth);
                });
                receivedGameState.handMin.cardMins.forEach((cardMin: CardMin) => {
                    let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver, true);
                    HF.createCard(card, playspaceComponent, HF.EDestination.HAND, cardMin.depth);
                });
        
                document.getElementById('loading').style.display = "none";
                document.getElementById('loadingText').style.display = "none";
                break;
        
            case EActionTypes.move:
                if (data.extras.type === EGameObjectType.CARD) {
                
                let card: Card = this.getCardByID(data.extras.id, data.playerID)?.card;
        
                if (card) {
                    card.x = data.extras.x;
                    card.y = data.extras.y;
                    if (card.gameObject) { 
                    card.gameObject.setX(data.extras.x);
                    card.gameObject.setY(data.extras.y);
                    this.sendPeerData(
                        EActionTypes.move,
                        {
                            id: card.id,
                            type: card.type,
                            x: data.extras.x,
                            y: data.extras.y
                        },
                        [data.peerID]
                        );
                    }
                }
                } else if (data.extras.type === EGameObjectType.DECK) {
                let deck: Deck = this.getDeckByID(data.extras.id);
        
                if (deck) {
                    deck.x = data.extras.x;
                    deck.y = data.extras.y;
                    deck.gameObject.setX(data.extras.x);
                    deck.gameObject.setY(data.extras.y);
        
                    this.sendPeerData(
                    EActionTypes.move,
                    {
                        id: deck.id,
                        type: deck.type,
                        x: data.extras.x,
                        y: data.extras.y
                    },
                    [data.peerID]
                    );
                }
                }
        
                if (data.extras.finishedMoving) { // If they have finished moving a card/deck, save to cache
                    this.delay(this.saveToCache());
                }
                break;
        
            // The host receives this action, which was sent by a non-host requesting the top card of the deck
            case EActionTypes.retrieveTopCard:
                if (data.extras.type === EGameObjectType.CARD && this.amHost) {
                let deck: Deck = this.getDeckByID(data.extras.deckID);
        
                if (deck && deck.cards.length > 0) {
                    let card: Card = this.getCardFromDeck(deck.cards.length - 1, deck.id, true);
                    card.x = data.extras.destination === HF.EDestination.TABLE ? deck.x : playspaceComponent.gameState.myHand.gameObject.x + 150;
                    card.y = data.extras.destination === HF.EDestination.TABLE ? deck.y : playspaceComponent.gameState.myHand.gameObject.y + 200;
        
                    if (data.extras.destination === HF.EDestination.TABLE) {
                        HF.createCard(card, playspaceComponent, HF.EDestination.TABLE);
                    } else if (data.extras.destination === HF.EDestination.HAND) {
                        this.addCardToPlayerHand(card, data.playerID);
                    }
        
                    this.sendPeerData(
                        EActionTypes.sendTopCard,
                        {
                        cardID: card.id,
                        deckID: deck.id,
                        type: EGameObjectType.CARD,
                        x: card.x,
                        y: card.y,
                        flippedOver: card.flippedOver,
                        imagePath: card.imagePath,
                        destination: data.extras.destination
                        },
                        [],
                        data.extras.destination === HF.EDestination.HAND ? [data.peerID] : []
                    );
                }
                }
                break;
        
            // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
            case EActionTypes.sendTopCard:
                if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
                let deck: Deck = this.getDeckByID(data.extras.deckID);
        
                if (deck) {
        
                    let card: Card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y, data.extras.flippedOver);
                    card.inDeck = false;
        
                    HF.createCard(card, playspaceComponent, data.extras.destination);
                }
                }
                break;
        
            // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
            case EActionTypes.insertIntoDeck:
                if (data.extras.type === EGameObjectType.CARD && this.amHost) {
                let card: Card = this.getCardByID(data.extras.cardID, data.playerID, true, true).card;
                let deck: Deck = this.getDeckByID(data.extras.deckID);
        
                if (card && deck) {
                    if (this.amHost) {
                    // If I am the host, tell everyone else that this card was inserted
                    // Assuming they can actually see the card all ready -- if it was in the person's hand, no point in telling them
        
                    this.sendPeerData(
                        EActionTypes.insertIntoDeck,
                        {
                        cardID: card.id,
                        deckID: deck.id,
                        type: EGameObjectType.CARD,
                        x: card.x,
                        y: card.y,
                        imagePath: card.imagePath
                        },
                        [data.peerID]
                    );
                    }
        
                    this.addCardToDeck(card, deck.id);
                }
                } else if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
                // If I am not the host and someone inserts a card into the deck, completely remove all reference to it
                // Passing in true, true means that even though the card object is returned, it is destroyed
                this.getCardByID(data.extras.cardID, data.playerID, true, true);
                }
                break;
        
            // Anyone can receive this action, which is sent by someone who inserts a card into their hand
            case EActionTypes.insertIntoHand:
                // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
                if (data.extras.type === EGameObjectType.CARD) {
                let card: Card = this.getCardByID(data.extras.cardID, data.playerID, true, true).card;
        
                if (card) {
                    if (this.amHost) {
                    // If I am the host, first we will tell any other players that the action occured
        
                    this.sendPeerData(
                        EActionTypes.insertIntoHand,
                        {
                        cardID: card.id,
                        type: EGameObjectType.CARD,
                        },
                        [data.peerID]
                    );
        
                    // Then, add it to the appropriate player's hand in the game state (will only actually take effect if host)
                    this.addCardToPlayerHand(card, data.playerID);
                    }
                }
                }
        
                break;        
        
            // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a deck)
            case EActionTypes.removeFromHand:
                if (data.extras.type === EGameObjectType.CARD) {
                let card: Card = null;
                if (this.amHost) {
                    // Card already exists if I'm the host, since I know everyone's hands
                    card = this.getCardByID(data.extras.cardID, data.playerID, true, true).card;
                    card.x = data.extras.x;
                    card.y = data.extras.y;
        
                    HF.createCard(card, playspaceComponent, HF.EDestination.TABLE)
        
                    // Tell other possible peers that this card was removed from a hand
                    this.sendPeerData(
                    EActionTypes.removeFromHand,
                    {
                        cardID: card.id,
                        type: EGameObjectType.CARD,
                        imagePath: card.imagePath,
                        x: card.x,
                        y: card.y,
                        flippedOver: card.flippedOver
                    },
                    [data.peerID]
                    );        
                } else {
                    card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y, data.extras.flippedOver);
                    HF.createCard(card, playspaceComponent, HF.EDestination.TABLE);
                }
                }
        
                break;
        
            case EActionTypes.importDeck:
                if (data.extras.type === EGameObjectType.DECK && this.amHost) {
                let deck: Deck = this.getDeckByID(data.extras.deckID);
        
                if (deck) {
                    let imagePaths: string[] = data.extras.imagePaths;
        
                    imagePaths.forEach((imagePath: string) => {
                    this.addCardToDeck(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y), deck.id);
                    });
                }
                }
                break;

            case EActionTypes.updateRenderOrder:
                let object: Card | Deck = null;
                if (data.extras.type === EGameObjectType.CARD) {
                    object = this.getCardByID(data.extras.id, data.playerID)?.card;
                } else if (data.extras.type === EGameObjectType.DECK) {
                    object = this.getDeckByID(data.extras.id);
                }

                if (object) {
                    this.highestDepth++;
                    object.gameObject.setDepth(this.highestDepth);
                }

                if (this.amHost) {
                    playspaceComponent.gameState.sendPeerData(
                        EActionTypes.updateRenderOrder,
                        {
                            id: object.id,
                            type: object.type
                        },
                        [data.peerID]
                    );
                }
                break;

            case EActionTypes.flipCard:
                let card: Card = this.getCardByID(data.extras.cardID, data.playerID)?.card;

                if (card) {
                    if (!(this.amHost && card.inHand)) {
                        if (data.extras.flippedOver) {
                            card.gameObject.setTexture('flipped-card');
                        } else {
                            card.gameObject.setTexture(card.imagePath);
                        }
                        card.gameObject.setDisplaySize(100, 150);
                        // Hit area MUST be set to the texture size (NOT display size), which will equate to the width and height of the game object after the texture is loaded
                        card.gameObject.input.hitArea.setTo(0, 0, card.gameObject.width, card.gameObject.height);
                    }
                    card.flippedOver = data.extras.flippedOver;
        
                    this.delay(this.saveToCache());
        
                    if (this.amHost) {
                        this.sendPeerData(
                            EActionTypes.flipCard,
                            {
                                cardID: card.id,
                                flippedOver: card.flippedOver
                            },
                            [data.peerID]
                        );
                    }
                }
                break;

            case EActionTypes.shuffleDeck:
                if (this.amHost) {
                    const deck: Deck = this.getDeckByID(data.extras.deckID);
                    if (deck) {
                        DA.shuffleDeck(null, deck, playspaceComponent, null);
                    }
                }
                break;

            case EActionTypes.confirmUndo:
                if (this.amHost) {
                    this.undoRequests = this.undoRequests.filter( (connection: DataConnection) => {
                        return connection.peer !== data.peerID;
                    });

                    if (this.undoRequests.length <= 0) {
                        this.undoInProgress = false;
                        clearInterval(this.undoCheckInInterval);
                    }
                }
                break;
        
            default:
                console.log('Received action did not match any existing action.');
                break;
            }
        }
}


