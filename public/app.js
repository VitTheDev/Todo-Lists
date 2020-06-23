const taskForm = document.getElementById('task-form');
const newTasksListElement = document.getElementById('not-started');
const date = document.getElementById('date-info');
const inProgressListElement = document.getElementById('in-progress');
const finishedListElement = document.getElementById('finished');
const listContainer = document.getElementById('list-container');
const databaseBtn = document.getElementById('saveBtn');

class Form {
  constructor(taskForm) {
    this.taskForm = taskForm;

    taskForm.addEventListener('submit', this.createTask);
  }
  createTask(e) {
    e.preventDefault();
    const userInput = document.getElementById('task-name');
    if (userInput.value !== '') {
      const urgencyInput = document.getElementById('select-urgency');
      const newId = Math.floor(Math.random() * 1000000);
      const task = new Task(userInput.value, newId, urgencyInput.value, 'new');
      taskList.newTasks.push(task);
      taskList.renderList();
      form.clearInput();
      form.showMessage('New task successfully added');
    }
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
    }, 2000);
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
    if (this.task.taskUrgency === 'urgent') {
      taskEl.innerHTML = `
      <a class='task-content'>${this.task.taskTitle}</a><p>🔥🔥🔥</p><i class='fas fa-trash'></i>
      `;
    } else if (this.task.taskUrgency === 'sharpish') {
      taskEl.innerHTML = `
      <a class='task-content'>${this.task.taskTitle}</a><p>😯</p><i class='fas fa-trash'></i>
      `;
    } else {
      taskEl.innerHTML = `
      <a class='task-content'>${this.task.taskTitle}</a><p>🤠</p><i class='fas fa-trash'></i>
      `;
    }
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
        form.showMessage('task reset');
      } else if (e.target.classList.contains('progress')) {
        taskList.newTasks.forEach((item) => {
          if (dragId == item.taskId) {
            item.taskStatus = 'in-progress';
          }
        });
        form.showMessage('task moved to the middle list');
      } else if (e.target.classList.contains('finish')) {
        taskList.newTasks.forEach((item) => {
          if (dragId == item.taskId) {
            item.taskStatus = 'done';
          }
        });
        form.showMessage('Done! Good Job');
      }
      taskList.renderList();
    });
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
        taskList.renderList();
        form.showMessage('Task successfully removed');
      }
    });
  }
}

class App {
  getDate() {
    let day = new Date().toDateString();
    date.textContent = day;
  }

  getDataFromDatabase() {
    axios.get('/posts').then((res) => {
      res.data.forEach((item) => {
        const task = {
          taskTitle: item.name,
          taskId: item.id,
          taskUrgency: item.urgency,
          taskStatus: item.status,
        };
        taskList.newTasks.push(task);
      });
      taskList.renderList();
    });
  }
}

const form = new Form(taskForm);
const taskList = new TaskList(newTasksListElement, listContainer);
const app = new App();

app.getDataFromDatabase();
app.getDate();

async function saveToDatabase() {
  const str = taskList.newTasks;
  const hubla = await axios
    .post('/delete', {})
    .then(
      axios.post(
        '/',
        { body: str },
        { headers: { 'Content-Type': 'application/json' } }
      )
    );
}

databaseBtn.addEventListener('click', saveToDatabase);
