export function download(name: string, mime: string, data: BlobPart) {
  const a = document.createElement("a")
  a.href = URL.createObjectURL(new Blob([data], { type: mime }))
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}
export const exportJson = (name: string, obj: unknown) =>
  download(name, "application/json", JSON.stringify(obj, null, 2))

function wrap(s: string, n = 92) {
  const out: string[] = []
  let line = ""
  for (const w of s.split(" ")) {
    if ((line + " " + w).length > n) {
      out.push(line)
      line = w
    } else line = line ? line + " " + w : w
  }
  if (line) out.push(line)
  return out
}
const esc = (s: string) =>
  s.replace(/[()\\]/g, "\\$&").replace(/[^\x20-\x7e]/g, "")

export function exportPdf(
  name: string,
  title: string,
  sections: [string, string][],
) {
  const lines: [string, number][] = [[title, 18]]
  sections.forEach(([h, b]) => {
    lines.push(["", 8], [h.toUpperCase(), 10])
    wrap(b).forEach((l) => lines.push([l, 10]))
  })
  const pages: string[] = []
  let y = 800,
    cur = ""
  for (const [t, size] of lines) {
    if (y < 60) {
      pages.push(cur)
      cur = ""
      y = 800
    }
    cur += `BT /F1 ${size} Tf 50 ${y} Td (${esc(t)}) Tj ET\n`
    y -= size + 6
  }
  pages.push(cur)
  const objs: string[] = []
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>"
  objs[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${4 + i * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  pages.forEach((p, i) => {
    objs[4 + i * 2] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5 + i * 2} 0 R >>`
    objs[5 + i * 2] = `<< /Length ${p.length} >>\nstream\n${p}endstream`
  })
  let pdf = "%PDF-1.4\n"
  const off: number[] = []
  for (let i = 1; i < objs.length; i++) {
    off[i] = pdf.length
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`
  }
  const x = pdf.length
  pdf +=
    `xref\n0 ${objs.length}\n0000000000 65535 f \n` +
    off
      .slice(1)
      .map((o) => String(o).padStart(10, "0") + " 00000 n \n")
      .join("")
  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`
  download(name, "application/pdf", pdf)
}
