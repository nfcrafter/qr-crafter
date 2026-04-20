import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

export default function QRPreviewPhone({ type, content, qrData, tab }) {
    const qrRef = useRef(null)
    const qrCode = useRef(null)

    useEffect(() => {
        qrCode.current = new QRCodeStyling({
            width: 200, height: 200, type: 'svg',
            data: qrData || 'https://qrcrafter.app',
            dotsOptions: { color: '#1A1265', type: 'rounded' },
            backgroundOptions: { color: '#EBEBDF' },
            cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
            cornersDotOptions: { color: '#1A1265' },
        })
        if (qrRef.current) {
            qrRef.current.innerHTML = ''
            qrCode.current.append(qrRef.current)
        }
    }, [])

    useEffect(() => {
        if (qrCode.current) {
            qrCode.current.update({ data: qrData || 'https://qrcrafter.app' })
        }
    }, [qrData])

    return (
        <div style={{
            background: '#1A1A2E', borderRadius: '40px', padding: '16px',
            width: '260px', margin: '0 auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
            {/* Notch */}
            <div style={{ background: '#000', borderRadius: '20px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                <div style={{ width: '60px', height: '8px', background: '#1A1A2E', borderRadius: '4px' }} />
            </div>

            {/* Écran */}
            <div style={{
                background: '#fff', borderRadius: '20px', minHeight: '420px',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
            }}>
                {tab === 'qrcode' ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '20px' }}>
                        <div ref={qrRef} style={{ borderRadius: '8px', overflow: 'hidden' }} />
                    </div>
                ) : (
                    <PhonePreviewContent type={type} content={content} />
                )}
            </div>

            {/* Barre home */}
            <div style={{ height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '8px' }}>
                <div style={{ width: '80px', height: '4px', background: '#444', borderRadius: '2px' }} />
            </div>
        </div>
    )
}

function PhonePreviewContent({ type, content }) {
    if (type === 'url') {
        return (
            <div style={{ padding: '16px' }}>
                <div style={{ background: 'var(--accent)', color: 'white', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', marginBottom: '12px', wordBreak: 'break-all' }}>
                    🌐 {content.url || 'https://votre-site.com'}
                </div>
                <div style={{ background: '#f5f5f5', borderRadius: '8px', height: '160px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '12px' }}>
                    Aperçu du site
                </div>
                <div style={{ height: '10px', background: '#eee', borderRadius: '4px', marginBottom: '6px' }} />
                <div style={{ height: '10px', background: '#eee', borderRadius: '4px', width: '70%' }} />
            </div>
        )
    }

    if (type === 'vcard') {
        return (
            <div>
                <div style={{ background: 'var(--accent)', padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>👤</div>
                    <div style={{ color: 'white', fontWeight: '700', fontSize: '15px' }}>{content.firstName || 'Prénom'} {content.lastName || 'Nom'}</div>
                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>{content.title || 'Titre'}</div>
                </div>
                <div style={{ padding: '16px' }}>
                    {content.phone && <div style={{ fontSize: '12px', color: '#333', marginBottom: '8px' }}>📞 {content.phone}</div>}
                    {content.email && <div style={{ fontSize: '12px', color: '#333', marginBottom: '8px' }}>✉️ {content.email}</div>}
                    {content.company && <div style={{ fontSize: '12px', color: '#333' }}>🏢 {content.company}</div>}
                </div>
            </div>
        )
    }

    if (type === 'whatsapp') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ background: '#075e54', color: 'white', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    <span style={{ fontSize: '13px', fontWeight: '600' }}>{content.phone || '+XX XX XX XX XX'}</span>
                </div>
                <div style={{ flex: 1, background: '#ECE5DD', padding: '12px' }}>
                    {content.message && (
                        <div style={{ background: '#DCF8C6', borderRadius: '8px', padding: '8px 10px', fontSize: '12px', maxWidth: '80%', marginLeft: 'auto' }}>
                            {content.message}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (type === 'wifi') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📶</div>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{content.ssid || 'Nom du réseau'}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>Rejoindre ce réseau Wi-Fi ?</div>
                <button style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 24px', fontSize: '13px', width: '100%' }}>
                    Se connecter
                </button>
            </div>
        )
    }

    if (type === 'social') {
        return (
            <div style={{ padding: '16px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-light)', margin: '16px auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📣</div>
                <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{content.name || 'Mon profil'}</div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '16px' }}>{content.platform || 'Réseau social'}</div>
                {content.url && (
                    <div style={{ background: 'var(--accent)', color: 'white', borderRadius: '8px', padding: '10px', fontSize: '12px' }}>
                        Voir le profil →
                    </div>
                )}
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#aaa', fontSize: '13px', textAlign: 'center', padding: '20px' }}>
            Sélectionnez un type de code QR sur la gauche
        </div>
    )
}