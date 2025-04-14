<template>
    <div class="column">
      <div class="column-header">
        <h2>{{ column.name }}</h2>
        <button @click="deleteColumn">X</button>
      </div>
  
      <select v-model="column.status" @change="updateStatus">
        <option value="À faire">À faire</option>
        <option value="En cours">En cours</option>
        <option value="Terminé">Terminé</option>
        <option value="À faire plus tard">À faire plus tard</option>
      </select>
  
      <div class="tasks">
        <p v-if="column.tasks.length === 0">Aucune tâche</p>
        <TaskCard
          v-for="(task, index) in column.tasks"
          :key="task.id"
          :task="task"
          @delete-task="deleteTask(index)"
          @edit-task="editTask(index)"
        />
      </div>
  
      <div class="add-task">
        <input v-model="newTaskName" placeholder="Nouvelle tâche" />
        <button @click="addNewTask">Ajouter</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, ref } from 'vue'
  import TaskCard from './TaskCard.vue'
  
  const props = defineProps({
    column: Object,
  })
  
  const emit = defineEmits(['add-task', 'delete-column', 'update-status'])
  
  const newTaskName = ref('')
  
  const addNewTask = () => {
    if (newTaskName.value.trim()) {
      emit('add-task', newTaskName.value.trim())
      newTaskName.value = ''
    }
  }
  
  const deleteColumn = () => {
    emit('delete-column')
  }
  
  const deleteTask = (taskIndex) => {
    props.column.tasks.splice(taskIndex, 1)
  }
  
  const editTask = (taskIndex) => {
    const newTaskName = prompt('Modifier le nom de la tâche:', props.column.tasks[taskIndex].name)
    if (newTaskName) {
      props.column.tasks[taskIndex].name = newTaskName
    }
  }
  
  const updateStatus = () => {
    emit('update-status', props.column.status)
  }
  </script>
  
  <style scoped>
  .column {
    width: 300px;
    background-color: white;
    border-radius: 6px;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .column-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .tasks {
    margin-top: 10px;
  }
  
  .add-task {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  
  input {
    flex: 1;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  </style>