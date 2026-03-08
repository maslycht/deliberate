<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  useMatrixStore,
  getWeights,
  getCompletionStatus,
  isComplete,
  type Item,
} from "@/stores/matrix";
import AppButton from "@/components/ui/AppButton.vue";
import ScorePicker from "@/components/ui/ScorePicker.vue";
import AppPlaceholder from "@/components/ui/AppPlaceholder.vue";
import SectionHeader from "@/components/ui/SectionHeader.vue";

const store = useMatrixStore();
const router = useRouter();

// ─── State ───────────────────────────────────────────────────────────────────

const queue = ref<string[]>([]);
const currentIdx = ref<number | null>(null);
const localScores = ref<Record<string, number>>({});
const confirmReset = ref(false);
const initialized = ref(false);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getScore(categoryId: string): number | null {
  return localScores.value[categoryId] ?? currentItem.value?.scores[categoryId] ?? null;
}

function setLocalScore(categoryId: string, score: number) {
  localScores.value[categoryId] = score;
}

// ─── Computed ────────────────────────────────────────────────────────────────

const weights = computed(() => getWeights(store.categories.length));

const allComplete = computed(
  () => store.items.length > 0 && store.items.every((item) => isComplete(item, store.categories)),
);

const currentItem = computed(() => {
  if (currentIdx.value === null) return null;
  const id = queue.value[currentIdx.value];
  return store.items.find((i) => i.id === id) ?? null;
});

const allFilled = computed(() => {
  if (!currentItem.value) return false;
  return store.categories.every((c) => getScore(c.id) != null);
});

const progress = computed(() => {
  if (currentIdx.value === null || queue.value.length === 0) return 0;
  return currentIdx.value / queue.value.length;
});

const isLastItem = computed(
  () => currentIdx.value !== null && currentIdx.value === queue.value.length - 1,
);

const orderedItems = computed(() =>
  queue.value
    .map((id) => store.items.find((i) => i.id === id))
    .filter((item): item is Item => item != null),
);

// ─── Watchers ────────────────────────────────────────────────────────────────

watch(currentIdx, (val) => {
  if (val !== null && val >= queue.value.length) {
    currentIdx.value = null;
  }
});

// ─── Handlers ────────────────────────────────────────────────────────────────

function handleSave() {
  if (!currentItem.value) return;
  for (const [categoryId, score] of Object.entries(localScores.value)) {
    store.setItemScore(currentItem.value.id, categoryId, score);
  }
  localScores.value = {};
  const next = currentIdx.value! + 1;
  currentIdx.value = next >= queue.value.length ? null : next;
}

function handleSkip() {
  localScores.value = {};
  const next = currentIdx.value! + 1;
  currentIdx.value = next >= queue.value.length ? null : next;
}

function handleBackToList() {
  localScores.value = {};
  confirmReset.value = false;
  currentIdx.value = null;
}

function handleSelectItem(itemId: string) {
  const idx = queue.value.indexOf(itemId);
  currentIdx.value = idx >= 0 ? idx : 0;
  localScores.value = {};
  confirmReset.value = false;
}

function handleReset() {
  store.resetAllScores();
  queue.value = shuffle([...store.items]).map((i) => i.id);
  currentIdx.value = 0;
  localScores.value = {};
  confirmReset.value = false;
}

function goToResults() {
  router.push({ name: "results" });
}

// ─── Initialization ──────────────────────────────────────────────────────────

onMounted(() => {
  const incomplete = store.items.filter((i) => {
    const { done, total } = getCompletionStatus(i, store.categories);
    return done > 0 && done < total;
  });
  const noScores = store.items.filter((i) => Object.keys(i.scores || {}).length === 0);
  const complete = store.items.filter((i) => isComplete(i, store.categories));
  const ordered = [...shuffle(incomplete), ...shuffle(noScores), ...shuffle(complete)];
  queue.value = ordered.map((i) => i.id);
  currentIdx.value = incomplete.length > 0 || noScores.length > 0 ? 0 : null;
  localScores.value = {};
  initialized.value = true;
});
</script>

<template>
  <!-- Gate: not initialized -->
  <div v-if="!initialized" />

  <!-- Gate: no items -->
  <AppPlaceholder
    v-else-if="store.items.length === 0"
    icon="📋"
    text="Add options in the Setup tab first."
  />

  <!-- Gate: no categories -->
  <AppPlaceholder
    v-else-if="store.categories.length === 0"
    icon="🏷️"
    text="Add categories in the Setup tab first."
  />

  <!-- ─── Scoring Item View ─────────────────────────────────────────────────── -->
  <div v-else-if="currentIdx !== null && currentItem" class="max-w-[540px] mx-auto">
    <!-- Top bar -->
    <div class="flex items-center justify-between mb-5">
      <button
        class="bg-transparent border-none cursor-pointer text-ink-muted text-[0.82rem] font-sans flex items-center gap-[0.3rem] p-0"
        @click="handleBackToList"
      >
        ← Back to list
      </button>

      <!-- Reset (scoring view) -->
      <button
        v-if="!confirmReset"
        class="bg-transparent border border-line cursor-pointer text-ink-muted text-[0.78rem] font-sans rounded-md px-[0.7rem] py-[0.3rem]"
        @click="confirmReset = true"
      >
        Reset all scores
      </button>
      <div v-else class="flex items-center gap-[0.4rem]">
        <span class="text-[0.75rem] text-ink-muted font-sans">Sure?</span>
        <button
          class="bg-accent border-none cursor-pointer text-canvas text-[0.75rem] font-sans font-semibold rounded-md px-[0.7rem] py-[0.3rem]"
          @click="handleReset"
        >
          Yes, reset
        </button>
        <button
          class="bg-transparent border border-line cursor-pointer text-ink-muted text-[0.75rem] font-sans rounded-md px-[0.7rem] py-[0.3rem]"
          @click="confirmReset = false"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="mb-6">
      <div class="flex justify-between text-[0.78rem] text-ink-muted mb-[0.4rem] font-mono">
        <span>Option {{ currentIdx + 1 }} of {{ queue.length }}</span>
        <span>{{ Math.round(progress * 100) }}%</span>
      </div>
      <div class="h-1 bg-line rounded-sm overflow-hidden">
        <div
          class="h-full bg-accent rounded-sm transition-[width] duration-300 ease-in-out"
          :style="{ width: `${progress * 100}%` }"
        />
      </div>
    </div>

    <!-- Current item card -->
    <div class="bg-surface border-2 border-accent rounded-[14px] px-6 py-5 mb-5">
      <div class="text-[0.72rem] font-mono text-accent tracking-widest uppercase mb-[0.2rem]">
        Now scoring
      </div>
      <h2 class="font-display text-[1.5rem] text-ink m-0">{{ currentItem.name }}</h2>
      <div
        v-if="currentItem.details"
        class="text-[0.8rem] text-ink-muted mt-[0.4rem] whitespace-pre-wrap"
      >
        {{ currentItem.details }}
      </div>
    </div>

    <!-- Category scoring list -->
    <div class="flex flex-col gap-[0.6rem] mb-5">
      <div
        v-for="(cat, idx) in store.categories"
        :key="cat.id"
        class="bg-surface border border-line rounded-[10px] px-4 py-[0.9rem]"
      >
        <div class="flex justify-between items-center mb-[0.6rem]">
          <div class="text-[0.88rem] font-semibold text-ink">{{ cat.name }}</div>
          <div class="flex items-center gap-2">
            <span class="text-[0.72rem] text-ink-muted font-mono">weight ×{{ weights[idx] }}</span>
            <span
              v-if="getScore(cat.id) != null"
              class="text-[0.72rem] font-mono text-accent font-bold"
            >
              = {{ getScore(cat.id)! * weights[idx]! }} pts
            </span>
          </div>
        </div>
        <ScorePicker
          :model-value="getScore(cat.id)"
          @update:model-value="setLocalScore(cat.id, $event)"
        />
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3">
      <AppButton :disabled="!allFilled" class="flex-1" @click="handleSave">
        Save &amp; {{ isLastItem ? "Finish ✓" : "Next →" }}
      </AppButton>
      <AppButton variant="ghost" small @click="handleSkip">Skip</AppButton>
    </div>
    <div v-if="!allFilled" class="text-center text-[0.77rem] text-ink-muted mt-[0.6rem]">
      Rate all categories to continue
    </div>
  </div>

  <!-- ─── Scoring List View ─────────────────────────────────────────────────── -->
  <div v-else class="max-w-[540px] mx-auto">
    <!-- All complete banner -->
    <div v-if="allComplete" class="text-center mb-7">
      <div class="text-[2.5rem] mb-2">✓</div>
      <h2 class="font-display text-[1.6rem] text-ink mb-[0.35rem]">All scored!</h2>
      <p class="text-ink-muted mb-5">Click any option below to review or edit its scores.</p>
      <AppButton class="min-w-[200px]" @click="goToResults">View Results →</AppButton>
    </div>

    <!-- Section header when not complete -->
    <div v-else class="mb-5">
      <SectionHeader
        title="Options"
        subtitle="Click an option to score it. Incomplete items are shown first."
      />
    </div>

    <!-- Item list -->
    <div class="flex flex-col gap-2 mb-5">
      <button
        v-for="item in orderedItems"
        :key="item.id"
        class="bg-surface rounded-[10px] px-4 py-[0.85rem] flex items-center gap-3 cursor-pointer text-left w-full transition-shadow duration-[120ms]"
        :class="
          isComplete(item, store.categories) ? 'border border-line' : 'border-[1.5px] border-accent'
        "
        @click="handleSelectItem(item.id)"
      >
        <!-- Status dot -->
        <div
          class="w-[10px] h-[10px] rounded-full shrink-0"
          :class="isComplete(item, store.categories) ? 'bg-success' : 'bg-accent'"
        />
        <!-- Name + details -->
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-[0.9rem] text-ink truncate">{{ item.name }}</div>
          <div v-if="item.details" class="text-[0.75rem] text-ink-muted mt-[2px] truncate">
            {{ item.details }}
          </div>
        </div>
        <!-- Completion count + chevron -->
        <div class="shrink-0 flex items-center gap-2">
          <span
            class="text-[0.75rem] font-mono"
            :class="isComplete(item, store.categories) ? 'text-success' : 'text-accent'"
          >
            {{ getCompletionStatus(item, store.categories).done }}/{{
              getCompletionStatus(item, store.categories).total
            }}
          </span>
          <span class="text-ink-muted text-[0.9rem]">›</span>
        </div>
      </button>
    </div>

    <!-- Reset (list view) -->
    <div class="flex justify-center">
      <button
        v-if="!confirmReset"
        class="bg-transparent border border-line cursor-pointer text-ink-muted text-[0.78rem] font-sans rounded-md px-[0.7rem] py-[0.3rem]"
        @click="confirmReset = true"
      >
        Reset all scores
      </button>
      <div v-else class="flex items-center gap-[0.4rem]">
        <span class="text-[0.75rem] text-ink-muted font-sans">Sure?</span>
        <button
          class="bg-accent border-none cursor-pointer text-canvas text-[0.75rem] font-sans font-semibold rounded-md px-[0.7rem] py-[0.3rem]"
          @click="handleReset"
        >
          Yes, reset
        </button>
        <button
          class="bg-transparent border border-line cursor-pointer text-ink-muted text-[0.75rem] font-sans rounded-md px-[0.7rem] py-[0.3rem]"
          @click="confirmReset = false"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
