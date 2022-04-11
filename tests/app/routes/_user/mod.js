const c = () => import("./_repo.js");

export const views = {
  path: "/:user",
  component: () => import("./index.vue"),
  props: true,
  children: [
    {
      path: "/nested",
      component: () => import("./nested/index.vue"),
      props: true
    },
    {
      path: "/:repo",
      component: () => import("./_repo.vue"),
      props: true,
      meta: {
        shadow: import.meta.env.SSR ? c : null
      }
    },
  ]
}
