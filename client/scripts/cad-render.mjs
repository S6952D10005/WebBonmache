/*
 * Debug picture of a DWG: every top-level group drawn from above in its own colour
 * with its name, plus a table of each group's size and height. Use it to see which
 * group is which building when a new drawing arrives (then update BUILDINGS in cad-map.mjs).
 *   node scripts/cad-render.mjs <file.dwg> <out.png>
 */
import sharp from 'sharp'
import { readGroups } from './lib/dwg.mjs'

const [file = 'asset/cad/market.dwg', out = 'cad-render.png'] = process.argv.slice(2)
const { segs, nested } = await readGroups(file)
const groups = [...segs.entries()].filter(([g]) => !g.includes('/'))

const ext = (list, i) => list.flatMap((s) => [s[i], s[i + 3]])
const all = groups.flatMap(([, l]) => l).filter((s) => Math.abs(s[0]) > 1 || Math.abs(s[1]) > 1) // skip stray bits at 0,0
const [x0, x1, y0, y1] = [Math.min(...ext(all, 0)), Math.max(...ext(all, 0)), Math.min(...ext(all, 1)), Math.max(...ext(all, 1))]
console.log(`extent x ${x0.toFixed(1)}..${x1.toFixed(1)}  y ${y0.toFixed(1)}..${y1.toFixed(1)}`)
console.log('group            lines    x0      x1      y0      y1     zmin  zmax  inside')
for (const [g, list] of groups) {
  const [xs, ys, zs] = [ext(list, 0), ext(list, 1), ext(list, 2)]
  const f = (v) => v.toFixed(1).padStart(7)
  console.log(`${g.padEnd(16)} ${String(list.length).padStart(5)} ${f(Math.min(...xs))} ${f(Math.max(...xs))} ${f(Math.min(...ys))} ${f(Math.max(...ys))} ${Math.min(...zs).toFixed(1).padStart(5)} ${Math.max(...zs).toFixed(1).padStart(5)}  ${(nested.get(g) || []).join(',')}`)
}

const W = 1600
const k = (W - 80) / (x1 - x0)
const H = Math.round((y1 - y0) * k + 80)
const px = (x, y) => [40 + (x - x0) * k, 40 + (y1 - y) * k] // north up
const colors = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324', '#469990', '#800000', '#808000', '#000075', '#e6a700', '#008080']
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="100%" height="100%" fill="#fff"/>`
const labels = []
groups.forEach(([g, list], i) => {
  const c = colors[i % colors.length]
  const d = list.map((s) => `M${px(s[0], s[1]).map((n) => n.toFixed(1)).join(' ')}L${px(s[3], s[4]).map((n) => n.toFixed(1)).join(' ')}`).join('')
  svg += `<path d="${d}" stroke="${c}" stroke-width="0.8" fill="none" opacity="0.8"/>`
  const [lx, ly] = px((Math.min(...ext(list, 0)) + Math.max(...ext(list, 0))) / 2, (Math.min(...ext(list, 1)) + Math.max(...ext(list, 1))) / 2)
  labels.push(`<text x="${lx}" y="${ly}" font-size="18" font-family="Arial" fill="${c}" stroke="#fff" stroke-width="4" paint-order="stroke" text-anchor="middle">${g}</text>`)
})
await sharp(Buffer.from(svg + labels.join('') + '</svg>')).png().toFile(out)
console.log('wrote', out)
