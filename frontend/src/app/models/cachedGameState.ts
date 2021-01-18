import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import GameState from './gameState';
import base64CardMin from './base64CardMin';
import base64DeckMin from './base64DeckMin';
import base64HandMin from './base64HandMin';

export default class CachedGameState {
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMins: HandMin[] = [];
    // base64Cards: base64CardMin[] = [];
    // base64Decks: base64DeckMin[] = [];
    // base64Hands: base64HandMin[] = [];
    base64Decks: String[] = [];

    constructor(gameState: GameState) { 
        gameState.cards.forEach((card: Card) => {
            if (card.base64 == false) {
                this.cardMins.push(new CardMin(card));
            } else {
                card.imagePath = null;
                // this.base64Cards.push(new base64CardMin(card));
                var cardMin = new CardMin(card);
                cardMin.base64 = true;
                cardMin.deckName = card.base64Deck;
                cardMin.id = card.base64Id;
                this.cardMins.push(cardMin);
            }
        });
        gameState.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });
        gameState.hands.forEach((hand: Hand) => {
            this.handMins.push(new HandMin(hand));
        });
        this.base64Decks = gameState.base64Decks;
    }
}