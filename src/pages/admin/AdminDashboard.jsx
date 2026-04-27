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
    const [newFolderColor, setNewFolderColor] = useState('#28C254');

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
            color: newFolderColor
        });
        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Dossier créé !', 'success');
            setNewFolderName('');
            setShowFolderManager(false);
            loadFolders();
        }
    }

    async function deleteFolder(id) {
        if (!confirm('Supprimer ce dossier ?')) return;
        await supabase.from('folders').delete().eq('id', id);
        if (filterFolder === id) setFilterFolder('');
        loadFolders();
    }

    const filtered = cards.filter(c => 
        !search || 
        c.card_id?.toLowerCase().includes(search.toLowerCase()) || 
        c.card_name?.toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: cards.length,
        active: cards.filter(c => c.status === 'active').length,
        pending: cards.filter(c => c.status === 'pending').length,
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Sidebar */}
            <aside style={{ width: '280px', background: 'white', borderRight: '1px solid var(--border)', padding: '32px 20px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', cursor: 'pointer' }} onClick={() => navigate('/admin')}>
                    <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                    <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px', color: 'var(--primary)' }}>QR CRAFTER</span>
                </div>

                <nav style={{ flex: 1 }}>
                    <button 
                        onClick={() => setFilterFolder('')}
                        style={{ 
                            width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', 
                            background: !filterFolder ? 'var(--primary-light)' : 'transparent',
                            color: !filterFolder ? 'var(--primary)' : 'var(--text-500)',
                            fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px'
                        }}
                    >
                        📊 Tableau de bord
                    </button>

                    <div style={{ margin: '24px 16px 12px', fontSize: '12px', fontWeight: '700', color: 'var(--text-400)', textTransform: 'uppercase' }}>Dossiers</div>
                    
                    {folders.map(f => (
                        <div key={f.id} style={{ position: 'relative', marginBottom: '4px' }}>
                            <button 
                                onClick={() => setFilterFolder(f.id)}
                                style={{ 
                                    width: '100%', padding: '10px 16px', borderRadius: '10px', border: 'none', 
                                    background: filterFolder === f.id ? 'var(--primary-light)' : 'transparent',
                                    color: filterFolder === f.id ? 'var(--primary)' : 'var(--text-700)',
                                    fontWeight: '500', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                                }}
                            >
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: f.color }}></span>
                                {f.name}
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={() => setShowFolderManager(true)}
                        style={{ width: '100%', padding: '10px 16px', border: '1px dashed var(--border)', borderRadius: '10px', background: 'transparent', color: 'var(--text-400)', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}
                    >
                        + Nouveau dossier
                    </button>
                </nav>

                <button 
                    onClick={async () => { await supabase.auth.signOut(); navigate('/login'); }}
                    style={{ padding: '12px', border: 'none', background: 'transparent', color: '#EF4444', fontWeight: '600', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    🚪 Déconnexion
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Administration</h1>
                        <p style={{ color: 'var(--text-500)' }}>Gérez vos cartes NFC et clients depuis cet espace.</p>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/admin/create')}>
                        + Créer une carte
                    </button>
                </header>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    <StatCard label="Total Cartes" value={stats.total} icon="💳" color="var(--primary)" />
                    <StatCard label="Cartes Actives" value={stats.active} icon="✅" color="#22C55E" />
                    <StatCard label="En Attente" value={stats.pending} icon="⏳" color="var(--accent)" />
                </div>

                {/* Filters & Table */}
                <div className="premium-card" style={{ padding: '0' }}>
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '16px' }}>
                        <input 
                            type="text" 
                            placeholder="Rechercher une carte..." 
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ maxWidth: '400px' }}
                        />
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#F8FAFC', borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-500)', fontWeight: '600' }}>CLIENT / CARTE</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-500)', fontWeight: '600' }}>ID</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '13px', color: 'var(--text-500)', fontWeight: '600' }}>STATUT</th>
                                    <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '13px', color: 'var(--text-500)', fontWeight: '600' }}>ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-400)' }}>Chargement...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="4" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-400)' }}>Aucune carte trouvée.</td></tr>
                                ) : filtered.map(card => (
                                    <tr key={card.card_id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '20px 24px' }}>
                                            <div style={{ fontWeight: '600', color: 'var(--text-900)' }}>{card.card_name}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-500)' }}>{card.city}, {card.country}</div>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <code style={{ background: 'var(--bg)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>{card.card_id}</code>
                                        </td>
                                        <td style={{ padding: '20px 24px' }}>
                                            <span style={{ 
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                                                background: card.status === 'active' ? '#DFF6E6' : '#FEF3C7',
                                                color: card.status === 'active' ? '#166534' : '#92400E'
                                            }}>
                                                {card.status === 'active' ? 'Active' : 'En attente'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                            <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate(`/admin/card/${card.card_id}`)}>
                                                Gérer →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Folder Manager Modal (Simulated) */}
            {showFolderManager && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="premium-card animate-fade-in" style={{ width: '400px' }}>
                        <h2 style={{ marginBottom: '24px' }}>Nouveau Dossier</h2>
                        <div className="field">
                            <label>Nom du dossier</label>
                            <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Ex: Clients VIP" />
                        </div>
                        <div className="field">
                            <label>Couleur</label>
                            <input type="color" value={newFolderColor} onChange={e => setNewFolderColor(e.target.value)} />
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

function StatCard({ label, value, icon, color }) {
    return (
        <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${color}15`, color: color, fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '14px', color: 'var(--text-500)', fontWeight: '500' }}>{label}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-900)' }}>{value}</div>
            </div>
        </div>
    );
}