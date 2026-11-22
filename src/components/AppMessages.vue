<template>
  <fr-snackbar-queue ref="queue" v-model="messages" timeout="3000"/>
</template>

<script>
import { FrSnackbarQueue } from "@feral-auth/vue-components";
import { mapWritableState } from "pinia";
import { useNotificationsStore } from "@/store/notifications";

/** The app's messages, from the notifications store, as snackbars. */
export default {
  name: "AppMessages",

  components: { FrSnackbarQueue },

  computed: {
    ...mapWritableState(useNotificationsStore, ['messages']),
  },

  created() {
    // At once, so a message given straight after a clear isn't dismissed
    // with the ones before it
    this.$watch(() => useNotificationsStore().clears, () => this.$refs.queue?.clear(), { flush: 'sync' });
  },
}
</script>
