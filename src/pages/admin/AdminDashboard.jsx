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

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        // Load Cards
        const { data: cardsData, error } = await supabase
            .from('cards')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) {
            toast('Erreur de chargement', 'error');
        } else {
            setCards(cardsData || []);
            
            // Load Scan Counts
            const { data: scansData } = await supabase
                .from('scan_logs')
                .select('card_id');
            
            const counts = {};
            scansData?.forEach(s => {
                counts[s.card_id] = (counts[s.card_id] || 0) + 1;
            });
            setScans(counts);
        }
        setLoading(false);
    }

    const filtered = cards.filter(c => {
        const matchesSearch = !search || 
            c.card_name?.toLowerCase().includes(search.toLowerCase()) || 
            c.card_id?.toLowerCase().includes(search.toLowerCase());
        
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
        <div style={{ minHeight: '100vh', background: '#F4F7FA', color: '#1A1265', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <header style={{ background: 'white', padding: '16px 40px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
                    <span style={{ fontWeight: '800', fontSize: '20px', color: '#1A1265', letterSpacing: '-0.5px' }}>QR CRAFTER</span>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button className="btn-primary" onClick={() => navigate('/admin/create')} style={{ padding: '10px 24px', borderRadius: '8px', background: '#1A1265', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>
                        + Créer une carte
                    </button>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ background: 'transparent', border: 'none', color: '#64748B', cursor: 'pointer', fontWeight: '600' }}>Déconnexion</button>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px' }}>
                {/* 5 Horizontal Filters */}
                <div style={{ 
                    background: 'white', 
                    padding: '24px 32px', 
                    borderRadius: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    marginBottom: '32px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                    flexWrap: 'wrap'
                }}>
                    <span style={{ fontWeight: '800', fontSize: '18px', whiteSpace: 'nowrap', marginRight: '8px' }}>Mes codes QR</span>
                    
                    {/* Filter 1: Search */}
                    <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>🔍</span>
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px' }}
                        />
                    </div>

                    {/* Filter 2: Status */}
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white', minWidth: '150px' }}>
                        <option value="all">Statut du code QR</option>
                        <option value="active">Activée</option>
                        <option value="pending">En attente</option>
                    </select>

                    {/* Filter 3: Type */}
                    <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white', minWidth: '150px' }}>
                        <option value="all">Types de codes QR</option>
                        <option value="url">URL / Profil</option>
                        <option value="vcard">VCard</option>
                        <option value="wifi">WiFi</option>
                        <option value="text">Texte</option>
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="phone">Téléphone</option>
                    </select>

                    {/* Filter 4: Sort */}
                    <select value={sortBy} onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white', minWidth: '180px' }}>
                        <option value="newest">Trier par : Le plus récent</option>
                        <option value="name">Trier par : Nom</option>
                        <option value="scanned">Trier par : Le plus scanné</option>
                        <option value="modified">Trier par : Récemment modifié</option>
                    </select>

                    {/* Filter 5: Quantity */}
                    <select value={quantity} onChange={e => { setQuantity(Number(e.target.value)); setCurrentPage(1); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px', background: 'white', minWidth: '120px' }}>
                        <option value={10}>Quantité : 10</option>
                        <option value={20}>Quantité : 20</option>
                        <option value={50}>Quantité : 50</option>
                        <option value={100}>Quantité : 100</option>
                    </select>
                </div>

                {/* Cards List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Chargement des données...</div>
                    ) : currentItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px', border: '1px dashed #E2E8F0' }}>
                            <div style={{ fontSize: '16px', color: '#64748B' }}>Aucun code QR ne correspond à votre recherche.</div>
                        </div>
                    ) : (
                        currentItems.map(card => (
                            <CardListItem key={card.card_id} card={card} scanCount={scans[card.card_id] || 0} navigate={navigate} toast={toast} />
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
                        {[...Array(totalPages)].map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                style={{ 
                                    width: '40px', height: '40px', borderRadius: '8px', border: 'none',
                                    background: currentPage === i + 1 ? '#1A1265' : 'white',
                                    color: currentPage === i + 1 ? 'white' : '#1A1265',
                                    fontWeight: '800', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

function CardListItem({ card, scanCount, navigate, toast }) {
    const qrRef = useRef(null);
    const type = card.type_data?.qr_type || 'url';
    const lastModified = new Date(card.updated_at || card.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    useEffect(() => {
        if (qrRef.current) {
            const qrCode = new QRCodeStyling({
                width: 70,
                height: 70,
                data: `${window.location.origin}/u/${card.card_id}`,
                dotsOptions: { color: card.qr_appearance?.dotsColor || "#1A1265", type: card.qr_appearance?.dotsType || "rounded" },
                cornersSquareOptions: { color: card.qr_appearance?.cornersColor || "#1A1265", type: card.qr_appearance?.cornersType || "extra-rounded" },
                backgroundOptions: { color: "#FFFFFF" },
                image: card.qr_appearance?.logo_url || "",
                imageOptions: { crossOrigin: 'anonymous', margin: 2 }
            });
            qrRef.current.innerHTML = '';
            qrCode.append(qrRef.current);
        }
    }, [card]);

    async function downloadQR() {
        const qrCode = new QRCodeStyling({
            width: 1000,
            height: 1000,
            data: `${window.location.origin}/u/${card.card_id}`,
            dotsOptions: { color: card.qr_appearance?.dotsColor || "#1A1265", type: card.qr_appearance?.dotsType || "rounded" },
            cornersSquareOptions: { color: card.qr_appearance?.cornersColor || "#1A1265", type: card.qr_appearance?.cornersType || "extra-rounded" },
            backgroundOptions: { color: "#FFFFFF" },
            image: card.qr_appearance?.logo_url || "",
            imageOptions: { crossOrigin: 'anonymous', margin: 10 }
        });
        await qrCode.download({ name: `QR-${card.card_id}`, extension: 'png' });
        toast('Téléchargement lancé', 'success');
    }

    return (
        <div style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '20px 24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            border: '1px solid #F1F5F9'
        }}>
            {/* QR Preview Image */}
            <div ref={qrRef} style={{ width: '70px', height: '70px', background: '#F8FAFC', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E2E8F0' }}></div>

            {/* Content: Type, Name, Modified Date */}
            <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ color: '#6366F1', fontWeight: '700', fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>{type}</div>
                <div style={{ fontWeight: '800', fontSize: '18px', color: '#1A1265', marginBottom: '8px' }}>{card.card_name || 'Sans nom'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontSize: '13px' }}>
                    <span style={{ fontSize: '14px' }}>📅</span>
                    <span>Modifié le {lastModified}</span>
                </div>
            </div>

            {/* Scans Count */}
            <div style={{ textAlign: 'center', minWidth: '100px', borderLeft: '1px solid #F1F5F9', borderRight: '1px solid #F1F5F9', padding: '0 24px' }}>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#1A1265' }}>{scanCount}</div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', letterSpacing: '1px' }}>SCANS</div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                    onClick={downloadQR}
                    style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', color: '#1A1265', fontSize: '14px' }}
                >
                    Télécharger
                </button>
                <button 
                    onClick={() => navigate(`/admin/card/${card.card_id}`)}
                    style={{ background: '#1A1265', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', color: 'white', fontSize: '14px' }}
                >
                    Gérer
                </button>
            </div>
        </div>
    );
}