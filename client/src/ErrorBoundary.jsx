import { Component } from 'react'

/**
 * Catches render errors so the site shows a message instead of a blank white page.
 */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[Bon Marché] render error:', error, info?.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-mint p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-card">
          <h1 className="font-head text-2xl font-extrabold text-brand-700">ขออภัย หน้าเว็บโหลดไม่สำเร็จ</h1>
          <p className="mt-2 text-sm text-muted">กรุณาโหลดหน้าใหม่อีกครั้ง</p>
          <pre className="mt-4 overflow-auto rounded-lg bg-brand-50 p-3 text-left text-xs text-brand-900">
            {String(this.state.error?.message || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            โหลดใหม่
          </button>
        </div>
      </div>
    )
  }
}
