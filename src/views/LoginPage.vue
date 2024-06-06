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
                <v-btn v-if="!loading" type="submit" color="primary" class="mt-3">Submit</v-btn>
                <v-progress-circular v-else color="primary" indeterminate></v-progress-circular>
              </div>

              <v-alert v-if="alert" :type="alert.type" class="mt-3">{{ alert.message }}</v-alert>
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
    loading: false,
    alert: null,
  }),
  methods: {
    setAlert(type, message) {
      this.alert = {
        type,
        message,
      };
    },

    delayedRedirectToAppsPage() {
      setTimeout(() => {
        this.$router.push('/apps');
      }, 500);
    },

    async login() {
      this.loading = true;

      try {
        await loginApi.login(this.username, this.password);

        this.setAlert('success', 'Login Successful!');
        this.delayedRedirectToAppsPage();
      } catch (err) {
        this.loading = false;
        this.setAlert('error', err.message);
      }
    },
  },
}
</script>

<style scoped>

</style>