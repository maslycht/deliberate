import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
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

describe("App", () => {
  it("renders the app shell with Deliberate title", async () => {
    const wrapper = mount(App, {
      global: { plugins: [router] },
    });
    await router.isReady();
    expect(wrapper.text()).toContain("Deliberate");
  });
});
