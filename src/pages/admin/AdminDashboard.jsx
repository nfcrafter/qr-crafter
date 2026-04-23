import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useToast } from '../../components/Toast.jsx'
import Modal from '../../components/Modal.jsx'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const toast = useToast()

    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [page, setPage] = useState(1)
    const [perPage] = useState(10)

    // Modal créer carte
    const [createModal, setCreateModal] = useState(false)
    const [newCardId, setNewCardId] = useState('')
    const [newCardName, setNewCardName] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => { loadCards() }, [])

    async function loadCards() {
        setLoading(true)
        const { data } = await supabase
            .from('cards').select('*').order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }

    async function createCard() {
        if (!newCardId.trim()) { toast("L'ID de la carte est obligatoire", 'error'); return }
        setCreating(true)
        const token = Math.random().toString(36).substring(2, 10).toUpperCase()
        const { error } = await supabase.from('cards').insert({
            card_id: newCardId.trim().toLowerCase(),
            card_name: newCardName.trim() || newCardId.trim(),
            status: 'pending',
            activation_token: token,
            admin_profile: {},
        })
        if (error) {
            toast(error.message.includes('unique') ? 'Cet ID existe déjà' : error.message, 'error')
        } else {
            toast(`Carte "${newCardId}" créée !`, 'success')
            setNewCardId(''); setNewCardName('')
            setCreateModal(false)
            loadCards()
        }
        setCreating(false)
    }

    // Filtrage + pagination
    const filtered = cards.filter(c => {
        const matchSearch = !search ||
            c.card_id?.toLowerCase().includes(search.toLowerCase()) ||
            c.card_name?.toLowerCase().includes(search.toLowerCase()) ||
            (c.admin_profile?.full_name || '').toLowerCase().includes(search.toLowerCase())
        const matchStatus = !filterStatus || c.status === filterStatus
        return matchSearch && matchStatus
    })

    const totalPages = Math.ceil(filtered.length / perPage)
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'active').length,
        pending: cards.filter(c => c.status === 'pending').length,
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Header */}
            <header style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
                    {[
                        { label: 'Total cartes', value: stats.total, icon: '💳', color: 'var(--accent)' },
                        { label: 'Cartes actives', value: stats.active, icon: '✅', color: '#2e7d32' },
                        { label: 'En attente', value: stats.pending, icon: '⏳', color: '#e65100' },
                    ].map(s => (
                        <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px' }}>
                            <div style={{ fontSize: '28px', marginBottom: '4px' }}>{s.icon}</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Barre d'outils */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="text" placeholder="🔍 Rechercher par nom, ID..."
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                        style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}
                    />
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
                        style={{ width: '160px' }}>
                        <option value="">Tous les statuts</option>
                        <option value="active">✅ Actives</option>
                        <option value="pending">⏳ En attente</option>
                    </select>
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn-primary" onClick={() => setCreateModal(true)} style={{ whiteSpace: 'nowrap' }}>
                            ➕ Nouvelle carte
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* En-tête */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 140px 120px 140px',
                        padding: '12px 20px',
                        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
                        fontSize: '12px', fontWeight: '700', color: 'var(--text-light)',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        <span>ID Carte</span>
                        <span>Client</span>
                        <span>Statut</span>
                        <span>Scans</span>
                        <span style={{ textAlign: 'right' }}>Action</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>Chargement...</div>
                    ) : paginated.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                            <p>Aucune carte trouvée</p>
                        </div>
                    ) : (
                        paginated.map((card, i) => (
                            <div key={card.card_id} style={{
                                display: 'grid',
                                gridTemplateColumns: '100px 1fr 140px 120px 140px',
                                padding: '14px 20px',
                                borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                                alignItems: 'center',
                                transition: 'background 0.15s',
                                cursor: 'default',
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                {/* ID */}
                                <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>
                                    {card.card_id}
                                </span>

                                {/* Client */}
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>
                                        {card.admin_profile?.full_name || card.card_name || '—'}
                                    </div>
                                    {card.card_name && card.admin_profile?.full_name && (
                                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>{card.card_name}</div>
                                    )}
                                </div>

                                {/* Statut */}
                                <span style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                    fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                                    borderRadius: 'var(--radius-pill)',
                                    background: card.status === 'active' ? '#e8f5e9' : '#fff3e0',
                                    color: card.status === 'active' ? '#2e7d32' : '#e65100',
                                    width: 'fit-content',
                                }}>
                                    {card.status === 'active' ? '✅ Active' : '⏳ En attente'}
                                </span>

                                {/* Scans */}
                                <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '600' }}>
                                    —
                                </span>

                                {/* Bouton Paramètres */}
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => navigate(`/admin/cards/${card.card_id}`)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '8px 16px',
                                            background: 'var(--bg-white)',
                                            border: '1.5px solid var(--border)',
                                            borderRadius: 'var(--radius-sm)',
                                            cursor: 'pointer', fontSize: '13px',
                                            fontWeight: '600', color: 'var(--accent)',
                                            fontFamily: 'var(--font-body)',
                                            transition: 'all 0.15s',
                                        }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.background = 'var(--accent-light)'
                                            e.currentTarget.style.borderColor = 'var(--accent)'
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.background = 'var(--bg-white)'
                                            e.currentTarget.style.borderColor = 'var(--border)'
                                        }}
                                    >
                                        ⚙️ Paramètres
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Pagination */}
                    {filtered.length > perPage && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px', borderTop: '1px solid var(--border)',
                            background: 'var(--bg)',
                        }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                {filtered.length} carte{filtered.length > 1 ? 's' : ''} — page {page}/{totalPages}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                    style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    ← Précédent
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} style={{
                                        padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)',
                                        border: p === page ? 'none' : '1px solid var(--border)',
                                        background: p === page ? 'var(--accent)' : 'transparent',
                                        color: p === page ? 'white' : 'var(--text-light)',
                                        cursor: 'pointer',
                                    }}>{p}</button>
                                ))}
                                <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    Suivant →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal créer carte */}
            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="➕ Créer une nouvelle carte" size="sm">
                <div className="field">
                    <label>ID unique de la carte *</label>
                    <input type="text" placeholder="ex: 001, abc123..."
                        value={newCardId} onChange={e => setNewCardId(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && createCard()}
                        autoFocus
                    />
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
                        Lien généré : {window.location.origin}/u/<strong>{newCardId || 'id-carte'}</strong>
                    </p>
                </div>
                <div className="field">
                    <label>Nom du client (pour ta référence)</label>
                    <input type="text" placeholder="ex: Jean Dupont - Cotonou"
                        value={newCardName} onChange={e => setNewCardName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && createCard()}
                    />
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                    <button className="btn-ghost" onClick={() => setCreateModal(false)} style={{ flex: 1 }}>Annuler</button>
                    <button className="btn-primary" onClick={createCard} disabled={creating} style={{ flex: 1, justifyContent: 'center' }}>
                        {creating ? 'Création...' : '➕ Créer'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}