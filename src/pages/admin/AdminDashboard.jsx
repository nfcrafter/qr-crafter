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

    async function deleteFolder(id, e) {
        e.stopPropagation();
        if (window.confirm('Supprimer ce dossier ? Les cartes ne seront pas supprimées.')) {
            const { error } = await supabase.from('folders').delete().eq('id', id);
            if (!error) {
                toast('Dossier supprimé', 'success');
                loadFolders();
                if (filterFolder === id) setFilterFolder('');
            }
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
        if (sortBy === 'modified') return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
        return 0;
    });

    const totalPages = Math.ceil(filtered.length / quantity);
    const currentItems = filtered.slice((currentPage - 1) * quantity, currentPage * quantity);

    return (
        <div style={{ display: 'flex', height: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)', overflow: 'hidden' }}>
            {/* Sidebar (Fixed height) */}
            <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #E2E8F0', padding: '32px 20px', display: 'flex', flexDirection: 'column', height: '100vh', zIndex: 100, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265', letterSpacing: '-0.5px' }}>QR CRAFTER</span>
                </div>
                <nav style={{ flex: 1, overflowY: 'auto' }}>
                    <button onClick={() => setFilterFolder('')} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: !filterFolder ? '#1A1265' : 'transparent', color: !filterFolder ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <span>📊</span> Dashboard
                    </button>
                    <div style={{ margin: '24px 16px 12px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Dossiers</div>
                    {folders.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                            <button onClick={() => setFilterFolder(f.id)} style={{ flex: 1, padding: '10px 16px', borderRadius: '14px', border: 'none', background: filterFolder === f.id ? '#F1F5F9' : 'transparent', color: filterFolder === f.id ? '#1A1265' : '#64748B', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }}></span>
                                {f.name}
                            </button>
                            <button onClick={(e) => deleteFolder(f.id, e)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.2 }}>🗑️</button>
                        </div>
                    ))}
                </nav>
                <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ padding: '16px', border: 'none', background: '#FEF2F2', borderRadius: '16px', color: '#DC2626', fontWeight: '700', cursor: 'pointer', marginTop: '20px' }}>🚪 Déconnexion</button>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                {/* Fixed Top Section (Header + Filters) */}
                <div style={{ padding: '40px 40px 20px', background: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #E2E8F0', zIndex: 50 }}>
                    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265', marginBottom: '4px' }}>Administration</h1>
                            <p style={{ color: '#64748B' }}>Gérez vos projets QR premium en temps réel.</p>
                        </div>
                        <button onClick={() => navigate('/admin/create')} className="btn-primary" style={{ padding: '14px 28px', borderRadius: '14px' }}>
                            + Nouveau QR
                        </button>
                    </header>

                    {/* Filter Bar (No Label "Mes codes QR") */}
                    <div style={{ 
                        background: 'white', 
                        padding: '16px 24px', 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        boxShadow: '0 4px 15px rgba(0,0,0,0.02)',
                        border: '1px solid #F1F5F9'
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔍</span>
                            <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Type</option><option value="url">URL</option><option value="vcard">VCard</option><option value="wifi">WiFi</option></select>
                        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="newest">Récent</option><option value="name">Nom</option><option value="scanned">Scans</option></select>
                        <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value={10}>10 par page</option><option value={20}>20 par page</option></select>
                    </div>
                </div>

                {/* Scrollable List Section */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 40px 60px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '60px' }}>Chargement...</div>
                        ) : currentItems.map(card => (
                            <CardListItem key={card.card_id} card={card} scanCount={scans[card.card_id] || 0} navigate={navigate} toast={toast} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: currentPage === i + 1 ? '#1A1265' : 'white', color: currentPage === i + 1 ? 'white' : '#1A1265', fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>{i + 1}</button>
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
                dotsOptions: { 
                    color: card.qr_appearance?.dotsColor || "#1A1265", 
                    type: card.qr_appearance?.dotsType || "rounded",
                    gradient: card.qr_appearance?.useGradient ? {
                        type: 'linear', rotation: 45,
                        colorStops: [{ offset: 0, color: card.qr_appearance?.dotsColor }, { offset: 1, color: card.qr_appearance?.gradientColor || '#6366F1' }]
                    } : null
                },
                cornersSquareOptions: { color: card.qr_appearance?.cornersColor || "#1A1265", type: card.qr_appearance?.cornersType || "extra-rounded" },
                backgroundOptions: { color: "#FFFFFF" },
                image: card.qr_appearance?.logo_url || "",
                imageOptions: { crossOrigin: 'anonymous', margin: 2 }
            });
            qrRef.current.innerHTML = ''; qrCode.append(qrRef.current);
        }
    }, [card]);

    async function downloadQR() {
        const qrCode = new QRCodeStyling({
            width: 1000, height: 1000, data: `${window.location.origin}/u/${card.card_id}`,
            dotsOptions: { 
                color: card.qr_appearance?.dotsColor || "#1A1265", type: card.qr_appearance?.dotsType || "rounded",
                gradient: card.qr_appearance?.useGradient ? {
                    type: 'linear', rotation: 45,
                    colorStops: [{ offset: 0, color: card.qr_appearance?.dotsColor }, { offset: 1, color: card.qr_appearance?.gradientColor || '#6366F1' }]
                } : null
            },
            cornersSquareOptions: { color: card.qr_appearance?.cornersColor || "#1A1265", type: card.qr_appearance?.cornersType || "extra-rounded" },
            backgroundOptions: { color: "#FFFFFF" },
            image: card.qr_appearance?.logo_url || "",
            imageOptions: { crossOrigin: 'anonymous', margin: 10 }
        });
        await qrCode.download({ name: `QR-${card.card_id}`, extension: 'png' });
        toast('Téléchargement lancé', 'success');
    }

    return (
        <div style={{ background: 'white', borderRadius: '18px', padding: '20px 30px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }}>
            <div ref={qrRef} style={{ width: '76px', height: '76px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F1F5F9', overflow: 'hidden', flexShrink: 0 }}></div>
            
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ color: '#6366F1', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.type_data?.qr_type || 'URL'}</span>
                    {/* Status Badge */}
                    <span style={{ 
                        fontSize: '9px', fontWeight: '900', padding: '2px 8px', borderRadius: '10px', 
                        background: isActive ? '#DCFCE7' : '#FEF2F2', 
                        color: isActive ? '#166534' : '#991B1B',
                        textTransform: 'uppercase'
                    }}>
                        {isActive ? 'Active' : 'En attente'}
                    </span>
                </div>
                <div style={{ fontWeight: '900', fontSize: '19px', color: '#1A1265', marginBottom: '4px' }}>{card.card_name || 'Sans nom'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px' }}>
                    <span>📅</span> <span>{new Date(card.updated_at || card.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '100px', borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', padding: '0 24px' }}>
                <div style={{ fontSize: '26px', fontWeight: '1000', color: '#1A1265' }}>{scanCount}</div>
                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '900' }}>SCANS</div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={downloadQR} style={{ background: '#F8FAFC', color: '#1A1265', padding: '12px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Télécharger</button>
                <button onClick={() => navigate(`/admin/card/${card.card_id}`)} style={{ background: '#1A1265', color: 'white', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Gérer</button>
            </div>
        </div>
    );
}