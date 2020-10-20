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
    handMins: HandMin[] = [];
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
        gameState.hands.forEach((hand: Hand) => {
            this.handMins.push(new HandMin(hand));
        });
        playerData.forEach((data: PlayerData) => {
            this.savedPlayerData.push(new SavedPlayerData(data));
        });
    }
}