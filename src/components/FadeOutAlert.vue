<template>
  <transition name="fade">
    <v-alert v-if="isVisible" :type="alertType" class="mt-3">{{ message }}</v-alert>
  </transition>
</template>

<script>
export default {
  name: "FadeOutAlert",

  props: ['isVisible', 'alertType', 'message'],
}
</script>

<style scoped>

</style>