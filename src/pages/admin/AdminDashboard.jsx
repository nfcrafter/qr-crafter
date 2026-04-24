// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';
import { generateUniqueCardId } from '../../lib/utils.js';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFolder, setFilterFolder] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    // Modal création
    const [createModal, setCreateModal] = useState(false);
    const [createStep, setCreateStep] = useState(1);
    const [clientInfo, setClientInfo] = useState({
        clientName: '',
        city: '',
        country: 'Bénin'
    });
    const [pageType, setPageType] = useState('profile');
    const [redirectUrl, setRedirectUrl] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiSecurity, setWifiSecurity] = useState('WPA');
    const [generating, setGenerating] = useState(false);

    // Dossiers
    const [folders, setFolders] = useState([]);
    const [showFolderManager, setShowFolderManager] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('#1A1265');

    useEffect(() => {
        loadCards();
        loadFolders();
    }, [filterFolder]);

    async function loadCards() {
        setLoading(true);
        let query = supabase.from('cards').select('*').order('created_at', { ascending: false });
        if (filterFolder) {
            query = query.eq('folder_id', filterFolder);
        }
        const { data } = await query;
        setCards(data || []);
        setLoading(false);
    }

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    async function createFolder() {
        if (!newFolderName.trim()) {
            toast('Nom du dossier requis', 'error');
            return;
        }
        const { error } = await supabase.from('folders').insert({
            name: newFolderName.trim(),
            color: newFolderColor
        });
        if (error) {
            toast('Erreur : ' + error.message, 'error');
        } else {
            toast('Dossier créé !', 'success');
            setNewFolderName('');
            setNewFolderColor('#1A1265');
            setShowFolderManager(false);
            loadFolders();
        }
    }

    async function deleteFolder(id) {
        if (!confirm('Supprimer ce dossier ? Les cartes ne seront pas supprimées.')) return;
        await supabase.from('folders').delete().eq('id', id);
        if (filterFolder === id) setFilterFolder('');
        loadFolders();
        loadCards();
    }

    function validateStep1() {
        if (!clientInfo.clientName.trim()) {
            toast('Le nom du client est obligatoire', 'error');
            return false;
        }
        return true;
    }

    function goToStep2() {
        if (validateStep1()) {
            setCreateStep(2);
        }
    }

    function goToStep1() {
        setCreateStep(1);
    }

    async function finalizeCreateCard() {
        if (pageType === 'url' && !redirectUrl.trim()) {
            toast('L’URL de redirection est obligatoire', 'error');
            return;
        }
        if (pageType === 'wifi' && !wifiSsid.trim()) {
            toast('Le SSID (nom du réseau) est obligatoire', 'error');
            return;
        }

        setGenerating(true);
        const cardId = await generateUniqueCardId();
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        const cardData = {
            card_id: cardId,
            card_name: clientInfo.clientName.trim(),
            status: 'pending',
            activation_token: token,
            city: clientInfo.city,
            country: clientInfo.country,
            page_type: pageType,
            admin_profile: { full_name: clientInfo.clientName.trim() }
        };

        if (pageType === 'url') {
            cardData.redirect_url = redirectUrl.trim();
        } else if (pageType === 'wifi') {
            cardData.wifi_ssid = wifiSsid.trim();
            cardData.wifi_password = wifiPassword;
            cardData.wifi_security = wifiSecurity;
        }

        const { error } = await supabase.from('cards').insert(cardData);
        if (error) {
            toast('Erreur : ' + error.message, 'error');
        } else {
            toast(`Carte ${cardId} créée avec succès !`, 'success');
            setCreateStep(1);
            setClientInfo({ clientName: '', city: '', country: 'Bénin' });
            setPageType('profile');
            setRedirectUrl('');
            setWifiSsid('');
            setWifiPassword('');
            setWifiSecurity('WPA');
            setCreateModal(false);
            loadCards();
        }
        setGenerating(false);
    }

    const filtered = cards.filter(c => {
        const matchSearch = !search ||
            c.card_id?.toLowerCase().includes(search.toLowerCase()) ||
            c.card_name?.toLowerCase().includes(search.toLowerCase()) ||
            (c.admin_profile?.full_name || '').toLowerCase().includes(search.toLowerCase());
        const matchStatus = !filterStatus || c.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.ceil(filtered.length / perPage);
    const paginated = filtered.slice((page - 1) * perPage, page * perPage);

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'active').length,
        pending: cards.filter(c => c.status === 'pending').length,
    };

    const openCreateModal = () => {
        setCreateStep(1);
        setClientInfo({ clientName: '', city: '', country: 'Bénin' });
        setPageType('profile');
        setRedirectUrl('');
        setWifiSsid('');
        setWifiPassword('');
        setWifiSecurity('WPA');
        setCreateModal(true);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
            {/* ========== SIDEBAR ========== */}
            <aside style={{
                width: '260px',
                background: 'var(--bg-white)',
                borderRight: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: 0,
                height: '100vh'
            }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '36px', marginBottom: '8px' }} />
                    <div style={{ fontWeight: '800', color: 'var(--accent)' }}>NFCrafter Admin</div>
                </div>

                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    <div style={sidebarLinkStyle(true)}>
                        <span>📊</span> Tableau de bord
                    </div>

                    <div style={{ margin: '16px 0 8px 12px', fontSize: '11px', fontWeight: '600', color: 'var(--text-light)', textTransform: 'uppercase' }}>
                        DOSSIERS
                    </div>

                    {folders.map(folder => (
                        <div key={folder.id} style={{ position: 'relative' }}>
                            <button
                                onClick={() => setFilterFolder(filterFolder === folder.id ? '' : folder.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    background: filterFolder === folder.id ? 'var(--accent-light)' : 'transparent',
                                    color: filterFolder === folder.id ? 'var(--accent)' : 'var(--text-light)',
                                    marginBottom: '2px'
                                }}
                            >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: folder.color }}></span>
                                <span style={{ flex: 1, textAlign: 'left' }}>📁 {folder.name}</span>
                                {filterFolder === folder.id && <span>✓</span>}
                            </button>
                            <button
                                onClick={() => deleteFolder(folder.id)}
                                style={{
                                    position: 'absolute', right: '8px', top: '8px',
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: '12px', color: '#e53935', opacity: 0.5
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                            >
                                ✕
                            </button>
                        </div>
                    ))}

                    {showFolderManager ? (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius-md)' }}>
                            <input
                                type="text"
                                placeholder="Nom du dossier"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                style={{ fontSize: '12px', marginBottom: '8px', width: '100%' }}
                            />
                            <input
                                type="color"
                                value={newFolderColor}
                                onChange={e => setNewFolderColor(e.target.value)}
                                style={{ width: '100%', marginBottom: '8px', height: '32px' }}
                            />
                            <button onClick={createFolder} className="btn-primary" style={{ width: '100%', fontSize: '12px', padding: '6px' }}>
                                Créer
                            </button>
                            <button onClick={() => setShowFolderManager(false)} style={{ width: '100%', marginTop: '6px', fontSize: '11px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)' }}>
                                Annuler
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowFolderManager(true)}
                            style={{
                                width: '100%', textAlign: 'left', padding: '10px 12px',
                                background: 'transparent', border: 'none', borderRadius: 'var(--radius-md)',
                                cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                                color: 'var(--accent)', marginTop: '8px'
                            }}
                        >
                            <span>➕</span> Nouveau dossier
                        </button>
                    )}

                    <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                        <button
                            onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
                            style={{
                                width: '100%', padding: '10px', background: 'transparent', border: 'none',
                                cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px',
                                color: 'var(--text-light)'
                            }}
                        >
                            🚪 Déconnexion
                        </button>
                    </div>
                </nav>
            </aside>

            {/* ========== CONTENU PRINCIPAL ========== */}
            <main style={{ flex: 1, overflow: 'auto', padding: '32px 24px' }}>
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
                    <input
                        type="text"
                        placeholder="🔍 Rechercher par nom, ID..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}
                    />
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }} style={{ width: '160px' }}>
                        <option value="">Tous les statuts</option>
                        <option value="active">✅ Actives</option>
                        <option value="pending">⏳ En attente</option>
                    </select>
                    {filterFolder && (
                        <button onClick={() => setFilterFolder('')} className="btn-ghost" style={{ fontSize: '12px' }}>
                            ✕ Effacer filtre dossier
                        </button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn-primary" onClick={openCreateModal} style={{ whiteSpace: 'nowrap' }}>
                            ➕ Nouvelle carte
                        </button>
                    </div>
                </div>

                {/* Tableau des cartes */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 1fr 140px 120px 160px',
                        gap: '0', padding: '12px 20px',
                        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
                        fontSize: '12px', fontWeight: '700', color: 'var(--text-light)',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                        <span>ID Carte</span>
                        <span>Client</span>
                        <span>Statut</span>
                        <span>Type</span>
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
                        paginated.map((card, i) => {
                            const typeIcon = card.page_type === 'profile' ? '📄' : card.page_type === 'url' ? '🔗' : '📶';
                            const typeLabel = card.page_type === 'profile' ? 'Profil' : card.page_type === 'url' ? 'Redirection' : 'Wi-Fi';
                            return (
                                <div key={card.card_id} style={{
                                    display: 'grid',
                                    gridTemplateColumns: '100px 1fr 140px 120px 160px',
                                    gap: '0', padding: '14px 20px',
                                    borderBottom: i < paginated.length - 1 ? '1px solid var(--border)' : 'none',
                                    alignItems: 'center',
                                    transition: 'background 0.15s',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <span style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '13px', color: 'var(--accent)' }}>
                                        {card.card_id}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>
                                            {card.admin_profile?.full_name || card.card_name || '—'}
                                        </div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                            {card.city && `${card.city}, ${card.country || 'Bénin'}`}
                                        </div>
                                    </div>
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
                                    <span style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        {typeIcon} {typeLabel}
                                    </span>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => navigate(`/admin/card/${card.card_id}`)}
                                            className="btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
                                        >
                                            ⚙️ Paramètres
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}

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
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => setPage(p)} style={{
                                        padding: '6px 12px', fontSize: '13px', borderRadius: 'var(--radius-sm)',
                                        border: p === page ? 'none' : '1px solid var(--border)',
                                        background: p === page ? 'var(--accent)' : 'transparent',
                                        color: p === page ? 'white' : 'var(--text-light)',
                                        cursor: 'pointer',
                                    }}>{p}</button>
                                ))}
                                {totalPages > 5 && <span>...</span>}
                                <button className="btn-ghost" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                                    style={{ padding: '6px 14px', fontSize: '13px' }}>
                                    Suivant →
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ========== MODAL CRÉATION ========== */}
            <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="➕ Nouvelle carte" size="md">
                {createStep === 1 ? (
                    <>
                        <div className="field">
                            <label>Nom complet du client *</label>
                            <input
                                type="text"
                                placeholder="Jean Dupont"
                                value={clientInfo.clientName}
                                onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                                autoFocus
                            />
                        </div>
                        <div className="field-row">
                            <div className="field">
                                <label>Ville</label>
                                <input
                                    type="text"
                                    placeholder="Cotonou"
                                    value={clientInfo.city}
                                    onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label>Pays</label>
                                <input
                                    type="text"
                                    placeholder="Bénin"
                                    value={clientInfo.country}
                                    onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button className="btn-ghost" onClick={() => setCreateModal(false)} style={{ flex: 1 }}>Annuler</button>
                            <button className="btn-primary" onClick={goToStep2} style={{ flex: 1 }}>Suivant →</button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="field">
                            <label>Type de page *</label>
                            <select value={pageType} onChange={e => setPageType(e.target.value)}>
                                <option value="profile">📄 Page profil personnalisable</option>
                                <option value="url">🔗 Redirection vers une URL</option>
                                <option value="wifi">📶 Page Wi-Fi</option>
                            </select>
                            <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                                Le client pourra modifier le contenu selon le type choisi.
                            </p>
                        </div>

                        {pageType === 'url' && (
                            <div className="field">
                                <label>URL de redirection par défaut *</label>
                                <input
                                    type="url"
                                    placeholder="https://exemple.com"
                                    value={redirectUrl}
                                    onChange={e => setRedirectUrl(e.target.value)}
                                />
                            </div>
                        )}

                        {pageType === 'wifi' && (
                            <>
                                <div className="field">
                                    <label>SSID (nom du réseau) par défaut *</label>
                                    <input
                                        type="text"
                                        placeholder="MonWiFi"
                                        value={wifiSsid}
                                        onChange={e => setWifiSsid(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Mot de passe par défaut</label>
                                    <input
                                        type="text"
                                        placeholder="••••••••"
                                        value={wifiPassword}
                                        onChange={e => setWifiPassword(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Sécurité</label>
                                    <select value={wifiSecurity} onChange={e => setWifiSecurity(e.target.value)}>
                                        <option>WPA</option>
                                        <option>WEP</option>
                                        <option>nopass</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <button className="btn-ghost" onClick={goToStep1} style={{ flex: 1 }}>← Retour</button>
                            <button className="btn-primary" onClick={finalizeCreateCard} disabled={generating} style={{ flex: 1, justifyContent: 'center' }}>
                                {generating ? 'Création...' : '➕ Créer la carte'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
}

function sidebarLinkStyle(isActive) {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 12px',
        borderRadius: 'var(--radius-md)',
        textDecoration: 'none',
        fontSize: '14px',
        marginBottom: '4px',
        background: isActive ? 'var(--accent-light)' : 'transparent',
        color: isActive ? 'var(--accent)' : 'var(--text-light)'
    };
}