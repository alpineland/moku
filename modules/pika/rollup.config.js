import pkg from './package.json';
import fs from 'fs';
import path from 'path';
import { builtinModules } from 'module';
import { defineConfig } from 'rollup';

fs.rmSync('./dist', { recursive: true, force: true });

async function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    await copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

async function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const files = await fs.promises.opendir(src);
  for await (const file of files) {
    copy(path.resolve(src, file.name), path.resolve(dest, file.name));
  }
}

const format = 'es';
const external = [
  ...Object.keys(pkg.peerDependencies),
  ...Object.keys(pkg.dependencies),
  ...builtinModules,
];

/** @returns {import('rollup').Plugin} */
function module_path_comment() {
  const cwd = process.cwd();
  return {
    transform(code, id) {
      if (!id.includes('?')) {
        return '// ' + path.relative(cwd, id) + '\n' + code;
      }
    },
  };
}

/** @returns {import('rollup').Plugin} */
function pkg_json() {
  const fields = [
    'name',
    'description',
    'version',
    'type',
    'types',
    'bin',
    'files',
    'author',
    'license',
    'keywords',
    'engines',
    'exports',
    'dependencies',
    'peerDependencies',
  ];
  const filtered = Object.fromEntries(
    Object.entries(pkg).filter(([k]) => fields.includes(k)),
  );
  return {
    writeBundle() {
      fs.writeFileSync('./dist/package.json', JSON.stringify(filtered));
    },
  };
}

const plugins = [
  module_path_comment(),
  pkg_json(),
  { transform: (code) => code.replace(/__VERSION__/g, pkg.version) },
  {
    writeBundle(opts) {
      fs.writeFileSync(
        path.join(opts.dir, 'index.d.ts'),
        `export * from './mod';`,
      );
      copy('./types', './dist/types');
    },
  },
];

export default defineConfig([
  {
    input: ['./globals/mod.js'],
    output: {
      dir: './dist/globals',
      format,
    },
    external,
    plugins,
  },
  {
    input: ['./node/mod.js'],
    output: {
      dir: './dist/node',
      format,
    },
    external: (id) =>
      external.includes(id) || /globals|vite_plugin|vue_plugin/g.test(id),
    plugins,
  },
  {
    input: ['./server/mod.js'],
    output: {
      dir: './dist/server',
      format,
    },
    external: (id) =>
      external.includes(id) || /globals|vite_plugin|vue_plugin/g.test(id),
    plugins,
  },
  {
    input: ['./vite_plugin/mod.js', './vite_plugin/cli.js'],
    output: {
      dir: './dist/vite_plugin',
      format,
    },
    external: (id) =>
      external.includes(id) || /globals|server|vue_plugin/g.test(id),
    plugins,
  },
  {
    input: ['./vue_plugin/mod.js'],
    output: {
      dir: './dist/vue_plugin',
      format,
    },
    external: (id) =>
      external.includes(id) || /globals|server|vite_plugin/g.test(id),
    plugins,
  },
]);
