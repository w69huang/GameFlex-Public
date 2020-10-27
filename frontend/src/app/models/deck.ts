import Card from './card';

export default class Deck {
    gameObject: Phaser.GameObjects.Image = null;
    id: number;
    imagePath: string;
    cards: Card[];
    type: string = "deck";
    x: number;
    y: number;
    rightClick: boolean;

    constructor(id: number, imagePath: string, cards: Card[], x: number, y: number) {
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.rightClick = false;

        if (cards) {
            this.cards = cards;
        } else {
            this.cards = [];
        }
    }
}