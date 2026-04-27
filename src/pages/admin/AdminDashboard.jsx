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

    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', children: null, onConfirm: null, type: 'info' });
    const [folderNameInput, setFolderNameInput] = useState('');

    useEffect(() => {
        loadData();
        loadFolders();
    }, [filterFolder]);

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

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function openCreateFolderModal(isSub = false) {
        setFolderNameInput('');
        setModalConfig({
            isOpen: true,
            title: isSub ? 'Créer un sous-dossier' : 'Créer un nouveau dossier',
            children: (
                <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#1A1265', marginBottom: '8px', display: 'block' }}>Nom du dossier</label>
                    <input 
                        type="text" 
                        autoFocus
                        placeholder="Ex: Marketing Print" 
                        id="folder-input-id"
                        onChange={e => setFolderNameInput(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }}
                    />
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
        } catch (err) {
            toast('Erreur : Assurez-vous d\'avoir ajouté la colonne parent_id via SQL.', 'error');
        }
    }

    function openDeleteFolderModal(id, name, e) {
        if (e) e.stopPropagation();
        setModalConfig({
            isOpen: true,
            title: 'Action critique',
            children: (
                <div>
                    <p style={{ marginBottom: '12px' }}>Voulez-vous supprimer le dossier <strong style={{ color: '#1A1265' }}>"{name}"</strong> ?</p>
                    <p style={{ color: '#EF4444', fontWeight: '700', fontSize: '13px' }}>⚠️ Tous les sous-dossiers seront aussi supprimés.</p>
                </div>
            ),
            onConfirm: () => handleDeleteFolder(id),
            type: 'warning',
            confirmText: 'Confirmer la suppression'
        });
    }

    async function handleDeleteFolder(id) {
        const { error } = await supabase.from('folders').delete().eq('id', id);
        if (error) toast('Erreur de suppression', 'error');
        else {
            toast('Dossier supprimé', 'success');
            loadFolders();
            if (filterFolder === id) setFilterFolder('');
        }
    }

    const currentFolder = folders.find(f => f.id === filterFolder);
    const isSubFolder = currentFolder?.parent_id != null;

    const filtered = cards.filter(c => {
        const matchesSearch = !search || c.card_name?.toLowerCase().includes(search.toLowerCase()) || c.card_id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const qrType = c.type_data?.qr_type || 'url';
        const matchesType = typeFilter === 'all' || qrType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'scanned') return (scans[b.card_id] || 0) - (scans[a.card_id] || 0);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / quantity);
    const currentItems = filtered.slice((currentPage - 1) * quantity, currentPage * quantity);

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', overflow: 'hidden' }}>
            <aside style={{ width: '290px', background: 'white', borderRight: '1px solid #E2E8F0', padding: '32px 20px', display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 100, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265' }}>QR CRAFTER</span>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <button onClick={() => setFilterFolder('')} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: !filterFolder ? '#1A1265' : 'transparent', color: !filterFolder ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>📊 Dashboard</button>
                    
                    <div style={{ margin: '12px 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Mes Dossiers</div>
                    
                    {folders.filter(f => !f.parent_id).map(f => (
                        <div key={f.id} style={{ marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button onClick={() => setFilterFolder(f.id)} style={{ flex: 1, padding: '10px 16px', borderRadius: '12px', border: 'none', background: filterFolder === f.id ? '#F1F5F9' : 'transparent', color: filterFolder === f.id ? '#1A1265' : '#475569', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }}></span> {f.name}
                                </button>
                                <button onClick={(e) => openDeleteFolderModal(f.id, f.name, e)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8' }} className="trash-btn">🗑️</button>
                            </div>
                            {folders.filter(sub => sub.parent_id === f.id).map(sub => (
                                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '24px' }}>
                                    <button onClick={() => setFilterFolder(sub.id)} style={{ flex: 1, padding: '8px 16px', borderRadius: '10px', border: 'none', background: filterFolder === sub.id ? '#F1F5F9' : 'transparent', color: filterFolder === sub.id ? '#1A1265' : '#475569', fontWeight: '600', textAlign: 'left', cursor: 'pointer', fontSize: '13px' }}>↳ {sub.name}</button>
                                    <button onClick={(e) => openDeleteFolderModal(sub.id, sub.name, e)} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#CBD5E1' }} className="trash-btn-sub">🗑️</button>
                                </div>
                            ))}
                        </div>
                    ))}
                </nav>

                <div style={{ padding: '16px 0', borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={() => openCreateFolderModal(false)} style={{ width: '100%', padding: '12px', borderRadius: '14px', border: '1px dashed #CBD5E1', background: 'white', color: '#1A1265', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>+ Nouveau dossier</button>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '14px', border: 'none', background: '#FEF2F2', borderRadius: '14px', color: '#DC2626', fontWeight: '700', cursor: 'pointer', marginTop: '16px' }}>Déconnexion</button>
                </div>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div style={{ padding: '40px 40px 20px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', zIndex: 50 }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265' }}>
                                {filterFolder ? currentFolder?.name : 'Tableau de bord'}
                            </h1>
                            <p style={{ color: '#64748B' }}>
                                {filterFolder ? (isSubFolder ? 'Contenu de ce sous-dossier' : 'Contenu de ce dossier') : 'Gérez l\'ensemble de vos projets QR.'}
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {filterFolder && !isSubFolder && (
                                <button onClick={() => openCreateFolderModal(true)} style={{ padding: '14px 24px', borderRadius: '14px', background: 'white', color: '#6366F1', border: '1px solid #6366F1', fontWeight: '700', cursor: 'pointer' }}>+ Créer un sous-dossier</button>
                            )}
                            <button onClick={() => navigate('/admin/create')} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '14px' }}>+ Nouveau QR</button>
                        </div>
                    </header>
                    <div style={{ background: 'white', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
                        <div style={{ position: 'relative', flex: 1 }}><span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔍</span><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} /></div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Type</option><option value="url">URL</option><option value="wifi">WiFi</option></select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="newest">Récent</option><option value="scanned">Scans</option></select>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 60px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
                        {loading ? <div style={{ textAlign: 'center', padding: '100px' }}>Chargement...</div> : currentItems.map(card => (
                            <CardListItem key={card.card_id} card={card} scanCount={scans[card.card_id] || 0} navigate={navigate} toast={toast} />
                        ))}
                    </div>
                </div>
            </main>

            <Modal isOpen={modalConfig.isOpen} title={modalConfig.title} onClose={() => setModalConfig({ ...modalConfig, isOpen: false })} onConfirm={modalConfig.onConfirm} confirmText={modalConfig.confirmText} type={modalConfig.type}>{modalConfig.children}</Modal>
            <style>{`
                .trash-btn:hover { color: #EF4444 !important; opacity: 1 !important; transform: scale(1.1); }
                .trash-btn-sub:hover { color: #EF4444 !important; opacity: 1 !important; transform: scale(1.1); }
                .trash-btn, .trash-btn-sub { transition: all 0.2s; }
            `}</style>
        </div>
    );
}

function CardListItem({ card, scanCount, navigate, toast }) {
    const qrRef = useRef(null);
    const isActive = card.status === 'active';
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
        <div style={{ background: 'white', borderRadius: '20px', padding: '24px 30px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
            <div ref={qrRef} style={{ width: '76px', height: '76px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F1F5F9', overflow: 'hidden', flexShrink: 0 }}></div>
            <div style={{ flex: 1 }}>
                <div style={{ color: '#6366F1', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', marginBottom: '4px' }}>{card.type_data?.qr_type || 'URL'}</div>
                <div style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265', marginBottom: '6px' }}>{card.card_name || 'Sans nom'}</div>
                <div style={{ color: '#94A3B8', fontSize: '13px', fontWeight: '600' }}>📅 Modifié le {new Date(card.updated_at || card.created_at).toLocaleDateString('fr-FR')}</div>
            </div>
            <div style={{ minWidth: '100px', textAlign: 'center' }}>
                <span style={{ 
                    fontSize: '11px', fontWeight: '900', padding: '6px 16px', borderRadius: '12px', 
                    background: isActive ? '#DCFCE7' : '#FEE2E2', 
                    color: isActive ? '#15803D' : '#B91C1C',
                    textTransform: 'uppercase', border: '1px solid',
                    borderColor: isActive ? '#86EFAC' : '#FECACA'
                }}>
                    {isActive ? 'Active' : 'En attente'}
                </span>
            </div>
            <div style={{ textAlign: 'center', minWidth: '100px', borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', padding: '0 24px' }}>
                <div style={{ fontSize: '26px', fontWeight: '1000', color: '#1A1265' }}>{scanCount}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '900' }}>SCANS</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => navigate(`/admin/card/${card.card_id}`)} style={{ background: '#1A1265', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Gérer</button>
            </div>
        </div>
    );
}