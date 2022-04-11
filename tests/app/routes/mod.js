import { views as _user } from './_user/mod.js';

const c = () => import('./_user/_repo.js');

/** @type {import('vue-router').RouteRecordRaw[]} */
export const views = [
  {
    path: '/',
    component: () => import('./index.vue'),
    props: true,
  },
  {
    path: '/about',
    component: () => import('./about.vue'),
    props: true,
  },
  ..._user,
];

export const endpoints = [
  {
    pathname: '/:user/:repo',
    load: c,
    search: '_data=raw',
  },
  {
    pathname: '/:user/nested/child',
    load: () => import('./_user/nested/child.js'),
  },
];
