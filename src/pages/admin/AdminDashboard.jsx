// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import Modal from '../../components/Modal.jsx';
import QRCodeStyling from 'qr-code-styling';
import QRModal from '../../components/admin/QRModal.jsx';
import { generateUniqueCardId } from '../../lib/utils.js';

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
];

export default function AdminDashboard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterFolder, setFilterFolder] = useState('');
    const [page, setPage] = useState(1);
    const [perPage] = useState(10);

    // Modals
    const [createModal, setCreateModal] = useState(false);
    const [profileModal, setProfileModal] = useState(null);
    const [qrModal, setQrModal] = useState(null);
    const [linkModal, setLinkModal] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    // Étape 1 du formulaire de création
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

    // Profil modal
    const [profileForm, setProfileForm] = useState({});
    const [savingProfile, setSavingProfile] = useState(false);
    const [userId, setUserId] = useState('');
    const [linking, setLinking] = useState(false);

    // Dossiers
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        loadCards();
        loadFolders();
    }, []);

    useEffect(() => {
        if (qrModal && qrRef.current) {
            const url = `${window.location.origin}/u/${qrModal.card_id}`;
            if (!qrCode.current) {
                qrCode.current = new QRCodeStyling({
                    width: 240, height: 240, type: 'svg',
                    data: url,
                    dotsOptions: { color: '#1A1265', type: 'rounded' },
                    backgroundOptions: { color: '#EBEBDF' },
                    cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
                });
                qrRef.current.innerHTML = '';
                qrCode.current.append(qrRef.current);
            } else {
                qrCode.current.update({ data: url });
                qrRef.current.innerHTML = '';
                qrCode.current.append(qrRef.current);
            }
        }
    }, [qrModal]);

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

    async function loadCardsByFolder(folderId) {
        setFilterFolder(folderId);
        setPage(1);
        await loadCards();
    }

    // ÉTAPE 1 : validation
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

    // Création finale
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
            // Reset formulaire
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

    async function saveProfile() {
        if (!profileModal) return;
        setSavingProfile(true);
        const { error } = await supabase.from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', profileModal.card_id);
        if (error) toast('Erreur lors de la sauvegarde', 'error');
        else {
            toast('Profil sauvegardé !', 'success');
            loadCards();
            setProfileModal(null);
        }
        setSavingProfile(false);
    }

    async function linkCard() {
        if (!userId.trim() || !linkModal) return;
        setLinking(true);
        const { data: profile, error } = await supabase
            .from('profiles').select('id, full_name').eq('id', userId.trim()).single();
        if (error || !profile) {
            toast('Aucun utilisateur trouvé avec cet ID', 'error');
            setLinking(false);
            return;
        }
        await supabase.from('cards')
            .update({ owner_id: userId.trim(), status: 'active' })
            .eq('card_id', linkModal.card_id);
        await supabase.from('profiles')
            .update({ card_id: linkModal.card_id })
            .eq('id', userId.trim());
        await supabase.from('user_cards').upsert({
            user_id: userId.trim(),
            card_id: linkModal.card_id,
            profile_name: profile.full_name,
        });
        toast(`Carte liée à ${profile.full_name} !`, 'success');
        setLinking(false);
        setLinkModal(null);
        setUserId('');
        loadCards();
    }

    async function deleteCard() {
        if (!deleteModal) return;
        const { error } = await supabase.from('cards').delete().eq('card_id', deleteModal.card_id);
        if (error) toast('Erreur lors de la suppression', 'error');
        else {
            toast(`Carte "${deleteModal.card_id}" supprimée`, 'warning');
            setDeleteModal(null);
            loadCards();
        }
    }

    function downloadQR(card) {
        const url = `${window.location.origin}/u/${card.card_id}`;
        const qr = new QRCodeStyling({
            width: 1024, height: 1024, type: 'svg',
            data: url,
            dotsOptions: { color: '#1A1265', type: 'rounded' },
            backgroundOptions: { color: '#EBEBDF' },
            cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
        });
        qr.download({ name: `QR-NFCrafter-${card.card_id}`, extension: 'png' });
        toast('QR Code téléchargé !', 'success');
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text);
        toast(`${label} copié !`, 'info');
    }

    // Filtrage + pagination
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            <header style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border)', padding: '0 32px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '36px' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>NFCrafter</span>
                        <span style={{ background: 'var(--accent)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>ADMIN</span>
                    </div>
                    <button className="btn-ghost" onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }} style={{ fontSize: '13px' }}>
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
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        style={{ flex: 1, minWidth: '200px', maxWidth: '320px' }}
                    />
                    <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
                        style={{ width: '160px' }}>
                        <option value="">Tous les statuts</option>
                        <option value="active">✅ Actives</option>
                        <option value="pending">⏳ En attente</option>
                    </select>
                    <select value={filterFolder} onChange={e => { setFilterFolder(e.target.value); setPage(1); loadCards(); }}
                        style={{ width: '180px' }}>
                        <option value="">Tous les dossiers</option>
                        {folders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
                    </select>
                    <div style={{ marginLeft: 'auto' }}>
                        <button className="btn-primary" onClick={openCreateModal} style={{ whiteSpace: 'nowrap' }}>
                            ➕ Nouvelle carte
                        </button>
                    </div>
                </div>

                {/* Data Table */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
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
                                <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: '600' }}>
                                    — scans
                                </span>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                                    <ActionBtn title="Voir la page" icon="👁" onClick={() => window.open(`/u/${card.card_id}`, '_blank')} color="var(--text-light)" />
                                    <ActionBtn title="QR Code" icon="▣" onClick={() => setQrModal(card)} color="#7C3AED" />
                                    <ActionBtn title="Modifier profil" icon="✏️" onClick={() => { setProfileForm(card.admin_profile || {}); setProfileModal(card); }} color="#1A1265" />
                                    <ActionBtn title="Lier client" icon="🔗" onClick={() => setLinkModal(card)} color="#25D366" />
                                    <ActionBtn title="Supprimer" icon="🗑" onClick={() => setDeleteModal(card)} color="#e53935" />
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

            {/* ===== MODAL CRÉATION 2 ÉTAPES ===== */}
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
                            <button className="btn-ghost" onClick={() => setCreateModal(false)} style={{ flex: 1 }}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={goToStep2} style={{ flex: 1 }}>
                                Suivant →
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="field">
                            <label>Type de page *</label>
                            <select value={pageType} onChange={e => setPageType(e.target.value)}>
                                <option value="profile">📄 Page profil personnalisable (le client modifie son contenu)</option>
                                <option value="url">🔗 Redirection vers une URL fixe</option>
                                <option value="wifi">📶 Page Wi-Fi (affiche SSID + mot de passe)</option>
                            </select>
                        </div>

                        {pageType === 'url' && (
                            <div className="field">
                                <label>URL de redirection *</label>
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
                                    <label>SSID (nom du réseau) *</label>
                                    <input
                                        type="text"
                                        placeholder="MonWiFi"
                                        value={wifiSsid}
                                        onChange={e => setWifiSsid(e.target.value)}
                                    />
                                </div>
                                <div className="field">
                                    <label>Mot de passe</label>
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
                            <button className="btn-ghost" onClick={goToStep1} style={{ flex: 1 }}>
                                ← Retour
                            </button>
                            <button
                                className="btn-primary"
                                onClick={finalizeCreateCard}
                                disabled={generating}
                                style={{ flex: 1, justifyContent: 'center' }}
                            >
                                {generating ? 'Création...' : '➕ Créer la carte'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* MODAL PROFIL */}
            <Modal isOpen={!!profileModal} onClose={() => setProfileModal(null)} title={`✏️ Profil — ${profileModal?.card_name || profileModal?.card_id}`} size="lg">
                {profileModal && (
                    <>
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

            {/* MODAL QR */}
            <Modal isOpen={!!qrModal} onClose={() => setQrModal(null)} title={`▣ QR — ${qrModal?.card_id}`} size="sm">
                {qrModal && (
                    <div style={{ textAlign: 'center' }}>
                        <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', boxShadow: 'var(--shadow-lg)' }} />
                        <p style={{ fontSize: '12px', color: 'var(--text-light)', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>
                            {`${window.location.origin}/u/${qrModal.card_id}`}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-secondary" onClick={() => copyText(`${window.location.origin}/u/${qrModal.card_id}`, 'Lien NFC')} style={{ padding: '10px 16px', width: 'auto' }}>
                                📡 Copier lien
                            </button>
                            <button className="btn-primary" onClick={() => downloadQR(qrModal)} style={{ padding: '10px 16px', width: 'auto' }}>
                                ⬇ PNG
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* MODAL LIER CLIENT */}
            <Modal isOpen={!!linkModal} onClose={() => { setLinkModal(null); setUserId(''); }} title={`🔗 Lier la carte ${linkModal?.card_id}`} size="sm">
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
                            <button className="btn-ghost" onClick={() => { setLinkModal(null); setUserId(''); }} style={{ flex: 1 }}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={linkCard} disabled={linking || !userId.trim()} style={{ flex: 1, justifyContent: 'center' }}>
                                {linking ? 'Liaison...' : '✅ Activer la carte'}
                            </button>
                        </div>
                    </>
                )}
            </Modal>

            {/* MODAL SUPPRIMER */}
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
    );
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
                e.currentTarget.style.background = color + '15';
                e.currentTarget.style.borderColor = color;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--bg-white)';
                e.currentTarget.style.borderColor = 'var(--border)';
            }}
        >
            {icon}
        </button>
    );
}