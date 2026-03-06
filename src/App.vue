<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from "vue-router";

const route = useRoute();

const tabs = [
  { name: "setup", label: "Setup", to: "/" },
  { name: "score", label: "Score", to: "/score" },
  { name: "results", label: "Results", to: "/results" },
] as const;
</script>

<template>
  <div class="min-h-screen flex flex-col overflow-x-hidden w-full">
    <header class="bg-ink text-canvas px-5 py-5 flex items-center gap-4 flex-wrap">
      <span class="text-[1.4rem]">⚖️</span>
      <div>
        <h1 class="font-display text-[1.4rem] leading-tight">Deliberate</h1>
        <p class="text-[0.72rem] text-ink-muted font-mono mt-0.5 tracking-[0.05em] uppercase">
          Decision Making Tool
        </p>
      </div>
      <nav class="ml-auto flex gap-1">
        <RouterLink
          v-for="tab in tabs"
          :key="tab.name"
          :to="tab.to"
          class="px-4 py-[0.4rem] rounded-md text-[0.82rem] font-semibold font-sans border transition-all duration-150 no-underline"
          :class="
            route.name === tab.name
              ? 'bg-accent text-canvas border-accent'
              : 'bg-transparent text-canvas/75 border-canvas/20 hover:text-canvas'
          "
        >
          {{ tab.label }}
        </RouterLink>
      </nav>
    </header>

    <main class="flex-1 p-5 max-w-[1100px] w-full mx-auto">
      <RouterView />
    </main>

    <footer class="text-center p-4 text-[0.72rem] text-ink-muted font-mono border-t border-line">
      Deliberate · decision making tool
    </footer>
  </div>
</template>
