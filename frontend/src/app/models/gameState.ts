import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CachedGameState from './cachedGameState'
import SavedGameState from './savedGameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';
import * as DeckActions from '../actions/deckActions';
import { PlayspaceComponent } from '../playspace/playspace.component';

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
     * Holds information about this player's hand only
     */
    public myHand: Hand;

    /**
     * A boolean representing whether this player is the host, used to control branching paths
     */
    public amHost: boolean = false;

    /**
     * A public accessor to get all cards, should not be used outside of other game state classes
     */
    public get cards(): Card[] {
        return this._cards;
    }

    /**
     * A public accessor to get all decks, should not be used outside of other game state classes
     */
    public get decks(): Deck[] {
        return this._decks;
    }

    /**
     * A public accessor to get all hands, should not be used outside of othergmae state classes
     */
    public get hands(): Hand[] {
        return this._hands;
    }

    /**
     * The constructor for the game state
     * @param cards - The cards to add to the table at initialization time
     * @param decks - The decks to add to the table at initialization time
     * @param hands - The hand information to record at initialization time
     * @param myHand - The player's hand information to record at initialization time
     */
    constructor(cards: Card[], decks: Deck[], hands: Hand[], myHand: Hand) {
        this._cards = cards;
        this._decks = decks;
        this._hands = hands;
        this.myHand = myHand;
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

        if (this.amHost) {
            this.saveToCache();
        }

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
     * Used to remove and the destroy the gameObjects of cards from a list of cards, RETURNS A NEW LIST WITH THE CHANGES MADE
     * @param cardList - The list to remove from
     * @param card - The card to remove
     * @param location - The location the card was in, used to determine whether or not to remove the card from the hands array
     */
    private removeAndDestroyCardFromListByID(cardList: Card[], card: Card, location: ECardLocation): Card[] {
        if (this.amHost && location === ECardLocation.OTHERHAND || location === ECardLocation.MYHAND) {
            this.removeFromHandsArray(card);
        }

        card.gameObject?.destroy();
        card.gameObject = null;
        return this.filterOutID(cardList, card);
    }

    /**
     * Used to save the current game state to the user's local storage
     */
    public saveToCache(): void {
        localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
    }

    public buildGameFromCache(playspaceComponent: PlayspaceComponent): void {
        if (this.amHost) {
            const cachedGameState: CachedGameState = JSON.parse(localStorage.getItem('cachedGameState'));

            this.cleanUp();
      
            cachedGameState.cardMins.forEach((cardMin: CardMin) => {
                let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
            });
            cachedGameState.deckMins.forEach((deckMin: DeckMin) => {
                let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
                HelperFunctions.createDeck(deck, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick, deck.x, deck.y);
            });
            for (let i = 0; i < cachedGameState.handMins.length; i++) {
                cachedGameState.handMins[i].cardMins.forEach((cardMin: CardMin) => {
                    if (cachedGameState.handMins[i].playerID === playspaceComponent.playerID) {
                        const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                        this.addCardToOwnHand(card, cachedGameState.handMins[i].playerID);
                        HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.HAND, card.x, card.y);
                    } else {
                        this.addCardToPlayerHand(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y), cachedGameState.handMins[i].playerID);
                    }
                });
            } 
        }        
    }

    public buildGameStateFromSavedState(savedGameState: SavedGameState, playspaceComponent: PlayspaceComponent): void {
        if (this.amHost) {
            this.cleanUp();
      
            savedGameState.cardMins.forEach((cardMin: CardMin) => {
                let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.TABLE, card.x, card.y);
            });
            savedGameState.deckMins.forEach((deckMin: DeckMin) => {
                let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
                HelperFunctions.createDeck(deck, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DeckActions.deckRightClick, deck.x, deck.y);
            });
            for (let i = 0; i < savedGameState.handMins.length; i++) {
                savedGameState.handMins[i].cardMins.forEach((cardMin: CardMin) => {
                    if (savedGameState.handMins[i].playerID === playspaceComponent.playerID) {
                        const card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y);
                        this.addCardToOwnHand(card, savedGameState.handMins[i].playerID);
                        HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, HelperFunctions.DestinationEnum.HAND, card.x, card.y);
                    } else {
                        this.addCardToPlayerHand(new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y), savedGameState.handMins[i].playerID);
                    }
                });
            }        
        }
    }

    /**
     * Used to add a card to the table
     * @param card - The card to add
     */
    public addCardToTable(card: Card): void {
        this._cards.push(card);

        if (this.amHost) {
            this.saveToCache();
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
            deck.cards.push(card);
        }

        if (this.amHost) {
            this.saveToCache();
        }
    }

    /**
     * Used to add a deck to the table
     * @param deck - The deck to add
     */
    public addDeckToTable(deck: Deck): void {
        this._decks.push(deck);

        if (this.amHost) {
            this.saveToCache();
        }
    }

    /**
     * Used to add a card to the player's own hand, which also adds the card to the overall hands array if the player is the host
     * @param card - The card to add
     * @param playerID - The ID of the player adding it
     */
    public addCardToOwnHand(card: Card, playerID: number): void {
        card.inHand = true;
        this.myHand.cards.push(card);

        if (this.amHost) {
            this.addCardToPlayerHand(card, playerID);
        }
    }

    /**
     * Used to remove a card from the player's own hand, which also removes the card from the overall hands array if the player is the host
     * @param cardID - The ID of the card to remove
     * @param playerID - The ID of the player removing it
     */
    public removeCardFromOwnHand(cardID: number, playerID: number): void {
        const card: Card = this.getCardByID(cardID, playerID).card;

        if (card) {
            card.inHand = false;
            this.myHand.cards = this.filterOutID(this.myHand.cards, card);

            if (this.amHost) {
                this.removeCardFromPlayerHand(cardID, playerID);
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
    
            this.saveToCache();
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
        
                this.saveToCache();
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

                this.saveToCache();
            }
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

            this.saveToCache();
        }
    }

    /**
     * Used to check overlap of an object on hands and decks
     * @param id - The id of the object overlap is being checked for (card/deck)
     * @param playerID - The id of the player responsible for firing this check
     */
    public checkForOverlap(id: number, playerID: number): OverlapObject {
        const cardLocationObject: CardLocationObject = this.getCardByID(id, playerID);
        const card: Card = cardLocationObject?.card;
        const cardLocation: ECardLocation = cardLocationObject?.location;
        let image: Phaser.GameObjects.Image = this.myHand.gameObject;

        if (card) {
            let myCenterX = card.gameObject.x + card.gameObject.displayWidth/2;
            let myCenterY = card.gameObject.y + card.gameObject.displayHeight/2;

            if (myCenterX > image.x && myCenterX < image.x + image.displayWidth && myCenterY > image.y && myCenterY < image.y + image.displayHeight) {
                if (cardLocation !== ECardLocation.MYHAND) {
                    this._cards = this.filterOutID(this._cards, card);
                    this.addCardToOwnHand(card, playerID);
                    return { overlapType: EOverlapType.HAND };
                }
                return { overlapType: EOverlapType.ALREADYINHAND };
            } else {
                for (let i: number = 0; i < this._decks.length; i++) {
                    image = this.decks[i].gameObject;

                    if (myCenterX > image.x && myCenterX < image.x + image.displayWidth && myCenterY > image.y && myCenterY < image.y + image.displayHeight) {
                        this._cards = this.removeAndDestroyCardFromListByID(this._cards, card, cardLocation);
                        this.addCardToDeck(card, this.decks[i].id);
                        return { overlapType: EOverlapType.DECK, deckID: this.decks[i].id };
                    }
                }
            }

            if (cardLocation === ECardLocation.MYHAND) {
                this.addCardToTable(card);
                this.removeCardFromOwnHand(card.id, playerID);
                return { overlapType: EOverlapType.TABLE, wasInHand: true };
            } else {
                this.saveToCache();
                return { overlapType: EOverlapType.TABLE, wasInHand: false };
            }
        } else {
            const deck: Deck = this.getDeckByID(id);
            this.saveToCache();

            return { overlapType: EOverlapType.TABLE };
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
                    this._cards = this.removeAndDestroyCardFromListByID(this._cards, card, ECardLocation.TABLE);
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
                        this.myHand.cards = this.removeAndDestroyCardFromListByID(this.myHand.cards, card, ECardLocation.MYHAND);
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
                                this._hands[i].cards = this.removeAndDestroyCardFromListByID(this._hands[i].cards, card, ECardLocation.OTHERHAND);
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
    }
}