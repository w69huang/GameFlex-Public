import Card from './card';
import CardMin from './cardMin';
import Hand from './hand';

export default class HandMin {
    playerID: number;
    cardMins: CardMin[];

    constructor(hand: Hand) {
        this.playerID = hand.playerID;
        this.cardMins = [];
        hand.cards.forEach((card: Card) => {
            if(card.base64 == false) {
                this.cardMins.push(new CardMin(card));
            } else {
               var cardMin = new CardMin(card);
               cardMin.id = card.base64Id;
               cardMin.base64 = true;
               cardMin.deckName = card.base64Deck;
               this.cardMins.push(cardMin);
            }
        });
    }
}