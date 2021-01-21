import Card from './card';
import Deck from './deck';
import Hand from './hand';
import CardMin from './cardMin';
import DeckMin from './deckMin';
import HandMin from './handMin';
import GameState from './gameState';
import PlayerData from '../models/playerData';
import SavedPlayerData from '../models/savedPlayerData';

export default class SavedGameState {
    username: string;
    name: string;
    date: Date;
    cardMins: CardMin[] = [];
    deckMins: DeckMin[] = [];
    handMins: any = [];
    savedPlayerData: SavedPlayerData[] = [];

    constructor(username: string, name: string, gameState: GameState, playerData: PlayerData[]) { 
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
        playerData.forEach((data: PlayerData) => {
            this.savedPlayerData.push(new SavedPlayerData(data));
        });
    }
}