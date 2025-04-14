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

      // Option 1: Utiliser une query sur les membres (recommandé)
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
  }
})
