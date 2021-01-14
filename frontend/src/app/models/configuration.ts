import Deck from './deck';
import Counter from './counter';


export default class Configuration {
    _id: string;
    username: string;
    name: string;
    date: Date;
    numPlayers: number;
    handsVisibleOnInsert: boolean;
    decks: Deck[];
    counters: Counter[];

    constructor(username: string, name: string, numPlayers: number, handsVisibleOnInsert: boolean, decks: Deck[], counters: Counter[]) {
        this.numPlayers = numPlayers;
        this.handsVisibleOnInsert = handsVisibleOnInsert;
        this.username = username;
        this.name = name;
        this.date = new Date(); // Now

        this.decks = decks ? decks: [];
        this.counters = counters ? counters : [];

    }
}