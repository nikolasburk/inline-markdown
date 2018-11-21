#!/usr/bin/env node

import * as cli from 'yargs'
import { processDir } from '.'

async function main() {
  const argv = cli
  .usage('inline-markdown')
  .option('input', {
    alias: 'i',
    string: true,
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    string: true,
    demandOption: true,
  }).argv

  await processDir(argv.input, argv.output)
}

main().catch(err => console.error(err))