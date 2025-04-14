<template>
  <div class="boards-container">
    <div class="boards-header">
      <h1>Mes tableaux</h1>
      <button class="create-board-btn" @click="showCreateBoardModal = true">
        Créer un tableau
      </button>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement des tableaux...</p>
    </div>

    <div v-else-if="boardsStore.boards.length === 0" class="empty-boards">
      <div class="empty-icon">📋</div>
      <h2>Aucun tableau</h2>
      <p>Vous n'avez pas encore créé de tableau. Commencez par en créer un !</p>
      <button class="create-board-btn" @click="showCreateBoardModal = true">
        Créer mon premier tableau
      </button>
    </div>

    <div v-else class="boards-grid">
      <div
        v-for="board in boardsStore.boards"
        :key="board.id"
        class="board-card"
        :style="{ backgroundColor: board.backgroundColor || '#0079BF' }"
      >
        <!-- Bouton menu pour chaque tableau -->
        <button class="board-menu-btn" @click.stop="openBoardMenu(board, $event)">⋮</button>

        <!-- Contenu du tableau -->
        <div class="board-content" @click="navigateToBoard(board.id)">
          <h2 class="board-title">{{ board.title }}</h2>
          <p class="board-description">{{ board.description }}</p>
          <div class="board-footer">
            <span class="created-at">Créé le {{ formatDate(board.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="board-card create-board-card" @click="showCreateBoardModal = true">
        <div class="create-board-content">
          <span class="plus-icon">+</span>
          <span>Créer un nouveau tableau</span>
        </div>
      </div>
    </div>

    <!-- Modal de création de tableau -->
    <div
      v-if="showCreateBoardModal"
      class="modal-overlay"
      @click.self="showCreateBoardModal = false"
    >
      <div class="modal-content">
        <h2>Créer un nouveau tableau</h2>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <form @submit.prevent="createBoard">
          <div class="form-group">
            <label for="boardTitle">Titre</label>
            <input
              type="text"
              id="boardTitle"
              v-model="newBoard.title"
              required
              placeholder="Titre du tableau"
            />
          </div>

          <div class="form-group">
            <label for="boardDescription">Description (optionnel)</label>
            <textarea
              id="boardDescription"
              v-model="newBoard.description"
              placeholder="Description du tableau"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Couleur</label>
            <div class="color-picker">
              <div
                v-for="color in backgroundColors"
                :key="color"
                class="color-option"
                :style="{ backgroundColor: color }"
                :class="{ selected: newBoard.backgroundColor === color }"
                @click="newBoard.backgroundColor = color"
              ></div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showCreateBoardModal = false">
              Annuler
            </button>
            <button type="submit" class="create-btn" :disabled="isCreating || !newBoard.title">
              {{ isCreating ? 'Création...' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de modification de tableau -->
    <div v-if="showEditBoardModal" class="modal-overlay" @click.self="showEditBoardModal = false">
      <div class="modal-content">
        <h2>Modifier le tableau</h2>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <form @submit.prevent="updateBoardDetails">
          <div class="form-group">
            <label for="editBoardTitle">Titre</label>
            <input
              type="text"
              id="editBoardTitle"
              v-model="editBoardData.title"
              required
              placeholder="Titre du tableau"
            />
          </div>

          <div class="form-group">
            <label for="editBoardDescription">Description (optionnel)</label>
            <textarea
              id="editBoardDescription"
              v-model="editBoardData.description"
              placeholder="Description du tableau"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label>Couleur</label>
            <div class="color-picker">
              <div
                v-for="color in backgroundColors"
                :key="color"
                class="color-option"
                :style="{ backgroundColor: color }"
                :class="{ selected: editBoardData.backgroundColor === color }"
                @click="editBoardData.backgroundColor = color"
              ></div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="cancel-btn" @click="showEditBoardModal = false">
              Annuler
            </button>
            <button type="submit" class="create-btn" :disabled="isUpdating || !editBoardData.title">
              {{ isUpdating ? 'Mise à jour...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de confirmation de suppression -->
    <div
      v-if="showDeleteBoardModal"
      class="modal-overlay"
      @click.self="showDeleteBoardModal = false"
    >
      <div class="modal-content">
        <h2>Supprimer le tableau</h2>
        <p>Êtes-vous sûr de vouloir supprimer le tableau "{{ boardToDelete?.title }}" ?</p>
        <p class="warning-text">
          Cette action est irréversible et supprimera toutes les listes et cartes associées.
        </p>

        <div class="modal-actions">
          <button class="cancel-btn" @click="showDeleteBoardModal = false">Annuler</button>
          <button class="delete-btn" @click="confirmDeleteBoard" :disabled="deletingBoard">
            {{ deletingBoard ? 'Suppression...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Menu contextuel pour les tableaux -->
    <div
      v-if="boardMenuPosition.visible"
      class="board-context-menu"
      :style="boardMenuPosition.style"
    >
      <button @click="openEditBoardModal(selectedBoard)" class="menu-item">
        <span class="menu-icon">✏️</span> Modifier
      </button>
      <button @click="promptDeleteBoard(selectedBoard)" class="menu-item danger">
        <span class="menu-icon">🗑️</span> Supprimer
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBoardsStore } from '@/stores/boards'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const boardsStore = useBoardsStore()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')
const showCreateBoardModal = ref(false)
const isCreating = ref(false)

// Refs pour la gestion de la suppression
const showDeleteBoardModal = ref(false)
const boardToDelete = ref(null)
const deletingBoard = ref(false)
const selectedBoard = ref(null)
const boardMenuPosition = ref({ visible: false, style: {} })

// Refs pour l'édition du tableau
const showEditBoardModal = ref(false)
const editBoardData = ref({
  id: null,
  title: '',
  description: '',
  backgroundColor: '',
})
const isUpdating = ref(false)

// Couleurs de fond prédéfinies pour les tableaux
const backgroundColors = [
  '#0079BF', // Bleu
  '#D29034', // Orange
  '#519839', // Vert
  '#B04632', // Rouge
  '#89609E', // Violet
  '#CD5A91', // Rose
  '#4BBF6B', // Vert clair
  '#00AECC', // Bleu clair
  '#838C91', // Gris
]

// Données pour un nouveau tableau
const newBoard = ref({
  title: '',
  description: '',
  backgroundColor: backgroundColors[0], // Couleur par défaut
})

// Fonction pour charger les tableaux si l'utilisateur est authentifié
const loadBoardsIfAuthenticated = async () => {
  try {
    if (authStore.user) {
      await boardsStore.loadBoards()
    } else {
      router.push('/login')
      return
    }
  } catch (e) {
    error.value = 'Erreur lors du chargement des tableaux'
    console.error('Error loading boards:', e)
  } finally {
    loading.value = false
  }
}

// Fermer le menu contextuel en cliquant ailleurs
onMounted(() => {
  document.addEventListener('click', closeMenus)

  // Attendre que authStore.authReady soit true avant de continuer
  if (authStore.authReady) {
    loadBoardsIfAuthenticated()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenus)
})

// Surveiller les changements de l'état d'authentification
watch(
  () => authStore.authReady,
  (isReady) => {
    if (isReady) {
      loadBoardsIfAuthenticated()
    }
  },
)

const formatDate = (timestamp) => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

// Fonction pour fermer tous les menus
const closeMenus = () => {
  boardMenuPosition.value.visible = false
}

// Ouvrir le menu du tableau
const openBoardMenu = (board, event) => {
  event.stopPropagation()
  selectedBoard.value = board

  // Positionner le menu près du bouton
  const rect = event.target.getBoundingClientRect()
  boardMenuPosition.value = {
    visible: true,
    style: {
      top: `${rect.bottom + window.scrollY}px`,
      left: `${rect.left + window.scrollX}px`,
    },
  }
}

// Naviguer vers un tableau
const navigateToBoard = (boardId) => {
  router.push(`/boards/${boardId}`)
}

// Créer un nouveau tableau
const createBoard = async () => {
  if (!newBoard.value.title.trim()) {
    error.value = 'Le titre du tableau est requis'
    return
  }

  try {
    isCreating.value = true
    error.value = ''

    const boardData = {
      title: newBoard.value.title.trim(),
      description: newBoard.value.description.trim(),
      backgroundColor: newBoard.value.backgroundColor,
    }

    const boardId = await boardsStore.createBoard(boardData)

    // Réinitialiser le formulaire
    newBoard.value = {
      title: '',
      description: '',
      backgroundColor: backgroundColors[0],
    }

    showCreateBoardModal.value = false

    // Rediriger vers le nouveau tableau
    router.push(`/boards/${boardId}`)
  } catch (e) {
    error.value = 'Erreur lors de la création du tableau'
    console.error('Error creating board:', e)
  } finally {
    isCreating.value = false
  }
}

// Fonction pour demander la suppression d'un tableau
const promptDeleteBoard = (board) => {
  boardToDelete.value = board
  showDeleteBoardModal.value = true
  boardMenuPosition.value.visible = false
}

// Fonction pour confirmer la suppression
const confirmDeleteBoard = async () => {
  if (!boardToDelete.value) return

  try {
    deletingBoard.value = true
    await boardsStore.deleteBoard(boardToDelete.value.id)
    showDeleteBoardModal.value = false
  } catch (e) {
    error.value = 'Erreur lors de la suppression du tableau'
    console.error('Error deleting board:', e)
  } finally {
    deletingBoard.value = false
  }
}

// Fonction pour ouvrir le modal d'édition de tableau
const openEditBoardModal = (board) => {
  boardMenuPosition.value.visible = false

  // Copier les propriétés du tableau dans le formulaire d'édition
  editBoardData.value = {
    id: board.id,
    title: board.title || '',
    description: board.description || '',
    backgroundColor: board.backgroundColor || backgroundColors[0],
  }

  showEditBoardModal.value = true
}

// Fonction pour mettre à jour les détails d'un tableau
const updateBoardDetails = async () => {
  if (!editBoardData.value.title.trim()) {
    error.value = 'Le titre du tableau est requis'
    return
  }

  try {
    isUpdating.value = true
    error.value = ''

    const boardData = {
      title: editBoardData.value.title.trim(),
      description: editBoardData.value.description.trim(),
      backgroundColor: editBoardData.value.backgroundColor,
    }

    await boardsStore.updateBoard(editBoardData.value.id, boardData)
    showEditBoardModal.value = false
  } catch (e) {
    error.value = 'Erreur lors de la modification du tableau'
    console.error('Error updating board:', e)
  } finally {
    isUpdating.value = false
  }
}
</script>

<style scoped>
.boards-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.boards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.boards-header h1 {
  color: #172b4d;
  font-size: 1.8rem;
}

.create-board-btn {
  background-color: #0079bf;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.create-board-btn:hover {
  background-color: #026aa7;
}

/* Grille de tableaux */
.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.board-card {
  background-color: #0079bf;
  border-radius: 3px;
  color: white;
  padding: 1rem;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.board-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Nouveau style pour le menu du tableau */
.board-menu-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 3px;
  width: 28px;
  height: 28px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  padding: 0;
  opacity: 0.7;
}

.board-menu-btn:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.3);
}

.board-content {
  height: 100%;
  width: 100%;
}

.board-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  word-break: break-word;
}

.board-description {
  font-size: 0.85rem;
  opacity: 0.9;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.board-footer {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: auto;
}

.create-board-card {
  background-color: #f0f2f5;
  color: #172b4d;
  border: 2px dashed #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.create-board-card:hover {
  background-color: #e4e6ea;
}

.create-board-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plus-icon {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

/* Menu contextuel */
.board-context-menu {
  position: absolute;
  background: white;
  border-radius: 3px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  background: none;
  border: none;
  cursor: pointer;
}

.menu-item:hover {
  background-color: #f4f5f7;
}

.menu-item.danger {
  color: #c62828;
}

.menu-item.danger:hover {
  background-color: #ffebee;
}

.menu-icon {
  margin-right: 8px;
}

/* États de chargement et vide */
.loading-container {
  text-align: center;
  padding: 3rem 0;
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

.empty-boards {
  text-align: center;
  padding: 3rem 0;
  color: #5e6c84;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Modal */
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
  max-width: 450px;
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

.color-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.color-option {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.1s;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option.selected {
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

.cancel-btn {
  padding: 0.6rem 1rem;
  background-color: transparent;
  border: 1px solid #dfe1e6;
  border-radius: 3px;
  color: #172b4d;
  cursor: pointer;
}

.cancel-btn:hover {
  background-color: #f4f5f7;
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

.error-message {
  background-color: #ffebee;
  color: #c62828;
  padding: 0.75rem;
  border-radius: 3px;
  margin-bottom: 1rem;
}

.warning-text {
  color: #c62828;
  font-weight: 500;
  margin-bottom: 1rem;
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

@media (max-width: 768px) {
  .boards-container {
    padding: 1rem;
  }

  .boards-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .boards-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
