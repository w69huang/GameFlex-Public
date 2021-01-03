import Card from './card';
import CardMin from './cardMin';
import Hand from './hand';
import SubHand from './subHand';
import SubHandMin from './subHandMin';

export default class HandMin {
    playerID: number;
    subHandMins: SubHandMin[];

    constructor(hand: Hand) {
        this.playerID = hand.playerID;
        hand.subHands.forEach((subHand: SubHand) => {
            let subHandMin: SubHandMin = new SubHandMin([]);
            subHand.cards.forEach((card: Card) => {
                subHandMin.cards.push(new CardMin(card));
            });
            this.subHandMins.push(subHandMin);
        });
    }
}