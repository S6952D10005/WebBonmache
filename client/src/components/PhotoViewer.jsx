import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useI18n } from '../i18n'

/**
 * Full-screen picture viewer (Blog posts, About gallery).
 *   imgs = [{ img, caption }] · index = the picture shown · onIndex(i) · onClose()
 * ← → keys / buttons / a swipe go to the others; Esc or a click outside the picture closes it.
 */
export default function PhotoViewer({ imgs, index, onIndex, onClose }) {
  const { t } = useI18n()
  const img = imgs[index]
  const many = imgs.length > 1
  const go = useCallback((d) => onIndex((index + d + imgs.length) % imgs.length), [index, imgs.length, onIndex])
  const touch = useRef(null)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [go, onClose])

  if (!img) return null

  const arrow = (d, Icon, label, side) => (
    <button
      type="button"
      onClick={(e) => (e.stopPropagation(), go(d))}
      aria-label={label}
      className={`absolute top-1/2 ${side} z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20`}
    >
      <Icon className="size-6" strokeWidth={2} />
    </button>
  )

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('ภาพ {a} จาก {b}', { a: index + 1, b: imgs.length })}
      onClick={onClose}
      onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touch.current ?? e.changedTouches[0].clientX)
        touch.current = null
        if (many && Math.abs(dx) > 50) go(dx < 0 ? 1 : -1)
      }}
      className="fixed inset-0 z-[80] flex flex-col bg-[#0f0d0c]/95 text-white motion-safe:animate-[reveal-fade_.2s_ease-out]"
    >
      <div className="flex items-center justify-between px-4 py-3 text-[13px] tabular-nums text-white/70 sm:px-6">
        <span>
          {index + 1} / {imgs.length}
        </span>
        <button type="button" onClick={onClose} autoFocus aria-label={t('ปิด')} className="grid size-10 place-items-center rounded-full transition hover:bg-white/10">
          <X className="size-6" strokeWidth={2} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-20">
        <img
          key={img.img}
          src={img.img}
          alt={img.caption || ''}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-[4px] object-contain motion-safe:animate-[reveal-fade_.25s_ease-out]"
        />
        {many && arrow(-1, ChevronLeft, t('ก่อนหน้า'), 'left-2 sm:left-5')}
        {many && arrow(1, ChevronRight, t('ถัดไป'), 'right-2 sm:right-5')}
      </div>
      <p className="mx-auto min-h-[3.75rem] w-full max-w-[760px] px-5 py-4 text-center text-[14px] leading-[1.7] text-white/85">{img.caption}</p>
    </div>,
    document.body,
  )
}
