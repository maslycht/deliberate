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

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
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
  const done = categories.filter((c) => item.scores?.[c.id] != null).length;
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

  function addItem(name: string, details: string) {
    state.value.items.push({ id: uid(), name, details, scores: {} });
  }

  function removeItem(id: string) {
    state.value.items = state.value.items.filter((i) => i.id !== id);
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
    addCategory,
    removeCategory,
    updateCategoryName,
    addItem,
    removeItem,
    setItemScore,
    resetAllScores,
  };
});
