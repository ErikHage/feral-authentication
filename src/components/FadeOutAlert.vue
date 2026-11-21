<template>
  <transition name="fade">
    <fr-alert v-if="isVisible" :type="alertType" class="mt-3">{{ message }}</fr-alert>
  </transition>
</template>

<script>
import { FrAlert } from "@feral-auth/vue-components";

export default {
  name: "FadeOutAlert",

  components: { FrAlert },

  props: ['isVisible', 'alertType', 'message'],
}
</script>

<style scoped>

</style>