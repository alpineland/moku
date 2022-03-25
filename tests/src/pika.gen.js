// DO NOT EDIT. Generated by "pika:routes" plugin of Pika.
// This file should be checked into version control.

export const routes = [
  {
    path: '/:user/:repo',
    component: () => import('./routes/$user/$repo.vue'),
    props: true,
  },
  {
    path: '/:user',
    component: () => import('./routes/$user/index.vue'),
    props: true,
  },
  {
    path: '/about',
    component: () => import('./routes/about.vue'),
    props: true,
  },
  {
    path: '/',
    component: () => import('./routes/index.vue'),
    props: true,
  },
]

export const endpoints = [
  {
    path: '/:user/:repo',
    component: () => import('./routes/$user/$repo.js'),
  },
]