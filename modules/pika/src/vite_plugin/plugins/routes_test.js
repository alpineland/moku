import * as assert from 'uvu/assert'
import { toRoutePath } from './routes.js'
import { suite } from 'uvu'

const routePath = suite('toRoutePath')
const routePathFixtures = [
  ['index.vue', '/'],
  ['$id.vue', '/:id'],
  ['$.vue', '/:*'],
  ['dot.$id.vue', '/dot.:id'],
  ['dash-$id.vue', '/dash-:id'],
  ['nested/$id.vue', '/nested/:id'],
  ['nested/$.vue', '/nested/:*'],
  ['nested/dot.$id.vue', '/nested/dot.:id'],
  ['nested/dot.$.vue', '/nested/dot.:*'],
  ['nested/dash-$id.vue', '/nested/dash-:id'],
  ['nested/dash-$.vue', '/nested/dash-:*'],
  ['$dynamic/nested/$id.vue', '/:dynamic/nested/:id'],
  ['$dynamic/nested/$.vue', '/:dynamic/nested/:*'],
  ['static/user.vue', '/static/user'],
  ['static/index.vue', '/static'],
]

for (const [raw, expected] of routePathFixtures) {
  routePath(`${raw} -> ${expected}`, () => {
    assert.equal(toRoutePath(raw, '.'), expected)
  })
}

routePath('Invalid route', () => {
  assert.throws(() => toRoutePath('$$id.vue', '.'), 'Invalid route file')
})

routePath.run()
