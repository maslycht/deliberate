import { computed } from "vue";
import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";

export interface Category {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  name: string;
  details: string;
  scores: Record<string, number>;
}

interface StoredState {
  categories: Category[];
  items: Item[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export const MIN_ITEMS = 2;

export function uid(): string {
  return crypto.randomUUID();
}

export function getWeight(idx: number, total: number): number {
  if (total === 1) return 5;
  return Math.max(1, Math.min(5, 5 - Math.floor((idx * 4) / (total - 1))));
}

export function getWeights(total: number): number[] {
  return Array.from({ length: total }, (_, i) => getWeight(i, total));
}

export function getCompletionStatus(
  item: Item,
  categories: Category[],
): { done: number; total: number } {
  const done = categories.filter((c) => item.scores[c.id] != null).length;
  return { done, total: categories.length };
}

export function isComplete(item: Item, categories: Category[]): boolean {
  const { done, total } = getCompletionStatus(item, categories);
  return total > 0 && done === total;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMatrixStore = defineStore("matrix", () => {
  const state = useStorage<StoredState>("decision-matrix-v1", {
    categories: [
      { id: uid(), name: "Criteria 1" },
      { id: uid(), name: "Criteria 2" },
      { id: uid(), name: "Criteria 3" },
    ],
    items: [],
  });

  const categories = computed({
    get: () => state.value.categories,
    set: (v: Category[]) => {
      state.value.categories = v;
    },
  });

  const items = computed({
    get: () => state.value.items,
    set: (v: Item[]) => {
      state.value.items = v;
    },
  });

  const isReadyToScore = computed(
    () => state.value.categories.length >= 1 && state.value.items.length >= MIN_ITEMS,
  );

  function addCategory(name: string) {
    state.value.categories.push({ id: uid(), name });
  }

  function removeCategory(id: string) {
    state.value.categories = state.value.categories.filter((c) => c.id !== id);
    state.value.items = state.value.items.map((item) => {
      const scores = { ...item.scores };
      delete scores[id];
      return { ...item, scores };
    });
  }

  function updateCategoryName(id: string, name: string) {
    state.value.categories = state.value.categories.map((c) => (c.id === id ? { ...c, name } : c));
  }

  function moveCategory(from: number, to: number) {
    const arr = [...state.value.categories];
    const moved = arr.splice(from, 1)[0]!;
    arr.splice(to, 0, moved);
    state.value.categories = arr;
  }

  function addItem(name: string, details: string) {
    state.value.items.push({ id: uid(), name, details, scores: {} });
  }

  function removeItem(id: string) {
    state.value.items = state.value.items.filter((i) => i.id !== id);
  }

  function updateItem(id: string, name: string, details: string) {
    state.value.items = state.value.items.map((i) =>
      i.id === id ? { ...i, name, details } : i,
    );
  }

  function setItemScore(itemId: string, categoryId: string, score: number) {
    state.value.items = state.value.items.map((item) =>
      item.id === itemId ? { ...item, scores: { ...item.scores, [categoryId]: score } } : item,
    );
  }

  function resetAllScores() {
    state.value.items = state.value.items.map((item) => ({
      ...item,
      scores: {},
    }));
  }

  return {
    categories,
    items,
    isReadyToScore,
    addCategory,
    removeCategory,
    updateCategoryName,
    moveCategory,
    addItem,
    removeItem,
    updateItem,
    setItemScore,
    resetAllScores,
  };
});
