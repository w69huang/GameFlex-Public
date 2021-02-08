import PlayerData from '../models/playerData';

/**
 * A model representing playerID/username pairs for a game that will be stored in the DB
 */
export default class SavedPlayerData {
    /**
     * The playerID of a given player
     */
    playerID: number;

    /**
     * The given player's username
     */
    username: string;

    /**
     * A token for each player that allows them to rejoin locked rooms if they disconnect
     */
    token: string;

    /**
     * A constructor that builds saved player data from a normal player data object
     * @param playerData - The player data object to build from
     */
    constructor(playerData: PlayerData) {
        this.playerID = playerData.id;
        this.username = playerData.username;
    }
}