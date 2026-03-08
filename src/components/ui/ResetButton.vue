<script setup lang="ts">
import { ref } from "vue";
import AppButton from "./AppButton.vue";

const emit = defineEmits<{ reset: [] }>();

const confirming = ref(false);
</script>

<template>
  <AppButton v-if="!confirming" variant="ghost" small @click="confirming = true">
    Reset all scores
  </AppButton>
  <div v-else class="flex items-center gap-[0.4rem]">
    <span class="text-[0.75rem] text-ink-muted font-sans">Sure?</span>
    <AppButton
      small
      @click="
        emit('reset');
        confirming = false;
      "
      >Yes, reset</AppButton
    >
    <AppButton variant="ghost" small @click="confirming = false">Cancel</AppButton>
  </div>
</template>
