import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useToast } from '../../components/Toast.jsx'
import Modal from '../../components/Modal.jsx'
import QRCodeStyling from 'qr-code-styling'

const SOCIAL_FIELDS = [
    { key: 'full_name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont' },
    { key: 'title', label: 'Titre / Poste', type: 'text', placeholder: 'Designer, Entrepreneur...' },
    { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Description...' },
    { key: 'photo_url', label: 'Photo (URL)', type: 'text', placeholder: 'https://...' },
    { key: 'banner_url', label: 'Bannière (URL)', type: 'text', placeholder: 'https://...' },
    { key: 'theme_color', label: 'Couleur thème', type: 'color' },
    { key: 'whatsapp', label: 'WhatsApp', type: 'text', placeholder: '+229...' },
    { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+229...' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@example.com' },
    { key: 'instagram', label: 'Instagram', type: 'text', placeholder: 'https://instagram.com/...' },
    { key: 'facebook', label: 'Facebook', type: 'text', placeholder: 'https://facebook.com/...' },
    { key: 'tiktok', label: 'TikTok', type: 'text', placeholder: 'https://tiktok.com/...' },
    { key: 'twitter', label: 'X / Twitter', type: 'text', placeholder: 'https://x.com/...' },
    { key: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'https://linkedin.com/...' },
    { key: 'youtube', label: 'YouTube', type: 'text', placeholder: 'https://youtube.com/...' },
    { key: 'website', label: 'Site web', type: 'text', placeholder: 'https://...' },
]

export default function CardSettings() {
    const { cardId } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const qrRef = useRef(null)
    const qrCode = useRef(null)

    const [card, setCard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeSection, setActiveSection] = useState('infos')

    // Profile form
    const [profileForm, setProfileForm] = useState({})
    const [savingProfile, setSavingProfile] = useState(false)

    // Link modal
    const [linkModal, setLinkModal] = useState(false)
    const [userId, setUserId] = useState('')
    const [linking, setLinking] = useState(false)

    // Delete modal
    const [deleteModal, setDeleteModal] = useState(false)

    useEffect(() => { loadCard() }, [cardId])

    useEffect(() => {
        if (activeSection === 'qrcode' && qrRef.current) {
            const url = `${window.location.origin}/u/${cardId}`
            if (!qrCode.current) {
                qrCode.current = new QRCodeStyling({
                    width: 240, height: 240, type: 'svg',
                    data: url,
                    dotsOptions: { color: '#1A1265', type: 'rounded' },
                    backgroundOptions: { color: '#EBEBDF' },
                    cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
                })
            }
            qrRef.current.innerHTML = ''
            qrCode.current.update({ data: url })
            qrCode.current.append(qrRef.current)
        }
    }, [activeSection, card])

    async function loadCard() {
        setLoading(true)
        const { data, error } = await supabase
            .from('cards').select('*').eq('card_id', cardId).single()
        if (error || !data) { navigate('/admin'); return }
        setCard(data)
        setProfileForm(data.admin_profile || {})
        setLoading(false)
    }

    async function saveProfile() {
        setSavingProfile(true)
        const { error } = await supabase.from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', cardId)
        if (error) toast('Erreur lors de la sauvegarde', 'error')
        else { toast('Profil sauvegardé !', 'success'); loadCard() }
        setSavingProfile(false)
    }

    async function linkCard() {
        if (!userId.trim()) return
        setLinking(true)
        const { data: profile, error } = await supabase
            .from('profiles').select('id, full_name').eq('id', userId.trim()).single()
        if (error || !profile) {
            toast('Aucun utilisateur trouvé avec cet ID', 'error')
            setLinking(false)
            return
        }
        await supabase.from('cards')
            .update({ owner_id: userId.trim(), status: 'active' })
            .eq('card_id', cardId)
        await supabase.from('profiles')
            .update({ card_id: cardId })
            .eq('id', userId.trim())
        await supabase.from('user_cards').upsert({
            user_id: userId.trim(),
            card_id: cardId,
            profile_name: profile.full_name,
        })
        toast(`Carte liée à ${profile.full_name} !`, 'success')
        setLinking(false)
        setLinkModal(false)
        setUserId('')
        loadCard()
    }

    async function deleteCard() {
        const { error } = await supabase.from('cards').delete().eq('card_id', cardId)
        if (error) toast('Erreur lors de la suppression', 'error')
        else {
            toast(`Carte "${cardId}" supprimée`, 'warning')
            navigate('/admin')
        }
    }

    function downloadQR() {
        const url = `${window.location.origin}/u/${cardId}`
        const qr = new QRCodeStyling({
            width: 1024, height: 1024, type: 'svg',
            data: url,
            dotsOptions: { color: '#1A1265', type: 'rounded' },
            backgroundOptions: { color: '#EBEBDF' },
            cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
        })
        qr.download({ name: `QR-NFCrafter-${cardId}`, extension: 'png' })
        toast('QR Code téléchargé !', 'success')
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text)
        toast(`${label} copié !`, 'info')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
        </div>
    )

    const SECTIONS = [
        { id: 'infos', icon: '💳', label: 'Informations' },
        { id: 'profil', icon: '✏️', label: 'Profil client' },
        { id: 'activation', icon: '🔗', label: 'Activation' },
        { id: 'qrcode', icon: '▣', label: 'QR Code' },
        { id: 'danger', icon: '⚠️', label: 'Zone danger' },
    ]

    const publicUrl = `${window.location.origin}/u/${cardId}`
    const activationUrl = `${window.location.origin}/register?card=${cardId}&token=${card.activation_token}`

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Header */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                }}>
                    <button onClick={() => navigate('/admin')} style={{
                        background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)', padding: '8px 14px',
                        cursor: 'pointer', fontSize: '13px', color: 'var(--text-light)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.15s',
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-light)' }}
                    >
                        ← Retour
                    </button>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                                Paramètres carte
                            </span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '14px', color: 'var(--text-light)', background: 'var(--bg)', padding: '2px 10px', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
                                #{cardId}
                            </span>
                            <span style={{
                                fontSize: '12px', fontWeight: '600', padding: '3px 10px',
                                borderRadius: 'var(--radius-pill)',
                                background: card.status === 'active' ? '#e8f5e9' : '#fff3e0',
                                color: card.status === 'active' ? '#2e7d32' : '#e65100',
                            }}>
                                {card.status === 'active' ? '✅ Active' : '⏳ En attente'}
                            </span>
                        </div>
                        {card.card_name && (
                            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '2px' }}>
                                {card.admin_profile?.full_name || card.card_name}
                            </p>
                        )}
                    </div>

                    <button className="btn-ghost" onClick={() => window.open(publicUrl, '_blank')} style={{ fontSize: '13px' }}>
                        👁 Voir la page
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Sidebar navigation */}
                <div className="card" style={{ padding: '8px', position: 'sticky', top: '80px' }}>
                    {SECTIONS.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '11px 14px', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '14px',
                            fontFamily: 'var(--font-body)', fontWeight: activeSection === s.id ? '600' : '400',
                            background: activeSection === s.id ? 'var(--accent-light)' : 'transparent',
                            color: activeSection === s.id ? 'var(--accent)' : (s.id === 'danger' ? '#e53935' : 'var(--text)'),
                            transition: 'all 0.15s', textAlign: 'left', marginBottom: '2px',
                        }}>
                            <span style={{ fontSize: '16px' }}>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Contenu principal */}
                <div>

                    {/* Section Informations */}
                    {activeSection === 'infos' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--accent)', marginBottom: '24px' }}>
                                💳 Informations de la carte
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <InfoRow label="ID de la carte" value={cardId} mono />
                                <InfoRow label="Nom client" value={card.card_name || '—'} />
                                <InfoRow label="Statut" value={card.status === 'active' ? '✅ Active' : '⏳ En attente'} />
                                <InfoRow label="Propriétaire" value={card.owner_id ? card.owner_id.substring(0, 16) + '...' : 'Non lié'} mono />
                                <InfoRow label="Créée le" value={new Date(card.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })} />
                                <InfoRow label="Token d'activation" value={card.activation_token || '—'} mono />
                            </div>

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: 'var(--text-light)', marginBottom: '8px' }}>
                                    Lien public de la page
                                </label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" readOnly value={publicUrl}
                                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px', background: 'var(--bg)' }}
                                    />
                                    <button className="btn-primary" onClick={() => copyText(publicUrl, 'Lien public')} style={{ whiteSpace: 'nowrap' }}>
                                        📋 Copier
                                    </button>
                                    <button className="btn-secondary" onClick={() => copyText(publicUrl, 'Lien NFC')} style={{ whiteSpace: 'nowrap' }}>
                                        📡 NFC
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Profil */}
                    {activeSection === 'profil' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--accent)', marginBottom: '24px' }}>
                                ✏️ Profil client
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                                {SOCIAL_FIELDS.map(field => (
                                    <div key={field.key} className="field" style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                                        <label>{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea rows={2} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                style={{ resize: 'none' }}
                                            />
                                        ) : field.type === 'color' ? (
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <input type="color" value={profileForm[field.key] || '#1A1265'}
                                                    onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                    style={{ width: '44px', height: '38px', padding: '2px', cursor: 'pointer' }}
                                                />
                                                <input type="text" value={profileForm[field.key] || '#1A1265'}
                                                    onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                    style={{ flex: 1, fontFamily: 'monospace' }}
                                                />
                                            </div>
                                        ) : (
                                            <input type={field.type} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                <button className="btn-primary" onClick={saveProfile} disabled={savingProfile} style={{ padding: '12px 32px' }}>
                                    {savingProfile ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section Activation */}
                    {activeSection === 'activation' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {/* Lien d'activation */}
                            <div className="card">
                                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--accent)', marginBottom: '8px' }}>
                                    🔗 Lien d'activation
                                </h2>
                                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                                    Envoyez ce lien au client pour qu'il puisse créer son compte et activer sa carte.
                                </p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" readOnly value={activationUrl}
                                        style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', background: 'var(--bg)' }}
                                    />
                                    <button className="btn-primary" onClick={() => copyText(activationUrl, "Lien d'activation")} style={{ whiteSpace: 'nowrap' }}>
                                        📋 Copier
                                    </button>
                                </div>
                            </div>

                            {/* Lier manuellement */}
                            {card.status === 'pending' && (
                                <div className="card">
                                    <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--accent)', marginBottom: '8px' }}>
                                        🔗 Lier manuellement un client
                                    </h2>
                                    <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                                        Si le client a déjà un compte, collez son ID pour activer la carte directement.
                                    </p>
                                    <div className="field">
                                        <label>ID du client</label>
                                        <textarea rows={3} placeholder="Collez l'UUID du client ici..."
                                            value={userId}
                                            onChange={e => setUserId(e.target.value)}
                                            style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                        />
                                    </div>
                                    <button className="btn-primary" onClick={linkCard} disabled={linking || !userId.trim()}>
                                        {linking ? 'Liaison en cours...' : '✅ Activer la carte'}
                                    </button>
                                </div>
                            )}

                            {card.status === 'active' && (
                                <div className="card" style={{ background: '#e8f5e9', border: '1px solid #4caf50' }}>
                                    <h3 style={{ fontWeight: '700', color: '#2e7d32', marginBottom: '8px' }}>✅ Carte déjà activée</h3>
                                    <p style={{ fontSize: '13px', color: '#388e3c' }}>
                                        Cette carte est liée à un compte client. Le client peut modifier son profil depuis son dashboard.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Section QR Code */}
                    {activeSection === 'qrcode' && (
                        <div className="card" style={{ textAlign: 'center' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: 'var(--accent)', marginBottom: '24px', textAlign: 'left' }}>
                                ▣ QR Code
                            </h2>
                            <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px' }} />
                            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '24px', fontFamily: 'monospace' }}>
                                {publicUrl}
                            </p>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                                <button className="btn-secondary" onClick={() => copyText(publicUrl, 'Lien NFC')} style={{ padding: '12px 24px' }}>
                                    📡 Copier lien NFC
                                </button>
                                <button className="btn-primary" onClick={downloadQR} style={{ padding: '12px 24px' }}>
                                    ⬇ Télécharger PNG
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Zone danger */}
                    {activeSection === 'danger' && (
                        <div className="card" style={{ border: '1.5px solid #ffcdd2' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color: '#e53935', marginBottom: '8px' }}>
                                ⚠️ Zone de danger
                            </h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>
                                Les actions ci-dessous sont irréversibles. Procédez avec précaution.
                            </p>

                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: 'var(--radius-md)', border: '1px solid #ffcdd2' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                                    <div>
                                        <h4 style={{ fontWeight: '700', color: '#c62828', marginBottom: '4px' }}>Supprimer cette carte</h4>
                                        <p style={{ fontSize: '13px', color: '#e57373' }}>
                                            Supprime définitivement la carte #{cardId}. Le lien <code>/u/{cardId}</code> ne fonctionnera plus.
                                        </p>
                                    </div>
                                    <button onClick={() => setDeleteModal(true)} style={{
                                        background: '#e53935', color: 'white', border: 'none',
                                        borderRadius: 'var(--radius-sm)', padding: '12px 24px',
                                        cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                                        whiteSpace: 'nowrap', flexShrink: 0,
                                    }}>
                                        🗑 Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal suppression */}
            <Modal isOpen={deleteModal} onClose={() => setDeleteModal(false)} title="🗑 Supprimer la carte" size="sm">
                <p style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '8px' }}>
                    Voulez-vous vraiment supprimer la carte <strong>{cardId}</strong> ?
                </p>
                <p style={{ fontSize: '13px', color: 'var(--error)', marginBottom: '24px' }}>
                    ⚠️ Cette action est irréversible. Le lien `/u/{cardId}` ne fonctionnera plus.
                </p>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-ghost" onClick={() => setDeleteModal(false)} style={{ flex: 1 }}>Annuler</button>
                    <button onClick={deleteCard} style={{
                        flex: 1, padding: '11px', background: '#e53935', color: 'white',
                        border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                        fontSize: '14px', fontWeight: '600',
                    }}>
                        🗑 Supprimer définitivement
                    </button>
                </div>
            </Modal>
        </div>
    )
}

function InfoRow({ label, value, mono }) {
    return (
        <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '500' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text)', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>
                {value}
            </div>
        </div>
    )
}