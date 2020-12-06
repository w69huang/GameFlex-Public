import { PlayspaceComponent } from '../playspace/playspace.component';
import Card from '../models/card';
import Deck from '../models/deck';
import OptionObject, { OptionObjectConfig } from '../models/optionObject';
import PopupScene from '../models/phaser-scenes/popupScene';
import { EGameObjectType, EActionTypes } from '../models/gameState';

import * as HelperFunctions from '../helper-functions';
import * as SharedActions from '../actions/sharedActions';

function popupClose(popupScene: PopupScene, deck: Deck, component: any) {
    component.phaserScene.scene.remove(popupScene.key);
    deck.rightClick = false;
}

export function deckRightClick(deck: Deck, component: any, pointer: Phaser.Input.Pointer, optionObjectConfig?: OptionObjectConfig) {
    if (pointer.rightButtonDown() && deck.rightClick == false) {

        let optionWidth = 200;
        let optionHeight = 75;
        let optionObjects = [];
        let optionSeparation = 10;
        optionObjects.push(new OptionObject("retrieveCard", retrieveTopCard, 'assets/images/buttons/retrieveTopCard.png', optionWidth, optionHeight, { destination: HelperFunctions.EDestination.TABLE }));
        optionObjects.push(new OptionObject("addTopCardToHand", retrieveTopCard, 'assets/images/buttons/addTopCardToHand.png', optionWidth, optionHeight, { destination: HelperFunctions.EDestination.HAND }));
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

export function retrieveTopCard(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, optionObjectConfig: OptionObjectConfig, pointer: Phaser.Input.Pointer) {
    if (playspaceComponent.gameState.getAmHost()) {
        const card: Card = playspaceComponent.gameState.getCardFromDeck(deck.cards.length - 1, deck.id, true);

        if (card) {
            if (card.gameObject == null) {
                card.inDeck = false;

                HelperFunctions.createCard(card, playspaceComponent, 
                    SharedActions.onDragMove, 
                    SharedActions.onDragEnd, 
                    optionObjectConfig.destination
                );

                if (optionObjectConfig.destination === HelperFunctions.EDestination.TABLE) {
                    playspaceComponent.gameState.sendPeerData(
                        EActionTypes.sendTopCard,
                        {
                            cardID: card.id,
                            deckID: deck.id,
                            imagePath: card.imagePath,
                            type: EGameObjectType.CARD,
                            x: deck.x,
                            y: deck.y,
                            destination: optionObjectConfig.destination
                        }                  
                    );
                }
            }
        }
    } else {
        playspaceComponent.gameState.sendPeerData(
            EActionTypes.retrieveTopCard,
            {
                deckID: deck.id,
                type: EGameObjectType.CARD,
                destination: optionObjectConfig.destination
            }
        );
    }

    popupClose(popupScene, deck, playspaceComponent);
}

export function shuffleDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    if (playspaceComponent.gameState.getAmHost()) {
        let shuffled = deck.cards.map((card) => ({randomVal: Math.random(), card: card}))
                                .sort((object1, object2) => object1.randomVal - object2.randomVal)
                                .map((object) => object.card);

        playspaceComponent.gameState.replaceCardsInDeck(shuffled, deck.id);
    }

    popupClose(popupScene, deck, playspaceComponent);
}

export function importDeck(popupScene: PopupScene, deck: Deck, playspaceComponent: PlayspaceComponent) {
    let imagePaths: string[] = ["assets/images/playing-cards/king_of_hearts.png", "assets/images/playing-cards/king_of_hearts.png"];

    if (playspaceComponent.gameState.getAmHost()) {
        imagePaths.forEach((imagePath: string) => {
            playspaceComponent.gameState.addCardToDeck(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y), deck.id)
        });
    }

    if (!playspaceComponent.gameState.getAmHost()) {
        playspaceComponent.gameState.sendPeerData(
            EActionTypes.importDeck,
            {
                deckID: deck.id,
                type: EGameObjectType.DECK,
                imagePaths: imagePaths,
            }
        );
    }

   popupClose(popupScene, deck, playspaceComponent);
}