<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import { useSortable, moveArrayElement } from "@vueuse/integrations/useSortable";
import { useMatrixStore, getWeights, getCompletionStatus, MIN_ITEMS } from "@/stores/matrix";
import SectionHeader from "@/components/ui/SectionHeader.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppTextarea from "@/components/ui/AppTextarea.vue";
import AppButton from "@/components/ui/AppButton.vue";

const store = useMatrixStore();
const router = useRouter();

const newCatName = ref("");
const newItemName = ref("");
const newItemDetails = ref("");

const weights = computed(() => getWeights(store.categories.length));

const itemsWithCompletion = computed(() =>
  store.items.map((item) => {
    const { done, total } = getCompletionStatus(item, store.categories);
    return { ...item, done, total, complete: total > 0 && done === total };
  }),
);

const catListEl = useTemplateRef<HTMLElement>("catList");
useSortable(catListEl, store.categories, {
  handle: ".drag-handle",
  animation: 150,
  onUpdate(e) {
    moveArrayElement(store.categories, e.oldIndex!, e.newIndex!);
  },
});

function addCategory() {
  if (!newCatName.value.trim()) return;
  store.addCategory(newCatName.value.trim());
  newCatName.value = "";
}

function addItem() {
  if (!newItemName.value.trim()) return;
  store.addItem(newItemName.value.trim(), newItemDetails.value.trim());
  newItemName.value = "";
  newItemDetails.value = "";
}

function goToScore() {
  router.push({ name: "score" });
}
</script>

<template>
  <div class="flex gap-8 items-start flex-wrap">
    <!-- Column 1: Categories -->
    <div class="flex-[1_1_320px] min-w-[280px]">
      <SectionHeader
        title="Categories"
        subtitle="Drag to reorder — position determines weight (top = highest)"
      />

      <div ref="catList" role="list" class="flex flex-col gap-2 mb-5">
        <div
          v-for="(cat, idx) in store.categories"
          :key="cat.id"
          role="listitem"
          aria-roledescription="sortable item"
          class="bg-surface border border-line rounded-[10px] px-4 py-3 flex items-center gap-3 select-none"
        >
          <span class="drag-handle text-ink-muted text-[1.1rem] cursor-grab" aria-hidden="true"
            >⠿</span
          >

          <!-- Keyboard reorder controls -->
          <div
            class="flex flex-col gap-0.5 shrink-0"
            role="group"
            :aria-label="`Reorder ${cat.name}`"
          >
            <button
              type="button"
              :disabled="idx === 0"
              class="text-ink-muted text-[0.65rem] leading-none bg-transparent border-none cursor-pointer disabled:opacity-30 hover:not-disabled:opacity-70 p-0"
              :aria-label="`Move ${cat.name} up`"
              @click="store.moveCategory(idx, idx - 1)"
            >
              ▲
            </button>
            <button
              type="button"
              :disabled="idx === store.categories.length - 1"
              class="text-ink-muted text-[0.65rem] leading-none bg-transparent border-none cursor-pointer disabled:opacity-30 hover:not-disabled:opacity-70 p-0"
              :aria-label="`Move ${cat.name} down`"
              @click="store.moveCategory(idx, idx + 1)"
            >
              ▼
            </button>
          </div>

          <span
            class="bg-accent text-canvas rounded-md px-2 py-0.5 text-[0.75rem] font-bold font-mono min-w-[28px] text-center shrink-0"
            aria-hidden="true"
          >
            ×{{ weights[idx] }}
          </span>

          <input
            :value="cat.name"
            class="flex-1 bg-transparent border-none outline-none font-sans text-[0.9rem] text-ink"
            :aria-label="`Category name for ${cat.name}`"
            @input="store.updateCategoryName(cat.id, ($event.target as HTMLInputElement).value)"
          />

          <button
            type="button"
            class="bg-transparent border-none cursor-pointer text-ink-muted text-[1.1rem] shrink-0 leading-none hover:opacity-70"
            :aria-label="`Remove ${cat.name} category`"
            @click="store.removeCategory(cat.id)"
          >
            ×
          </button>
        </div>

        <EmptyState v-if="store.categories.length === 0" text="No categories yet." />
      </div>

      <div class="flex gap-2">
        <AppInput
          v-model="newCatName"
          placeholder="New category name…"
          aria-label="New category name"
          @keydown.enter="addCategory"
        />
        <AppButton small @click="addCategory">Add</AppButton>
      </div>

      <div
        class="mt-[0.85rem] px-[0.9rem] py-[0.7rem] bg-surface-subtle rounded-lg text-[0.77rem] text-ink-muted leading-relaxed"
      >
        <strong class="text-ink">How weights work:</strong> The ×N badge is auto-assigned by
        position. Top = most important. Final score = Σ (rating × weight).
      </div>
    </div>

    <!-- Column 2: Options -->
    <div class="flex-[1_1_320px] min-w-[280px]">
      <SectionHeader title="Options" subtitle="Add options to compare" />

      <div role="list" class="flex flex-col gap-2 mb-5">
        <div
          v-for="item in itemsWithCompletion"
          :key="item.id"
          role="listitem"
          class="bg-surface border border-line rounded-[10px] px-4 py-3 flex items-center gap-3"
        >
          <div class="flex-1 min-w-0 flex flex-col gap-0.5">
            <input
              :value="item.name"
              class="w-full bg-transparent border-none outline-none font-semibold font-sans text-[0.9rem] text-ink"
              :aria-label="`Option name for ${item.name}`"
              @input="store.updateItem(item.id, ($event.target as HTMLInputElement).value, item.details)"
            />
            <input
              :value="item.details"
              class="w-full bg-transparent border-none outline-none font-sans text-[0.75rem] text-ink-muted"
              placeholder="Details (optional)…"
              :aria-label="`Option details for ${item.name}`"
              @input="store.updateItem(item.id, item.name, ($event.target as HTMLInputElement).value)"
            />
          </div>

          <span
            class="text-[0.75rem] font-mono shrink-0"
            :class="item.complete ? 'text-success' : 'text-ink-muted'"
            :aria-label="`Scored ${item.done} of ${item.total} categories`"
          >
            {{ item.done }}/{{ item.total }}
          </span>

          <button
            type="button"
            class="bg-transparent border-none cursor-pointer text-ink-muted text-[1.1rem] leading-none hover:opacity-70"
            :aria-label="`Remove ${item.name}`"
            @click="store.removeItem(item.id)"
          >
            ×
          </button>
        </div>

        <EmptyState v-if="store.items.length === 0" text="No options yet. Add one below." />
      </div>

      <div class="flex flex-col gap-2">
        <AppInput
          v-model="newItemName"
          placeholder="Option name…"
          aria-label="Option name"
          @keydown.enter="addItem"
        />
        <AppTextarea
          v-model="newItemDetails"
          placeholder="Details (optional)…"
          :rows="3"
          aria-label="Option details"
        />
        <AppButton small @click="addItem">Add Option</AppButton>
      </div>

      <div class="mt-6 pt-6 border-t border-line">
        <AppButton
          :disabled="!store.isReadyToScore"
          :aria-describedby="!store.isReadyToScore ? 'score-hint' : undefined"
          class="w-full"
          @click="goToScore"
        >
          Start Scoring →
        </AppButton>
        <p
          v-if="!store.isReadyToScore"
          id="score-hint"
          class="text-center text-[0.77rem] text-ink-muted mt-2"
        >
          {{
            store.categories.length === 0
              ? "Add at least one category first"
              : `Add ${MIN_ITEMS - store.items.length} more option${store.items.length === 0 ? "s" : ""} to begin`
          }}
        </p>
      </div>
    </div>
  </div>
</template>
