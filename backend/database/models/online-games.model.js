module.exports = OnlineGame;

var OnlineGame = function(onlineGame) {
    this.onlineGameCode = onlineGame.onlineGameCode;
    this.name = onlineGame.name;
    this.hostID = onlineGame.hostID;
    this.numPlayers = onlineGame.numPlayers;
    this.maxPlayers = onlineGame.maxPlayers;
    this.passwordProtected = onlineGame.passwordProtected;
    this.encryptedPassword = onlineGame.encryptedPassword;
    this.private = onlineGame.private;
    this.configurationID = onlineGame.configurationID;
}

