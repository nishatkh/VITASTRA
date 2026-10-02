import { deflateSync } from "node:zlib"
import { writeFileSync } from "node:fs"
const crcT = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
const crc = (b) => {
  let c = 0xffffffff
  for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (t, d) => {
  const l = Buffer.alloc(4)
  l.writeUInt32BE(d.length)
  const td = Buffer.concat([Buffer.from(t), d])
  const c = Buffer.alloc(4)
  c.writeUInt32BE(crc(td))
  return Buffer.concat([l, td, c])
}
function png(n) {
  const raw = Buffer.alloc((n * 4 + 1) * n)
  for (let y = 0; y < n; y++) {
    raw[y * (n * 4 + 1)] = 0
    for (let x = 0; x < n; x++) {
      const dx = x - n / 2 + 0.5,
        dy = y - n / 2 + 0.5,
        r = Math.hypot(dx, dy) / n
      let c = [17, 17, 17]
      if (r < 0.3 && r > 0.25) c = [247, 247, 247]
      if (r < 0.09) c = [255, 26, 26]
      const o = y * (n * 4 + 1) + 1 + x * 4
      raw[o] = c[0]
      raw[o + 1] = c[1]
      raw[o + 2] = c[2]
      raw[o + 3] = 255
    }
  }
  const ih = Buffer.alloc(13)
  ih.writeUInt32BE(n, 0)
  ih.writeUInt32BE(n, 4)
  ih[8] = 8
  ih[9] = 6
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ih),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ])
}
for (const n of [192, 512])
  writeFileSync(new URL(`../public/icon-${n}.png`, import.meta.url), png(n))
