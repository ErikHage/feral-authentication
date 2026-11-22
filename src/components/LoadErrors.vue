<template>
  <div>
    <fr-alert v-for="(message, index) in shown" :key="index" type="error" class="my-2">{{ message }}</fr-alert>
  </div>
</template>

<script>
import { FrAlert } from "@feral-auth/vue-components";

/**
 * Why a page has nothing to show: one alert per load that failed. They stay
 * until the load succeeds, unlike the snackbars, which go.
 */
export default {
  name: "LoadErrors",

  components: { FrAlert },

  // Each a store's load error, null when that load hasn't failed
  props: { messages: { type: Array, required: true } },

  computed: {
    shown() {
      return this.messages.filter(Boolean);
    },
  },
}
</script>
