import Deck from './deck';

export default class DeckMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;

    constructor(deck: Deck) {
       this.id = deck.id;
       this.imagePath = deck.imagePath;
       this.x = deck.x;
       this.y = deck.y;
    }
}