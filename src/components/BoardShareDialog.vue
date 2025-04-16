<template>
    <div class="share-dialog">
      <h3>Partager le tableau</h3>
      
      <div class="invite-form">
        <input
          type="email"
          v-model="email"
          placeholder="Entrez l'email de l'utilisateur"
          :disabled="loading"
        />
        <button
          @click="inviteUser"
          :disabled="!email || loading"
        >
          {{ loading ? 'Invitation...' : 'Inviter' }}
        </button>
      </div>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useBoardsStore } from '@/stores/boards'
  
  const props = defineProps({
    boardId: {
      type: String,
      required: true
    }
  })
  
  const email = ref('')
  const error = ref('')
  const loading = ref(false)
  const boardsStore = useBoardsStore()
  
  const inviteUser = async () => {
    try {
      loading.value = true
      error.value = ''
      await boardsStore.inviteUserToBoard(props.boardId, email.value)
      email.value = ''
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .share-dialog {
    padding: 1rem;
  }
  
  .invite-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .invite-form input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #dfe1e6;
    border-radius: 3px;
  }
  
  .invite-form button {
    padding: 0.5rem 1rem;
    background-color: #0079bf;
    color: white;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .invite-form button:disabled {
    background-color: #a5c7d8;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #eb5a46;
    margin-top: 0.5rem;
  }
  </style>