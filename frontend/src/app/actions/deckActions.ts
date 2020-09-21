import { PlayspaceComponent } from '../playspace/playspace.component';
import Card from '../models/card';
import Deck from '../models/deck';
import OptionObject from '../models/optionObject';
import PopupScene from '../models/phaser-scenes/popupScene';

import * as HelperFunctions from '../helper-functions';

enum DestinationEnum {
    TABLE = "Table",
    HAND = "Hand"
}

export function deckRightClick(deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown()) {
        let optionWidth = 200;
        let optionHeight = 75;
        let optionObjects = [];
        let optionSeparation = 10;
        optionObjects.push(new OptionObject("retrieveCard", retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', optionWidth, optionHeight));
        optionObjects.push(new OptionObject("shuffleDeck", shuffleDeck, 'assets/images/buttons/shuffleDeck.png', optionWidth, optionHeight));
        optionObjects.push(new OptionObject("importDeck", importDeck, 'assets/images/buttons/importDeck.png', optionWidth, optionHeight));
        let width = 250;
        let height = optionHeight*optionObjects.length + (optionObjects.length - 1)*optionSeparation;

        let handle = "popup" + playspaceComponent.popupCount++;
        
        let popupScene = new PopupScene(handle, pointer.x, pointer.y, playspaceComponent, deck, width, height, optionObjects, optionSeparation);

        playspaceComponent.phaserScene.scene.add(handle, popupScene, true);
    }
}

export function retrieveTopCard(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    if (playspaceComponent.amHost) {
        var card = deck.cards.pop();

        if (card) {
            if (card.gameObject == null) {
                card.inDeck = false;

                HelperFunctions.createCard(card, playspaceComponent, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

                if (playspaceComponent.conn) {
                    playspaceComponent.conn.send({
                        'action': 'sendTopCard',
                        'type': 'card',
                        'cardID': card.id,
                        'imagePath': card.imagePath,
                        'deckID': deck.id,
                        'x': deck.gameObject.x,
                        'y': deck.gameObject.y,
                        'amHost': playspaceComponent.amHost,
                        'playerID': playspaceComponent.playerID
                    });
                }
            }
        }
    } else if (playspaceComponent.conn) {
        playspaceComponent.conn.send({
        'action': 'retrieveTopCard',
        'type': 'card',
        'deckID': deck.id,
        'amHost': playspaceComponent.amHost,
        'playerID': playspaceComponent.playerID
        });
    }

    HelperFunctions.popupClose(popupScene, playspaceComponent);
}

export function shuffleDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (playspaceComponent.amHost) {
        let shuffled = deck.cards.map((card) => ({randomVal: Math.random(), card: card}))
                                .sort((object1, object2) => object1.randomVal - object2.randomVal)
                                .map((object) => object.card);

        deck.cards = shuffled;

        let shuffledCardIDs = [];

        shuffled.forEach((card: Card) => {
        shuffledCardIDs.push(card.id);
        });

        // TODO: Only host can shuffle, and host is not sending shuffled data to players
        // Can change if necessary

        //if (playspaceComponent.conn) {
        //  playspaceComponent.conn.send({
        //  'action': 'shuffle',
        //  'type': 'deck',
        //  'deckID': deck.id,
        //  'shuffledCardIDs': shuffledCardIDs,
        //  'amHost': playspaceComponent.amHost,
        //  'playerID': playspaceComponent.playerID
        //  });
        //}
    }

    HelperFunctions.popupClose(popupScene, playspaceComponent);
}

export function importDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    let imagePaths: string[] = ["assets/images/playing-cards/king_of_hearts.png", "assets/images/playing-cards/king_of_hearts.png"];

    if (playspaceComponent.amHost) {
        imagePaths.forEach((imagePath: string) => {
        deck.cards.push(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y));
        });
    }

    if (playspaceComponent.conn && !playspaceComponent.amHost) { // If the host imports a deck, the other players don't need that info
        playspaceComponent.conn.send({
        'action': 'importDeck',
        'type': 'deck',
        'imagePaths': imagePaths,
        'deckID': deck.id,
        'amHost': playspaceComponent.amHost,
        'playerID': playspaceComponent.playerID
        });
    }

    HelperFunctions.popupClose(popupScene, playspaceComponent);
}