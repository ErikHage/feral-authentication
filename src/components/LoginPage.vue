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

              <v-btn type="submit" color="primary" class="mt-3">Submit</v-btn>

              <v-alert v-if="error" type="error" class="mt-3">{{ error }}</v-alert>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import loginApi from '../js/login-api';

export default {
  name: 'LoginPage',

  data: () => ({
    username: '',
    password: '',
    error: '',
  }),
  methods: {
    async login() {
      try {
        await loginApi.login(this.username, this.password);
        this.$router.push('/apps');
      } catch (err) {
        this.error = err.message;
      }
    },
  },
}
</script>

<style scoped>

</style>