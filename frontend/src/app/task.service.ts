import { Injectable } from '@angular/core';
import { WebService } from './web.service';
import Task from './models/task';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webService: WebService) { }

  getLists() {
    return this.webService.get('lists');
  }

  createList (title: string) {
    // Here we are sending `{ title }` as the body of the request
    // Because the backend is looking for req.body.title, and our parameter is title, this is fine
    // If our parameter were not title, we'd have to make a JS object of the form
    // { title: "blah" } or { "title": "blah" }
    return this.webService.post('lists', { title });
  }

  getTasks (listId: string) {
    return this.webService.get(`lists/${listId}/tasks`);
  }

  createTask (listId: string, title: string) {
    return this.webService.post(`lists/${listId}/tasks`, { title });
  }

  deleteList (listId: string) {
    return this.webService.delete(`lists/${listId}`);
  }

  deleteTask ( listId: string, taskId: string ) {
    return this.webService.delete(`lists/${listId}/tasks/${taskId}`);
  }

  setCompleted (listId: string, task: Task) {
    // Recall: On the backend, in app.js, the patch method for tasks updates only the properties that are passed in the body
    return this.webService.patch(`lists/${listId}/tasks/${task._id}`, { completed: !task.completed });
  }
}
