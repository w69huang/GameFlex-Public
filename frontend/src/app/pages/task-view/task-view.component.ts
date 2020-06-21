import { Component, OnInit } from '@angular/core';
import Task from 'src/app/models/task';
import { TaskService } from 'src/app/task.service';
import List from 'src/app/models/list';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  lists: any[] = [];
  tasks: Task[] = [];
  listId: string;

  constructor(
    private taskService: TaskService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  // This hook waits until the entire component is loaded before running.
  ngOnInit (): void {
    // The HttpClient returns "observables" that you can subscribe to in order to facilitate asychronous communication
    this.taskService.getLists()
        .subscribe((lists: List[]) => this.lists = lists);

    this.route.params.subscribe((params: Params) => {
      this.listId = params.listId;

      if (!this.listId) return;
      
      this.taskService.getTasks(this.listId)
          .subscribe((tasks: Task[]) => this.tasks = tasks);
    });
  }

  onTaskClick (task: Task) {
    this.taskService.setCompleted(this.listId, task)
        .subscribe(() => task.completed = !task.completed);
  }

  deleteTask(task: Task) {
    this.taskService.deleteTask(this.listId, task._id)
      .subscribe((task: Task) => this.tasks = this.tasks.filter(t => t._id != task._id)); // .filter() is a mapper that returns a new array with elements that fulfill the condition specified
  }

  deleteList(list: List) {
    this.taskService.deleteList(list._id)
      .subscribe(() => this.lists = this.lists.filter(l => l._id != list._id))
  }

  addTaskClick() {
    if (!this.listId) {
      alert("Please select a list to add tasks to.");
      return;
    }

    // Specifying `relative-to: this.route` ensures that /new-task is being appended onto the existing URL
    // This means that it won't overwrite the current listId!
    this.router.navigate(['./new-task'], { relativeTo: this.route });
  }

}
