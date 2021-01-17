import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { SavedGameStateService } from 'src/app/services/saved-game-state.service';
import SavedGameState from '../../models/savedGameState';

@Component({
  selector: 'app-retrieve-game-state-popup',
  templateUrl: './retrieve-game-state-popup.component.html',
  styleUrls: ['./retrieve-game-state-popup.component.scss']
})
export class RetrieveGameStatePopupComponent implements OnInit {

  public saves: SavedGameState[] = [];
  public saveCtrl: FormControl = new FormControl();
  public saveFilterCtrl: FormControl = new FormControl();
  public filteredSaves: ReplaySubject<SavedGameState[]> = new ReplaySubject<SavedGameState[]>(1);

  @ViewChild('saveNameSelect', { static: true }) saveNameSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<RetrieveGameStatePopupComponent>,
    private savedGameStateService: SavedGameStateService
  ) { }

  ngOnInit(): void {
    this.savedGameStateService.getAll().subscribe((savedGameStates: SavedGameState[]) => {
      savedGameStates?.forEach((savedGameState) => {
        savedGameState.date = new Date(savedGameState.date);
      });

      this.saves = savedGameStates;

      // load the initial save list
      this.filteredSaves.next(this.saves.slice());

      // listen for search field value changes
      this.saveFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterSaves();
        });
    });
  }

  ngAfterViewInit() {
    // this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
  * Sets the initial value after the filteredSaves are loaded initially
  */
  protected setInitialValue() {
    this.filteredSaves
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredSaves are loaded initially
        // and after the mat-option elements are available
        this.saveNameSelect.compareWith = (a: SavedGameState, b: SavedGameState) => a && b && a === b;
      });
  }

  protected filterSaves() {
    if (!this.saves) {
      return;
    }
    // get the search keyword
    let search = this.saveFilterCtrl.value;
    if (!search) {
      this.filteredSaves.next(this.saves.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the saves
    this.filteredSaves.next(
      this.saves.filter(save => save.name.toLowerCase().indexOf(search) > -1 || save.date.toISOString().indexOf(search) > -1)
    );
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(savedGameState: SavedGameState): void {
    this.dialogRef.close(savedGameState);
  }
}
