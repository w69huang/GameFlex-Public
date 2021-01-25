import Card from './card';

export default class CardMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    flippedOver: boolean;
    depth: number;
    base64: boolean;
    deckName: string;

    constructor(card: Card) {
        this.id = card.id;
        this.imagePath = card.imagePath;
        this.x = card.x;
        this.y = card.y;
        this.flippedOver = card.flippedOver;
        this.depth = card.gameObject ? card.gameObject.depth : 0;
        this.base64 = false;
        this.deckName = card.base64Deck;
    }
}