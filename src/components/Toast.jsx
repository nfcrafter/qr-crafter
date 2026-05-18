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
        success: { 
            bg: '#F0FDF4', 
            border: '#DCFCE7', 
            color: '#15803D', 
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><polyline points="20 6 9 17 4 12"></polyline></svg>` 
        },
        error: { 
            bg: '#FEF2F2', 
            border: '#FEE2E2', 
            color: '#B91C1C', 
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>` 
        },
        warning: { 
            bg: '#FFFBEB', 
            border: '#FEF3C7', 
            color: '#B45309', 
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>` 
        },
        info: { 
            bg: '#F0F9FF', 
            border: '#E0F2FE', 
            color: '#0369A1', 
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>` 
        },
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
                            <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: c.color, marginTop: '2px' }} dangerouslySetInnerHTML={{ __html: c.icon }} />
                            <span style={{ flex: 1, fontSize: '14px', color: c.color, fontWeight: '600', lineHeight: '1.4' }}>
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