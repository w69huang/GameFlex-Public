import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { ConfigurationService } from 'src/app/services/configuration.service';
import Configuration from '../../models/configuration';

@Component({
  selector: 'app-retrieve-config-popup',
  templateUrl: './retrieve-config-popup.component.html',
  styleUrls: ['./retrieve-config-popup.component.scss']
})
export class RetrieveConfigPopupComponent implements OnInit {

  public configs: Configuration[] = [];
  public configCtrl: FormControl = new FormControl();
  public configFilterCtrl: FormControl = new FormControl();
  public filteredConfigs: ReplaySubject<Configuration[]> = new ReplaySubject<Configuration[]>(1);

  @ViewChild('configNameSelect', { static: true }) configNameSelect: MatSelect;

  protected _onDestroy = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<RetrieveConfigPopupComponent>,
    private configurationService: ConfigurationService
  ) { }

  ngOnInit(): void {
    this.configurationService.getAllConfigurations().subscribe((configurations: Configuration[]) => {
      configurations?.forEach((configuration) => {
        configuration.date = new Date(configuration.date);
      });

      this.configs = configurations;

      // load the initial config list
      this.filteredConfigs.next(this.configs.slice());

      // listen for search field value changes
      this.configFilterCtrl.valueChanges
        .pipe(takeUntil(this._onDestroy))
        .subscribe(() => {
          this.filterConfigs();
        });
    });
  }

  
  /**
  * Sets the initial value after the filteredConfigs are loaded initially
  */
 protected setInitialValue() {
  this.filteredConfigs
    .pipe(take(1), takeUntil(this._onDestroy))
    .subscribe(() => {
      // setting the compareWith property to a comparison function
      // triggers initializing the selection according to the initial value of
      // the form control (i.e. _initializeSelection())
      // this needs to be done after the filteredConfigs are loaded initially
      // and after the mat-option elements are available
      this.configNameSelect.compareWith = (a: Configuration, b: Configuration) => a && b && a === b;
    });
  }

  protected filterConfigs() {
    if (!this.configs) {
      return;
    }
    // get the search keyword
    let search = this.configFilterCtrl.value;
    if (!search) {
      this.filteredConfigs.next(this.configs.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the configs
    this.filteredConfigs.next(
      this.configs.filter(config => config.name.toLowerCase().indexOf(search) > -1 || config.date.toISOString().indexOf(search) > -1)
    );
  }

  cancel(): void {
    this.dialogRef.close();
  }

  submit(configuration: Configuration): void {
    this.dialogRef.close(configuration);
  }
}
