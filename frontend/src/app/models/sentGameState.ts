import Card from './card';
import Deck from './deck';
import Hand from './hand';
import GameState from './gameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';

export default class SentGameState {
    playerID: number;
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMins: HandMin[];

    constructor(gameState: GameState, playerID: number) {
        this.playerID = playerID;

        gameState?.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState?.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });

        try {
            gameState?.hands[this.playerID].forEach( (hand: Hand) => {
                    this.handMins.push(new HandMin(hand));
            });            
        } catch (error) {
            console.warn(`Creating handMin for playerID=${playerID} as a Hand does not already exist. Error: ${error}`)
            this.handMins = [new HandMin(new Hand(this.playerID, []))];
        }

    }
}