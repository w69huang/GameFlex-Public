import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CachedGameState from './cachedGameState'

export default class GameState {
    private cards: Card[];
    private decks: Deck[];
    private hands: Hand[];
    public myHand: Hand;
    public amHost: boolean = false;

    constructor(cards: Card[], decks: Deck[], hands: Hand[], myHand: Hand) {
        this.cards = cards;
        this.decks = decks;
        this.hands = hands;
        this.myHand = myHand;
    }

    private filterOutID(objectListToFilter: any[], object: any): void {
        objectListToFilter = objectListToFilter.filter( (refObject: any) => {
            return object.id !== refObject.id;
        });
    }

    public saveToCache(): void {
        localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
    }

    public addCardToTable(card: Card): void {
        this.cards.push(card);

        if (this.amHost) {
            localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
        }
    }

    public addCardToDeck(card: Card, deckID: number): void {
        let deck: Deck = this.getDeckByID(deckID);
        deck?.cards.push(card);

        if (this.amHost) {
            localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
        }
    }

    public addDeckToTable(deck: Deck): void {
        this.decks.push(deck);

        if (this.amHost) {
            localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
        }
    }

    public addCardToOwnHand(card: Card): void {
        this.myHand.cards.push(card);

        // TODO: Add card to hand in `hands` as well?

        if (this.amHost) {
            localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
        }
    }

    public addCardToPlayerHand(card: Card, playerID: number): void {
        if (this.amHost) {
            let inserted: boolean = false;

            for (let i: number = 0; i < this.hands.length; i++) {
                if (this.hands[i].playerID === playerID) {
                    this.hands[i].cards.push(card);
                    inserted = true;
                    break;
                }
            }
    
            if (!inserted) {
                this.hands.push(new Hand(playerID, [card]));
            }

            card.inHand = true;
    
            localStorage.setItem('cachedGameState', JSON.stringify(new CachedGameState(this)));
        }
        
    }

    public getCardByID(id: number, playerIDOfWhoActedOnCard: number, removeAfterFinding: boolean = false, destroyAfterFinding: boolean = false): Card {
        let found: boolean = false;
        let card: Card = null;

        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].id === id) {
                card = this.cards[i];
                found = true;

                if (removeAfterFinding) {
                    this.filterOutID(this.cards, card);
                }
                if (destroyAfterFinding) {
                    card.gameObject?.destroy();
                    card.gameObject = null;
                }
                return card;
            }
        }

        if (!found) {
            for (let i = 0; i < this.myHand.cards.length; i++) {
                if (this.myHand.cards[i].id === id) {
                    card = this.myHand.cards[i];
                    found = true;

                    if (removeAfterFinding) {
                        this.filterOutID(this.myHand.cards, card);
                    }
                    if (destroyAfterFinding) {
                        card.gameObject?.destroy();
                        card.gameObject = null;
                    }
                    return card;
                }
            }
        }

       if (!found && this.amHost) {
            for (let i = 0; i < this.hands.length; i++) {
                if (playerIDOfWhoActedOnCard === this.hands[i].playerID) {
                    for (let j = 0; j < this.hands[i].cards.length; j++) {
                        if (this.hands[i].cards[j].id === id) {
                            if (removeAfterFinding) {
                                this.hands[i].cards[j].inHand = false;
                                this.filterOutID(this.hands[i].cards, this.hands[i].cards[j]);
                            }
                            if (destroyAfterFinding) {
                                this.hands[i].cards[j].gameObject?.destroy();
                                this.hands[i].cards[j].gameObject = null;
                            }
                            return this.hands[i].cards[j];
                        }
                    }
                    break;
                }
            }
        }

        return null;
    }

    public getDeckByID(id: number): Deck {
        for (let i = 0; i < this.decks.length; i++) {
            if (this.decks[i].id === id) {
                return this.decks[i];
            }
        }
        return null;
    }

    public cleanUp(): void {
        this.cards.forEach((card: Card) => {
            card.gameObject.destroy();
        });
        this.cards = [];
        this.decks.forEach((deck: Deck) => {
            deck.gameObject.destroy();
        });
        this.decks = [];
        this.myHand.cards.forEach((card: Card) => {
            card.gameObject.destroy();
        });
        this.myHand.cards = [];
    }
}