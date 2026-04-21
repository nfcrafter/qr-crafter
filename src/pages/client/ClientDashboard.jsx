import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useNavigate } from 'react-router-dom'

const SOCIAL_FIELDS = [
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '+229 XX XX XX XX', icon: '💬' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/monprofil', icon: '📸' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/monprofil', icon: '👥' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@monprofil', icon: '🎵' },
    { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/monprofil', icon: '🐦' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/monprofil', icon: '💼' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@monprofil', icon: '▶️' },
    { key: 'website', label: 'Site web', placeholder: 'https://monsite.com', icon: '🌐' },
    { key: 'email', label: 'Email', placeholder: 'mon@email.com', icon: '✉️' },
    { key: 'phone', label: 'Téléphone', placeholder: '+229 XX XX XX XX', icon: '📞' },
]

const COLORS = [
    { label: 'NFCrafter', bg: '#1A1265', text: '#FFFFFF' },
    { label: 'Noir', bg: '#1a1a1a', text: '#FFFFFF' },
    { label: 'Bleu', bg: '#1877F2', text: '#FFFFFF' },
    { label: 'Vert', bg: '#25D366', text: '#FFFFFF' },
    { label: 'Rouge', bg: '#E53935', text: '#FFFFFF' },
    { label: 'Or', bg: '#F59E0B', text: '#1a1a1a' },
    { label: 'Rose', bg: '#E1306C', text: '#FFFFFF' },
    { label: 'Violet', bg: '#7C3AED', text: '#FFFFFF' },
]

export default function ClientDashboard() {
    const navigate = useNavigate()
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [user, setUser] = useState(null)
    const [cardStatus, setCardStatus] = useState(null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)
    const [uploadingBanner, setUploadingBanner] = useState(false)
    const [activeTab, setActiveTab] = useState('profil')
    const avatarRef = useRef()
    const bannerRef = useRef()

    useEffect(() => { loadProfile() }, [])

    async function loadProfile() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        let { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!profile) {
            const newProfile = {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                email: user.email,
                theme_color: '#1A1265',
                theme_text: '#FFFFFF',
            }
            await supabase.from('profiles').insert(newProfile)
            profile = newProfile
        }

        setForm(profile)

        if (profile.card_id) {
            const { data: card } = await supabase
                .from('cards')
                .select('status, card_id')
                .eq('card_id', profile.card_id)
                .single()
            setCardStatus(card)
        }
        setLoading(false)
    }

    async function uploadImage(file, bucket, field) {
        const maxSize = bucket === 'avatars' ? 3 * 1024 * 1024 : 8 * 1024 * 1024
        if (file.size > maxSize) {
            alert(`❌ Image trop lourde. Veuillez compresser votre image en ligne ou choisir une autre image.`)
            return
        }

        if (bucket === 'avatars') setUploadingAvatar(true)
        else setUploadingBanner(true)

        const ext = file.name.split('.').pop()
        const path = `${user.id}/${Date.now()}.${ext}`

        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })

        if (error) {
            alert('Erreur upload : ' + error.message)
        } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            setForm(f => ({ ...f, [field]: data.publicUrl }))
        }

        if (bucket === 'avatars') setUploadingAvatar(false)
        else setUploadingBanner(false)
    }

    async function saveProfile() {
        setSaving(true)
        const { error } = await supabase
            .from('profiles')
            .upsert({ ...form, id: user.id, updated_at: new Date().toISOString() })
        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        }
        setSaving(false)
    }

    async function logout() {
        await supabase.auth.signOut()
        navigate('/login')
    }

    function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

    function copyId() {
        navigator.clipboard.writeText(user?.id || '')
        alert('✅ Votre ID a été copié ! Envoyez-le à NFCrafter pour activer votre carte.')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
        </div>
    )

    const TABS = [
        { id: 'profil', label: '👤 Profil' },
        { id: 'liens', label: '🔗 Liens' },
        { id: 'design', label: '🎨 Design' },
    ]

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Header */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '680px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px', width: 'auto' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                            NFCrafter
                        </span>
                    </div>
                    <button className="btn-ghost" onClick={logout} style={{ padding: '8px 16px', fontSize: '13px' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>

                {/* Statut carte */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    {cardStatus?.status === 'active' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>✅ Carte activée</h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>ID : <strong>{cardStatus.card_id}</strong></p>
                            </div>
                            <a href={`/u/${cardStatus.card_id}`} target="_blank" style={{
                                padding: '10px 20px', background: 'var(--accent)', color: 'white',
                                borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                                fontWeight: '600', fontSize: '13px',
                            }}>
                                Voir ma page →
                            </a>
                        </div>
                    ) : (
                        <div>
                            <h3 style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '8px' }}>⏳ En attente d'activation</h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '12px' }}>
                                Envoyez votre ID à NFCrafter pour activer votre carte.
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" readOnly value={user?.id || ''}
                                    style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace', background: 'var(--bg)' }}
                                />
                                <button className="btn-primary" onClick={copyId} style={{ whiteSpace: 'nowrap', fontSize: '13px', padding: '10px 16px' }}>
                                    📋 Copier
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Onglets */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            flex: 1, padding: '10px', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                            background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-white)',
                            color: activeTab === tab.id ? 'white' : 'var(--text-light)',
                            transition: 'all 0.2s',
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Profil */}
                {activeTab === 'profil' && (
                    <div className="card">
                        {/* Bannière */}
                        <div style={{ position: 'relative', marginBottom: '60px' }}>
                            <div
                                onClick={() => bannerRef.current.click()}
                                style={{
                                    height: '140px', borderRadius: 'var(--radius-md)',
                                    background: form.banner_url ? `url(${form.banner_url}) center/cover` : form.theme_color || 'var(--accent)',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px dashed rgba(255,255,255,0.3)',
                                    position: 'relative', overflow: 'hidden',
                                }}>
                                {!form.banner_url && (
                                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                        {uploadingBanner ? 'Upload...' : '📷 Ajouter une bannière'}
                                    </span>
                                )}
                                {form.banner_url && (
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: 0, transition: 'opacity 0.2s',
                                    }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                    >
                                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>✏️ Modifier la bannière</span>
                                    </div>
                                )}
                            </div>
                            <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }}
                                onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'banners', 'banner_url')}
                            />

                            {/* Avatar */}
                            <div style={{ position: 'absolute', bottom: '-48px', left: '20px' }}>
                                <div
                                    onClick={() => avatarRef.current.click()}
                                    style={{
                                        width: '96px', height: '96px', borderRadius: '50%',
                                        border: '4px solid white', cursor: 'pointer', overflow: 'hidden',
                                        background: form.photo_url ? `url(${form.photo_url}) center/cover` : 'var(--accent-light)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '32px', boxShadow: 'var(--shadow)',
                                        position: 'relative',
                                    }}>
                                    {!form.photo_url && (uploadingAvatar ? '⏳' : '👤')}
                                    {form.photo_url && (
                                        <div style={{
                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            opacity: 0, transition: 'opacity 0.2s', borderRadius: '50%',
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                            onMouseLeave={e => e.currentTarget.style.opacity = 0}
                                        >
                                            <span style={{ color: 'white', fontSize: '11px', textAlign: 'center' }}>✏️</span>
                                        </div>
                                    )}
                                </div>
                                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'avatars', 'photo_url')}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label>Nom complet *</label>
                            <input type="text" placeholder="Jean Dupont"
                                value={form.full_name || ''} onChange={e => update('full_name', e.target.value)} />
                        </div>
                        <div className="field">
                            <label>Titre / Poste</label>
                            <input type="text" placeholder="Ex: Designer Graphique, Entrepreneur..."
                                value={form.title || ''} onChange={e => update('title', e.target.value)} />
                        </div>
                        <div className="field">
                            <label>Bio</label>
                            <textarea rows={3} placeholder="Décrivez-vous en quelques mots..."
                                value={form.bio || ''} onChange={e => update('bio', e.target.value)}
                                style={{ resize: 'vertical' }} />
                        </div>
                    </div>
                )}

                {/* Tab Liens */}
                {activeTab === 'liens' && (
                    <div className="card">
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>
                            Remplissez uniquement les liens que vous souhaitez afficher.
                        </p>
                        {SOCIAL_FIELDS.map(field => (
                            <div key={field.key} className="field">
                                <label>{field.icon} {field.label}</label>
                                <input
                                    type={field.key === 'email' ? 'email' : 'text'}
                                    placeholder={field.placeholder}
                                    value={form[field.key] || ''}
                                    onChange={e => update(field.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Tab Design */}
                {activeTab === 'design' && (
                    <div className="card">
                        <h3 style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '16px', fontSize: '15px' }}>
                            🎨 Couleur du profil
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '24px' }}>
                            {COLORS.map(c => (
                                <button key={c.label} onClick={() => { update('theme_color', c.bg); update('theme_text', c.text) }}
                                    style={{
                                        height: '48px', borderRadius: 'var(--radius-md)',
                                        background: c.bg, border: form.theme_color === c.bg ? '3px solid var(--accent)' : '2px solid transparent',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: c.text, fontSize: '11px', fontWeight: '600',
                                        outline: form.theme_color === c.bg ? '2px solid white' : 'none',
                                        boxShadow: form.theme_color === c.bg ? '0 0 0 3px var(--accent)' : 'var(--shadow)',
                                    }}>
                                    {c.label}
                                </button>
                            ))}
                        </div>

                        <h3 style={{ fontWeight: '700', color: 'var(--accent)', marginBottom: '16px', fontSize: '15px' }}>
                            🎨 Couleur personnalisée
                        </h3>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input type="color" value={form.theme_color || '#1A1265'}
                                onChange={e => update('theme_color', e.target.value)}
                                style={{ width: '48px', height: '40px', padding: '2px', cursor: 'pointer' }}
                            />
                            <input type="text" value={form.theme_color || '#1A1265'}
                                onChange={e => update('theme_color', e.target.value)}
                                style={{ flex: 1, fontFamily: 'monospace' }}
                            />
                        </div>

                        {/* Aperçu */}
                        <div style={{ marginTop: '24px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <div style={{ height: '60px', background: form.theme_color || '#1A1265' }} />
                            <div style={{ background: 'white', padding: '40px 16px 16px', textAlign: 'center' }}>
                                <div style={{ fontWeight: '700', fontSize: '15px' }}>{form.full_name || 'Votre nom'}</div>
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{form.title || 'Votre titre'}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bouton sauvegarder */}
                <button className="btn-primary" onClick={saveProfile} disabled={saving}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '20px' }}>
                    {saving ? 'Sauvegarde...' : saved ? '✅ Sauvegardé !' : '💾 Sauvegarder'}
                </button>

            </main>
        </div>
    )
}