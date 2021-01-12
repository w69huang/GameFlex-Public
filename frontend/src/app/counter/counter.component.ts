import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Counter from '../models/counter';
import { CreateCounterPopupComponent } from '../popups/create-counter-popup/create-counter-popup.component';

import * as HF from '../helper-functions';

export class CounterInitData {
  name: string;
  id: number;
  defaultValue: string;
}

export enum ECounterActions {
  addCounter = "addCounter",
  removeCounter = "removeCounter",
  replaceCounters = "replaceCounters",
  changeCounterValue = "changeCounterValue"
}

export class CounterActionObject {
  counterAction: ECounterActions;
  counter?: Counter;
  counters?: Counter[];
}

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss']
})
export class CounterComponent implements OnInit {
  /**
   * The event caught with this emitter is the parent sending an ID value for the newly created counter, requested via the requestIDEmitter
   */
  @Input() private counterActionInputEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  /**
   * This emitter is used to send the parent component all the current counter values
   */
  @Output() private counterActionOutputEmitter: EventEmitter<CounterActionObject> = new EventEmitter<CounterActionObject>();

  /**
   * The list of counters, rendered in an ngFor in the html
   */
  public counters: Counter[] = [];

  /**
   * The highest counter ID currently being used (it increments every time, so 1 will be the first one used)
   */
  private highestCounterID: number = 0; 

  /**
   * The constructor
   * @param dialog - Used to create popups
   */
  constructor(private dialog: MatDialog) { }

  /**
   * What to do upon initialization
   */
  ngOnInit(): void {
    this.counterActionInputEmitter.subscribe((counterActionObject: CounterActionObject) => {
      switch(counterActionObject.counterAction) {
        case ECounterActions.addCounter:
          this.counters.push(counterActionObject.counter);
          break;
        case ECounterActions.removeCounter:
          this.counters = HF.filterOutID(this.counters, counterActionObject.counter);
          break;
        case ECounterActions.changeCounterValue:
          for (let i: number = 0; i < this.counters.length; i++) {
            if (this.counters[i].id === counterActionObject.counter.id) {
              this.counters[i] = counterActionObject.counter;
            }
          }
          break;
        case ECounterActions.replaceCounters:
          this.counters = counterActionObject.counters;
          break;
        default:
          break;
      }
    });
  }

  /**
   * Creates a new counter
   */
  initCounter(): void {
    let dialogRef = this.dialog.open(CreateCounterPopupComponent, {
      height: '500px',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((counterInitData: CounterInitData) => {
      if (counterInitData) {
        this.counters.forEach((counter: Counter) => {
          if (counter.id > this.highestCounterID) {
            this.highestCounterID = counter.id;
          }
        });
        this.highestCounterID++;
        const newCounter: Counter = new Counter(this.highestCounterID, counterInitData.name, parseFloat(counterInitData.defaultValue));
        this.counters.push(newCounter);
        this.counterActionOutputEmitter.emit({ counterAction: ECounterActions.addCounter, counter: newCounter });
      }
    });
  }

  /**
   * Fired when a counter's input field is modified
   * @param counter - The counter whose input field was modified
   */
  onChangeCounterText(counter: Counter): void {
    const counterElement: HTMLInputElement = <HTMLInputElement>document.getElementById(`counter${counter.id}`);
    counter.value = parseFloat(counterElement.value);
    this.counterActionOutputEmitter.emit({  counterAction: ECounterActions.changeCounterValue, counter: counter });
  }
}
