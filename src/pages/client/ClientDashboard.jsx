import { useState, useEffect } from 'react'
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

export default function ClientDashboard() {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [form, setForm] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [user, setUser] = useState(null)
    const [cardStatus, setCardStatus] = useState(null)

    useEffect(() => {
        loadProfile()
    }, [])

    async function loadProfile() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile) {
            setProfile(profile)
            setForm(profile)
            // Charger statut carte
            if (profile.card_id) {
                const { data: card } = await supabase
                    .from('cards')
                    .select('status, card_id')
                    .eq('card_id', profile.card_id)
                    .single()
                setCardStatus(card)
            }
        } else {
            // Créer profil si inexistant
            const newProfile = { id: user.id, full_name: user.user_metadata?.full_name || '', email: user.email }
            await supabase.from('profiles').insert(newProfile)
            setProfile(newProfile)
            setForm(newProfile)
        }
        setLoading(false)
    }

    async function saveProfile() {
        setSaving(true)
        const { error } = await supabase
            .from('profiles')
            .upsert({ ...form, id: user.id, updated_at: new Date().toISOString() })
        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
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
        alert('Votre ID a été copié ! Envoyez-le à NFCrafter pour activer votre carte.')
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
        </div>
    )

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Header */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '800px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px', width: 'auto' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                            NFCrafter
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {cardStatus && (
                            <a href={`${window.location.origin}/u/${cardStatus.card_id}`} target="_blank"
                                style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
                                👁 Voir ma page
                            </a>
                        )}
                        <button className="btn-ghost" onClick={logout} style={{ padding: '8px 16px', fontSize: '13px' }}>
                            Déconnexion
                        </button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>

                {/* Statut carte */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    {cardStatus?.status === 'active' ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>
                                    ✅ Carte activée
                                </h3>
                                <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                    Votre carte NFC est active · ID : <strong>{cardStatus.card_id}</strong>
                                </p>
                            </div>
                            <a href={`${window.location.origin}/u/${cardStatus.card_id}`} target="_blank"
                                style={{
                                    padding: '10px 20px', background: 'var(--accent)', color: 'white',
                                    borderRadius: 'var(--radius-sm)', textDecoration: 'none', fontSize: '13px', fontWeight: '600',
                                }}>
                                Voir ma page publique →
                            </a>
                        </div>
                    ) : (
                        <div>
                            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px' }}>
                                ⏳ En attente d'activation
                            </h3>
                            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                                Votre carte n'est pas encore activée. Envoyez votre ID à NFCrafter pour l'activer.
                            </p>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <input type="text" readOnly value={user?.id || ''}
                                    style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace', background: 'var(--bg)' }}
                                />
                                <button className="btn-primary" onClick={copyId} style={{ whiteSpace: 'nowrap', padding: '10px 16px', fontSize: '13px' }}>
                                    📋 Copier mon ID
                                </button>
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                                💬 Envoyez cet ID sur WhatsApp à NFCrafter pour activer votre carte
                            </p>
                        </div>
                    )}
                </div>

                {/* Formulaire profil */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '20px' }}>
                        👤 Mon profil
                    </h2>

                    <div className="field">
                        <label>Nom complet *</label>
                        <input type="text" placeholder="Jean Dupont"
                            value={form.full_name || ''}
                            onChange={e => update('full_name', e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label>Bio / Description</label>
                        <textarea rows={3} placeholder="Décrivez-vous en quelques mots..."
                            value={form.bio || ''}
                            onChange={e => update('bio', e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>

                    <div className="field">
                        <label>Photo de profil (URL)</label>
                        <input type="url" placeholder="https://exemple.com/ma-photo.jpg"
                            value={form.photo_url || ''}
                            onChange={e => update('photo_url', e.target.value)}
                        />
                    </div>
                </div>

                {/* Réseaux sociaux */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '20px' }}>
                        🔗 Mes liens & réseaux sociaux
                    </h2>
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

                {/* Bouton sauvegarder */}
                <button className="btn-primary" onClick={saveProfile} disabled={saving}
                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
                    {saving ? 'Sauvegarde...' : saved ? '✅ Sauvegardé !' : '💾 Sauvegarder mes informations'}
                </button>

            </main>
        </div>
    )
}