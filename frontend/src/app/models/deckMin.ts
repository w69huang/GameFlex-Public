import Deck from './deck';
import CardMin from './cardMin';
import Card from './card';

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
    cardMins: CardMin[];

    constructor(deck: Deck) {
       this.id = deck.id;
       this.imagePath = deck.imagePath;
       this.x = deck.x;
       this.y = deck.y;
       this.cardMins = [];

       deck.cards.forEach((card: Card) => {
        this.cardMins.push(new CardMin(card));
       });
    }
}