import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import QRCodeStyling from 'qr-code-styling'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCardId, setNewCardId] = useState('')
    const [newCardName, setNewCardName] = useState('')
    const [creating, setCreating] = useState(false)
    const [selectedCard, setSelectedCard] = useState(null)
    const [profileForm, setProfileForm] = useState({})
    const [savingProfile, setSavingProfile] = useState(false)
    const [linkModal, setLinkModal] = useState(null)
    const [userId, setUserId] = useState('')
    const [linking, setLinking] = useState(false)
    const [copied, setCopied] = useState('')
    const qrRef = useRef(null)
    const qrCode = useRef(null)

    useEffect(() => { loadCards() }, [])

    useEffect(() => {
        if (selectedCard && qrRef.current) {
            const url = `${window.location.origin}/u/${selectedCard.card_id}`
            if (!qrCode.current) {
                qrCode.current = new QRCodeStyling({
                    width: 200, height: 200, type: 'svg',
                    data: url,
                    dotsOptions: { color: '#1A1265', type: 'rounded' },
                    backgroundOptions: { color: '#EBEBDF' },
                    cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
                })
                qrRef.current.innerHTML = ''
                qrCode.current.append(qrRef.current)
            } else {
                qrCode.current.update({ data: url })
            }
        }
    }, [selectedCard])

    async function loadCards() {
        setLoading(true)
        const { data } = await supabase
            .from('cards')
            .select('*')
            .order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }

    async function createCard() {
        if (!newCardId.trim()) return
        setCreating(true)
        const token = Math.random().toString(36).substring(2, 10).toUpperCase()
        const { error } = await supabase.from('cards').insert({
            card_id: newCardId.trim().toLowerCase(),
            card_name: newCardName.trim() || newCardId.trim(),
            status: 'pending',
            activation_token: token,
            admin_profile: {},
        })
        if (error) alert('Erreur : ' + error.message)
        else { setNewCardId(''); setNewCardName(''); loadCards() }
        setCreating(false)
    }

    async function saveAdminProfile() {
        if (!selectedCard) return
        setSavingProfile(true)
        const { error } = await supabase.from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', selectedCard.card_id)
        if (!error) {
            alert('✅ Profil sauvegardé !')
            loadCards()
        }
        setSavingProfile(false)
    }

    async function linkCard() {
        if (!userId.trim() || !linkModal) return
        setLinking(true)
        const { data: profile, error } = await supabase
            .from('profiles').select('id, full_name').eq('id', userId.trim()).single()
        if (error || !profile) {
            alert('❌ Aucun utilisateur trouvé.')
            setLinking(false)
            return
        }
        await supabase.from('cards').update({ owner_id: userId.trim(), status: 'active' }).eq('card_id', linkModal)
        await supabase.from('profiles').update({ card_id: linkModal }).eq('id', userId.trim())
        await supabase.from('user_cards').upsert({ user_id: userId.trim(), card_id: linkModal, profile_name: profile.full_name })
        alert(`✅ Carte liée à ${profile.full_name} !`)
        setLinking(false)
        setLinkModal(null)
        setUserId('')
        loadCards()
    }

    async function deleteCard(cardId) {
        if (!confirm('Supprimer cette carte ?')) return
        await supabase.from('cards').delete().eq('card_id', cardId)
        loadCards()
    }

    function downloadQR(card) {
        const url = `${window.location.origin}/u/${card.card_id}`
        const qr = new QRCodeStyling({
            width: 1024, height: 1024, type: 'svg',
            data: url,
            dotsOptions: { color: '#1A1265', type: 'rounded' },
            backgroundOptions: { color: '#EBEBDF' },
            cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
        })
        qr.download({ name: `QR-${card.card_id}`, extension: 'png' })
    }

    function copyActivationLink(card) {
        const link = `${window.location.origin}/register?card=${card.card_id}&token=${card.activation_token}`
        navigator.clipboard.writeText(link)
        setCopied(card.card_id)
        setTimeout(() => setCopied(''), 2000)
    }

    function copyPublicLink(cardId) {
        navigator.clipboard.writeText(`${window.location.origin}/u/${cardId}`)
        setCopied('pub_' + cardId)
        setTimeout(() => setCopied(''), 2000)
    }

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'active').length,
        pending: cards.filter(c => c.status === 'pending').length,
    }

    const SOCIAL_FIELDS = [
        { key: 'full_name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont' },
        { key: 'title', label: 'Titre / Poste', type: 'text', placeholder: 'Designer, Entrepreneur...' },
        { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Description...' },
        { key: 'photo_url', label: 'Photo (URL)', type: 'text', placeholder: 'https://...' },
        { key: 'banner_url', label: 'Bannière (URL)', type: 'text', placeholder: 'https://...' },
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

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Header */}
            <header style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '36px' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>NFCrafter</span>
                        <span style={{ background: 'var(--accent)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>ADMIN</span>
                    </div>
                    <button className="btn-ghost" onClick={async () => { await supabase.auth.signOut(); navigate('/login') }} style={{ fontSize: '13px' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: selectedCard ? '1fr 420px' : '1fr', gap: '24px' }}>

                {/* Colonne principale */}
                <div>
                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total cartes', value: stats.total, icon: '💳' },
                            { label: 'Actives', value: stats.active, icon: '✅' },
                            { label: 'En attente', value: stats.pending, icon: '⏳' },
                        ].map(s => (
                            <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{s.icon}</div>
                                <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--accent)' }}>{s.value}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Créer une carte */}
                    <div className="card" style={{ marginBottom: '24px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                            ➕ Nouvelle carte
                        </h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px', display: 'block' }}>ID unique *</label>
                                <input type="text" placeholder="001" value={newCardId} onChange={e => setNewCardId(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCard()} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px', display: 'block' }}>Nom client (pour toi)</label>
                                <input type="text" placeholder="Jean Dupont - Bénin" value={newCardName} onChange={e => setNewCardName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCard()} />
                            </div>
                        </div>
                        <button className="btn-primary" onClick={createCard} disabled={creating} style={{ width: '100%', justifyContent: 'center' }}>
                            {creating ? 'Création...' : '➕ Créer la carte'}
                        </button>
                    </div>

                    {/* Liste cartes */}
                    <div className="card">
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                            💳 Toutes les cartes
                        </h2>
                        {loading ? <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>Chargement...</p> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {cards.map(card => (
                                    <div key={card.card_id} style={{
                                        padding: '14px 16px', border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)', background: selectedCard?.card_id === card.card_id ? 'var(--accent-light)' : 'var(--bg)',
                                        cursor: 'pointer', transition: 'all 0.2s',
                                    }} onClick={() => {
                                        setSelectedCard(card)
                                        setProfileForm(card.admin_profile || {})
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            {/* Infos */}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text)' }}>
                                                        {card.card_name || card.card_id}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: '600', padding: '2px 6px', borderRadius: 'var(--radius-pill)',
                                                        background: card.status === 'active' ? '#e8f5e9' : '#fff3e0',
                                                        color: card.status === 'active' ? '#2e7d32' : '#e65100',
                                                    }}>
                                                        {card.status === 'active' ? '✅ Active' : '⏳ En attente'}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                                                    ID: <strong>{card.card_id}</strong> · Token: <strong>{card.activation_token}</strong>
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                                                <button className="btn-ghost" onClick={() => copyActivationLink(card)}
                                                    style={{ padding: '6px 10px', fontSize: '12px' }}>
                                                    {copied === card.card_id ? '✓' : '🔗 Activ.'}
                                                </button>
                                                <button className="btn-ghost" onClick={() => copyPublicLink(card.card_id)}
                                                    style={{ padding: '6px 10px', fontSize: '12px' }}>
                                                    {copied === 'pub_' + card.card_id ? '✓' : '👁 Lien'}
                                                </button>
                                                <button className="btn-primary" onClick={() => downloadQR(card)}
                                                    style={{ padding: '6px 10px', fontSize: '12px' }}>
                                                    ⬇ QR
                                                </button>
                                                {card.status === 'pending' && (
                                                    <button className="btn-ghost" onClick={() => { setLinkModal(card.card_id); setUserId('') }}
                                                        style={{ padding: '6px 10px', fontSize: '12px' }}>
                                                        🔗 Lier
                                                    </button>
                                                )}
                                                <button onClick={() => deleteCard(card.card_id)} style={{
                                                    background: 'transparent', border: '1px solid #ffcdd2', color: '#e53935',
                                                    borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
                                                }}>🗑</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Panneau droit — édition profil carte */}
                {selectedCard && (
                    <div style={{ position: 'sticky', top: '80px', height: 'fit-content' }}>
                        <div className="card">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: '700', color: 'var(--accent)' }}>
                                    ✏️ Profil — {selectedCard.card_name || selectedCard.card_id}
                                </h2>
                                <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-light)' }}>✕</button>
                            </div>

                            {/* QR Code */}
                            <div style={{ textAlign: 'center', marginBottom: '16px', padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                                <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '8px', overflow: 'hidden' }} />
                                <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '8px' }}>
                                    {window.location.origin}/u/{selectedCard.card_id}
                                </p>
                                <button className="btn-secondary" onClick={() => downloadQR(selectedCard)}
                                    style={{ marginTop: '8px', padding: '6px 16px', fontSize: '12px', width: 'auto' }}>
                                    ⬇ Télécharger QR
                                </button>
                            </div>

                            {/* Lien d'activation */}
                            <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)' }}>
                                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accent)', marginBottom: '6px' }}>
                                    🔗 Lien d'activation client
                                </p>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <input type="text" readOnly
                                        value={`${window.location.origin}/register?card=${selectedCard.card_id}&token=${selectedCard.activation_token}`}
                                        style={{ flex: 1, fontSize: '10px', fontFamily: 'monospace', background: 'white' }}
                                    />
                                    <button className="btn-primary" onClick={() => copyActivationLink(selectedCard)}
                                        style={{ padding: '8px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                        {copied === selectedCard.card_id ? '✓' : '📋'}
                                    </button>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                                    Envoyez ce lien au client pour qu'il active sa carte
                                </p>
                            </div>

                            {/* Formulaire profil */}
                            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                                {SOCIAL_FIELDS.map(field => (
                                    <div key={field.key} className="field">
                                        <label>{field.label}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea rows={2} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                                                style={{ resize: 'none' }}
                                            />
                                        ) : (
                                            <input type={field.type} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => setProfileForm(f => ({ ...f, [field.key]: e.target.value }))}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={saveAdminProfile} disabled={savingProfile}
                                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
                                {savingProfile ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal liaison */}
            {linkModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                    <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)' }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px' }}>
                            🔗 Lier la carte {linkModal}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>
                            Collez l'ID du client pour activer sa carte.
                        </p>
                        <div className="field">
                            <label>ID du client *</label>
                            <textarea rows={3} placeholder="Collez l'ID ici..."
                                value={userId} onChange={e => setUserId(e.target.value)}
                                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-ghost" onClick={() => { setLinkModal(null); setUserId('') }} style={{ flex: 1 }}>Annuler</button>
                            <button className="btn-primary" onClick={linkCard} disabled={linking || !userId.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                                {linking ? 'Liaison...' : '✅ Activer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}