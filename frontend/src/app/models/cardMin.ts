import Card from './card';

export default class CardMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    depth: number;

    constructor(card: Card) {
        this.id = card.id;
        this.imagePath = card.imagePath;
        this.x = card.x;
        this.y = card.y;
        this.depth = card.gameObject ? card.gameObject.depth : 0;
    }
}