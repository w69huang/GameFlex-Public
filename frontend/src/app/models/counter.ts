
export default class Counter {
    id: number;
    name: string;
    currentValue: number;
    maxValue: number;
    minValue: number;
    increment: number;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(id, name, x, y) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
    }
}

