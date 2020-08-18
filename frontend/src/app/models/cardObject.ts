import Phaser from 'phaser';

export default class Card extends Phaser.GameObjects.Image {
    gameObject: Phaser.GameObjects.Image;
    id: number;
    imagePath: string;

    constructor(scene: Phaser.Scene, x: number, y: number, phaserID: string, id: number, imagePath: string) {
        super(scene, x, y, phaserID);
        this.id = id;
        this.imagePath = imagePath;
    }
}