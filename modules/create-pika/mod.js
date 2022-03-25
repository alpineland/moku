/* eslint no-console: 0 */

import fs from 'fs'
import path from 'path'
import prompts from 'prompts'

async function main() {
  const cwd = process.cwd()
  const templates = ['js', 'ts']

  try {
    const { name } = await prompts({
      name: 'name',
      type: 'text',
      message: 'Project name to create',
      initial: 'pika-app',
    })

    if (fs.existsSync(name)) {
      const { yes } = await prompts({
        name: 'yes',
        type: 'confirm',
        message: `Directory ${name} exists. Continue?`,
        initial: false,
      })

      if (yes) rem(name)
      else process.exit(1)
    }

    const { template } = await prompts(
      [
        {
          name: 'template',
          type: 'select',
          message: 'Choose a template',
          choices: fs
            .readdirSync('.')
            .map((v) => {
              if (templates.includes(v)) {
                return {
                  title: v === 'js' ? 'JavaScript' : 'TypeScript',
                  value: v,
                  selected: v === 'js' ? true : false,
                }
              }
            })
            .filter((v) => v),
        },
      ],
      { onCancel: () => process.exit(1) },
    )

    const dest = path.relative(cwd, name)
    fs.mkdirSync(dest)
    await copy(template, dest)
    console.log(`\nScaffolding project in ${dest}...\n`)
    const pkgJSONPath = path.join(dest, 'package.json')
    const pkgJSON = JSON.parse(fs.readFileSync(pkgJSONPath))
    pkgJSON.name = dest
    fs.writeFileSync(pkgJSONPath, JSON.stringify(pkgJSON, null, 2))
    fs.renameSync(path.join(dest, '_gitignore'), path.join(dest, '.gitignore'))

    let i = 1

    console.log(`${i}. cd ${dest}`)
    console.log(`${++i}. pnpm i`)
    console.log(`${++i}. pnpm dev`)
  } catch (e) {
    console.error(e.message)
  }
}

async function copy(src, dest) {
  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    await copyDir(src, dest)
  } else {
    fs.copyFileSync(src, dest)
  }
}

async function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  const files = await fs.promises.opendir(src)
  for await (const file of files) {
    copy(path.resolve(src, file.name), path.resolve(dest, file.name))
  }
}

/** @param {string} dir */
function rem(dir) {
  fs.rmSync(dir, { recursive: true, force: true })
}

main().catch((e) => console.error(e))
