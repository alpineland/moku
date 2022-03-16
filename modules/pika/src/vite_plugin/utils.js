import fs from 'fs'
import path from 'path'

/**
 * @param {string} root
 * @param {string} template
 */
export function readTemplate(root, template) {
  template = path.relative(root, template)

  if (fs.existsSync(template)) {
    template = fs.readFileSync(template, 'utf-8')
    const placholders = ['<!-- vue.head -->', '<!-- vue.body -->']
    placholders.forEach((p) => {
      if (template.search(p) === -1) {
        throw new Error(`${template} is missing ${p}`)
      }
    })
    return template
  } else {
    throw new Error(`${template} does not exist`)
  }
}

/**
 * @param {string} dir
 * @param {RegExp} exclude
 * @returns {AsyncIterableIterator<string>}
 */
export async function* walk(dir, exclude) {
  const files = await fs.promises.opendir(dir)
  for await (const file of files) {
    if (!exclude.test(file.name)) {
      const entry = path.join(dir, file.name)
      if (file.isDirectory()) yield* walk(entry, exclude)
      else if (file.isFile()) yield entry
    }
  }
}

/** @param {string} dir */
export function mkdirp(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (/** @type {any} */ e) {
    if (e.code === 'EEXIST') return
    throw e
  }
}

/**
 * @param {import('vite').ResolvedConfig} config
 * @param {string} entry
 * @param {string[]} exts `['.js', '.ts']`
 * @returns {string} absolute entry
 */
export function getEntry(config, entry, exts = ['.js', '.ts']) {
  const { root } = config
  const absEntry = path.join(root, entry)
  const ext = exts.find((ext) => fs.existsSync(absEntry + ext))

  if (!ext) {
    throw new Error(`Missing "${entry}" in ${root}`)
  }

  return absEntry + ext
}

/**
 * @param {string} str
 * @param {string} prefix
 */
export function withPrefix(str, prefix) {
  return str.startsWith(prefix) ? str : prefix + str
}

/**
 * @param {string} str
 * @param {string} prefix
 */
export function withoutPrefix(str, prefix) {
  return str.startsWith(prefix) ? str.replace(prefix, '') : str
}

/**
 * @param {string} str
 * @param {string} suffix
 */
export function withSuffix(str, suffix) {
  return str.endsWith(suffix) ? str : str + suffix
}

/**
 * @param {string} str
 * @param {string} suffix
 */
export function withoutSuffix(str, suffix) {
  return str.endsWith(suffix) ? str.replace(suffix, '') : str
}

/** @param {string} str */
export function withLeadingSlash(str) {
  return withPrefix(str, '/')
}

/** @param {string} str */
export function withoutLeadingSlash(str) {
  return withoutPrefix(str, '/')
}

/** @param {string} str */
export function withTrailingSlash(str) {
  return withSuffix(str, '/')
}

/** @param {string} str */
export function withoutTrailingSlash(str) {
  return withoutSuffix(str, '/')
}
