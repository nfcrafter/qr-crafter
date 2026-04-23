import { useState, useEffect, createContext, useContext, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const COLORS = {
        success: { bg: '#e8f5e9', border: '#4caf50', color: '#2e7d32', icon: '✅' },
        error: { bg: '#ffebee', border: '#f44336', color: '#c62828', icon: '❌' },
        warning: { bg: '#fff3e0', border: '#ff9800', color: '#e65100', icon: '⚠️' },
        info: { bg: '#e3f2fd', border: '#2196f3', color: '#1565c0', icon: 'ℹ️' },
    }

    return (
        <ToastContext.Provider value={addToast}>
            {children}
            <div style={{
                position: 'fixed', top: '24px', right: '24px',
                zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
                maxWidth: '360px', width: '100%',
            }}>
                {toasts.map(toast => {
                    const c = COLORS[toast.type] || COLORS.info
                    return (
                        <div key={toast.id} style={{
                            background: c.bg, border: `1px solid ${c.border}`,
                            borderLeft: `4px solid ${c.border}`,
                            borderRadius: '10px', padding: '14px 16px',
                            display: 'flex', alignItems: 'flex-start', gap: '10px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                            animation: 'slideIn 0.3s ease',
                        }}>
                            <span style={{ fontSize: '18px', flexShrink: 0 }}>{c.icon}</span>
                            <span style={{ flex: 1, fontSize: '14px', color: c.color, fontWeight: '500', lineHeight: '1.4' }}>
                                {toast.message}
                            </span>
                            <button onClick={() => removeToast(toast.id)} style={{
                                background: 'none', border: 'none', cursor: 'pointer',
                                color: c.color, fontSize: '16px', padding: '0', flexShrink: 0,
                                opacity: 0.6,
                            }}>✕</button>
                        </div>
                    )
                })}
            </div>
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%) }
          to { opacity: 1; transform: translateX(0) }
        }
      `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    return useContext(ToastContext)
}