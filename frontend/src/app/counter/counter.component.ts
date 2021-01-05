import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import Counter from '../models/counter';
import { CreateCounterPopupComponent } from '../popups/create-counter-popup/create-counter-popup.component';

export class CounterInitData {
  name: string;
  id: number;
  defaultValue: string;
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
  @Input() private counterIdEmitter: EventEmitter<CounterInitData> = new EventEmitter<CounterInitData>();

  /**
   * This emitter is used to send the parent component all the current counter values
   */
  @Output() private countersEmitter: EventEmitter<Counter[]> = new EventEmitter<Counter[]>();
 
  /**
   * This emitter is used to request an ID for the newly created counter
   */
  @Output() private requestCounterIdEmitter: EventEmitter<CounterInitData> = new EventEmitter<CounterInitData>();

  /**
   * The list of counters, rendered in an ngFor in the html
   */
  counters: Counter[] = [];

  /**
   * The constructor
   * @param dialog - Used to create popups
   */
  constructor(private dialog: MatDialog) { }

  /**
   * What to do upon initialization
   */
  ngOnInit(): void {
    this.counterIdEmitter.subscribe((counterInitData: CounterInitData) => {
        // Just for the create counter button
        this.counters.push(new Counter(counterInitData.id, counterInitData.name, parseFloat(counterInitData.defaultValue))); //TODO: Take in meaningful names
        this.countersEmitter.emit(this.counters);

    });
  }

  /**
   * Creates a new counter.
   */
  initCounter() {
    let dialogRef = this.dialog.open(CreateCounterPopupComponent, {
      height: '500px',
      width: '500px',
    });

    dialogRef.afterClosed().subscribe((counterInitData: CounterInitData) => {
      if (counterInitData) {
        this.requestCounterIdEmitter.emit(counterInitData);
      }
    });
  }
}
