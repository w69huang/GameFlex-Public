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
    handMins: HandMin[] = [];

    constructor(gameState: GameState, playerID: number) {
        this.playerID = playerID;

        // If the player does not have any hands initialize a hand for them
        if(!gameState?.hands[this.playerID]) {
            gameState.hands[this.playerID] = [new Hand(this.playerID, [])]
        }

        // Convert to the min version of each object
        gameState?.hands[this.playerID].forEach( (hand: Hand) => {
                this.handMins.push(new HandMin(hand));
        });            
        gameState?.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState?.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });

    }
}