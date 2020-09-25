import Deck from './deck';
import Counter from './counter';


export default class Configuration {
    id: number;
    userId: number;
    numPlayers: integer;
    handsVisibleOnInsert: boolean;
    decks: Deck[];
    // counters: Counter[];


    constructor(id: number, userId: number, numPlayers: integer, handsVisibleOnInsert: boolean, decks: Deck[], counters: Counter[]) {
        this.id = id;
        this.userId = userId;
        this.numPlayers = numPlayers;
        this.handsVisibleOnInsert = handsVisibleOnInsert;

        if (decks) {
            this.decks = decks;
        } else {
            this.decks = [];
        }
        if (counters) {
            this.decks = decks;
        } else {
            this.decks = [];
        }
    }
}