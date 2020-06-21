import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Sprite, Application, Rectangle, Texture, Container, DisplayObject, Text } from 'pixi.js';

declare var PIXI: any; // Instead of importing pixi

@Component({
  selector: 'app-pixi',
  templateUrl: './pixi.component.html',
  styleUrls: ['./pixi.component.scss']
})
export class PixiComponent implements OnInit, AfterViewInit {

  @ViewChild('pixiContainer') pixiContainer: ElementRef; // Allows us to reference and load stuff into the div container

  public pixiApp: any; // This will be the pixi application

  constructor() { }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.pixiApp = new PIXI.Application({ width: 800, height: 600}); // Creates the pixi application
    this.pixiContainer.nativeElement.appendChild(this.pixiApp.view); // Places the pixi application onto the viewable document
  }

}
