import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useMatrixStore } from "../stores/matrix";

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("useMatrixStore", () => {
  describe("updateItemName", () => {
    it("updates the name of the matching item", () => {
      const store = useMatrixStore();
      store.addItem("Alpha", "some details");
      const id = store.items[0]!.id;

      store.updateItemName(id, "Renamed");

      expect(store.items[0]!.name).toBe("Renamed");
      expect(store.items[0]!.details).toBe("some details");
    });

    it("does not affect other items", () => {
      const store = useMatrixStore();
      store.addItem("Alpha", "");
      store.addItem("Beta", "");
      const id = store.items[0]!.id;

      store.updateItemName(id, "Renamed");

      expect(store.items[1]!.name).toBe("Beta");
    });

    it("preserves scores when updating the name", () => {
      const store = useMatrixStore();
      store.addItem("Alpha", "");
      const item = store.items[0]!;
      store.addCategory("Speed");
      store.setItemScore(item.id, store.categories[0]!.id, 4);

      store.updateItemName(item.id, "Renamed");

      expect(store.items[0]!.scores).toEqual({ [store.categories[0]!.id]: 4 });
    });
  });

  describe("updateItemDetails", () => {
    it("updates the details of the matching item", () => {
      const store = useMatrixStore();
      store.addItem("Alpha", "old details");
      const id = store.items[0]!.id;

      store.updateItemDetails(id, "new details");

      expect(store.items[0]!.details).toBe("new details");
      expect(store.items[0]!.name).toBe("Alpha");
    });

    it("does not affect other items", () => {
      const store = useMatrixStore();
      store.addItem("Alpha", "details A");
      store.addItem("Beta", "details B");
      const id = store.items[0]!.id;

      store.updateItemDetails(id, "changed");

      expect(store.items[1]!.details).toBe("details B");
    });

    it("can clear details by setting an empty string", () => {
      const store = useMatrixStore();
      store.addItem("Alpha", "has details");
      const id = store.items[0]!.id;

      store.updateItemDetails(id, "");

      expect(store.items[0]!.details).toBe("");
    });
  });
});
