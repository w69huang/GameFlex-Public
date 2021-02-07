import Deck from './deck';
import CardMin from './cardMin';
import Card from './card';

export default class DeckMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    depth: number;
    cardMins: CardMin[];

    constructor(deck: Deck) {
       this.id = deck.id;
       this.imagePath = deck.imagePath;
       this.x = deck.x;
       this.y = deck.y;
       this.depth = deck.gameObject ? deck.gameObject.depth : 0;
       this.cardMins = [];

       deck.cards?.forEach((card: Card) => {
           if(card.base64 == false ){
                this.cardMins.push(new CardMin(card));
           } else {
               var cardMin = new CardMin(card);
               cardMin.id = card.base64Id;
               cardMin.base64 = true;
               cardMin.deckName = card.base64Deck;
               cardMin.imagePath = null;
               this.cardMins.push(cardMin);
           }
       });
    }
}