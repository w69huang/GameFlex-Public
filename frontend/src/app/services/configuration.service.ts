import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import Configuration from '../models/configuration';
import { use } from 'matter';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private webService: WebService) { }

  getConfiguration(configurationId) {
    return this.webService.get(`configuration/${configurationId}`, true);
  }

  createConfiguration(configuration: Configuration) {
    return this.webService.post(`configuration`, { configuration }, true);
  }

  updateConfiguration(configuration: Configuration) {
    console.log('Front end updateConfig!');
    return this.webService.patch(`configuration/${configuration._id}`, { configuration }, true);
  }

  deleteConfiguration(configurationId) {
    console.log('Front end deleteConfig!!');
    return this.webService.delete(`configuration/${configurationId}`, true);
  }


  // setCompleted (listId: string, task: Task) {
  //   // Recall: On the backend, in app.js, the patch method for tasks updates only the properties that are passed in the body
  //   return this.webService.patch(`lists/${listId}/tasks/${task._id}`, { completed: !task.completed });
  // }
}
