import { PlayspaceComponent } from '../playspace/playspace.component';
import { DataConnection } from 'peerjs';
import Card from '../models/card';
import { EOverlapType, OverlapObject } from '../models/gameState';

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

    // TODO: If card being moved around in hand, report back to host
    const card: Card = playspaceComponent.gameState.getCardByID(object.id, playspaceComponent.playerID)?.card;
    const overlapObject: OverlapObject = playspaceComponent.gameState.checkForOverlap(object.id, playspaceComponent.playerID);

    if (playspaceComponent.connections) {
      if (overlapObject.overlapType === EOverlapType.HAND) {
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
      } else if (overlapObject.overlapType === EOverlapType.ALREADYINHAND || (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === false)) {
        // If overlapped with only the table or the card was already in hand and overlapped with hand again, report movement
        playspaceComponent.connections.forEach((connection: DataConnection) => {
          connection.send({
            'action': 'move',
            'type': object.type,
            'id': object.id,
            'x': object.x,
            'y': object.y,
            'finishedMoving': true,
            'amHost': playspaceComponent.amHost,
            'playerID': playspaceComponent.playerID,
            'peerID': playspaceComponent.myPeerID,
          });
        });
      } else if (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === true) {
        // If card overlapped with table and it was in my hand previously
        playspaceComponent.connections.forEach((connection: DataConnection) => {
          connection.send({
            'action': 'removeFromHand',
            'type': object.type,
            'cardID': object.id,
            'imagePath': object.imagePath,
            'x': object.x,
            'y': object.y,
            'amHost': playspaceComponent.amHost,
            'playerID': playspaceComponent.playerID,
            'peerID': playspaceComponent.myPeerID
          });
        });
      } else if (overlapObject.overlapType === EOverlapType.DECK) {
        playspaceComponent.connections.forEach((connection: DataConnection) => {
          connection.send({
            'action': 'insertIntoDeck',
            'type': object.type,
            'cardID': object.id,
            'deckID': overlapObject.deckID,
            'imagePath': object.imagePath,
            'x': object.x,
            'y': object.y,
            'amHost': playspaceComponent.amHost,
            'playerID': playspaceComponent.playerID,
            'peerID': playspaceComponent.myPeerID
          });
        });
      }
    }
  }