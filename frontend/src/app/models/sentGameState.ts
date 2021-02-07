import Card from './card';
import Deck from './deck';
import Hand from './hand';
import GameState from './gameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import Counter from './counter';

/**
 * The class that represents what information a user will receive when it is sent to them via the host
 */
export default class SentGameState {
    /**
     * The playerID of the user that the game state is being sent to
     */
    playerID: number;

    /**
     * The list of minified cards to send to a given player
     */
    cardMins: CardMin[] = [];
    
    /**
     * The list of minified decks to send to a given player
     */
    deckMins: DeckMin[] = [];


    /**
     * A list of hand mins to send to a given player
     */
    handMins: HandMin[] = [];

    /**
     * The list of counters to save (no need to minify)
     */
    counters: Counter[] = [];

    /**
     * A constructor that builds the sent game state from a given game state
     * @param gameState - The game that the sent game state is being built from
     * @param playerID - The playerID that the sent game state is being sent to
     */
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
            if (card.base64 == false) {
                this.cardMins.push(new CardMin(card));
            } 
            else {
                // card.imagePath = null;
                // this.base64Cards.push(new base64CardMin(card));

               var cardMin = new CardMin(card);
               cardMin.id = card.base64Id;
               cardMin.base64 = true;
               cardMin.deckName = card.base64Deck;
               this.cardMins.push(cardMin);
            }
        });
        gameState?.decks.forEach((deck: Deck) => {
            // if(deck.base64 == false) {
            this.deckMins.push(new DeckMin(deck));
            // } else {
            //     this.base64Decks.push(new base64DeckMin(deck)); 
            // }
        });

        this.counters = gameState?.counters;
    }
}