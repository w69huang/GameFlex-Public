import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import Phaser from 'phaser';

declare var Peer: any;

class Card {
  gameObject: Phaser.GameObjects.Image;
  id: number;
  imagePath: string;

  constructor(id: number, imagePath: string) {
    this.id = id;
    this.imagePath = imagePath;
  }
}

class MainScene extends Phaser.Scene {
  cards: Card[];

  constructor() {
    super({ key: 'main' });
  }

  setCards(cards: Card[]) {
    this.cards = cards;
  }

  create() {
    this.cards.forEach(card => {
        card.gameObject = this.add.image(250, 250, card.id.toString());
        card.gameObject.displayWidth = 200;
        card.gameObject.displayHeight = 300;
    })
    console.log('create method');
  }

  preload() {
    this.cards.forEach(card => {
      this.load.image(card.id.toString(), card.imagePath);
    });
    console.log('preload method');
  }

  update() {
    console.log('update method');
  }
}

@Component({
  selector: 'app-playspace',
  templateUrl: './playspace.component.html',
  styleUrls: ['./playspace.component.scss']
})
export class PlayspaceComponent implements OnInit {
  phaserGame: Phaser.Game;
  phaserScene: MainScene;
  config: Phaser.Types.Core.GameConfig;
  aceOfSpades: Phaser.GameObjects.Image;
  cards: Card[] = [];
  
  constructor() { 
    this.cards.push(new Card(1, 'assets/images/playing-cards/ace_of_spades.png'))
    this.phaserScene = new MainScene();
    this.phaserScene.setCards(this.cards);
    this.config = {
      type: Phaser.AUTO,
      height: 600,
      width: 800,
      scene: [ this.phaserScene ],
      parent: 'gameContainer',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 100 }
        }
      }
    };
  }

  ngOnInit(): void {
    this.phaserGame = new Phaser.Game(this.config);
  }

  ngAfterViewInit() {

  }

}
