import { useEffect, useRef } from 'react'
import QRCodeStyling from 'qr-code-styling'

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded']
const CORNER_STYLES = ['square', 'extra-rounded', 'dot']
const CORNER_DOT_STYLES = ['dot', 'square']

export default function Step3Appearance({ type, content, appearance, onChange, onBack, onSave }) {
    const qrRef = useRef(null)
    const qrCode = useRef(null)

    function buildQRData() {
        switch (type) {
            case 'url': return content.url || 'https://qrcrafter.app'
            case 'text': return content.text || 'QR Crafter'
            case 'email': return `mailto:${content.to || ''}?subject=${encodeURIComponent(content.subject || '')}`
            case 'phone': return `tel:${content.phone || ''}`
            case 'sms': return `smsto:${content.phone || ''}:${content.message || ''}`
            case 'whatsapp': return `https://wa.me/${(content.phone || '').replace(/\D/g, '')}`
            case 'wifi': return `WIFI:T:${content.security || 'WPA'};S:${content.ssid || ''};P:${content.password || ''};;`
            case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${content.firstName || ''} ${content.lastName || ''}\nTEL:${content.phone || ''}\nEND:VCARD`
            case 'social': return content.url || 'https://qrcrafter.app'
            default: return 'https://qrcrafter.app'
        }
    }

    useEffect(() => {
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, type: 'svg',
            data: buildQRData(),
            dotsOptions: { color: appearance.dotsColor, type: appearance.dotsType },
            backgroundOptions: { color: appearance.bgColor },
            cornersSquareOptions: { color: appearance.cornersColor, type: appearance.cornersType },
            cornersDotOptions: { color: appearance.cornersDotColor, type: appearance.cornersDotType },
            imageOptions: { crossOrigin: 'anonymous', margin: 8 },
        })
        if (qrRef.current) {
            qrRef.current.innerHTML = ''
            qrCode.current.append(qrRef.current)
        }
    }, [])

    useEffect(() => {
        if (qrCode.current) {
            qrCode.current.update({
                data: buildQRData(),
                dotsOptions: { color: appearance.dotsColor, type: appearance.dotsType },
                backgroundOptions: { color: appearance.bgColor },
                cornersSquareOptions: { color: appearance.cornersColor, type: appearance.cornersType },
                cornersDotOptions: { color: appearance.cornersDotColor, type: appearance.cornersDotType },
            })
        }
    }, [appearance, content])

    function update(key, value) {
        onChange({ ...appearance, [key]: value })
    }

    function downloadQR(format) {
        if (!qrCode.current) return
        qrCode.current.download({ name: 'qr-crafter', extension: format })
    }

    const ColorPicker = ({ label, valueKey }) => (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={appearance[valueKey]}
                    onChange={e => update(valueKey, e.target.value)}
                    style={{ width: '44px', height: '38px', padding: '2px', cursor: 'pointer', borderRadius: '6px' }}
                />
                <input type="text" value={appearance[valueKey]}
                    onChange={e => update(valueKey, e.target.value)}
                    style={{ flex: 1, fontFamily: 'monospace' }}
                />
            </div>
        </div>
    )

    const StylePicker = ({ label, valueKey, options }) => (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {options.map(opt => (
                    <button key={opt} onClick={() => update(valueKey, opt)}
                        style={{
                            padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                            border: appearance[valueKey] === opt ? 'none' : '1.5px solid var(--border)',
                            background: appearance[valueKey] === opt ? 'var(--accent)' : 'transparent',
                            color: appearance[valueKey] === opt ? 'white' : 'var(--text-light)',
                            fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)',
                            transition: 'all 0.2s',
                        }}>
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>

            {/* Colonne gauche */}
            <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>
                    3. Choisissez l'apparence du QR
                </h2>

                {/* Motif */}
                <div className="card" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                        Motif du code QR
                    </h3>
                    <StylePicker label="Style de motif" valueKey="dotsType" options={DOT_STYLES} />
                    <ColorPicker label="Couleur du motif" valueKey="dotsColor" />
                    <ColorPicker label="Couleur d'arrière-plan" valueKey="bgColor" />
                </div>

                {/* Coins */}
                <div className="card" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                        Coins du code QR
                    </h3>
                    <StylePicker label="Style de bordure des coins" valueKey="cornersType" options={CORNER_STYLES} />
                    <ColorPicker label="Couleur de bordure des coins" valueKey="cornersColor" />
                    <StylePicker label="Style des ronds dans les coins" valueKey="cornersDotType" options={CORNER_DOT_STYLES} />
                    <ColorPicker label="Couleur des ronds dans les coins" valueKey="cornersDotColor" />
                </div>

                {/* Logo */}
                <div className="card" style={{ marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                        Ajouter un logo
                    </h3>
                    <div className="field">
                        <label>Téléchargez votre logo (PNG, SVG, JPG — max 1Mo)</label>
                        <input type="file" accept="image/*"
                            onChange={e => {
                                const file = e.target.files[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = ev => {
                                    update('logo', ev.target.result)
                                    if (qrCode.current) {
                                        qrCode.current.update({ image: ev.target.result })
                                    }
                                }
                                reader.readAsDataURL(file)
                            }}
                        />
                    </div>
                    {appearance.logo && (
                        <button className="btn-ghost" style={{ fontSize: '13px' }}
                            onClick={() => {
                                update('logo', null)
                                if (qrCode.current) qrCode.current.update({ image: '' })
                            }}>
                            🗑 Supprimer le logo
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <button className="btn-ghost" onClick={onBack}>← Retour</button>
                    <button className="btn-primary" onClick={onSave} style={{ padding: '12px 32px', fontSize: '15px' }}>
                        ✓ Créer le QR Code
                    </button>
                </div>
            </div>

            {/* Colonne droite — aperçu QR */}
            <div style={{ position: 'sticky', top: '80px' }}>
                <div className="card" style={{ textAlign: 'center' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                        Aperçu
                    </h3>
                    <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }} />

                    {/* Export */}
                    <div>
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '12px' }}>Télécharger</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            {['png', 'svg', 'jpeg', 'webp'].map(fmt => (
                                <button key={fmt} className="btn-secondary"
                                    onClick={() => downloadQR(fmt)}
                                    style={{ padding: '8px', fontSize: '13px', textTransform: 'uppercase' }}>
                                    {fmt}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}