<template>
  <div class="home-container">
    <section class="hero">
      <div class="hero-content">
        <h1>Boardify</h1>
        <h2>Organisez vos projets avec simplicité</h2>
        <p>
          Créez des tableaux, ajoutez des listes et des cartes, et gérez vos tâches efficacement.
        </p>
        <div class="hero-buttons">
          <router-link v-if="!authStore.user" to="/register" class="btn btn-primary"
            >S'inscrire gratuitement</router-link
          >
          <router-link v-if="!authStore.user" to="/login" class="btn btn-secondary"
            >Se connecter</router-link
          >
          <router-link v-if="authStore.user" to="/boards" class="btn btn-primary"
            >Mes tableaux</router-link
          >
        </div>
      </div>
      <div class="hero-image">
        <img src="@/assets/board-illustration.svg" alt="Illustration d'un tableau Trello" />
      </div>
    </section>

    <section class="features">
      <h2>Fonctionnalités</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">📋</div>
          <h3>Tableaux</h3>
          <p>Créez des tableaux pour organiser vos projets et vos idées.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📝</div>
          <h3>Listes</h3>
          <p>Organisez vos tâches en listes pour suivre leur progression.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔄</div>
          <h3>Glisser-déposer</h3>
          <p>Réorganisez vos tâches facilement par glisser-déposer.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>Recherche</h3>
          <p>Retrouvez rapidement n'importe quelle tâche grâce à la fonction de recherche.</p>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="cta-content">
        <h2>Prêt à commencer?</h2>
        <p>Inscrivez-vous gratuitement et commencez à organiser vos projets dès aujourd'hui.</p>
        <router-link v-if="!authStore.user" to="/register" class="btn btn-primary"
          >Créer un compte</router-link
        >
        <router-link v-if="authStore.user" to="/boards" class="btn btn-primary"
          >Accéder à mes tableaux</router-link
        >
      </div>
    </section>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 100%;
  padding-bottom: 2rem;
}

.hero {
  display: flex;
  padding: 2rem;
  min-height: 500px;
  background: linear-gradient(135deg, #0079bf, #5067c5);
  color: white;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

.hero-content {
  flex: 1;
  min-width: 300px;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 700;
}

.hero-content h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.hero-content p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  max-width: 600px;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  flex: 1;
  min-width: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.hero-image img {
  max-width: 100%;
  height: auto;
  max-height: 400px;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.2s,
    transform 0.1s;
}

.btn:active {
  transform: translateY(1px);
}

.btn-primary {
  background-color: #61bd4f;
  color: white;
}

.btn-primary:hover {
  background-color: #4faa3d;
}

.btn-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.features {
  padding: 4rem 2rem;
  text-align: center;
}

.features h2 {
  font-size: 2.2rem;
  margin-bottom: 3rem;
  color: #172b4d;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #0079bf;
}

.feature-card p {
  font-size: 1rem;
  color: #5e6c84;
  line-height: 1.5;
}

.cta {
  background-color: #f4f5f7;
  padding: 4rem 2rem;
  text-align: center;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
}

.cta h2 {
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: #172b4d;
}

.cta p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  color: #5e6c84;
}

@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
  }

  .hero-content {
    padding: 1rem;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content h2 {
    font-size: 1.8rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .features {
    padding: 3rem 1rem;
  }

  .features h2 {
    font-size: 2rem;
  }

  .cta {
    padding: 3rem 1rem;
  }

  .cta h2 {
    font-size: 2rem;
  }
}
</style>
