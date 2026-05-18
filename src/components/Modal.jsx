// src/components/Modal.jsx
import React from 'react';

export default function Modal({ isOpen, title, children, onClose, onConfirm, confirmText = "Confirmer", confirmColor = "#1A1265", type = "info" }) {
    if (!isOpen) return null;

    return (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div style={{ 
                background: 'white', padding: '32px', borderRadius: '24px', 
                maxWidth: '450px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                animation: 'modalSlideUp 0.3s ease'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {type === 'warning' && <span style={{ color: '#EF4444' }}>⚠️</span>}
                    {title}
                </h3>
                <div style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '32px', fontSize: '15px' }}>
                    {children}
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button 
                        style={{ 
                            flex: onConfirm ? 1 : 'none', 
                            minWidth: onConfirm ? 'auto' : '160px',
                            padding: '12px 24px', 
                            borderRadius: '14px', 
                            border: '1px solid #E2E8F0', 
                            background: '#F8FAFC', 
                            color: '#475569', 
                            fontWeight: '700', 
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'all 0.2s'
                        }} 
                        onClick={onClose}
                        onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#1E293B'; }}
                        onMouseOut={e => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#475569'; }}
                    >
                        {onConfirm ? 'Annuler' : 'Fermer'}
                    </button>
                    {onConfirm && (
                        <button 
                            style={{ 
                                flex: 1, padding: '12px 24px', borderRadius: '14px', border: 'none', 
                                background: type === 'warning' ? '#EF4444' : confirmColor, 
                                color: 'white', fontWeight: '700', cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s'
                            }} 
                            onClick={() => { onConfirm(); onClose(); }}
                        >
                            {confirmText}
                        </button>
                    )}
                </div>
            </div>
            <style>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}