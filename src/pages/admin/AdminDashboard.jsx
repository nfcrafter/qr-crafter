import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function AdminDashboard() {
    const navigate = useNavigate()
    const toast = useToast()
    const qrRef = useRef(null)
    const qrCode = useRef(null)

    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [page, setPage] = useState(1)
    const [perPage] = useState(10)

    // Modals
    const [createModal, setCreateModal] = useState(false)
    const [profileModal, setProfileModal] = useState(null)
    const [qrModal, setQrModal] = useState(null)
    const [linkModal, setLinkModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null)

    // Forms
    const [newCardId, setNewCardId] = useState('')
    const [newCardName, setNewCardName] = useState('')
    const [creating, setCreating] = useState(false)
    const [profileForm, setProfileForm] = useState({})
    const [savingProfile, setSavingProfile] = useState(false)
    const [userId, setUserId] = useState('')
    const [linking, setLinking] = useState(false)

    useEffect(() => { loadCards() }, [])

    useEffect(() => {
        if (qrModal && qrRef.current) {
            const url = `${window.location.origin}/u/${qrModal.card_id}`
            if (!qrCode.current) {
                qrCode.current = new QRCodeStyling({
                    width: 240, height: 240, type: 'svg',
                    data: url,
                    dotsOptions: { color: '#1A1265', type: 'rounded' },
                    backgroundOptions: { color: '#EBEBDF' },
                    cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
                })
                qrRef.current.innerHTML = ''
                qrCode.current.append(qrRef.current)
            } else {
                qrCode.current.update({ data: url })
                qrRef.current.innerHTML = ''
                qrCode.current.append(qrRef.current)
            }
        }
    }, [qrModal])

    async function loadCards() {
        setLoading(true)
        const { data } = await supabase
            .from('cards').select('*').order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }

    async function createCard() {
        if (!newCardId.trim()) { toast('L\'ID de la carte est obligatoire', 'error'); return }
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
            toast(`Carte "${newCardId}" créée avec succès !`, 'success')
            setNewCardId(''); setNewCardName('')
            setCreateModal(false)
            loadCards()
        }
        setCreating(false)
    }

    async function saveProfile() {
        if (!profileModal) return
        setSavingProfile(true)
        const { error } = await supabase.from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', profileModal.card_id)
        if (error) toast('Erreur lors de la sauvegarde', 'error')
        else {
            toast('Profil sauvegardé !', 'success')
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
            toast('Aucun utilisateur trouvé avec cet ID', 'error')
            setLinking(false)
            return
        }
        await supabase.from('cards')
            .update({ owner_id: userId.trim(), status: 'active' })
            .eq('card_id', linkModal.card_id)
        await supabase.from('profiles')
            .update({ card_id: linkModal.card_id })
            .eq('id', userId.trim())
        await supabase.from('user_cards').upsert({
            user_id: userId.trim(),
            card_id: linkModal.card_id,
            profile_name: profile.full_name,
        })
        toast(`Carte liée à ${profile.full_name} !`, 'success')
        setLinking(false)
        setLinkModal(null)
        setUserId('')
        loadCards()
    }

    async function deleteCard() {
        if (!deleteModal) return
        const { error } = await supabase.from('cards').delete().eq('card_id', deleteModal.card_id)
        if (error) toast('Erreur lors de la suppression', 'error')
        else {
            toast(`Carte "${deleteModal.card_id}" supprimée`, 'warning')
            setDeleteModal(null)
            loadCards()
        }
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
        qr.download({ name: `QR-NFCrafter-${card.card_id}`, extension: 'png' })
        toast('QR Code téléchargé !', 'success')
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text)
        toast(`${label} copié !`, 'info')
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

    // Grouper par owner
    const grouped = {}
    filtered.forEach(card => {
        const key = card.owner_id || `__pending__${card.card_id}`
        const name = card.admin_profile?.full_name || card.card_name || 'Sans client'
        if (!grouped[key]) grouped[key] = { name, cards: [], owner_id: card.owner_id }
        grouped[key].cards.push(card)
    })
    const groups = Object.values(grouped)

    // Pagination sur les cartes filtrées
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

                {/* Data Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* En-tête table */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 140px 120px 200px',
                        gap: '0', padding: '12px 20px',
                        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
                        fontSize: '12px', fontWeight: '700', color: 'var(--text-light)',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        <span>ID Carte</span>
                        <span>Client</span>
                        <span>Statut</span>
                        <span>Scans</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
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
                                gridTemplateColumns: '100px 1fr 140px 120px 200px',
                                gap: '0', padding: '14px 20px',
                                borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                                alignItems: 'center',
                                transition: 'background 0.15s',
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
                                    <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                        {card.card_name && card.admin_profile?.full_name ? card.card_name : ''}
                                    </div>
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
                                    — scans
                                </span>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <ActionBtn title="Voir la page" icon="👁" onClick={() => window.open(`/u/${card.card_id}`, '_blank')} color="var(--text-light)" />
                                    <ActionBtn title="QR Code" icon="▣" onClick={() => setQrModal(card)} color="#7C3AED" />
                                    <ActionBtn title="Paramètres" icon="⚙️" onClick={() => navigate(`/admin/card/${card.card_id}`)} color="#1A1265" />
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

            {/* ===== MODALS ===== */}

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

            {/* Modal profil */}
            <Modal isOpen={!!profileModal} onClose={() => setProfileModal(null)} title={`✏️ Profil — ${profileModal?.card_name || profileModal?.card_id}`} size="lg">
                {profileModal && (
                    <>
                        {/* Lien activation */}
                        <div style={{ padding: '12px', background: 'var(--accent-light)', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
                            <p style={{ fontSize: '12px', fontWeight: '700', color: 'var(--accent)', marginBottom: '8px' }}>
                                🔗 Lien d'activation à envoyer au client
                            </p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input type="text" readOnly
                                    value={`${window.location.origin}/register?card=${profileModal.card_id}&token=${profileModal.activation_token}`}
                                    style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }}
                                />
                                <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '8px 14px', fontSize: '12px' }}
                                    onClick={() => copyText(`${window.location.origin}/register?card=${profileModal.card_id}&token=${profileModal.activation_token}`, 'Lien d\'activation')}>
                                    📋 Copier
                                </button>
                            </div>
                        </div>

                        {/* Champs profil */}
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

                        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                            <button className="btn-ghost" onClick={() => setProfileModal(null)} style={{ flex: 1 }}>Annuler</button>
                            <button className="btn-primary" onClick={saveProfile} disabled={savingProfile} style={{ flex: 1, justifyContent: 'center' }}>
                                {savingProfile ? 'Sauvegarde...' : '💾 Sauvegarder'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Modal QR Code */}
            <Modal isOpen={!!qrModal} onClose={() => { setQrModal(null); qrCode.current = null }} title={`▣ QR Code — ${qrModal?.card_id}`} size="sm">
                {qrModal && (
                    <div style={{ textAlign: 'center' }}>
                        <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }} />
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '20px', fontFamily: 'monospace' }}>
                            {window.location.origin}/u/{qrModal.card_id}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={() => copyText(`${window.location.origin}/u/${qrModal.card_id}`, 'Lien NFC')}
                                style={{ padding: '10px 20px' }}>
                                📡 Copier lien NFC
                            </button>
                            <button className="btn-primary" onClick={() => downloadQR(qrModal)}
                                style={{ padding: '10px 20px' }}>
                                ⬇ Télécharger PNG
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal lier client */}
            <Modal isOpen={!!linkModal} onClose={() => { setLinkModal(null); setUserId('') }} title={`🔗 Lier la carte ${linkModal?.card_id}`} size="sm">
                {linkModal && (
                    <>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                            Collez l'ID du client pour activer sa carte.
                        </p>
                        <div className="field">
                            <label>ID du client *</label>
                            <textarea rows={3} placeholder="Collez l'ID ici..."
                                value={userId} onChange={e => setUserId(e.target.value)}
                                style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-ghost" onClick={() => { setLinkModal(null); setUserId('') }} style={{ flex: 1 }}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={linkCard} disabled={linking || !userId.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                                {linking ? 'Liaison...' : '✅ Activer la carte'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* Modal supprimer */}
            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="🗑 Supprimer la carte" size="sm">
                {deleteModal && (
                    <>
                        <p style={{ fontSize: '15px', color: 'var(--text)', marginBottom: '8px' }}>
                            Voulez-vous vraiment supprimer la carte <strong>{deleteModal.card_id}</strong> ?
                        </p>
                        <p style={{ fontSize: '13px', color: 'var(--error)', marginBottom: '24px' }}>
                            ⚠️ Cette action est irréversible. Le lien `/u/{deleteModal.card_id}` ne fonctionnera plus.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-ghost" onClick={() => setDeleteModal(null)} style={{ flex: 1 }}>
                                Annuler
                            </button>
                            <button onClick={deleteCard} style={{
                                flex: 1, padding: '11px', background: '#e53935', color: 'white',
                                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                                fontSize: '14px', fontWeight: '600',
                            }}>
                                🗑 Supprimer définitivement
                            </button>
                        </div>
                    </>
                )}
            </Modal>

        </div>
    )
}

function ActionBtn({ icon, title, onClick, color }) {
    return (
        <button
            title={title}
            onClick={onClick}
            style={{
                width: '32px', height: '32px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-white)',
                cursor: 'pointer', fontSize: '15px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', color,
            }}
            onMouseEnter={e => {
                e.currentTarget.style.background = color + '15'
                e.currentTarget.style.borderColor = color
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-white)'
                e.currentTarget.style.borderColor = 'var(--border)'
            }}
        >
            {icon}
        </button>
    )
}