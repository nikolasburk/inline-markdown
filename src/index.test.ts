import test from 'ava'
import * as path from 'path'
import { inlineMarkdown } from '.'

test('simple test', t => {
  const expected = `\
# Hello World

I am a test.

## What do you like?

I like turtles 🐢

Good bye, world.`

  const inputFile = path.join(__dirname, '..', 'fixtures', 'simple', `README.md`)
  t.deepEqual(
    inlineMarkdown(inputFile),
    expected,
  )
})
