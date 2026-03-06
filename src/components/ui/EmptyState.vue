<script setup lang="ts">
defineProps<{
  text: string;
}>();
</script>

<template>
  <div
    class="p-7 text-center text-ink-muted text-[0.84rem] border-[1.5px] border-dashed border-line rounded-[10px]"
  >
    {{ text }}
  </div>
</template>
