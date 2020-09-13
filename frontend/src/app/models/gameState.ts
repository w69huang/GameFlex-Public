import Card from './card';
import Deck from './deck';
import Hand from './hand';

export default class GameState {
    cards: Card[];
    decks: Deck[];
    hands: Hand[];
    myHand: Hand;

    constructor(cards: Card[], decks: Deck[], hands: Hand[], myHand: Hand) {
        this.cards = cards;
        this.decks = decks;
        this.hands = hands;
        this.myHand = myHand;
    }
}