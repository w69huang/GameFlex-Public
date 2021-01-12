import { EventEmitter } from '@angular/core';
import { CounterActionObject, ECounterActions } from "../counter/counter.component";
import Counter from "../models/counter";
import GameState, { EActionTypes } from "../models/gameState";

import * as HF from '../helper-functions';
import { ConfigEditorComponent } from '../config-editor/config-editor.component';

/**
 * Used to get a counter by its ID
 * @param gameState - The game state the counters are being replaced in
 * @param counterID - The ID to get the counter by
 */
export function getCounterByID(currentCounterList: Counter[], counterID: number) {
    for (let i: number = 0; i < currentCounterList.length; i++) {
        if (counterID === currentCounterList[i].id) {
            return currentCounterList[i];
        }
    }
}

/**
 * Used to add a counter to a counter list in the playspace or config editor
 * @param counterToAdd - The counter to add
 * @param eventEmitter - The event emitter used to send a counter action to the counter component, if applicable
 * @param gameState - Initialized if this is being called from the playspace
 * @param configEditorComponent - Initialized if this is being called from the config editor
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function addCounter(counterToAdd: Counter, eventEmitter: EventEmitter<CounterActionObject> = null, gameState?: GameState, configEditorComponent?: ConfigEditorComponent, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    if (gameState) {
        let counters: Counter[] = [...gameState.counters];
        counters.push(counterToAdd);
        gameState.counters = counters;
        eventEmitter?.emit({ counterAction: ECounterActions.addCounter, counter: counterToAdd });
        gameState.delay(gameState.saveToCache());
        if (sendToPeers) {
            gameState.sendPeerData(
                EActionTypes.sendCounterAction,
                {
                    counterActionObject: { counterAction: ECounterActions.addCounter, counter: counterToAdd }
                },
                [doNotSendTo]
            );
        }
    } else if (configEditorComponent) {

    }
}

/**
 * Used to remove a counter from a counter list in the playspace or config editor
 * @param counterToRemove - The counter to remove
 * @param eventEmitter - The event emitter used to send a counter action to the counter component, if applicable
 * @param gameState - Initialized if this is being called from the playspace
 * @param configEditorComponent - Initialized if this is being called from the config editor
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function removeCounter(counterToRemove: Counter, eventEmitter: EventEmitter<CounterActionObject> = null, gameState?: GameState, configEditorComponent?: ConfigEditorComponent, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    if (gameState) {
        let counters: Counter[] = [...gameState.counters];
        counters = HF.filterOutID(counters, counterToRemove);
        gameState.counters = counters;
        eventEmitter?.emit({ counterAction: ECounterActions.removeCounter, counter: counterToRemove });    
        gameState.delay(gameState.saveToCache());
        if (sendToPeers) {
            gameState.sendPeerData(
                EActionTypes.sendCounterAction,
                {
                    counterActionObject: { counterAction: ECounterActions.removeCounter, counter: counterToRemove }
                },
                [doNotSendTo]
            );
        }
    } else if (configEditorComponent) {

    }
}

/**
 * Used to change a counter value from a counter list in the playspace or config editor
 * @param counterToChange - The counter to change
 * @param eventEmitter - The event emitter used to send a counter action to the counter component, if applicable
 * @param gameState - Initialized if this is being called from the playspace
 * @param configEditorComponent - Initialized if this is being called from the config editor
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function changeCounterValue(counterToChange: Counter, eventEmitter: EventEmitter<CounterActionObject> = null, gameState?: GameState, configEditorComponent?: ConfigEditorComponent, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    const retrievedCounter: Counter = getCounterByID(gameState ? gameState.counters : configEditorComponent.configuration.counters, counterToChange.id);
    retrievedCounter.value = counterToChange.value;
    retrievedCounter.minValue = counterToChange.minValue;
    retrievedCounter.maxValue = counterToChange.maxValue;
    eventEmitter?.emit({ counterAction: ECounterActions.changeCounterValue, counter: retrievedCounter });

    if (gameState) {
        gameState.delay(gameState.saveToCache());
        if (sendToPeers) {
            gameState.sendPeerData(
                EActionTypes.sendCounterAction,
                {
                    counterActionObject: { counterAction: ECounterActions.changeCounterValue, counter: retrievedCounter }
                },
                [doNotSendTo]
            );
        }
    } else if (configEditorComponent) {

    }
}
    
/**
 * Used to replace an existing counter list in the playspace or config editor with a list of new counters
 * @param countersToReplaceWith - The counters to replace the current ones with
 * @param eventEmitter - The event emitter used to send a counter action to the counter component, if applicable
 * @param gameState - Initialized if this is being called from the playspace
 * @param configEditorComponent - Initialized if this is being called from the config editor
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function replaceCounters(countersToReplaceWith: Counter[], eventEmitter: EventEmitter<CounterActionObject>, gameState?: GameState, configEditorComponent?: ConfigEditorComponent, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    if (gameState) {
        gameState.counters = [...countersToReplaceWith];
        eventEmitter.emit({ counterAction: ECounterActions.replaceCounters, counters: [...gameState.counters] });
        gameState.delay(gameState.saveToCache());
        if (sendToPeers) {
            gameState.sendPeerData(
                EActionTypes.sendCounterAction,
                {
                    counterActionObject: { counterAction: ECounterActions.replaceCounters, counters: [...gameState.counters] }
                },
                [doNotSendTo]
            );
        }
    } else if (configEditorComponent) {

    }
}
