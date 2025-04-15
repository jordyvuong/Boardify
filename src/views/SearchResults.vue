<template>
    <div>
      <h2>Résultats de recherche pour "{{ searchQuery }}"</h2>
      <!-- Affichage des résultats filtrés -->
      <div v-if="filteredBoards.length">
        <div v-for="board in filteredBoards" :key="board.id">
          <p>{{ board.title }}</p>
        </div>
      </div>
      <div v-else>
        <p>Aucun résultat trouvé</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        // Récupérer le texte de recherche depuis l'URL
        searchQuery: this.$route.query.q,
        // Liste fictive des tableaux (tu récupéreras probablement cela depuis une API)
        boards: [
          { id: 1, title: 'Tableau 1' },
          { id: 2, title: 'Tableau 2' },
          { id: 3, title: 'Tableau 3' },
        ],
      };
    },
    computed: {
      // Filtrer les tableaux selon la recherche
      filteredBoards() {
        return this.boards.filter(board =>
          board.title.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      },
    },
  };
  </script>
  