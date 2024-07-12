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

              <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>

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
import FadeOutAlert from "@/components/FadeOutAlert.vue";

export default {
  name: 'LoginPage',

  components: { FadeOutAlert },

  data: () => ({
    username: '',
    password: '',
    ssoAppId: null,
  }),

  computed: {
    ...mapState(useAuthenticationStore, [
        'isAuthenticated', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),
  },

  methods: {
    ...mapActions(useAuthenticationStore, [
        'tokenPresent',
        'verifyToken',
        'authenticate',
        'loginToApplication',
    ]),

    delayedRedirectToDashboard() {
      setTimeout(() => {
        this.$router.push('/dashboard/applications');
      }, 500);
    },

    async login() {
      await this.authenticate(this.username, this.password);

      if (this.isAuthenticated) {
        if (this.ssoAppId) {
          await this.loginToApplication(this.ssoAppId, false);
        } else {
          this.delayedRedirectToDashboard();
        }
      }
    },

    showLoginButton() {
      return !this.loading && !this.isAuthenticated
    },

    maybeGetApplicationIdQueryParam() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('app');
    },
  },

  async mounted() {
    this.ssoAppId = this.maybeGetApplicationIdQueryParam();

    if (this.tokenPresent()) {
      try {
        await this.verifyToken();
        if (!this.isAuthenticated) {
          this.clearToken();
        }
      } catch (err) {
        this.clearToken();
      }
    }

    if (this.isAuthenticated) {
      if (this.ssoAppId) {
        await this.loginToApplication(this.ssoAppId, false);
      } else {
        this.delayedRedirectToDashboard();
      }
    }
  }
}
</script>

<style scoped>

</style>