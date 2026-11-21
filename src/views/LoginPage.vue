<template>
  <fr-container>

    <fr-row class="justify-center">
      <fr-col cols="12" sm="8" md="4">
        <div class="text-center mb-4">
          <fr-image
              :src="getLogoPath()"
              alt="Logo"
              max-width="250"
              class="mx-auto"
          ></fr-image>
        </div>

        <fr-card title="Login">
          <div class="px-4 pb-4">
            <!-- FrForm stops the page submitting, and emits submit itself -->
            <fr-form @submit="login">
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
                <fr-btn v-if="showLoginButton" type="submit" color="primary" class="mt-3">Submit</fr-btn>
                <fr-spinner v-else color="primary"></fr-spinner>
              </div>

              <FadeOutAlert class="my-2" :is-visible="alertVisible" :alert-type="alertType" :message="alertMessage"/>

            </fr-form>
          </div>
        </fr-card>
      </fr-col>
    </fr-row>
  </fr-container>
</template>

<script>
import { useAuthenticationStore } from '@/store';
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrCol, FrContainer, FrForm, FrImage, FrRow, FrSpinner,
} from "@feral-auth/vue-components";
import FadeOutAlert from "@/components/FadeOutAlert.vue";
import { getAssetPath } from "@/utils/assets";

export default {
  name: 'LoginPage',

  components: {
    FadeOutAlert, FrBtn, FrCard, FrCol, FrContainer, FrForm, FrImage, FrRow, FrSpinner,
  },

  data: () => ({
    username: '',
    password: '',
    ssoAppId: null,
  }),

  computed: {
    ...mapState(useAuthenticationStore, [
        'isAuthenticated', 'loading', 'alertType', 'alertMessage', 'alertVisible',
    ]),

    // A spinner in its place while logging in, and once logged in
    showLoginButton() {
      return !this.loading && !this.isAuthenticated;
    },
  },

  methods: {
    ...mapActions(useAuthenticationStore, [
        'restoreSession',
        'authenticate',
        'loginToApplication',
    ]),

    // To the page the guard sent them from, if it's one of ours
    delayedRedirect() {
      const redirect = this.$route.query.redirect;
      const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/dashboard/applications';

      setTimeout(() => {
        this.$router.push(destination);
      }, 500);
    },

    getLogoPath() {
      return getAssetPath('/ai-rooster.jpg');
    },

    async login() {
      await this.authenticate(this.username, this.password);

      // It's no use on the page now, and a single sign-on can still fail below
      this.password = '';

      if (this.isAuthenticated) {
        if (this.ssoAppId) {
          await this.loginToApplication(this.ssoAppId, false);
        } else {
          this.delayedRedirect();
        }
      }
    },

    maybeGetApplicationIdQueryParam() {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('app');
    },
  },

  async mounted() {
    this.ssoAppId = this.maybeGetApplicationIdQueryParam();

    await this.restoreSession();

    if (this.isAuthenticated) {
      if (this.ssoAppId) {
        await this.loginToApplication(this.ssoAppId, false);
      } else {
        this.delayedRedirect();
      }
    }
  }
}
</script>

<style scoped>

</style>