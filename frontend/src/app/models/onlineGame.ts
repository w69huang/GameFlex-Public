export default class OnlineGame {
    id: number;
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

    constructor (hostID: string, name: string, maxPlayers: number, privateGame: boolean, passwordProtected: boolean, encryptedPassword: string, configurationID: number) {
        this.id = Math.round(Math.random()*10000); // TODO: Database call to check if this ID is taken
        this.onlineGameCode = this.generateRandomString(6);
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

    generateRandomString (length: number) {
        // TODO: Database call to check if string is taken as a code

        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}