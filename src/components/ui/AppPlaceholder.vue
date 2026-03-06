<script setup lang="ts">
defineProps<{
  icon: string;
  text: string;
}>();
</script>

<template>
  <div class="text-center py-16 px-8 text-ink-muted">
    <div class="text-[2.5rem] mb-2">{{ icon }}</div>
    <div>{{ text }}</div>
  </div>
</template>
