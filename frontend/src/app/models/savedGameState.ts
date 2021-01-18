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
    base64Decks: String[] = [];

    constructor(username: string, name: string, gameState: GameState, playerData: PlayerData[]) { 
        this.username = username;
        this.name = name;
        this.date = new Date(); // Now
        gameState.cards.forEach((card: Card) => {
            if( card.base64 == false ){
                this.cardMins.push(new CardMin(card));
            } else {
               var cardMin = new CardMin(card);
               cardMin.id = card.base64Id;
               cardMin.base64 = true;
               cardMin.deckName = card.base64Deck;
               this.cardMins.push(cardMin);
            }
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
        this.base64Decks = gameState.base64Decks;
    }
}