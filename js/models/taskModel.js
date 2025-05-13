// js/models/taskModel.js
import StorageService from "./storageService.js";

const TaskModel = (() => {
  let tasks = StorageService.load("tasks") || [];

  const saveTasks = () => StorageService.save("tasks", tasks);

  const getTasksByProject = (projectId) => {
    return tasks.filter((task) => task.projectId === projectId);
  };

  const createTask = (task) => {
    task.id = Date.now().toString();
    tasks.push(task);
    saveTasks();
    return task;
  };

  const updateTask = (id, updates) => {
    tasks = tasks.map((task) =>
      task.id === id ? { ...task, ...updates } : task
    );
    saveTasks();
  };

  const deleteTask = (id) => {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
  };

  const getTaskById = (id) => tasks.find((task) => task.id === id);

  const getAllTasks = () => tasks;

  const importTasks = (newTasks) => {
    tasks = newTasks;
    saveTasks();
  };

  return {
    createTask,
    updateTask,
    deleteTask,
    getTasksByProject,
    getAllTasks,
    getTaskById,
    importTasks,
  };
})();

export default TaskModel;
