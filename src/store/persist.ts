import { openDB } from "idb"

const db = () =>
  openDB("astrax", 1, {
    upgrade(d) {
      d.createObjectStore("kv")
    },
  })
export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    return (await (await db()).get("kv", key)) as T | undefined
  } catch {
    return undefined
  }
}
export async function idbSet(key: string, val: unknown) {
  try {
    await (await db()).put("kv", JSON.parse(JSON.stringify(val)), key)
  } catch {
    /* storage unavailable */
  }
}
export async function idbCount() {
  try {
    return await (await db()).count("kv")
  } catch {
    return 0
  }
}
export async function idbClear() {
  try {
    await (await db()).clear("kv")
  } catch {
    /* noop */
  }
}
