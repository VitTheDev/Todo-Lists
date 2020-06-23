const newTasksListElement = document.getElementById('not-started');
const inProgressListElement = document.getElementById('in-progress');
const finishedListElement = document.getElementById('finished');
const listContainer = document.getElementById('list-container');

class Form {
  constructor() {
    this.taskForm = document.getElementById('task-form');

    taskForm.addEventListener('submit', this.createTask);
  }
  createTask(e) {
    e.preventDefault();
    const userInput = document.getElementById('task-name');
    const urgencyInput = document.getElementById('select-urgency');
    const newId = Math.floor(Math.random() * 1000000);
    const task = new Task(userInput.value, newId, urgencyInput.value, 'new');
    taskList.newTasks.push(task);
    app.saveDataToLocalStorage();
    taskList.renderList();
    form.clearInput();
    form.showMessage('New task successfully added');
  }

  clearInput = () => {
    const userInput = document.getElementById('task-name');
    userInput.value = '';
  };

  showMessage(message) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.style.visibility = 'visible';

    setTimeout(() => {
      alert.style.visibility = 'hidden';
    }, 1000);
  }
}

class Task {
  constructor(taskTitle, taskId, taskUrgency, taskStatus) {
    this.taskTitle = taskTitle;
    this.taskId = taskId;
    this.taskUrgency = taskUrgency;
    this.taskStatus = taskStatus;
  }
}

class TaskItem {
  constructor(task) {
    this.task = task;
  }

  renderItem() {
    const taskEl = document.createElement('li');
    taskEl.className = 'list-item';
    taskEl.draggable = 'true';
    taskEl.id = this.task.taskId;
    taskEl.innerHTML = `
    <a class='task-content'>${this.task.taskTitle}</a><i class='fas fa-trash'></i>
    `;
    return taskEl;
  }
}
let dragId;
class TaskList {
  constructor(newTasksListElement, listContainer) {
    this.newTasksListElement = newTasksListElement;
    this.listContainer = listContainer;
    this.connectDroppable();
    this.removeItem();
    this.connectDrag();

    newTasksListElement.addEventListener('click', this.removeItem);
    listContainer.addEventListener('click', this.changeTaskStatus);
  }
  newTasks = [];

  connectDrag() {
    listContainer.addEventListener('dragstart', (e) => {
      dragId = e.target.id;
      if (dragId) {
        e.dataTransfer.effectAllowed = 'move';
      }
    });

    listContainer.addEventListener('dragend', (e) => {
      e.preventDefault();
      console.log('event ended');
    });
  }

  connectDroppable() {
    listContainer.addEventListener('dragenter', (e) => {
      e.preventDefault();
      listContainer.classList.add('droppable');
    });

    listContainer.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });

    listContainer.addEventListener('dragleave', (e) => {
      listContainer.classList.remove('droppable');
    });

    listContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    listContainer.addEventListener('drop', (e) => {
      if (e.target.classList.contains('start')) {
        taskList.newTasks.forEach((item) => {
          if (dragId == item.taskId) {
            item.taskStatus = 'new';
          }
        });
        taskList.renderList();
      } else if (e.target.classList.contains('progress')) {
        taskList.newTasks.forEach((item) => {
          if (dragId == item.taskId) {
            item.taskStatus = 'in-progress';
          }
        });
        taskList.renderList();
      } else if (e.target.classList.contains('finish')) {
        taskList.newTasks.forEach((item) => {
          if (dragId == item.taskId) {
            item.taskStatus = 'done';
          }
        });
        taskList.renderList();
      }
    });
  }

  changeTaskStatus(e) {
    if (e.target.classList.contains('task-content')) {
      taskList.newTasks.forEach((task) => {
        if (
          e.target.parentElement.id == task.taskId &&
          task.taskStatus === 'new'
        ) {
          task.taskStatus = 'in-progress';
        } else if (
          e.target.parentElement.id == task.taskId &&
          task.taskStatus === 'in-progress'
        ) {
          task.taskStatus = 'done';
        } else if (
          e.target.parentElement.id == task.taskId &&
          task.taskStatus === 'done'
        ) {
          task.taskStatus = 'new';
        }
      });
      taskList.renderList();
      app.saveDataToLocalStorage();
      form.showMessage('Task successfully moved');
    }
  }

  renderList() {
    newTasksListElement.innerHTML = '';
    inProgressListElement.innerHTML = '';
    finishedListElement.innerHTML = '';
    this.newTasks.forEach((item) => {
      const newTaskItem = new TaskItem(item);
      const newTask = newTaskItem.renderItem();
      if (item.taskStatus === 'new') {
        newTasksListElement.append(newTask);
      } else if (item.taskStatus === 'in-progress') {
        inProgressListElement.append(newTask);
      } else {
        finishedListElement.append(newTask);
      }
    });
  }

  removeItem() {
    listContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('fa-trash')) {
        taskList.newTasks.forEach((task, index) => {
          if (e.target.parentElement.id == task.taskId) {
            taskList.newTasks.splice(index, 1);
          }
        });
        app.saveDataToLocalStorage();
        taskList.renderList();
        form.showMessage('Task successfully removed');
      }
    });
  }
}

class App {
  static init() {
    app.getDataFromLocalStorage();
    taskList.renderList();
  }

  saveDataToLocalStorage() {
    const str = JSON.stringify(taskList.newTasks);
    localStorage.setItem('tasks', str);
  }

  getDataFromLocalStorage() {
    const str = localStorage.getItem('tasks');
    taskList.newTasks = JSON.parse(str);
    if (!taskList.newTasks) {
      taskList.newTasks = [];
    }
  }
}

const taskList = new TaskList(newTasksListElement, listContainer);
const app = new App();

App.init();
