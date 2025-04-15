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
          <div v-if="result.type === 'board'" class="result-content" @click="navigateToBoard(result.id)">
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-description">{{ result.description || 'Pas de description' }}</p>
          </div>
  
          <!-- Affichage de la carte -->
          <div v-if="result.type === 'card'" class="result-content" @click="navigateToCard(result.boardId, result.id)">
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-description">Carte dans le tableau {{ result.boardId }}</p>
          </div>
  
          <!-- Affichage de la tâche -->
          <div v-if="result.type === 'task'" class="result-content">
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-description">Tâche dans la carte {{ result.cardId }} du tableau {{ result.boardId }}</p>
          </div>
        </div>
      </div>
  
      <div v-else>
        <p>Aucun résultat trouvé</p>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { searchItems } from '../stores/boards';  // Importer la fonction de recherche
  
  export default {
    setup() {
      const route = useRoute();
      const router = useRouter();
      const searchQuery = ref(route.query.q || '');
      const results = ref([]);
      const error = ref(null);
  
      // Appeler la fonction de recherche lors du montage du composant
      onMounted(async () => {
        try {
          if (searchQuery.value) {
            results.value = await searchItems(searchQuery.value);
          }
        } catch (e) {
          error.value = 'Une erreur est survenue lors de la recherche. Veuillez réessayer.';
          console.error('Erreur lors de la recherche:', e);
        }
      });
  
      // Surveiller les changements de la query pour mettre à jour les résultats
      watch(
        () => route.query.q,
        async (newQuery) => {
          searchQuery.value = newQuery;
          if (newQuery) {
            results.value = await searchItems(newQuery);
          }
        }
      );
  
      // Fonction de navigation vers le tableau
      const navigateToBoard = (boardId) => {
        router.push(`/boards/${boardId}`);
      };
  
      // Fonction de navigation vers la carte
      const navigateToCard = (boardId, cardId) => {
        router.push(`/boards/${boardId}/cards/${cardId}`);
      };
  
      // Obtenir la couleur de fond du tableau (si elle existe)
      const getBoardBackgroundColor = (result) => {
        return result.type === 'board' && result.backgroundColor ? result.backgroundColor : '#0079BF';
      };
  
      return { searchQuery, results, error, navigateToBoard, navigateToCard, getBoardBackgroundColor };
    },
  };
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
    transition: transform 0.2s, box-shadow 0.2s;
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
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  .result-description:hover {
    color: #e1e1e1;
  }
  </style>
  