import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import Card from '../models/card';
import { EOverlapType, GameObjectProperties, OverlapObject } from '../models/gameState';

// Drag move callback for moving objects on the phaser canvas
// Will be used for both the config editor and the playspace
export function onDragMove(object: any, component: any, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (object.type == 'deck' || object.type == 'card') {
        object.x = dragX;
        object.y = dragY;
        object.gameObject.setX(dragX);
        object.gameObject.setY(dragY);
        
        if (component.connections) {
          component.gameState.sendPeerData(
            new GameObjectProperties(
              component.amHost,
              'move',
              component.myPeerID,
              component.playerID,
              {
                id: object.id,
                type: object.type,
                x: dragX,
                y: dragY
              }
            ),
            component.connections
          );
        }
    }
}

// Drag end callback for finishing moving objects on the phaser canvas
// Will only be used in the playspace as right now it only applies to cards
export function onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {

    // TODO: If card being moved around in hand, report back to host
    const card: Card = playspaceComponent.gameState.getCardByID(object.id, playspaceComponent.playerID)?.card;
    const overlapObject: OverlapObject = playspaceComponent.gameState.checkForOverlap(object.id, playspaceComponent.playerID);

    if (playspaceComponent.connections) {
      if (overlapObject.overlapType === EOverlapType.HAND) {
        playspaceComponent.gameState.sendPeerData(
          new GameObjectProperties(
            playspaceComponent.amHost,
            'insertIntoHand',
            playspaceComponent.myPeerID,
            playspaceComponent.playerID,
            {
              id: card.id,
              type: object.type,
            }
          ),
          playspaceComponent.connections
        );
      } else if (overlapObject.overlapType === EOverlapType.ALREADYINHAND || (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === false)) {
        // If overlapped with only the table or the card was already in hand and overlapped with hand again, report movement
        playspaceComponent.gameState.sendPeerData(
          new GameObjectProperties(
            playspaceComponent.amHost,
            'move',
            playspaceComponent.myPeerID,
            playspaceComponent.playerID,
            {
              id: object.id,
              type: object.type,
              x: object.x,
              y: object.y,
              finishedMoving: true
            }
          ),
          playspaceComponent.connections
        );
      } else if (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === true) {
        // If card overlapped with table and it was in my hand previously
        playspaceComponent.gameState.sendPeerData(
          new GameObjectProperties(
            playspaceComponent.amHost,
            'removeFromHand',
            playspaceComponent.myPeerID,
            playspaceComponent.playerID,
            {
              cardID: object.id,
              type: object.type,
              imagePath: object.imagePath,
              x: object.x,
              y: object.y,
              finishedMoving: true
            }
          ),
          playspaceComponent.connections
        );
      } else if (overlapObject.overlapType === EOverlapType.DECK) {
        playspaceComponent.gameState.sendPeerData(
          new GameObjectProperties(
            playspaceComponent.amHost,
            'insertIntoDeck',
            playspaceComponent.myPeerID,
            playspaceComponent.playerID,
            {
              cardID: object.id,
              deckID: overlapObject.deckID,
              type: object.type,
              imagePath: object.imagePath,
              x: object.x,
              y: object.y
            }
          ),
          playspaceComponent.connections
        );
      }
    }
  }