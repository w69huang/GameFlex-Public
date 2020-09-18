export default class OnlineGame {
    hostID: string;
    onlineGameCode: string;
    name: string;
    numPlayers: number;
    maxPlayers: number;
    passwordProtected: boolean;
    privateGame: boolean;
    encryptedPassword: string;
    configurationID: number;

    constructor (hostID: string, name: string, maxPlayers: number, privateGame: boolean, passwordProtected: boolean, encryptedPassword: string, configurationID: number) {
        this.hostID = hostID;
        this.name = name;
        this.maxPlayers = maxPlayers;
        this.privateGame = privateGame;
        this.passwordProtected = passwordProtected;
        this.encryptedPassword = encryptedPassword;
        this.configurationID = configurationID;
        this.numPlayers = 1;
        this.onlineGameCode = this.generateRandomString(6);
    }

    generateRandomString (length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}