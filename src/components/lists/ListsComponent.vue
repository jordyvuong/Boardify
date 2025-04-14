<!-- src/components/lists/ListComponent.vue -->
<template>
  <div class="list">
    <div class="list-header">
      <h2 class="list-title">{{ list.title }}</h2>
      <button class="list-menu-btn" @click="$emit('menu', list.id)">•••</button>
    </div>

    <div class="cards-container">
      <div v-if="cards.length === 0" class="empty-list-message">Aucune carte dans cette liste</div>

      <card-component
        v-for="card in sortedCards"
        :key="card.id"
        :card="card"
        @click="$emit('card-click', card)"
      />

      <button class="add-card-btn" @click="$emit('add-card', list.id)">+ Ajouter une carte</button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import CardComponent from '../cards/CardComponent.vue'

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cards: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['menu', 'card-click', 'add-card'])

// Trier les cartes par position
const sortedCards = computed(() => {
  return [...props.cards].sort((a, b) => a.position - b.position)
})
</script>

<style scoped>
.list {
  background-color: #ebecf0;
  border-radius: 3px;
  width: 272px;
  min-width: 272px;
  max-height: calc(100vh - 130px);
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  flex-grow: 1;
}

.list-menu-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #6b778c;
  padding: 0.25rem 0.5rem;
  border-radius: 3px;
}

.list-menu-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.cards-container {
  padding: 0 0.5rem 0.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.empty-list-message {
  color: #5e6c84;
  font-size: 0.9rem;
  padding: 0.5rem;
  text-align: center;
  font-style: italic;
}

.add-card-btn {
  background: none;
  border: none;
  color: #5e6c84;
  width: 100%;
  padding: 0.75rem;
  text-align: left;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.add-card-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #172b4d;
}
</style>
