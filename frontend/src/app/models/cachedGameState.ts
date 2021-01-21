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
    handMins: Object = {};
    numMoves: number;

    constructor(gameState: GameState) { 
        gameState.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });
        Object.entries(gameState.hands).forEach((val) => {
            const [playerID, hands] = val;
            this.handMins[playerID] = [];
            hands.forEach(hand => {
                this.handMins[playerID].push(new HandMin(hand));
            });
        });
        this.numMoves = gameState.numCachedMoves;
    }
}
