import Card from './card';
import Deck from './deck';
import Hand from './hand';
import GameState from './gameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import SavedGameState from './savedGameState';
import CachedGameState from './cachedGameState';

export default class SentGameState {
    playerID: number
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMin: HandMin;

    constructor(gameState: GameState, playerID: number) {
        this.playerID = playerID;

        gameState?.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState?.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });

        let handFound: boolean = false;
        for (let i = 0; i < gameState?.hands.length; i++) {
            if (gameState?.hands[i].playerID === this.playerID) {
                this.handMin = new HandMin(gameState?.hands[i]);
                handFound = true;
                break;
            }
        }

        if (!handFound) {
            this.handMin = new HandMin(new Hand(this.playerID, []));
        }
    }

    /**
     * Used to build a SentGameState object from a savedGameState or cachedGameState object
     * @param incGameState - The game state to build from
     * @param playerID - The player ID to build it for, used to select the correct hand cards
     */
    public static buildSentGameStateFromSaveOrCache(incGameState: SavedGameState | CachedGameState, playerID: number): SentGameState {
        const sentGameState: SentGameState = new SentGameState(null, playerID);
        sentGameState.cardMins = incGameState.cardMins;
        sentGameState.deckMins = incGameState.deckMins;
        sentGameState.deckMins.forEach((deckMin: DeckMin) => {
            deckMin.cardMins = [];
        });
        for (let i: number = 0; i < incGameState.handMins.length; i++) {
            if (incGameState.handMins[i].playerID === playerID) {
                sentGameState.handMin = incGameState.handMins[i];
            }
        }
        return sentGameState;
    }
}