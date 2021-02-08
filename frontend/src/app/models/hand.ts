import Card from './card';
import * as HF from '../helper-functions';

export default class Hand {
    /**
     * The phaser game object for the hand
     */
    gameObject: Phaser.GameObjects.Image = null;

    /**
     * The ID of the player the hand belongs to
     */
    playerID: number;

    /**
     * The list of cards the hand holds - SHOULD ONLY BE MODIFIED IN THE GAMESTATE CLASS IN ORDER TO ALLOW CACHING TO WORK
     */
    cards: Card[];

    /**
     * The hand's type in string form
     */
    type: string = HF.EGameObjectType.HAND;

    /**
     * Used to create a hand
     * @param playerID - The ID of the player who owns the hand
     * @param cards - The cards to put in the hand at creation time
     */
    constructor(playerID: number, cards: Card[]) {
        this.playerID = playerID;

        if (cards) {
            this.cards = cards;
        } else {
            this.cards = [];
        }
    }
}