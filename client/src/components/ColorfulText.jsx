/**
 * Playful multi-colour title: every letter gets its own bright colour, letters
 * are packed tightly and overlap a little; `mix-blend-multiply` makes the
 * overlapping edges mix into a darker shade, like overlapping paint.
 * Spaces keep their width and don't use up a colour. Lines only break between
 * words, never inside a word.
 *
 * animated = "running lights":
 *   - the letters hop one after another (like bulbs on a marquee sign)
 *   - a white shine sweeps across the text
 *   (both stop for visitors who turned on "reduce motion")
 *
 * Screen readers read the plain text (aria-label); the coloured letters are hidden.
 */
const COLORS = [
  '#f0483e', // red
  '#f7931e', // orange
  '#8cc63f', // green
  '#00a3e0', // blue
  '#1f9285', // brand teal
  '#ec1c8c', // pink
  '#ffb81c', // yellow
  '#7f63c9', // purple
]

const LAYOUT = 'inline-flex flex-wrap items-baseline gap-x-[0.28em]'

export default function ColorfulText({ text, as: Tag = 'span', className = '', animated = false }) {
  const words = text.split(' ')

  // overlay = the transparent copy that carries the shine (same layout, same hops)
  const letters = (overlay) => {
    let n = 0
    return words.map((word, w) => (
      <span key={w} aria-hidden="true" className="inline-flex whitespace-nowrap">
        {[...word].map((ch, i) => {
          const index = n++
          return (
            <span
              key={i}
              style={{
                color: overlay ? 'transparent' : COLORS[index % COLORS.length],
                animationDelay: animated ? `${index * 0.07}s` : undefined,
              }}
              className={`-ml-[0.06em] first:ml-0 ${overlay ? '' : 'mix-blend-multiply'} ${
                animated ? 'motion-safe:animate-letter-hop' : ''
              }`}
            >
              {ch}
            </span>
          )
        })}
      </span>
    ))
  }

  return (
    <Tag aria-label={text} className={`relative ${LAYOUT} ${className}`}>
      {letters(false)}
      {animated && (
        <span
          aria-hidden="true"
          style={{ WebkitBackgroundClip: 'text', backgroundClip: 'text' }}
          className={`pointer-events-none absolute inset-0 ${LAYOUT} bg-[linear-gradient(110deg,transparent_38%,rgba(255,255,255,0.95)_50%,transparent_62%)] bg-[length:250%_100%] bg-no-repeat motion-safe:animate-text-shine motion-reduce:hidden`}
        >
          {letters(true)}
        </span>
      )}
    </Tag>
  )
}
