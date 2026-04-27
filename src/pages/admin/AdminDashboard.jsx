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
        <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)' }}>
            <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #E2E8F0', padding: '32px 20px', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 100, boxShadow: '10px 0 30px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                    <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265', letterSpacing: '-0.5px' }}>QR CRAFTER</span>
                </div>
                <nav style={{ flex: 1 }}>
                    <button onClick={() => setFilterFolder('')} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: !filterFolder ? 'linear-gradient(135deg, #1A1265 0%, #4338CA 100%)' : 'transparent', color: !filterFolder ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', transition: 'all 0.3s', boxShadow: !filterFolder ? '0 10px 15px -3px rgba(26, 18, 101, 0.2)' : 'none' }}>
                        <span>📊</span> Dashboard
                    </button>
                    <div style={{ margin: '32px 16px 16px', fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Dossiers</div>
                    {folders.map(f => (
                        <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                            <button onClick={() => setFilterFolder(f.id)} style={{ flex: 1, padding: '12px 16px', borderRadius: '14px', border: 'none', background: filterFolder === f.id ? '#F1F5F9' : 'transparent', color: filterFolder === f.id ? '#1A1265' : '#64748B', fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s' }}>
                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: f.color }}></span>
                                {f.name}
                            </button>
                            <button onClick={(e) => deleteFolder(f.id, e)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', opacity: 0.2, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 0.8} onMouseLeave={e => e.currentTarget.style.opacity = 0.2}>🗑️</button>
                        </div>
                    ))}
                </nav>
                <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ padding: '16px', border: 'none', background: '#FEF2F2', borderRadius: '16px', color: '#DC2626', fontWeight: '700', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>🚪 Se déconnecter</button>
            </aside>

            <main style={{ flex: 1, padding: '40px', marginLeft: '280px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1265', marginBottom: '8px', letterSpacing: '-1px' }}>Dashboard <span style={{ fontWeight: '400', color: '#94A3B8' }}>Admin</span></h1>
                        <p style={{ color: '#64748B', fontSize: '16px' }}>Suivi précis des scans et gestion de vos solutions QR.</p>
                    </div>
                    <button onClick={() => navigate('/admin/create')} className="btn-primary" style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '16px' }}>
                        + Créer un code QR
                    </button>
                </header>

                {/* horizontal Filters Bar */}
                <div style={{ 
                    background: 'white', 
                    padding: '24px 32px', 
                    borderRadius: '24px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '20px', 
                    marginBottom: '32px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                    border: '1px solid #F1F5F9'
                }}>
                    <span style={{ fontWeight: '900', fontSize: '18px', color: '#1A1265', marginRight: '10px' }}>Mes codes QR</span>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }}>🔍</span>
                        <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '14px', border: '1px solid #E2E8F0', background: '#F8FAFC', outline: 'none' }} />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                    <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="all">Type</option><option value="url">URL</option><option value="vcard">VCard</option><option value="wifi">WiFi</option></select>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value="newest">Récent</option><option value="name">Nom</option><option value="scanned">Scans</option></select>
                    <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} style={{ padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }}><option value={10}>Afficher 10</option><option value={20}>Afficher 20</option></select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '100px' }}>Chargement...</div>
                    ) : currentItems.map(card => (
                        <CardListItem key={card.card_id} card={card} scanCount={scans[card.card_id] || 0} navigate={navigate} toast={toast} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '48px' }}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button key={i} onClick={() => setCurrentPage(i + 1)} style={{ width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: currentPage === i + 1 ? '#1A1265' : 'white', color: currentPage === i + 1 ? 'white' : '#1A1265', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{i + 1}</button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function CardListItem({ card, scanCount, navigate, toast }) {
    const qrRef = useRef(null);
    const lastModified = new Date(card.updated_at || card.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    useEffect(() => {
        if (qrRef.current) {
            const qrCode = new QRCodeStyling({
                width: 80, height: 80, data: `${window.location.origin}/u/${card.card_id}`,
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
        <div className="premium-card animate-fade-in" style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '24px', border: '1px solid rgba(255,255,255,0.8)' }}>
            {/* Aperçu QR juste avant le nom */}
            <div ref={qrRef} style={{ width: '80px', height: '80px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', overflow: 'hidden', flexShrink: 0 }}></div>
            
            <div style={{ flex: 1 }}>
                <div style={{ color: '#6366F1', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>{card.type_data?.qr_type || 'URL'}</div>
                <div style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265', marginBottom: '4px' }}>{card.card_name || 'Sans nom'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94A3B8', fontSize: '13px', fontWeight: '600' }}>
                    <span>📅</span> <span>{lastModified}</span>
                </div>
            </div>

            <div style={{ textAlign: 'center', minWidth: '100px', borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', padding: '0 24px' }}>
                <div style={{ fontSize: '28px', fontWeight: '1000', color: '#1A1265' }}>{scanCount}</div>
                <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '900' }}>SCANS</div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={downloadQR} style={{ background: '#F1F5F9', color: '#1A1265', padding: '12px 20px', borderRadius: '12px', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Télécharger</button>
                <button onClick={() => navigate(`/admin/card/${card.card_id}`)} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>Gérer</button>
            </div>
        </div>
    );
}