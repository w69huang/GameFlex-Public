import { EGameObjectType } from '../models/gameState';

/**
 * The class that defines everything to do with a single card
 */
export default class Card {
    /**
     * The phaser game object for the card
     */
    gameObject: Phaser.GameObjects.Image = null;

    /**
     * The unique ID of the card in the current game
     */
    id: number;

    /**
     * The image path used for the phaser game object that represents the card
     */
    imagePath: string;

    /**
     * The card's type in string form
     */
    type: string = EGameObjectType.CARD;

    /**
     * The x position of the card - SHOULD BE UPDATED MANUALLY WHENEVER THE GAMEOBJECT'S POSITION CHANGES
     */
    x: number;

    /**
     * The y position of the card - SHOULD BE UPDATED MANUALLY WHENEVER THE GAMEOBJECT'S POSITION CHANGES
     */
    y: number;

    /**
     * Whether the card is flipped over or not
     */
    flippedOver: boolean;

    /**
     * Whether the card is in a deck
     */
    inDeck: boolean;

    /**
     * Whether the card is in a hand
     */
    inHand: boolean;

    /**
     * Boolean used to determine whether or not a deck's right click menu is already open
     */
    rightClick: boolean = false;

    /**
     * Used to create a new card
     * @param id - The ID for the card
     * @param imagePath - The image path for the card's phaser game object
     * @param x - The starting x position of the card
     * @param y - The starting y position of the card
     * @param inHand - Whether or not the card is in a hand at creation time
     * @param inDeck - Whether or not the card is in a deck at creation time
     */
    constructor(id: number, imagePath: string, x: number, y: number, flippedOver: boolean = false, inHand: boolean = false, inDeck: boolean = false) {
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.flippedOver = flippedOver
        this.inHand = inHand;
        this.inDeck = inDeck;
    }
}