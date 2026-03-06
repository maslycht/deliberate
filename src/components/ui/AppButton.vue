<script setup lang="ts">
defineProps<{
  variant?: "primary" | "ghost";
  disabled?: boolean;
  small?: boolean;
}>();
</script>

<template>
  <button
    :disabled="disabled"
    class="font-semibold font-sans rounded-lg border-none transition-all duration-[120ms]"
    :class="[
      small ? 'px-4 py-[0.45rem] text-[0.82rem]' : 'px-6 py-[0.65rem] text-[0.9rem]',
      disabled
        ? 'bg-line text-ink-muted cursor-not-allowed'
        : variant === 'ghost'
          ? 'bg-transparent text-ink-muted border border-line cursor-pointer'
          : 'bg-accent text-canvas cursor-pointer',
    ]"
  >
    <slot />
  </button>
</template>
