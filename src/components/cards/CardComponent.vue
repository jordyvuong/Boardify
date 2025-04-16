<!-- src/components/cards/CardComponent.vue -->
<template>
  <div class="card" @click="$emit('click')">
    <div v-if="card.labels && Object.keys(card.labels).length > 0" class="card-labels">
      <span 
        v-for="(value, label) in card.labels" 
        :key="label"
        class="card-label"
        :style="{ backgroundColor: getLabelColor(label) }"
        v-if="value"
      ></span>
    </div>
    
    <h3 class="card-title">{{ card.title }}</h3>
    
    <p v-if="card.description" class="card-description">{{ card.description }}</p>
    
    <div class="card-footer" v-if="card.dueDate || card.assignedTo">
      <div v-if="card.dueDate" class="card-due-date">
        📅 {{ formatDate(card.dueDate) }}
      </div>
      <div v-if="card.assignedTo" class="card-assigned">
        👤
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  card: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['click']);

// Couleurs des étiquettes
const labelColors = {
  technical: '#FF8C00',
  frontend: '#0079BF',
  feature: '#61BD4F',
  personal: '#FF78CB',
  bug: '#EB5A46',
  important: '#C377E0'
};

// Obtenir la couleur d'une étiquette
const getLabelColor = (labelKey) => {
  return labelColors[labelKey] || '#CCCCCC';
};

// Formater une date
const formatDate = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit'
  }).format(date);
};
</script>

<style scoped>
.card {
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(9, 30, 66, 0.25);
}

.card-labels {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.card-label {
  height: 8px;
  width: 40px;
  border-radius: 4px;
  display: block;
}

.card-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  word-wrap: break-word;
}

.card-description {
  font-size: 0.8rem;
  color: #5e6c84;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.card-footer {
  font-size: 0.75rem;
  color: #5e6c84;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
}

.card-due-date, .card-assigned {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}
</style>