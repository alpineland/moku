import pkg from './package.json'
import fs from 'fs'
import path from 'path'
import { builtinModules } from 'module'
import { defineConfig } from 'rollup'

fs.rmSync('./dist', { recursive: true, force: true })

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
  ]
  const filtered = Object.fromEntries(
    Object.entries(pkg).filter(([k]) => fields.includes(k)),
  )
  return {
    writeBundle() {
      fs.writeFileSync('./dist/package.json', JSON.stringify(filtered))
    },
  }
}

/**
 * @param {import('rollup').InputOption} input
 * @param {string} outDir
 */
function config(input, outDir) {
  return defineConfig({
    input: input,
    output: {
      dir: outDir,
      entryFileNames: '[name].js',
      chunkFileNames: '_[name]_[hash].js',
      format: 'esm',
      generatedCode: 'es2015',
    },
    external,
    plugins: [
      injectModulePath(),
      pkgJSON(),
      { transform: (code) => code.replace(/__VERSION__/g, pkg.version) },
      {
        writeBundle(opts) {
          fs.writeFileSync(
            path.join(opts.dir, 'index.d.ts'),
            `export * from './mod'`,
          )
        },
      },
    ],
  })
}

export default [
  config(['./src/client/mod.js'], './dist/client'),
  config(['./src/vite/mod.js', './src/vite/cli.js'], './dist/vite'),
  config(['./src/globals/mod.js'], './dist/globals'),
]
