import { EventEmitter } from '@angular/core';
import { CounterActionObject, ECounterActions } from "../counter/counter.component";
import Counter from "../models/counter";
import GameState, { EActionTypes } from "../models/gameState";

import * as HF from '../helper-functions';

/**
 * Used to get a counter by its ID
 * @param gameState - The game state the counters are being replaced in
 * @param counterID - The ID to get the counter by
 */
export function getCounterByID(gameState: GameState, counterID: number) {
    for (let i: number = 0; i < gameState.counters.length; i++) {
        if (counterID === gameState.counters[i].id) {
            return gameState.counters[i];
        }
    }
}

/**
 * Used to replace existing counters with the current counters
 * @param gameState - The game state the counters are being replaced in
 * @param counter - The counter to add
 * @param eventEmitter - The event emitter used to send a counter action to the counter component, if applicable
 * - addCounter is normally called as a result of the counter component sending data to the playspace component, so an event does not need to be emitted in this case
 * - However, if it is called as a result of receiving peer data, an event WILL need to be emitted
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function addCounter(gameState: GameState, counter: Counter, eventEmitter: EventEmitter<CounterActionObject> = null, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    let counters: Counter[] = [...gameState.counters];
    counters.push(counter);
    gameState.counters = counters;
    gameState.delay(gameState.saveToCache());
    eventEmitter?.emit({ counterAction: ECounterActions.addCounter, counter: counter });
    if (sendToPeers) {
        gameState.sendPeerData(
            EActionTypes.sendCounterAction,
            {
                counterActionObject: { counterAction: ECounterActions.addCounter, counter: counter }
            },
            [doNotSendTo]
        );
    }
}

/**
 * Used to remove a counter
 * @param gameState - The game state the counters are being replaced in
 * @param counter - The counter to remove
 * @param eventEmitter - The event emitter used to send a counter action to the counter component, if applicable
 * - removeCounter is normally called as a result of the counter component sending data to the playspace component, so an event does not need to be emitted in this case
 * - However, if it is called as a result of receiving peer data, an event WILL need to be emitted
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function removeCounter(gameState: GameState, counter: Counter, eventEmitter: EventEmitter<CounterActionObject> = null, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    let counters: Counter[] = [...gameState.counters];
    counters = HF.filterOutID(counters, counter);
    gameState.counters = counters;
    gameState.delay(gameState.saveToCache());
    eventEmitter?.emit({ counterAction: ECounterActions.removeCounter, counter: counter });
    if (sendToPeers) {
        gameState.sendPeerData(
            EActionTypes.sendCounterAction,
            {
                counterActionObject: { counterAction: ECounterActions.removeCounter, counter: counter }
            },
            [doNotSendTo]
        );
    }
}

/**
 * Used to change a counter's value
 * @param gameState - The game state the counters are being replaced in
 * @param counter - The ID of the counter to change
 * @param eventEmitter - The event emitter used to send a counter action to the counter component
 * - changeCounterValue is normally called as a result of the counter component sending data to the playspace component, so an event does not need to be emitted in this case
 * - However, if it is called as a result of receiving peer data, an event WILL need to be emitted
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function changeCounterValue(gameState: GameState, counter: Counter, eventEmitter: EventEmitter<CounterActionObject> = null, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    const retrievedCounter: Counter = getCounterByID(gameState, counter.id);
    retrievedCounter.value = counter.value;
    retrievedCounter.minValue = counter.minValue;
    retrievedCounter.maxValue = counter.maxValue;
    gameState.delay(gameState.saveToCache());
    eventEmitter?.emit({ counterAction: ECounterActions.changeCounterValue, counter: retrievedCounter });
    if (sendToPeers) {
        gameState.sendPeerData(
            EActionTypes.sendCounterAction,
            {
                counterActionObject: { counterAction: ECounterActions.changeCounterValue, counter: retrievedCounter }
            },
            [doNotSendTo]
        );
    }
}
    
/**
 * Used to replace existing counters with the current counters
 * @param gameState - The game state the counters are being replaced in
 * @param counters - The counters to replace the current ones with
 * @param eventEmitter - The event emitter used to send a counter action to the counter component
 * @param sendToPeers - Whether or not to send this action to peers
 * @param doNotSendTo - If this action is being sent to peers, who NOT to send it to
 */
export function replaceCounters(gameState: GameState, counters: Counter[], eventEmitter: EventEmitter<CounterActionObject>, sendToPeers: boolean = false, doNotSendTo: string = ""): void {
    gameState.counters = counters;
    gameState.delay(gameState.saveToCache());
    eventEmitter.emit({ counterAction: ECounterActions.replaceCounters, counters: [...gameState.counters] });
    if (sendToPeers) {
        gameState.sendPeerData(
            EActionTypes.sendCounterAction,
            {
                counterActionObject: { counterAction: ECounterActions.replaceCounters, counters: [...gameState.counters] }
            },
            [doNotSendTo]
        );
    }
}
