import PlayerData from '../models/playerData';

export default class SavedPlayerData {
    playerID: number;
    username: string;

    constructor(playerData: PlayerData) {
        this.playerID = playerData.id;
        this.username = playerData.username;
    }
}