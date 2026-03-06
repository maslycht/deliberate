<script setup lang="ts">
defineProps<{
  id?: string;
  modelValue: string;
  placeholder?: string;
}>();

defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <input
    :id="id"
    :value="modelValue"
    :placeholder="placeholder"
    class="bg-surface border border-line rounded-lg px-[0.85rem] py-[0.55rem] text-[0.88rem] text-ink font-sans w-full box-border"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
