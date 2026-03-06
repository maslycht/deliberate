import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "setup",
      component: () => import("@/views/SetupView.vue"),
    },
    {
      path: "/score",
      name: "score",
      component: () => import("@/views/ScoringView.vue"),
    },
    {
      path: "/results",
      name: "results",
      component: () => import("@/views/ResultsView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: "/",
    },
  ],
});

export default router;
