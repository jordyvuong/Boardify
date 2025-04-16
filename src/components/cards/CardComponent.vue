<template>
  <div
    class="card"
    draggable="true"
    @click="$emit('click')"
    @dragstart="$emit('dragstart', $event)"
    @dragend="$emit('dragend')"
    @mouseenter="$emit('mouseenter')"
    @mouseleave="$emit('mouseleave')"
  >
    <button
      v-if="showCheckbox"
      class="check-button"
      :class="{ checked: card.checked }"
      @click.stop="$emit('check')"
    >
      {{ card.checked ? '✓' : '' }}
    </button>

    <div v-if="hasLabels" class="card-labels">
      <span
        v-for="(value, label) in card.labels"
        :key="label"
        class="card-label"
        :style="{ backgroundColor: getLabelColor(label) }"
        v-if="value"
      >
        {{ showLabelNames ? getLabelName(label) : '' }}
      </span>
    </div>

    <h3 class="card-title" :class="{ checked: card.checked }">
      {{ card.title }}
    </h3>

    <p v-if="card.description" class="card-description">
      {{ card.description }}
    </p>

    <div class="card-footer" v-if="card.dueDate || card.assignedTo">
      <div v-if="card.dueDate" class="card-due-date">📅 {{ formattedDate }}</div>
      <div v-if="card.assignedTo" class="card-assigned">👤 {{ card.assignedTo }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  card: {
    type: Object,
    required: true,
  },
  showCheckbox: {
    type: Boolean,
    default: false,
  },
  showLabelNames: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['click', 'check', 'dragstart', 'dragend', 'mouseenter', 'mouseleave'])

const labelColors = {
  technical: '#FF8C00',
  frontend: '#0079BF',
  feature: '#61BD4F',
  personal: '#FF78CB',
  bug: '#EB5A46',
  important: '#C377E0',
}

const labels = {
  technical: 'Technique',
  frontend: 'Frontend',
  feature: 'Fonctionnalité',
  personal: 'Personnel',
  bug: 'Bug',
  important: 'Important',
}

// Computed properties
const hasLabels = computed(() => props.card.labels && Object.keys(props.card.labels).length > 0)

const formattedDate = computed(() => {
  if (!props.card.dueDate) return ''
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(props.card.dueDate))
})

// Methods
const getLabelColor = (labelKey) => labelColors[labelKey] || '#CCCCCC'
const getLabelName = (labelKey) => labels[labelKey] || labelKey
</script>

<style>
@import '@/assets/components/card.css';
</style>
