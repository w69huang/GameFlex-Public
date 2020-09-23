export default class Card {
    gameObject: Phaser.GameObjects.Image = null;
    id: number;
    imagePath: string;
    type: string = "card";
    x: number;
    y: number;
    inDeck: boolean;
    inHand: boolean;

    constructor(id: number, imagePath: string, x: number, y: number, inHand: boolean = false, inDeck: boolean = false) {
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
        this.inHand = inHand;
        this.inDeck = inDeck;
    }
}