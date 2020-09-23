import Card from './card';
import CardMin from './cardMin';
import Hand from './hand';

export default class HandMin {
    playerID: number;
    cardMins: CardMin[] = [];

    constructor(hand: Hand) {
        this.playerID = hand.playerID;
        hand.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
    }
}