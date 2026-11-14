#!/usr/bin/env node
/**
 * Report whether each recorded compaction checkpoint carries the rendered
 * summary image, straight from a DSH home's session logs.
 *
 * Session logs are `session.v4.jsonl.zstd`: an append-only sequence of
 * independent zstd frames, one per write, so a single decompress call only
 * yields the first frame. This script walks the frame boundaries and decodes
 * every frame before parsing the JSONL events.
 *
 * Usage:
 *   node scripts/check-checkpoint-images.mjs [--home <dshHome>] [--session <idPrefix>]
 *
 * Defaults to $DSH_HOME, then <cwd>/.dsh-dev, then ~/.dsh.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { zstdDecompressSync } from 'node:zlib'

const ZSTD_MAGIC = Buffer.from([0x28, 0xb5, 0x2f, 0xfd])

function parseArgs(argv) {
  const out = { home: undefined, session: undefined }
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--home') out.home = argv[++i]
    else if (argv[i] === '--session') out.session = argv[++i]
  }
  return out
}

/** Every byte offset where a zstd frame magic starts. */
function frameStarts(buffer) {
  const starts = []
  for (let at = buffer.indexOf(ZSTD_MAGIC); at !== -1; at = buffer.indexOf(ZSTD_MAGIC, at + 4)) starts.push(at)
  return starts
}

/** Decode an append-only multi-frame zstd file. */
function decodeFrames(buffer) {
  const starts = frameStarts(buffer)
  const chunks = []
  for (let i = 0; i < starts.length; i += 1) {
    const begin = starts[i]
    let end = i + 1 < starts.length ? starts[i + 1] : buffer.length
    // A magic sequence can appear inside compressed bytes; extend the window
    // until the frame actually decodes instead of trusting the boundary.
    for (let attempt = i + 1; ; attempt += 1) {
      try {
        chunks.push(zstdDecompressSync(buffer.subarray(begin, end)))
        break
      } catch {
        if (attempt >= starts.length) throw new Error(`cannot decode the zstd frame starting at byte ${begin}`)
        end = attempt + 1 < starts.length ? starts[attempt + 1] : buffer.length
      }
    }
  }
  return Buffer.concat(chunks).toString('utf8')
}

function resolveHome(explicit) {
  for (const candidate of [explicit, process.env.DSH_HOME, join(process.cwd(), '.dsh-dev'), join(homedir(), '.dsh')]) {
    if (candidate !== undefined && candidate !== '' && existsSync(join(candidate, 'sessions'))) return candidate
  }
  throw new Error('no DSH home with a sessions/ directory found; pass --home <dshHome>')
}

/** Walk every session log under <home>/sessions. */
function sessionLogs(home) {
  const root = join(home, 'sessions')
  const logs = []
  for (const workspace of readdirSync(root)) {
    const workspacePath = join(root, workspace)
    if (!statSync(workspacePath).isDirectory()) continue
    for (const session of readdirSync(workspacePath)) {
      const log = join(workspacePath, session, 'session.v4.jsonl.zstd')
      if (existsSync(log)) logs.push({ session, log, mtime: statSync(log).mtime })
    }
  }
  return logs.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
}

/** One line per content block, with the facts that decide the verdict. */
function describeBlock(block) {
  if (block?.type === 'text') return `text(${String(block.text ?? '').length} chars)`
  if (block?.type === 'image') {
    const ref = block.attachment ?? {}
    return `image ${ref.mediaType ?? '?'} ${ref.width ?? '?'}x${ref.height ?? '?'} ${ref.bytes ?? '?'}B name=${ref.name ?? '-'}`
  }
  return String(block?.type ?? '?')
}

const args = parseArgs(process.argv.slice(2))
const home = resolveHome(args.home)
const logs = sessionLogs(home).filter((entry) => args.session === undefined || entry.session.includes(args.session))
if (logs.length === 0) {
  console.log(`no session logs under ${join(home, 'sessions')}`)
  process.exit(0)
}

let checkpoints = 0
let withImages = 0
for (const entry of logs) {
  let events
  try {
    events = decodeFrames(readFileSync(entry.log)).split('\n').filter(Boolean).map((line) => JSON.parse(line))
  } catch (error) {
    console.log(`\n${entry.session}: cannot decode (${error.message})`)
    continue
  }
  const found = events.filter((event) => {
    const body = event.data ?? event
    return event.type === 'user/message' && body.source?.kind === 'compact-checkpoint'
  })
  if (found.length === 0) continue
  console.log(`\n${entry.session}  (${entry.mtime.toISOString()})`)
  for (const event of found) {
    checkpoints += 1
    const body = event.data ?? event
    const blocks = body.content ?? body.message?.content ?? []
    const images = blocks.filter((block) => block.type === 'image')
    if (images.length > 0) withImages += 1
    console.log(`  seq ${event.seq ?? '?'} compaction ${String(body.source?.compactionId ?? '?').slice(0, 8)}: ${images.length > 0 ? 'IMAGE ATTACHED' : 'text only'} (${images.length} image block(s))`)
    for (const block of blocks) console.log(`    - ${describeBlock(block)}`)
  }
}

console.log(`\n${checkpoints} checkpoint(s) found, ${withImages} with image block(s), ${checkpoints - withImages} text only`)
if (checkpoints > 0 && withImages === checkpoints) console.log('verdict: summaryImage is attaching the rendered checkpoint')
else if (checkpoints > 0) console.log('verdict: at least one checkpoint is text only (summaryImage off, or an unsupported mode, or handoff)')
