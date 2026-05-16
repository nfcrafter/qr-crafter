// src/pages/admin/AdminDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Modal from '../../components/Modal.jsx';
import { OFFICIAL_CARD_COLORS } from '../../constants/cardColors.js';
import Card3DVideo from '../../components/Card3DVideo.jsx';



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
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'physical', 'digital'
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
    const [isProductionFormOpen, setIsProductionFormOpen] = useState(true);
    const [selectedCards, setSelectedCards] = useState([]);
    const [expandedBatch, setExpandedBatch] = useState(null);
    const [studioColor, setStudioColor] = useState('#1A1265');
    const [studioLogo, setStudioLogo] = useState(null);
    const [socialQRColor, setSocialQRColor] = useState('#1A1265');
    const [socialQRBgColor, setSocialQRBgColor] = useState('#FFFFFF');
    const [socialQRData, setSocialQRData] = useState('https://nfcrafter.com');
    const [socialQRPreview, setSocialQRPreview] = useState(null);
    const [frontImage, setFrontImage] = useState(null);
    const [backImage, setBackImage] = useState(null);
    const [mockupBgColor, setMockupBgColor] = useState('#111827');
    const [socialQRHistory, setSocialQRHistory] = useState(() => JSON.parse(localStorage.getItem('socialQRHistory') || '[]'));
    const [mockupHistory, setMockupHistory] = useState(() => JSON.parse(localStorage.getItem('mockupHistory') || '[]'));
    
    // Marketing Studio States
    const [marketingPalette, setMarketingPalette] = useState('noir');
    const [marketingTemplate, setMarketingTemplate] = useState('showcase');
    const [marketingText, setMarketingText] = useState('Votre Identité Numérique Premium');
    const [marketingPreview, setMarketingPreview] = useState(null);

    // Video Studio States
    const [isRecording, setIsRecording] = useState(false);
    const [recordProgress, setRecordProgress] = useState(0);
    const videoCanvasRef = useRef(null);



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
    const [platformStats, setPlatformStats] = useState({ totalUsers: 0, activeUsers: 0 });
    const [showStats, setShowStats] = useState(() => { try { return JSON.parse(localStorage.getItem('nfcrafter_showStats') ?? 'true'); } catch { return true; } });

    async function loadPlatformStats() {
        try {
            const [profilesRes, cardsRes] = await Promise.all([
                supabase.from('profiles').select('id', { count: 'exact', head: true }),
                supabase.from('cards').select('owner_id')
            ]);
            const profileCount = profilesRes.count || 0;
            const uniqueOwners = [...new Set((cardsRes.data || []).map(c => c.owner_id).filter(Boolean))];
            const totalUsers = Math.max(profileCount, uniqueOwners.length);
            const activeUsers = uniqueOwners.length;
            setPlatformStats({ totalUsers, activeUsers });
        } catch (e) {
            console.error('Stats error:', e);
        }
    }

    useEffect(() => {
        if (view === 'dashboard') {
            loadData();
            loadFolders();
            loadPlatformStats();
        } else if (view === 'users') {
            loadUsers();
        } else if (view === 'requests') {
            loadRequests();
        } else if (view === 'logo-studio') {
            generateStudioLogo();
        } else if (view === 'social-qr') {
            generateSocialQR();
        }
        updateRequestsCount();

        // Load finance data from local storage
        const savedTrans = localStorage.getItem('nfcrafter_transactions');
        if (savedTrans) {
            try { setFinanceTransactions(JSON.parse(savedTrans)); } catch (e) { }
        }
    }, [filterFolder, view]);

    const handleAddTransaction = () => {
        let newTx = { id: Date.now(), date: new Date().toISOString() };

        if (transactionType === 'income') {
            if (incomeCategory === 'digital') {
                newTx = { ...newTx, type: 'income', category: 'Vente Carte', amount: incomeQty * 10000, desc: `${incomeQty}x Carte Signature` };
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
                ...(cardsData || []).map(c => {
                    let type = 'physical'; // Default to Signature
                    if (c.admin_profile?.creation_type === 'personalized') type = 'digital';
                    else if (c.admin_profile?.creation_type === 'signature') type = 'physical';
                    else if (c.card_name && !c.card_name.startsWith('Signature_') && c.status === 'active') type = 'digital';

                    return { ...c, _type: type };
                }),
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
        try {
            const [profilesRes, userCardsRes, cardsRes] = await Promise.all([
                supabase.from('profiles').select('*').order('created_at', { ascending: false }),
                supabase.from('user_cards').select('*'),
                supabase.from('cards').select('*')
            ]);
            
            if (profilesRes.error) console.error("Profiles Error:", profilesRes.error);

            const profilesData = profilesRes.data || [];
            const userCardsData = userCardsRes.data || [];
            const cardsData = cardsRes.data || [];
            
            // Map known profiles
            const mappedProfiles = profilesData.map(p => {
                const userCardsLinks = userCardsData.filter(uc => uc.user_id === p.id);
                let userCards = userCardsLinks.map(uc => cardsData.find(c => c.card_id === uc.card_id)).filter(Boolean);
                
                if (userCards.length === 0) {
                    userCards = cardsData.filter(c => c.owner_id === p.id);
                }
                
                return {
                    ...p,
                    cards: userCards
                };
            });

            // Reconstruct missing users directly from cards (if profiles table missed them during activation)
            const allOwnerIds = [...new Set(cardsData.map(c => c.owner_id).filter(Boolean))];
            const reconstructedUsers = [];

            for (const ownerId of allOwnerIds) {
                // If this owner is not in the profiles table, build a synthetic user from their cards
                if (!mappedProfiles.find(p => p.id === ownerId)) {
                    const userCards = cardsData.filter(c => c.owner_id === ownerId);
                    const firstCardProfile = userCards[0]?.admin_profile || {};
                    reconstructedUsers.push({
                        id: ownerId,
                        full_name: firstCardProfile.full_name || userCards[0]?.card_name || 'Utilisateur (Reconstruit)',
                        email: firstCardProfile.email || 'Email non disponible',
                        photo_url: firstCardProfile.photo_url || null,
                        created_at: userCards[0]?.created_at || new Date().toISOString(),
                        cards: userCards
                    });
                }
            }

            const finalUsers = [...mappedProfiles, ...reconstructedUsers].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setUsers(finalUsers);
        } catch (error) {
            console.error('Error loading users:', error);
            toast('Erreur chargement utilisateurs : ' + error.message, 'error');
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
                        print_status: 'pending',
                        creation_type: 'signature'
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

    const generateStudioLogo = async () => {
        const tinted = await getTintedLogo(studioColor);
        setStudioLogo(tinted);
    };

    useEffect(() => {
        if (view === 'logo-studio') {
            generateStudioLogo();
        }
    }, [studioColor, view]);

    const handleDownloadStudioLogo = () => {
        if (!studioLogo) return;
        saveAs(studioLogo, `logo-nfcrafter-${studioColor.replace('#', '')}.png`);
        toast('Logo téléchargé !', 'success');
    };

    const generateSocialQR = async () => {
        const tintedLogo = await getTintedLogo(socialQRColor);
        const qrCode = new QRCodeStyling({
            width: 800, height: 800, data: socialQRData,
            margin: 10,
            image: tintedLogo,
            dotsOptions: { color: socialQRColor, type: "rounded" },
            cornersSquareOptions: { color: socialQRColor, type: "extra-rounded" },
            cornersDotOptions: { color: socialQRColor, type: "dot" },
            backgroundOptions: { color: socialQRBgColor },
            imageOptions: { margin: 10, imageSize: 0.2, hideBackgroundDots: true }
        });
        const blob = await qrCode.getRawData("png");
        setSocialQRPreview(URL.createObjectURL(blob));
    };

    const saveSocialQRToHistory = () => {
        if (!socialQRPreview) return;
        const newItem = { id: Date.now(), url: socialQRPreview, color: socialQRColor, data: socialQRData, date: new Date().toISOString() };
        const newHistory = [newItem, ...socialQRHistory].slice(0, 10);
        setSocialQRHistory(newHistory);
        localStorage.setItem('socialQRHistory', JSON.stringify(newHistory));
        toast('QR Code sauvegardé dans l\'historique !', 'success');
    };

    const saveMockupToHistory = (imageUrl) => {
        const newItem = { id: Date.now(), url: imageUrl, date: new Date().toISOString() };
        const newHistory = [newItem, ...mockupHistory].slice(0, 10);
        setMockupHistory(newHistory);
        localStorage.setItem('mockupHistory', JSON.stringify(newHistory));
        toast('Mockup sauvegardé dans l\'historique !', 'success');
    };

    useEffect(() => {
        if (view === 'social-qr') generateSocialQR();
    }, [socialQRColor, socialQRBgColor, socialQRData, view]);

    const handleDownloadSocialQR = () => {
        if (!socialQRPreview) return;
        saveAs(socialQRPreview, `social-qr-${socialQRColor.replace('#', '')}.png`);
        toast('QR Code téléchargé !', 'success');
    };

    const handleImageUpload = (e, side) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (side === 'front') setFrontImage(url);
        else setBackImage(url);
    };

    const handleDownloadMockup = async () => {
        if (!frontImage && !backImage) return toast("Veuillez uploader au moins une image", "error");
        
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 1600;
        canvas.height = 1200;
        
        // Background Personnalisé
        ctx.fillStyle = mockupBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const loadImage = (src) => new Promise(res => {
            const img = new Image();
            img.onload = () => res(img);
            img.src = src;
        });

        const drawPremiumCard = (img, x, y, w, h, radius, rotation) => {
            ctx.save();
            ctx.translate(x + w/2, y + h/2);
            ctx.rotate(rotation);
            
            // Round rect path
            ctx.beginPath();
            ctx.moveTo(-w/2 + radius, -h/2);
            ctx.lineTo(w/2 - radius, -h/2);
            ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + radius);
            ctx.lineTo(w/2, h/2 - radius);
            ctx.quadraticCurveTo(w/2, h/2, w/2 - radius, h/2);
            ctx.lineTo(-w/2 + radius, h/2);
            ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - radius);
            ctx.lineTo(-w/2, -h/2 + radius);
            ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + radius, -h/2);
            ctx.closePath();

            // Shadow
            ctx.shadowColor = "rgba(0,0,0,0.5)";
            ctx.shadowBlur = 100;
            ctx.shadowOffsetY = 40;
            
            ctx.fill(); // Fill dummy for shadow
            
            ctx.clip();
            ctx.drawImage(img, -w/2, -h/2, w, h);
            ctx.restore();
        };

        try {
            // Dessiner la carte arrière (Verso) - décalée avec un chevauchement élégant
            if (backImage) {
                const img = await loadImage(backImage);
                drawPremiumCard(img, 450, 400, 800, 505, 32, 0.06);
            }
            // Dessiner la carte avant (Recto)
            if (frontImage) {
                const img = await loadImage(frontImage);
                drawPremiumCard(img, 300, 280, 800, 505, 32, -0.04);
            }
            
            const finalImage = canvas.toDataURL("image/png");
            saveAs(finalImage, "nfcrafter-mockup-showcase.png");
            saveMockupToHistory(finalImage);
            toast('Mockup exporté !', 'success');
        } catch (err) {
            console.error(err);
            toast("Erreur lors de la génération", "error");
        }
    };

    const handleGenerateVideo = async () => {
        if (!frontImage || !backImage) return toast("Veuillez uploader Recto et Verso", "error");
        
        setIsRecording(true);
        setRecordProgress(0);
        
        const canvas = videoCanvasRef.current;
        if (!canvas) {
            toast("Erreur d'initialisation du moteur 3D", "error");
            setIsRecording(false);
            return;
        }

        const stream = canvas.captureStream(60); 
        const recorder = new MediaRecorder(stream, { 
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 12000000 // Haute qualité (12Mbps)
        });
        
        const chunks = [];
        recorder.ondataavailable = e => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            saveAs(blob, "nfcrafter-3d-card.mp4");
            setIsRecording(false);
            setRecordProgress(0);
            toast("Vidéo ultra-HD générée !", "success");
        };

        recorder.start();
        
        // Simuler une barre de progression sur 4 secondes
        let p = 0;
        const interval = setInterval(() => {
            p += 1;
            setRecordProgress(p);
            if (p >= 100) {
                clearInterval(interval);
                recorder.stop();
            }
        }, 40); // 40ms * 100 = 4000ms (4s)
    };

    const filtered = cards.filter(card => {
        const matchesSearch = (card.card_id?.toLowerCase().includes(search.toLowerCase())) || (card.card_name?.toLowerCase().includes(search.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
        const matchesType = typeFilter === 'all' || (card.admin_profile?.qr_type === typeFilter || card.type === typeFilter);
        const matchesCategory = categoryFilter === 'all' || card._type === categoryFilter;
        const matchesFolder = !filterFolder || card.folder_id === filterFolder;

        return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesFolder;
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
                    <button onClick={() => { setView('production'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'production' ? '#1A1265' : 'transparent', color: view === 'production' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>` }} /> Production
                    </button>
                    <button onClick={() => { setView('logo-studio'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'logo-studio' ? '#1A1265' : 'transparent', color: view === 'logo-studio' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>` }} /> Logo Studio
                    </button>
                    <button onClick={() => { setView('social-qr'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'social-qr' ? '#1A1265' : 'transparent', color: view === 'social-qr' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M7 7h1"></path><path d="M7 11h1"></path><path d="M7 15h1"></path><path d="M11 7h1"></path><path d="M11 11h1"></path><path d="M11 15h1"></path><path d="M15 7h1"></path><path d="M15 11h1"></path><path d="M15 15h1"></path></svg>` }} /> Social QR
                    </button>
                    <button onClick={() => { setView('mockup-3d'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'mockup-3d' ? '#1A1265' : 'transparent', color: view === 'mockup-3d' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>` }} /> Mockup 3D
                    </button>
                    <button onClick={() => { setView('marketing-studio'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'marketing-studio' ? '#1A1265' : 'transparent', color: view === 'marketing-studio' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19l7-7 3 3-7 7-3-3z"></path><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path><path d="M2 2l7.5 1.5"></path><path d="M7.67 7.67L2 2"></path><path d="M2 2l1.5 7.5"></path></svg>` }} /> Marketing Studio
                    </button>
                    <button onClick={() => { setView('video-studio'); setIsSidebarOpen(false); }} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', background: view === 'video-studio' ? '#1A1265' : 'transparent', color: view === 'video-studio' ? 'white' : '#64748B', fontWeight: '700', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>` }} /> Video Studio
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
                                    {view === 'users' ? 'Gestion des Utilisateurs' : (view === 'requests' ? 'Demandes de Design' : (view === 'finance' ? 'Finance & CA' : (view === 'production' ? 'Atelier Production' : (view === 'logo-studio' ? 'Logo Studio' : (view === 'social-qr' ? 'Générateur QR Social' : (view === 'mockup-3d' ? 'Studio Mockup 3D' : (view === 'marketing-studio' ? 'Marketing Studio' : (view === 'video-studio' ? 'Video Studio 3D' : (filterFolder ? currentFolder?.name : 'Tableau de bord')))))))))}

                                </h1>
                                <p style={{ color: '#64748B' }} className="desktop-only">
                                    {view === 'users' ? 'Gérez les comptes et les profils de vos clients.' : (view === 'requests' ? 'Clients souhaitant modifier le design de leur QR.' : (view === 'finance' ? 'Suivez votre chiffre d\'affaires et vos bénéfices.' : (view === 'production' ? 'Générez des cartes en masse et préparez les supports physiques.' : (view === 'logo-studio' ? 'Personnalisez et téléchargez votre logo en haute qualité.' : (view === 'social-qr' ? 'Créez des codes QR décoratifs pour vos réseaux sociaux.' : (view === 'mockup-3d' ? 'Générez des visuels 3D premium pour vos publicités.' : (view === 'marketing-studio' ? 'Créez des affiches publicitaires automatiques pour vos cartes.' : (view === 'video-studio' ? 'Générez des vidéos 3D MP4 carrées à partir de vos designs.' : (filterFolder ? (isSubFolder ? 'Contenu de ce sous-dossier' : 'Contenu de ce dossier') : 'Gérez l\'ensemble de vos projets QR.')))))))))}


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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {view === 'dashboard' && (
                                <div>
                                    <button
                                        onClick={() => { const v = !showStats; setShowStats(v); localStorage.setItem('nfcrafter_showStats', JSON.stringify(v)); }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', marginBottom: showStats ? '12px' : '0', color: '#64748B', fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}
                                    >
                                        <div style={{ width: 16, height: 16, transition: 'transform 0.2s', transform: showStats ? 'rotate(0deg)' : 'rotate(-90deg)' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>` }} />
                                        Statistiques
                                    </button>
                                    {showStats && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', animation: 'fadeIn 0.3s ease' }}>
                                        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ width: 16, height: 16, color: '#6366F1' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>` }} />
                                                </div>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Utilisateurs</div>
                                            </div>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265' }}>{platformStats.totalUsers}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', marginTop: '4px' }}>{platformStats.activeUsers} actif{platformStats.activeUsers > 1 ? 's' : ''}</div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: '#F0FDF4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ width: 16, height: 16, color: '#10B981' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect><path d="M7 7h1"></path><path d="M7 11h1"></path><path d="M7 15h1"></path><path d="M11 7h1"></path><path d="M11 11h1"></path><path d="M11 15h1"></path><path d="M15 7h1"></path><path d="M15 11h1"></path><path d="M15 15h1"></path></svg>` }} />
                                                </div>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Cartes</div>
                                            </div>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265' }}>{cards.length}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#10B981', marginTop: '4px' }}>{cards.filter(c => c.status === 'active').length} active{cards.filter(c => c.status === 'active').length > 1 ? 's' : ''}</div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ width: 16, height: 16, color: '#F59E0B' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>` }} />
                                                </div>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>Scans</div>
                                            </div>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265' }}>{Object.values(scans).reduce((a, b) => a + b, 0)}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', marginTop: '4px' }}>{Object.keys(scans).length} carte{Object.keys(scans).length > 1 ? 's' : ''} scannée{Object.keys(scans).length > 1 ? 's' : ''}</div>
                                        </div>
                                        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #1A1265 0%, #312E81 100%)', borderRadius: '16px', color: 'white', boxShadow: '0 10px 25px rgba(26,18,101,0.25)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <div style={{ width: 16, height: 16, color: '#A5B4FC' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>` }} />
                                                </div>
                                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px' }}>Revenu</div>
                                            </div>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{totalIncome.toLocaleString('fr-FR')}</div>
                                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6EE7B7', marginTop: '4px' }}>f CFA</div>
                                        </div>
                                    </div>
                                    )}
                                </div>
                            )}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px', background: '#F1F5F9', padding: '6px', borderRadius: '14px', width: 'fit-content' }}>
                                <button
                                    onClick={() => setCategoryFilter('all')}
                                    style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: categoryFilter === 'all' ? 'white' : 'transparent', color: categoryFilter === 'all' ? '#1A1265' : '#64748B', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: categoryFilter === 'all' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                >
                                    Tout ({cards.length})
                                </button>
                                <button
                                    onClick={() => setCategoryFilter('physical')}
                                    style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: categoryFilter === 'physical' ? 'white' : 'transparent', color: categoryFilter === 'physical' ? '#6366F1' : '#64748B', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: categoryFilter === 'physical' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                >
                                    Signature ({cards.filter(c => c._type === 'physical').length})
                                </button>
                                <button
                                    onClick={() => setCategoryFilter('digital')}
                                    style={{ padding: '8px 20px', borderRadius: '10px', border: 'none', background: categoryFilter === 'digital' ? 'white' : 'transparent', color: categoryFilter === 'digital' ? '#10B981' : '#64748B', fontWeight: '800', fontSize: '13px', cursor: 'pointer', boxShadow: categoryFilter === 'digital' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                                >
                                    Personnalisée ({cards.filter(c => c._type === 'digital').length})
                                </button>
                            </div>

                            <div style={{ background: 'white', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', border: '1px solid #F1F5F9' }} className="admin-filters">
                                <div style={{ position: 'relative', flex: 1 }}><span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3, display: 'flex' }}><div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` }} /></span><input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }} /></div>
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }} className="desktop-only"><option value="all">Statut</option><option value="active">Active</option><option value="pending">En attente</option></select>
                                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '600' }} className="desktop-only"><option value="all">Type</option><option value="url">URL</option><option value="wifi">WiFi</option><option value="vcard">VCard</option></select>
                            </div>
                        </div>
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
                                            {totalIncome.toLocaleString('fr-FR')} <small style={{ fontSize: '16px', color: '#94A3B8' }}>f CFA</small>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px', background: 'white', borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Dépenses</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#EF4444' }}>
                                            {totalExpense.toLocaleString('fr-FR')} <small style={{ fontSize: '16px', color: '#FCA5A5' }}>f CFA</small>
                                        </div>
                                    </div>
                                    <div style={{ padding: '24px', background: '#1A1265', borderRadius: '20px', color: 'white', boxShadow: '0 10px 25px rgba(26,18,101,0.2)' }}>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bénéfice Net</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#10B981' }}>
                                            {netProfit.toLocaleString('fr-FR')} <small style={{ fontSize: '16px', color: '#6EE7B7' }}>f CFA</small>
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
                                                        <option value="physique">Carte Signature (10.000f)</option>
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
                                                                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{new Date(t.date).toLocaleDateString('fr-FR')} à {new Date(t.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
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
                                {/* === COLLAPSIBLE GENERATION FORM === */}
                                <div style={{ background: 'white', borderRadius: '24px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
                                    {/* Accordion Header */}
                                    <div
                                        onClick={() => setIsProductionFormOpen(o => !o)}
                                        style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', background: isProductionFormOpen ? '#F8FAFC' : 'white', transition: 'background 0.2s' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                            <div style={{ width: 40, height: 40, borderRadius: '12px', background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <div style={{ width: 20, height: 20, color: '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>` }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '16px', fontWeight: '900', color: '#1A1265' }}>Génération en masse — Cartes Signature</div>
                                                <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '500' }}>Créez plusieurs cartes vierges avec leurs jetons d'activation</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8' }}>{isProductionFormOpen ? 'Réduire' : 'Ouvrir'}</span>
                                            <span style={{ fontSize: '14px', color: '#94A3B8', transition: 'transform 0.3s', display: 'inline-block', transform: isProductionFormOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
                                        </div>
                                    </div>

                                    {/* Accordion Body */}
                                    {isProductionFormOpen && (
                                        <div style={{ padding: '0 32px 32px', borderTop: '1px solid #F1F5F9' }}>
                                            <div style={{ paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                                    )}
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

                                                return Object.values(batchMap).sort((a, b) => b.cards[0].created_at.localeCompare(a.cards[0].created_at)).map(batch => {
                                                    const isExpanded = expandedBatch === batch.name;
                                                    return (
                                                        <div key={batch.name} style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                            <div
                                                                style={{
                                                                    background: 'white',
                                                                    borderRadius: '24px',
                                                                    padding: '24px',
                                                                    border: isExpanded ? '2px solid #1A1265' : '1px solid #E2E8F0',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'space-between',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                                                                    position: 'relative',
                                                                    overflow: 'hidden',
                                                                    transition: 'all 0.3s ease'
                                                                }}
                                                            >
                                                                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: batch.status === 'printed' ? '#10B981' : '#F59E0B' }}></div>

                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1 }}>
                                                                    <div
                                                                        onClick={() => setExpandedBatch(isExpanded ? null : batch.name)}
                                                                        style={{ width: '50px', height: '50px', borderRadius: '14px', background: isExpanded ? '#1A1265' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                                                                    >
                                                                        <div style={{ width: 24, height: 24, color: isExpanded ? 'white' : '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` }} />
                                                                    </div>

                                                                    <div>
                                                                        <h4 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', margin: 0 }}>{batch.name}</h4>
                                                                        <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <span>{batch.cards.length} cartes</span>
                                                                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#CBD5E1' }}></span>
                                                                            <span style={{ color: batch.status === 'printed' ? '#10B981' : '#F59E0B' }}>{batch.status === 'printed' ? 'Imprimé' : 'En attente'}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                                    <button
                                                                        onClick={() => handleDownloadAll(batch.cards.map(c => c.card_id))}
                                                                        style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: '#F1F5F9', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                    >
                                                                        <div style={{ width: 13, height: 13 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> ZIP
                                                                    </button>

                                                                    {/* ===== ANTI-DUPLICATE PRINT PROTECTION ===== */}
                                                                    {batch.status === 'printed' ? (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '10px', background: '#DCFCE7', color: '#15803D', fontWeight: '800', fontSize: '12px' }}>
                                                                                <div style={{ width: 13, height: 13 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>` }} />
                                                                                Imprimé
                                                                            </div>
                                                                            <button
                                                                                onClick={() => setModalConfig({
                                                                                    isOpen: true,
                                                                                    title: '⚠️ Déjà imprimé !',
                                                                                    type: 'danger',
                                                                                    children: <div><p style={{ marginBottom: 8 }}>Ce lot <strong>{batch.name}</strong> a déjà été marqué comme <strong>imprimé</strong>.</p><p style={{ color: '#EF4444', fontWeight: 700 }}>Êtes-vous sûr de vouloir le réimprimer ? Cela risque de créer des doublons.</p></div>,
                                                                                    onConfirm: () => { handleMarkBatchStatus(batch.cards, 'pending'); setModalConfig(p => ({ ...p, isOpen: false })); },
                                                                                    confirmText: 'Oui, réinitialiser quand même'
                                                                                })}
                                                                                style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #FECACA', background: 'white', color: '#EF4444', fontWeight: '800', cursor: 'pointer', fontSize: '12px' }}
                                                                            >
                                                                                Réinitialiser
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <button
                                                                            onClick={() => handleMarkBatchStatus(batch.cards, 'printed')}
                                                                            style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                                        >
                                                                            <div style={{ width: 13, height: 13 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>` }} />
                                                                            Marquer Imprimé
                                                                        </button>
                                                                    )}
                                                                    {/* ===== END PROTECTION ===== */}

                                                                    <button
                                                                        onClick={() => setExpandedBatch(isExpanded ? null : batch.name)}
                                                                        style={{ padding: '10px 16px', borderRadius: '12px', border: 'none', background: isExpanded ? '#1A1265' : '#F8FAFC', color: isExpanded ? 'white' : '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                                                                    >
                                                                        {isExpanded ? 'Fermer' : 'Ouvrir'} {isExpanded ? '▲' : '▼'}
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {isExpanded && (
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '0 20px', animation: 'fadeIn 0.3s ease' }}>
                                                                    {batch.cards.map(card => (
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
                                                            )}
                                                        </div>
                                                    );
                                                });
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
                        ) : view === 'social-qr' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>Configuration Marketing</h3>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '12px' }}>Contenu du QR (Lien ou Texte)</label>
                                            <input type="text" value={socialQRData} onChange={e => setSocialQRData(e.target.value)} style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '16px', fontWeight: '700' }} />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>COULEUR QR</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input type="color" value={socialQRColor} onChange={e => setSocialQRColor(e.target.value)} style={{ width: '40px', height: '50px', borderRadius: '12px', border: 'none', cursor: 'pointer', flexShrink: 0 }} />
                                                    <input type="text" value={socialQRColor} onChange={e => setSocialQRColor(e.target.value)} placeholder="#000000" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', fontWeight: '700' }} />
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#64748B', marginBottom: '8px' }}>COULEUR FOND</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <input type="color" value={socialQRBgColor} onChange={e => setSocialQRBgColor(e.target.value)} style={{ width: '40px', height: '50px', borderRadius: '12px', border: 'none', cursor: 'pointer', flexShrink: 0 }} />
                                                    <input type="text" value={socialQRBgColor} onChange={e => setSocialQRBgColor(e.target.value)} placeholder="#FFFFFF" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', fontWeight: '700' }} />
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                            <button onClick={handleDownloadSocialQR} style={{ width: '100%', marginTop: '12px', background: '#1A1265', color: 'white', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>Télécharger</button>
                                            <button onClick={saveSocialQRToHistory} style={{ width: '100%', marginTop: '12px', background: '#F1F5F9', color: '#1A1265', padding: '20px', borderRadius: '18px', border: '1px solid #E2E8F0', fontWeight: '900', fontSize: '16px', cursor: 'pointer' }}>Sauvegarder</button>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                                    {socialQRPreview && <img src={socialQRPreview} alt="Social QR Preview" style={{ width: '100%', maxWidth: '300px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />}
                                    <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: '600' }}>Aperçu temps réel</p>
                                </div>

                                {/* History section */}
                                {socialQRHistory.length > 0 && (
                                    <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>Historique Récent</h3>
                                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            {socialQRHistory.map(item => (
                                                <div key={item.id} style={{ flexShrink: 0, width: '120px', textAlign: 'center' }}>
                                                    <img src={item.url} style={{ width: '100%', borderRadius: '12px', border: '1px solid #F1F5F9', cursor: 'pointer' }} onClick={() => saveAs(item.url, `social-qr-${item.id}.png`)} />
                                                    <div style={{ fontSize: '10px', color: '#94A3B8', marginTop: '8px', fontWeight: '700' }}>{new Date(item.date).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : view === 'mockup-3d' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Image Recto</h4>
                                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'front')} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px dashed #CBD5E1', cursor: 'pointer' }} />
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Image Verso</h4>
                                        <input type="file" accept="image/*" onChange={e => handleImageUpload(e, 'back')} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px dashed #CBD5E1', cursor: 'pointer' }} />
                                    </div>
                                    <div style={{ background: 'white', borderRadius: '24px', padding: '32px', border: '1px solid #E2E8F0' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Fond Mockup</h4>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input type="color" value={mockupBgColor} onChange={e => setMockupBgColor(e.target.value)} style={{ width: '40px', height: '50px', borderRadius: '12px', border: 'none', cursor: 'pointer', flexShrink: 0 }} />
                                            <input type="text" value={mockupBgColor} onChange={e => setMockupBgColor(e.target.value)} placeholder="#111827" style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '13px', fontWeight: '700' }} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ height: '600px', background: mockupBgColor, borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1500px', overflow: 'hidden', position: 'relative', transition: 'background 0.3s' }}>
                                    <style dangerouslySetInnerHTML={{ __html: `
                                        @keyframes floatingShowcase {
                                            0% { transform: translateY(0px) rotateX(10deg); }
                                            50% { transform: translateY(-20px) rotateX(5deg); }
                                            100% { transform: translateY(0px) rotateX(10deg); }
                                        }
                                        .showcase-stack {
                                            position: relative;
                                            width: 500px;
                                            height: 315px;
                                            transform-style: preserve-3d;
                                            animation: floatingShowcase 6s infinite ease-in-out;
                                        }
                                        .showcase-card {
                                            position: absolute;
                                            width: 100%;
                                            height: 100%;
                                            border-radius: 18px;
                                            box-shadow: 0 30px 80px rgba(0,0,0,0.5);
                                            overflow: hidden;
                                            background: #1A1265;
                                            border: 1px solid rgba(255,255,255,0.1);
                                        }
                                        .showcase-back {
                                            transform: translateZ(-30px) translateX(50px) translateY(50px) rotate(4deg);
                                        }
                                        .showcase-front {
                                            transform: translateZ(30px) translateX(-40px) translateY(-40px) rotate(-2deg);
                                        }
                                    ` }} />
                                    
                                    <div className="showcase-stack">
                                        <div className="showcase-card showcase-back">
                                            {backImage ? <img src={backImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900' }}>VERSO</div>}
                                        </div>
                                        <div className="showcase-card showcase-front">
                                            {frontImage ? <img src={frontImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '900' }}>RECTO</div>}
                                        </div>
                                    </div>
                                    
                                    <div style={{ position: 'absolute', bottom: '24px', display: 'flex', gap: '12px' }}>
                                        <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', color: 'white', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                                            Style Showcase Premium
                                        </div>
                                        <button onClick={handleDownloadMockup} style={{ background: 'white', color: '#111827', padding: '10px 24px', borderRadius: '100px', border: 'none', fontWeight: '900', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
                                            <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> Télécharger Showcase
                                        </button>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ color: '#1A1265', fontSize: '15px', fontWeight: '800' }}>💡 Astuce Publicitaire</p>
                                    <p style={{ color: '#64748B', fontSize: '14px', fontWeight: '600', maxWidth: '800px', margin: '0 auto' }}>
                                        Pour obtenir une <strong>vidéo 3D premium</strong> : utilisez un enregistreur d'écran (Windows + G ou QuickTime) pendant que la carte tourne. 
                                        C'est la méthode utilisée par les pros pour garder une fluidité parfaite dans les pubs TikTok/Instagram.
                                    </p>
                                </div>

                                {/* Mockup History */}
                                {mockupHistory.length > 0 && (
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>Derniers Mockups Générés</h3>
                                        <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                                            {mockupHistory.map(item => (
                                                <div key={item.id} style={{ flexShrink: 0, width: '200px', textAlign: 'center' }}>
                                                    <img src={item.url} style={{ width: '100%', borderRadius: '16px', border: '1px solid #F1F5F9', cursor: 'pointer', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} onClick={() => saveAs(item.url, `mockup-${item.id}.png`)} />
                                                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '10px', fontWeight: '700' }}>Généré le {new Date(item.date).toLocaleDateString()}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : view === 'marketing-studio' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    {/* Palette Selection */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', marginBottom: '20px' }}>1. Choisir un coloris</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                                            {Object.entries(OFFICIAL_CARD_COLORS).map(([key, palette]) => (
                                                <button
                                                    key={key}
                                                    onClick={() => setMarketingPalette(key)}
                                                    style={{ 
                                                        width: '100%', 
                                                        aspectRatio: '1', 
                                                        borderRadius: '14px', 
                                                        background: palette.card, 
                                                        border: marketingPalette === key ? '3px solid #6366F1' : '2px solid transparent',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                    title={palette.name}
                                                >
                                                    {marketingPalette === key && (
                                                        <div style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#6366F1', borderRadius: '50%', padding: '4px', color: 'white' }}>
                                                            <div style={{ width: 10, height: 10 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><polyline points="20 6 9 17 4 12"></polyline></svg>` }} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1A1265' }}>{OFFICIAL_CARD_COLORS[marketingPalette].name}</div>
                                                <span style={{ fontSize: '10px', fontWeight: '900', color: '#6366F1', background: '#EEF2FF', padding: '2px 8px', borderRadius: '6px' }}>{OFFICIAL_CARD_COLORS[marketingPalette].rating}</span>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{OFFICIAL_CARD_COLORS[marketingPalette].note}</div>
                                        </div>
                                    </div>

                                    {/* Template Selection */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', marginBottom: '20px' }}>2. Format d'affiche</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            {[
                                                { id: 'showcase', name: 'Showcase Premium (4:3)', icon: '🖼️' },
                                                { id: 'instagram', name: 'Post Instagram (1:1)', icon: '📱' },
                                                { id: 'story', name: 'Story / TikTok (9:16)', icon: '🎞️' }
                                            ].map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setMarketingTemplate(t.id)}
                                                    style={{ 
                                                        width: '100%', 
                                                        padding: '14px', 
                                                        borderRadius: '16px', 
                                                        border: marketingTemplate === t.id ? '2px solid #1A1265' : '1px solid #E2E8F0',
                                                        background: marketingTemplate === t.id ? '#F1F5F9' : 'white',
                                                        color: '#1A1265',
                                                        fontWeight: '700',
                                                        textAlign: 'left',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '20px' }}>{t.icon}</span> {t.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Text Customization */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '32px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.02)' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', marginBottom: '20px' }}>3. Texte de l'affiche</h3>
                                        <textarea 
                                            value={marketingText} 
                                            onChange={e => setMarketingText(e.target.value)}
                                            style={{ width: '100%', height: '100px', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '15px', fontWeight: '600', outline: 'none', resize: 'none' }}
                                            placeholder="Saisissez votre slogan..."
                                        />
                                        <button 
                                            onClick={() => toast('Fonctionnalité de téléchargement HD en cours de finalisation', 'info')}
                                            style={{ width: '100%', marginTop: '20px', background: '#1A1265', color: 'white', padding: '16px', borderRadius: '16px', border: 'none', fontWeight: '900', fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                                        >
                                            <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} /> Télécharger HD
                                        </button>
                                    </div>
                                </div>

                                {/* Main Preview Area */}
                                <div style={{ 
                                    background: OFFICIAL_CARD_COLORS[marketingPalette].card, 
                                    minHeight: marketingTemplate === 'story' ? '800px' : '600px', 
                                    borderRadius: '40px', 
                                    display: 'flex', 
                                    flexDirection: 'column',
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    padding: '60px', 
                                    position: 'relative', 
                                    overflow: 'hidden',
                                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
                                }}>
                                    {/* Abstract background elements */}
                                    <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%', background: 'white', opacity: 0.03, top: '-200px', right: '-100px' }}></div>
                                    <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'white', opacity: 0.02, bottom: '-100px', left: '-50px' }}></div>

                                    {/* Content Wrapper */}
                                    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: marketingTemplate === 'story' ? 'column' : 'row', alignItems: 'center', gap: '60px', zIndex: 10 }}>
                                        
                                        {/* Card Showcase */}
                                        <div style={{ flex: 1, perspective: '1000px' }}>
                                            <div style={{ 
                                                width: '100%', 
                                                aspectRatio: '1.58', 
                                                background: OFFICIAL_CARD_COLORS[marketingPalette].card, 
                                                borderRadius: '24px', 
                                                boxShadow: '0 40px 80px rgba(0,0,0,0.5)', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                transform: 'rotateX(15deg) rotateY(-15deg)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                {/* Card Logo Simulation */}
                                                <div style={{ 
                                                    width: '40%', 
                                                    height: '60px', 
                                                    background: OFFICIAL_CARD_COLORS[marketingPalette].logo,
                                                    opacity: 0.8,
                                                    maskImage: 'url(/logo.png)',
                                                    maskRepeat: 'no-repeat',
                                                    maskPosition: 'center',
                                                    maskSize: 'contain',
                                                    WebkitMaskImage: 'url(/logo.png)',
                                                    WebkitMaskRepeat: 'no-repeat',
                                                    WebkitMaskPosition: 'center',
                                                    WebkitMaskSize: 'contain'
                                                }}></div>
                                                
                                                {/* QR Symbol */}
                                                <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '50px', height: '50px', background: OFFICIAL_CARD_COLORS[marketingPalette].qrBg, borderRadius: '8px', padding: '6px' }}>
                                                    <div style={{ width: '100%', height: '100%', background: OFFICIAL_CARD_COLORS[marketingPalette].qrPoints, borderRadius: '2px' }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Text Section */}
                                        <div style={{ flex: 1, textAlign: marketingTemplate === 'story' ? 'center' : 'left' }}>
                                            <h2 style={{ fontSize: marketingTemplate === 'story' ? '36px' : '48px', fontWeight: '900', color: 'white', lineHeight: '1.2', margin: 0, textShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                                {marketingText}
                                            </h2>
                                            <div style={{ marginTop: '30px', display: 'flex', gap: '12px', justifyContent: marketingTemplate === 'story' ? 'center' : 'flex-start' }}>
                                                <div style={{ padding: '10px 24px', borderRadius: '100px', background: 'white', color: OFFICIAL_CARD_COLORS[marketingPalette].card, fontWeight: '900', fontSize: '14px' }}>
                                                    NFCrafter Premium
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Footer */}
                                    <div style={{ position: 'absolute', bottom: '40px', left: '0', width: '100%', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase' }}>
                                        www.nfcrafter.com
                                    </div>
                                </div>
                            </div>
                        ) : view === 'video-studio' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px' }}>
                                    {/* Upload Controls */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>Images de la carte</h3>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '10px' }}>Recto (Face)</label>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (re) => setFrontImage(re.target.result);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px' }} />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '10px' }}>Verso (Dos)</label>
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onload = (re) => setBackImage(re.target.result);
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px' }} />
                                            </div>

                                            <div style={{ padding: '20px', borderRadius: '20px', background: '#F1F5F9', border: '1px dashed #CBD5E1', marginTop: '10px' }}>
                                                <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', lineHeight: '1.6', margin: 0 }}>
                                                    La vidéo sera générée au format <strong>carré (1:1)</strong>, idéale pour les posts Instagram et TikTok.
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleGenerateVideo}
                                                disabled={isRecording || !frontImage || !backImage}
                                                style={{ width: '100%', marginTop: '12px', background: isRecording ? '#94A3B8' : '#1A1265', color: 'white', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: '900', fontSize: '16px', cursor: isRecording ? 'not-allowed' : 'pointer', boxShadow: '0 8px 25px rgba(26,18,101,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                                            >
                                                {isRecording ? (
                                                    <>Génération en cours... {recordProgress}%</>
                                                ) : (
                                                    <>
                                                        <div style={{ width: 20, height: 20 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>` }} />
                                                        Générer la vidéo MP4
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview & Hidden Canvas */}
                                    <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
                                        <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', margin: 0 }}>Aperçu du Rendu</h3>
                                        <div style={{ 
                                            width: '100%', 
                                            aspectRatio: '1', 
                                            borderRadius: '24px', 
                                            background: '#111827', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            overflow: 'hidden',
                                            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                                        }}>
                                            {frontImage && backImage ? (
                                                <Card3DVideo 
                                                    key={`${frontImage?.length || 0}-${backImage?.length || 0}`}
                                                    frontImage={frontImage} 
                                                    backImage={backImage} 
                                                    onCanvasReady={(el) => videoCanvasRef.current = el} 
                                                />
                                            ) : (

                                                <div style={{ color: '#64748B', textAlign: 'center', padding: '40px' }}>
                                                    <div style={{ fontSize: '40px', marginBottom: '20px' }}>🎴</div>
                                                    <p style={{ fontWeight: '700' }}>Uploadez Recto et Verso pour voir l'aperçu 3D</p>
                                                </div>
                                            )}

                                        </div>
                                        {isRecording && (
                                            <div style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,255,255,0.9)', padding: '10px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', color: '#1A1265', border: '1px solid #1A1265', backdropFilter: 'blur(10px)' }}>
                                                🔴 Enregistrement...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : view === 'logo-studio' ? (


                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', animation: 'fadeIn 0.4s ease' }}>
                                {/* Controls */}
                                <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.03)' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{ width: 32, height: 32, borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <div style={{ width: 16, height: 16, color: '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>` }} />
                                        </div>
                                        Personnalisation
                                    </h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#475569', marginBottom: '12px' }}>Couleur du logo</label>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <input
                                                    type="color"
                                                    value={studioColor}
                                                    onChange={(e) => setStudioColor(e.target.value)}
                                                    style={{ width: '60px', height: '60px', borderRadius: '15px', border: 'none', cursor: 'pointer', padding: '0', background: 'transparent' }}
                                                />
                                                <input
                                                    type="text"
                                                    value={studioColor}
                                                    onChange={(e) => setStudioColor(e.target.value)}
                                                    placeholder="#000000"
                                                    style={{ flex: 1, padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '16px', fontWeight: '700', color: '#1A1265', outline: 'none' }}
                                                />
                                            </div>
                                        </div>

                                        <div style={{ padding: '20px', borderRadius: '20px', background: '#F1F5F9', border: '1px dashed #CBD5E1' }}>
                                            <p style={{ fontSize: '13px', color: '#64748B', fontWeight: '600', lineHeight: '1.6', margin: 0 }}>
                                                Le logo sera généré avec un <strong>fond transparent</strong>. Parfait pour vos cartes de visite, flyers ou supports physiques.
                                            </p>
                                        </div>

                                        <button
                                            onClick={handleDownloadStudioLogo}
                                            style={{ width: '100%', marginTop: '12px', background: '#1A1265', color: 'white', padding: '20px', borderRadius: '18px', border: 'none', fontWeight: '900', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 25px rgba(26,18,101,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'transform 0.2s' }}
                                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                                        >
                                            <div style={{ width: 20, height: 20 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>` }} />
                                            Télécharger le logo PNG
                                        </button>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div style={{ background: 'white', borderRadius: '30px', padding: '40px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', margin: 0 }}>Aperçu (Fond transparent)</h3>
                                    <div style={{ flex: 1, minHeight: '300px', borderRadius: '24px', background: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uInGs0Ak89HkhjnMogTRhS78GpkMAnx/+NPMykzghp68BAA39YfP+6GvEYAAAAASUVORK5CYII=")', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #F1F5F9' }}>
                                        {studioLogo ? (
                                            <img src={studioLogo} alt="Preview" style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} />
                                        ) : (
                                            <div style={{ color: '#94A3B8', fontWeight: '600' }}>Chargement...</div>
                                        )}
                                    </div>
                                    <div style={{ textAlign: 'center', fontSize: '12px', color: '#94A3B8', fontWeight: '600' }}>
                                        Le damier gris indique la transparence.
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
                                            <div style={{ color: '#94A3B8', fontSize: '12px', marginBottom: '8px' }}>{user.email}</div>

                                            {/* List of user cards */}
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                {user.cards && user.cards.length > 0 ? user.cards.map(card => (
                                                    <div key={card.card_id} style={{ background: '#F1F5F9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', border: '1px solid #E2E8F0' }}>
                                                        {card.card_name || card.card_id}
                                                    </div>
                                                )) : (
                                                    <div style={{ fontSize: '11px', color: '#CBD5E1', fontStyle: 'italic' }}>Aucune carte</div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setModalConfig({
                                                    isOpen: true, title: 'Supprimer utilisateur', type: 'danger',
                                                    children: <p>Voulez-vous vraiment supprimer cet utilisateur ?</p>,
                                                    onConfirm: () => { handleDeleteUser(user.id); setModalConfig(p => ({ ...p, isOpen: false })); },
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
                            {card._type === 'digital' ? 'Carte Personnalisée' : 'Carte Signature'}
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