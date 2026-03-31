import { useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * Renders via portal to document.body so it sits above sidebar/scroll areas (see index.css .modal-overlay).
 */
export default function ConfirmDialog({
  open,
  onClose,
  title,
  subtitle,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  variant = 'danger',
}) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white border-0 shadow-lg shadow-red-900/40'
      : 'btn btn-primary'

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={() => !loading && onClose()}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl border border-white/15 bg-gradient-to-b from-[rgba(42,42,52,0.98)] to-[rgba(18,18,24,0.99)] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.55)] ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/10 px-6 py-4 flex items-start gap-4">
          <div
            className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              variant === 'danger' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'
            }`}
            aria-hidden
          >
            {variant === 'danger' ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id="confirm-dialog-title" className="text-lg font-semibold text-white leading-snug">
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm text-gray-400 leading-relaxed">{subtitle}</p>}
          </div>
        </div>
        {children && <div className="px-6 py-4 text-sm text-gray-300 leading-relaxed">{children}</div>}
        <div className="flex flex-col-reverse gap-2 border-t border-white/10 bg-black/20 px-6 py-4 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            className="btn btn-ghost w-full sm:w-auto border border-white/20"
            disabled={loading}
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn w-full sm:w-auto min-w-[120px] font-semibold ${confirmBtnClass}`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
