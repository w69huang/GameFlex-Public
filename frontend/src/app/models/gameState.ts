import Card from './card';
import Deck from './deck';
import Hand from './hand';
import Counter from './counter';

export default class GameState {
    cards: Card[];
    decks: Deck[];
    hands: Hand[];
    myHand: Hand;
    counters: Counter[];

    constructor(cards: Card[] = [], decks: Deck[] = [], hands: Hand[] = [], myHand: Hand = null, counters: Counter[] = []) {
        this.cards = cards;
        this.decks = decks;
        this.hands = hands;
        this.myHand = myHand;
        this.counters = counters;
    }
}