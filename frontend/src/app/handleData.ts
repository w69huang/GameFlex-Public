import * as CoA from './actions/counterActions';
import * as DA from './actions/deckActions';
import * as HA from './actions/handActions';
import * as HF from './helper-functions';
import Card from './models/card';
import Deck from './models/deck';
import CardMin from './models/cardMin';
import DeckMin from './models/deckMin';
import HandMin from './models/handMin';
import SentGameState from './models/sentGameState';
import { PlayspaceComponent } from './playspace/playspace.component';
import { DataConnection } from 'peerjs';
import { ECounterActions } from './counter/counter.component';
import PlayerData from './models/playerData';

/**
 * Used to handle data received from P2P connections (primarily carrying out requested actions)
 * @param data - An object that holds all the data needed to handle the requested action
 * @param playspaceComponent - A reference to the playspace component
 */
export function handleData(data: HF.GameObjectProperties, playspaceComponent: PlayspaceComponent): void {
    if (playspaceComponent.gameState.getAmHost() && data.amHost) {
        // Error! Both parties claim to the be the host! Abort!
        console.log("Fatal error: both parties claim to be the host.");
        return;
    }

    switch (data.action) {

        // Received by the host after being sent by the player upon connection to the host
        case HF.EActionTypes.verifyRequest:
            // TODO
            break;

        // Received by the host after being sent by the player upon connection to the host, in which the player asks for the game state
        case HF.EActionTypes.sendState:
            let playerID = data.playerID;
            if (!playerID) {
            // They are new, generate a new ID for them
            let playerIDArray: number[] = [];
    
            playspaceComponent.gameState.playerDataObjects.forEach((playerData) => {
                playerIDArray.push(playerData.id);
            });
    
            let i: number = 1;
            while (playerIDArray.includes(i)) {
                i++; 
            }
            playerID = i; // Assign the player the first playerID that is not taken already
            }
    
            playspaceComponent.gameState.playerDataObjects.push(new PlayerData(playerID, data.peerID));
            playspaceComponent.playerDataEmitter.emit(playspaceComponent.gameState.playerDataObjects);
    
            console.log("Sending state.");
            playspaceComponent.gameState.sendGameStateToPeers(false, data.peerID);

            break;
    
        // Receives the state from the host and setups up the local gameState correctly
        case HF.EActionTypes.replicateState:
            console.log("Received state.");
            playspaceComponent.gameState.buildingGame = true;

            if (data.extras.undo) {
                playspaceComponent.gameState.sendPeerData(HF.EActionTypes.confirmUndo);
            }

            const receivedGameState: SentGameState = data.extras.state;
            playspaceComponent.gameState.playerID = receivedGameState.playerID;
    
            playspaceComponent.gameState.cleanUp(playspaceComponent);
    
            receivedGameState.cardMins.forEach((cardMin: CardMin) => {
                let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver);
                HF.createCard(card, playspaceComponent, HF.EDestination.TABLE, cardMin.depth);
            });

            receivedGameState.deckMins.forEach((deckMin: DeckMin) => {
                let deck: Deck = new Deck(deckMin.id, deckMin.imagePath, [], deckMin.x, deckMin.y);
                HF.createDeck(deck, playspaceComponent, deckMin.depth);
            });

            //handMin is now handMins need to go through each of the hands in the array and populate
            receivedGameState.handMins.forEach( (handMin: HandMin, handIndex: integer) => {
                HA.createHand(playspaceComponent, playspaceComponent.gameState.playerID);
                handMin.cardMins.forEach((cardMin: CardMin) => {
                    let card: Card = new Card(cardMin.id, cardMin.imagePath, cardMin.x, cardMin.y, cardMin.flippedOver, true);
                    HF.createCard(card, playspaceComponent, HF.EDestination.HAND, cardMin.depth, handIndex);
                });
            });

            CoA.replaceCounters(receivedGameState.counters, playspaceComponent.counterActionOutputEmitter, playspaceComponent.gameState, null);

            playspaceComponent.gameState.buildingGame = false;
    
            document.getElementById('loading').style.display = "none";
            document.getElementById('loadingText').style.display = "none";
            break;
    
        case HF.EActionTypes.move:
            if (data.extras.type === HF.EGameObjectType.CARD) {
            
            let card: Card = playspaceComponent.gameState.getCardByID(data.extras.id, data.playerID)?.card;
    
            if (card) {
                card.x = data.extras.x;
                card.y = data.extras.y;
                if (card.gameObject) { 
                card.gameObject.setX(data.extras.x);
                card.gameObject.setY(data.extras.y);
                playspaceComponent.gameState.sendPeerData(
                    HF.EActionTypes.move,
                    {
                        id: card.id,
                        type: card.type,
                        x: data.extras.x,
                        y: data.extras.y
                    },
                    [data.peerID]
                    );
                }
            }
            } else if (data.extras.type === HF.EGameObjectType.DECK) {
            let deck: Deck = playspaceComponent.gameState.getDeckByID(data.extras.id);
    
            if (deck) {
                deck.x = data.extras.x;
                deck.y = data.extras.y;
                deck.gameObject.setX(data.extras.x);
                deck.gameObject.setY(data.extras.y);
    
                playspaceComponent.gameState.sendPeerData(
                HF.EActionTypes.move,
                {
                    id: deck.id,
                    type: deck.type,
                    x: data.extras.x,
                    y: data.extras.y
                },
                [data.peerID]
                );
            }
            }
    
            if (data.extras.finishedMoving) { // If they have finished moving a card/deck, save to cache
                playspaceComponent.gameState.delay(() => { playspaceComponent.gameState.saveToCache(); });
            }
            break;
    
        // The host receives this action, which was sent by a non-host requesting the top card of the deck
        case HF.EActionTypes.retrieveTopCard:
            if (data.extras.type === HF.EGameObjectType.CARD && playspaceComponent.gameState.getAmHost()) {
            let deck: Deck = playspaceComponent.gameState.getDeckByID(data.extras.deckID);
    
            if (deck && deck.cards.length > 0) {
                let card: Card = playspaceComponent.gameState.getCardFromDeck(deck.cards.length - 1, deck.id, true);
                card.x = data.extras.destination === HF.EDestination.TABLE ? deck.x : HF.handBeginX + 150;
                card.y = data.extras.destination === HF.EDestination.TABLE ? deck.y : HF.handBeginY + 200;
    
                if (data.extras.destination === HF.EDestination.TABLE) {
                    HF.createCard(card, playspaceComponent, HF.EDestination.TABLE);
                } else if (data.extras.destination === HF.EDestination.HAND) {
                    playspaceComponent.gameState.addCardToPlayerHand(card, data.playerID, data.extras.handIndex);
                }
    
                playspaceComponent.gameState.sendPeerData(
                    HF.EActionTypes.sendTopCard,
                    {
                    cardID: card.id,
                    deckID: deck.id,
                    type: HF.EGameObjectType.CARD,
                    x: card.x,
                    y: card.y,
                    flippedOver: card.flippedOver,
                    imagePath: card.imagePath,
                    destination: data.extras.destination
                    },
                    [],
                    data.extras.destination === HF.EDestination.HAND ? [data.peerID] : []
                );
            }
            }
            break;
    
        // The non-host receives this action, which was sent by the host after the non-host requested the top card from a deck
        case HF.EActionTypes.sendTopCard:
            if (data.extras.type === HF.EGameObjectType.CARD && !playspaceComponent.gameState.getAmHost()) {
            let deck: Deck = playspaceComponent.gameState.getDeckByID(data.extras.deckID);
    
            if (deck) {
    
                let card: Card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y, data.extras.flippedOver);
                card.inDeck = false;
    
                HF.createCard(card, playspaceComponent, data.extras.destination, null, playspaceComponent.gameState.myCurrHand);
            }
            }
            break;
    
        // Received by the host when a player inserts a card into the deck or by the player when the host inserts a card into the deck
        case HF.EActionTypes.insertIntoDeck:
            if (data.extras.type === HF.EGameObjectType.CARD && playspaceComponent.gameState.getAmHost()) {
            let card: Card = playspaceComponent.gameState.getCardByID(data.extras.cardID, data.playerID, true, true).card;
            let deck: Deck = playspaceComponent.gameState.getDeckByID(data.extras.deckID);
    
            if (card && deck) {
                if (playspaceComponent.gameState.getAmHost()) {
                // If I am the host, tell everyone else that this card was inserted
                // Assuming they can actually see the card all ready -- if it was in the person's hand, no point in telling them
    
                playspaceComponent.gameState.sendPeerData(
                    HF.EActionTypes.insertIntoDeck,
                    {
                    cardID: card.id,
                    deckID: deck.id,
                    type: HF.EGameObjectType.CARD,
                    x: card.x,
                    y: card.y,
                    imagePath: card.imagePath
                    },
                    [data.peerID]
                );
                }
    
                playspaceComponent.gameState.addCardToDeck(card, deck.id);
            }
            } else if (data.extras.type === HF.EGameObjectType.CARD && !playspaceComponent.gameState.getAmHost()) {
            // If I am not the host and someone inserts a card into the deck, completely remove all reference to it
            // Passing in true, true means that even though the card object is returned, it is destroyed
            playspaceComponent.gameState.getCardByID(data.extras.cardID, data.playerID, true, true);
            }
            break;

        // Received by the host when a player creates a new hand
        case HF.EActionTypes.createHand:
            if (data.extras.type === HF.EGameObjectType.HAND && playspaceComponent.gameState.getAmHost()) {
                HA.createHand(playspaceComponent, data.playerID);
            }
            break;

        // Received by the host when a player deletes a hand
        case HF.EActionTypes.deleteHand:
            if (data.extras.type === HF.EGameObjectType.HAND && playspaceComponent.gameState.getAmHost()) {
                HA.deleteHand(playspaceComponent, data.playerID, data.extras.handIndex);
            }
            break;

        // Anyone can receive this action, which is sent by someone who inserts a card into their hand
        case HF.EActionTypes.insertIntoHand:
            // If someone else inserts a card into their hand, we need to delete that card from everyone else's screen
            if (data.extras.type === HF.EGameObjectType.CARD) {
            let card: Card = playspaceComponent.gameState.getCardByID(data.extras.cardID, data.playerID, true, true).card;
    
                if (card) {
                    if (playspaceComponent.gameState.getAmHost()) {
                        // If I am the host, first we will tell any other players that the action occurred
            
                        playspaceComponent.gameState.sendPeerData(
                            HF.EActionTypes.insertIntoHand,
                            {
                            cardID: card.id,
                            type: HF.EGameObjectType.CARD,
                            handIndex: data.extras.handIndex
                            },
                            [data.peerID]
                        );
            
                        // Then, add it to the appropriate player's hand in the game state (will only actually take effect if host)
                        playspaceComponent.gameState.addCardToPlayerHand(card, data.playerID, data.extras.handIndex);
                    }
                }
            }
    
            break;        
    
        // Anyone can receive this action, and it is sent by someone who places a card from their hand on the table (NOT inserting it into a deck)
        case HF.EActionTypes.removeFromHand:
            if (data.extras.type === HF.EGameObjectType.CARD) {
                let card: Card = null;
                if (playspaceComponent.gameState.getAmHost()) {
                    // Card already exists if I'm the host, since I know everyone's hands
                    card = playspaceComponent.gameState.getCardByID(data.extras.cardID, data.playerID, true, true).card;
                    card.x = data.extras.x;
                    card.y = data.extras.y;
        
                    HF.createCard(card, playspaceComponent, HF.EDestination.TABLE)
        
                    // Tell other possible peers that this card was removed from a hand
                    playspaceComponent.gameState.sendPeerData(
                        HF.EActionTypes.removeFromHand,
                        {
                            cardID: card.id,
                            type: HF.EGameObjectType.CARD,
                            imagePath: card.imagePath,
                            x: card.x,
                            y: card.y,
                            flippedOver: card.flippedOver
                        },
                        [data.peerID]
                    );        
                } else {
                    // Creates a new card because it does not exist as far as a non-host player knows
                    card = new Card(data.extras.cardID, data.extras.imagePath, data.extras.x, data.extras.y, data.extras.flippedOver);
                    HF.createCard(card, playspaceComponent, HF.EDestination.TABLE);
                }
            }
    
            break;
    
        case HF.EActionTypes.importDeck:
            if (data.extras.type === HF.EGameObjectType.DECK && playspaceComponent.gameState.getAmHost()) {
            let deck: Deck = playspaceComponent.gameState.getDeckByID(data.extras.deckID);
    
            if (deck) {
                let imagePaths: string[] = data.extras.imagePaths;
    
                imagePaths.forEach((imagePath: string) => {
                playspaceComponent.gameState.addCardToDeck(new Card(playspaceComponent.highestID++, imagePath, deck.gameObject.x, deck.gameObject.y), deck.id);
                });
            }
            }
            break;

        case HF.EActionTypes.updateRenderOrder:
            let object: Card | Deck = null;
            if (data.extras.type === HF.EGameObjectType.CARD) {
                object = playspaceComponent.gameState.getCardByID(data.extras.id, data.playerID)?.card;
            } else if (data.extras.type === HF.EGameObjectType.DECK) {
                object = playspaceComponent.gameState.getDeckByID(data.extras.id);
            }

            if (object) {
                playspaceComponent.gameState.highestDepth++;
                object.gameObject.setDepth(playspaceComponent.gameState.highestDepth);
            }

            if (playspaceComponent.gameState.getAmHost()) {
                playspaceComponent.gameState.sendPeerData(
                    HF.EActionTypes.updateRenderOrder,
                    {
                        id: object.id,
                        type: object.type
                    },
                    [data.peerID]
                );
            }
            break;

        case HF.EActionTypes.flipCard:
            let card: Card = playspaceComponent.gameState.getCardByID(data.extras.cardID, data.playerID)?.card;

            if (card) {
                if (!(playspaceComponent.gameState.getAmHost() && card.inHand)) {
                    if (data.extras.flippedOver) {
                        card.gameObject.setTexture('flipped-card');
                    } else {
                        card.gameObject.setTexture(card.imagePath);
                    }
                    card.gameObject.setDisplaySize(100, 150);
                    // Hit area MUST be set to the texture size (NOT display size), which will equate to the width and height of the game object after the texture is loaded
                    card.gameObject.input.hitArea.setTo(0, 0, card.gameObject.width, card.gameObject.height);
                }
                card.flippedOver = data.extras.flippedOver;
    
                playspaceComponent.gameState.delay(() => { playspaceComponent.gameState.saveToCache(); });
    
                if (playspaceComponent.gameState.getAmHost()) {
                    playspaceComponent.gameState.sendPeerData(
                        HF.EActionTypes.flipCard,
                        {
                            cardID: card.id,
                            flippedOver: card.flippedOver
                        },
                        [data.peerID]
                    );
                }
            }
            break;

        case HF.EActionTypes.shuffleDeck:
            if (playspaceComponent.gameState.getAmHost()) {
                const deck: Deck = playspaceComponent.gameState.getDeckByID(data.extras.deckID);
                if (deck) {
                    DA.shuffleDeck(null, deck, playspaceComponent, null);
                }
            }
            break;

        case HF.EActionTypes.confirmUndo:
            if (playspaceComponent.gameState.getAmHost()) {
                playspaceComponent.gameState.undoRequests = playspaceComponent.gameState.undoRequests.filter( (connection: DataConnection) => {
                    return connection.peer !== data.peerID;
                });

                if (playspaceComponent.gameState.undoRequests.length <= 0) {
                    playspaceComponent.gameState.undoInProgress = false;
                    clearInterval(playspaceComponent.gameState.undoCheckInInterval);
                }
            }
            break;

        case HF.EActionTypes.sendCounterAction:
            switch (data.extras.counterActionObject.counterAction) {
                case ECounterActions.addCounter:
                    CoA.addCounter(data.extras.counterActionObject.counter, playspaceComponent.counterActionOutputEmitter, playspaceComponent.gameState, null, playspaceComponent.gameState.getAmHost(), data.peerID);
                    break;
                case ECounterActions.removeCounter:
                    CoA.removeCounter(data.extras.counterActionObject.counter, playspaceComponent.counterActionOutputEmitter, playspaceComponent.gameState, null, playspaceComponent.gameState.getAmHost(), data.peerID);
                    break;
                case ECounterActions.changeCounterValue:
                    CoA.changeCounterValue(data.extras.counterActionObject.counter, playspaceComponent.counterActionOutputEmitter, playspaceComponent.gameState, null, playspaceComponent.gameState.getAmHost(), data.peerID);
                    break;
                case ECounterActions.replaceCounters:
                    CoA.replaceCounters(data.extras.counterActionObject.counters, playspaceComponent.counterActionOutputEmitter, playspaceComponent.gameState, null, playspaceComponent.gameState.getAmHost(), data.peerID);
                    break;
                default:
                    console.log('Error: Receivedd counter action did not match any existing action.');
                    break;
            }
    
        default:
            console.log('Error: Received action did not match any existing action.');
            break;
    }
}
