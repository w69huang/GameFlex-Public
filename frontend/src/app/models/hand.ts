import Card from './card';

export default class Deck {
    gameObject: Phaser.GameObjects.Image = null;
    playerID: number;
    cards: Card[];
    type: string = "hand";

    constructor(playerID: number, cards: Card[]) {
        this.playerID = playerID;

        if (cards) {
            this.cards = cards;
        } else {
            this.cards = [];
        }
    }
}