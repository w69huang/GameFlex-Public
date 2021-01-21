import Card from './card';
import Deck from './deck';
import Hand from './hand';
import Counter from './counter';
import CachedGameState from './cachedGameState'
import SavedGameState from './savedGameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';
import * as DeckActions from '../actions/deckActions';
import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import SentGameState from './sentGameState';
import PlayerData from './playerData';
import { EventEmitter, OnInit } from '@angular/core';
import { Data } from 'phaser';
import base64CardMin from './base64CardMin';
import base64DeckMin from './base64DeckMin';
import {MiddleWare} from '../services/middleware';
import { DeckService } from '../services/deck.service';
import { FileService } from '../services/file.service';
import { WebService } from '../services/web.service';
import { HttpClient } from '@angular/common/http';

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
    createTextures = "createTextures"
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
    destination?: HelperFunctions.EDestination;
    highestDepth?: number;
    deckName?: string;
    base64Ids?: string[];
    base64Dictionary?: Object;
    texturepack?:Object;
    base64?:boolean;
    base64Id?: number;
    base64Deck?: string;
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
    private maxNumOfCachedStates: number = 10;

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
     * Holds information about this player's hand only
     */
    public myHand: Hand;

    /**
     * A boolean representing whether this player is the host, used to control branching paths
     */
    private amHost: boolean = false;

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

    public base64Dictionary: Object;
    public base64Decks: String[] = []
    public middleware: MiddleWare;
    // private fileService: FileService;

    private texturepack: Object;

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
        this.base64Dictionary = {}
        this.texturepack = {}
    }

    /**
     * Used to filter objects out of an object list that match an ID
     * @param objectListToFilter - The list to remove objects from
     * @param object - The object to be removed by ID
     */
    private filterOutID(objectListToFilter: any[], object: any): any[] {
        objectListToFilter = objectListToFilter.filter( (refObject: any) => {
            return object.id !== refObject.id;
        });

        this.delay(this.saveToCache())
        return objectListToFilter;
    }

    /**
     * Used to remove a card from the general hands array that the host keeps track of
     * @param card - The card to remove
     */
    private removeFromHandsArray(card: Card): void {
        this._hands.forEach((hand: Hand) => {
            for (let i: number = 0; i < hand.cards.length; i++) {
                if (hand.cards[i].id === card.id) {
                    hand.cards = this.filterOutID(hand.cards, card);
                    return;
                }
            }
        });
    }

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

    
    public addDeckToGame(deckName, cardsdata, id, playspaceComponent) {
        console.log("Add deck to game");
        const card: Card = new Card(id, cardsdata, 50, 50);
        card.base64 = true;
        card.base64Id = id;
        card.base64Deck = deckName;
        // console.log(card);
        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, 0, true);
        console.log("Built?");   
    }

    public generateBase64Dictionary(deckName: string, api:boolean=true, payload = null, playspaceComponent:PlayspaceComponent = null) {
        if (this.amHost) {
            if (this.base64Dictionary == undefined || !(deckName in this.base64Dictionary)){
                if(api == true) {
                    const username = localStorage.getItem("username");
                    
                    // playspaceComponent.getDecks(deckName, username).subscribe(function(data) {
                    //     let arrayOfBase64=[];
                    //     for(let i = 0; i < data.ids.length; i ++) {
                    //         if (!(data.ids[i] in arrayOfBase64) ) {
                    //             arrayOfBase64[data.ids[i]] = data.dataFiles[i];
                    //         } else {
                    //             console.log("Duplicate ID within this deck!  ", deckName);
                    //         }
                    //     }
                    //     this.base64Dictionary[deckName] = arrayOfBase64;
                    //     console.log(this.base64Dictionary)
                    // }.bind(this));
                    // playspaceComponent.getDecks(deckName, username, this)
                    console.log(this.base64Dictionary);
                    // this.fileService.list(deckName, username).subscribe( function(data) {
                    //     for(let i = 0; i < data.ids.length; i ++) {
                    //         if (!(data.ids[i] in arrayOfBase64) ) {
                    //             arrayOfBase64[data.ids[i]] = data.dataFiles[i];
                    //         } else {
                    //             console.log("Duplicate ID within this deck!  ", deckName);
                    //         }
                    //     }
                    //     this.base64Dictionary[deckName] = arrayOfBase64;
                    // })
                    
                } else {
                    let arrayOfBase64: Object = {};
                    for(let i = 0; i < payload.ids.length; i ++) {
                        if ( arrayOfBase64 == undefined || !(payload.ids[i] in arrayOfBase64) ) {
                            arrayOfBase64[payload.ids[i]] = payload.cards[i];
                        } else {
                            console.log("Duplicate ID within this deck!  ", deckName);
                        }
                    }
                    this.base64Dictionary[deckName] = arrayOfBase64;
                }
            }
            if (this.base64Decks.indexOf(deckName) == -1) {
                this.base64Decks.push(deckName);
            }
        }
    }

    

    public sendTexturesToPeers(cards, base64DeckName, ids) {
        if(this.amHost) {
            console.log("Send textures to peers;")
            this.texturepack["cards"] = cards;
            this.texturepack["base64DeckName"] = base64DeckName;
            this.texturepack["ids"] = ids;
            this.sendPeerData(EActionTypes.createTextures, {imagePaths: cards, deckName: base64DeckName, base64Ids: ids, base64Dictionary: this.base64Dictionary});
        }
    }

    // public createTextures(cards, base64DeckName, ids, playspaceComponent) {
    //     var i;
    //     for(i=0; i < cards.length; i ++) {
    //         this.makeTextures(playspaceComponent, cards[i], ids[i]);
    //         console.log("peer Creation?")
    //     }
    // }

    // public deleteTextures(cards, playspaceComponent){
    //     var i;
    //     for(i=0; i < cards.length; i ++) {
    //         this.removeTextures(playspaceComponent, cards[i], null);
    //         console.log("peer deletion?")
    //     }
    // }

    public setCachingEnabled(enable: boolean) {
        this.cachingEnabled = enable;
    }

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
    public saveToCache(): void {
        if (this.cachingEnabled && this.amHost) {
            const cachedGameState = new CachedGameState(this);
            localStorage.setItem('cachedGameState', JSON.stringify(cachedGameState)); 
            this.batchStateHistory.push(cachedGameState);
            clearTimeout(this.timerFunc);
            this.timerFunc = setTimeout(this.saveGameHistory.bind(this), this.batchStateWaitTime);
        }
    }

    private saveGameHistory(): void  {
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

    private removeBase64(cachedGameState) {
        // var i;
        // for(i=0; i < cachedGameState.cardMins.length; i ++) {
        //     if(cachedGameState.cardMins[i].base64 == true) {
        //         cachedGameState.cardMins.splice(i, 1);
        //     }
        // }
    }

    /**
     * Used to send data to peer(s)
     * @param action - The action to perform
     * @param extras - An array of extra game object properties that the user wants to include
     * @param doNotSendTo - a list of peerIDs not to send the data to
     */
    public sendPeerData(action: string, extras: GameObjectExtraProperties, doNotSendTo: string[] = [], onlySendTo: string[] = []): void {
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
    public sendGameStateToPeers(onlySendTo: string = "", doNotSendTo: string = ""): void {
        if (this.amHost) {
            // TODO: Make sentGameState from current gameState and send to all peers
            this.playerDataObjects.forEach((playerData: PlayerData) => {
                for (let i: number = 0; i < this.connections.length; i++) {
                    if (playerData.peerID === this.connections[i].peer) {
                        if (((onlySendTo !== "" && onlySendTo === playerData.peerID) || onlySendTo === "") && (doNotSendTo === "" || (doNotSendTo !== playerData.peerID))) {
                            
                            let sentGameState: SentGameState = new SentGameState(this, playerData.id);
                            this.connections[i].send(new GameObjectProperties(this.amHost, 'replicateState', this.myPeerID, this.playerID, { 'state': sentGameState , 'base64Dictionary': this.base64Dictionary, 'texturepack': this.texturepack}));
                            break; 
                        }
                    }
                }
            });
        }
    }

    /**
     * Used to send a pre-made sentGameState object to a peer
     * @param sentGameState 
     * @param peerID 
     */
    public sendAlreadyMadeGameStateToPeer(sentGameState: SentGameState, peerID: string): void {
        if (this.amHost) {
            for (let i: number = 0; i < this.connections.length; i++) {
                if (this.connections[i].peer === peerID) {
                    this.connections[i].send(new GameObjectProperties(this.amHost, 'replicateState', this.myPeerID, this.playerID, { 'state': sentGameState, 'base64Dictionary': this.base64Dictionary, 'texturepack': this.texturepack }));
                }
            }
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
                this.setCachingEnabled(false);

                this.cleanUp();
                console.log(cache.gamestate);
                console.log(Object.keys(this.base64Dictionary));
                // console.log(this.middleware.getUsername());
                if(Object.keys(this.base64Dictionary).length == 0) {
                    cache.gamestate.base64Decks.forEach(deckName => {
                        this.generateBase64Dictionary(deckName, true, null, playspaceComponent);
                        console.log(this.base64Dictionary)
                    });
                }

                cache.gamestate.cardMins.forEach((cardMin: CardMin) => {
                    if (cardMin.base64 == false ) {
                        const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth);
                    } else {

                        const card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                        card.base64Deck = cardMin.deckName;
                        card.base64 = true;
                        card.base64Id = cardMin.id
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth, true);
                    }
                });
                cache.gamestate.deckMins.forEach((deckMin: DeckMin) => {
                    let cardList: Card[] = [];
                    deckMin.cardMins.forEach((cardMin: CardMin) => {
                        if (cardMin.base64 == false) {
                            cardList.push(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y));
                        } else {
                            let card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                            card.base64Deck = cardMin.deckName;;
                            card.base64 = true;
                            card.base64Id = cardMin.id
                            cardList.push(card);
                        }
                    });
                    const deck: Deck = new Deck(deckMin.id, deckMin.imagePath, cardList, deckMin.x, deckMin.y);
                    HelperFunctions.createDeck(deck, playspaceComponent, deckMin.depth);
                });
                for (let i = 0; i < cache.gamestate.handMins.length; i++) {
                    cache.gamestate.handMins[i].cardMins.forEach((cardMin: CardMin) => {
                        if (cache.gamestate.handMins[i].playerID === this.playerID) {
                            if (cardMin.base64 == false) {
                                const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                                this.addCardToOwnHand(card);
                                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth);
                            } else {
                                const card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                                card.base64Deck = cardMin.deckName;
                                card.base64 = true;
                                card.base64Id = cardMin.id;
                                this.addCardToOwnHand(card);
                                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth, true);

                            }
                        } else {
                            if (cardMin.base64) {
                                this.addCardToPlayerHand(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y), cache.gamestate.handMins[i].playerID);
                            } else {
                                let card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                                card.base64Deck = cardMin.deckName;
                                card.base64 = true;
                                card.base64Id = cardMin.id;
                                this.addCardToPlayerHand(card, cache.gamestate.handMins[i].playerID);
                            }
                        }
                    });
                }

                // TO DO: Pull all the decks and such associated with this game with gridfs. Create a middleware function
                // That pulls the image ID based on the card ID and then passes it into the below functions.
                // NOTE: remember to set base64 = true to all the Card, Hand and Deck classes.
                // NOTE: the nulls all need to be changed to the image path which is the base64 string for the cards. 
            
                // Just a temporary thing for now. Ask Zach where the host sends the game state on load.
                if (undo > 0) {
                    this.sendGameStateToPeers();
                    this.currentMove = new CachedGameState(this); 
                } else if (initialBuild) {
                    this.sendGameStateToPeers();
                }

                this.setCachingEnabled(true);
            }            
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
     * A method to build the game state from a saved game state
     * @param savedGameState - The saved game state to build from
     * @param playspaceComponent - A reference to the playspace component, needed to create cards and decks
     */
    public buildGameStateFromSavedState(savedGameState: SavedGameState, playspaceComponent: PlayspaceComponent): void {
        if (this.amHost) {
            this.cachingEnabled = false;

            this.cleanUp();
      
            savedGameState.cardMins.forEach((cardMin: CardMin) => {
                if(cardMin.base64 == false){ 
                    const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                    HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth);
                } else {
                    const card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                    card.base64Deck = cardMin.deckName;
                    card.base64 = true;
                    card.base64Id = cardMin.id;
                    HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth, true);
                
                }
            });
            savedGameState.deckMins.forEach((deckMin: DeckMin) => {
                let cardList: Card[] = [];
                deckMin.cardMins.forEach((cardMin: CardMin) => {
                    if(cardMin.base64 == false ){
                        cardList.push(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y));
                    } else {
                        let card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                        card.base64Deck = cardMin.deckName;;
                        card.base64 = true;
                        card.base64Id = cardMin.id;
                        cardList.push(card);
                    }
                });
                const deck: Deck = new Deck(deckMin.id, deckMin.imagePath, cardList, deckMin.x, deckMin.y);
                HelperFunctions.createDeck(deck, playspaceComponent, deckMin.depth);
            });
            for (let i = 0; i < savedGameState.handMins.length; i++) {
                savedGameState.handMins[i].cardMins.forEach((cardMin: CardMin) => {
                    if (savedGameState.handMins[i].playerID === this.playerID) {
                        if (cardMin.base64 == false) {
                            const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                            this.addCardToOwnHand(card);
                            HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth);
                        } else {
                            const card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                            card.base64Deck = cardMin.deckName;
                            card.base64 = true;
                            card.base64Id = cardMin.id;
                            this.addCardToOwnHand(card);
                            HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth, true);


                        }
                    } else {
                        if (cardMin.base64 == false) {
                            this.addCardToPlayerHand(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y), savedGameState.handMins[i].playerID);
                        } else {
                            let card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                            card.base64Deck = cardMin.deckName;
                            card.base64 = true;
                            card.base64Id = cardMin.id;
                            this.addCardToPlayerHand(card, savedGameState.handMins[i].playerID);

                        }
                    }
                });
            }
            
            this.cachingEnabled = true;
            this.delay(this.saveToCache());
            this.sendGameStateToPeers();
        }
    }

    /**
     * Used to add a card to the table
     * @param card - The card to add
     */
    public addCardToTable(card: Card): void {
        this._cards.push(card);
        this.delay(this.saveToCache())
    }

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
     * Used to add a card to a deck
     * @param card - The card to add
     * @param deckID - The ID of the deck to add to
     */
    public addCardToDeck(card: Card, deckID: number): void {
        let deck: Deck = this.getDeckByID(deckID);
    
        if (deck) {
            card.inDeck = true;
            if (card.base64 == true) {
                card.imagePath = null;
            }
            if (this.amHost) {
                deck.cards.push(card);
            }
        }

        this.delay(this.saveToCache())
    }

    /**
     * Used to add a deck to the table
     * @param deck - The deck to add
     */
    public addDeckToTable(deck: Deck): void {
        this._decks.push(deck);
        this.delay(this.saveToCache())
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
    
            this.delay(this.saveToCache())
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
        
                this.delay(this.saveToCache())
            }
        }
    }

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
                this.delay(this.saveToCache())
            }
            console.log("card from deck");
            console.log(card);
            card.x = deck.x;
            card.y = deck.y;
            return card;
        } else {
            return null;
        }
    }

    /**
     * Used to replace all the cards in a deck
     * @param cardList - The cards to replace the deck's cards with
     * @param deckID - The ID of the deck to have its cards replaced
     */
    public replaceCardsInDeck(cardList: Card[], deckID: number): void {
        const deck: Deck = this.getDeckByID(deckID);
        
        if (deck) {
            deck.cards = cardList;
            this.delay(this.saveToCache())
        }
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
                this.delay(this.saveToCache())
                return { overlapType: EOverlapType.TABLE, wasInHand: false };
            }
        } else {
            const deck: Deck = this.getDeckByID(id);
            this.delay(this.saveToCache())

            return { overlapType: EOverlapType.TABLE };
        }

    }

    public delay(func: void) {
        setTimeout(function() { func}, 200);

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
     * Used to handle data received from P2P connections
     */
    handleData(data: GameObjectProperties, playspaceComponent: PlayspaceComponent): void {
        if (this.amHost && data.amHost) {
          // Error! Both parties claim to the be the host! Abort!
          console.log("Fatal error: both parties claim to be the host.");
          return;
        }
    
        switch(data.action) {
    
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
            this.sendGameStateToPeers(data.peerID);
    
            break;
    
          case EActionTypes.replicateState:
            console.log("Received state.");
            const receivedGameState: SentGameState = data.extras.state;
            this.playerID = receivedGameState.playerID;
            this.base64Dictionary = data.extras.base64Dictionary;
            this.texturepack = data.extras.texturepack;
            this.cleanUp();
    
            receivedGameState.cardMins.forEach((cardMin: CardMin) => {
              if(cardMin.base64 == false) {  
                let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth);
              } else {
                console.log("Base64 card min");
                console.log(cardMin);
                let card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y);
                card.base64 = true;
                card.base64Deck = cardMin.deckName
                card.base64Id = cardMin.id;
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, cardMin.depth, true);
              }
            });
            receivedGameState.deckMins.forEach((deckMin: DeckMin) => {
              let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
              HelperFunctions.createDeck(deck, playspaceComponent, deckMin.depth);
            });
            receivedGameState.handMin.cardMins.forEach((cardMin: CardMin) => {
              if(cardMin.base64 == false) {  
                let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, true);
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth);
              } else {

                let card: Card = new Card(cardMin.id, null, cardMin.x, cardMin.y, true);
                card.base64 = true;
                card.base64Deck = cardMin.deckName
                card.base64Id = cardMin.id;
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.HAND, cardMin.depth, true);
              }
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
                this.delay(this.saveToCache())
            }
            break;
    
          // The host receives this action, which was sent by a non-host requesting the top card of the deck
          case EActionTypes.retrieveTopCard:
            if (data.extras.type === EGameObjectType.CARD && this.amHost) {
              let deck: Deck = this.getDeckByID(data.extras.deckID);
    
              if (deck && deck.cards.length > 0) {
                let card: Card = this.getCardFromDeck(deck.cards.length - 1, deck.id, true);
                card.x = data.extras.destination === HelperFunctions.EDestination.TABLE ? deck.x : playspaceComponent.gameState.myHand.gameObject.x + 150;
                card.y = data.extras.destination === HelperFunctions.EDestination.TABLE ? deck.y : playspaceComponent.gameState.myHand.gameObject.y + 200;
    
                if (data.extras.destination === HelperFunctions.EDestination.TABLE) {
                    if(card.base64 == false) {
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE);
                    } else {
                        HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE, undefined, true);

                    }
                } else if (data.extras.destination === HelperFunctions.EDestination.HAND) {
                    this.addCardToPlayerHand(card, data.playerID);
                }
                console.log("retrieve top card:");
                console.log(card);
                if(card.base64 == false) {
                    this.sendPeerData(
                        EActionTypes.sendTopCard,
                        {
                        cardID: card.id,
                        deckID: deck.id,
                        type: EGameObjectType.CARD,
                        x: card.x,
                        y: card.y,
                        imagePath: card.imagePath,
                        destination: data.extras.destination
                        },
                        [],
                        data.extras.destination === HelperFunctions.EDestination.HAND ? [data.peerID] : []
                    );
                } else {
                    this.sendPeerData(
                        EActionTypes.sendTopCard,
                        {
                        cardID: card.id,
                        deckID: deck.id,
                        type: EGameObjectType.CARD,
                        x: card.x,
                        y: card.y,
                        imagePath: null,
                        destination: data.extras.destination,
                        base64: card.base64,
                        base64Id: card.base64Id,
                        base64Deck: card.base64Deck,
                        // base64Dictionary: this.base64Dictionary
                        },
                        [],
                        data.extras.destination === HelperFunctions.EDestination.HAND ? [data.peerID] : []
                    );
                }
              }
            }
            break;
    
          // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
          case EActionTypes.sendTopCard:
            if (data.extras.type === EGameObjectType.CARD && !this.amHost) {
              let deck: Deck = this.getDeckByID(data.extras.deckID);
    
              if (deck) {
    
                let card: Card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y);
                if(data.extras.base64 == true ) {
                    card.base64 = true;
                    card.base64Id = data.extras.base64Id;
                    card.base64Deck = data.extras.base64Deck;
                    // this.base64Dictionary = data.extras.base64Dictionary;
                }
                console.log("SendTop Card:")
                console.log(card);
                card.inDeck = false;
                if (card.base64 == false) {
                    HelperFunctions.createCard(card, playspaceComponent, data.extras.destination);
                } else {
                    HelperFunctions.createCard(card, playspaceComponent, data.extras.destination, 0, true);
                }
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
                  console.log("Insert Into Deck:")
                  console.log(card);
                  if (card.base64 == true) {
                    this.sendPeerData(
                        EActionTypes.insertIntoDeck,
                        {
                        cardID: card.id,
                        deckID: deck.id,
                        type: EGameObjectType.CARD,
                        x: card.x,
                        y: card.y,
                        imagePath: null,
                        base64: card.base64,
                        base64Id: card.base64Id,
                        base64Deck: card.base64Deck
                        },
                        [data.peerID]
                    );
                  } else {
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
    
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE)
    
                // Tell other possible peers that this card was removed from a hand
                this.sendPeerData(
                  EActionTypes.removeFromHand,
                  {
                    cardID: card.id,
                    type: EGameObjectType.CARD,
                    imagePath: card.imagePath,
                    x: card.x,
                    y: card.y,
                  },
                  [data.peerID]
                );        
              } else {
                card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y);
                HelperFunctions.createCard(card, playspaceComponent, HelperFunctions.EDestination.TABLE);
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
                this.highestDepth = data.extras.highestDepth;
                object.gameObject.setDepth(this.highestDepth);
              }

              if (this.amHost) {
                playspaceComponent.gameState.sendPeerData(
                    EActionTypes.updateRenderOrder,
                    {
                      id: object.id,
                      type: object.type,
                      highestDepth: playspaceComponent.gameState.highestDepth
                    },
                    [data.peerID]
                  );
              }
              break;

          case EActionTypes.createTextures:
              console.log("CreateTextures Case");
              console.log(data);
              var i;
              this.base64Dictionary = data.extras.base64Dictionary;
              for(i=0; i < data.extras.imagePaths.length; i ++) {
                //   this.makeTextures(playspaceComponent, data.extras.imagePaths[i], data.extras.base64Ids[i]);
                  this.addDeckToGame(data.extras.deckName, data.extras.imagePaths[i], data.extras.base64Ids[i], playspaceComponent);
                  console.log("peer Creation?")
              }


              break;

          default:
            console.log('Received action did not match any existing action.');
            break;
        }
      }
}