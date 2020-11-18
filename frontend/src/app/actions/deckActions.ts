import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import Card from '../models/card';
import Deck from '../models/deck';
import OptionObject from '../models/optionObject';
import PopupScene from '../models/phaser-scenes/popupScene';
import { EGameObjectType, GameObjectProperties } from '../models/gameState';

import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';


enum DestinationEnum {
    TABLE = "Table",
    HAND = "Hand"
}

function popupClose(popupScene: PopupScene, deck: Deck, component: any) {
    component.phaserScene.scene.remove(popupScene.key);
    deck.rightClick = false;
}

export function deckRightClick(deck: Deck, component: any, pointer: Phaser.Input.Pointer) {
    if (pointer.rightButtonDown() && deck.rightClick == false) {

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
        deck.rightClick = true;
    }
}

export function retrieveTopCard(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    if (playspaceComponent.amHost) {
        const card: Card = playspaceComponent.gameState.getCardFromDeck(deck.cards.length - 1, deck.id, true);

        if (card) {
            if (card.gameObject == null) {
                card.inDeck = false;

                HelperFunctions.createCard(card, playspaceComponent, SharedActions.onDragMove, SharedActions.onDragEnd, DestinationEnum.TABLE, deck.gameObject.x, deck.gameObject.y);

                if (playspaceComponent.connections) {
                    playspaceComponent.gameState.sendPeerData(
                        new GameObjectProperties(
                          playspaceComponent.amHost,
                          'sendTopCard',
                          playspaceComponent.myPeerID,
                          playspaceComponent.playerID,
                          {
                            cardID: card.id,
                            deckID: deck.id,
                            imagePath: card.imagePath,
                            type: EGameObjectType.CARD,
                            x: deck.x,
                            y: deck.y
                          }
                        ),
                        playspaceComponent.connections
                    );
                }
            }
        }
    } else if (playspaceComponent.connections) {
        playspaceComponent.gameState.sendPeerData(
            new GameObjectProperties(
              playspaceComponent.amHost,
              'retrieveTopCard',
              playspaceComponent.myPeerID,
              playspaceComponent.playerID,
              {
                deckID: deck.id,
                type: EGameObjectType.CARD,
              }
            ),
            playspaceComponent.connections
        );
    }

    popupClose(popupScene, deck, playspaceComponent);
}

export function shuffleDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (playspaceComponent.amHost) {
        let shuffled = deck.cards.map((card) => ({randomVal: Math.random(), card: card}))
                                .sort((object1, object2) => object1.randomVal - object2.randomVal)
                                .map((object) => object.card);

        playspaceComponent.gameState.replaceCardsInDeck(shuffled, deck.id);
    }

    popupClose(popupScene, deck, playspaceComponent);
}

export function importDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    let imagePaths: string[] = ["assets/images/playing-cards/king_of_hearts.png", "assets/images/playing-cards/king_of_hearts.png"];

    if (playspaceComponent.amHost) {
        imagePaths.forEach((imagePath: string) => {
            playspaceComponent.gameState.addCardToDeck(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y), deck.id)
        });
    }

    if (playspaceComponent.connections && !playspaceComponent.amHost) {
        playspaceComponent.gameState.sendPeerData(
            new GameObjectProperties(
              playspaceComponent.amHost,
              'importDeck',
              playspaceComponent.myPeerID,
              playspaceComponent.playerID,
              {
                deckID: deck.id,
                type: EGameObjectType.DECK,
                imagePaths: imagePaths,
              }
            ),
            playspaceComponent.connections
        );
    }

   popupClose(popupScene, deck, playspaceComponent);
}