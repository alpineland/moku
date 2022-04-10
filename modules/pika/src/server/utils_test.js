import * as assert from 'uvu/assert';
import { normalize_route } from './utils.js';
import { suite } from 'uvu';

const normalize_route_suite = suite('normalize_route');
/** @type {Record<string, { t: string, f: string }>} */
const normalize_route_fixtures = {
  // root route
  '/': {
    t: '/',
    f: '/',
  },
  '///': {
    t: '/',
    f: '/',
  },

  // child route
  '/1': {
    t: '/1/',
    f: '/1',
  },
  '/1/': {
    t: '/1/',
    f: '/1',
  },
  '/1///': {
    t: '/1/',
    f: '/1',
  },
  '///1///': {
    t: '/1/',
    f: '/1',
  },

  // nested route
  '/1/2': {
    t: '/1/2/',
    f: '/1/2',
  },
  '/1/2/': {
    t: '/1/2/',
    f: '/1/2',
  },
  '/1/2///': {
    t: '/1/2/',
    f: '/1/2',
  },
  '///1/2': {
    t: '/1/2/',
    f: '/1/2',
  },
  '///1/2///': {
    t: '/1/2/',
    f: '/1/2',
  },
  '///1///2///': {
    t: '/1/2/',
    f: '/1/2',
  },
  '///1///2': {
    t: '/1/2/',
    f: '/1/2',
  },
};

for (const pathname in normalize_route_fixtures) {
  const { t, f } = normalize_route_fixtures[pathname];

  normalize_route_suite(`normalize_route (true) ${pathname} -> ${t}`, () => {
    const actual = normalize_route(pathname, true);
    assert.equal(actual, t, `actual ${actual} !== expected ${t}`);
  });

  normalize_route_suite(`normalize_route (false) ${pathname} -> ${f}`, () => {
    const actual = normalize_route(pathname, false);
    assert.equal(actual, f, `actual ${actual} !== expected ${f}`);
  });
}

normalize_route_suite.run();
