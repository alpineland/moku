const a = () => import('./a.server.js');

/** @type {import('vue-router').RouteRecordRaw[]} */
export const views = [
  {
    path: '/',
    component: () => import('./index.vue'),
    meta: {
      shadow: a,
    },
    children: [
      {
        path: ':profile',
        component: () => import('./nested.vue'),
        meta: {
          shadow: a,
        },
      },
    ],
  },
  {
    path: '/name',
    component: () => import('./index.vue'),
    meta: {
      shadow: a,
    },
    children: [
      {
        path: ':profile',
        component: () => import('./nested.vue'),
        meta: {
          shadow: a,
        },
      },
    ],
  },
  {
    path: '/about',
    component: () => import('./about.vue'),
    meta: {
      shadow: a,
    },
  },
];
