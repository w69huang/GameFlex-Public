import Deck from './deck';
import CardMin from './cardMin';
import Card from './card';

export default class DeckMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
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