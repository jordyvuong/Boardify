<template>
    <div class="task-card">
      <div class="task-content">
        <p>{{ task.name }}</p>
      </div>
      <div class="task-actions">
        <button @click="deleteTask">Supprimer</button>
        <button @click="editTask">Modifier</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue'
  
  const props = defineProps({
    task: Object,
    index: Number,
  })
  
  const emit = defineEmits(['delete-task', 'edit-task'])
  
  const deleteTask = () => {
    emit('delete-task', props.index)
  }
  
  const editTask = () => {
    const newTaskName = prompt('Modifier le nom de la tâche:', props.task.name)
    if (newTaskName) {
      props.task.name = newTaskName
    }
  }
  </script>
  
  <style scoped>
  .task-card {
    background-color: #f4f5f7;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  </style>