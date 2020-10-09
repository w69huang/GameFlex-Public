import Deck from './deck';

export default class DeckMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    width: number = 99;
    height: number = 98;
    rotation: number = 180;
    onInsertVisible: boolean = true;
    numberOfVisibleCards: number = 10;

    constructor(deck: Deck) {
        this.id = deck.id;
        this.imagePath = deck.imagePath;
        this.x = deck.x;
        this.y = deck.y;
    }
}