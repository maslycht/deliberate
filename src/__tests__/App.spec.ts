import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue";

const stub = { template: "<div />" };

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "setup", component: stub },
    { path: "/score", name: "score", component: stub },
    { path: "/results", name: "results", component: stub },
  ],
});

beforeEach(() => {
  localStorage.clear();
  setActivePinia(createPinia());
});

describe("App", () => {
  it("renders the app shell with Deliberate title", async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const wrapper = mount(App, {
      global: { plugins: [router, pinia] },
    });
    await router.isReady();
    expect(wrapper.text()).toContain("Deliberate");
  });
});
