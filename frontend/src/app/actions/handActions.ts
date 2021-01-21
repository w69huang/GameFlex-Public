import { PlayspaceComponent } from '../playspace/playspace.component';
import { EActionTypes, EGameObjectType, EOverlapType, OverlapObject } from '../models/gameState';
import Hand from '../models/hand';
import Card from '../models/card';
import { delay } from 'rxjs/operators';


/**
* Sets the next hand 
*/
export function nextHand(component: PlayspaceComponent) {
    let myLastHand = component.gameState.myCurrHand;
    if(component.gameState.myHands.length-1 > component.gameState.myCurrHand) {
        component.gameState.myCurrHand = component.gameState.myCurrHand + 1;
    } else {
        component.gameState.myCurrHand = component.gameState.myHands.length -1;
    }
    renderHand(component, myLastHand, component.gameState.myCurrHand);
}

/**
 * Sets the previous hand
 */
export function previousHand(component: PlayspaceComponent) {
    let myLastHand = component.gameState.myCurrHand;
    if( component.gameState.myCurrHand > 0) {
        component.gameState.myCurrHand = component.gameState.myCurrHand - 1;
    } else {
        component.gameState.myCurrHand = 0;
    }
    renderHand(component, myLastHand, component.gameState.myCurrHand);
}


/**
 * Creates a hand
 */
export function createHand(component: PlayspaceComponent, playerID: number) {
    let hand = new Hand(playerID, []);

    // If I'm creating a hand for myself
    if (playerID === component.gameState.playerID) {
        component.gameState.myHands.push(hand);
        component.gameState.hands[playerID] = component.gameState.myHands;

        // Only navigate to the newly created hand if we aren't in the middle of loading a game state
        if(!component.gameState.buildingGame){
            if(!component.gameState.getAmHost()) {
                component.gameState.sendPeerData(
                    EActionTypes.createHand,
                    {
                        type: EGameObjectType.HAND,
                    }
                );
            } 

            let myLastHand = component.gameState.myCurrHand;
            component.gameState.myCurrHand = component.gameState.myHands.length-1;
            renderHand(component, myLastHand, component.gameState.myCurrHand);
        }

        updateHandTracker(component);


    } else {
        if (!component.gameState.hands[playerID]) {
            component.gameState.hands[playerID] = [];
        }
        component.gameState.hands[playerID].push(new Hand(playerID, []));
    }

    if (component.gameState.getAmHost()) {
        component.gameState.delay(() => { component.gameState.saveToCache(); });
    }
}

/**
 * Deletes the current hand hand. Sends alert if there are cards in the hand.
 */
export function deleteHand(component: PlayspaceComponent, playerID: number, handIndex?: integer) {


    let myHandToDel = handIndex ? component.gameState.hands[playerID][handIndex] : component.gameState.myCurrHand;

    if( component.gameState.myHands.length <= 1 ) {
        // Do not delete the last hand
        return
    }

    if ( component.gameState.myHand.cards.length > 0 ) {
        alert('Error: You can only delete a hand that is empty.');
        return 
    }


    if (playerID === component.gameState.playerID) {
        // Move to the previous hand on delete or stay on first hand
        if( component.gameState.myCurrHand > 0) {
            component.gameState.myCurrHand = component.gameState.myCurrHand - 1;
            // Change render order before hand is deleted 
            renderHand(component, myHandToDel, component.gameState.myCurrHand, false);
        } else {
            component.gameState.myCurrHand = 0;
            // Change render order before hand is deleted to +1 since we are deleting the current 0
            renderHand(component, myHandToDel, component.gameState.myCurrHand + 1, false);
        }
    }


    component.gameState.hands[playerID].splice(myHandToDel, 1);

    if (playerID === component.gameState.playerID) {
        updateHandTracker(component);
    }

    if(!component.gameState.getAmHost()) {
        component.gameState.sendPeerData(
            EActionTypes.deleteHand,
            {
            type: EGameObjectType.HAND,
            handIndex: myHandToDel
            } //TODO should probably send to only host
        );
    } else {
        component.gameState.delay(() => { component.gameState.saveToCache(); });
    }

    component.gameState.delay(() => { component.gameState.saveToCache(); });
}

// The following functions are support functions and do not correlate directly to a users action 



/**
 * Hides cards for the last hand shown, and displays the new hands cards
 */
export function renderHand(component: PlayspaceComponent, myLastHand: integer, myNewHand: integer, updateHandText: Boolean = true) {
    if(!(myLastHand == myNewHand)) {
        component.gameState.myHands[myLastHand].cards.forEach(card => {
            card.gameObject.setVisible(false);
        })
        component.gameState.myHands[myNewHand].cards.forEach(card => {
            card.gameObject.setVisible(true);
        })
        if(updateHandText){
            updateHandTracker(component);
        }

    }
}

/**
 * Checks if card is in one of the current players hands
 */
export function inMyHands(component: PlayspaceComponent, theCardToCheck: Card) {
    component.gameState.myHands.forEach(hand => {
        hand.cards.forEach(card => {
            if(card === theCardToCheck) {
                return true;
            }
        })
    })

    return false;
}

/**
 * Updates the hand tracker to the values given. Default to the `myCurrentHand + 1` of `myHands.length`
 */
export function updateHandTracker(
        component: PlayspaceComponent,
        currHand: integer = component.gameState.myCurrHand+1,
        totalHands: integer = component.gameState.myHands.length
    ) {
    component.phaserScene.handTrackerText.setText(
        `${currHand} of ${totalHands}`
        );
}

// Unused currently
// /**
//  * Used to remove a card from the general hands array that the host keeps track of
//  * @param card - The card to remove
//  */
// private removeFromHandsArray(card: Card): void {
//     this._hands.forEach((hand: Hand) => {
//         for (let i: number = 0; i < hand.cards.length; i++) {
//             if (hand.cards[i].id === card.id) {
//                 hand.cards = this.filterOutID(hand.cards, card);
//                 return;
//             }
//         }
//     });
// }