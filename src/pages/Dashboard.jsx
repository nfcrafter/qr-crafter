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
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return navigate('/login')

        // Load profile for theme
        const { data: profile } = await supabase.from('profiles').select('theme_color').eq('id', user.id).single()
        if (profile?.theme_color) {
            document.documentElement.style.setProperty('--accent', profile.theme_color)
            document.documentElement.style.setProperty('--accent-light', profile.theme_color + '15')
        }

        await loadQRCodes()
    }

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
        url: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
        vcard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
        wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
        whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-10.6 8.38 8.38 0 0 1 3.8.9L21 3.5Z"></path></svg>`,
        social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path><path d="M10 12h.01"></path><path d="M13 18l5-5-5-5"></path></svg>`,
        text: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        email: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
        phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
        sms: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`,
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
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
                        <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: '#94A3B8' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` }} />
                        <input type="text" placeholder="Rechercher..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            style={{ width: '100%', paddingLeft: '38px' }}
                        />
                    </div>
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
                        <div style={{ width: 64, height: 64, color: '#CBD5E1', margin: '0 auto 16px' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 21,9"></polyline><path d="M12 5V3"></path><path d="M17 3l-2 2"></path><path d="M7 3l2 2"></path></svg>` }} />
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
                                    justifyContent: 'center', padding: 14, flexShrink: 0,
                                }}>
                                    <div style={{ width: '100%', height: '100%', color: 'var(--accent)' }} dangerouslySetInnerHTML={{ __html: TYPE_ICONS[qr.type] || `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><rect x="7" y="7" width="3" height="3"></rect><rect x="14" y="7" width="3" height="3"></rect><rect x="7" y="14" width="3" height="3"></rect><rect x="14" y="14" width="3" height="3"></rect></svg>` }} />
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
                                        style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>` }} />
                                        NFC
                                    </button>
                                    <button className="btn-ghost" onClick={() => navigate(`/edit/${qr.id}`)}
                                        style={{ padding: '8px 12px', fontSize: '13px', display: 'flex', alignItems: 'center' }}>
                                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>` }} />
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
                                        display: 'flex', alignItems: 'center'
                                    }}>
                                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>` }} />
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