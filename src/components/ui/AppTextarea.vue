<script setup lang="ts">
defineProps<{
  modelValue: string;
  placeholder?: string;
  rows?: number;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows ?? 3"
    class="bg-surface border border-line rounded-lg px-[0.85rem] py-[0.55rem] text-[0.88rem] text-ink font-sans w-full box-border resize-y leading-relaxed"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
