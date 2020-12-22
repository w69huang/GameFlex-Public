import * as HelperFunctions from '../helper-functions';

/**
 * A class that will hold all possible forms of data that one may want to store in an option object
 */
export class OptionObjectConfig {
    destination?: HelperFunctions.EDestination;
}

/**
 * Represents all the generic data associated with an option in a popup
 */
export default class OptionObject {
    optionKey: string;
    optionFunction: Function;
    optionImage: string;
    optionWidth: number;
    optionHeight: number;
    optionObjectConfig: OptionObjectConfig;

    constructor (optionKey: string, optionFunction: Function, optionImage: string, optionWidth: number, optionHeight: number, optionObjectConfig?: OptionObjectConfig) {
        this.optionKey = optionKey;
        this.optionFunction = optionFunction;
        this.optionImage = optionImage;
        this.optionWidth = optionWidth;
        this.optionHeight = optionHeight;
        this.optionObjectConfig = optionObjectConfig;
    }
}