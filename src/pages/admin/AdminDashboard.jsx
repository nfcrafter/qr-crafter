// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import Modal from '../../components/Modal.jsx';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [cards, setCards] = useState([]);
    const [scans, setScans] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [quantity, setQuantity] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [folders, setFolders] = useState([]);
    const [filterFolder, setFilterFolder] = useState('');
    const [expandedFolders, setExpandedFolders] = useState({});
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'users'
    const [users, setUsers] = useState([]);

    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', children: null, onConfirm: null, type: 'info' });
    const [folderNameInput, setFolderNameInput] = useState('');

    const [requestsCount, setRequestsCount] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (view === 'dashboard') {
            loadData();
            loadFolders();
        } else if (view === 'users') {
            loadUsers();
        } else if (view === 'requests') {
            loadRequests();
        }
        updateRequestsCount();
    }, [filterFolder, view]);

    async function loadData() {
        setLoading(true);
        let query = supabase.from('cards').select('*').order('created_at', { ascending: false });
        if (filterFolder) query = query.eq('folder_id', filterFolder);
        const { data: cardsData, error } = await query;
        if (error) toast('Erreur de chargement', 'error');
        else {
            setCards(cardsData || []);
            const { data: scansData } = await supabase.from('scan_logs').select('card_id');
            const counts = {};
            scansData?.forEach(s => { counts[s.card_id] = (counts[s.card_id] || 0) + 1; });
            setScans(counts);
        }
        setLoading(false);
    }

    async function updateRequestsCount() {
        const { count } = await supabase
            .from('cards')
            .select('*', { count: 'exact', head: true })
            .eq('design_request', 'pending');
        setRequestsCount(count || 0);
    }

    async function loadRequests() {
        setLoading(true);
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('design_request', 'pending')
            .order('updated_at', { ascending: false });
        if (error) toast('Erreur chargement demandes', 'error');
        else setCards(data || []);
        setLoading(false);
    }

    async function resolveRequest(cardId) {
        const { error } = await supabase
            .from('cards')
            .update({ design_request: 'completed' })
            .eq('card_id', cardId);
        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Demande marquée comme traitée', 'success');
            if (view === 'requests') loadRequests();
            else loadData();
            updateRequestsCount();
        }
    }

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    async function loadUsers() {
        setLoading(true);
        const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error('Error loading users:', error);
            toast('Erreur chargement utilisateurs : ' + error.message, 'error');
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }

    async function handleDeleteUser(userId) {
        if (!window.confirm("Supprimer cet utilisateur et TOUTES ses cartes ?")) return;
        setLoading(true);
        try {
            const { data: userCards } = await supabase.from('cards').select('card_id').eq('owner_id', userId);
            for (const card of (userCards || [])) {
                await supabase.from('scan_logs').delete().eq('card_id', card.card_id);
                await supabase.from('user_cards').delete().eq('card_id', card.card_id);
            }
            await supabase.from('cards').delete().eq('owner_id', userId);
            const { error } = await supabase.from('profiles').delete().eq('id', userId);
            if (error) throw error;
            toast('Utilisateur supprimé', 'success');
            loadUsers();
        } catch (err) {
            console.error(err);
            toast('Erreur lors de la suppression', 'error');
        } finally {
            setLoading(false);
        }
    }

    function toggleFolder(id, e) {
        if (e) e.stopPropagation();
        setExpandedFolders(prev => ({ ...prev, [id]: !prev[id] }));
    }

    function openCreateFolderModal(isSub = false) {
        setFolderNameInput('');
        setModalConfig({
            isOpen: true,
            title: isSub ? 'Créer un sous-dossier' : 'Créer un nouveau dossier',
            children: (
                <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1265', marginBottom: '8px', display: 'block' }}>Nom du dossier</label>
                    <input type="text" autoFocus placeholder="Ex: Marketing Print" id="folder-input-id" onChange={e => setFolderNameInput(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} />
                </div>
            ),
            onConfirm: () => handleCreateFolder(isSub),
            type: 'info'
        });
    }

    async function handleCreateFolder(isSub) {
        const name = document.getElementById('folder-input-id')?.value || folderNameInput;
        if (!name) return toast('Le nom est requis', 'error');
        try {
            const payload = { name, color: isSub ? '#6366F1' : '#1A1265' };
            if (isSub && filterFolder) payload.parent_id = filterFolder;
            const { error } = await supabase.from('folders').insert(payload);
            if (error) throw error;
            toast(isSub ? 'Sous-dossier créé' : 'Dossier créé', 'success');
            loadFolders();
        } catch (err) { toast('Erreur : parent_id manquant ?', 'error'); }
    }

    function openDeleteFolderModal(id, name, e) {
        if (e) e.stopPropagation();
        setModalConfig({
            isOpen: true, title: 'Action critique',
            children: (<div><p>Supprimer <strong style={{ color: '#1A1265' }}>"{name}"</strong> ?</p><p style={{ color: '#EF4444', fontWeight: '700', fontSize: '13px', marginTop: '10px' }}>⚠️ Tous les sous-dossiers seront aussi supprimés.</p></div>),
            onConfirm: () => handleDeleteFolder(id), type: 'warning', confirmText: 'Supprimer'
        });
    }

    async function handleDeleteFolder(id) {
        const { error } = await supabase.from('folders').delete().eq('id', id);
        if (!error) { toast('Dossier supprimé', 'success'); loadFolders(); if (filterFolder === id) setFilterFolder(''); }
    }

    const currentFolder = folders.find(f => f.id === filterFolder);
    const isSubFolder = currentFolder?.parent_id != null;

    const filtered = cards.filter(c => {
        const matchesSearch = !search || c.card_name?.toLowerCase().includes(search.toLowerCase()) || c.card_id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const qrType = c.admin_profile?.qr_type || 'url';
        const matchesType = typeFilter === 'all' || qrType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'modified') return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        if (sortBy === 'scanned') return (scans[b.card_id] || 0) - (scans[a.card_id] || 0);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / quantity);
    const currentItems = filtered.slice((currentPage - 1) * quantity, currentPage * quantity);

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', overflow: 'hidden', position: 'relative' }}>
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90, backdropFilter: 'blur(4px)' }}
                    className="mobile-overlay"
                />
            )}

            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ width: '290px', background: 'white', borderRight: '1px solid #E2E8F0', padding: '32px 20px', display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 100, flexShrink: 0, transition: 'transform 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265' }}>NFCrafter</span>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <button onClick={() => { setView('dashboard'); setFilterFolder(''); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'dashboard' && !filterFolder ? '#1A1265' : 'transparent', color: view === 'dashboard' && !filterFolder ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>📊 Dashboard</button>
                    <button onClick={() => { setView('users'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'users' ? '#1A1265' : 'transparent', color: view === 'users' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>👥 Utilisateurs</button>
                    <button onClick={() => { setView('requests'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'requests' ? '#1A1265' : 'transparent', color: view === 'requests' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        🎨 Demandes {requestsCount > 0 && <span style={{ background: '#EF4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>{requestsCount}</span>}
                    </button>
                    
                    <div style={{ margin: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Dossiers</div>
                    
                    {folders.filter(f => !f.parent_id).map(f => {
                        const subFolders = folders.filter(sub => sub.parent_id === f.id);
                        const isExpanded = expandedFolders[f.id];
                        return (
                            <div key={f.id} style={{ marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {subFolders.length > 0 && (
                                        <button onClick={(e) => toggleFolder(f.id, e)} style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '10px', color: '#94A3B8' }}>{isExpanded ? '▼' : '▶'}</button>
                                    )}
                                    <button onClick={() => { setView('dashboard'); setFilterFolder(f.id); setIsSidebarOpen(false); }} style={{ flex: 1, padding: '10px 12px', borderRadius: '12px', border: 'none', background: filterFolder === f.id ? '#F1F5F9' : 'transparent', color: filterFolder === f.id ? '#1A1265' : '#475569', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }}></span> {f.name}
                                    </button>
                                    <button onClick={(e) => openDeleteFolderModal(f.id, f.name, e)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }} className="trash-btn">🗑️</button>
                                </div>
                                {isExpanded && subFolders.map(sub => (
                                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '32px' }}>
                                    <button onClick={() => { setView('dashboard'); setFilterFolder(sub.id); setIsSidebarOpen(false); }} style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: filterFolder === sub.id ? '#F1F5F9' : 'transparent', color: filterFolder === sub.id ? '#1A1265' : '#475569', fontWeight: '600', textAlign: 'left', cursor: 'pointer', fontSize: '13px' }}>↳ {sub.name}</button>
                                        <button onClick={(e) => openDeleteFolderModal(sub.id, sub.name, e)} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#CBD5E1' }} className="trash-btn-sub">🗑️</button>
                                    </div>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                <div style={{ padding: '16px 0', borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={() => openCreateFolderModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px dashed #CBD5E1', background: 'white', color: '#1A1265', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>+ Nouveau dossier</button>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '14px', border: 'none', background: '#FEF2F2', borderRadius: '14px', color: '#DC2626', fontWeight: '700', cursor: 'pointer', marginTop: '16px' }}>Déconnexion</button>
                </div>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div style={{ padding: '24px 40px 20px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', zIndex: 50 }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button 
                                onClick={() => setIsSidebarOpen(true)}
                                className="mobile-only"
                                style={{ background: 'white', border: '1px solid #E2E8F0', padding: '10px', borderRadius: '12px', cursor: 'pointer', fontSize: '20px' }}
                            >
                                ☰
                            </button>
                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265' }}>
                                    {view === 'users' ? 'Gestion des Utilisateurs' : (view === 'requests' ? 'Demandes de Design' : (filterFolder ? currentFolder?.name : 'Tableau de bord'))}
                                </h1>
                                <p style={{ color: '#64748B' }} className="desktop-only">
                                    {view === 'users' ? 'Gérez les comptes et les profils de vos clients.' : (view === 'requests' ? 'Clients souhaitant modifier le design de leur QR.' : (filterFolder ? (isSubFolder ? 'Contenu de ce sous-dossier' : 'Contenu de ce dossier') : 'Gérez l\'ensemble de vos projets QR.'))}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {view === 'dashboard' && filterFolder && !isSubFolder && (<button onClick={() => openCreateFolderModal(true)} style={{ padding: '14px 24px', borderRadius: '14px', background: 'white', color: '#6366F1', border: '1px solid #6366F1', fontWeight: '700', cursor: 'pointer' }} className="desktop-only">+ Sous-dossier</button>)}
                            <button onClick={() => navigate('/admin/create')} className="btn-primary" style={{ padding: '14px 20px', borderRadius: '14px', fontSize: '14px' }}>+ Nouveau QR</button>
                        </div>
                    </header>
                    {(view === 'dashboard' || view === 'requests') && (
                        <div style={{ background: 'white', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }} className="admin-filters">
                            <div style={{ position: 'relative', flex: 1 }}><span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔍</span><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} /></div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }} className="desktop-only"><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }} className="desktop-only"><option value="all">Type</option><option value="url">URL</option><option value="wifi">WiFi</option><option value="vcard">VCard</option></select>
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 60px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '100px' }}>Chargement...</div>
                        ) : view === 'users' ? (
                            users.map(user => (
                                <div key={user.id} className="user-list-item" style={{ background: 'white', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                                        {user.photo_url ? <img src={user.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} /> : '👤'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '900', fontSize: '16px', color: '#1A1265' }}>{user.full_name || 'Utilisateur sans nom'}</div>
                                        <div style={{ color: '#94A3B8', fontSize: '12px' }}>{user.email}</div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={user.email === 'nfcrafter@gmail.com'}
                                        style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '10px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            ))
                        ) : (
                            currentItems.length > 0 ? (
                                currentItems.map(card => (
                                    <CardListItem 
                                        key={card.card_id} 
                                        card={card} 
                                        scanCount={scans[card.card_id] || 0} 
                                        navigate={navigate} 
                                        toast={toast} 
                                        onResolve={() => resolveRequest(card.card_id)}
                                    />
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '24px', border: '1px dashed #E2E8F0', color: '#94A3B8', fontWeight: '600' }}>
                                    {view === 'requests' ? 'Aucune demande de design en attente ✨' : 'Aucun QR trouvé'}
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            <Modal isOpen={modalConfig.isOpen} title={modalConfig.title} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} confirmText={modalConfig.confirmText} type={modalConfig.type}>{modalConfig.children}</Modal>
            <style>{`
                .trash-btn:hover, .trash-btn-sub:hover { color: #EF4444 !important; opacity: 1 !important; transform: scale(1.1); }
                .trash-btn, .trash-btn-sub { transition: all 0.2s; }
                .badge-pending { animation: pulse 2s infinite; }
                @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                
                .mobile-only { display: none; }
                .admin-sidebar { transform: translateX(0); }

                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: block !important; }
                    .admin-sidebar { position: fixed; left: 0; top: 0; transform: translateX(-100%); }
                    .admin-sidebar.open { transform: translateX(0); }
                    .card-list-item { flex-direction: column; align-items: stretch !important; padding: 20px !important; }
                    .card-list-item > div { border: none !important; padding: 0 !important; margin: 0 !important; text-align: left !important; }
                    .card-info-group { display: flex; gap: 16px; align-items: center; }
                    .card-actions-group { display: flex; gap: 8px; margin-top: 16px; border-top: 1px solid #F1F5F9; padding-top: 16px !important; }
                    .card-actions-group button { flex: 1; }
                    .user-list-item { padding: 16px !important; }
                    .admin-filters { overflow-x: auto; white-space: nowrap; }
                }
            `}</style>
        </div>
    );
}

function CardListItem({ card, scanCount, navigate, toast, onResolve }) {
    const qrRef = useRef(null);
    const isActive = card.status === 'active';
    const isPendingRequest = card.design_request === 'pending';
    
    useEffect(() => {
        if (qrRef.current) {
            const qrCode = new QRCodeStyling({
                width: 76, height: 76, data: `${window.location.origin}/u/${card.card_id}`,
                dotsOptions: { color: card.qr_appearance?.dotsColor || "#1A1265", type: card.qr_appearance?.dotsType || "rounded" },
                cornersSquareOptions: { color: card.qr_appearance?.cornersColor || "#1A1265", type: card.qr_appearance?.cornersType || "extra-rounded" },
                backgroundOptions: { color: "#FFFFFF" },
                image: card.qr_appearance?.logo_url || "",
                imageOptions: { crossOrigin: 'anonymous', margin: 2 }
            });
            qrRef.current.innerHTML = ''; qrCode.append(qrRef.current);
        }
    }, [card]);

    return (
        <div className="card-list-item" style={{ background: 'white', borderRadius: '20px', padding: '24px 30px', display: 'flex', alignItems: 'center', gap: '24px', border: isPendingRequest ? '2px solid #6366F1' : '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', position: 'relative' }}>
            {isPendingRequest && (
                <div className="badge-pending" style={{ position: 'absolute', top: '-10px', left: '20px', background: '#6366F1', color: 'white', fontSize: '10px', fontWeight: '900', padding: '4px 12px', borderRadius: '20px', zIndex: 10 }}>
                    DEMANDE DE DESIGN 🎨
                </div>
            )}
            
            <div className="card-info-group">
                <div ref={qrRef} style={{ width: '76px', height: '76px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F1F5F9', overflow: 'hidden', flexShrink: 0 }}></div>
                <div>
                    <div style={{ color: '#6366F1', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase' }}>{card.admin_profile?.qr_type || 'URL'}</div>
                    <div style={{ fontWeight: '900', fontSize: '18px', color: '#1A1265', margin: '2px 0' }}>{card.card_name || 'Sans nom'}</div>
                    <div style={{ color: '#94A3B8', fontSize: '12px' }}>ID: {card.card_id}</div>
                </div>
            </div>

            <div style={{ flex: 1 }} className="desktop-only">
                <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '600' }}>
                    📅 {new Date(card.updated_at || card.created_at).toLocaleDateString('fr-FR')}
                </div>
            </div>

            <div style={{ minWidth: '100px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '900', padding: '4px 12px', borderRadius: '10px', background: isActive ? '#DCFCE7' : '#FEE2E2', color: isActive ? '#15803D' : '#B91C1C', textTransform: 'uppercase' }}>{isActive ? 'Active' : 'Attente'}</span>
            </div>

            <div style={{ textAlign: 'center', minWidth: '80px' }}>
                <div style={{ fontSize: '20px', fontWeight: '1000', color: '#1A1265' }}>{scanCount}</div>
                <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '900' }}>SCANS</div>
            </div>

            <div className="card-actions-group">
                {isPendingRequest ? (
                    <button onClick={onResolve} style={{ background: '#10B981', color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Fait</button>
                ) : (
                    <button onClick={() => navigate(`/admin/card/${card.card_id}`)} style={{ background: '#1A1265', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Gérer</button>
                )}
            </div>
        </div>
    );
}