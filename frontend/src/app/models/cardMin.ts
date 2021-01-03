import Card from './card';

export default class CardMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    flippedOver: boolean;
    depth: number;

    constructor(card: Card) {
        this.id = card.id;
        this.imagePath = card.imagePath;
        this.x = card.x;
        this.y = card.y;
        this.flippedOver = card.flippedOver;
        this.depth = card.gameObject ? card.gameObject.depth : 0;
    }
}