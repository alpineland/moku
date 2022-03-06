import pkg from './package.json'
import fs from 'fs'
import path from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'rollup'

fs.rmSync('./dist', { recursive: true, force: true })

const format = 'esm'
const external = [
  ...Object.keys(pkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...builtinModules,
]

/** @returns {import('rollup').Plugin} */
function injectModulePath() {
  const cwd = process.cwd()
  return {
    transform(code, id) {
      if (!id.includes('?')) {
        return '// ' + path.relative(cwd, id) + '\n' + code
      }
    },
  }
}

/** @returns {import('rollup').Plugin} */
function pkgJSON() {
  const fields = [
    'name',
    'description',
    'version',
    'type',
    'bin',
    'files',
    'author',
    'license',
    'keywords',
    'engines',
    'exports',
    'dependencies',
    'peerDependencies',
    'publishConfig',
  ]
  const filtered = Object.fromEntries(
    Object.entries(pkg).filter(([k]) => {
      if (k === 'publishConfig') delete pkg[k].directory
      return fields.includes(k)
    }),
  )
  return {
    writeBundle() {
      fs.writeFileSync('./dist/package.json', JSON.stringify(filtered))
    },
  }
}

const plugins = [
  injectModulePath(),
  pkgJSON(),
  { transform: (code) => code.replace(/__VERSION__/g, pkg.version) },
  {
    writeBundle(opts) {
      fs.writeFileSync(
        path.join(opts.dir, 'index.d.ts'),
        `export * from './mod';`,
      )
    },
  },
]

export default defineConfig([
  {
    input: ['./src/universal/mod.js'],
    output: {
      dir: './dist/universal',
      format,
    },
    external,
    plugins,
  },
  {
    input: ['./src/globals/mod.js'],
    output: {
      dir: './dist/globals',
      format,
    },
    external,
    plugins,
  },
  {
    input: ['./src/server/mod.js'],
    output: {
      dir: './dist/server',
      format,
    },
    external,
    plugins,
  },
  {
    input: ['./src/vite/mod.js', './src/vite/cli.js'],
    output: {
      dir: './dist/vite',
      format,
    },
    external: [...external, '../globals/mod.js'],
    plugins,
  },
])
