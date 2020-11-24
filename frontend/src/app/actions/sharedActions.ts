import { PlayspaceComponent } from '../playspace/playspace.component';
import Card from '../models/card';
import { EActionTypes, EGameObjectType, EOverlapType, OverlapObject } from '../models/gameState';

// Drag move callback for moving objects on the phaser canvas
// Will be used for both the config editor and the playspace
export function onDragMove(object: any, component: any, pointer: Phaser.Input.Pointer, dragX: number, dragY: number) {
    if (object.type == EGameObjectType.DECK || object.type == EGameObjectType.CARD) {
      object.x = dragX;
      object.y = dragY;
      object.gameObject.setX(dragX);
      object.gameObject.setY(dragY);
      
      if (component.gameState) {
        component.gameState.sendPeerData(
          EActionTypes.MOVE,
            {
              id: object.id,
              type: object.type,
              x: dragX,
              y: dragY
            }
        );
      }
    }
}

// Drag end callback for finishing moving objects on the phaser canvas
// Will only be used in the playspace as right now it only applies to cards
export function onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer) {
    const card: Card = playspaceComponent.gameState.getCardByID(object.id, playspaceComponent.gameState.playerID)?.card;
    const overlapObject: OverlapObject = playspaceComponent.gameState.checkForOverlap(object.id);

    if (overlapObject.overlapType === EOverlapType.HAND) {
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.INSERTINTOHAND,
        {
          cardID: card.id,
          type: object.type,
        }
      );
    } else if (overlapObject.overlapType === EOverlapType.ALREADYINHAND || (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === false)) {
      // If overlapped with only the table or the card was already in hand and overlapped with hand again, report movement
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.MOVE,
        {
          id: object.id,
          type: object.type,
          x: object.x,
          y: object.y,
          finishedMoving: true
        }
      );
    } else if (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === true) {
      // If card overlapped with table and it was in my hand previously
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.REMOVEFROMHAND,
        {
          cardID: object.id,
          type: object.type,
          imagePath: object.imagePath,
          x: object.x,
          y: object.y,
          finishedMoving: true
        }
      );
    } else if (overlapObject.overlapType === EOverlapType.DECK) {
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.INSERTINTODECK,
        {
          cardID: object.id,
          deckID: overlapObject.deckID,
          type: object.type,
          imagePath: object.imagePath,
          x: object.x,
          y: object.y
        }
      );
    }
  }