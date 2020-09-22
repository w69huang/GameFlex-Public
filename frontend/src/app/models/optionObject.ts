export default class OptionObject {
    optionKey: string;
    optionFunction: Function;
    optionImage: string;
    optionWidth: number;
    optionHeight: number;

    constructor (optionKey, optionFunction, optionImage, optionWidth, optionHeight) {
        this.optionKey = optionKey;
        this.optionFunction = optionFunction;
        this.optionImage = optionImage;
        this.optionWidth = optionWidth;
        this.optionHeight = optionHeight;
    }
}