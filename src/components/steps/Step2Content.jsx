import { useState } from 'react'
import QRPreviewPhone from '../QRPreviewPhone.jsx'
import UrlForm from '../forms/UrlForm.jsx'
import VCardForm from '../forms/VCardForm.jsx'
import WiFiForm from '../forms/WiFiForm.jsx'
import WhatsAppForm from '../forms/WhatsAppForm.jsx'
import SocialForm from '../forms/SocialForm.jsx'
import TextForm from '../forms/TextForm.jsx'
import EmailForm from '../forms/EmailForm.jsx'
import PhoneForm from '../forms/PhoneForm.jsx'
import SMSForm from '../forms/SMSForm.jsx'

export default function Step2Content({ type, content, onChange, onBack, onNext }) {
    const [previewTab, setPreviewTab] = useState('apercu')

    function buildQRData() {
        switch (type) {
            case 'url': return content.url || ''
            case 'text': return content.text || ''
            case 'email': return `mailto:${content.to || ''}?subject=${encodeURIComponent(content.subject || '')}&body=${encodeURIComponent(content.body || '')}`
            case 'phone': return `tel:${content.phone || ''}`
            case 'sms': return `smsto:${content.phone || ''}:${content.message || ''}`
            case 'whatsapp': return `https://wa.me/${(content.phone || '').replace(/\D/g, '')}${content.message ? `?text=${encodeURIComponent(content.message)}` : ''}`
            case 'wifi': return `WIFI:T:${content.security || 'WPA'};S:${content.ssid || ''};P:${content.password || ''};H:${content.hidden ? 'true' : 'false'};;`
            case 'vcard': return buildVCard(content)
            case 'social': return content.url || ''
            default: return ''
        }
    }

    function buildVCard(c) {
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${c.firstName || ''} ${c.lastName || ''}\nTEL:${c.phone || ''}\nEMAIL:${c.email || ''}\nORG:${c.company || ''}\nTITLE:${c.title || ''}\nURL:${c.website || ''}\nADR:;;${c.address || ''};;;;\nNOTE:${c.note || ''}\nEND:VCARD`
    }

    function renderForm() {
        const props = { content, onChange }
        switch (type) {
            case 'url': return <UrlForm {...props} />
            case 'vcard': return <VCardForm {...props} />
            case 'wifi': return <WiFiForm {...props} />
            case 'whatsapp': return <WhatsAppForm {...props} />
            case 'social': return <SocialForm {...props} />
            case 'text': return <TextForm {...props} />
            case 'email': return <EmailForm {...props} />
            case 'phone': return <PhoneForm {...props} />
            case 'sms': return <SMSForm {...props} />
            default: return null
        }
    }

    const SAVE_CONTACT_TYPES = ['vcard', 'whatsapp', 'phone', 'sms', 'social']
    const showSaveContact = SAVE_CONTACT_TYPES.includes(type)

    function downloadVCF() {
        const c = content
        let vcard = `BEGIN:VCARD\nVERSION:3.0\n`
        if (type === 'vcard') {
            vcard += `FN:${c.firstName || ''} ${c.lastName || ''}\n`
            vcard += `TEL:${c.phone || ''}\n`
            vcard += `EMAIL:${c.email || ''}\n`
            vcard += `ORG:${c.company || ''}\n`
            vcard += `TITLE:${c.title || ''}\n`
            vcard += `URL:${c.website || ''}\n`
            vcard += `ADR:;;${c.address || ''};;;;\n`
            vcard += `NOTE:${c.note || ''}\n`
        } else if (type === 'whatsapp' || type === 'phone' || type === 'sms') {
            vcard += `FN:${c.contactName || 'Contact'}\n`
            vcard += `TEL:${c.phone || ''}\n`
        } else if (type === 'social') {
            vcard += `FN:${c.name || 'Contact'}\n`
            if (c.phone) vcard += `TEL:${c.phone}\n`
            if (c.email) vcard += `EMAIL:${c.email}\n`
            if (c.url) vcard += `URL:${c.url}\n`
        }
        vcard += `END:VCARD`
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${content.firstName || content.contactName || 'contact'}.vcf`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

            {/* Colonne gauche — formulaire */}
            <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>
                    2. Ajoutez du contenu à votre code QR
                </h2>

                {renderForm()}

                {/* Bouton Enregistrer le contact */}
                {showSaveContact && (
                    <div style={{
                        marginTop: '24px', padding: '20px',
                        background: 'var(--accent-light)', borderRadius: 'var(--radius-lg)',
                        border: '1.5px solid var(--accent)',
                    }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '8px', fontSize: '15px' }}>
                            👤 Enregistrer le contact
                        </h4>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '14px' }}>
                            Téléchargez une fiche contact (.vcf) — s'ouvre automatiquement dans l'app Contacts sur iOS et Android.
                        </p>
                        {(type === 'whatsapp' || type === 'phone' || type === 'sms') && !content.contactName && (
                            <div className="field">
                                <label>Nom du contact (optionnel)</label>
                                <input type="text" placeholder="Ex: Marie Dupont"
                                    value={content.contactName || ''}
                                    onChange={e => onChange({ ...content, contactName: e.target.value })}
                                />
                            </div>
                        )}
                        <button className="btn-primary" onClick={downloadVCF} style={{ width: '100%' }}>
                            ⬇ Télécharger la fiche contact (.vcf)
                        </button>
                    </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
                    <button className="btn-ghost" onClick={onBack}>← Retour</button>
                    <button className="btn-primary" onClick={onNext}>Suivant →</button>
                </div>
            </div>

            {/* Colonne droite — aperçu téléphone */}
            <div style={{ position: 'sticky', top: '80px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {['apercu', 'qrcode'].map(tab => (
                        <button key={tab} onClick={() => setPreviewTab(tab)}
                            style={{
                                padding: '8px 20px', borderRadius: 'var(--radius-pill)',
                                border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                                background: previewTab === tab ? 'var(--accent)' : 'var(--bg-white)',
                                color: previewTab === tab ? 'white' : 'var(--text-light)',
                                fontFamily: 'var(--font-body)',
                            }}>
                            {tab === 'apercu' ? 'Aperçu' : 'Code QR'}
                        </button>
                    ))}
                </div>
                <QRPreviewPhone type={type} content={content} qrData={buildQRData()} tab={previewTab} />
            </div>
        </div>
    )
}