import * as fs from 'fs'
import * as path from 'path'
import * as recursive from 'recursive-readdir'
import mkdirp = require('mkdirp')

export function inlineMarkdown(filePath: string): string {
  const dirname = path.dirname(filePath)
  const body = fs.readFileSync(filePath, 'utf8')

  const re = RegExp(/\_\_INLINE\(.*\)\_\_/g)
  const matches = body.match(re)
  if (!matches) {
    return body
  }

  const fragmentFileNames = matches.map(match => match.slice(9, -3))
  const importedFragments = fragmentFileNames.map(f =>
    inlineMarkdown(path.resolve(path.join(dirname, f)))
  )

  const output = matches.reduce(
    (acc, match, index) => acc.replace(match, importedFragments[index]),
    body,
  )

  return output
}

export async function processDir(
  inputDir: string,
  outputDir: string,
): Promise<void> {
  const ignoreFunc = (file: string, stats: fs.Stats): boolean => {
    const basename = path.basename(file).toLowerCase()
    return (
      basename === 'node_modules' ||
      basename === '.git' ||
      (!stats.isDirectory() && basename !== 'readme.md')
    )
  }

  const readmes = await recursive(inputDir, [ignoreFunc])

  const outputList = readmes.map(readme => ({
    body: inlineMarkdown(readme),
    filePath: path.join(outputDir, path.relative(inputDir, readme)),
  }))

  outputList.forEach(({ body, filePath }) => {
    // create output folder if it doesn't exist
    mkdirp.sync(path.dirname(filePath))

    // make sure to delete file in case of casing renames (OSX limitation)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    fs.writeFileSync(filePath, body, {
      encoding: 'utf8',
    })

    console.log(`Created ${path.relative(outputDir, filePath)}`)
  })
}

