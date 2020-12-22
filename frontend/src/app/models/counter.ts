export default class Counter {
    id: number;
    name: string;
    value: number = 0;
    maxValue: number = 99;
    minValue: number = -99;

    constructor(id, name, value) {
        this.id = id;
        this.name = name;
        this.value = value
    }
}

