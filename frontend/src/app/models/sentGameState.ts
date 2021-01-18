import Card from './card';
import Deck from './deck';
import Hand from './hand';
import GameState from './gameState';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import base64CardMin from './base64CardMin';
import base64DeckMin from './base64DeckMin';
import base64HandMin from './base64HandMin';

export default class SentGameState {
    playerID: number
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMin: HandMin;
    base64HandMin: base64HandMin;
    base64Cards: base64CardMin[] = [];
    base64Decks: base64DeckMin[] = [];
    base64Hands: base64HandMin[] = [];

    constructor(gameState: GameState, playerID: number) {
        this.playerID = playerID;

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

        let handFound: boolean = false;
        for (let i = 0; i < gameState?.hands.length; i++) {
            if (gameState?.hands[i].playerID === this.playerID) {
                // if (gameState?.hands[i].base64 == false) {
                    this.handMin = new HandMin(gameState?.hands[i]);
                    handFound = true;
                    break;
                // } 
                // else {
                //     this.base64HandMin = new base64HandMin(gameState?.hands[i]);
                //     handFound = true;
                //     break; 
                // }
            }
        }

        if (!handFound) {
            this.handMin = new HandMin(new Hand(this.playerID, []));
            // this.base64HandMin = new base64HandMin(new Hand(this.playerID, []));

        }
    }
}