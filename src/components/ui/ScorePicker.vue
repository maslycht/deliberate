<script setup lang="ts">
defineProps<{
  modelValue: number | null;
}>();

defineEmits<{
  "update:modelValue": [value: number];
}>();

const labels = ["Poor", "Fair", "OK", "Good", "Great"] as const;
</script>

<template>
  <div class="flex gap-[0.4rem]">
    <button
      v-for="n in [1, 2, 3, 4, 5]"
      :key="n"
      :title="labels[n - 1]"
      type="button"
      class="flex-1 py-[0.45rem] rounded-[7px] font-mono text-[0.9rem] cursor-pointer transition-all duration-100 leading-none"
      :class="
        modelValue === n
          ? 'bg-accent text-canvas border-2 border-accent font-bold'
          : 'bg-transparent text-ink-muted border-[1.5px] border-line font-normal'
      "
      @click="$emit('update:modelValue', n)"
    >
      {{ n }}
      <div class="text-[0.55rem] mt-0.5 opacity-75 font-sans">{{ labels[n - 1] }}</div>
    </button>
  </div>
</template>
