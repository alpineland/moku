import { performance } from 'perf_hooks';
// @ts-expect-error
global.__vite_start_time = performance.now();

// eslint-disable-next-line @ydcjeff/isort
import pc from 'picocolors';
import { defineCommand, komando } from 'komando';
import { createRequire } from 'module';
import { createLogger } from 'vite';

/** @param {string[]} choices */
function oneOf(choices) {
  /** @param {import('vite').LogLevel} str */
  return (str) => {
    if (choices.includes(str)) {
      return str;
    }
    throw new Error(`invalid choice, choose from ${choices.join(' | ')}`);
  };
}

const globalFlags = {
  base: {
    typeFn: String,
    description: 'public base path',
    placeholder: 'path',
  },
  config: {
    typeFn: String,
    description: 'use specified vite config file',
    placeholder: 'file',
    short: 'c',
  },
  logLevel: {
    typeFn: oneOf(['info', 'warn', 'error', 'silent']),
    description: ['info', 'warn', 'error', 'silent'].join(' | '),
    placeholder: 'level',
    short: 'l',
  },
  mode: {
    typeFn: String,
    description: 'set env mode',
    short: 'm',
  },
};

const devCommand = defineCommand({
  name: 'dev',
  usage: '$ pika dev [root]',
  description: 'Start a dev server',
  args: { root: { nargs: '?' } },
  flags: {
    host: {
      typeFn: String,
      description: 'specify hostname',
    },
    port: {
      typeFn: Number,
      description: 'specify port',
    },
    https: {
      typeFn: Boolean,
      description: 'use TLS + HTTP/2',
    },
    cors: {
      typeFn: Boolean,
      description: 'enable CORS',
    },
    strictPort: {
      typeFn: Boolean,
      description: 'exit if specified port is already in use',
    },
    force: {
      typeFn: Boolean,
      description: 'force the optimizer to ignore the cache and re-bundle',
    },
    ...globalFlags,
  },
  async run(args, flags) {
    try {
      const { createServer } = await import('vite');
      const server = await createServer({
        root: args.root,
        base: flags.base,
        mode: flags.mode,
        configFile: flags.config,
        logLevel: flags.logLevel,
        server: cleanFlags(flags),
      });

      if (!server.httpServer) {
        throw new Error('HTTP server not available');
      }

      await server.listen();
      const info = server.config.logger.info;

      const require = createRequire(import.meta.url);
      const { version } = require('vite/package.json');

      info(
        pc.cyan(`\n  vite v${version}`) +
          ' + ' +
          pc.yellow('pika v__VERSION__') +
          pc.green(` dev server running at:\n`),
        { clear: !server.config.logger.hasWarned },
      );
      server.printUrls();

      // @ts-expect-error
      if (global.__vite_start_time) {
        // @ts-expect-error
        const startupDuration = performance.now() - global.__vite_start_time;
        info(`\n  ${pc.cyan(`ready in ${Math.ceil(startupDuration)}ms.`)}\n`);
      }
    } catch (e) {
      handleError(e, 'error when starting dev server', flags.logLevel);
    }
  },
});

const buildCommand = defineCommand({
  name: 'build',
  usage: '$ pika build [root]',
  description: 'Create a production build',
  args: { root: { nargs: '?' } },
  flags: {
    target: {
      typeFn: String,
      description: 'transpile target',
      defaultV: 'modules',
    },
    assetsInlineLimit: {
      typeFn: Number,
      description: 'static asset base64 inline threshold in bytes',
      placeholder: 'number',
      defaultV: 4096,
    },
    sourcemap: {
      typeFn: Boolean,
      description: 'output source maps for build',
    },
    manifest: {
      typeFn: Boolean,
      description: 'emit build manifest json',
    },
    watch: {
      typeFn: Boolean,
      description: 'rebuilds when modules have changed on disk',
    },
    ...globalFlags,
  },
  async run(args, flags) {
    try {
      const { build } = await import('vite');
      await build({
        root: args.root,
        base: flags.base,
        mode: flags.mode,
        configFile: flags.config,
        logLevel: flags.logLevel,
        build: cleanFlags(flags),
      });
      await build({
        root: args.root,
        base: flags.base,
        mode: flags.mode,
        configFile: flags.config,
        logLevel: flags.logLevel,
        build: { ...cleanFlags(flags), ssr: true },
      });
    } catch (e) {
      handleError(e, 'error during build', flags.logLevel);
    }
  },
});

const previewCommand = defineCommand({
  name: 'preview',
  usage: '$ pika preview [root]',
  description: 'Preview the production built app',
  args: { root: { nargs: '?' } },
  flags: {
    host: {
      typeFn: String,
      description: 'specify hostname',
    },
    port: {
      typeFn: Number,
      description: 'specify port',
    },
    strictPort: {
      typeFn: Boolean,
      description: 'exit if specified port is already in use',
    },
    https: {
      typeFn: Boolean,
      description: 'use TLS + HTTP/2',
    },
    ...globalFlags,
  },
  async run(args, flags) {
    try {
      const { preview } = await import('./preview.js');
      await preview({
        root: args.root,
        host: flags.host,
        port: flags.port,
      });
    } catch (e) {
      handleError(e, 'error when starting preview server', flags.logLevel);
    }
  },
});

komando({
  name: 'pika',
  version: '__VERSION__',
  commands: [devCommand, buildCommand, previewCommand],
});

/**
 *
 * @param {unknown} e
 * @param {string} msg
 * @param {import('vite').LogLevel | undefined} logLevel
 */
function handleError(e, msg, logLevel) {
  createLogger(logLevel).error(
    // @ts-expect-error unknown is not assignable to Error.
    pc.red(`${msg}:\n${e.stack}`),
    // @ts-expect-error unknown is not assignable to Error.
    { error: e },
  );
  process.exit(1);
}

/** @param {any} flags */
function cleanFlags(flags) {
  const res = { ...flags };
  delete res.base;
  delete res.config;
  delete res.logLevel;
  delete res.mode;
  return res;
}
