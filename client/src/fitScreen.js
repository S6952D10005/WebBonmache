/**
 * Keeps the layout proportional on large screens.
 * Content is designed at 1200px; on screens ≥ 1536px it is zoomed so it
 * fills ≈ 83% of the screen width (same ratio as 1600px on a 1920px screen).
 * The nav bar grows by 30% of that amount so it doesn't get too big.
 */
const DESIGN_WIDTH = 1440 // screen width at which zoom = 1
const NAV_GROWTH = 0.3

function update() {
  const w = document.documentElement.clientWidth
  const zoom = Math.max(1, w / DESIGN_WIDTH)
  const navZoom = 1 + (zoom - 1) * NAV_GROWTH
  const root = document.documentElement.style
  root.setProperty('--bm-zoom', zoom.toFixed(4))
  root.setProperty('--nav-zoom', navZoom.toFixed(4))
}

export function fitScreen() {
  update()
  window.addEventListener('resize', update, { passive: true })
}
