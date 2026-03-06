<script setup lang="ts">
defineProps<{
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "ghost";
  disabled?: boolean;
  small?: boolean;
}>();
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    class="font-semibold font-sans rounded-lg transition-all duration-[120ms]"
    :class="[
      small ? 'px-4 py-[0.45rem] text-[0.82rem]' : 'px-6 py-[0.65rem] text-[0.9rem]',
      disabled && variant === 'ghost'
        ? 'bg-transparent text-ink-muted border border-line cursor-not-allowed opacity-50'
        : disabled
          ? 'bg-line text-ink-muted cursor-not-allowed'
          : variant === 'ghost'
            ? 'bg-transparent text-ink-muted border border-line cursor-pointer hover:opacity-85'
            : 'bg-accent text-canvas cursor-pointer hover:opacity-85',
    ]"
  >
    <slot />
  </button>
</template>
