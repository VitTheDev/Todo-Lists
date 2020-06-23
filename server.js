const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '.public/index.html');
  res.sendFile(__dirname + '.public/style.css');
  res.sendFile(__dirname + '.public/app.js');
});

mongoose.connect('mongodb://localhost:27017/newTasksDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const taskSchema = new mongoose.Schema({
  name: String,
  id: Number,
  urgency: String,
  status: String,
});

const Task = mongoose.model('Task', taskSchema);

app.get('/posts', (req, res, next) => {
  Task.find((err, tasks) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).json(tasks);
    }
  });
});

app.use('/delete', (req, res, next) => {
  Task.collection
    .drop()
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post('/', (req, res, next) => {
  let tasks = [];
  let incomingData = req.body;
  incomingData.body.forEach((item) => {
    tasks.push(item);
  });
  res.sendStatus(201);
  tasks.forEach((item) => {
    const task = new Task({
      name: item.taskTitle,
      id: item.taskId,
      urgency: item.taskUrgency,
      status: item.taskStatus,
    });
    task.save();
  });
});

app.listen(3000, () => {
  console.log('server is running on port 3000');
});
