// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterFolder, setFilterFolder] = useState('');
    const [folders, setFolders] = useState([]);
    const [showFolderManager, setShowFolderManager] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [newFolderColor, setNewFolderColor] = useState('#6366F1');
    const [newFolderParent, setNewFolderParent] = useState(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

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
        if (!newFolderName.trim()) return;
        const { error } = await supabase.from('folders').insert({
            name: newFolderName.trim(),
            color: newFolderColor,
            parent_id: newFolderParent
        });
        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Dossier créé !', 'success');
            setNewFolderName('');
            setNewFolderParent(null);
            setShowFolderManager(false);
            loadFolders();
        }
    }

    async function deleteFolder(id, e) {
        e.stopPropagation();
        if (!confirm('Supprimer ce dossier et tout son contenu ?')) return;
        await supabase.from('folders').delete().eq('id', id);
        if (filterFolder === id) setFilterFolder('');
        loadFolders();
        toast('Dossier supprimé', 'info');
    }

    const filtered = cards.filter(c => 
        !search || 
        c.card_id?.toLowerCase().includes(search.toLowerCase()) || 
        c.card_name?.toLowerCase().includes(search.toLowerCase()) ||
        (c.type_data?.qr_type || '').toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'active').length,
        pending: cards.filter(c => c.status === 'pending').length,
    };

    return (
        <div style={{ 
            display: 'flex', 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)',
            color: 'var(--text-900)'
        }}>
            {/* Sidebar */}
            <aside style={{ 
                width: '300px', 
                background: 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(255, 255, 255, 0.3)', 
                padding: '40px 24px', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 10,
                boxShadow: '20px 0 50px rgba(0,0,0,0.02)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '48px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(26, 18, 101, 0.2)' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
                    </div>
                    <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '-1px', color: 'var(--primary)' }}>QR CRAFTER</span>
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    <button 
                        onClick={() => { setFilterFolder(''); setCurrentPage(1); }}
                        style={{ 
                            width: '100%', padding: '14px 18px', borderRadius: '16px', border: 'none', 
                            background: !filterFolder ? 'var(--primary)' : 'transparent',
                            color: !filterFolder ? 'white' : 'var(--text-600)',
                            fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: !filterFolder ? '0 10px 20px -5px rgba(26, 18, 101, 0.3)' : 'none'
                        }}
                    >
                        <span style={{ fontSize: '20px' }}>📊</span> Tableau de bord
                    </button>

                    <div style={{ margin: '32px 18px 16px', fontSize: '11px', fontWeight: '800', color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Mes Dossiers</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {folders.filter(f => !f.parent_id).map(f => (
                            <div key={f.id} style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <button 
                                        onClick={() => { setFilterFolder(f.id); setCurrentPage(1); }}
                                        style={{ 
                                            flex: 1, padding: '12px 18px', borderRadius: '14px', border: 'none', 
                                            background: filterFolder === f.id ? 'white' : 'transparent',
                                            color: filterFolder === f.id ? 'var(--primary)' : 'var(--text-700)',
                                            fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                                            transition: 'all 0.2s',
                                            boxShadow: filterFolder === f.id ? '0 4px 12px rgba(0,0,0,0.05)' : 'none'
                                        }}
                                    >
                                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: f.color, boxShadow: `0 0 10px ${f.color}66` }}></div>
                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                                    </button>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                        <button onClick={(e) => { e.stopPropagation(); setNewFolderParent(f.id); setShowFolderManager(true); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.5 }}>➕</button>
                                        <button onClick={(e) => deleteFolder(f.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '12px', opacity: 0.3 }}>✕</button>
                                    </div>
                                </div>
                                
                                {/* Subfolders */}
                                {folders.filter(sub => sub.parent_id === f.id).map(sub => (
                                    <button 
                                        key={sub.id}
                                        onClick={() => { setFilterFolder(sub.id); setCurrentPage(1); }}
                                        style={{ 
                                            width: 'calc(100% - 24px)', marginLeft: '24px', padding: '8px 12px', borderRadius: '10px', border: 'none', 
                                            background: filterFolder === sub.id ? 'white' : 'transparent',
                                            color: filterFolder === sub.id ? 'var(--primary)' : 'var(--text-500)',
                                            fontWeight: '500', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                            marginTop: '2px'
                                        }}
                                    >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '2px', background: sub.color }}></div>
                                        <span style={{ flex: 1, fontSize: '13px' }}>{sub.name}</span>
                                        <span onClick={(e) => deleteFolder(sub.id, e)} style={{ opacity: 0.3 }}>✕</span>
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => setShowFolderManager(true)}
                        style={{ 
                            width: '100%', padding: '14px', border: '2px dashed #E2E8F0', borderRadius: '16px', 
                            background: 'rgba(255,255,255,0.4)', color: 'var(--text-500)', fontSize: '13px', 
                            fontWeight: '700', cursor: 'pointer', marginTop: '20px', transition: 'all 0.3s'
                        }}
                    >
                        + Créer un dossier
                    </button>
                </nav>

                <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', marginTop: '24px' }}>
                    <button 
                        onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
                        style={{ width: '100%', padding: '14px 18px', borderRadius: '14px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
                    >
                        🚪 Déconnexion
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '48px 60px', marginLeft: '300px', maxWidth: 'calc(100vw - 300px)' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
                    <div>
                        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1.5px', marginBottom: '8px', color: 'var(--primary)' }}>Administration</h1>
                        <p style={{ color: 'var(--text-500)', fontSize: '16px', fontWeight: '500' }}>Gérez vos cartes et clients avec précision.</p>
                    </div>
                    <button 
                        className="btn-primary" 
                        onClick={() => navigate('/admin/create')}
                        style={{ padding: '16px 32px', borderRadius: '18px', fontSize: '16px', fontWeight: '800', boxShadow: '0 15px 30px rgba(26, 18, 101, 0.25)' }}
                    >
                        + Créer une Carte
                    </button>
                </header>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '48px' }}>
                    <StatCard label="Total Cartes" value={stats.total} icon="💳" color="var(--primary)" gradient="linear-gradient(135deg, #1A1265 0%, #4338CA 100%)" />
                    <StatCard label="Cartes Actives" value={stats.active} icon="✨" color="#10B981" gradient="linear-gradient(135deg, #059669 0%, #10B981 100%)" />
                    <StatCard label="En Attente" value={stats.pending} icon="⏳" color="#F59E0B" gradient="linear-gradient(135deg, #D97706 0%, #F59E0B 100%)" />
                </div>

                {/* Table */}
                <div style={{ 
                    background: 'white', 
                    borderRadius: '32px', 
                    boxShadow: '0 20px 50px rgba(0,0,0,0.04)', 
                    border: '1px solid rgba(255,255,255,0.8)',
                    overflow: 'hidden'
                }}>
                    <div style={{ padding: '32px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '500px' }}>
                            <span style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', opacity: 0.4 }}>🔍</span>
                            <input 
                                type="text" 
                                placeholder="Rechercher par nom, ID ou type..." 
                                style={{ 
                                    padding: '16px 20px 16px 56px', 
                                    width: '100%', 
                                    borderRadius: '20px', 
                                    border: '1px solid #E2E8F0',
                                    background: '#F8FAFC',
                                    fontSize: '15px',
                                    fontWeight: '600'
                                }}
                                value={search}
                                onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-400)', background: '#F1F5F9', padding: '10px 20px', borderRadius: '14px' }}>
                            {filtered.length} résultats
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC' }}>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>Client / Type</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>Ville</th>
                                    <th style={{ padding: '20px 32px', fontSize: '12px', fontWeight: '800', color: 'var(--text-400)', textTransform: 'uppercase', letterSpacing: '1px' }}>Statut</th>
                                    <th style={{ padding: '20px 32px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentItems.map((card) => (
                                    <tr key={card.card_id} style={{ borderBottom: '1px solid #F1F5F9', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}>
                                        <td style={{ padding: '24px 32px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                                                    {getQrIcon(card.type_data?.qr_type || 'url')}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: '800', color: 'var(--text-900)' }}>{card.card_name}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '700' }}>{card.type_data?.qr_type?.toUpperCase() || 'URL'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '24px 32px' }}>
                                            <code style={{ background: '#EEF2FF', color: 'var(--primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>{card.card_id}</code>
                                        </td>
                                        <td style={{ padding: '24px 32px' }}>
                                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{card.city}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-400)' }}>{card.country}</div>
                                        </td>
                                        <td style={{ padding: '24px 32px' }}>
                                            <span style={{ 
                                                padding: '6px 14px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                                                background: card.status === 'active' ? '#DCFCE7' : '#FEF3C7',
                                                color: card.status === 'active' ? '#166534' : '#92400E'
                                            }}>
                                                {card.status === 'active' ? 'Activée' : 'Attente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '24px 32px', textAlign: 'right' }}>
                                            <button className="btn-ghost" style={{ padding: '8px 16px', borderRadius: '10px' }} onClick={() => navigate(`/admin/card/${card.card_id}`)}>Éditer</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ padding: '24px 32px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'center', gap: '8px', background: '#F8FAFC' }}>
                            {[...Array(totalPages)].map((_, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    style={{ 
                                        width: '36px', height: '36px', borderRadius: '10px', border: 'none',
                                        background: currentPage === i + 1 ? 'var(--primary)' : 'white',
                                        color: currentPage === i + 1 ? 'white' : 'var(--text-700)',
                                        fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Folder Modal */}
            {showFolderManager && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26, 18, 101, 0.4)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="premium-card" style={{ width: '400px', borderRadius: '32px' }}>
                        <h2 style={{ marginBottom: '24px', fontWeight: '900' }}>Nouveau Dossier</h2>
                        <div className="field">
                            <label>Nom</label>
                            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Ex: Restaurant" />
                        </div>
                        <div className="field">
                            <label>Couleur</label>
                            <input type="color" value={newFolderColor} onChange={e => setNewFolderColor(e.target.value)} style={{ width: '100%', height: '50px', border: 'none', borderRadius: '12px' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setShowFolderManager(false)}>Annuler</button>
                            <button className="btn-primary" style={{ flex: 1 }} onClick={createFolder}>Créer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, color, gradient }) {
    return (
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: gradient, color: 'white', borderRadius: '24px', border: 'none' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '14px', opacity: 0.7, fontWeight: '600' }}>{label}</div>
                <div style={{ fontSize: '28px', fontWeight: '900' }}>{value}</div>
            </div>
        </div>
    );
}

function getQrIcon(type) {
    const icons = {
        url: '🔗', vcard: '👤', text: '📝', wifi: '📶',
        email: '📧', sms: '💬', phone: '📞', geo: '📍',
        event: '📅', crypto: '₿', instagram: '📸', facebook: '👥',
        pdf: '📄', music: '🎵', video: '🎞️', image: '🖼️'
    };
    return icons[type] || '✨';
}