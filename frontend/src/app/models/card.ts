export default class Card {
    gameObject: Phaser.GameObjects.Image = null;
    id: number;
    imagePath: string;
    type: string = "card";
    x: number;
    y: number;
    inDeck: boolean = false;
    inHand: boolean = false;

    constructor(id: number, imagePath: string, x: number, y: number) {
        this.id = id;
        this.imagePath = imagePath;
        this.x = x;
        this.y = y;
    }
}