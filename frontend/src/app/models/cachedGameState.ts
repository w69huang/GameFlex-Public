import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import GameState from './gameState';
import Counter from './counter';

/**
 * The class that represents what information is saved when the game state is cached
 */
export default class CachedGameState {
    /**
     * The list of minified cards to cache
     */
    cardMins: CardMin[] = [];
    
    /**
     * The list of minified decks to cache
     */
    deckMins: DeckMin[] = [];

    /**
     * The hand dictionary to cache
     */
    handMins: Object = {};

    /**
     * The list of counters to cache (no need to minify)
     */
    counters: Counter[] = [];

    /**
     * The number of moves that have occured thus far, used to ensure we only show a "do you want to load your game from cache?" dialog if at least 1 move has taken place
     */
    numMoves: number;

    /**
     * A constructor that builds the cached game state from an actual game state
     * @param gameState - The game state to build the cached version from
     */
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
        gameState.counters.forEach((counter: Counter) => {
            this.counters.push(new Counter(counter.id, counter.name, counter.value));
        });
        this.numMoves = gameState.numCachedMoves;
    }
}
