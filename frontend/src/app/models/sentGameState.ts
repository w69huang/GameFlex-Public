import Card from './card';
import Deck from './deck';
import Hand from './hand';
import GameState from './gameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';

export default class SentGameState {
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMin: HandMin;

    constructor(gameState: GameState, playerID: number) {
        gameState.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });

        let handFound: boolean = false;
        for (let i = 0; i < gameState.hands.length; i++) {
            if (gameState.hands[i].playerID === playerID) {
                this.handMin = new HandMin(gameState.hands[i]);
                handFound = true;
                break;
            }
        }

        if (!handFound) {
            this.handMin = new HandMin(new Hand(playerID, []));
        }
    }
}