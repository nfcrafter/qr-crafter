import { useEffect } from 'react'

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden'
        else document.body.style.overflow = ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    const sizes = {
        sm: '400px',
        md: '560px',
        lg: '720px',
        xl: '900px',
    }

    return (
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 1000, padding: '16px',
                backdropFilter: 'blur(4px)',
            }}
        >
            <div
                onClick={e => e.stopPropagation()}
                style={{
                    background: 'var(--bg-white)',
                    borderRadius: 'var(--radius-lg)',
                    width: '100%',
                    maxWidth: sizes[size],
                    maxHeight: '90vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                    animation: 'modalIn 0.2s ease',
                }}
            >
                {/* Header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '20px 24px', borderBottom: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    <h2 style={{
                        fontFamily: 'var(--font-display)', fontSize: '18px',
                        fontWeight: '700', color: 'var(--accent)', margin: 0,
                    }}>
                        {title}
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'var(--bg)', border: 'none', cursor: 'pointer',
                        width: '32px', height: '32px', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', color: 'var(--text-light)',
                        transition: 'background 0.2s',
                    }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--border)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--bg)'}
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                    {children}
                </div>
            </div>

            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95) }
          to { opacity: 1; transform: translateY(0) scale(1) }
        }
      `}</style>
        </div>
    )
}