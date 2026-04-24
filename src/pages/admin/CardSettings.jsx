import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useToast } from '../../components/Toast.jsx'
import QRCodeStyling from 'qr-code-styling'

const SOCIAL_FIELDS = [
    { key: 'full_name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont', required: true },
    { key: 'title', label: 'Titre / Poste', type: 'text', placeholder: 'Designer, Entrepreneur...' },
    { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Description...' },
    { key: 'whatsapp', label: 'WhatsApp', type: 'tel', placeholder: '+229 XX XX XX XX' },
    { key: 'phone', label: 'Téléphone', type: 'tel', placeholder: '+229 XX XX XX XX' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@example.com' },
    { key: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://instagram.com/...' },
    { key: 'facebook', label: 'Facebook', type: 'url', placeholder: 'https://facebook.com/...' },
    { key: 'tiktok', label: 'TikTok', type: 'url', placeholder: 'https://tiktok.com/...' },
    { key: 'twitter', label: 'X / Twitter', type: 'url', placeholder: 'https://x.com/...' },
    { key: 'linkedin', label: 'LinkedIn', type: 'url', placeholder: 'https://linkedin.com/...' },
    { key: 'youtube', label: 'YouTube', type: 'url', placeholder: 'https://youtube.com/...' },
    { key: 'website', label: 'Site web', type: 'url', placeholder: 'https://...' },
]

const COLORS = [
    { label: 'NFCrafter', bg: '#1A1265' },
    { label: 'Noir', bg: '#1a1a1a' },
    { label: 'Bleu', bg: '#1877F2' },
    { label: 'Vert', bg: '#25D366' },
    { label: 'Rouge', bg: '#E53935' },
    { label: 'Or', bg: '#F59E0B' },
    { label: 'Rose', bg: '#E1306C' },
    { label: 'Violet', bg: '#7C3AED' },
]

export default function CardSettings() {
    const { cardId } = useParams()
    const navigate = useNavigate()
    const toast = useToast()
    const qrRef = useRef(null)
    const qrCode = useRef(null)
    const avatarRef = useRef(null)
    const bannerRef = useRef(null)

    const [card, setCard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [profileForm, setProfileForm] = useState({})
    const [saving, setSaving] = useState(false)
    const [userId, setUserId] = useState('')
    const [linking, setLinking] = useState(false)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [activeSection, setActiveSection] = useState('profil')

    useEffect(() => { loadCard() }, [cardId])

    useEffect(() => {
        if (card && qrRef.current) {
            const url = `${window.location.origin}/u/${card.card_id}`
            qrCode.current = new QRCodeStyling({
                width: 220, height: 220, type: 'svg',
                data: url,
                dotsOptions: { color: profileForm.theme_color || '#1A1265', type: 'rounded' },
                backgroundOptions: { color: '#EBEBDF' },
                cornersSquareOptions: { color: profileForm.theme_color || '#1A1265', type: 'extra-rounded' },
            })
            qrRef.current.innerHTML = ''
            qrCode.current.append(qrRef.current)
        }
    }, [card, profileForm.theme_color])

    async function loadCard() {
        setLoading(true)
        const { data, error } = await supabase
            .from('cards').select('*').eq('card_id', cardId).single()
        if (error || !data) { toast('Carte introuvable', 'error'); navigate('/admin'); return }
        setCard(data)
        setProfileForm(data.admin_profile || {})
        setLoading(false)
    }

    async function uploadImage(file, bucket, field) {
        const maxSize = bucket === 'avatars' ? 3 * 1024 * 1024 : 8 * 1024 * 1024
        if (file.size > maxSize) {
            toast('Image trop lourde. Veuillez compresser votre image ou en choisir une autre.', 'warning')
            return
        }
        if (bucket === 'avatars') setUploadingAvatar(true)
        else setUploadingBanner(true)

        const ext = file.name.split('.').pop()
        const path = `admin/${cardId}/${field}_${Date.now()}.${ext}`
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
        if (error) {
            toast('Erreur upload : ' + error.message, 'error')
        } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            setProfileForm(f => ({ ...f, [field]: data.publicUrl }))
            toast('Image uploadée !', 'success')
        }
        if (bucket === 'avatars') setUploadingAvatar(false)
        else setUploadingBanner(false)
    }

    async function saveProfile() {
        if (!profileForm.full_name?.trim()) {
            toast('Le nom complet est obligatoire', 'error')
            return
        }
        setSaving(true)
        const { error } = await supabase.from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', cardId)
        if (error) toast('Erreur lors de la sauvegarde', 'error')
        else {
            toast('Profil sauvegardé avec succès !', 'success')
            loadCard()
        }
        setSaving(false)
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
            user_id: userId.trim(), card_id: cardId,
            profile_name: profile.full_name,
        })
        toast(`Carte liée à ${profile.full_name} !`, 'success')
        setLinking(false)
        setUserId('')
        loadCard()
    }

    async function deleteCard() {
        const { error } = await supabase.from('cards').delete().eq('card_id', cardId)
        if (error) toast('Erreur lors de la suppression', 'error')
        else {
            toast('Carte supprimée', 'warning')
            navigate('/admin')
        }
    }

    function downloadQR(format = 'png') {
        if (!qrCode.current) return
        qrCode.current.download({ name: `QR-NFCrafter-${cardId}`, extension: format })
        toast(`QR Code téléchargé en ${format.toUpperCase()} !`, 'success')
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text)
        toast(`${label} copié !`, 'info')
    }

    function update(k, v) { setProfileForm(f => ({ ...f, [k]: v })) }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
        </div>
    )

    const publicUrl = `${window.location.origin}/u/${cardId}`
    const activationUrl = `${window.location.origin}/register?card=${cardId}&token=${card?.activation_token}`

    const SECTIONS = [
        { id: 'infos', label: '📋 Infos', icon: '📋' },
        { id: 'profil', label: '👤 Profil', icon: '👤' },
        { id: 'design', label: '🎨 Design', icon: '🎨' },
        { id: 'qr', label: '▣ QR Code', icon: '▣' },
        { id: 'client', label: '🔗 Client', icon: '🔗' },
        { id: 'danger', label: '⚠️ Danger', icon: '⚠️' },
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Header */}
            <header style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1100px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button className="btn-ghost" onClick={() => navigate('/admin')} style={{ padding: '8px 14px', fontSize: '13px' }}>
                        ← Retour
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '16px', color: 'var(--accent)' }}>
                            Carte — <span style={{ fontFamily: 'monospace' }}>{cardId}</span>
                        </span>
                        <span style={{
                            fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                            background: card?.status === 'active' ? '#e8f5e9' : '#fff3e0',
                            color: card?.status === 'active' ? '#2e7d32' : '#e65100',
                        }}>
                            {card?.status === 'active' ? '✅ Active' : '⏳ En attente'}
                        </span>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                        <button className="btn-ghost" onClick={() => window.open(publicUrl, '_blank')} style={{ fontSize: '13px', padding: '8px 14px' }}>
                            👁 Voir la page
                        </button>
                        <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ fontSize: '13px', padding: '8px 20px' }}>
                            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

                {/* Sidebar navigation */}
                <div style={{ position: 'sticky', top: '80px' }}>
                    <div className="card" style={{ padding: '12px' }}>
                        {SECTIONS.map(s => (
                            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                                border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                                background: activeSection === s.id ? 'var(--accent-light)' : 'transparent',
                                color: activeSection === s.id ? 'var(--accent)' : 'var(--text-light)',
                                textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
                                transition: 'all 0.2s', marginBottom: '2px',
                            }}>
                                {s.icon} {s.label.split(' ').slice(1).join(' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Contenu principal */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Section Infos */}
                    {activeSection === 'infos' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '24px' }}>
                                📋 Informations de la carte
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>ID de la carte</p>
                                    <p style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent)', fontSize: '18px' }}>{card?.card_id}</p>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>Nom client</p>
                                    <p style={{ fontWeight: '600', color: 'var(--text)', fontSize: '15px' }}>{card?.card_name || '—'}</p>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>Statut</p>
                                    <p style={{ fontWeight: '600' }}>{card?.status === 'active' ? '✅ Active' : '⏳ En attente'}</p>
                                </div>
                                <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>Token activation</p>
                                    <p style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent)' }}>{card?.activation_token}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: '20px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>🌐 Lien public (à encoder sur la carte NFC)</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" readOnly value={publicUrl} style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }} />
                                    <button className="btn-primary" onClick={() => copyText(publicUrl, 'Lien NFC')} style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}>
                                        📡 Copier
                                    </button>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
                                    👆 Collez ce lien dans NFC Tools pour encoder votre carte
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Section Profil */}
                    {activeSection === 'profil' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '24px' }}>
                                👤 Profil public
                            </h2>

                            {/* Bannière */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>
                                    Bannière
                                </label>
                                <div style={{ position: 'relative', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px dashed var(--border)', cursor: 'pointer', background: profileForm.banner_url ? `url(${profileForm.banner_url}) center/cover` : profileForm.theme_color || 'var(--accent)' }}
                                    onClick={() => bannerRef.current.click()}>
                                    {!profileForm.banner_url && (
                                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.8)', fontSize: '14px', fontWeight: '600' }}>
                                            {uploadingBanner ? '⏳ Upload...' : '📷 Cliquer pour ajouter une bannière'}
                                        </div>
                                    )}
                                    {profileForm.banner_url && (
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                            <span style={{ color: 'white', fontWeight: '600' }}>✏️ Modifier la bannière</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'banners', 'banner_url')} />
                                {profileForm.banner_url && (
                                    <button onClick={() => update('banner_url', '')} style={{ marginTop: '6px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '12px' }}>
                                        🗑 Supprimer la bannière
                                    </button>
                                )}
                            </div>

                            {/* Avatar */}
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>
                                    Photo de profil
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid var(--border)', background: profileForm.photo_url ? `url(${profileForm.photo_url}) center/cover` : 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', cursor: 'pointer', flexShrink: 0 }}
                                        onClick={() => avatarRef.current.click()}>
                                        {!profileForm.photo_url && (uploadingAvatar ? '⏳' : '👤')}
                                    </div>
                                    <div>
                                        <button className="btn-secondary" onClick={() => avatarRef.current.click()} style={{ fontSize: '13px', padding: '8px 16px', width: 'auto', marginBottom: '6px' }}>
                                            {uploadingAvatar ? 'Upload...' : '📷 Choisir une photo'}
                                        </button>
                                        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>PNG, JPG ou WebP — max 3MB</p>
                                        {profileForm.photo_url && (
                                            <button onClick={() => update('photo_url', '')} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '12px' }}>
                                                🗑 Supprimer
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'avatars', 'photo_url')} />
                            </div>

                            {/* Champs texte */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                {SOCIAL_FIELDS.map(field => (
                                    <div key={field.key} className="field" style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                                        <label>{field.label} {field.required && <span style={{ color: 'var(--error)' }}>*</span>}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea rows={3} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => update(field.key, e.target.value)}
                                                style={{ resize: 'vertical' }}
                                            />
                                        ) : (
                                            <input type={field.type} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => update(field.key, e.target.value)}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={saveProfile} disabled={saving}
                                style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}>
                                {saving ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
                            </button>
                        </div>
                    )}

                    {/* Section Design */}
                    {activeSection === 'design' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '24px' }}>
                                🎨 Design de la page publique
                            </h2>

                            <div className="field">
                                <label>Couleur principale</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '16px' }}>
                                    {COLORS.map(c => (
                                        <button key={c.bg} onClick={() => update('theme_color', c.bg)} style={{
                                            height: '48px', borderRadius: 'var(--radius-md)', background: c.bg,
                                            border: profileForm.theme_color === c.bg ? '3px solid var(--accent)' : '2px solid transparent',
                                            cursor: 'pointer', color: 'white', fontSize: '12px', fontWeight: '600',
                                            boxShadow: profileForm.theme_color === c.bg ? '0 0 0 3px var(--accent)' : 'var(--shadow)',
                                        }}>
                                            {c.label}
                                        </button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                    <input type="color" value={profileForm.theme_color || '#1A1265'}
                                        onChange={e => update('theme_color', e.target.value)}
                                        style={{ width: '48px', height: '40px', padding: '2px', cursor: 'pointer' }}
                                    />
                                    <input type="text" value={profileForm.theme_color || '#1A1265'}
                                        onChange={e => update('theme_color', e.target.value)}
                                        style={{ flex: 1, fontFamily: 'monospace' }} placeholder="#1A1265"
                                    />
                                </div>
                            </div>

                            {/* Aperçu */}
                            <div style={{ marginTop: '24px' }}>
                                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-light)', display: 'block', marginBottom: '8px' }}>Aperçu</label>
                                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '320px' }}>
                                    <div style={{ height: '80px', background: profileForm.banner_url ? `url(${profileForm.banner_url}) center/cover` : (profileForm.theme_color || '#1A1265') }} />
                                    <div style={{ background: 'white', padding: '48px 16px 16px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', top: '-32px', left: '16px', width: '64px', height: '64px', borderRadius: '50%', border: '3px solid white', background: profileForm.photo_url ? `url(${profileForm.photo_url}) center/cover` : (profileForm.theme_color || '#1A1265'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                                            {!profileForm.photo_url && '👤'}
                                        </div>
                                        <p style={{ fontWeight: '700', fontSize: '14px' }}>{profileForm.full_name || 'Nom du client'}</p>
                                        {profileForm.title && <p style={{ fontSize: '12px', color: profileForm.theme_color || '#1A1265' }}>{profileForm.title}</p>}
                                        {profileForm.bio && <p style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{profileForm.bio}</p>}
                                        <div style={{ marginTop: '12px', height: '32px', borderRadius: '8px', background: profileForm.theme_color || '#1A1265', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: 'white', fontSize: '11px', fontWeight: '600' }}>👤 Enregistrer le contact</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn-primary" onClick={saveProfile} disabled={saving}
                                style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '24px' }}>
                                {saving ? 'Sauvegarde...' : '💾 Sauvegarder le design'}
                            </button>
                        </div>
                    )}

                    {/* Section QR */}
                    {activeSection === 'qr' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '24px' }}>
                                ▣ QR Code
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', boxShadow: 'var(--shadow-lg)' }} />
                                    <p style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>
                                        {publicUrl}
                                    </p>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                        {['png', 'svg', 'jpeg'].map(fmt => (
                                            <button key={fmt} className="btn-secondary" onClick={() => downloadQR(fmt)}
                                                style={{ padding: '8px 16px', fontSize: '13px', width: 'auto', textTransform: 'uppercase' }}>
                                                ⬇ {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div style={{ padding: '20px', background: 'var(--accent-light)', borderRadius: 'var(--radius-lg)', marginBottom: '16px' }}>
                                        <h3 style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '8px', fontSize: '14px' }}>
                                            📡 Encoder sur la carte NFC
                                        </h3>
                                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px', lineHeight: '1.5' }}>
                                            Copiez ce lien et collez-le dans <strong>NFC Tools</strong> pour encoder votre carte.
                                        </p>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="text" readOnly value={publicUrl}
                                                style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }} />
                                            <button className="btn-primary" onClick={() => copyText(publicUrl, 'Lien NFC')}
                                                style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                                                📋
                                            </button>
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--text-light)', lineHeight: '1.6' }}>
                                        <strong style={{ color: 'var(--text)' }}>💡 Note :</strong> Ce QR code est permanent. Même si le client modifie son profil, le QR ne change jamais.
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section Client */}
                    {activeSection === 'client' && (
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '24px' }}>
                                🔗 Gestion du client
                            </h2>

                            {card?.status === 'active' && card?.owner_id ? (
                                <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid #4caf50' }}>
                                    <h3 style={{ color: '#2e7d32', fontWeight: '700', marginBottom: '8px' }}>✅ Carte activée</h3>
                                    <p style={{ fontSize: '13px', color: '#2e7d32' }}>
                                        Cette carte est liée à un client (ID: <code>{card.owner_id}</code>)
                                    </p>
                                </div>
                            ) : (
                                <div style={{ padding: '20px', background: '#fff3e0', borderRadius: 'var(--radius-lg)', marginBottom: '24px', border: '1px solid #ff9800' }}>
                                    <h3 style={{ color: '#e65100', fontWeight: '700', marginBottom: '4px' }}>⏳ Carte non activée</h3>
                                    <p style={{ fontSize: '13px', color: '#e65100' }}>Envoyez le lien d'activation au client ou liez-le manuellement.</p>
                                </div>
                            )}

                            {/* Lien activation */}
                            <div className="field">
                                <label>🔗 Lien d'activation (nouveau client)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" readOnly value={activationUrl}
                                        style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }} />
                                    <button className="btn-primary" onClick={() => copyText(activationUrl, 'Lien d\'activation')}
                                        style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}>
                                        📋 Copier
                                    </button>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
                                    Envoyez ce lien au client. Il créera son compte et la carte sera automatiquement activée.
                                </p>
                            </div>

                            {/* Lien activation client existant */}
                            <div className="field" style={{ marginTop: '16px' }}>
                                <label>🔗 Lien pour client existant (déjà inscrit)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="text" readOnly
                                        value={`${window.location.origin}/activate?card=${cardId}&token=${card?.activation_token}`}
                                        style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }} />
                                    <button className="btn-primary"
                                        onClick={() => copyText(`${window.location.origin}/activate?card=${cardId}&token=${card?.activation_token}`, 'Lien activation')}
                                        style={{ whiteSpace: 'nowrap', padding: '10px 16px' }}>
                                        📋 Copier
                                    </button>
                                </div>
                            </div>

                            {/* Liaison manuelle */}
                            <div style={{ marginTop: '24px', padding: '20px', background: 'var(--bg)', borderRadius: 'var(--radius-lg)' }}>
                                <h3 style={{ fontWeight: '700', color: 'var(--text)', marginBottom: '12px', fontSize: '15px' }}>
                                    🔧 Liaison manuelle
                                </h3>
                                <div className="field">
                                    <label>ID du client</label>
                                    <textarea rows={2} placeholder="Collez l'ID UUID du client ici..."
                                        value={userId} onChange={e => setUserId(e.target.value)}
                                        style={{ fontFamily: 'monospace', fontSize: '12px', resize: 'none' }} />
                                </div>
                                <button className="btn-primary" onClick={linkCard} disabled={linking || !userId.trim()}
                                    style={{ width: '100%', justifyContent: 'center' }}>
                                    {linking ? 'Liaison...' : '✅ Lier manuellement'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Section Danger */}
                    {activeSection === 'danger' && (
                        <div className="card" style={{ border: '1px solid #ffcdd2' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--error)', marginBottom: '24px' }}>
                                ⚠️ Zone de danger
                            </h2>
                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: 'var(--radius-lg)', border: '1px solid #ffcdd2' }}>
                                <h3 style={{ color: 'var(--error)', fontWeight: '700', marginBottom: '8px' }}>Supprimer cette carte</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px', lineHeight: '1.5' }}>
                                    Cette action est <strong>irréversible</strong>. La carte sera supprimée, le lien <code>/u/{cardId}</code> ne fonctionnera plus et le client perdra l'accès à sa page.
                                </p>
                                {!showDeleteConfirm ? (
                                    <button onClick={() => setShowDeleteConfirm(true)} style={{
                                        background: 'transparent', border: '1.5px solid var(--error)',
                                        color: 'var(--error)', borderRadius: 'var(--radius-sm)',
                                        padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                                    }}>
                                        🗑 Supprimer la carte
                                    </button>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: '13px', color: 'var(--error)', fontWeight: '600', marginBottom: '12px' }}>
                                            Êtes-vous sûr ? Cette action ne peut pas être annulée.
                                        </p>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>
                                                Annuler
                                            </button>
                                            <button onClick={deleteCard} style={{
                                                flex: 1, padding: '11px', background: 'var(--error)', color: 'white',
                                                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                                fontSize: '14px', fontWeight: '700',
                                            }}>
                                                🗑 Confirmer la suppression
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}