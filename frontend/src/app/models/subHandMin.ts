import Card from "./card";
import CardMin from "./cardMin";

export default class SubHandMin {
    cards: CardMin[];

    constructor(cards: CardMin[]) {
        this.cards = cards;
    }
}
