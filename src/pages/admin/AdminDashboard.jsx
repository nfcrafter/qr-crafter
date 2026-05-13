// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Modal from '../../components/Modal.jsx';

const getTintedLogo = async (color) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/logo.png";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            ctx.globalCompositeOperation = "source-in";
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL());
        };
        img.onerror = () => resolve("/logo.png");
    });
};

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
    const [view, setView] = useState('dashboard'); // 'dashboard' or 'users' or 'finance' or 'production'
    const [users, setUsers] = useState([]);
    const [bulkQty, setBulkQty] = useState(20);
    const [batchName, setBatchName] = useState('Production_NFC');
    const [bulkColor, setBulkColor] = useState('#1A1265');
    const [bulkBgColor, setBulkBgColor] = useState('#FFFFFF');
    const [includeLogo, setIncludeLogo] = useState(true);
    const [generatingBulk, setGeneratingBulk] = useState(false);
    const [hideIdsInPrint, setHideIdsInPrint] = useState(false);
    const [selectedCards, setSelectedCards] = useState([]);
    
    const [financeTransactions, setFinanceTransactions] = useState([]);
    
    // Form states
    const [transactionType, setTransactionType] = useState('income');
    const [incomeCategory, setIncomeCategory] = useState('digital');
    const [incomeQty, setIncomeQty] = useState(1);
    const [incomeAmount, setIncomeAmount] = useState('');
    const [expenseDesc, setExpenseDesc] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

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
        
        // Load finance data from local storage
        const savedTrans = localStorage.getItem('nfcrafter_transactions');
        if (savedTrans) {
            try { setFinanceTransactions(JSON.parse(savedTrans)); } catch (e) {}
        }
    }, [filterFolder, view]);

    const handleAddTransaction = () => {
        let newTx = { id: Date.now(), date: new Date().toISOString() };
        
        if (transactionType === 'income') {
            if (incomeCategory === 'digital') {
                newTx = { ...newTx, type: 'income', category: 'Pack Digital', amount: incomeQty * 5000, desc: `${incomeQty}x Pack Digital` };
            } else if (incomeCategory === 'physical') {
                newTx = { ...newTx, type: 'income', category: 'Pack Physique', amount: incomeQty * 10000, desc: `${incomeQty}x Pack Physique` };
            } else {
                if (!incomeAmount) return toast("Veuillez entrer un montant", "error");
                newTx = { ...newTx, type: 'income', category: 'Autre', amount: Number(incomeAmount), desc: 'Autre revenu' };
            }
        } else {
            if (!expenseDesc || !expenseAmount) return toast("Veuillez remplir la description et le montant", "error");
            newTx = { ...newTx, type: 'expense', category: 'Dépense', amount: Number(expenseAmount), desc: expenseDesc };
        }

        const updated = [newTx, ...financeTransactions];
        setFinanceTransactions(updated);
        localStorage.setItem('nfcrafter_transactions', JSON.stringify(updated));
        toast('Ajouté avec succès', 'success');

        setIncomeQty(1); setIncomeAmount(''); setExpenseDesc(''); setExpenseAmount('');
    };

    const handleDeleteTransaction = (id) => {
        const updated = financeTransactions.filter(t => t.id !== id);
        setFinanceTransactions(updated);
        localStorage.setItem('nfcrafter_transactions', JSON.stringify(updated));
    };

    const totalIncome = financeTransactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = financeTransactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netProfit = totalIncome - totalExpense;

    async function loadData() {
        setLoading(true);
        try {
            // Load Cards
            let cardsQuery = supabase.from('cards').select('*').order('created_at', { ascending: false });
            if (filterFolder) cardsQuery = cardsQuery.eq('folder_id', filterFolder);
            const { data: cardsData } = await cardsQuery;

            // Load Digital QRs (The "missing" ones)
            let qrsQuery = supabase.from('qr_codes').select('*').order('created_at', { ascending: false });
            // Since qr_codes might not have folder_id in older versions, we check
            if (filterFolder) qrsQuery = qrsQuery.eq('folder_id', filterFolder);
            const { data: qrsData } = await qrsQuery;

            // Merge them with a type tag
            const merged = [
                ...(cardsData || []).map(c => ({ ...c, _type: 'physical' })),
                ...(qrsData || []).map(q => ({ ...q, _type: 'digital', card_id: q.id, card_name: q.name }))
            ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setCards(merged);

            // Load scans
            const { data: scansData } = await supabase.from('scan_logs').select('card_id');
            const counts = {};
            scansData?.forEach(s => { counts[s.card_id] = (counts[s.card_id] || 0) + 1; });
            setScans(counts);
        } catch (e) {
            console.error(e);
            toast('Erreur de chargement', 'error');
        } finally {
            setLoading(false);
        }
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

    async function handleMarkBatchStatus(batchCards, newStatus) {
        setLoading(true);
        try {
            for (const card of batchCards) {
                await supabase.from('cards')
                    .update({ admin_profile: { ...(card.admin_profile || {}), print_status: newStatus } })
                    .eq('card_id', card.card_id);
            }
            toast(`Lot marqué comme ${newStatus === 'printed' ? 'imprimé' : 'en attente'}`, 'success');
            loadData();
        } catch (err) {
            console.error(err);
            toast("Erreur lors de la mise à jour", "error");
        } finally {
            setLoading(false);
        }
    }

    async function handleBulkCreate() {
        if (!bulkQty || bulkQty < 1 || bulkQty > 100) return toast("Quantité invalide (1-100)", "error");
        setGeneratingBulk(true);
        try {
            const newCards = [];
            for (let i = 0; i < bulkQty; i++) {
                const cardId = Math.random().toString(36).substring(2, 10).toUpperCase();
                const token = Math.random().toString(36).substring(2, 15);
                newCards.push({
                    card_id: cardId,
                    activation_token: token,
                    status: 'pending',
                    card_name: `Signature_${batchName || 'Sans_Nom'}_${i + 1}`,
                    admin_profile: {
                        qr_type: 'profile',
                        primaryColor: bulkColor,
                        backgroundColor: bulkBgColor,
                        print_status: 'pending'
                    }
                });
            }
            const { error } = await supabase.from('cards').insert(newCards);
            if (error) throw error;
            toast(`${bulkQty} cartes générées avec succès`, 'success');
            loadData();
        } catch (err) {
            console.error(err);
            toast("Erreur lors de la génération : " + err.message, "error");
        } finally {
            setGeneratingBulk(false);
        }
    }

    const handleDownloadAll = async (targetIds = null) => {
        const unactivated = cards.filter(c => !c.owner_id);
        const toDownload = targetIds 
            ? unactivated.filter(c => targetIds.includes(c.card_id))
            : unactivated;

        if (toDownload.length === 0) return toast("Aucune carte à télécharger", "info");
        
        toast(`Génération du ZIP pour ${toDownload.length} cartes...`, 'info');
        const zip = new JSZip();
        const folder = zip.folder(batchName);

        for (const card of toDownload) {
            const activationUrl = `${window.location.origin}/activate?card=${card.card_id}&token=${card.activation_token}`;
            const qrColor = card.admin_profile?.primaryColor || "#1A1265";
            
            const tintedLogo = includeLogo ? await getTintedLogo(qrColor) : null;

            const qrCode = new QRCodeStyling({
                width: 1000, height: 1000, data: activationUrl,
                margin: 5,
                dotsOptions: { color: qrColor, type: "rounded" },
                cornersSquareOptions: { color: qrColor, type: "extra-rounded" },
                cornersDotOptions: { color: qrColor, type: "dot" },
                backgroundOptions: { color: card.admin_profile?.backgroundColor || "#FFFFFF" },
                image: tintedLogo,
                imageOptions: {
                    crossOrigin: "anonymous",
                    margin: 0,
                    imageSize: 0.18,
                    hideBackgroundDots: true
                }
            });
            
            const blob = await qrCode.getRawData("png");
            folder.file(`QR-${card.card_id}.png`, blob);
        }
        
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${batchName.replace(/\s+/g, '_')}.zip`);
        toast("Téléchargement du ZIP lancé !", "success");
        setSelectedCards([]);
    };

    const handleBulkDelete = async () => {
        if (selectedCards.length === 0) return;
        
        setModalConfig({
            isOpen: true,
            title: 'Action irréversible',
            type: 'warning',
            confirmText: 'Supprimer tout',
            children: (
                <div>
                    <p>Supprimer définitivement les <strong style={{ color: '#1A1265' }}>{selectedCards.length} éléments</strong> sélectionnés ?</p>
                    <p style={{ marginTop: '10px', fontSize: '13px', color: '#64748B' }}>Cette action effacera les données des tables physiques et digitales.</p>
                </div>
            ),
            onConfirm: async () => {
                setLoading(true);
                setModalConfig(prev => ({ ...prev, isOpen: false }));
                try {
                    const physicalIds = cards.filter(c => c._type === 'physical' && selectedCards.includes(c.card_id)).map(c => c.card_id);
                    const digitalIds = cards.filter(c => c._type === 'digital' && selectedCards.includes(c.card_id)).map(c => c.card_id);

                    if (physicalIds.length > 0) await supabase.from('cards').delete().in('card_id', physicalIds);
                    if (digitalIds.length > 0) await supabase.from('qr_codes').delete().in('id', digitalIds);

                    toast(`${selectedCards.length} éléments supprimés`, 'success');
                    setSelectedCards([]);
                    loadData();
                } catch (err) {
                    toast("Erreur lors de la suppression", "error");
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const toggleSelectAll = () => {
        const unactivatedIds = cards.filter(c => !c.owner_id).map(c => c.card_id);
        if (selectedCards.length === unactivatedIds.length) {
            setSelectedCards([]);
        } else {
            setSelectedCards(unactivatedIds);
        }
    };

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
        const matchesStatus = statusFilter === 'all' || (c._type === 'digital' ? true : c.status === statusFilter);
        const qrType = c.admin_profile?.qr_type || c.type || 'url';
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
                    <button onClick={() => navigate('/')} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: 'transparent', color: '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` }} /> Accueil
                    </button>
                    <button onClick={() => { setView('dashboard'); setFilterFolder(''); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'dashboard' && !filterFolder ? '#1A1265' : 'transparent', color: view === 'dashboard' && !filterFolder ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>` }} /> Dashboard
                    </button>
                    <button onClick={() => { setView('finance'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'finance' ? '#1A1265' : 'transparent', color: view === 'finance' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` }} /> Finance & CA
                    </button>
                    <button onClick={() => { setView('users'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'users' ? '#1A1265' : 'transparent', color: view === 'users' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>` }} /> Utilisateurs
                    </button>
                    <button onClick={() => { setView('requests'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'requests' ? '#1A1265' : 'transparent', color: view === 'requests' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.5 1.5"></path><path d="M7.67 7.67L2 2"></path><path d="M2 2l1.5 7.5"></path></svg>` }} /> Demandes {requestsCount > 0 && <span style={{ background: '#EF4444', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', marginLeft: 'auto' }}>{requestsCount}</span>}
                    </button>
                    <button onClick={() => { setView('production'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'production' ? '#1A1265' : 'transparent', color: view === 'production' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>` }} /> Production
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
                                    <button onClick={(e) => openDeleteFolderModal(f.id, f.name, e)} style={{ padding: '8px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'flex' }} className="trash-btn"><div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>` }} /></button>
                                </div>
                                {isExpanded && subFolders.map(sub => (
                                    <div key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '32px' }}>
                                    <button onClick={() => { setView('dashboard'); setFilterFolder(sub.id); setIsSidebarOpen(false); }} style={{ flex: 1, padding: '8px 12px', borderRadius: '10px', border: 'none', background: filterFolder === sub.id ? '#F1F5F9' : 'transparent', color: filterFolder === sub.id ? '#1A1265' : '#475569', fontWeight: '600', textAlign: 'left', cursor: 'pointer', fontSize: '13px' }}>↳ {sub.name}</button>
                                        <button onClick={(e) => openDeleteFolderModal(sub.id, sub.name, e)} style={{ padding: '6px', border: 'none', background: 'transparent', cursor: 'pointer', color: '#CBD5E1', display: 'flex' }} className="trash-btn-sub"><div style={{ width: 12, height: 12 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>` }} /></button>
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
                                <div style={{ width: 24, height: 24 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>` }} />
                            </button>
                            <div>
                                <h1 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265' }}>
                                    {view === 'users' ? 'Gestion des Utilisateurs' : (view === 'requests' ? 'Demandes de Design' : (view === 'finance' ? 'Finance & CA' : (view === 'production' ? 'Atelier Production' : (filterFolder ? currentFolder?.name : 'Tableau de bord'))))}
                                </h1>
                                <p style={{ color: '#64748B' }} className="desktop-only">
                                    {view === 'users' ? 'Gérez les comptes et les profils de vos clients.' : (view === 'requests' ? 'Clients souhaitant modifier le design de leur QR.' : (view === 'finance' ? 'Suivez votre chiffre d\'affaires et vos bénéfices.' : (view === 'production' ? 'Générez des cartes en masse et préparez les supports physiques.' : (filterFolder ? (isSubFolder ? 'Contenu de ce sous-dossier' : 'Contenu de ce dossier') : 'Gérez l\'ensemble de vos projets QR.'))))}
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {view === 'dashboard' && filterFolder && !isSubFolder && (<button onClick={() => openCreateFolderModal(true)} style={{ padding: '14px 24px', borderRadius: '14px', background: 'white', color: '#6366F1', border: '1px solid #6366F1', fontWeight: '700', cursor: 'pointer' }} className="desktop-only">+ Sous-dossier</button>)}
                            {view === 'dashboard' && (
                                <button onClick={() => navigate('/admin/create')} className="btn-primary" style={{ padding: '14px 20px', borderRadius: '14px', fontSize: '14px' }}>+ Nouveau QR</button>
                            )}
                        </div>
                    </header>
                    {(view === 'dashboard' || view === 'requests') && (
                        <div style={{ background: 'white', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }} className="admin-filters">
                            <div style={{ position: 'relative', flex: 1 }}><span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, display: 'flex' }}><div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` }} /></span><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} /></div>
                            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }} className="desktop-only"><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }} className="desktop-only"><option value="all">Type</option><option value="url">URL</option><option value="wifi">WiFi</option><option value="vcard">VCard</option></select>
                        </div>
                    )}
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px 60px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1400px', margin: '0 auto' }}>
                        {loading && view !== 'finance' ? (
                            <div style={{ textAlign: 'center', padding: '100px' }}>Chargement...</div>
                        ) : view === 'finance' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* KPI Cards */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                    <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>CA Total</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#1A1265' }}>
                                            {totalIncome.toLocaleString('fr-FR')} <small style={{fontSize: '16px', color: '#94A3B8'}}>f CFA</small>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Dépenses</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#EF4444' }}>
                                            {totalExpense.toLocaleString('fr-FR')} <small style={{fontSize: '16px', color: '#FCA5A5'}}>f CFA</small>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px', background: '#1A1265', borderRadius: '20px', color: 'white', boxShadow: '0 10px 25px rgba(26,18,101,0.2)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bénéfice Net</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#10B981' }}>
                                            {netProfit.toLocaleString('fr-FR')} <small style={{fontSize: '16px', color: '#6EE7B7'}}>f CFA</small>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    {/* Action Form */}
                                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>Ajouter une opération</h3>
                                        
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                                            <button onClick={() => setTransactionType('income')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '700', border: transactionType === 'income' ? '2px solid #10B981' : '1px solid #E2E8F0', background: transactionType === 'income' ? '#ECFDF5' : 'white', color: transactionType === 'income' ? '#059669' : '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>📈 Vente (Revenu)</button>
                                            <button onClick={() => setTransactionType('expense')} style={{ flex: 1, padding: '12px', borderRadius: '12px', fontWeight: '700', border: transactionType === 'expense' ? '2px solid #EF4444' : '1px solid #E2E8F0', background: transactionType === 'expense' ? '#FEF2F2' : 'white', color: transactionType === 'expense' ? '#DC2626' : '#64748B', cursor: 'pointer', transition: 'all 0.2s' }}>📉 Dépense</button>
                                        </div>

                                        {transactionType === 'income' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Que venez-vous de vendre ?</label>
                                                    <select value={incomeCategory} onChange={e => setIncomeCategory(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', fontWeight: '600', outline: 'none' }}>
                                                        <option value="digital">Pack Digital (5.000f)</option>
                                                        <option value="physical">Pack Physique (10.000f)</option>
                                                        <option value="other">Autre revenu</option>
                                                    </select>
                                                </div>
                                                
                                                {incomeCategory !== 'other' ? (
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Combien de packs vendus ?</label>
                                                        <input type="number" min="1" value={incomeQty} onChange={e => setIncomeQty(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '16px', fontWeight: '600', outline: 'none' }} />
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Montant total (f CFA)</label>
                                                        <input type="number" min="0" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} placeholder="Ex: 15000" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '16px', fontWeight: '600', outline: 'none' }} />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {transactionType === 'expense' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Détails de la dépense</label>
                                                    <input type="text" value={expenseDesc} onChange={e => setExpenseDesc(e.target.value)} placeholder="Ex: Cartes vierges, Imprimeur, Pub FB..." style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', fontWeight: '600', outline: 'none' }} />
                                                </div>
                                                <div>
                                                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>Combien avez-vous payé ? (f CFA)</label>
                                                    <input type="number" min="0" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} placeholder="Ex: 25000" style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '16px', fontWeight: '600', outline: 'none' }} />
                                                </div>
                                            </div>
                                        )}

                                        <button onClick={handleAddTransaction} style={{ width: '100%', marginTop: '24px', background: '#1A1265', color: 'white', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(26,18,101,0.2)' }}>
                                            Valider l'opération
                                        </button>
                                    </div>

                                    {/* History List */}
                                    <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '32px', display: 'flex', flexDirection: 'column' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>Historique des opérations</h3>
                                        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {financeTransactions.length === 0 ? (
                                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#94A3B8', fontSize: '14px', fontWeight: '600' }}>Aucune opération enregistrée</div>
                                            ) : (
                                                financeTransactions.map(t => (
                                                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: t.type === 'income' ? '#DCFCE7' : '#FEE2E2', color: t.type === 'income' ? '#15803D' : '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, flexShrink: 0 }}>
                                                                <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: t.type === 'income' ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>` }} />
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '800', fontSize: '14px', color: '#1A1265' }}>{t.desc}</div>
                                                                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{new Date(t.date).toLocaleDateString('fr-FR')} à {new Date(t.date).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</div>
                                                            </div>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                            <div style={{ fontWeight: '900', fontSize: '15px', color: t.type === 'income' ? '#10B981' : '#EF4444' }}>
                                                                {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('fr-FR')} f
                                                            </div>
                                                            <button onClick={() => handleDeleteTransaction(t.id)} style={{ border: 'none', background: 'transparent', color: '#CBD5E1', cursor: 'pointer', display: 'flex' }} className="trash-btn" title="Supprimer l'opération"><div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>` }} /></button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : view === 'production' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                                <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', marginBottom: '8px' }}>Génération en masse (Cartes Signature)</h3>
                                    <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '24px' }}>Créez plusieurs cartes vierges avec leurs jetons d'activation en un clic.</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', display: 'block' }}>QUANTITÉ</label>
                                                <input 
                                                    type="number" 
                                                    min="1" 
                                                    max="100" 
                                                    value={bulkQty} 
                                                    onChange={e => setBulkQty(Number(e.target.value))} 
                                                    placeholder="20" 
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '16px', fontWeight: '600' }} 
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px', display: 'block' }}>NOM DU LOT / DOSSIER</label>
                                                <input 
                                                    type="text" 
                                                    value={batchName} 
                                                    onChange={e => setBatchName(e.target.value)} 
                                                    placeholder="Ex: Batch_NFC_Client_Alpha" 
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '16px', fontWeight: '600' }} 
                                                />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>COULEUR POINTS</label>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#F8FAFC', padding: '8px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                    <input 
                                                        type="color" 
                                                        value={bulkColor} 
                                                        onChange={e => setBulkColor(e.target.value)} 
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }} 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={bulkColor} 
                                                        onChange={e => setBulkColor(e.target.value)} 
                                                        placeholder="#HEX"
                                                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '700', color: '#1A1265', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>

                                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748B' }}>COULEUR FOND</label>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#F8FAFC', padding: '8px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                                    <input 
                                                        type="color" 
                                                        value={bulkBgColor} 
                                                        onChange={e => setBulkBgColor(e.target.value)} 
                                                        style={{ width: '32px', height: '32px', border: 'none', background: 'transparent', cursor: 'pointer' }} 
                                                    />
                                                    <input 
                                                        type="text" 
                                                        value={bulkBgColor} 
                                                        onChange={e => setBulkBgColor(e.target.value)} 
                                                        placeholder="#HEX"
                                                        style={{ flex: 1, border: 'none', background: 'transparent', fontSize: '14px', fontWeight: '700', color: '#1A1265', outline: 'none' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {['#1A1265', '#10B981', '#6366F1', '#F59E0B', '#EF4444', '#000000'].map(c => (
                                                <button key={c} onClick={() => setBulkColor(c)} style={{ width: '24px', height: '24px', borderRadius: '6px', background: c, border: bulkColor === c ? '2px solid #1A1265' : 'none', cursor: 'pointer', outline: bulkColor === c ? '2px solid white' : 'none' }} />
                                            ))}
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div 
                                                onClick={() => setIncludeLogo(!includeLogo)}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1A1265' }}>Inclure Logo</span>
                                                <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: includeLogo ? '#1A1265' : '#CBD5E1', position: 'relative', transition: 'all 0.3s' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: includeLogo ? '21px' : '3px', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                                </div>
                                            </div>

                                            <div 
                                                onClick={() => setHideIdsInPrint(!hideIdsInPrint)}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F8FAFC', padding: '12px 16px', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', transition: 'all 0.2s' }}
                                            >
                                                <span style={{ fontSize: '13px', fontWeight: '800', color: '#1A1265' }}>Mode UV (Masquer IDs)</span>
                                                <div style={{ width: '40px', height: '22px', borderRadius: '11px', background: hideIdsInPrint ? '#EF4444' : '#CBD5E1', position: 'relative', transition: 'all 0.3s' }}>
                                                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'white', position: 'absolute', top: '3px', left: hideIdsInPrint ? '21px' : '3px', transition: 'all 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                                                </div>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                            <button 
                                                onClick={handleBulkCreate} 
                                                disabled={generatingBulk}
                                                style={{ flex: 1, padding: '14px 28px', background: '#1A1265', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: generatingBulk ? 0.7 : 1 }}
                                            >
                                                {generatingBulk ? 'Génération...' : '+ Générer les cartes'}
                                            </button>
                                            <button 
                                                onClick={() => window.print()}
                                                style={{ padding: '14px 24px', background: 'white', color: '#1A1265', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>` }} /> Impression
                                            </button>
                                            <button 
                                                onClick={handleDownloadAll}
                                                style={{ padding: '14px 24px', background: '#F8FAFC', color: '#1A1265', border: '1px solid #E2E8F0', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> Tout télécharger
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                                    {/* Section 1: Demandes de Design (Custom) */}
                                    {cards.filter(c => c.design_request === 'pending').length > 0 && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }}></div>
                                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265' }}>Commandes Personnalisées ({cards.filter(c => c.design_request === 'pending').length})</h3>
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                                {cards.filter(c => c.design_request === 'pending').map(card => (
                                                    <ProductionCard 
                                                        key={card.card_id} 
                                                        card={card} 
                                                        toast={toast} 
                                                        includeLogo={includeLogo}
                                                        isSelected={selectedCards.includes(card.card_id)}
                                                        onSelect={() => setSelectedCards(prev => prev.includes(card.card_id) ? prev.filter(id => id !== card.card_id) : [...prev, card.card_id])}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Section 2: Dossiers de Lots (Grouped) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10B981' }}></div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265' }}>Lots de Production</h3>
                                        </div>
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                                            {(() => {
                                                const batchMap = {};
                                                cards.filter(c => !c.owner_id && c.design_request !== 'pending' && c.card_name?.startsWith('Signature_')).forEach(card => {
                                                    const parts = card.card_name.split('_');
                                                    const name = parts.length >= 3 ? parts.slice(1, -1).join('_') : 'Lot_Sans_Nom';
                                                    if (!batchMap[name]) batchMap[name] = { name, cards: [], status: 'pending' };
                                                    batchMap[name].cards.push(card);
                                                    if (card.admin_profile?.print_status === 'printed') batchMap[name].status = 'printed';
                                                });
                                                
                                                return Object.values(batchMap).sort((a,b) => b.cards[0].created_at.localeCompare(a.cards[0].created_at)).map(batch => (
                                                    <div key={batch.name} style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: batch.status === 'printed' ? '#10B981' : '#F59E0B' }}></div>
                                                        
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                            <div>
                                                                <div style={{ fontSize: '11px', fontWeight: '900', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '4px' }}>DOSSIER LOT</div>
                                                                <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', margin: 0 }}>{batch.name}</h4>
                                                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: '600' }}>{batch.cards.length} cartes physiques</div>
                                                            </div>
                                                            <div style={{ background: batch.status === 'printed' ? '#DCFCE7' : '#FEF3C7', color: batch.status === 'printed' ? '#15803D' : '#92400E', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '900' }}>
                                                                {batch.status === 'printed' ? 'IMPRIMÉ' : 'EN ATTENTE'}
                                                            </div>
                                                        </div>

                                                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                                            <button 
                                                                onClick={() => handleDownloadAll(batch.cards.map(c => c.card_id))}
                                                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: '#1A1265', color: 'white', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                            >
                                                                <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> ZIP
                                                            </button>
                                                            <button 
                                                                onClick={() => handleMarkBatchStatus(batch.cards, batch.status === 'printed' ? 'pending' : 'printed')}
                                                                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                                            >
                                                                <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>` }} /> {batch.status === 'printed' ? 'Réinitialiser' : 'Imprimé'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    </div>

                                    {/* Section 3: Vue Détail (Unactivated cards not in batches or individual) */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#64748B' }}></div>
                                            <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265' }}>Toutes les cartes (Détails)</h3>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                            {cards.filter(c => !c.owner_id && c.design_request !== 'pending').map(card => (
                                                <ProductionCard 
                                                    key={card.card_id} 
                                                    card={card} 
                                                    toast={toast} 
                                                    includeLogo={includeLogo}
                                                    isSelected={selectedCards.includes(card.card_id)}
                                                    onSelect={() => setSelectedCards(prev => prev.includes(card.card_id) ? prev.filter(id => id !== card.card_id) : [...prev, card.card_id])}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : view === 'users' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {users.map(user => (
                                    <div key={user.id} className="user-list-item" style={{ background: 'white', borderRadius: '20px', padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #F1F5F9', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                                        <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: user.photo_url ? 0 : 12 }}>
                                            {user.photo_url ? <img src={user.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} /> : <div style={{ width: '100%', height: '100%', color: '#94A3B8' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` }} />}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '900', fontSize: '16px', color: '#1A1265' }}>{user.full_name || 'Utilisateur sans nom'}</div>
                                            <div style={{ color: '#94A3B8', fontSize: '12px' }}>{user.email}</div>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setModalConfig({
                                                    isOpen: true, title: 'Supprimer utilisateur', type: 'danger',
                                                    children: <p>Voulez-vous vraiment supprimer cet utilisateur ?</p>,
                                                    onConfirm: () => { handleDeleteUser(user.id); setModalConfig(p => ({...p, isOpen: false})); },
                                                    confirmText: 'Supprimer'
                                                })
                                            }}
                                            disabled={user.email === 'nfcrafter@gmail.com'}
                                            style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', padding: '10px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', display: 'flex' }}
                                        >
                                            <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>` }} />
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                                    {view === 'requests' ? 'Aucune demande de design en attente' : 'Aucun QR trouvé'}
                                </div>
                            )
                        )}

                        {/* Pagination Section */}
                        {totalPages > 1 && view === 'dashboard' && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px', paddingBottom: '40px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>Afficher</span>
                                    <select 
                                        value={quantity} 
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', color: '#1A1265', cursor: 'pointer' }}
                                    >
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>sur {filtered.length}</span>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => prev - 1)}
                                        style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: '800', cursor: currentPage === 1 ? 'default' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, transition: 'all 0.2s' }}
                                    >
                                        Précédent
                                    </button>
                                    <div style={{ display: 'flex', gap: '6px' }}>
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button 
                                                key={i}
                                                onClick={() => setCurrentPage(i + 1)}
                                                style={{ width: '40px', height: '40px', borderRadius: '12px', border: 'none', background: currentPage === i + 1 ? '#1A1265' : 'white', color: currentPage === i + 1 ? 'white' : '#64748B', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', border: currentPage === i + 1 ? 'none' : '1px solid #E2E8F0' }}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                    <button 
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(prev => prev + 1)}
                                        style={{ padding: '10px 18px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: '800', cursor: currentPage === totalPages ? 'default' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, transition: 'all 0.2s' }}
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
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

                @media print {
                    @page { margin: 1cm; size: auto; }
                    body { background: white !important; }
                    .no-print, header, aside, main, .admin-filters, .mobile-header, .mobile-preview-btn { display: none !important; }
                    .print-section { 
                        display: grid !important; 
                        grid-template-columns: repeat(4, 1fr) !important; 
                        gap: 15px !important; 
                        visibility: visible !important;
                        position: static !important;
                        width: 100% !important;
                    }
                    .print-section * { visibility: visible !important; }
                    .print-card { 
                        border: 1px solid #EEE !important; 
                        padding: 10px !important; 
                        break-inside: avoid !important;
                    }
                }
            `}</style>
            
            {/* Floating Selection Bar */}
            {selectedCards.length > 0 && view === 'production' && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', background: '#1A1265', padding: '12px 24px', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', zIndex: 1000, border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div onClick={toggleSelectAll} style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid white', background: selectedCards.length === cards.filter(c => !c.owner_id).length ? 'white' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {selectedCards.length === cards.filter(c => !c.owner_id).length && <div style={{ width: '10px', height: '10px', background: '#1A1265', borderRadius: '2px' }}></div>}
                        </div>
                        <span style={{ color: 'white', fontWeight: '800', fontSize: '14px' }}>{selectedCards.length} sélectionnés</span>
                    </div>
                    
                    <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)' }}></div>
                    
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => handleDownloadAll(selectedCards)} style={{ background: 'white', color: '#1A1265', border: 'none', padding: '8px 16px', borderRadius: '50px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> ZIP
                        </button>
                        <button onClick={handleBulkDelete} style={{ background: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '50px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>` }} /> Supprimer
                        </button>
                        <button onClick={() => setSelectedCards([])} style={{ background: 'transparent', color: 'rgba(255,255,255,0.6)', border: 'none', padding: '8px 8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer' }}>Annuler</button>
                    </div>
                </div>
            )}
            
            {/* Print Section (Visible only during print) */}
            <div className="print-section" style={{ display: 'none' }}>
                {cards.filter(c => !c.owner_id).map(card => (
                    <ProductionCard key={card.card_id} card={card} toast={toast} isPrintMode={true} hideId={hideIdsInPrint} includeLogo={includeLogo} />
                ))}
            </div>
        </div>
    );
}

function ProductionCard({ card, toast, isPrintMode = false, hideId = false, includeLogo = true, isSelected = false, onSelect = null }) {
    const qrRef = useRef(null);
    const activationUrl = `${window.location.origin}/activate?card=${card.card_id}&token=${card.activation_token}`;

    useEffect(() => {
        const updateQR = async () => {
            if (qrRef.current) {
                const qrColor = card.admin_profile?.primaryColor || "#1A1265";
                const tintedLogo = includeLogo ? await getTintedLogo(qrColor) : null;
                
                const qrCode = new QRCodeStyling({
                    width: isPrintMode ? 200 : 160, 
                    height: isPrintMode ? 200 : 160, 
                    data: activationUrl,
                    margin: 5,
                    dotsOptions: { color: qrColor, type: "rounded" },
                    cornersSquareOptions: { color: qrColor, type: "extra-rounded" },
                    cornersDotOptions: { color: qrColor, type: "dot" },
                    backgroundOptions: { color: isPrintMode ? "transparent" : (card.admin_profile?.backgroundColor || "#FFFFFF") },
                    image: tintedLogo,
                    imageOptions: {
                        crossOrigin: "anonymous",
                        margin: 0,
                        imageSize: 0.18,
                        hideBackgroundDots: true
                    }
                });
                qrRef.current.innerHTML = ''; qrCode.append(qrRef.current);
                qrRef.current.style.borderRadius = "16px";
                qrRef.current.style.overflow = "hidden";
                qrRef.current.style.display = "inline-block";
                if (!isPrintMode) qrRef.current.style.background = card.admin_profile?.backgroundColor || "white";
            }
        };
        updateQR();
    }, [card, isPrintMode, includeLogo]);

    const downloadQR = async () => {
        const qrColor = card.admin_profile?.primaryColor || "#1A1265";
        const tintedLogo = includeLogo ? await getTintedLogo(qrColor) : null;
        
        const qrCode = new QRCodeStyling({
            width: 1000, height: 1000, data: activationUrl,
            margin: 5,
            dotsOptions: { color: qrColor, type: "rounded" },
            cornersSquareOptions: { color: qrColor, type: "extra-rounded" },
            cornersDotOptions: { color: qrColor, type: "dot" },
            backgroundOptions: { color: card.admin_profile?.backgroundColor || "#FFFFFF" },
            image: tintedLogo,
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 0,
                imageSize: 0.18,
                hideBackgroundDots: true
            }
        });
        qrCode.download({ name: `QR-${card.card_id}`, extension: "png" });
    };

    return (
        <div className={isPrintMode ? "print-card" : ""} style={{ position: 'relative', background: 'white', borderRadius: isPrintMode ? '0' : '24px', padding: isPrintMode ? '20px' : '24px', border: isPrintMode ? 'none' : isSelected ? '2px solid #1A1265' : '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', breakInside: 'avoid', transition: 'all 0.2s', transform: isSelected ? 'scale(1.02)' : 'none', boxShadow: isSelected ? '0 12px 30px rgba(26,18,101,0.1)' : 'none' }}>
            
            {!isPrintMode && (
                <div 
                    onClick={onSelect}
                    style={{ position: 'absolute', top: '16px', left: '16px', width: '24px', height: '24px', borderRadius: '8px', border: '2px solid #E2E8F0', background: isSelected ? '#1A1265' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}
                >
                    {isSelected && <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '2px' }}></div>}
                </div>
            )}

            {(!hideId || !isPrintMode) && (
                <div style={{ fontWeight: '1000', color: '#1A1265', fontSize: isPrintMode ? '18px' : '14px', marginBottom: isPrintMode ? '12px' : '16px', fontFamily: 'monospace' }}>{card.card_id}</div>
            )}
            
            <div ref={qrRef} style={{ padding: '0', borderRadius: '16px', marginBottom: isPrintMode ? '0' : '16px', border: 'none', overflow: 'hidden', boxShadow: isPrintMode ? 'none' : '0 8px 20px rgba(0,0,0,0.1)' }}></div>
            
            {!isPrintMode && (
                <div style={{ width: '100%', display: 'flex', gap: '8px' }}>
                    <button 
                        onClick={() => { navigator.clipboard.writeText(activationUrl); toast('Lien copié !', 'success'); }} 
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>` }} /> Copier
                    </button>
                    <button 
                        onClick={downloadQR} 
                        style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: '#F1F5F9', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> QR
                    </button>
                </div>
            )}
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
                <div className="badge-pending" style={{ position: 'absolute', top: '-10px', left: '20px', background: '#6366F1', color: 'white', fontSize: '10px', fontWeight: '900', padding: '4px 12px', borderRadius: '20px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 10, height: 10 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r=".5"></circle><circle cx="17.5" cy="10.5" r=".5"></circle><circle cx="8.5" cy="7.5" r=".5"></circle><circle cx="6.5" cy="12.5" r=".5"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.5 2-1.2.3.7 1 1.2 1.9 1.2h.1c1.1 0 2-.9 2-2 0-.4-.1-.8-.3-1.2.7.4 1.5.7 2.3.7 1.1 0 2-.9 2-2 0-5.5-4.5-10-10-10z"></path></svg>` }} /> DEMANDE DE DESIGN
                </div>
            )}
            
            <div className="card-info-group" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div ref={qrRef} style={{ width: '76px', height: '76px', background: '#F8FAFC', borderRadius: '14px', border: '1px solid #F1F5F9', overflow: 'hidden', flexShrink: 0 }}></div>
                    <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '700', letterSpacing: '0.5px' }}>ID: {card.card_id}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: card._type === 'digital' ? '#10B981' : '#6366F1', background: card._type === 'digital' ? '#ECFDF5' : '#EEF2FF', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                            {card._type === 'digital' ? 'Digital QR' : 'Carte Physique'}
                        </span>
                        <div style={{ color: '#6366F1', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.admin_profile?.qr_type || card.type || 'URL'}</div>
                    </div>
                    <div style={{ fontWeight: '900', fontSize: '18px', color: '#1A1265', margin: '1px 0' }}>{card.card_name || 'Sans nom'}</div>
                    <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: '500' }}>
                        Modifié le {new Date(card.updated_at || card.created_at).toLocaleDateString('fr-FR')} à {new Date(card.updated_at || card.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            <div style={{ minWidth: '100px', textAlign: 'center' }} className="desktop-only">
                <span style={{ fontSize: '10px', fontWeight: '900', padding: '4px 12px', borderRadius: '10px', background: isActive ? '#DCFCE7' : '#FEE2E2', color: isActive ? '#15803D' : '#B91C1C', textTransform: 'uppercase' }}>{isActive ? 'Active' : 'Attente'}</span>
            </div>

            <div style={{ textAlign: 'center', minWidth: '80px' }} className="desktop-only">
                <div style={{ fontSize: '20px', fontWeight: '1000', color: '#1A1265' }}>{scanCount}</div>
                <div style={{ fontSize: '9px', color: '#94A3B8', fontWeight: '900' }}>SCANS</div>
            </div>

            <div className="card-actions-group" style={{ display: 'flex', gap: '8px' }}>
                {!card.owner_id && (
                        <button 
                            onClick={() => {
                                const url = `${window.location.origin}/activate?card=${card.card_id}&token=${card.activation_token}`;
                                navigator.clipboard.writeText(url);
                                toast('Lien d\'activation copié !', 'success');
                            }} 
                            style={{ background: '#F1F5F9', color: '#475569', padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}
                            title="Copier le lien d'activation pour le client"
                        >
                            <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3L15.5 7.5z"></path></svg>` }} /> Lien
                        </button>
                )}
                {isPendingRequest ? (
                    <button onClick={onResolve} style={{ background: '#10B981', color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Fait</button>
                ) : (
                    <button onClick={() => navigate(`/admin/card/${card.card_id}`)} style={{ background: '#1A1265', color: 'white', padding: '10px 20px', borderRadius: '10px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Gérer</button>
                )}
            </div>
        </div>
    );
}