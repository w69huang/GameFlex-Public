import Card from './card';

export default class Deck {
    gameObject: Phaser.GameObjects.Image = null;
    id: number;
    cards: Card[];
    type: string = "hand";

    constructor(id: number, cards: Card[]) {
        this.id = id;

        if (cards) {
            this.cards = cards;
        } else {
            this.cards = [];
        }
    }
}