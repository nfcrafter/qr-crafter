import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [newCardId, setNewCardId] = useState('')
    const [creating, setCreating] = useState(false)
    const [copied, setCopied] = useState('')
    const [linkModal, setLinkModal] = useState(null)
    const [userId, setUserId] = useState('')
    const [linking, setLinking] = useState(false)

    useEffect(() => { loadCards() }, [])

    async function loadCards() {
        setLoading(true)
        const { data } = await supabase
            .from('cards')
            .select('*, profiles(full_name, photo_url, whatsapp, email)')
            .order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }

    async function createCard() {
        if (!newCardId.trim()) return
        setCreating(true)
        const { error } = await supabase
            .from('cards')
            .insert({ card_id: newCardId.trim().toLowerCase(), status: 'pending' })
        if (error) {
            alert('Erreur : ' + error.message)
        } else {
            setNewCardId('')
            loadCards()
        }
        setCreating(false)
    }

    async function linkCard() {
        if (!userId.trim() || !linkModal) return
        setLinking(true)

        // Vérifier que l'utilisateur existe
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name')
            .eq('id', userId.trim())
            .single()

        if (profileError || !profile) {
            alert('❌ Aucun utilisateur trouvé avec cet ID. Vérifiez l\'ID.')
            setLinking(false)
            return
        }

        // Lier la carte à l'utilisateur
        const { error: cardError } = await supabase
            .from('cards')
            .update({ owner_id: userId.trim(), status: 'active' })
            .eq('card_id', linkModal)

        if (cardError) {
            alert('Erreur : ' + cardError.message)
            setLinking(false)
            return
        }

        // Mettre à jour le profil avec le card_id
        await supabase
            .from('profiles')
            .update({ card_id: linkModal })
            .eq('id', userId.trim())

        alert(`✅ Carte ${linkModal} liée à ${profile.full_name} avec succès !`)
        setLinking(false)
        setLinkModal(null)
        setUserId('')
        loadCards()
    }

    async function unlinkCard(cardId) {
        if (!confirm('Délier cette carte de son propriétaire ?')) return
        const card = cards.find(c => c.card_id === cardId)
        if (card?.owner_id) {
            await supabase.from('profiles').update({ card_id: null }).eq('id', card.owner_id)
        }
        await supabase.from('cards').update({ owner_id: null, status: 'pending' }).eq('card_id', cardId)
        loadCards()
    }

    async function deleteCard(cardId) {
        if (!confirm('Supprimer cette carte ?')) return
        await supabase.from('cards').delete().eq('card_id', cardId)
        loadCards()
    }

    async function logout() {
        await supabase.auth.signOut()
        navigate('/login')
    }

    function copyLink(cardId) {
        const link = `${window.location.origin}/u/${cardId}`
        navigator.clipboard.writeText(link)
        setCopied(cardId)
        setTimeout(() => setCopied(''), 2000)
    }

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'active').length,
        pending: cards.filter(c => c.status === 'pending').length,
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Header */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '1200px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '36px', width: 'auto' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                            NFCrafter
                        </span>
                        <span style={{
                            background: 'var(--accent)', color: 'white', fontSize: '11px',
                            fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-pill)',
                            marginLeft: '4px',
                        }}>ADMIN</span>
                    </div>
                    <button className="btn-ghost" onClick={logout} style={{ padding: '8px 16px', fontSize: '13px' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    {[
                        { label: 'Total cartes', value: stats.total, icon: '💳' },
                        { label: 'Cartes actives', value: stats.active, icon: '✅' },
                        { label: 'En attente', value: stats.pending, icon: '⏳' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ textAlign: 'center', padding: '24px' }}>
                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
                                {s.value}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Créer une carte */}
                <div className="card" style={{ marginBottom: '24px' }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                        ➕ Créer une nouvelle carte
                    </h2>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <input
                            type="text"
                            placeholder="ID de la carte (ex: 001, abc123...)"
                            value={newCardId}
                            onChange={e => setNewCardId(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && createCard()}
                            style={{ flex: 1 }}
                        />
                        <button className="btn-primary" onClick={createCard} disabled={creating}
                            style={{ whiteSpace: 'nowrap', padding: '10px 24px' }}>
                            {creating ? 'Création...' : 'Créer la carte'}
                        </button>
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '8px' }}>
                        Le lien généré sera : {window.location.origin}/u/<strong>{newCardId || 'id-carte'}</strong>
                    </p>
                </div>

                {/* Liste des cartes */}
                <div className="card">
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                        💳 Toutes les cartes
                    </h2>

                    {loading ? (
                        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>Chargement...</p>
                    ) : cards.length === 0 ? (
                        <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '40px' }}>
                            Aucune carte créée pour l'instant
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {cards.map(card => (
                                <div key={card.card_id} style={{
                                    display: 'flex', alignItems: 'center', gap: '16px',
                                    padding: '16px 20px', border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)', background: 'var(--bg)',
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: '50%',
                                        background: card.profiles?.photo_url ? 'transparent' : 'var(--accent-light)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '20px', flexShrink: 0, overflow: 'hidden',
                                    }}>
                                        {card.profiles?.photo_url
                                            ? <img src={card.profiles.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            : '👤'
                                        }
                                    </div>

                                    {/* Infos */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text)' }}>
                                                {card.profiles?.full_name || 'Non activée'}
                                            </span>
                                            <span style={{
                                                fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                                                borderRadius: 'var(--radius-pill)',
                                                background: card.status === 'active' ? '#e8f5e9' : '#fff3e0',
                                                color: card.status === 'active' ? '#2e7d32' : '#e65100',
                                            }}>
                                                {card.status === 'active' ? '✅ Active' : '⏳ En attente'}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                            ID carte : <strong>{card.card_id}</strong> · {window.location.origin}/u/{card.card_id}
                                        </p>
                                        {card.profiles?.email && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                                ✉️ {card.profiles.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                        <button className="btn-ghost"
                                            onClick={() => copyLink(card.card_id)}
                                            style={{ padding: '8px 12px', fontSize: '13px' }}>
                                            {copied === card.card_id ? '✓ Copié' : '🔗 Lien'}
                                        </button>

                                        {card.status === 'pending' ? (
                                            <button className="btn-primary"
                                                onClick={() => { setLinkModal(card.card_id); setUserId('') }}
                                                style={{ padding: '8px 14px', fontSize: '13px' }}>
                                                🔗 Lier un client
                                            </button>
                                        ) : (
                                            <button className="btn-ghost"
                                                onClick={() => unlinkCard(card.card_id)}
                                                style={{ padding: '8px 12px', fontSize: '13px', color: '#e65100', borderColor: '#e65100' }}>
                                                🔓 Délier
                                            </button>
                                        )}

                                        <a href={`${window.location.origin}/u/${card.card_id}`} target="_blank"
                                            style={{
                                                padding: '8px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)',
                                                border: '1px solid var(--border)', color: 'var(--text-light)',
                                                textDecoration: 'none', display: 'flex', alignItems: 'center',
                                            }}>
                                            👁 Voir
                                        </a>

                                        <button onClick={() => deleteCard(card.card_id)} style={{
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
                </div>
            </main>

            {/* Modal liaison */}
            {linkModal && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: '16px',
                }}>
                    <div style={{
                        background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)',
                        padding: '32px', width: '100%', maxWidth: '480px',
                        boxShadow: 'var(--shadow-lg)',
                    }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px' }}>
                            🔗 Lier la carte {linkModal}
                        </h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '20px' }}>
                            Collez l'ID du client envoyé par WhatsApp pour activer sa carte.
                        </p>
                        <div className="field">
                            <label>ID du client *</label>
                            <textarea
                                rows={3}
                                placeholder="Collez l'ID ici (ex: a1b2c3d4-e5f6-...)"
                                value={userId}
                                onChange={e => setUserId(e.target.value)}
                                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-ghost" onClick={() => { setLinkModal(null); setUserId('') }}
                                style={{ flex: 1 }}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={linkCard} disabled={linking || !userId.trim()}
                                style={{ flex: 1, justifyContent: 'center' }}>
                                {linking ? 'Liaison...' : '✅ Activer la carte'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}