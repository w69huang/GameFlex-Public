import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import GameState from './gameState';

export default class CachedGameState {
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMins: HandMin[] = [];
    numMoves: number;

    constructor(gameState: GameState) { 
        gameState.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });
        gameState.hands.forEach((hand: Hand) => {
            this.handMins.push(new HandMin(hand));
        });
        this.numMoves = gameState.numCachedMoves;
    }
}

// dict playerIds to hands[]