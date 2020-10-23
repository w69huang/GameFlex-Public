
export default class Counter {
    gameObject: Phaser.GameObjects.Image = null;
    id: number;
    name: string;
    currentValue: number = 0;
    maxValue: number = 99;
    minValue: number = -99;
    // increment: number;
    x: number;
    y: number;
    width: number;
    height: number;
    type: string = 'counter'; //TODO: Can these all just inherit from a 'renderableObject' which has the properties 'image', 'gameObject' and 'type' ie: anything not going to the backend. So we don't have to have a counterMin

    constructor(id, name, x, y, width = 50, height = 50, increment = 1) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        // this.increment = increment;
    }
}

