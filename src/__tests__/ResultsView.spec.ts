import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import { useMatrixStore } from "../stores/matrix";
import ResultsView from "../views/ResultsView.vue";

const stub = { template: "<div />" };

function makeRouter() {
  return createRouter({
    history: createWebHistory(),
    routes: [
      { path: "/", name: "setup", component: stub },
      { path: "/score", name: "score", component: stub },
      { path: "/results", name: "results", component: ResultsView },
    ],
  });
}

/** Populate store with categories and fully-scored items. */
function seedStore(store: ReturnType<typeof useMatrixStore>) {
  // Clear default categories and add our own
  while (store.categories.length > 0) {
    store.removeCategory(store.categories[0]!.id);
  }
  store.addCategory("Speed");
  store.addCategory("Cost");

  store.addItem("Alpha", "fast option");
  store.addItem("Beta", "");

  const [speed, cost] = store.categories;
  const [alpha, beta] = store.items;

  // Alpha: Speed=5, Cost=3
  store.setItemScore(alpha!.id, speed!.id, 5);
  store.setItemScore(alpha!.id, cost!.id, 3);

  // Beta: Speed=2, Cost=4
  store.setItemScore(beta!.id, speed!.id, 2);
  store.setItemScore(beta!.id, cost!.id, 4);
}

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("isReadyForResults", () => {
  it("is false when items have no scores", () => {
    const store = useMatrixStore();
    store.addItem("A", "");
    store.addItem("B", "");
    expect(store.isReadyForResults).toBe(false);
  });

  it("is false when only some items are scored", () => {
    const store = useMatrixStore();
    store.addItem("A", "");
    store.addItem("B", "");
    const cat = store.categories[0]!;
    store.setItemScore(store.items[0]!.id, cat.id, 3);
    expect(store.isReadyForResults).toBe(false);
  });

  it("is true when all items are fully scored", () => {
    const store = useMatrixStore();
    seedStore(store);
    expect(store.isReadyForResults).toBe(true);
  });
});

describe("ResultsView", () => {
  async function mountResults() {
    const store = useMatrixStore();
    seedStore(store);
    const router = makeRouter();
    router.push("/results");
    await router.isReady();
    const wrapper = mount(ResultsView, {
      global: { plugins: [router] },
    });
    return { wrapper, store };
  }

  it("shows the option count in the header", async () => {
    const { wrapper } = await mountResults();
    expect(wrapper.text()).toContain("2 options");
    expect(wrapper.text()).toContain("sorted by score");
  });

  it("ranks items by total score descending", async () => {
    const { wrapper } = await mountResults();
    // Alpha: 5×5 + 3×1 = 28, Beta: 2×5 + 4×1 = 14
    // With 2 categories: weights are [5, 1]
    const cards = wrapper.findAll('[class*="bg-surface"]');
    expect(cards[0]!.text()).toContain("Alpha");
    expect(cards[1]!.text()).toContain("Beta");
  });

  it("shows TOP PICK badge on rank #1", async () => {
    const { wrapper } = await mountResults();
    expect(wrapper.text()).toContain("TOP PICK");
  });

  it("shows breakdown rows with score × weight", async () => {
    const { wrapper } = await mountResults();
    expect(wrapper.text()).toContain("5 × 5");
    expect(wrapper.text()).toContain("3 × 1");
  });

  it("shows total score and max possible", async () => {
    const { wrapper } = await mountResults();
    // Alpha total: 5×5 + 3×1 = 28, max: 5×5 + 5×1 = 30
    expect(wrapper.text()).toContain("28");
    expect(wrapper.text()).toContain("/ 30 pts");
  });

  it("switches to table view when toggle is clicked", async () => {
    const { wrapper } = await mountResults();
    // Click the Table button
    const buttons = wrapper.findAll("button");
    const tableButton = buttons.find((b) => b.text() === "Table");
    await tableButton!.trigger("click");

    // Should show a table element
    expect(wrapper.find("table").exists()).toBe(true);
    expect(wrapper.text()).toContain("Rank");
    expect(wrapper.text()).toContain("Option");
    expect(wrapper.text()).toContain("Total");
  });

  it("table view shows category headers with weights", async () => {
    const { wrapper } = await mountResults();
    const tableButton = wrapper.findAll("button").find((b) => b.text() === "Table");
    await tableButton!.trigger("click");

    expect(wrapper.text()).toContain("Speed");
    expect(wrapper.text()).toContain("×5");
    expect(wrapper.text()).toContain("Cost");
    expect(wrapper.text()).toContain("×1");
  });

  it("table view shows scores with weighted values", async () => {
    const { wrapper } = await mountResults();
    const tableButton = wrapper.findAll("button").find((b) => b.text() === "Table");
    await tableButton!.trigger("click");

    // Alpha Speed: score=5, weighted=25
    expect(wrapper.text()).toContain("=25");
    // Alpha Cost: score=3, weighted=3
    expect(wrapper.text()).toContain("=3");
  });
});
