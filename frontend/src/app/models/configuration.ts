import Deck from './deck';
import Counter from './counter';


export default class Configuration {
    _id: string;
    userId: string;
    numPlayers: number;
    handsVisibleOnInsert: boolean;
    decks: Deck[];
    counters: Counter[];


    constructor(id: number, userId: string, numPlayers: number, handsVisibleOnInsert: boolean, decks: Deck[], counters: Counter[]) {
        this.userId = userId;
        this.numPlayers = numPlayers;
        this.handsVisibleOnInsert = handsVisibleOnInsert;


        this.decks = decks ? decks: [];
        this.counters = counters ? counters : [];

    }
}