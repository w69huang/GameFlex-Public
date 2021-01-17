
SET FOREIGN_KEY_CHECKS=0;

use testdb;

DROP TABLE IF EXISTS `UserMySQL`;
DROP TABLE IF EXISTS `StoredDeckMySQL`;
DROP TABLE IF EXISTS `OnlineGameMySQL`;
DROP TABLE IF EXISTS `SavedGameStateMySQL`;
DROP TABLE IF EXISTS `ConfigurationMySQL`;

CREATE TABLE `UserMySQL` (
    `userID` char(50) NOT NULL,
    `username` char(20) NOT NULL,
    `password` char(50) NOT NULL,
    `email` char(50) NOT NULL,
    PRIMARY KEY (`userid`)
);

CREATE TABLE `StoredDeckMySQL` (
    `storedDeckID` char(50) NOT NULL,
    `userID` char(50)  NOT NULL,
    `name` char(100),
    PRIMARY KEY (`storedDeckID`)
);

CREATE TABLE `OnlineGameMySQL` (
	`id` char(50) NOT NULL,
    `onlineGameCode` char(50) DEFAULT NULL,
    `username` char(20) NOT NULL,
    `name` char(100) NOT NULL,
    `hostID` char(50) NOT NULL, 
    `numPlayers` int NOT NULL,
    `maxPlayers` int NOT NULL,
    `passwordProtected` BOOLEAN NOT NULL,
    `privateGame` BOOLEAN NOT NULL,
    `encryptedPassword` char(100) DEFAULT NULL,
    `configurationID` int NOT NULL,
    `lastUpdated` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
);

CREATE TABLE `BannedUsers` {
    `userID` char(50) NOT NULL,
    `gameID` char(50) NOT NULL
}

CREATE TABLE `SavedGameStateMySQL` (
    `gameStateID` char(50) NOT NULL,
    `userID` char(50) NOT NULL,
    `name` char(100) NOT NULL,
    `date` DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`gameStateID`)
);

CREATE TABLE `ConfigurationMySQL` (
    `configurationID` int UNSIGNED NOT NULL,
    `userID` char(50) NOT NULL,
    `name` char(100) NOT NULL,
    `privateConfig` BOOLEAN NOT NULL,
    `upvotes` int UNSIGNED DEFAULT 0,

    PRIMARY KEY(`configurationID`)

);


SET FOREIGN_KEY_CHECKS=1;
