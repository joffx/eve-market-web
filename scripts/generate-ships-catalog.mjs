#!/usr/bin/env node
/**
 * Generates data/ships-catalog.json from ESI (category 6 = Ship).
 * Usage: node scripts/generate-ships-catalog.mjs
 */
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const ESI = "https://esi.evetech.net"
const HEADERS = {
  Accept: "application/json",
  "User-Agent": "eve-market-web/1.0 (generate-ships-catalog)",
  "X-Compatibility-Date": "2025-09-30",
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, "../data/ships-catalog.json")
const SHIP_CATEGORY = 6
const CONCURRENCY = 12

async function esiGet(path) {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const res = await fetch(`${ESI}${path}`, { headers: HEADERS })
    if (res.status === 420 || res.status === 429) {
      const retry = Number(res.headers.get("Retry-After") ?? "2")
      await sleep(Math.max(retry, 1) * 1000)
      continue
    }
    if (!res.ok) {
      throw new Error(`${path} → ${res.status}`)
    }
    return res.json()
  }
  throw new Error(`Rate limited: ${path}`)
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      results[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

async function main() {
  console.log("Fetching ship category…")
  const category = await esiGet(`/universe/categories/${SHIP_CATEGORY}/`)
  const groupIds = category.groups ?? []
  console.log(`Groups: ${groupIds.length}`)

  const groups = await mapPool(groupIds, CONCURRENCY, async (groupId) => {
    const group = await esiGet(`/universe/groups/${groupId}/`)
    return group
  })

  const publishedGroups = groups.filter((g) => g?.published)
  console.log(`Published groups: ${publishedGroups.length}`)

  /** @type {Map<number, { groupId: number, groupName: string }>} */
  const typeMeta = new Map()
  for (const group of publishedGroups) {
    for (const typeId of group.types ?? []) {
      typeMeta.set(typeId, { groupId: group.group_id, groupName: group.name })
    }
  }

  const typeIds = [...typeMeta.keys()]
  console.log(`Candidate types: ${typeIds.length} — checking published…`)

  const published = []
  let done = 0
  await mapPool(typeIds, CONCURRENCY, async (typeId) => {
    try {
      const type = await esiGet(`/universe/types/${typeId}/`)
      done += 1
      if (done % 100 === 0 || done === typeIds.length) {
        console.log(`  types ${done}/${typeIds.length}`)
      }
      if (!type.published) return
      const meta = typeMeta.get(typeId)
      published.push({
        typeId,
        name: type.name,
        groupId: meta.groupId,
        groupName: meta.groupName,
      })
    } catch (err) {
      console.warn(`skip ${typeId}:`, err.message)
    }
  })

  published.sort((a, b) => a.name.localeCompare(b.name, "en"))
  writeFileSync(OUT, `${JSON.stringify(published)}\n`)
  console.log(`Wrote ${published.length} ships → ${OUT}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
