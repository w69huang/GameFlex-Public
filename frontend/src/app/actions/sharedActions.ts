import { PlayspaceComponent } from '../playspace/playspace.component';
import Card from '../models/card';
import { EActionTypes, EGameObjectType, EOverlapType, OverlapObject } from '../models/gameState';
import Deck from '../models/deck';
import * as HA from '../actions/handActions';
import { delay } from 'rxjs/operators';

export function updateRenderOrder(object: Card | Deck, playspaceComponent: PlayspaceComponent): void {
  playspaceComponent.gameState.highestDepth++;
  object.gameObject.setDepth(playspaceComponent.gameState.highestDepth);
  if ((object instanceof Card && !object.inHand) || object instanceof Deck) {
    playspaceComponent.gameState.sendPeerData(
      EActionTypes.updateRenderOrder,
      {
        id: object.id,
        type: object.type
      }
    );
  }
}

export function onDragOver(): void { //Or do we want enter?
  // https://photonstorm.github.io/phaser3-docs/Phaser.Input.Events.html#event:GAMEOBJECT_OVER__anchor
}

export function onDragLeave(): void {

}

// Drag move callback for moving objects on the phaser canvas
// Will be used for both the config editor and the playspace
export function onDragMove(object: any, component: any, pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {

  if (object.type == EGameObjectType.DECK || object.type == EGameObjectType.CARD) {
    object.x = dragX;
    object.y = dragY;
    object.gameObject.setX(dragX);
    object.gameObject.setY(dragY);
    
    if (component.gameState && !object.inHand) {
      component.gameState.sendPeerData(
        EActionTypes.move,
          {
            id: object.id,
            type: object.type,
            x: dragX,
            y: dragY
          }
      );
    }

    // TODO: This should happen for hover too not just onDragMove, currently if you're perfectly still it stops 
    if (object.type === EGameObjectType.CARD && component.gameState) { // type card and has a gameState (ie: is a PlaySpaceComponent)
      const overlapObject: OverlapObject = component.gameState.checkForCardOverlappingButton(object.id);

      if (overlapObject?.overlapType === EOverlapType.ADDHAND) {
        if (!component.gameState.hoverActionInProgress) {
          // TODO: There's a lot of common code in these three buttons, find a way to make a function or 3 or 4 in HA
          HA.createHand(component, component.gameState.playerID);

          component.gameState.hoverActionInProgress = true;
          component.gameState.delay(() => {     
            component.gameState.hoverActionInProgress = false;
          }, 300)
        }

      } else if (overlapObject?.overlapType === EOverlapType.NEXTHAND) {
        if (!component.gameState.hoverActionInProgress) {
          HA.nextHand(component);
          object.gameObject.setVisible(true);

          component.gameState.hoverActionInProgress = true;
          component.gameState.delay(() => {          
            component.gameState.hoverActionInProgress = false;
          }, 300)
        }
      
      } else if (overlapObject?.overlapType === EOverlapType.PREVHAND) {
        if (!component.gameState.hoverActionInProgress) {
          HA.previousHand(component);
          object.gameObject.setVisible(true);

          component.gameState.hoverActionInProgress = true;
          component.gameState.delay(() => {        
            component.gameState.hoverActionInProgress = false;
          }, 300)
        }
      } // Will always be undefined for configurations since there is no gamestate
    }

  }
}


// Drag end callback for finishing moving objects on the phaser canvas
// Will only be used in the playspace as right now it only applies to cards
export function onDragEnd(object: any, playspaceComponent: PlayspaceComponent, pointer: Phaser.Input.Pointer): void {
    const card: Card = playspaceComponent.gameState.getCardByID(object.id, playspaceComponent.gameState.playerID)?.card;
    const overlapObject: OverlapObject = playspaceComponent.gameState.checkForOverlap(object.id);

    if (overlapObject.overlapType === EOverlapType.HAND) {
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.insertIntoHand,
        {
          cardID: card.id,
          type: object.type,
          x: object.x,
          y: object.y,
          handIndex: overlapObject.handIndex
        }
      );
    } else if (overlapObject.overlapType === EOverlapType.ALREADYINHAND && !playspaceComponent.gameState.getAmHost()) {
      // If overlapped with the hand and was already in the hand, report movement if NOT the host
      // The host does not need to share its local hand movements b/c the other players do not store the host's hand data
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.move,
        {
          id: object.id,
          type: object.type,
          x: object.x,
          y: object.y,
          finishedMoving: true
        }
      );
    } else if (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === false) {
      // If overlapped with the table and the card was already on the table
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.move,
        {
          id: object.id,
          type: object.type,
          x: object.x,
          y: object.y,
          finishedMoving: true
        }
      );
    } 
    else if (overlapObject.overlapType === EOverlapType.TABLE && overlapObject.wasInHand === true) {
      // If card overlapped with table and it was in my hand previously
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.removeFromHand,
        {
          cardID: object.id,
          type: object.type,
          imagePath: object.imagePath,
          x: object.x,
          y: object.y,
          flippedOver: object.flippedOver,
          finishedMoving: true
        }
      );
    } else if (overlapObject.overlapType === EOverlapType.DECK) {
      playspaceComponent.gameState.sendPeerData(
        EActionTypes.insertIntoDeck,
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
