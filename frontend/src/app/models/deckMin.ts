import Card from './card';
import CardMin from './cardMin';
import Deck from './deck';

export default class DeckMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    cardMins: CardMin[] = [];

    constructor(deck: Deck) {
       this.id = deck.id;
       this.imagePath = deck.imagePath;
       this.x = deck.gameObject.x;
       this.y = deck.gameObject.y;

       deck.cards.forEach((card: Card) => {
        this.cardMins.push(new CardMin(card));
       }) ;
    }
}