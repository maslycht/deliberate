<script setup lang="ts">
import { ref, computed } from "vue";
import { useMatrixStore, getWeights, getWeight, type Category, type Item } from "@/stores/matrix";
import ViewToggle from "@/components/ui/ViewToggle.vue";

interface BreakdownEntry {
  cat: Category;
  weight: number;
  score: number;
  weighted: number;
}

interface RankedItem extends Item {
  total: number;
  maxPossible: number;
  breakdown: BreakdownEntry[];
}

const store = useMatrixStore();
const view = ref<"list" | "table">("list");

const ranked = computed<RankedItem[]>(() => {
  const weights = getWeights(store.categories.length);
  const maxPossible = weights.reduce((sum, w) => sum + 5 * w, 0);

  return store.items
    .map((item) => {
      const breakdown = store.categories.map((cat, idx) => {
        const w = weights[idx]!;
        const score = item.scores[cat.id]!;
        return { cat, weight: w, score, weighted: score * w };
      });
      const total = breakdown.reduce((sum, b) => sum + b.weighted, 0);
      return { ...item, total, maxPossible, breakdown };
    })
    .sort((a, b) => b.total - a.total);
});
</script>

<template>
  <div>
    <!-- Header -->
    <div class="flex items-center justify-between mb-5">
      <div class="text-[0.8rem] text-ink-muted font-mono">
        {{ ranked.length }} option{{ ranked.length !== 1 ? "s" : "" }} · sorted by score
      </div>
      <ViewToggle v-model="view" />
    </div>

    <!-- List View -->
    <div v-if="view === 'list'" class="flex flex-col gap-4 max-w-[680px] mx-auto">
      <div
        v-for="(item, rank) in ranked"
        :key="item.id"
        class="bg-surface rounded-[14px] px-6 py-5 relative overflow-hidden"
        :class="rank === 0 ? 'border-2 border-accent' : 'border border-line'"
      >
        <!-- TOP PICK badge -->
        <div
          v-if="rank === 0"
          class="absolute top-0 right-0 bg-accent text-canvas text-[0.68rem] font-mono font-bold px-[10px] py-[3px] rounded-bl-lg tracking-[0.06em]"
        >
          TOP PICK
        </div>

        <!-- Card header: rank, name/details, score -->
        <div class="flex items-start gap-4 mb-3">
          <div
            class="font-display text-[2rem] leading-none min-w-[40px] font-extrabold"
            :class="rank === 0 ? 'text-accent' : 'text-ink-muted'"
          >
            #{{ rank + 1 }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-ink">{{ item.name }}</div>
            <div
              v-if="item.details"
              class="text-[0.77rem] text-ink-muted mt-0.5 whitespace-pre-wrap"
            >
              {{ item.details }}
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="font-mono text-[1.5rem] font-bold text-ink">{{ item.total }}</div>
            <div class="text-[0.7rem] text-ink-muted font-mono">/ {{ item.maxPossible }} pts</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="h-[3px] bg-line rounded-sm overflow-hidden mb-[0.85rem]">
          <div
            class="h-full bg-accent rounded-sm transition-[width] duration-500 ease-out"
            :style="{
              width: (item.maxPossible > 0 ? (item.total / item.maxPossible) * 100 : 0) + '%',
            }"
          />
        </div>

        <!-- Breakdown -->
        <div class="flex flex-col gap-[0.35rem]">
          <div
            v-for="b in item.breakdown"
            :key="b.cat.id"
            class="flex items-center gap-2 text-[0.8rem]"
          >
            <div class="flex-1 text-ink-muted">{{ b.cat.name }}</div>
            <div class="font-mono text-ink-muted text-[0.75rem]">
              {{ b.score }} × {{ b.weight }}
            </div>
            <div class="font-mono font-bold text-ink min-w-[32px] text-right">{{ b.weighted }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="overflow-x-auto">
      <table class="w-full border-collapse font-sans text-[0.85rem]">
        <thead>
          <tr>
            <th
              class="px-4 py-[0.65rem] text-left font-bold text-[0.78rem] text-ink bg-surface-subtle border-b-2 border-line whitespace-nowrap rounded-tl-[10px]"
            >
              Rank
            </th>
            <th
              class="px-4 py-[0.65rem] text-left font-bold text-[0.78rem] text-ink bg-surface-subtle border-b-2 border-line border-l border-line whitespace-nowrap"
            >
              Option
            </th>
            <th
              v-for="(cat, idx) in store.categories"
              :key="cat.id"
              class="px-4 py-[0.65rem] text-center font-bold text-[0.78rem] text-ink bg-surface-subtle border-b-2 border-line border-l border-line whitespace-nowrap"
            >
              <div>{{ cat.name }}</div>
              <div class="text-[0.68rem] text-ink-muted font-mono font-normal mt-0.5">
                ×{{ getWeight(idx, store.categories.length) }}
              </div>
            </th>
            <th
              class="px-4 py-[0.65rem] text-center font-bold text-[0.78rem] text-ink bg-surface-subtle border-b-2 border-line border-l border-line whitespace-nowrap rounded-tr-[10px]"
            >
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, rank) in ranked"
            :key="item.id"
            :class="
              rank === 0 ? 'bg-[rgba(200,92,45,0.04)]' : rank % 2 === 0 ? 'bg-surface' : 'bg-canvas'
            "
          >
            <td class="px-4 py-[0.6rem] border-b border-line align-middle">
              <span
                class="font-display font-extrabold text-[1.1rem]"
                :class="rank === 0 ? 'text-accent' : 'text-ink-muted'"
              >
                #{{ rank + 1 }}
              </span>
            </td>
            <td class="px-4 py-[0.6rem] border-b border-line border-l border-line align-middle">
              <div class="font-semibold text-ink">{{ item.name }}</div>
              <div v-if="item.details" class="text-[0.72rem] text-ink-muted mt-[1px]">
                {{ item.details }}
              </div>
            </td>
            <td
              v-for="b in item.breakdown"
              :key="b.cat.id"
              class="px-4 py-[0.6rem] border-b border-line border-l border-line align-middle"
            >
              <div class="text-center">
                <div class="font-mono font-bold text-ink text-[0.95rem]">{{ b.score }}</div>
                <div class="font-mono text-[0.68rem] text-ink-muted mt-[1px]">
                  ={{ b.weighted }}
                </div>
              </div>
            </td>
            <td class="px-4 py-[0.6rem] border-b border-line border-l border-line align-middle">
              <div class="text-center">
                <div
                  class="font-mono font-bold text-[1.05rem]"
                  :class="rank === 0 ? 'text-accent' : 'text-ink'"
                >
                  {{ item.total }}
                </div>
                <div class="font-mono text-[0.68rem] text-ink-muted mt-[1px]">
                  /{{ item.maxPossible }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
