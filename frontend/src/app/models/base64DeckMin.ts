import Deck from './deck';
import CardMin from './cardMin';
import Card from './card';
import base64CardMin from './base64CardMin';

export default class base64DeckMin {
    id: number;
    imagePath: string;
    x: number;
    y: number;
    depth: number;
    width: number = 99;
    height: number = 98;
    rotation: number = 180;
    onInsertVisible: boolean = true;
    numberOfVisibleCards: number = 10;
    base64CardMin: base64CardMin[];
    deckName: string;

    constructor(deck: Deck) {
       this.id = deck.id;
       this.imagePath = deck.imagePath;
       this.x = deck.x;
       this.y = deck.y;
       this.depth = deck.gameObject ? deck.gameObject.depth : 0;
       this.base64CardMin = [];

       deck.cards?.forEach((card: Card) => {
           if(card.base64 == false ){
                this.base64CardMin.push(new base64CardMin(card));
           }
       });
    }
}