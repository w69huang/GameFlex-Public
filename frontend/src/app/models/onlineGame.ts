export default class OnlineGame {
    id: string;
    username: string;
    onlineGameCode: string;
    name: string;
    hostID: string;
    numPlayers: number;
    maxPlayers: number;
    passwordProtected: boolean;
    privateGame: boolean;
    encryptedPassword: string;
    configurationID: number;
    lastUpdated: number;

    constructor (id: string, onlineGameCode: string, username: string, hostID: string, name: string, maxPlayers: number, privateGame: boolean, passwordProtected: boolean, encryptedPassword: string, configurationID: number) {
        this.id = id;
        this.username = username;
        this.onlineGameCode = onlineGameCode;
        this.name = name;
        this.hostID = hostID;
        this.numPlayers = 1;
        this.maxPlayers = maxPlayers;
        this.passwordProtected = passwordProtected;
        this.privateGame = privateGame;
        this.encryptedPassword = encryptedPassword;
        this.configurationID = configurationID;
        this.lastUpdated = Date.now();
    }
}