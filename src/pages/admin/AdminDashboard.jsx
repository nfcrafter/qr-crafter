// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';

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

    async function createFolder() {
        const name = prompt('Nom du nouveau dossier :');
        if (name) {
            const { error } = await supabase.from('folders').insert({ name, color: '#1A1265' });
            if (!error) { toast('Dossier créé', 'success'); loadFolders(); }
        }
    }

    async function createSubFolder() {
        if (!filterFolder) return toast('Sélectionnez un dossier parent d\'abord', 'info');
        const name = prompt('Nom du sous-dossier :');
        if (name) {
            const { error } = await supabase.from('folders').insert({ name, parent_id: filterFolder, color: '#6366F1' });
            if (!error) { toast('Sous-dossier créé', 'success'); loadFolders(); }
        }
    }

    async function deleteFolder(id, e) {
        e.stopPropagation();
        if (window.confirm('Supprimer ce dossier ?')) {
            const { error } = await supabase.from('folders').delete().eq('id', id);
            if (!error) { toast('Dossier supprimé', 'success'); loadFolders(); if (filterFolder === id) setFilterFolder(''); }
        }
    }

    const filtered = cards.filter(c => {
        const matchesSearch = !search || c.card_name?.toLowerCase().includes(search.toLowerCase()) || c.card_id?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const qrType = c.type_data?.qr_type || 'url';
        const matchesType = typeFilter === 'all' || qrType === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
    }).sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'name') return (a.card_name || '').localeCompare(b.card_name || '');
        if (sortBy === 'scanned') return (scans[b.card_id] || 0) - (scans[a.card_id] || 0);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / quantity);
    const currentItems = filtered.slice((currentPage - 1) * quantity, currentPage * quantity);

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', overflow: 'hidden' }}>
            <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #E2E8F0', padding: '32px 20px', display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 100, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265' }}>QR CRAFTER</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button onClick={createFolder} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>+ Dossier</button>
                    <button onClick={createSubFolder} style={{ flex: 1, padding: '8px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>+ Sous-dos.</button>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <button onClick={() => setFilterFolder('')} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', background: !filterFolder ? '#1A1265' : 'transparent', color: !filterFolder ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>📊 Dashboard</button>
                    {folders.filter(f => !f.parent_id).map(f => (
                        <div key={f.id} style={{ marginBottom: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button onClick={() => setFilterFolder(f.id)} style={{ flex: 1, padding: '10px 16px', borderRadius: '12px', border: 'none', background: filterFolder === f.id ? '#F1F5F9' : 'transparent', color: filterFolder === f.id ? '#1A1265' : '#64748B', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }}></span> {f.name}
                                </button>
                                <button onClick={(e) => deleteFolder(f.id, e)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.2 }}>🗑️</button>
                            </div>
                            {/* Nested children */}
                            {folders.filter(sub => sub.parent_id === f.id).map(sub => (
                                <button key={sub.id} onClick={() => setFilterFolder(sub.id)} style={{ width: 'calc(100% - 32px)', marginLeft: '32px', padding: '8px 16px', borderRadius: '10px', border: 'none', background: filterFolder === sub.id ? '#F1F5F9' : 'transparent', color: filterFolder === sub.id ? '#1A1265' : '#94A3B8', fontWeight: '500', textAlign: 'left', cursor: 'pointer', fontSize: '12px', display: 'block' }}>↳ {sub.name}</button>
                            ))}
                        </div>
                    ))}
                </nav>
                <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ padding: '14px', border: 'none', background: '#FEF2F2', borderRadius: '14px', color: '#DC2626', fontWeight: '700', cursor: 'pointer', marginTop: '10px' }}>🚪 Déconnexion</button>
            </aside>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <div style={{ padding: '40px 40px 20px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', zIndex: 50 }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div><h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265' }}>Tableau de bord</h1><p style={{ color: '#64748B' }}>Bienvenue dans votre espace d'administration.</p></div>
                        <button onClick={() => navigate('/admin/create')} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '14px' }}>+ Créer un code QR</button>
                    </header>
                    <div style={{ background: 'white', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
                        <div style={{ position: 'relative', flex: 1 }}><span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔍</span><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} /></div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Type</option><option value="url">URL</option><option value="wifi">WiFi</option></select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="newest">Plus récent</option><option value="scanned">Plus scanné</option></select>
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 60px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
                        {loading ? <div style={{ textAlign: 'center', padding: '60px' }}>Chargement...</div> : currentItems.map(card => (
                            <CardListItem key={card.card_id} card={card} scanCount={scans[card.card_id] || 0} navigate={navigate} toast={toast} />
                        ))}
                    </div>
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: '38px', height: '38px', borderRadius: '10px', border: 'none', background: currentPage === i + 1 ? '#1A1265' : 'white', color: currentPage === i + 1 ? 'white' : '#1A1265', fontWeight: '800', cursor: 'pointer' }}>{i + 1}</button>
                            ))}
                        </div>
                    )}
                </div>
            </main>
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

            {/* Status Badge moved before scans */}
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