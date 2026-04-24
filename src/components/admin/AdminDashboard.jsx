import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useToast } from '../../components/Toast.jsx'
import Modal from '../../components/Modal.jsx'
import AdminSidebar from '../../components/admin/AdminSidebar.jsx'
import QRCodeStyling from 'qr-code-styling'

function generateId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const toast = useToast()

    const [cards, setCards] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [page, setPage] = useState(1)
    const perPage = 10

    // Modals
    const [createModal, setCreateModal] = useState(false)
    const [qrModal, setQrModal] = useState(null)
    const [deleteModal, setDeleteModal] = useState(null)

    // Create form
    const [form, setForm] = useState({
        clientName: '', city: '', country: 'Bénin',
        pageType: 'profile', redirectUrl: '',
        wifiSsid: '', wifiPassword: '', wifiSecurity: 'WPA',
        folderId: '',
    })
    const [creating, setCreating] = useState(false)
    const [folders, setFolders] = useState([])

    const qrCodeRef = { current: null }

    useEffect(() => { loadCards(); loadFolders() }, [])

    async function loadCards() {
        setLoading(true)
        const { data } = await supabase
            .from('cards').select('*').order('created_at', { ascending: false })
        setCards(data || [])
        setLoading(false)
    }

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at')
        setFolders(data || [])
    }

    async function createCard() {
        if (!form.clientName.trim()) { toast('Le nom du client est obligatoire', 'error'); return }
        setCreating(true)

        let cardId = generateId()
        // Vérifier unicité
        let exists = true
        while (exists) {
            const { data } = await supabase.from('cards').select('card_id').eq('card_id', cardId).single()
            if (!data) exists = false
            else cardId = generateId()
        }

        const token = Array.from({ length: 8 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')

        const { error } = await supabase.from('cards').insert({
            card_id: cardId,
            card_name: form.clientName.trim(),
            city: form.city.trim(),
            country: form.country.trim(),
            status: 'pending',
            activation_token: token,
            page_type: form.pageType,
            redirect_url: form.pageType === 'url' ? form.redirectUrl : null,
            wifi_ssid: form.pageType === 'wifi' ? form.wifiSsid : null,
            wifi_password: form.pageType === 'wifi' ? form.wifiPassword : null,
            wifi_security: form.pageType === 'wifi' ? form.wifiSecurity : null,
            folder_id: form.folderId || null,
            admin_profile: {},
        })

        if (error) {
            toast('Erreur : ' + error.message, 'error')
        } else {
            toast(`Carte créée ! ID: ${cardId}`, 'success')
            setForm({ clientName: '', city: '', country: 'Bénin', pageType: 'profile', redirectUrl: '', wifiSsid: '', wifiPassword: '', wifiSecurity: 'WPA', folderId: '' })
            setCreateModal(false)
            loadCards()
        }
        setCreating(false)
    }

    async function deleteCard() {
        if (!deleteModal) return
        await supabase.from('cards').delete().eq('card_id', deleteModal.card_id)
        toast('Carte supprimée', 'warning')
        setDeleteModal(null)
        loadCards()
    }

    function downloadQR(card) {
        const qr = new QRCodeStyling({
            width: 1024, height: 1024, type: 'svg',
            data: `${window.location.origin}/u/${card.card_id}`,
            dotsOptions: { color: '#1A1265', type: 'rounded' },
            backgroundOptions: { color: '#EBEBDF' },
            cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
        })
        qr.download({ name: `QR-NFCrafter-${card.card_id}`, extension: 'png' })
        toast('QR téléchargé !', 'success')
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text)
        toast(`${label} copié !`, 'info')
    }

    function updateForm(k, v) { setForm(f => ({ ...f, [k]: v })) }

    // Filtrage
    const filtered = cards.filter(c => {
        const matchSearch = !search ||
            c.card_id?.includes(search.toLowerCase()) ||
            c.card_name?.toLowerCase().includes(search.toLowerCase()) ||
            c.city?.toLowerCase().includes(search.toLowerCase()) ||
            (c.admin_profile?.full_name || '').toLowerCase().includes(search.toLowerCase())
        const matchStatus = !filterStatus || c.status === filterStatus
        const matchFolder = !selectedFolder || c.folder_id === selectedFolder
        return matchSearch && matchStatus && matchFolder
    })

    const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
    const paginated = filtered.slice((page - 1) * perPage, page * perPage)

    const PAGE_TYPE_LABELS = { profile: '👤 Profil', url: '🔗 URL', wifi: '📶 WiFi' }

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <AdminSidebar
                onFolderSelect={(folderId, statusFilter) => {
                    setSelectedFolder(folderId)
                    setFilterStatus(statusFilter || '')
                    setPage(1)
                }}
                selectedFolder={selectedFolder}
            />

            <main style={{ flex: 1, padding: '32px', overflowY: 'auto', minWidth: 0 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--accent)', marginBottom: '2px' }}>
                            {selectedFolder ? (folders.find(f => f.id === selectedFolder)?.name || 'Dossier') : 'Toutes les cartes'}
                        </h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                            {filtered.length} carte{filtered.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <button className="btn-primary" onClick={() => setCreateModal(true)}>
                        ➕ Nouvelle carte
                    </button>
                </div>

                {/* Filtres */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="🔍 Rechercher nom, ID, ville..."
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                        style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}
                    />
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }} style={{ width: '160px' }}>
                        <option value="">Tous les statuts</option>
                        <option value="active">✅ Actives</option>
                        <option value="pending">⏳ En attente</option>
                    </select>
                </div>

                {/* Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Header table */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: '110px 1fr 100px 120px 100px 160px',
                        padding: '12px 20px', background: 'var(--bg)',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '11px', fontWeight: '700', color: 'var(--text-light)',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        <span>ID</span>
                        <span>Client</span>
                        <span>Type</span>
                        <span>Statut</span>
                        <span>Ville</span>
                        <span style={{ textAlign: 'right' }}>Actions</span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-light)' }}>Chargement...</div>
                    ) : paginated.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                            <p style={{ color: 'var(--text-light)' }}>Aucune carte trouvée</p>
                            <button className="btn-primary" onClick={() => setCreateModal(true)} style={{ marginTop: '16px', width: 'auto', padding: '10px 24px' }}>
                                ➕ Créer une carte
                            </button>
                        </div>
                    ) : paginated.map((card, i) => (
                        <div key={card.card_id} style={{
                            display: 'grid', gridTemplateColumns: '110px 1fr 100px 120px 100px 160px',
                            padding: '14px 20px', alignItems: 'center',
                            borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                            transition: 'background 0.15s',
                        }}
                            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: '700', color: 'var(--accent)' }}>
                                {card.card_id}
                            </span>
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                    {card.admin_profile?.full_name || card.card_name || '—'}
                                </div>
                                {card.card_name && card.admin_profile?.full_name && (
                                    <div style={{ fontSize: '11px', color: 'var(--text-light)' }}>{card.card_name}</div>
                                )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                {PAGE_TYPE_LABELS[card.page_type] || '👤 Profil'}
                            </span>
                            <span style={{
                                fontSize: '12px', fontWeight: '600', padding: '3px 8px',
                                borderRadius: 'var(--radius-pill)', width: 'fit-content',
                                background: card.status === 'active' ? '#e8f5e9' : '#fff3e0',
                                color: card.status === 'active' ? '#2e7d32' : '#e65100',
                            }}>
                                {card.status === 'active' ? '✅ Active' : '⏳ Attente'}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                {card.city || '—'}
                            </span>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                <ActionBtn title="Voir page publique" icon="👁" color="var(--text-light)"
                                    onClick={() => window.open(`/u/${card.card_id}`, '_blank')} />
                                <ActionBtn title="Copier lien NFC" icon="📡" color="#1A1265"
                                    onClick={() => copyText(`${window.location.origin}/u/${card.card_id}`, 'Lien NFC')} />
                                <ActionBtn title="QR Code" icon="▣" color="#7C3AED"
                                    onClick={() => setQrModal(card)} />
                                <ActionBtn title="Paramètres" icon="⚙️" color="#0A66C2"
                                    onClick={() => navigate(`/admin/card/${card.card_id}`)} />
                                <ActionBtn title="Supprimer" icon="🗑" color="#e53935"
                                    onClick={() => setDeleteModal(card)} />
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {filtered.length > perPage && (
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '14px 20px', borderTop: '1px solid var(--border)', background: 'var(--bg)',
                        }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                Page {page} / {totalPages} — {filtered.length} résultats
                            </span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="btn-ghost" onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1} style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    ← Préc.
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const p = page <= 3 ? i + 1 : page - 2 + i
                                    if (p < 1 || p > totalPages) return null
                                    return (
                                        <button key={p} onClick={() => setPage(p)} style={{
                                            padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)',
                                            border: p === page ? 'none' : '1px solid var(--border)',
                                            background: p === page ? 'var(--accent)' : 'transparent',
                                            color: p === page ? 'white' : 'var(--text-light)', cursor: 'pointer',
                                        }}>{p}</button>
                                    )
                                })}
                                <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages} style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    Suiv. →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal créer carte */}
            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="➕ Nouvelle carte" size="md">
                <div className="field-row">
                    <div className="field" style={{ margin: 0 }}>
                        <label>Nom complet du client *</label>
                        <input type="text" placeholder="Jean Dupont" value={form.clientName}
                            onChange={e => updateForm('clientName', e.target.value)} autoFocus />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                        <label>Ville</label>
                        <input type="text" placeholder="Cotonou" value={form.city}
                            onChange={e => updateForm('city', e.target.value)} />
                    </div>
                </div>

                <div className="field-row" style={{ marginTop: '12px' }}>
                    <div className="field" style={{ margin: 0 }}>
                        <label>Pays</label>
                        <input type="text" placeholder="Bénin" value={form.country}
                            onChange={e => updateForm('country', e.target.value)} />
                    </div>
                    <div className="field" style={{ margin: 0 }}>
                        <label>Dossier</label>
                        <select value={form.folderId} onChange={e => updateForm('folderId', e.target.value)}>
                            <option value="">Aucun dossier</option>
                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Type de page */}
                <div className="field" style={{ marginTop: '16px' }}>
                    <label>Type de contenu *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        {[
                            { value: 'profile', icon: '👤', label: 'Page profil' },
                            { value: 'url', icon: '🔗', label: 'URL directe' },
                            { value: 'wifi', icon: '📶', label: 'WiFi' },
                        ].map(t => (
                            <button key={t.value} onClick={() => updateForm('pageType', t.value)} style={{
                                padding: '12px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                border: form.pageType === t.value ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                                background: form.pageType === t.value ? 'var(--accent-light)' : 'transparent',
                                color: form.pageType === t.value ? 'var(--accent)' : 'var(--text-light)',
                                fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: '600',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{t.icon}</div>
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Champs selon type */}
                {form.pageType === 'url' && (
                    <div className="field" style={{ marginTop: '12px' }}>
                        <label>URL de destination *</label>
                        <input type="url" placeholder="https://monsite.com"
                            value={form.redirectUrl} onChange={e => updateForm('redirectUrl', e.target.value)} />
                    </div>
                )}

                {form.pageType === 'wifi' && (
                    <div style={{ marginTop: '12px' }}>
                        <div className="field">
                            <label>Nom du réseau (SSID) *</label>
                            <input type="text" placeholder="MonWiFi"
                                value={form.wifiSsid} onChange={e => updateForm('wifiSsid', e.target.value)} />
                        </div>
                        <div className="field-row">
                            <div className="field" style={{ margin: 0 }}>
                                <label>Mot de passe</label>
                                <input type="text" placeholder="••••••••"
                                    value={form.wifiPassword} onChange={e => updateForm('wifiPassword', e.target.value)} />
                            </div>
                            <div className="field" style={{ margin: 0 }}>
                                <label>Sécurité</label>
                                <select value={form.wifiSecurity} onChange={e => updateForm('wifiSecurity', e.target.value)}>
                                    <option value="WPA">WPA/WPA2</option>
                                    <option value="WEP">WEP</option>
                                    <option value="nopass">Aucune</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button className="btn-ghost" onClick={() => setCreateModal(false)} style={{ flex: 1 }}>Annuler</button>
                    <button className="btn-primary" onClick={createCard} disabled={creating}
                        style={{ flex: 1, justifyContent: 'center' }}>
                        {creating ? 'Création...' : '➕ Créer la carte'}
                    </button>
                </div>
            </Modal>

            {/* Modal QR */}
            <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title={`▣ QR — ${qrModal?.card_id}`} size="sm">
                {qrModal && <QRModal card={qrModal} onCopy={copyText} onDownload={downloadQR} />}
            </Modal>

            {/* Modal suppression */}
            <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="🗑 Supprimer" size="sm">
                {deleteModal && (
                    <>
                        <p style={{ marginBottom: '8px' }}>Supprimer la carte <strong>{deleteModal.card_id}</strong> ({deleteModal.card_name}) ?</p>
                        <p style={{ fontSize: '13px', color: 'var(--error)', marginBottom: '24px' }}>⚠️ Action irréversible.</p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-ghost" onClick={() => setDeleteModal(null)} style={{ flex: 1 }}>Annuler</button>
                            <button onClick={deleteCard} style={{
                                flex: 1, padding: '11px', background: '#e53935', color: 'white',
                                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600',
                            }}>🗑 Supprimer</button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    )
}

function QRModal({ card, onCopy, onDownload }) {
    const qrRef = { current: null }
    const [qrNode, setQrNode] = useState(null)
    const [qrInstance, setQrInstance] = useState(null)

    const [useState] = [require('react').useState]

    useEffect(() => {
        if (qrNode) {
            const qr = new QRCodeStyling({
                width: 220, height: 220, type: 'svg',
                data: `${window.location.origin}/u/${card.card_id}`,
                dotsOptions: { color: '#1A1265', type: 'rounded' },
                backgroundOptions: { color: '#EBEBDF' },
                cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
            })
            qrNode.innerHTML = ''
            qr.append(qrNode)
            setQrInstance(qr)
        }
    }, [qrNode])

    const url = `${window.location.origin}/u/${card.card_id}`

    return (
        <div style={{ textAlign: 'center' }}>
            <div ref={setQrNode} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', boxShadow: 'var(--shadow-lg)' }} />
            <p style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>{url}</p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button className="btn-secondary" onClick={() => onCopy(url, 'Lien NFC')} style={{ padding: '10px 16px', width: 'auto' }}>📡 Copier lien</button>
                <button className="btn-primary" onClick={() => onDownload(card)} style={{ padding: '10px 16px', width: 'auto' }}>⬇ PNG</button>
            </div>
        </div>
    )
}

function ActionBtn({ icon, title, onClick, color }) {
    return (
        <button title={title} onClick={onClick} style={{
            width: '32px', height: '32px', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', background: 'var(--bg-white)',
            cursor: 'pointer', fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s', color,
        }}
            onMouseEnter={e => { e.currentTarget.style.background = color + '15'; e.currentTarget.style.borderColor = color }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-white)'; e.currentTarget.style.borderColor = 'var(--border)' }}
        >
            {icon}
        </button>
    )
}