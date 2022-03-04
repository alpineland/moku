// This script requires `chlog` to be installed for generating changelog.
// chlog: https://github.com/ydcjeff/chlog

/* eslint no-console: 0 */
import path from 'path'
import prompts from 'prompts'
import semver from 'semver'
import { spawnSync } from 'child_process'
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { createRequire } from 'module'

async function main() {
  const modules = readdirSync('./modules')

  /** @type {import('semver').ReleaseType[]} */
  const increments = [
    'major',
    'minor',
    'patch',
    'premajor',
    'preminor',
    'prepatch',
    'prerelease',
  ]

  const log = console.log
  const run = (bin, args) => {
    const { stderr, stdout, error } = spawnSync(bin, args)
    if (stderr) console.log(stderr.toString())
    if (stdout) console.log(stdout.toString())
    if (error) throw error
  }

  const { mod } = await prompts({
    type: 'select',
    name: 'mod',
    message: 'Select module',
    choices: modules.map((i) => ({ value: i, title: i })),
  })

  if (!mod) return

  const require = createRequire(import.meta.url)
  const pkgPath = path.join(process.cwd(), 'modules', mod)
  const pkgJSONPath = path.join(pkgPath, 'package.json')
  const pkgJSON = require(pkgJSONPath)

  const inc = (i) => semver.inc(pkgJSON.version, i, 'beta')

  const { release } = await prompts({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: increments.map((i) => ({
      value: inc(i),
      title: i + ' - ' + inc(i),
    })),
  })

  if (!semver.valid(release)) {
    throw new Error(`invalid target version: ${release}`)
  }

  const tag = `${pkgJSON.name}@${release}`

  const { yes } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${tag} Confirm?`,
  })

  if (!yes) return

  log('Updating module version...')
  updateVersion(pkgJSONPath, release)

  log('Generating changelog...')
  run('chlog', [
    '-o',
    path.join(pkgPath, 'CHANGELOG.md'),
    '-t',
    tag,
    '--commit-path',
    pkgPath,
  ])
  run('pnpm', ['prettier', '--write', path.join(pkgPath, 'CHANGELOG.md')])

  const { chlogOk } = await prompts({
    type: 'confirm',
    name: 'chlogOk',
    message: 'Changelog looks good?',
  })

  if (!chlogOk) return

  log('Committing changes...')
  run('git', ['add', '-A'])
  run('git', ['commit', '--no-verify', '-m', `release: ${tag}`])
  run('git', ['tag', tag])

  log('Pushing to GitHub...')
  run('git', ['push', '--tags'])
  run('git', ['push'])
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

function updateVersion(path, version) {
  const pkg = JSON.parse(readFileSync(path, 'utf-8'))
  pkg.version = version
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n')
}
