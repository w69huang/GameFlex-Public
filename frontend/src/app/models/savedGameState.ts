import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import GameState from './gameState';
import PlayerData from '../models/playerData';
import SavedPlayerData from '../models/savedPlayerData';
import Counter from './counter';

/**
 * The class that represents what information is saved when a user saves a game to the database
 */
export default class SavedGameState {
    /**
     * The username of the person saving the game state
     */
    username: string;

    /**
     * The name of the save that the user chooses
     */
    name: string;

    /**
     * The date the game was saved
     */
    date: Date;

    /**
     * The list of minified cards to save
     */
    cardMins: CardMin[] = [];
    
    /**
     * The list of minified decks to save
     */
    deckMins: DeckMin[] = [];

    /**
     * The list of counters to save (no need to minify)
     */
    counters: Counter[] = [];

    /**
     * A list of username/playerID pairs
     */
    handMins: any = [];

    /**
     * An array of saved player data to track username/playerID pairs
     */
    savedPlayerData: SavedPlayerData[] = [];

    /**
     * A constructor that builds the saved game state from a given game state + extra data that they included when saving
     * @param username - The username that the user is saving the game under
     * @param name - The name of the save that the user chooses
     * @param gameState - The game state the save is being generated from
     */
    constructor(username: string, name: string, gameState: GameState) { 
        this.username = username;
        this.name = name;
        this.date = new Date(); // Now
        gameState.cards.forEach((card: Card) => {
            this.cardMins.push(new CardMin(card));
        });
        gameState.decks.forEach((deck: Deck) => {
            this.deckMins.push(new DeckMin(deck));
        });

        Object.entries(gameState.hands).forEach((keyval) => {
            const playerID = parseInt(keyval[0]);
            const hands = keyval[1];
            let convertedHands = [];

            // convert hands to handMins
            hands.forEach(hand => {
                convertedHands.push(new HandMin(hand));
            });

            this.handMins.push({ playerID: playerID, innerHandMins: convertedHands});

        });
        gameState.counters.forEach((counter: Counter) => {
            this.counters.push(new Counter(counter.id, counter.name, counter.value));
        });
        gameState.playerDataObjects.forEach((data: PlayerData) => {
            this.savedPlayerData.push(new SavedPlayerData(data));
        });
    }
}