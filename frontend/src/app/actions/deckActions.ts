import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import Card from '../models/card';
import Deck from '../models/deck';
import OptionObject from '../models/optionObject';
import PopupScene from '../models/phaser-scenes/popupScene';

import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';

enum DestinationEnum {
    TABLE = "Table",
    HAND = "Hand"
}

function popupClose(popupScene: PopupScene, component: any) {
    component.phaserScene.scene.remove(popupScene.key);
}

export function deckRightClick(deck: Deck, component: any, pointer: Phaser.Input.Pointer) {
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

        let handle = "popup" + component.popupCount++;
        
        let popupScene = new PopupScene(handle, pointer.x, pointer.y, component, deck, width, height, optionObjects, optionSeparation);

        component.phaserScene.scene.add(handle, popupScene, true);
    }
}

export function retrieveTopCard(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    if (playspaceComponent.amHost) {
        var card = deck.cards.pop();

        if (card) {
            if (card.gameObject == null) {
                card.inDeck = false;

                HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

                if (playspaceComponent.connections) {
                    playspaceComponent.connections.forEach((connection: DataConnection) => {
                        connection.send({
                            'action': 'sendTopCard',
                            'type': 'card',
                            'cardID': card.id,
                            'imagePath': card.imagePath,
                            'deckID': deck.id,
                            'x': deck.gameObject.x,
                            'y': deck.gameObject.y,
                            'amHost': playspaceComponent.amHost,
                            'playerID': playspaceComponent.playerID,
                            'peerID': playspaceComponent.myPeerID
                        });
                    });
 
                }
            }
        }
    } else if (playspaceComponent.connections) {
        playspaceComponent.connections.forEach((connection: DataConnection) => {
            connection.send({
                'action': 'retrieveTopCard',
                'type': 'card',
                'deckID': deck.id,
                'amHost': playspaceComponent.amHost,
                'playerID': playspaceComponent.playerID,
                'peerID': playspaceComponent.myPeerID
                });
        });
    }

    popupClose(popupScene, playspaceComponent);
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
        //  'playerID': playspaceComponent.playerID,
        //  'peerID': playspaceComponent.peerID
        //  });
        //}
    }

    popupClose(popupScene, playspaceComponent);
}

export function importDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    let imagePaths: string[] = ["assets/images/playing-cards/king_of_hearts.png", "assets/images/playing-cards/king_of_hearts.png"];

    if (playspaceComponent.amHost) {
        imagePaths.forEach((imagePath: string) => {
        deck.cards.push(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y));
        });
    }

    if (playspaceComponent.connections && !playspaceComponent.amHost) { // If the host imports a deck, the other players don't need that info
        playspaceComponent.connections.forEach((connection: DataConnection) => {
            connection.send({
                'action': 'importDeck',
                'type': 'deck',
                'imagePaths': imagePaths,
                'deckID': deck.id,
                'amHost': playspaceComponent.amHost,
                'playerID': playspaceComponent.playerID,
                'peerID': playspaceComponent.myPeerID
                });
        });
    }

   popupClose(popupScene, playspaceComponent);
}