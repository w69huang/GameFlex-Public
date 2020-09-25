import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import Configuration from '../models/configuration';

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private webService: WebService) { }

  getConfiguration() {
    return this.webService.get('configeditor');
  }

  createConfiguration(configuration: Configuration) {
    return this.webService.post('configpost', { configuration });
  }

  // getTasks (listId: string) {
  //   return this.webService.get(`lists/${listId}/tasks`);
  // }

  createTask (listId: string, title: string) {
    return this.webService.post(`lists/${listId}/tasks`, { title });
  }

  // deleteList (listId: string) {
  //   return this.webService.delete(`lists/${listId}`);
  // }

  // deleteTask ( listId: string, taskId: string ) {
  //   return this.webService.delete(`lists/${listId}/tasks/${taskId}`);
  // }

  // setCompleted (listId: string, task: Task) {
  //   // Recall: On the backend, in app.js, the patch method for tasks updates only the properties that are passed in the body
  //   return this.webService.patch(`lists/${listId}/tasks/${task._id}`, { completed: !task.completed });
  // }
}
