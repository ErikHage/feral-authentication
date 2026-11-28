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
          <!-- FrForm stops the page submitting, and emits submit itself -->
          <fr-form @submit="login">
            <fr-text-field
                v-model="username"
                label="Username"
                type="text"
                required
            ></fr-text-field>

            <fr-text-field
                v-model="password"
                label="Password"
                type="password"
                required
            ></fr-text-field>

            <div class="text-center">
              <fr-btn v-if="showLoginButton" type="submit" class="mt-3">Submit</fr-btn>
              <fr-spinner v-else color="primary"></fr-spinner>
            </div>

          </fr-form>
        </fr-card>
      </fr-col>
    </fr-row>
  </fr-container>
</template>

<script>
import { nextTick } from "vue";
import { useAuthenticationStore } from '@/store';
import { notify } from "@/store/notifications";
import { mapActions, mapState } from "pinia";
import {
  FrBtn, FrCard, FrCol, FrContainer, FrForm, FrImage, FrRow, FrSpinner, FrTextField,
} from "@feral-auth/vue-components";
import { getAssetPath } from "@/utils/assets";

export default {
  name: 'LoginPage',

  components: {
    FrBtn, FrCard, FrCol, FrContainer, FrForm, FrImage, FrRow, FrSpinner, FrTextField,
  },

  data: () => ({
    username: '',
    password: '',
    ssoAppId: null,
  }),

  computed: {
    ...mapState(useAuthenticationStore, [
        'isAuthenticated', 'loading',
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

    // To the page the guard sent them from, if it's one of ours. Resolves once
    // the router is there
    delayedRedirect() {
      const redirect = this.$route.query.redirect;
      const destination = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
          ? redirect
          : '/dashboard/applications';

      return new Promise((resolve) => {
        setTimeout(async () => {
          await this.$router.push(destination);
          resolve();
        }, 500);
      });
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
          await this.delayedRedirect();
          // Once FrAppShell has replaced the logged-out frame, whose toasts go with it
          await nextTick();
          notify('success', 'Login Succeeded!');
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