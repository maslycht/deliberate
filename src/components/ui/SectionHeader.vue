<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <div class="mb-4">
    <h2 class="font-display text-[1.3rem] text-ink m-0">{{ title }}</h2>
    <p v-if="subtitle" class="text-[0.79rem] text-ink-muted mt-0.5 mb-0">{{ subtitle }}</p>
  </div>
</template>
