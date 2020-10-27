import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import Card from '../models/card';
import Deck from '../models/deck';

// Drag move callback for moving objects on the phaser canvas
// Will be used for both the config editor and the playspace
export function onDragMove(object: any, component: any, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
  if (object.type == 'deck' || object.type == 'card') {
    object.x = dragX;
    object.y = dragY;
    object.gameObject.setX(dragX);
    object.gameObject.setY(dragY);

    if (component.connections) {
      component.connections.forEach((connection: DataConnection) => {
        connection.send({
          'action': 'move',
          'type': object.type,
          'id': object.id,
          'x': dragX,
          'y': dragY,
          'amHost': component.amHost,
          'playerID': component.playerID,
          'peerID': component.myPeerID
        });
      });
    }
  }
}


// Drag end callback for finishing moving objects on the phaser canvas
// Will only be used in the playspace as right now it only applies to cards
export function onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

  if (object.type === 'card') {
    // Step 1: Find Card

    let card: Card = null;
    let found = false;
    let foundInHand = false;

    playspaceComponent.gameState.myHand.cards.forEach((refCard: Card) => {
      if (object.id === refCard.id) {
        card = refCard;
        found = true;
        foundInHand = true;
      }
    });

    if (!found) {
      playspaceComponent.gameState.cards.forEach((refCard: Card) => {
        if (object.id === refCard.id) {
          card = refCard;
          found = true;
        }
      });
    }

    if (found) {
      let myCenterX = object.gameObject.x + object.gameObject.displayWidth / 2;
      let myCenterY = object.gameObject.y + object.gameObject.displayHeight / 2;
      let inserted = false;
      let handOverlap = false;
      let hand = playspaceComponent.gameState.myHand;

      // Step 2: Detect overlap with deck or hand

      if (myCenterX > hand.gameObject.x && myCenterX < hand.gameObject.x + hand.gameObject.displayWidth && myCenterY > hand.gameObject.y && myCenterY < hand.gameObject.y + hand.gameObject.displayHeight) {
        handOverlap = true;
        if (!card.inHand) {
          inserted = true;
          card.inHand = true;
          hand.cards.push(card);

          if (playspaceComponent.connections) {
            playspaceComponent.connections.forEach((connection: DataConnection) => {
              connection.send({
                'action': 'insertIntoHand',
                'type': object.type,
                'cardID': card.id,
                'amHost': playspaceComponent.amHost,
                'playerID': playspaceComponent.playerID,
                'peerID': playspaceComponent.myPeerID
              });
            });
          }

          playspaceComponent.gameState.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.cards, card);
        }
      } else {
        playspaceComponent.gameState.decks.forEach((deck: Deck) => {
          if (!inserted && myCenterX > deck.gameObject.x && myCenterX < deck.gameObject.x + deck.gameObject.displayWidth && myCenterY > deck.gameObject.y && myCenterY < deck.gameObject.y + deck.gameObject.displayHeight) {
            // If card overlapping with deck

            inserted = true;
            card.inDeck = true;
            card.inHand = false;

            if (playspaceComponent.amHost) {
              // If we're not the host, we don't know what's in the deck
              deck.cards.push(card);
            }

            if (playspaceComponent.connections) {
              playspaceComponent.connections.forEach((connection: DataConnection) => {
                connection.send({
                  'action': 'insertIntoDeck',
                  'type': object.type,
                  'cardID': object.id,
                  'deckID': deck.id,
                  'imagePath': object.imagePath,
                  'x': object.gameObject.x,
                  'y': object.gameObject.y,
                  'foundInHand': foundInHand,
                  'amHost': playspaceComponent.amHost,
                  'playerID': playspaceComponent.playerID,
                  'peerID': playspaceComponent.myPeerID
                });
              });
            }

            card.gameObject.destroy();
            card.gameObject = null;

            // We need to remove the card from where it originated
            if (foundInHand) {
              playspaceComponent.gameState.myHand.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.myHand.cards, card);
            } else {
              playspaceComponent.gameState.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.cards, card);
            }
          }
        });

        // If card removed from hand and not inserted in a deck
        if (!inserted && !handOverlap && card.inHand) {
          card.inHand = false;
          playspaceComponent.gameState.cards.push(card);

          if (playspaceComponent.connections) {
            playspaceComponent.connections.forEach((connection: DataConnection) => {
              connection.send({
                'action': 'removeFromHand',
                'type': object.type,
                'cardID': object.id,
                'imagePath': object.imagePath,
                'x': object.gameObject.x,
                'y': object.gameObject.y,
                'amHost': playspaceComponent.amHost,
                'playerID': playspaceComponent.playerID,
                'peerID': playspaceComponent.myPeerID
              });
            });
          }

          playspaceComponent.gameState.myHand.cards = playspaceComponent.filterOutID(playspaceComponent.gameState.myHand.cards, card);
        }
      }
    }
  }
}