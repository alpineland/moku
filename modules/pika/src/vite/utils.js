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
