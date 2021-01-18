import Card from './card';
import base64CardMin from './base64CardMin';
import Hand from './hand';

export default class base64HandMin {
    playerID: number;
    base64CardMins: base64CardMin[];
    base64Cards: Array<Object>;

    constructor(hand: Hand) {
        this.playerID = hand.playerID;
        this.base64CardMins = [];
        hand.cards.forEach((card: Card) => {
            this.base64CardMins.push(new base64CardMin(card));
        });
    }
}