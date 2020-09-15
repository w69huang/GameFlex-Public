import Card from './card';

export default class CardMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;

    constructor(card: Card) {
        this.id = card.id;
        this.imagePath = card.imagePath;
        this.x = card.gameObject.x;
        this.y = card.gameObject.y;
    }
}