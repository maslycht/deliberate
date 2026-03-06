<script setup lang="ts">
defineProps<{
  modelValue: "list" | "table";
}>();

defineEmits<{
  "update:modelValue": [value: "list" | "table"];
}>();
</script>

<template>
  <div class="inline-flex border border-line rounded-lg overflow-hidden divide-x divide-line">
    <button
      type="button"
      class="px-4 py-[0.35rem] font-sans text-[0.82rem] cursor-pointer transition-all duration-[120ms]"
      :class="
        modelValue === 'list'
          ? 'bg-ink text-canvas font-semibold'
          : 'bg-transparent text-ink-muted font-normal'
      "
      @click="$emit('update:modelValue', 'list')"
    >
      List
    </button>
    <button
      type="button"
      class="px-4 py-[0.35rem] font-sans text-[0.82rem] cursor-pointer transition-all duration-[120ms]"
      :class="
        modelValue === 'table'
          ? 'bg-ink text-canvas font-semibold'
          : 'bg-transparent text-ink-muted font-normal'
      "
      @click="$emit('update:modelValue', 'table')"
    >
      Table
    </button>
  </div>
</template>
