export default class OnlineGame {
    onlineGameCode: string;
    name: string;
    hostID: string;
    numPlayers: number;
    maxPlayers: number;
    passwordProtected: boolean;
    privateGame: boolean;
    encryptedPassword: string;
    configurationID: number;

    constructor (hostID: string, name: string, maxPlayers: number, privateGame: boolean, passwordProtected: boolean, encryptedPassword: string, configurationID: number) {
        this.onlineGameCode = this.generateRandomString(6);
        this.name = name;
        this.hostID = hostID;
        this.numPlayers = 1;
        this.maxPlayers = maxPlayers;
        this.passwordProtected = passwordProtected;
        this.privateGame = privateGame;
        this.encryptedPassword = encryptedPassword;
        this.configurationID = configurationID;
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