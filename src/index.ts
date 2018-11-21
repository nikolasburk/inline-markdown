import * as fs from 'fs'
import * as path from 'path'
import * as recursive from 'recursive-readdir'
import mkdirp = require('mkdirp')

export function inlineMarkdown(filePath: string): string {
  const dirname = path.dirname(filePath)
  const body = fs.readFileSync(filePath, 'utf8')

  const re = RegExp(/\_\_INLINE\(.*\)\_\_/g)
  const matches = body.match(re)
  const fragmentFileNames = matches.map(match => match.slice(9, -3))
  const importedFragments = fragmentFileNames.map(f =>
    fs.readFileSync(path.resolve(path.join(dirname, f)), 'utf8'),
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
    console.log(file)
    const basename = path.basename(file).toLowerCase()
    return (
      basename === 'node_modules' ||
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

    fs.writeFileSync(filePath, body, {
      encoding: 'utf8',
    })

    console.log(`Created ${path.relative(outputDir, filePath)}`)
  })

  console.log(outputList)
}

processDir(
  '/Users/nikolasburk/prisma/github/inline-markdown',
  '/Users/nikolasburk/prisma/github/inline-markdown/output',
).catch(x => console.error(x))
