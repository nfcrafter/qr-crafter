import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

export default function QRModal({ card, onCopy, onDownload }) {
    const qrRef = useRef(null)
    const qrCode = useRef(null)
    const url = `${window.location.origin}/u/${card.card_id}`

    useEffect(() => {
        if (qrRef.current) {
            qrCode.current = new QRCodeStyling({
                width: 220, height: 220, type: 'svg',
                data: url,
                dotsOptions: { color: '#1A1265', type: 'rounded' },
                backgroundOptions: { color: '#EBEBDF' },
                cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
            })
            qrRef.current.innerHTML = ''
            qrCode.current.append(qrRef.current)
        }
    }, [])

    return (
        <div style={{ textAlign: 'center' }}>
            <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', boxShadow: 'var(--shadow-lg)' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>
                {url}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => onCopy(url, 'Lien NFC')} style={{ padding: '10px 16px', width: 'auto' }}>
                    📡 Copier lien
                </button>
                <button className="btn-primary" onClick={() => onDownload(card)} style={{ padding: '10px 16px', width: 'auto' }}>
                    ⬇ PNG
                </button>
            </div>
        </div>
    )
}