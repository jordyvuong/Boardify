<template>
    <div class="board-view">
      <h1>Gestion de Projet</h1>
  
      <div class="columns">
        <p v-if="columns.length === 0">Aucune colonne</p>
        <Column
          v-for="(column, index) in columns"
          :key="index"
          :column="column"
          @add-task="addTask(index, $event)"
          @delete-column="deleteColumn(index)"
          @update-status="updateColumnStatus(index, $event)"
        />
      </div>
  
      <div class="add-column">
        <button @click="addColumn">+ Ajouter une colonne</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import Column from '../components/Column.vue'
  
  const columns = ref([
    { name: 'À faire', status: 'À faire', tasks: [] },
    { name: 'En cours', status: 'En cours', tasks: [] },
    { name: 'Terminé', status: 'Terminé', tasks: [] },
  ])
  
  const addColumn = () => {
    columns.value.push({ name: 'Nouvelle colonne', status: 'À faire', tasks: [] })
  }
  
  const addTask = (index, taskName) => {
    if (taskName) {
      columns.value[index].tasks.push({ name: taskName, id: Date.now() })
    }
  }
  
  const deleteColumn = (index) => {
    columns.value.splice(index, 1)
  }
  
  const updateColumnStatus = (index, status) => {
    columns.value[index].status = status
  }
  </script>
  
  <style scoped>
  .board-view {
    padding: 20px;
    background-color: #f4f5f7;
    min-height: 100vh;
  }
  
  .columns {
    display: flex;
    gap: 20px;
    overflow-x: auto;
  }
  
  .add-column {
    margin-top: 20px;
  }
  
  button {
    background-color: #0079bf;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #026aa7;
  }
  </style>