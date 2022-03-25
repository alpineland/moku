import fs from 'fs'
import path from 'path'

/**
 * @param {string} root
 * @param {string} template
 */
export function read_template(root, template) {
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
export function get_entry(config, entry, exts = ['.js', '.ts']) {
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
export function with_prefix(str, prefix) {
  return str.startsWith(prefix) ? str : prefix + str
}

/**
 * @param {string} str
 * @param {string} prefix
 */
export function without_prefix(str, prefix) {
  return str.startsWith(prefix) ? str.replace(prefix, '') : str
}

/**
 * @param {string} str
 * @param {string} suffix
 */
export function with_suffix(str, suffix) {
  return str.endsWith(suffix) ? str : str + suffix
}

/**
 * @param {string} str
 * @param {string} suffix
 */
export function without_suffix(str, suffix) {
  return str.endsWith(suffix) ? str.replace(suffix, '') : str
}

/** @param {string} str */
export function with_leading_slash(str) {
  return with_prefix(str, '/')
}

/** @param {string} str */
export function without_leading_slash(str) {
  return without_prefix(str, '/')
}

/** @param {string} str */
export function with_trailing_slash(str) {
  return with_suffix(str, '/')
}

/** @param {string} str */
export function without_trailing_slash(str) {
  return without_suffix(str, '/')
}
