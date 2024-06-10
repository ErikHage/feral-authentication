<template>
  <v-container>

    <v-row class="justify-center">
      <v-col cols="12" sm="8" md="4">
        <div class="text-center mb-4">
          <v-img
              src="/src/assets/ai-rooster.jpg"
              alt="Logo"
              contain
              max-width="250"
              class="mx-auto"
          ></v-img>
        </div>

        <v-card>
          <v-card-title>
            <span class="headline">Login</span>
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                  v-model="username"
                  label="Username"
                  type="text"
                  required
              ></v-text-field>

              <v-text-field
                  v-model="password"
                  label="Password"
                  type="password"
                  required
              ></v-text-field>

              <div class="text-center">
                <v-btn v-if="showLoginButton" type="submit" color="primary" class="mt-3">Submit</v-btn>
                <v-progress-circular v-else color="primary" indeterminate></v-progress-circular>
              </div>

              <v-alert v-if="error()" type="error" class="mt-3">{{ errorMessage() }}</v-alert>
              <v-alert v-if="showSuccessMessage" type="success" class="mt-3">Login Success!</v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { useAuthenticationStore } from '@/store';
import { mapActions, mapState } from "pinia";

export default {
  name: 'LoginPage',

  data: () => ({
    username: '',
    password: '',
  }),
  computed: {
    showSuccessMessage() {
      return this.isAuthenticated();
    },
    showLoginButton() {
      return !this.loading() && !this.showSuccessMessage
    }
  },
  methods: {
    ...mapActions(useAuthenticationStore, {
        authenticate: 'authenticate',
    }),

    ...mapState(useAuthenticationStore, {
        error: (state) => state.error,
        errorMessage: (state) => state.errorMessage,
        isAuthenticated: (state) => state.isAuthenticated,
        loading: (state) => state.loading,
    }),

    delayedRedirectToDashboard() {
      setTimeout(() => {
        this.$router.push('/dashboard');
      }, 750);
    },

    async login() {
      await this.authenticate(this.username, this.password);

      if (this.isAuthenticated()) {
        this.delayedRedirectToDashboard();
      }
    },
  },

  mounted() {
    if (this.isAuthenticated()) {
      this.delayedRedirectToDashboard();
    }
  }
}
</script>

<style scoped>

</style>