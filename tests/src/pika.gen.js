export const routes = [
  {
    path: '/:user/:repo',
    component: () => import('./routes/$user/$repo.vue'),
    name: '$user/$repo',
    meta: {
      endpoint: (endpoint = '/$user/$repo.js') =>
        import(
          /* @vite-ignore */ '/Users/ydc/gh/pika/tests/src/routes' + endpoint
        ),
    },
    props: true,
  },
  {
    path: '/:user',
    component: () => import('./routes/$user/index.vue'),
    name: '$user/index',
    meta: {
      endpoint: (endpoint = '/$user/index.js') =>
        import(
          /* @vite-ignore */ '/Users/ydc/gh/pika/tests/src/routes' + endpoint
        ),
    },
    props: true,
  },
  {
    path: '/about',
    component: () => import('./routes/about.vue'),
    name: 'about',
    meta: {
      endpoint: (endpoint = '/about.js') =>
        import(
          /* @vite-ignore */ '/Users/ydc/gh/pika/tests/src/routes' + endpoint
        ),
    },
    props: true,
  },
  {
    path: '/',
    component: () => import('./routes/index.vue'),
    name: 'index',
    meta: {
      endpoint: (endpoint = '/index.js') =>
        import(
          /* @vite-ignore */ '/Users/ydc/gh/pika/tests/src/routes' + endpoint
        ),
    },
    props: true,
  },
]
