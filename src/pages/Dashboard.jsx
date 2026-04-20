import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Sidebar from '../components/Sidebar.jsx'
import QRCodeStyling from 'qr-code-styling'

export default function Dashboard() {
    const navigate = useNavigate()
    const [qrCodes, setQrCodes] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterType, setFilterType] = useState('')

    useEffect(() => {
        loadQRCodes()
    }, [])

    async function loadQRCodes() {
        setLoading(true)
        const { data } = await supabase
            .from('qr_codes')
            .select('*')
            .order('created_at', { ascending: false })
        setQrCodes(data || [])
        setLoading(false)
    }

    async function deleteQR(id) {
        await supabase.from('qr_codes').delete().eq('id', id)
        setQrCodes(prev => prev.filter(q => q.id !== id))
    }

    async function downloadQR(qr) {
        const app = qr.appearance || {}
        const qrCode = new QRCodeStyling({
            width: 512, height: 512, type: 'svg',
            data: `${window.location.origin}/r/${qr.slug}`,
            dotsOptions: { color: app.dotsColor || '#1A1265', type: app.dotsType || 'rounded' },
            backgroundOptions: { color: app.bgColor || '#EBEBDF' },
            cornersSquareOptions: { color: app.cornersColor || '#1A1265', type: app.cornersType || 'extra-rounded' },
            cornersDotOptions: { color: app.cornersDotColor || '#1A1265', type: app.cornersDotType || 'dot' },
        })
        qrCode.download({ name: qr.name || 'qr-crafter', extension: 'png' })
    }

    const filtered = qrCodes.filter(q => {
        const matchSearch = (q.name || '').toLowerCase().includes(search.toLowerCase())
        const matchType = filterType ? q.type === filterType : true
        return matchSearch && matchType
    })

    const TYPE_LABELS = {
        url: 'Site internet', vcard: 'vCard', wifi: 'Wi-Fi',
        whatsapp: 'WhatsApp', social: 'Réseaux sociaux',
        text: 'Texte', email: 'Email', phone: 'Téléphone', sms: 'SMS',
    }

    const TYPE_ICONS = {
        url: '🌐', vcard: '👤', wifi: '📶', whatsapp: '💬',
        social: '📣', text: '📝', email: '✉️', phone: '📞', sms: '💬',
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', color: 'var(--accent)' }}>
                        Mes codes QR
                    </h1>
                    <button className="btn-primary" onClick={() => navigate('/create')}>
                        ＋ Créer un code QR
                    </button>
                </div>

                {/* Filtres */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="🔍 Rechercher..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ maxWidth: '280px' }}
                    />
                    <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ maxWidth: '200px' }}>
                        <option value="">Tous les types</option>
                        <option value="url">Site internet</option>
                        <option value="vcard">vCard</option>
                        <option value="wifi">Wi-Fi</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="social">Réseaux sociaux</option>
                        <option value="text">Texte</option>
                        <option value="email">Email</option>
                        <option value="phone">Téléphone</option>
                        <option value="sms">SMS</option>
                    </select>
                </div>

                {/* Contenu */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-light)' }}>
                        Chargement...
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        textAlign: 'center', padding: '80px 20px',
                        background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)',
                        border: '2px dashed var(--border)',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                        <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '8px' }}>
                            Aucun code QR pour l'instant
                        </h3>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                            Créez votre premier QR code en cliquant sur le bouton ci-dessous
                        </p>
                        <button className="btn-primary" onClick={() => navigate('/create')}>
                            ＋ Créer un code QR
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filtered.map(qr => (
                            <div key={qr.id} style={{
                                background: 'var(--bg-white)', borderRadius: 'var(--radius-md)',
                                padding: '16px 20px', border: '1px solid var(--border)',
                                display: 'flex', alignItems: 'center', gap: '16px',
                                boxShadow: 'var(--shadow)',
                            }}>
                                {/* Icône */}
                                <div style={{
                                    width: '56px', height: '56px', background: 'var(--accent-light)',
                                    borderRadius: '10px', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', fontSize: '24px', flexShrink: 0,
                                }}>
                                    {TYPE_ICONS[qr.type] || '▣'}
                                </div>

                                {/* Infos */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span style={{
                                            fontSize: '11px', fontWeight: '600', color: 'var(--accent)',
                                            background: 'var(--accent-light)', padding: '2px 8px',
                                            borderRadius: 'var(--radius-pill)',
                                        }}>
                                            {TYPE_LABELS[qr.type] || qr.type}
                                        </span>
                                    </div>
                                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>
                                        {qr.name || 'Sans nom'}
                                    </h3>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                        {window.location.origin}/r/{qr.slug} · Créé le {new Date(qr.created_at).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>

                                {/* Scans */}
                                <div style={{ textAlign: 'center', minWidth: '60px' }}>
                                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent)' }}>
                                        {qr.scans || 0}
                                    </div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>Scans</div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                                    <button className="btn-ghost"
                                        onClick={() => {
                                            navigator.clipboard.writeText(`${window.location.origin}/r/${qr.slug}`)
                                            alert('URL copiée ! Collez-la dans votre app NFC.')
                                        }}
                                        style={{ padding: '8px 12px', fontSize: '13px' }}>
                                        📡 NFC
                                    </button>
                                    <button className="btn-ghost" onClick={() => navigate(`/edit/${qr.id}`)}
                                        style={{ padding: '8px 12px', fontSize: '13px' }}>
                                        ✏️
                                    </button>
                                    <button className="btn-primary" onClick={() => downloadQR(qr)}
                                        style={{ padding: '8px 14px', fontSize: '13px' }}>
                                        ⬇ PNG
                                    </button>
                                    <button onClick={() => {
                                        if (confirm('Supprimer ce QR code ?')) deleteQR(qr.id)
                                    }} style={{
                                        background: 'transparent', border: '1px solid #ffcdd2',
                                        color: '#e53935', borderRadius: 'var(--radius-sm)',
                                        padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                                    }}>
                                        🗑
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}