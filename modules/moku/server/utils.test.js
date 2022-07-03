import * as assert from 'uvu/assert';
import { normalise_route } from './utils.js';
import { suite } from 'uvu';

const normalise_route_suite = suite('normalise_route');
/** @type {Record<string, { t: string, f: string }>} */
const normalise_route_fixtures = {
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

for (const pathname in normalise_route_fixtures) {
  const { t, f } = normalise_route_fixtures[pathname];

  normalise_route_suite(`normalise_route (true) ${pathname} -> ${t}`, () => {
    const actual = normalise_route(pathname, true);
    assert.equal(actual, t, `actual ${actual} !== expected ${t}`);
  });

  normalise_route_suite(`normalise_route (false) ${pathname} -> ${f}`, () => {
    const actual = normalise_route(pathname, false);
    assert.equal(actual, f, `actual ${actual} !== expected ${f}`);
  });
}

normalise_route_suite.run();
