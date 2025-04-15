import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getDatabase,
  ref as dbRef,
  push,
  set,
  get,
  remove,
  update,
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'
import { useAuthStore } from './auth'


export const useBoardsStore = defineStore('boards', () => {
  const boards = ref([])
  const currentBoard = ref(null)
  const lists = ref([])
  const cards = ref([])
  const loading = ref(false)
  const error = ref(null)

  const authStore = useAuthStore()
  const db = getDatabase()

  // Charger les tableaux de l'utilisateur
  const loadBoards = async () => {
    if (!authStore.user) return

    try {
      loading.value = true
      error.value = null
      console.log('Loading boards for user:', authStore.user.uid)

      const boardsRef = dbRef(db, 'boards')
      const snapshot = await get(boardsRef)
      const boardsList = []

      snapshot.forEach((childSnapshot) => {
        const boardData = childSnapshot.val()
        // Vérifier si l'utilisateur actuel est membre ou propriétaire du tableau
        if (
          (boardData.members && boardData.members[authStore.user.uid]) ||
          boardData.ownerId === authStore.user.uid
        ) {
          boardsList.push({
            id: childSnapshot.key,
            ...boardData,
          })
        }
      })

      // Trier par date de création (le plus récent en premier)
      boardsList.sort((a, b) => b.createdAt - a.createdAt)

      boards.value = boardsList
      console.log('Loaded boards:', boards.value)
    } catch (e) {
      error.value = e.message
      console.error('Error loading boards:', e)
    } finally {
      loading.value = false
    }
  }

  // Créer un nouveau tableau
  const createBoard = async (boardData) => {
    if (!authStore.user) return

    try {
      loading.value = true
      error.value = null

      const userId = authStore.user.uid
      const boardsRef = dbRef(db, 'boards')
      const newBoardRef = push(boardsRef)

      await set(newBoardRef, {
        ...boardData,
        ownerId: userId,
        members: { [userId]: true },
        createdAt: Date.now(),
      })

      // Recharger les tableaux
      await loadBoards()

      return newBoardRef.key
    } catch (e) {
      error.value = e.message
      console.error('Error creating board:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Charger un tableau spécifique et ses listes/cartes
  const loadBoard = async (boardId) => {
    try {
      loading.value = true
      error.value = null

      // Charger le tableau
      const boardRef = dbRef(db, `boards/${boardId}`)
      const boardSnapshot = await get(boardRef)

      if (!boardSnapshot.exists()) {
        throw new Error('Tableau non trouvé')
      }

      currentBoard.value = {
        id: boardSnapshot.key,
        ...boardSnapshot.val(),
      }

      // Charger les listes
      const listsQuery = query(dbRef(db, 'lists'), orderByChild('boardId'), equalTo(boardId))

      const listsSnapshot = await get(listsQuery)
      const listItems = []

      listsSnapshot.forEach((childSnapshot) => {
        listItems.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        })
      })

      // Trier par position
      lists.value = listItems.sort((a, b) => a.position - b.position)

      // Charger les cartes
      const cardsQuery = query(dbRef(db, 'cards'), orderByChild('boardId'), equalTo(boardId))

      const cardsSnapshot = await get(cardsQuery)
      const cardItems = []

      cardsSnapshot.forEach((childSnapshot) => {
        cardItems.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        })
      })

      cards.value = cardItems
    } catch (e) {
      error.value = e.message
      console.error('Error loading board:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Créer une nouvelle liste
  const createList = async (listData) => {
    if (!authStore.user || !currentBoard.value) return

    try {
      loading.value = true
      error.value = null

      // Trouver la position la plus élevée pour placer la nouvelle liste à la fin
      const maxPosition =
        lists.value.length > 0 ? Math.max(...lists.value.map((list) => list.position)) : -1

      const listsRef = dbRef(db, 'lists')
      const newListRef = push(listsRef)

      const newList = {
        ...listData,
        boardId: currentBoard.value.id,
        position: maxPosition + 1,
        createdAt: Date.now(),
      }

      await set(newListRef, newList)

      // Ajouter à la liste locale
      lists.value.push({
        id: newListRef.key,
        ...newList,
      })

      return newListRef.key
    } catch (e) {
      error.value = e.message
      console.error('Error creating list:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Créer une nouvelle carte
  const createCard = async (listId, cardData) => {
    if (!authStore.user || !currentBoard.value) return

    try {
      loading.value = true
      error.value = null

      // Trouver la position la plus élevée dans cette liste
      const cardsInList = cards.value.filter((card) => card.listId === listId)
      const maxPosition =
        cardsInList.length > 0 ? Math.max(...cardsInList.map((card) => card.position)) : -1

      const cardsRef = dbRef(db, 'cards')
      const newCardRef = push(cardsRef)

      const newCard = {
        ...cardData,
        listId,
        boardId: currentBoard.value.id,
        position: maxPosition + 1,
        createdAt: Date.now(),
      }

      await set(newCardRef, newCard)

      // Ajouter à la liste locale
      cards.value.push({
        id: newCardRef.key,
        ...newCard,
      })

      return newCardRef.key
    } catch (e) {
      error.value = e.message
      console.error('Error creating card:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour une carte
  const updateCard = async (cardId, cardData) => {
    try {
      loading.value = true
      error.value = null

      const cardRef = dbRef(db, `cards/${cardId}`)
      await update(cardRef, cardData)

      // Mettre à jour la carte localement
      const cardIndex = cards.value.findIndex((c) => c.id === cardId)
      if (cardIndex !== -1) {
        cards.value[cardIndex] = {
          ...cards.value[cardIndex],
          ...cardData,
        }
      }
    } catch (e) {
      error.value = e.message
      console.error('Error updating card:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Déplacer une carte entre listes
  const moveCard = async (cardId, fromListId, toListId, newPosition) => {
    try {
      loading.value = true
      error.value = null

      // Mettre à jour la carte
      const cardRef = dbRef(db, `cards/${cardId}`)
      await update(cardRef, {
        listId: toListId,
        position: newPosition,
      })

      // Mettre à jour localement
      const cardIndex = cards.value.findIndex((c) => c.id === cardId)
      if (cardIndex !== -1) {
        cards.value[cardIndex].listId = toListId
        cards.value[cardIndex].position = newPosition
      }

      // Ajouter une activité
      if (fromListId !== toListId) {
        const fromList = lists.value.find((l) => l.id === fromListId)
        const toList = lists.value.find((l) => l.id === toListId)

        if (fromList && toList && authStore.user) {
          const activitiesRef = dbRef(db, 'activities')
          const newActivityRef = push(activitiesRef)

          await set(newActivityRef, {
            boardId: currentBoard.value.id,
            userId: authStore.user.uid,
            action: 'moved',
            entityType: 'card',
            entityId: cardId,
            fromListId,
            toListId,
            text: `a déplacé la carte "${cards.value[cardIndex].title}" de "${fromList.title}" vers "${toList.title}"`,
            createdAt: Date.now(),
          })
        }
      }
    } catch (e) {
      error.value = e.message
      console.error('Error moving card:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Supprimer une carte
  const deleteCard = async (cardId) => {
    try {
      loading.value = true
      error.value = null

      const cardRef = dbRef(db, `cards/${cardId}`)
      await remove(cardRef)

      // Supprimer localement
      cards.value = cards.value.filter((c) => c.id !== cardId)
    } catch (e) {
      error.value = e.message
      console.error('Error deleting card:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  // Supprimer un tableau
  const deleteBoard = async (boardId) => {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      // 1. Récupérer les listes de ce tableau pour les supprimer aussi
      const listsRef = dbRef(db, 'lists')
      const listsQuery = query(listsRef, orderByChild('boardId'), equalTo(boardId))
      const listsSnapshot = await get(listsQuery)

      // 2. Récupérer les cartes pour les supprimer
      const cardsRef = dbRef(db, 'cards')
      const cardsQuery = query(cardsRef, orderByChild('boardId'), equalTo(boardId))
      const cardsSnapshot = await get(cardsQuery)

      // Utiliser une transaction pour tout supprimer de manière atomique
      const updates = {}

      // Supprimer toutes les cartes de ce tableau
      if (cardsSnapshot.exists()) {
        cardsSnapshot.forEach((cardSnap) => {
          updates[`cards/${cardSnap.key}`] = null
        })
      }

      // Supprimer toutes les listes de ce tableau
      if (listsSnapshot.exists()) {
        listsSnapshot.forEach((listSnap) => {
          updates[`lists/${listSnap.key}`] = null
        })
      }

      // Supprimer la référence dans userBoards si elle existe
      if (authStore.user.uid) {
        updates[`userBoards/${authStore.user.uid}/${boardId}`] = null
      }

      // Supprimer le tableau lui-même
      updates[`boards/${boardId}`] = null

      // Effectuer toutes les suppressions en une seule opération
      await update(dbRef(db), updates)

      // Mettre à jour l'état local
      boards.value = boards.value.filter((board) => board.id !== boardId)

      return true
    } catch (e) {
      console.error('Error deleting board:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Supprimer une liste
  const deleteList = async (listId) => {
    if (!authStore.user || !currentBoard.value)
      throw new Error('User not authenticated or no board loaded')

    try {
      loading.value = true
      error.value = null

      // 1. Récupérer toutes les cartes de cette liste
      const cardsRef = dbRef(db, 'cards')
      const cardsQuery = query(cardsRef, orderByChild('listId'), equalTo(listId))
      const cardsSnapshot = await get(cardsQuery)

      // Utiliser une transaction pour tout supprimer de manière atomique
      const updates = {}

      // Supprimer toutes les cartes de cette liste
      if (cardsSnapshot.exists()) {
        cardsSnapshot.forEach((cardSnap) => {
          updates[`cards/${cardSnap.key}`] = null
        })
      }

      // Supprimer la liste elle-même
      updates[`lists/${listId}`] = null

      // Effectuer toutes les suppressions en une seule opération
      await update(dbRef(db), updates)

      // Mettre à jour l'état local
      lists.value = lists.value.filter((list) => list.id !== listId)
      cards.value = cards.value.filter((card) => card.listId !== listId)

      return true
    } catch (e) {
      console.error('Error deleting list:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour un tableau
  const updateBoard = async (boardId, boardData) => {
    if (!authStore.user) throw new Error('User not authenticated')

    try {
      loading.value = true
      error.value = null

      const boardRef = dbRef(db, `boards/${boardId}`)
      await update(boardRef, boardData)

      // Mettre à jour localement
      const boardIndex = boards.value.findIndex((b) => b.id === boardId)
      if (boardIndex !== -1) {
        boards.value[boardIndex] = {
          ...boards.value[boardIndex],
          ...boardData,
        }
      }

      // Si c'est le tableau actuellement affiché, mettre à jour currentBoard aussi
      if (currentBoard.value && currentBoard.value.id === boardId) {
        currentBoard.value = {
          ...currentBoard.value,
          ...boardData,
        }
      }

      return true
    } catch (e) {
      console.error('Error updating board:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  // Mettre à jour une liste
  const updateList = async (listId, listData) => {
    if (!authStore.user || !currentBoard.value)
      throw new Error('User not authenticated or no board loaded')

    try {
      loading.value = true
      error.value = null

      const listRef = dbRef(db, `lists/${listId}`)
      await update(listRef, listData)

      // Mettre à jour localement
      const listIndex = lists.value.findIndex((l) => l.id === listId)
      if (listIndex !== -1) {
        lists.value[listIndex] = {
          ...lists.value[listIndex],
          ...listData,
        }
      }

      return true
    } catch (e) {
      console.error('Error updating list:', e)
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    boards,
    currentBoard,
    lists,
    cards,
    loading,
    error,
    loadBoards,
    createBoard,
    loadBoard,
    createList,
    createCard,
    updateCard,
    moveCard,
    deleteCard,
    deleteBoard,
    deleteList,
    updateBoard,
    updateList,
  }
})

export const searchItems = async (searchQuery) => {
  const db = getDatabase();
  const boardsRef = dbRef(db, 'boards');
  const result = [];


  console.log('Recherche lancée avec query:', searchQuery);  // Afficher la query de recherche

  // Vérifie si la recherche est vide
  if (!searchQuery || searchQuery.trim().length === 0) {
    console.log('Aucune query fournie');
    return result;  // Retourner un tableau vide si la query est vide
  }

  
  try {
    // Requête pour récupérer les boards
    const boardQuery = query(boardsRef, orderByChild('title')); 
    console.log('Requête Firebase:', boardQuery);  // Afficher la requête Firebase
    // Récupérer les données des boards
    const snapshot = await get(boardQuery);
  

    if (!snapshot.exists()) {
      console.log('Aucun tableau trouvé dans Firebase');
    }

    // Si des boards sont trouvés, on les ajoute aux résultats
    snapshot.forEach(boardSnapshot => {
      const board = boardSnapshot.val();
        // Afficher les données du board

      const boardTitle = board.title ? board.title.toLowerCase() : '';
      const boardDescription = board.description || '';
      if (boardTitle.includes(searchQuery.toLowerCase())) {
        result.push({ type: 'board', title: board.title, description:boardDescription, id: boardSnapshot.key });
      }

      // Recherche dans les cartes du board
      if (board.cards) {
        Object.keys(board.cards).forEach(cardKey => {
          const card = board.cards[cardKey];
          const cardTitle = card.title ? card.title.toLowerCase() : '';
          console.log('Carte trouvée:', card);  // Afficher les cartes

          if (cardTitle.includes(searchQuery.toLowerCase())) {
            result.push({ type: 'card', title: card.title, id: cardKey, boardId: boardSnapshot.key });
          }

          // Recherche dans les tâches de la carte
          if (card.tasks) {
            Object.keys(card.tasks).forEach(taskKey => {
              const task = card.tasks[taskKey];
              const taskTitle = task.title ? task.title.toLowerCase() : '';
              console.log('Tâche trouvée:', task);  // Afficher les tâches

              if (taskTitle.includes(searchQuery.toLowerCase())) {
                result.push({ type: 'task', title: task.title, id: taskKey, cardId: cardKey, boardId: boardSnapshot.key });
              }
            });
          }
        });
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des boards:', error);
  }

  return result;
};
