import Card from './card';
import { EGameObjectType } from '../models/gameState'

export default class Deck {
    /**
     * The phaser game object for the deck
     */
    gameObject: Phaser.GameObjects.Image = null;

    /**
     * The unique ID of the deck in the current game
     */
    id: number;

    /**
     * The image path used for the phaser game object that represents the deck
     */
    imagePath: string;

    /**
     * The list of cards the deck holds - SHOULD ONLY BE MODIFIED IN THE GAMESTATE CLASS IN ORDER TO ALLOW CACHING TO WORK
     */
    cards: Card[];

    /**
     * The deck's type in string form
     */
    type: string = EGameObjectType.DECK;

    /**
     * The x position of the deck - SHOULD BE UPDATED MANUALLY WHENEVER THE GAMEOBJECT'S POSITION CHANGES
     */
    x: number;

    /**
     * The y position of the deck - SHOULD BE UPDATED MANUALLY WHENEVER THE GAMEOBJECT'S POSITION CHANGES
     */
    y: number;

    /**
     * Boolean used to determine whether or not a deck's right click menu is already open
     */
    rightClick: boolean;

    /**
     * Used to create a new deck
     * @param id - The ID for the deck
     * @param imagePath - The image path for the deck's phaser game object
     * @param cards - The cards to put in the deck at creation time
     * @param x - The starting x position of the deck
     * @param y - The starting y position of the deck
     */
    constructor(id: number, imagePath: string, cards: Card[], x: number, y: number) {
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.rightClick = false;

        if (cards) {
            this.cards = cards;
        } else {
            this.cards = [];
        }
    }
}