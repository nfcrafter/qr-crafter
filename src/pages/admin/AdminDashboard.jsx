import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useToast } from '../../components/Toast.jsx'
import Modal from '../../components/Modal.jsx'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'

export default function AdminDashboard() {
    const navigate = useNavigate()
    const toast = useToast()

    const [cards, setCards] = useState([])
    const [folders, setFolders] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState(null)
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [page, setPage] = useState(1)
    const [perPage] = useState(12)

    // Modal créer carte
    const [createModal, setCreateModal] = useState(false)
    const [newCardId, setNewCardId] = useState('')
    const [newCardName, setNewCardName] = useState('')
    const [newCardCity, setNewCardCity] = useState('')
    const [newCardCountry, setNewCardCountry] = useState('Bénin')
    const [newCardFolder, setNewCardFolder] = useState('')
    const [nextId, setNextId] = useState('...')
    const [creating, setCreating] = useState(false)

    useEffect(() => { loadAll() }, [])

    async function loadAll() {
        setLoading(true)
        const [{ data: cardsData }, { data: foldersData }] = await Promise.all([
            supabase.from('cards').select('*').order('created_at', { ascending: false }),
            supabase.from('folders').select('*').order('created_at'),
        ])
        setCards(cardsData || [])
        setFolders(foldersData || [])
        setLoading(false)
    }

    async function loadNextId() {
        // Trouver le prochain numéro séquentiel disponible
        const { data } = await supabase.from('cards').select('card_id').order('created_at', { ascending: false })
        const existing = (data || []).map(c => c.card_id)
        let n = (data?.length || 0) + 1
        let formatted = String(n).padStart(3, '0')
        while (existing.includes(formatted)) {
            n++
            formatted = String(n).padStart(3, '0')
        }
        setNextId(formatted)
        setNewCardId(formatted)
    }

    async function openCreateModal() {
        setCreateModal(true)
        await loadNextId()
    }

    async function createCard() {
        const cardId = newCardId.trim() || nextId
        if (!cardId) { toast("L'ID de la carte est obligatoire", 'error'); return }
        setCreating(true)
        const token = Math.random().toString(36).substring(2, 10).toUpperCase()
        const { error } = await supabase.from('cards').insert({
            card_id: cardId.toLowerCase(),
            card_name: newCardName.trim() || cardId,
            status: 'pending',
            activation_token: token,
            admin_profile: {},
            city: newCardCity.trim() || null,
            country: newCardCountry.trim() || 'Bénin',
            folder_id: newCardFolder || null,
        })
        if (error) {
            toast(error.message.includes('unique') ? 'Cet ID existe déjà' : error.message, 'error')
        } else {
            toast(`Carte #${cardId} créée !`, 'success')
            setNewCardId(''); setNewCardName(''); setNewCardCity(''); setNewCardFolder('')
            setNewCardCountry('Bénin')
            setCreateModal(false)
            loadAll()
        }
        setCreating(false)
    }

    function handleFolderSelect(folderId, statusFilter) {
        setSelectedFolder(folderId)
        setFilterStatus(statusFilter)
        setPage(1)
    }

    // Filtrage
    const filtered = cards.filter(c => {
        const matchSearch = !search ||
            c.card_id?.toLowerCase().includes(search.toLowerCase()) ||
            c.card_name?.toLowerCase().includes(search.toLowerCase()) ||
            (c.admin_profile?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.city || '').toLowerCase().includes(search.toLowerCase())
        const matchFolder = !selectedFolder || c.folder_id === selectedFolder
        const matchStatus = !filterStatus || c.status === filterStatus
        return matchSearch && matchFolder && matchStatus
    })

    const totalPages = Math.ceil(filtered.length / perPage)
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    const currentFolder = folders.find(f => f.id === selectedFolder)

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Sidebar */}
            <AdminSidebar
                onFolderSelect={handleFolderSelect}
                selectedFolder={selectedFolder}
            />

            {/* Contenu principal */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* Header */}
                <header style={{
                    background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                    padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
                }}>
                    <div style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                        <div>
                            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '17px', color: 'var(--accent)', margin: 0 }}>
                                {currentFolder
                                    ? `${currentFolder.type === 'city' ? '🏙️' : currentFolder.type === 'status' ? '📊' : '📁'} ${currentFolder.name}`
                                    : filterStatus === 'active' ? '✅ Cartes actives'
                                        : filterStatus === 'pending' ? '⏳ En attente'
                                            : '💳 Toutes les cartes'}
                            </h1>
                            <p style={{ fontSize: '12px', color: 'var(--text-light)', margin: 0 }}>
                                {filtered.length} carte{filtered.length > 1 ? 's' : ''}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <input type="text" placeholder="🔍 Rechercher..."
                                value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                                style={{ width: '220px', fontSize: '13px' }}
                            />
                            <button className="btn-primary" onClick={openCreateModal} style={{ whiteSpace: 'nowrap', fontSize: '13px' }}>
                                ➕ Nouvelle carte
                            </button>
                        </div>
                    </div>
                </header>

                {/* Table des cartes */}
                <main style={{ flex: 1, padding: '24px' }}>
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

                        {/* En-tête table */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '80px 1fr 140px 160px 130px',
                            padding: '11px 20px',
                            background: 'var(--bg)', borderBottom: '1px solid var(--border)',
                            fontSize: '11px', fontWeight: '700', color: 'var(--text-light)',
                            textTransform: 'uppercase', letterSpacing: '0.6px',
                        }}>
                            <span>ID</span>
                            <span>Client</span>
                            <span>Statut</span>
                            <span>Ville / Pays</span>
                            <span style={{ textAlign: 'right' }}>Action</span>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
                                Chargement...
                            </div>
                        ) : paginated.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                                <p style={{ marginBottom: '16px' }}>Aucune carte trouvée</p>
                                <button className="btn-primary" onClick={openCreateModal}>
                                    ➕ Créer une carte
                                </button>
                            </div>
                        ) : (
                            paginated.map((card, i) => (
                                <div key={card.card_id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '80px 1fr 140px 160px 130px',
                                    padding: '13px 20px',
                                    borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                                    alignItems: 'center',
                                    transition: 'background 0.12s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    {/* ID */}
                                    <span style={{
                                        fontFamily: 'monospace', fontWeight: '800', fontSize: '15px',
                                        color: 'var(--accent)',
                                    }}>
                                        #{card.card_id}
                                    </span>

                                    {/* Client */}
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)', marginBottom: '2px' }}>
                                            {card.admin_profile?.full_name || card.card_name || '—'}
                                        </div>
                                        {card.admin_profile?.full_name && card.card_name && (
                                            <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                                {card.card_name}
                                            </div>
                                        )}
                                    </div>

                                    {/* Statut */}
                                    <div>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            fontSize: '12px', fontWeight: '600', padding: '4px 10px',
                                            borderRadius: 'var(--radius-pill)',
                                            background: card.status === 'active' ? '#e8f5e9' : '#fff3e0',
                                            color: card.status === 'active' ? '#2e7d32' : '#e65100',
                                        }}>
                                            {card.status === 'active' ? '✅ Active' : '⏳ Attente'}
                                        </span>
                                    </div>

                                    {/* Ville / Pays */}
                                    <div style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        {card.city ? (
                                            <span>🏙️ {card.city}{card.country ? `, ${card.country}` : ''}</span>
                                        ) : (
                                            <span style={{ fontStyle: 'italic' }}>—</span>
                                        )}
                                    </div>

                                    {/* Bouton Paramètres */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button onClick={() => navigate(`/admin/card/${card.card_id}`)} style={{
                                            display: 'flex', alignItems: 'center', gap: '6px',
                                            padding: '7px 14px',
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
                                padding: '12px 20px', borderTop: '1px solid var(--border)',
                                background: 'var(--bg)',
                            }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                    Page {page} / {totalPages} — {filtered.length} carte{filtered.length > 1 ? 's' : ''}
                                </span>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                        style={{ padding: '5px 12px', fontSize: '12px' }}>
                                        ← Précédent
                                    </button>
                                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
                                        <button key={p} onClick={() => setPage(p)} style={{
                                            padding: '5px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)',
                                            border: p === page ? 'none' : '1px solid var(--border)',
                                            background: p === page ? 'var(--accent)' : 'transparent',
                                            color: p === page ? 'white' : 'var(--text-light)',
                                            cursor: 'pointer',
                                        }}>{p}</button>
                                    ))}
                                    <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                        style={{ padding: '5px 12px', fontSize: '12px' }}>
                                        Suivant →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modal créer carte */}
            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="➕ Nouvelle carte NFC" size="sm">
                <div className="field">
                    <label>ID de la carte</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '22px', color: 'var(--accent)', background: 'var(--accent-light)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}>
                            #
                        </span>
                        <input type="text" placeholder={nextId}
                            value={newCardId}
                            onChange={e => setNewCardId(e.target.value)}
                            style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '18px' }}
                        />
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                        ID auto-généré : <strong>#{nextId}</strong> — modifiable si besoin
                    </p>
                </div>

                <div className="field">
                    <label>Nom du client *</label>
                    <input type="text" placeholder="ex: Kouamé Jean"
                        value={newCardName} onChange={e => setNewCardName(e.target.value)}
                        autoFocus
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="field" style={{ margin: 0 }}>
                        <label>Ville</label>
                        <input type="text" placeholder="ex: Cotonou"
                            value={newCardCity} onChange={e => setNewCardCity(e.target.value)}
                        />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                        <label>Pays</label>
                        <input type="text" placeholder="ex: Bénin"
                            value={newCardCountry} onChange={e => setNewCardCountry(e.target.value)}
                        />
                    </div>
                </div>

                {folders.length > 0 && (
                    <div className="field">
                        <label>Dossier (optionnel)</label>
                        <select value={newCardFolder} onChange={e => setNewCardFolder(e.target.value)}>
                            <option value="">— Aucun dossier</option>
                            {folders.map(f => (
                                <option key={f.id} value={f.id}>
                                    {f.type === 'city' ? '🏙️' : f.type === 'status' ? '📊' : '📁'} {f.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '16px' }}>
                    🌐 Lien NFC : <strong>{window.location.origin}/u/{newCardId || nextId}</strong>
                </p>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-ghost" onClick={() => setCreateModal(false)} style={{ flex: 1 }}>
                        Annuler
                    </button>
                    <button className="btn-primary" onClick={createCard} disabled={creating} style={{ flex: 1, justifyContent: 'center' }}>
                        {creating ? 'Création...' : '➕ Créer la carte'}
                    </button>
                </div>
            </Modal>
        </div>
    )
}