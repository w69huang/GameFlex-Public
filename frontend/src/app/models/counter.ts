import { runInThisContext } from 'vm';

export default class Counter {
    id: number;
    name: string;
    value: number = 0;
    maxValue: number = 99;
    minValue: number = -99;
    // increment: number;
    // x: number;
    // y: number;
    // width: number;
    // height: number;

    constructor(id, name, value) {
        this.id = id;
        this.name = name;
        this.value = value
        // this.x = x;
        // this.y = y;
        // this.width = width;
        // this.height = height;
        // this.increment = increment;
    }
}

