export default class Card {
    gameObject: Phaser.GameObjects.Image = null;
    id: number;
    imagePath: string;

    constructor(id: number, imagePath: string) {
        this.id = id;
        this.imagePath = imagePath;
    }
}