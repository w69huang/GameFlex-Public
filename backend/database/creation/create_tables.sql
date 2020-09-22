
SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `UserMySQL`;
DROP TABLE IF EXISTS `StoredDeckMySQL`;
DROP TABLE IF EXISTS `OnlineGameMySQL`;
DROP TABLE IF EXISTS `SavedGameStateMySQL`;
DROP TABLE IF EXISTS `ConfigurationMySQL`;

CREATE TABLE `UserMySQL` (
    `userID` int UNSIGNED AUTO_INCREMENT,
    `username` char(20) NOT NULL,
    `password` char(50) NOT NULL,
    `email` char(50) NOT NULL,
    PRIMARY KEY (`userid`)
);

CREATE TABLE `StoredDeckMySQL` (
    `storedDeckID` int UNSIGNED NOT NULL,
    `userID` int UNSIGNED NOT NULL,
    `name` char(100),
    PRIMARY KEY (`storedDeckID`)
);

CREATE TABLE `OnlineGameMySQL` (
    `onlineGameCode` int UNSIGNED NOT NULL,
    `name` char(100) NOT NULL,
    `hostID` int NOT NULL, 
    `numPlayers` int NOT NULL,
    `maxPlayers` int NOT NULL,
    `passwordProtected` BOOLEAN NOT NULL,
    `private` BOOLEAN NOT NULL,
    `encryptedPassword` char(50) DEFAULT NULL,
    `configurationID` int NOT NULL,

    PRIMARY KEY (`onlineGameCode`)
);

CREATE TABLE `SavedGameStateMySQL` (
    `gameStateID` int UNSIGNED NOT NULL,
    `userID` int UNSIGNED NOT NULL,
    `name` char(100) NOT NULL,
    `date` DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`gameStateID`)
);

CREATE TABLE `ConfigurationMySQL` (
    `configurationID` int UNSIGNED NOT NULL,
    `userID` int UNSIGNED NOT NULL,
    `name` char(100) NOT NULL,
    `private` BOOLEAN NOT NULL,
    `upvotes` int UNSIGNED DEFAULT 0,

    PRIMARY KEY(`configurationID`)

);


SET FOREIGN_KEY_CHECKS=1;