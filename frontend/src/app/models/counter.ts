
export default class Counter {
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

