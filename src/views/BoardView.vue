<template>
  <div
    v-if="boardsStore.currentBoard"
    class="board-view"
    :style="{ backgroundColor: backgroundColorLight }"
  >
    <div
      class="board-header"
      :style="{ backgroundColor: boardsStore.currentBoard.backgroundColor || '#0079BF' }"
    >
      <div class="board-info">
        <h1 class="board-title">{{ boardsStore.currentBoard.title }}</h1>
        <p class="board-description" v-if="boardsStore.currentBoard.description">
          {{ boardsStore.currentBoard.description }}
        </p>
      </div>
      <div class="board-actions">
        <button class="action-btn" @click="goBack">Retour</button>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement du tableau...</p>
    </div>

    <div v-else class="board-content">
      <div class="lists-container">
        <div v-for="list in boardsStore.lists" :key="list.id" class="list">
          <div class="list-header">
            <!-- Zone du titre avec édition conditionnelle -->
            <div class="list-title-container">
              <h2 v-if="!isEditing || editingListId !== list.id" class="list-title">
                {{ list.title }}
              </h2>
              <input
                v-else
                type="text"
                v-model="editedTitle"
                @keyup.enter="saveListTitle"
                @keyup.esc="cancelEditingList"
                @blur="saveListTitle"
                class="list-title-input"
                ref="titleInput"
              />
            </div>
            <button class="list-menu-btn" @click.stop="showListMenu(list.id, $event)">•••</button>
          </div>

          <div class="cards-container">
            <div
              v-for="card in getCardsForList(list.id)"
              :key="card.id"
              class="card"
              @click="openCardDetails(card)"
            >
              <div v-if="card.labels && Object.keys(card.labels).length > 0" class="card-labels">
                <span
                  v-for="(value, label) in card.labels"
                  :key="label"
                  class="card-label"
                  :style="{ backgroundColor: getLabelColor(label) }"
                  v-if="value"
                >
                  {{ getLabelName(label) }}
                </span>
              </div>
              <h3 class="card-title">{{ card.title }}</h3>
              <p v-if="card.description" class="card-description">{{ card.description }}</p>

              <div class="card-footer" v-if="card.dueDate || card.assignedTo">
                <div v-if="card.dueDate" class="card-due-date">
                  📅 {{ formatDate(card.dueDate) }}
                </div>
                <div v-if="card.assignedTo" class="card-assigned">
                  👤 {{ getUserName(card.assignedTo) }}
                </div>
              </div>
            </div>

            <button class="add-card-btn" @click="showAddCardForm(list.id)">
              + Ajouter une carte
            </button>
          </div>
        </div>

        <!-- Ajouter une nouvelle liste -->
        <div class="add-list">
          <button v-if="!showNewListForm" class="add-list-btn" @click="beginAddList">
            + Ajouter une liste
          </button>

          <div v-else class="new-list-form">
            <input
              type="text"
              v-model="newListTitle"
              placeholder="Titre de la liste"
              ref="newListInput"
              id="newListInput"
              @keyup.enter="createNewList"
              @keyup.esc="cancelNewList"
            />

            <div class="form-actions">
              <button class="add-btn" @click="createNewList" :disabled="!newListTitle">
                Ajouter
              </button>
              <button class="cancel-btn" @click="cancelNewList">Annuler</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu contextuel des listes -->
    <div v-if="showListMenuPopup" class="list-menu" :style="listMenuPosition">
      <button class="menu-item" @click="editListTitle">
        <span class="menu-icon">✏️</span> Modifier le titre
      </button>
      <button class="menu-item danger" @click="confirmDeleteList">
        <span class="menu-icon">🗑️</span> Supprimer la liste
      </button>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div
      v-if="showDeleteConfirmation"
      class="modal-overlay"
      @click.self="showDeleteConfirmation = false"
    >
      <div class="modal-content">
        <h2>Supprimer la liste</h2>
        <p>Êtes-vous sûr de vouloir supprimer cette liste ?</p>
        <p class="warning-text">
          Toutes les cartes qu'elle contient seront aussi supprimées. Cette action est irréversible.
        </p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteConfirmation = false">Annuler</button>
          <button class="delete-btn" @click="deleteList" :disabled="isDeleting">
            {{ isDeleting ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout de carte -->
    <div v-if="showCardForm" class="modal-overlay" @click.self="closeCardForm">
      <div class="modal-content">
        <h2>Ajouter une carte</h2>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <form @submit.prevent="createNewCard">
          <div class="form-group">
            <label for="cardTitle">Titre</label>
            <input
              type="text"
              id="cardTitle"
              v-model="newCard.title"
              required
              placeholder="Titre de la carte"
              ref="cardTitleInput"
            />
          </div>

          <div class="form-group">
            <label for="cardDescription">Description (optionnel)</label>
            <textarea
              id="cardDescription"
              v-model="newCard.description"
              placeholder="Description de la carte"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Étiquettes</label>
            <div class="labels-selection">
              <div
                v-for="(label, key) in labels"
                :key="key"
                class="label-option"
                :style="{ backgroundColor: label.color }"
                :class="{ selected: newCard.labels && newCard.labels[key] }"
                @click="toggleLabel(key)"
              >
                {{ label.name }}
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="cardDueDate">Date d'échéance (optionnel)</label>
            <input type="date" id="cardDueDate" v-model="newCard.dueDate" />
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="closeCardForm">Annuler</button>
            <button type="submit" class="create-btn" :disabled="!newCard.title">Créer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de détails de carte -->
    <div v-if="selectedCard" class="modal-overlay" @click.self="closeCardDetails">
      <div class="modal-content card-details">
        <div class="card-detail-header">
          <h2>{{ selectedCard.title }}</h2>
          <button class="close-btn" @click="closeCardDetails">×</button>
        </div>

        <div class="card-detail-content">
          <div class="form-group">
            <label>Dans la liste</label>
            <p class="list-name">
              {{ getListName(selectedCard.listId) }}
            </p>
          </div>

          <div class="form-group">
            <label>Description</label>
            <p class="description" v-if="selectedCard.description">
              {{ selectedCard.description }}
            </p>
            <p class="no-description" v-else>Aucune description</p>
          </div>

          <div
            class="form-group"
            v-if="selectedCard.labels && Object.keys(selectedCard.labels).length > 0"
          >
            <label>Étiquettes</label>
            <div class="labels-display">
              <span
                v-for="(value, label) in selectedCard.labels"
                :key="label"
                class="card-label"
                :style="{ backgroundColor: getLabelColor(label) }"
                v-if="value"
              >
                {{ getLabelName(label) }}
              </span>
            </div>
          </div>

          <div class="form-group" v-if="selectedCard.dueDate">
            <label>Date d'échéance</label>
            <p class="due-date">📅 {{ formatDate(selectedCard.dueDate) }}</p>
          </div>

          <div class="form-group" v-if="selectedCard.assignedTo">
            <label>Assigné à</label>
            <p class="assigned-to">👤 {{ getUserName(selectedCard.assignedTo) }}</p>
          </div>

          <div class="form-group">
            <label>Créé le</label>
            <p class="created-at">
              {{ formatDate(selectedCard.createdAt) }}
            </p>
          </div>
        </div>

        <div class="card-detail-actions">
          <button class="delete-btn" @click="deleteSelectedCard">Supprimer cette carte</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="loading-container">
    <div class="loading-spinner"></div>
    <p>Chargement du tableau...</p>
  </div>
  <div v-else class="error-container">
    <h2>Tableau non trouvé</h2>
    <p>
      Le tableau que vous recherchez n'existe pas ou vous n'avez pas l'autorisation d'y accéder.
    </p>
    <button class="action-btn" @click="goBack">Retour aux tableaux</button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBoardsStore } from '@/stores/boards'
import { getLighterColor } from '@/utils/colors'

const route = useRoute()
const router = useRouter()
const boardsStore = useBoardsStore()

const loading = ref(true)
const error = ref('')
const showNewListForm = ref(false)
const newListTitle = ref('')
const showCardForm = ref(false)
const activeListId = ref(null)
const selectedCard = ref(null)

// Variables pour la gestion du menu et de l'édition des listes
const selectedListId = ref(null)
const showListMenuPopup = ref(false)
const listMenuPosition = ref({})
const isEditing = ref(false)
const editingListId = ref(null)
const editedTitle = ref('')
const showDeleteConfirmation = ref(false)
const isDeleting = ref(false)

// Nouveau modèle de carte
const newCard = ref({
  title: '',
  description: '',
  labels: {},
  dueDate: '',
})

// Étiquettes disponibles
const labels = ref({
  technical: { name: 'Technique', color: '#FF8C00' },
  frontend: { name: 'Frontend', color: '#0079BF' },
  feature: { name: 'Fonctionnalité', color: '#61BD4F' },
  personal: { name: 'Personnel', color: '#FF78CB' },
  bug: { name: 'Bug', color: '#EB5A46' },
  important: { name: 'Important', color: '#C377E0' },
})

const backgroundColorLight = computed(() => {
  if (!boardsStore.currentBoard) return '#f0f2f5'
  return getLighterColor(boardsStore.currentBoard.backgroundColor || '#0079BF', 0.9)
})

// Charger le tableau au montage du composant
onMounted(async () => {
  try {
    const boardId = route.params.id
    if (!boardId) {
      router.push('/boards')
      return
    }

    await boardsStore.loadBoard(boardId)

    // Ajouter un écouteur pour fermer le menu des listes en cliquant ailleurs
    document.addEventListener('click', closeListMenuOnClickOutside)
  } catch (e) {
    error.value = e.message
    console.error('Error loading board:', e)
  } finally {
    loading.value = false
  }
})

// Nettoyer l'écouteur lors de la destruction du composant
onUnmounted(() => {
  document.removeEventListener('click', closeListMenuOnClickOutside)
})

// Fermer le menu des listes en cliquant ailleurs
const closeListMenuOnClickOutside = () => {
  showListMenuPopup.value = false
}

// Filtrer les cartes par liste
const getCardsForList = (listId) => {
  return boardsStore.cards
    .filter((card) => card.listId === listId)
    .sort((a, b) => a.position - b.position)
}

// Obtenir le nom d'une liste
const getListName = (listId) => {
  const list = boardsStore.lists.find((l) => l.id === listId)
  return list ? list.title : 'Liste inconnue'
}

// Obtenir le nom d'un utilisateur
const getUserName = (userId) => {
  return userId
}

// Obtenir la couleur d'une étiquette
const getLabelColor = (labelKey) => {
  return labels.value[labelKey]?.color || '#CCCCCC'
}

// Obtenir le nom d'une étiquette
const getLabelName = (labelKey) => {
  return labels.value[labelKey]?.name || labelKey
}

const formatDate = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// Retourner à la liste des tableaux
const goBack = () => {
  router.push('/boards')
}

// Commencer l'ajout d'une liste
const beginAddList = () => {
  showNewListForm.value = true

  // Focus sur le champ d'entrée après le rendu
  setTimeout(() => {
    const input = document.getElementById('newListInput')
    if (input) input.focus()
  }, 50)
}

// Créer une nouvelle liste
const createNewList = async () => {
  if (!newListTitle.value.trim()) return

  try {
    await boardsStore.createList({
      title: newListTitle.value.trim(),
      boardId: boardsStore.currentBoard.id,
    })

    // Réinitialiser le formulaire
    newListTitle.value = ''
    showNewListForm.value = false
  } catch (e) {
    error.value = 'Erreur lors de la création de la liste'
    console.error('Error creating list:', e)
  }
}

// Annuler la création d'une liste
const cancelNewList = () => {
  newListTitle.value = ''
  showNewListForm.value = false
}

// Afficher le menu d'une liste
const showListMenu = (listId, event) => {
  // Empêcher la propagation pour ne pas déclencher l'event listener du document immédiatement
  event.stopPropagation()

  // Fermer le menu s'il est déjà ouvert pour cette liste
  if (showListMenuPopup.value && selectedListId.value === listId) {
    showListMenuPopup.value = false
    return
  }

  // Stocker l'ID de la liste sélectionnée
  selectedListId.value = listId

  // Calculer la position du menu
  const button = event.target
  const rect = button.getBoundingClientRect()

  listMenuPosition.value = {
    top: `${rect.bottom}px`,
    left: `${rect.left}px`,
  }

  // Afficher le menu
  showListMenuPopup.value = true
}

// Éditer le titre d'une liste
const editListTitle = () => {
  // Trouver la liste à éditer
  const list = boardsStore.lists.find((l) => l.id === selectedListId.value)
  if (!list) return

  // Initialiser l'édition
  editingListId.value = selectedListId.value
  editedTitle.value = list.title
  isEditing.value = true

  // Fermer le menu
  showListMenuPopup.value = false

  // Focus sur l'input
  nextTick(() => {
    const input = document.querySelector('.list-title-input')
    if (input) input.focus()
  })
}

// Enregistrer le nouveau titre
const saveListTitle = async () => {
  if (!editedTitle.value.trim()) {
    cancelEditingList()
    return
  }

  try {
    await boardsStore.updateList(editingListId.value, {
      title: editedTitle.value.trim(),
    })

    // Fin de l'édition
    isEditing.value = false
    editingListId.value = null
  } catch (e) {
    error.value = 'Erreur lors de la modification du titre'
    console.error('Error updating list title:', e)
  }
}

// Annuler l'édition du titre
const cancelEditingList = () => {
  isEditing.value = false
  editingListId.value = null
}

// Demander confirmation pour la suppression
const confirmDeleteList = () => {
  showListMenuPopup.value = false
  showDeleteConfirmation.value = true
}

// Supprimer la liste
const deleteList = async () => {
  if (!selectedListId.value) return

  try {
    isDeleting.value = true
    await boardsStore.deleteList(selectedListId.value)
    showDeleteConfirmation.value = false
  } catch (e) {
    error.value = 'Erreur lors de la suppression de la liste'
    console.error('Error deleting list:', e)
  } finally {
    isDeleting.value = false
  }
}

// Afficher le formulaire d'ajout de carte
const showAddCardForm = (listId) => {
  activeListId.value = listId
  showCardForm.value = true

  newCard.value = {
    title: '',
    description: '',
    labels: {},
    dueDate: '',
  }

  // Focus sur le champ de titre
  nextTick(() => {
    if (document.getElementById('cardTitle')) {
      document.getElementById('cardTitle').focus()
    }
  })
}

// Fermer le formulaire d'ajout de carte
const closeCardForm = () => {
  showCardForm.value = false
  activeListId.value = null
}

// Basculer une étiquette
const toggleLabel = (labelKey) => {
  if (!newCard.value.labels) {
    newCard.value.labels = {}
  }

  if (newCard.value.labels[labelKey]) {
    // Supprimer l'étiquette
    let updatedLabels = { ...newCard.value.labels }
    delete updatedLabels[labelKey]
    newCard.value.labels = updatedLabels
  } else {
    // Ajouter l'étiquette
    newCard.value.labels = {
      ...newCard.value.labels,
      [labelKey]: true,
    }
  }
}

// Créer une nouvelle carte
const createNewCard = async () => {
  if (!newCard.value.title.trim() || !activeListId.value) return

  try {
    // Convertir la date en timestamp si elle existe
    let dueDate = null
    if (newCard.value.dueDate) {
      dueDate = new Date(newCard.value.dueDate).getTime()
    }

    await boardsStore.createCard(activeListId.value, {
      title: newCard.value.title.trim(),
      description: newCard.value.description.trim(),
      labels: newCard.value.labels,
      dueDate,
    })

    // Fermer le formulaire
    closeCardForm()
  } catch (e) {
    error.value = 'Erreur lors de la création de la carte'
    console.error('Error creating card:', e)
  }
}

// Ouvrir les détails d'une carte
const openCardDetails = (card) => {
  selectedCard.value = { ...card }
}

// Fermer les détails d'une carte
const closeCardDetails = () => {
  selectedCard.value = null
}

// Supprimer la carte sélectionnée
const deleteSelectedCard = async () => {
  if (!selectedCard.value) return

  if (confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
    try {
      await boardsStore.deleteCard(selectedCard.value.id)
      closeCardDetails()
    } catch (e) {
      error.value = 'Erreur lors de la suppression de la carte'
      console.error('Error deleting card:', e)
    }
  }
}
</script>

<style scoped>
.board-view {
  min-height: calc(100vh - 60px); /* Hauteur moins la navbar */
  width: 100%;
  overflow-x: auto;
}

.board-header {
  padding: 1rem 1.5rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;
}

.board-title {
  font-size: 1.5rem;
  margin: 0;
}

.board-description {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.board-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.board-content {
  padding: 1rem;
  overflow-x: auto;
}

.lists-container {
  display: flex;
  gap: 1rem;
  min-height: calc(100vh - 130px);
  align-items: flex-start;
}

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

.list-title-container {
  flex-grow: 1;
  overflow: hidden;
}

.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-title-input {
  width: 100%;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border: 2px solid #0079bf;
  border-radius: 3px;
  margin: -0.25rem 0;
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

/* Menu contextuel des listes */
.list-menu {
  position: absolute;
  z-index: 100;
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  min-width: 180px;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.75rem;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: #172b4d;
}

.menu-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-item.danger {
  color: #eb5a46;
}

.menu-item.danger:hover {
  background-color: #ffedeb;
}

.menu-icon {
  margin-right: 0.5rem;
}

.warning-text {
  color: #eb5a46;
  font-weight: 500;
  margin-bottom: 1rem;
}

.cards-container {
  padding: 0 0.5rem 0.5rem;
  overflow-y: auto;
  flex-grow: 1;
}

.card {
  background-color: white;
  border-radius: 3px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
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
  font-size: 0;
  overflow: hidden;
}

.labels-display .card-label {
  height: auto;
  width: auto;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  color: white;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
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

.add-list {
  background-color: #ebecf0;
  border-radius: 3px;
  width: 272px;
  min-width: 272px;
  padding: 0.75rem;
}

.add-list-btn {
  background: none;
  border: none;
  color: #5e6c84;
  width: 100%;
  padding: 0.75rem;
  text-align: left;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9rem;
}

.add-list-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #172b4d;
}

.new-list-form input {
  width: 100%;
  padding: 0.6rem 0.75rem;
  font-size: 0.9rem;
  border: 2px solid #0079bf;
  border-radius: 3px;
  margin-bottom: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.add-btn {
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #026aa7;
}

.add-btn:disabled {
  background-color: #a5c7d8;
  cursor: not-allowed;
}

.cancel-btn {
  background: none;
  border: none;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  color: #6b778c;
}

.cancel-btn:hover {
  color: #172b4d;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
}

.modal-content {
  background-color: white;
  border-radius: 3px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-content h2 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: #172b4d;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #172b4d;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  font-size: 0.9rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #0079bf;
  box-shadow: 0 0 0 1px #0079bf;
}

.labels-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.label-option {
  padding: 0.35rem 0.75rem;
  border-radius: 3px;
  color: white;
  cursor: pointer;
  transition: transform 0.1s;
  font-size: 0.85rem;
}

.label-option:hover {
  transform: scale(1.05);
}

.label-option.selected {
  box-shadow:
    0 0 0 2px white,
    0 0 0 4px #0079bf;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.create-btn {
  padding: 0.6rem 1rem;
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.create-btn:hover {
  background-color: #026aa7;
}

.create-btn:disabled {
  background-color: #a5c7d8;
  cursor: not-allowed;
}

/* Card details modal */
.card-details {
  max-width: 600px;
}

.card-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b778c;
}

.close-btn:hover {
  color: #172b4d;
}

.card-detail-content {
  margin-bottom: 1.5rem;
}

.list-name {
  font-weight: 500;
  color: #5e6c84;
}

.description {
  white-space: pre-line;
  font-size: 0.95rem;
}

.no-description {
  color: #6b778c;
  font-style: italic;
}

.card-detail-actions {
  border-top: 1px solid #dfe1e6;
  padding-top: 1.5rem;
}

.delete-btn {
  background-color: #eb5a46;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.6rem 1rem;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #cf513d;
}

.delete-btn:disabled {
  background-color: #f3afa5;
  cursor: not-allowed;
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #5e6c84;
}

.loading-spinner {
  display: inline-block;
  width: 50px;
  height: 50px;
  border: 3px solid rgba(0, 121, 191, 0.2);
  border-radius: 50%;
  border-top-color: #0079bf;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Error */
.error-container {
  text-align: center;
  padding: 3rem;
  color: #5e6c84;
}

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 3px;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .board-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .board-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .modal-content {
    width: 95%;
    padding: 1rem;
  }
}
</style>
