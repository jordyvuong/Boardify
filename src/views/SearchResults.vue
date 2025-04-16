<template>
  <div class="search-results-container">
    <h2>Résultats de recherche pour "{{ searchQuery }}"</h2>

    <div v-if="results.length > 0" class="results-grid">
      <!-- Affichage des résultats sous forme de cartes -->
      <div
        v-for="result in results"
        :key="result.id"
        class="result-card"
        :style="{ backgroundColor: getBoardBackgroundColor(result) }"
      >
        <!-- Affichage du tableau -->
        <div
          v-if="result.type === 'board'"
          class="result-content"
          @click="navigateToBoard(result.id)"
        >
          <h3 class="result-title">{{ result.title }}</h3>
          <p class="result-description">{{ result.description || 'Pas de description' }}</p>
        </div>

        <!-- Affichage de la list -->
        <div
          v-if="result.type === 'list'"
          class="result-content"
          @click="navigateToList(result.boardId, result.id)"
        >
          <h3 class="result-title">{{ result.title }}</h3>
        </div>

        <!-- Affichage de la car -->
        <div v-if="result.type === 'card'" 
        class="result-content"
        @click="navigateToList(result.boardId, result.id)">
          <h3 class="result-title">{{ result.title }}</h3>
          <p class="result-description">{{ result.description || 'Pas de description' }}</p> <!-- Afficher la description -->
        </div>
      </div>
    </div>

    <div v-else>
      <p>Aucun résultat trouvé</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchItems } from '../stores/boards' // Importer la fonction de recherche

export default {
  setup() {
    const route = useRoute()
    const router = useRouter()
    const searchQuery = ref(route.query.q || '')
    const results = ref([])
    const error = ref(null)

    // Appeler la fonction de recherche lors du montage du composant
    onMounted(async () => {
      try {
        if (searchQuery.value) {
          results.value = await searchItems(searchQuery.value)
        }
      } catch (e) {
        error.value = 'Une erreur est survenue lors de la recherche. Veuillez réessayer.'
        console.error('Erreur lors de la recherche:', e)
      }
    })

    // Surveiller les changements de la query pour mettre à jour les résultats
    watch(
      () => route.query.q,
      async (newQuery) => {
        searchQuery.value = newQuery
        if (newQuery) {
          results.value = await searchItems(newQuery)
        }
      },
    )

    // Fonction de navigation vers le tableau
    const navigateToBoard = (boardId) => {
      router.push(`/boards/${boardId}`)
    }

    // Fonction de navigation vers la carte
    const navigateToList = (boardId, cardId) => {
      console.log(`Navigating to board: ${boardId}, card: ${cardId}`) // Log pour déboguer
      if (!boardId) {
        console.error('boardId is undefined!')
        return // Ne pas naviguer si boardId est undefined
      }
      router.push(`/boards/${boardId}`)
    }

    // Obtenir la couleur de fond du tableau (si elle existe)
    const getBoardBackgroundColor = (result) => {
  if (result.type === 'board') {
    return result.backgroundColor || '#0079BF';
  } else if (result.type === 'list' || result.type === 'card') {
    // Utiliser d'abord la couleur propre de l'élément si elle existe
    // Sinon, utiliser la couleur du tableau parent 
    // Si aucune des deux n'est disponible, utiliser la couleur par défaut
    return result.backgroundColor || result.boardBackgroundColor || '#0079BF';
  }
  return '#0079BF'; // Couleur par défaut
}

    return { searchQuery, results, error, navigateToBoard, navigateToList, getBoardBackgroundColor }
  },
}
</script>

<style scoped>
.search-results-container {
  padding: 2rem;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.result-card {
  background-color: #0079bf;
  border-radius: 3px;
  color: white;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  position: relative;
}

.result-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.result-content {
  height: 100%;
}

.result-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.result-description {
  font-size: 0.85rem;
  opacity: 0.8;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
}

.result-description:hover {
  color: #e1e1e1;
}
</style>
