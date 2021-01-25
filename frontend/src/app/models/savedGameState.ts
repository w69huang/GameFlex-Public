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
        this.base64Decks = gameState.base64Decks;
    }
}