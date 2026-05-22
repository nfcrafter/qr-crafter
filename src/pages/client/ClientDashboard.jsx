// src/pages/client/ClientDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';
import PhonePreview from '../../components/PhonePreview.jsx';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../../constants/socials.js';
import Modal from '../../components/Modal.jsx';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activatedId = searchParams.get('activated');
    const toast = useToast();

    const [viewMode, setViewMode] = useState('view');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const [user, setUser] = useState(null);
    const [userCards, setUserCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingProduct, setUploadingProduct] = useState(false);
    const [scanCount, setScanCount] = useState(0);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [renamingCardId, setRenamingCardId] = useState(null);
    const [newName, setNewName] = useState('');
    const [feedbacks, setFeedbacks] = useState([]);
    const [feedbacksLoading, setFeedbacksLoading] = useState(false);
    const [scanStats, setScanStats] = useState([]);
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallBtn, setShowInstallBtn] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstallGuide, setShowIOSInstallGuide] = useState(false);
    const editorRef = useRef(null);
    const offlineQrRef = useRef(null);
    
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);
    
    // Listen for PWA installation prompt
    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        
        if (isStandalone) {
            setShowInstallBtn(false);
            setShowIOSInstallGuide(false);
            return;
        }

        // Detect iOS
        const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        
        if (checkIOS) {
            setIsIOS(true);
            setShowIOSInstallGuide(true);
        }

        const handleBeforeInstallPrompt = (e) => {
            console.log('[PWA] beforeinstallprompt event fired');
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallBtn(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallApp = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User choice outcome: ${outcome}`);
        setDeferredPrompt(null);
        setShowInstallBtn(false);
    };

    // Lock body scroll when mobile preview is open
    useEffect(() => {
        if (showMobilePreview) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [showMobilePreview]);

    const [publicProfile, setPublicProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265',
        socials: {}, customLinks: [], url: '', qr_type: 'profile'
    });

    useEffect(() => { 
        console.log("Dashboard mount/update, activatedId:", activatedId);
        loadUserData();
    }, [activatedId]);

    async function loadUserData() {
        try {
            setLoading(true);
            
            // Check if we are offline or if navigator says we are offline
            if (!navigator.onLine) {
                console.log("[PWA] Offline detected, loading from localStorage");
                const cachedUser = localStorage.getItem('nfc_cached_user');
                const cachedCards = localStorage.getItem('nfc_cached_cards');
                
                if (cachedUser && cachedCards) {
                    const parsedUser = JSON.parse(cachedUser);
                    const parsedCards = JSON.parse(cachedCards);
                    
                    setUser(parsedUser);
                    setUserCards(parsedCards);
                    
                    if (parsedCards.length > 0) {
                        const currentId = activatedId || selectedCardId || parsedCards[0].card_id;
                        const card = parsedCards.find(c => c.card_id === currentId) || parsedCards[0];
                        setSelectedCardId(card.card_id);
                        setPublicProfile({
                            banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
                            phone: '', email: '', primaryColor: '#1A1265',
                            socials: {}, customLinks: [], url: '', qr_type: 'profile',
                            ...(card.admin_profile || {})
                        });
                    }
                    return; // Stop here, loaded offline successfully!
                }
            }

            const { data: authData, error: authError } = await supabase.auth.getUser();
            
            if (authError || !authData?.user) {
                // If it's a network error (e.g., fetch failed due to offline), load from cache
                if (authError && authError.message && (authError.message.includes('Fetch') || authError.message.includes('Failed'))) {
                    const cachedUser = localStorage.getItem('nfc_cached_user');
                    const cachedCards = localStorage.getItem('nfc_cached_cards');
                    if (cachedUser && cachedCards) {
                        setUser(JSON.parse(cachedUser));
                        const parsedCards = JSON.parse(cachedCards);
                        setUserCards(parsedCards);
                        if (parsedCards.length > 0) {
                            const currentId = activatedId || selectedCardId || parsedCards[0].card_id;
                            const card = parsedCards.find(c => c.card_id === currentId) || parsedCards[0];
                            setSelectedCardId(card.card_id);
                            setPublicProfile({
                                banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
                                phone: '', email: '', primaryColor: '#1A1265',
                                socials: {}, customLinks: [], url: '', qr_type: 'profile',
                                ...(card.admin_profile || {})
                            });
                        }
                        return;
                    }
                }
                navigate('/login');
                return;
            }
            
            const authUser = authData.user;
            setUser(authUser);
            localStorage.setItem('nfc_cached_user', JSON.stringify(authUser));

            // Fetch cards where owner_id is the user — only source of truth
            const { data: ownedCards, error: ownedError } = await supabase
                .from('cards')
                .select('*')
                .eq('owner_id', authUser.id)
                .order('created_at', { ascending: false });

            // Don't throw on error — just use empty array and show empty state
            const finalCards = ownedError ? [] : (ownedCards || []);
            if (ownedError) {
                console.warn("Cards fetch warning:", ownedError.message);
            } else {
                localStorage.setItem('nfc_cached_cards', JSON.stringify(finalCards));
            }

            setUserCards(finalCards);

            if (finalCards.length > 0) {
                const currentId = activatedId || selectedCardId || finalCards[0].card_id;
                const card = finalCards.find(c => c.card_id === currentId) || finalCards[0];
                setSelectedCardId(card.card_id);
                setPublicProfile({
                    banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
                    phone: '', email: '', primaryColor: '#1A1265',
                    socials: {}, customLinks: [], url: '', qr_type: 'profile',
                    ...(card.admin_profile || {})
                });

                // Load scan count — non-blocking
                try {
                    const { count } = await supabase
                        .from('scan_logs')
                        .select('*', { count: 'exact', head: true })
                        .eq('card_id', card.card_id);
                    setScanCount(count || 0);
                } catch (_) {}
            }
        } catch (err) {
            console.error("Dashboard Load Error:", err);
            const cachedUser = localStorage.getItem('nfc_cached_user');
            const cachedCards = localStorage.getItem('nfc_cached_cards');
            if (cachedUser && cachedCards) {
                setUser(JSON.parse(cachedUser));
                setUserCards(JSON.parse(cachedCards));
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (selectedCardId && userCards.length > 0) {
            const card = userCards.find(c => c.card_id === selectedCardId);
            if (card) {
                setPublicProfile({
                    banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
                    phone: '', email: '', primaryColor: '#1A1265',
                    socials: {}, customLinks: [], url: '', qr_type: 'profile',
                    ...(card.admin_profile || {})
                });

                setViewMode('view');
                setIsMobileMenuOpen(false);

                if (navigator.onLine) {
                    // Update scan count when card changes — only online
                    supabase
                        .from('scan_logs')
                        .select('*', { count: 'exact', head: true })
                        .eq('card_id', selectedCardId)
                        .then(({ count }) => setScanCount(count || 0))
                        .catch(() => {});

                    // Load feedbacks for this card — only online
                    setFeedbacksLoading(true);
                    supabase
                        .from('feedbacks')
                        .select('*')
                        .eq('card_id', selectedCardId)
                        .order('created_at', { ascending: false })
                        .then(({ data }) => {
                            setFeedbacks(data || []);
                            setFeedbacksLoading(false);
                        })
                        .catch(() => setFeedbacksLoading(false));

                    // Load scan stats (last 14 days) — only online
                    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
                    supabase
                        .from('scan_logs')
                        .select('created_at')
                        .eq('card_id', selectedCardId)
                        .gte('created_at', since)
                        .then(({ data }) => {
                            if (!data) return;
                            const counts = {};
                            for (let i = 13; i >= 0; i--) {
                                const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
                                const key = d.toISOString().split('T')[0];
                                counts[key] = 0;
                            }
                            data.forEach(row => {
                                const key = row.created_at.split('T')[0];
                                if (counts[key] !== undefined) counts[key]++;
                            });
                            setScanStats(Object.entries(counts).map(([date, count]) => ({ date, count })));
                        })
                        .catch(() => {});
                }
            }
        }
    }, [selectedCardId]);

    function handleWhatsAppOrder() {
        const message = `Bonjour NFCrafter, je souhaite commander ma Carte Signature NFC à 7.000f. Mon email : ${user?.email}`;
        window.open(`https://wa.me/22991566846?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    async function handleRenameCard(e, cardId) {
        e.stopPropagation();
        if (isOffline) {
            toast('Connexion Internet requise pour renommer vos profils.', 'error');
            setRenamingCardId(null);
            return;
        }
        if (!newName.trim()) return setRenamingCardId(null);
        
        const { error } = await supabase
            .from('cards')
            .update({ card_name: newName.trim() })
            .eq('card_id', cardId);
            
        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Carte renommée !', 'success');
            setUserCards(userCards.map(c => c.card_id === cardId ? { ...c, card_name: newName.trim() } : c));
            setRenamingCardId(null);
        }
    }

    async function savePublicProfile() {
        if (isOffline) {
            toast('Connexion Internet requise pour enregistrer les modifications.', 'error');
            return;
        }
        if (!selectedCardId) return;
        setSaving(true);
        const { error } = await supabase
            .from('cards')
            .update({ admin_profile: publicProfile, card_name: publicProfile.full_name || 'Mon Profil' })
            .eq('card_id', selectedCardId);

        if (error) toast('Erreur : ' + error.message, 'error');
        else { toast('Profil mis à jour !', 'success'); setViewMode('view'); loadUserData(); }
        setSaving(false);
    }

    async function handleProductImageUpload(productId, file) {
        setUploadingProduct(true);
        await uploadFile(file, 'products', (url) => {
            setPublicProfile(p => ({
                ...p,
                products: (p.products || []).map(prod => prod.id === productId ? { ...prod, image_url: url } : prod)
            }));
        });
        setUploadingProduct(false);
    }

    async function handleGalleryImageUpload(file, onUrl) {
        await uploadFile(file, 'gallery', onUrl);
    }

    // Supabase Realtime — notify on new feedbacks
    useEffect(() => {
        if (!selectedCardId) return;
        const channel = supabase
            .channel(`feedbacks-${selectedCardId}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feedbacks', filter: `card_id=eq.${selectedCardId}` }, (payload) => {
                setFeedbacks(prev => [payload.new, ...prev]);
                toast('Nouveau retour reçu !', 'success');
            })
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [selectedCardId]);

    async function uploadFile(file, bucket, onUrl, setUploading) {
        if (!file) return;
        const isFunc = typeof setUploading === 'function';
        if (isFunc) setUploading(true);
        try {
            const targetBucket = bucket || 'banners';
            // Use more robust filename
            const ext = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
            
            const { error: uploadError } = await supabase.storage
                .from(targetBucket)
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: true
                });

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
            onUrl(publicUrl);
            toast('Image ajoutée avec succès !', 'success');
        } catch (e) { 
            console.error('Upload error:', e);
            toast('Erreur d\'envoi : ' + (e.message || 'Problème de connexion'), 'error'); 
        }
        finally { if (isFunc) setUploading(false); }
    }

    const downloadQR = () => {
        // Toujours utiliser le lien permanent pour que le QR code reste valide
        // même si le lien convivial est modifié plus tard.
        const link = `${window.location.origin}/u/${selectedCardId}`;
        
        import('qr-code-styling').then(QRCodeStyling => {
            const qrCode = new QRCodeStyling.default({
                width: 1000,
                height: 1000,
                data: link,
                dotsOptions: { color: "#1A1265", type: "rounded" },
                cornersSquareOptions: { color: "#1A1265", type: "extra-rounded" },
                backgroundOptions: { color: "#FFFFFF" },
                image: "/logo.png",
                imageOptions: {
                    crossOrigin: "anonymous",
                    hideBackgroundDots: true,
                    imageSize: 0.3,
                    margin: 5
                },
                qrOptions: {
                    errorCorrectionLevel: "H"
                }
            });
            qrCode.download({ name: `nfcrafter-qr-${selectedCard?.url_slug || selectedCardId}`, extension: "png" });
        });
    };

    const generateVCardData = () => {
        const lines = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `N:${publicProfile.full_name || 'Contact'};;;;`,
            `FN:${publicProfile.full_name || 'Contact'}`
        ];

        if (publicProfile.job_title) {
            lines.push(`TITLE:${publicProfile.job_title}`);
        }
        
        if (publicProfile.bio) {
            const cleanBio = publicProfile.bio.replace(/\r?\n/g, ' ');
            lines.push(`NOTE:${cleanBio}`);
        }

        if (publicProfile.phone) {
            lines.push(`TEL;TYPE=CELL:${publicProfile.phone}`);
        }

        if (publicProfile.email) {
            lines.push(`EMAIL;TYPE=INTERNET:${publicProfile.email}`);
        }

        const selectedCard = userCards.find(c => c.card_id === selectedCardId);
        const cardUrl = selectedCard ? (selectedCard.url_slug ? `${window.location.origin}/${selectedCard.url_slug}` : `${window.location.origin}/u/${selectedCardId}`) : '';
        
        if (cardUrl) {
            lines.push(`URL:${cardUrl}`);
        }

        // Add standard socials
        let itemIndex = 1;
        if (publicProfile.socials) {
            Object.entries(publicProfile.socials).forEach(([key, val]) => {
                let value = '';
                if (val && typeof val === 'object') {
                    value = val.value;
                } else if (typeof val === 'string') {
                    value = val;
                }
                if (value && value.trim()) {
                    const network = SOCIAL_NETWORKS.find(n => n.id === key);
                    if (network) {
                        try {
                            const url = network.getUrl(value);
                            if (key === 'whatsapp' || key === 'whatsapp_business') {
                                lines.push(`item${itemIndex}.URL:${url}`);
                                lines.push(`item${itemIndex}.X-ABLabel:WhatsApp`);
                                lines.push(`X-WHATSAPP:${value}`);
                                itemIndex++;
                            } else {
                                lines.push(`item${itemIndex}.URL:${url}`);
                                lines.push(`item${itemIndex}.X-ABLabel:${network.label}`);
                                itemIndex++;
                            }
                        } catch (e) {
                            lines.push(`X-SOCIALPROFILE;TYPE=${key.toUpperCase()}:${value}`);
                        }
                    } else {
                        lines.push(`X-SOCIALPROFILE;TYPE=${key.toUpperCase()}:${value}`);
                    }
                }
            });
        }

        lines.push('END:VCARD');
        return lines.join('\n');
    };

    useEffect(() => {
        if (isOfflineModalOpen && offlineQrRef.current) {
            // Clear any existing children of offlineQrRef.current
            offlineQrRef.current.innerHTML = '';
            
            const vCardData = generateVCardData();
            
            import('qr-code-styling').then(QRCodeStyling => {
                const qrCode = new QRCodeStyling.default({
                    width: 280,
                    height: 280,
                    data: vCardData,
                    dotsOptions: { color: "#1A1265", type: "rounded" },
                    cornersSquareOptions: { color: "#1A1265", type: "extra-rounded" },
                    backgroundOptions: { color: "#FFFFFF" },
                    image: "/logo.png",
                    imageOptions: {
                        crossOrigin: "anonymous",
                        hideBackgroundDots: true,
                        imageSize: 0.3,
                        margin: 5
                    },
                    qrOptions: {
                        errorCorrectionLevel: "H"
                    }
                });
                qrCode.append(offlineQrRef.current);
            });
        }
    }, [isOfflineModalOpen, publicProfile]);


    if (loading) return (
        <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <div className="loader" style={{ width: 40, height: 40, border: '4px solid #EEF2FF', borderTopColor: '#1A1265', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const selectedCard = userCards.find(c => c.card_id === selectedCardId);
    const publicUrl = selectedCard ? (selectedCard.url_slug ? `${window.location.origin}/${selectedCard.url_slug}` : `${window.location.origin}/u/${selectedCardId}`) : '';

    const getBrightness = (hex) => {
        if (!hex || hex[0] !== '#') return 255;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    };

    const isDark = getBrightness(publicProfile.backgroundColor || '#f0f2f5') < 128;
    const textColor = isDark ? '#F8FAFC' : '#111';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'white';

    // Check if profile is incomplete (missing main contacts or name)
    const isProfileIncomplete = userCards.length > 0 && (
        !publicProfile.full_name || 
        publicProfile.full_name === 'Nom complet' || 
        (!publicProfile.phone && !publicProfile.email) ||
        Object.keys(publicProfile.socials || {}).length === 0
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#FFFFFF', maxWidth: '100vw', overflowX: 'hidden' }}>
            
            {/* Header Mobile Only */}
            <div className="mobile-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '70px', background: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 100, display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '24px' }} />
                    <span style={{ fontWeight: '900', color: '#1A1265' }}>NFCrafter</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)} 
                    style={{ 
                        background: 'rgba(255, 255, 255, 0.7)', 
                        backdropFilter: 'blur(10px)', 
                        color: '#1A1265', 
                        border: '1px solid rgba(226, 232, 240, 0.8)', 
                        width: '44px', 
                        height: '44px', 
                        borderRadius: '12px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                    }}
                >
                    <div style={{ width: 22, height: 22 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>` }} />
                </button>
            </div>

            {/* Overlay Mobile */}
            {isMobileMenuOpen && (
                <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 190, backdropFilter: 'blur(4px)' }} />
            )}

            {/* Sidebar (Left) */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '280px', background: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 200, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '10px 0 30px rgba(0,0,0,0.02)' }}>
                <div style={{ padding: '40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '40px', height: '40px', background: '#1A1265', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(26,18,101,0.2)' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '20px', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265', letterSpacing: '-0.5px' }}>NFCrafter</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="mobile-only" style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'none', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column' }}>
                    <button onClick={() => navigate('/')} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', textAlign: 'left', cursor: 'pointer', background: 'transparent', color: '#64748B', fontWeight: '700', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` }} />
                        Accueil
                    </button>

                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '16px', letterSpacing: '1.5px' }}>Tableau de bord</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {userCards.map(card => (
                            <div key={card.card_id} style={{ position: 'relative' }}>
                                <button 
                                    onClick={() => setSelectedCardId(card.card_id)} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px 16px', 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        textAlign: 'left', 
                                        cursor: 'pointer', 
                                        background: selectedCardId === card.card_id ? '#F5F3FF' : 'transparent', 
                                        color: selectedCardId === card.card_id ? '#7C3AED' : '#64748B', 
                                        fontWeight: '700', 
                                        transition: '0.2s', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '12px', 
                                        paddingRight: '40px' 
                                    }}
                                >
                                    {selectedCardId === card.card_id && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: '#7C3AED', borderRadius: '0 4px 4px 0' }} />}
                                    <div style={{ width: 18, height: 18, opacity: selectedCardId === card.card_id ? 1 : 0.6 }} dangerouslySetInnerHTML={{ __html: selectedCardId === card.card_id ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"></path><path d="M11 3v4"></path><path d="M15 3l-2 4"></path><path d="M9 3l2 4"></path><path d="M2 9h20"></path></svg>` : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` }} /> 
                                    
                                    {renamingCardId === card.card_id ? (
                                        <input 
                                            autoFocus
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            onKeyDown={e => { if(e.key === 'Enter') handleRenameCard(e, card.card_id); if(e.key === 'Escape') setRenamingCardId(null); }}
                                            onBlur={e => handleRenameCard(e, card.card_id)}
                                            onClick={e => e.stopPropagation()}
                                            style={{ background: 'white', border: '1px solid #7C3AED', borderRadius: '6px', padding: '2px 8px', fontSize: '13px', width: '100%', outline: 'none' }}
                                        />
                                    ) : (
                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.card_name || 'Mon Profil'}</span>
                                    )}
                                </button>
                                
                                {renamingCardId !== card.card_id && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setRenamingCardId(card.card_id); setNewName(card.card_name || ''); }}
                                        style={{ 
                                            position: 'absolute', 
                                            right: '12px', 
                                            top: '50%', 
                                            transform: 'translateY(-50%)', 
                                            background: 'transparent', 
                                            border: 'none', 
                                            color: selectedCardId === card.card_id ? '#7C3AED' : '#94A3B8', 
                                            cursor: 'pointer', 
                                            padding: '4px',
                                            display: 'flex',
                                            opacity: selectedCardId === card.card_id ? 1 : 0
                                        }}
                                        className="rename-btn"
                                    >
                                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>` }} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '32px', paddingBottom: '24px' }}>
                        <button onClick={() => { localStorage.removeItem('nfc_cached_user'); localStorage.removeItem('nfc_cached_cards'); supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'white', color: '#EF4444', border: '1px solid #FEE2E2', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }}>Déconnexion</button>
                    </div>

                </div>
            </aside>

            {/* Main Content (Right) */}
            <main className="main-content" style={{ flex: 1, marginLeft: '280px', padding: '40px', maxWidth: '100%', height: '100vh', overflowY: 'auto' }}>
                {userCards.length === 0 ? (
                    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', color: '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path><path d="M10 12h.01"></path><path d="M16 2v2"></path><path d="M6 2v2"></path></svg>` }} />
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Bienvenue</h1>
                        <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>Vous n'avez pas encore de profil actif. Cliquez ci-dessous pour commander votre premier profil digital.</p>
                        <button onClick={() => handleWhatsAppOrder()} className="btn-primary" style={{ padding: '16px 40px', borderRadius: '100px', background: '#25D366', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>` }} />
                                            Commander ma carte
                                        </button>
                    </div>
                ) : (
                    <div className="dashboard-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* Warning Banner: Offline Mode Alert */}
                            {isOffline && (
                                <div style={{ 
                                    background: '#FFFBEB', 
                                    padding: '14px 20px', 
                                    borderRadius: '16px', 
                                    color: '#B45309', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    boxShadow: '0 4px 12px rgba(245,158,11,0.05)',
                                    animation: 'fadeIn 0.4s ease-out',
                                    border: '1px solid #FEF3C7',
                                    fontSize: '13px',
                                    lineHeight: '1.5'
                                }}>
                                    <div style={{ width: 20, height: 20, color: '#B45309', display: 'flex', alignItems: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.5M5 12.5a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.58 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"></svg>` }} />
                                    <span>
                                        <strong>Mode hors-ligne actif :</strong> Votre QR Code et vos coordonnées vCard restent 100% opérationnels pour le partage de contacts. Cependant, vous devez vous connecter à Internet pour modifier votre profil ou enregistrer de nouvelles modifications.
                                    </span>
                                </div>
                            )}

                            {/* Compact PWA Android Banner */}
                            {showInstallBtn && !localStorage.getItem('nfc_pwa_dismissed') && (
                                <div style={{ 
                                    background: '#FEF2F2', 
                                    padding: '12px 20px', 
                                    borderRadius: '16px', 
                                    color: '#991B1B', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    gap: '16px',
                                    boxShadow: '0 4px 12px rgba(239,68,68,0.05)',
                                    animation: 'fadeIn 0.4s ease-out',
                                    border: '1px solid #FEE2E2',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        <div style={{ width: 18, height: 18, color: '#991B1B', display: 'flex', alignItems: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>` }} />
                                        <span>
                                            <strong>Recommandé :</strong> Ajoutez NFCrafter à votre écran pour le partage 100% hors-ligne (sans internet).
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <button 
                                            onClick={handleInstallApp}
                                            style={{ 
                                                background: '#EF4444', 
                                                color: 'white', 
                                                padding: '6px 12px', 
                                                borderRadius: '8px', 
                                                border: 'none', 
                                                fontWeight: '800', 
                                                cursor: 'pointer',
                                                fontSize: '12px',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Installer
                                        </button>
                                        <button 
                                            onClick={() => {
                                                localStorage.setItem('nfc_pwa_dismissed', 'true');
                                                setShowInstallBtn(false);
                                            }}
                                            style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }}
                                        >
                                            Masquer
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Compact PWA iOS Banner */}
                            {showIOSInstallGuide && !localStorage.getItem('nfc_pwa_dismissed') && (
                                <div style={{ 
                                    background: '#FEF2F2', 
                                    padding: '12px 20px', 
                                    borderRadius: '16px', 
                                    color: '#991B1B', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    gap: '16px',
                                    boxShadow: '0 4px 12px rgba(239,68,68,0.05)',
                                    animation: 'fadeIn 0.4s ease-out',
                                    border: '1px solid #FEE2E2',
                                    fontSize: '13px'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        <div style={{ width: 18, height: 18, color: '#991B1B', display: 'flex', alignItems: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>` }} />
                                        <span>
                                            <strong>iPhone :</strong> Pour le partage hors-ligne, ajoutez NFCrafter à votre écran : appuyez sur <span style={{ background: '#FCA5A5', padding: '1px 4px', borderRadius: '4px', color: '#991B1B', fontWeight: 'bold' }}>⎋</span> (partage Safari) puis <strong>"Sur l'écran d'accueil"</strong>.
                                        </span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            localStorage.setItem('nfc_pwa_dismissed', 'true');
                                            setShowIOSInstallGuide(false);
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: '#991B1B', cursor: 'pointer', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap' }}
                                    >
                                        Déjà installé / Masquer
                                    </button>
                                </div>
                            )}

                            {/* Incomplete Profile Banner */}
                            {isProfileIncomplete && viewMode === 'view' && (
                                <div style={{ 
                                    background: '#FFFDF5', 
                                    padding: '24px 32px', 
                                    borderRadius: '24px', 
                                    color: '#B45309', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    gap: '24px',
                                    boxShadow: '0 10px 30px rgba(180,83,9,0.05)',
                                    animation: 'fadeIn 0.6s ease-out',
                                    flexWrap: 'wrap',
                                    border: '1px solid #FDE68A'
                                }}>
                                    <div style={{ flex: 1, minWidth: '280px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: 22, height: 22, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>` }} /> Configurez votre profil
                                        </h3>
                                        <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                                            Votre carte est active ! Ajoutez vos contacts et réseaux sociaux pour que vos futurs contacts puissent vous enregistrer en un clic.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (isOffline) {
                                                toast("Connexion Internet requise pour éditer votre profil.", "warning");
                                                return;
                                            }
                                            setViewMode('edit');
                                            setTimeout(() => {
                                                editorRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }}
                                        style={{ 
                                            background: '#B45309', 
                                            color: 'white', 
                                            padding: '12px 24px', 
                                            borderRadius: '14px', 
                                            border: 'none', 
                                            fontWeight: '800', 
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            boxShadow: '0 4px 12px rgba(180,83,9,0.2)',
                                            transition: 'transform 0.2s',
                                            whiteSpace: 'nowrap'
                                        }}
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                    >
                                        Compléter mon profil
                                    </button>
                                </div>
                            )}
                            {/* Link Box */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' }}>LIEN DU PROFIL</div>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#6366F1', wordBreak: 'break-all' }}>{publicUrl}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => window.open(publicUrl, '_blank')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <div style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>` }} /> Voir
                                        </button>
                                        <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: 'NFCrafter', url: publicUrl }); } catch (e) {} } else { window.open(`https://wa.me/?text=${encodeURIComponent(publicUrl)}`, '_blank'); } }} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#25D366', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <div style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>` }} /> Partager
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setIsOfflineModalOpen(true)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '16px 24px', 
                                            borderRadius: '18px', 
                                            background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', 
                                            color: 'white', 
                                            border: 'none', 
                                            fontWeight: '800', 
                                            cursor: 'pointer', 
                                            fontSize: '14px', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            gap: '10px',
                                            boxShadow: '0 8px 20px rgba(99,102,241,0.15)',
                                            marginTop: '8px',
                                            transition: 'transform 0.2s, box-shadow 0.2s'
                                        }}
                                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 25px rgba(26,18,101,0.25)'; }}
                                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(26,18,101,0.15)'; }}
                                    >
                                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="13" y2="16"></line></svg>` }} />
                                        Partage Hors-Ligne (vCard)
                                    </button>
                                </div>

                                <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' }}>Vues (Scans)</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#1A1265' }}>{scanCount}</div>
                                    </div>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12, color: '#0EA5E9' }}>
                                        <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>` }} />
                                    </div>
                                </div>
                            </div>

                            {/* Feedbacks Inbox */}
                            <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <h2 style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 20, height: 20, flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>` }} />
                                            Retours reçus
                                            {feedbacks.filter(f => !f.is_read).length > 0 && (
                                                <span style={{ background: '#EF4444', color: 'white', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 100 }}>
                                                    {feedbacks.filter(f => !f.is_read).length} nouveau{feedbacks.filter(f => !f.is_read).length > 1 ? 'x' : ''}
                                                </span>
                                            )}
                                        </h2>
                                        <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Messages privés envoyés par vos visiteurs</p>
                                    </div>
                                    {feedbacks.some(f => !f.is_read) && (
                                        <button
                                            onClick={async () => {
                                                await supabase.from('feedbacks').update({ is_read: true }).eq('card_id', selectedCardId);
                                                setFeedbacks(feedbacks.map(f => ({ ...f, is_read: true })));
                                                toast('Tous marqués comme lus', 'success');
                                            }}
                                            style={{ fontSize: 12, fontWeight: 700, color: '#1A1265', background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '8px 16px', cursor: 'pointer' }}
                                        >
                                            Tout marquer comme lu
                                        </button>
                                    )}
                                </div>

                                {feedbacksLoading ? (
                                    <div style={{ textAlign: 'center', padding: 30, color: '#94A3B8', fontSize: 14 }}>Chargement...</div>
                                ) : feedbacks.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', background: '#F9FAFB', borderRadius: 16, border: '1px dashed #E2E8F0' }}>
                                        <div style={{ width: 48, height: 48, margin: '0 auto 12px', color: '#CBD5E1' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>` }} />
                                        <div style={{ color: '#94A3B8', fontSize: 14, fontWeight: 600 }}>Aucun retour reçu pour l'instant</div>
                                        <div style={{ color: '#CBD5E1', fontSize: 13, marginTop: 4 }}>Activez le formulaire dans "Retours clients" pour en recevoir.</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {feedbacks.map(fb => (
                                            <div key={fb.id} style={{ padding: '16px 20px', background: fb.is_read ? '#F9FAFB' : '#EFF6FF', borderRadius: 16, border: fb.is_read ? '1px solid #E2E8F0' : '1px solid #BFDBFE', position: 'relative' }}>
                                                {!fb.is_read && <div style={{ position: 'absolute', top: 16, right: 16, width: 8, height: 8, borderRadius: '50%', background: '#3B82F6' }} />}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                                    <div style={{ fontWeight: 800, fontSize: 14, color: '#1A1265' }}>{fb.name}</div>
                                                    <div style={{ color: '#F59E0B', fontSize: 13 }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</div>
                                                    <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8' }}>{new Date(fb.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                                <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.5 }}>{fb.message}</p>
                                                {!fb.is_read && (
                                                    <button
                                                        onClick={async () => {
                                                            await supabase.from('feedbacks').update({ is_read: true }).eq('id', fb.id);
                                                            setFeedbacks(feedbacks.map(f => f.id === fb.id ? { ...f, is_read: true } : f));
                                                        }}
                                                        style={{ marginTop: 10, fontSize: 11, fontWeight: 700, color: '#6366F1', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                                    >
                                                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` }} />
                                                        Marquer comme lu
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Editor */}
                            <div ref={editorRef} className="editor-card" style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
                                    <div>
                                        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265', margin: '0 0 8px 0' }}>Configuration</h2>
                                        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Personnalisez l'apparence de votre profil.</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if (viewMode === 'view' && isOffline) {
                                                toast("Connexion Internet requise pour éditer votre profil.", "warning");
                                                return;
                                            }
                                            setViewMode(viewMode === 'view' ? 'edit' : 'view');
                                        }} 
                                        style={{ padding: '12px 28px', borderRadius: '16px', background: viewMode === 'edit' ? '#F1F5F9' : 'var(--primary)', color: viewMode === 'edit' ? 'var(--primary)' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}
                                    >
                                        {viewMode === 'edit' ? (
                                            <>Annuler</>
                                        ) : (
                                            <>
                                                <div style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>` }} /> Modifier le profil
                                            </>
                                        )}
                                    </button>
                                </div>

                                {viewMode === 'edit' ? (
                                    <div className="animate-fade-in">
                                        <ProfileForm 
                                            profile={publicProfile} 
                                            setProfile={setPublicProfile} 
                                            onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)} 
                                            onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)} 
                                            onUploadProductImage={handleProductImageUpload}
                                            onUploadGalleryImage={handleGalleryImageUpload}
                                            uploadingAvatar={uploadingAvatar} 
                                            uploadingBanner={uploadingBanner} 
                                            uploadingProduct={uploadingProduct}
                                            toast={toast} 
                                        />
                                        <button onClick={savePublicProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '20px', marginTop: '40px', background: 'var(--primary)', fontSize: '16px', boxShadow: '0 10px 20px rgba(26,18,101,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                            {saving ? 'Enregistrement...' : (
                                                <>
                                                    <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>` }} />
                                                    Enregistrer les modifications
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 0', background: '#F9FAFB', borderRadius: '28px', border: '2px dashed #E2E8F0' }}>
                                        <div style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', color: '#6366F1' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>` }} />
                                        <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '24px' }}>Votre profil est en ligne et prêt à être partagé.</p>
                                        <button 
                                            onClick={() => {
                                                if (isOffline) {
                                                    toast("Connexion Internet requise pour éditer vos informations.", "warning");
                                                    return;
                                                }
                                                setViewMode('edit');
                                            }} 
                                            style={{ background: 'white', color: '#1A1265', border: '1px solid #E2E8F0', padding: '14px 32px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                                        >
                                            <div style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>` }} /> Éditer les informations
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* iPhone Preview Column (Desktop) */}
                        <div className="desktop-preview" style={{ position: 'sticky', top: '40px', alignSelf: 'start', height: 'fit-content' }}>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Aperçu en direct</span>
                            </div>
                            <DashboardPhonePreview profile={publicProfile} isDark={isDark} textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                        </div>
                    </div>
                )}

                {/* Mobile Preview Overlay */}
                {showMobilePreview && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(255, 255, 255, 0.98)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(16px)', padding: '20px', touchAction: 'none' }}>
                        <button onClick={() => setShowMobilePreview(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: '#F1F5F9', color: '#1E293B', border: 'none', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', fontWeight: '900', cursor: 'pointer', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>✕</button>
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'center', pointerEvents: 'auto', touchAction: 'auto' }}>
                            <DashboardPhonePreview profile={publicProfile} isDark={isDark} textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                        </div>
                    </div>
                )}

                {/* Mobile Floating Preview Button */}
                {userCards.length > 0 && (
                    <button 
                        onClick={() => setShowMobilePreview(true)} 
                        className="mobile-preview-btn"
                        style={{ 
                            position: 'fixed', bottom: '24px', right: '24px', 
                            background: 'rgba(255, 255, 255, 0.95)', 
                            backdropFilter: 'blur(16px)',
                            color: '#1A1265', 
                            border: '1px solid rgba(26, 18, 101, 0.2)', 
                            padding: '12px 24px', borderRadius: '30px', 
                            boxShadow: '0 12px 24px rgba(0,0,0,0.12)', 
                            zIndex: 900, cursor: 'pointer', fontSize: '14px',
                            fontWeight: '800', display: 'none', alignItems: 'center', gap: '10px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        <div style={{ width: '18px', height: '18px' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>` }} /> 
                        <span>Aperçu</span>
                    </button>
                )}

                {/* Modal de Partage Hors-Ligne */}
                <Modal
                    isOpen={isOfflineModalOpen}
                    title="Partage Hors-Ligne"
                    onClose={() => setIsOfflineModalOpen(false)}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                        <p style={{ fontSize: '14px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                            Faites scanner ce code pour ajouter vos coordonnées et liens directement dans les contacts de votre interlocuteur sans connexion Internet.
                        </p>
                        
                        {/* Conteneur du QR code */}
                        <div 
                            ref={offlineQrRef} 
                            style={{ 
                                background: '#FFFFFF', 
                                padding: '12px', 
                                borderRadius: '20px', 
                                boxShadow: '0 10px 35px rgba(26,18,101,0.06)',
                                border: '1px solid #EEF2FF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '304px',
                                height: '304px'
                            }} 
                        />
                        
                        <div style={{ 
                            background: '#F0FDF4', 
                            border: '1px solid #BBF7D0', 
                            color: '#15803D', 
                            padding: '5px 12px', 
                            borderRadius: '100px', 
                            fontSize: '11px', 
                            fontWeight: '700', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '6px',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(21, 128, 61, 0.04)'
                        }}>
                            <div style={{ width: 12, height: 12, color: '#15803D', display: 'flex', alignItems: 'center' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>` }} />
                            <span>Fonctionne 100% sans connexion internet</span>
                        </div>
                    </div>
                </Modal>
            </main>

            <style>{`
                .loader { width: 32px; height: 32px; border: 3px solid #EEF2FF; border-top-color: #1A1265; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                html, body { overflow-x: hidden !important; max-width: 100vw !important; }

                @media (max-width: 1100px) {
                    .dashboard-grid { grid-template-columns: 1fr !important; }
                    .desktop-preview { display: none !important; }
                    .mobile-preview-btn { display: flex !important; align-items: center; justify-content: center; }
                }

                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); }
                    .sidebar.open { transform: translateX(0); }
                    .main-content { margin-left: 0 !important; padding: 20px !important; margin-top: 70px !important; overflow-x: hidden !important; max-width: 100vw !important; }
                    .mobile-header { display: flex !important; }
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
                    .editor-card { padding: 20px !important; }
                }
            `}</style>
        </div>
    );
}

function DashboardPhonePreview({ profile, isDark, textColor, subTextColor, cardBg }) {
    return (
        <PhonePreview>
            <div style={{ 
                background: profile.backgroundColor || '#f0f2f5', 
                minHeight: '100%',
                color: textColor,
                fontFamily: "'Inter', sans-serif"
            }}>
                {/* Status bar logic for preview */}
                {(() => {
                    const getOpenStatus = () => {
                        if (!profile?.business_hours || !profile?.show_hours) return null;
                        const now = new Date();
                        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
                        const currentDay = dayNames[now.getDay()];
                        const config = profile.business_hours[currentDay];
                        if (!config || !config.active) return { text: 'Fermé', color: '#EF4444' };
                        const [hOpen, mOpen] = config.open.split(':').map(Number);
                        const [hClose, mClose] = config.close.split(':').map(Number);
                        const nowMin = now.getHours() * 60 + now.getMinutes();
                        if (nowMin >= (hOpen * 60 + mOpen) && nowMin <= (hClose * 60 + mClose)) return { text: 'Ouvert', color: '#10B981' };
                        return { text: 'Fermé', color: '#EF4444' };
                    };
                    const status = getOpenStatus();
                    return null; // Just for logic, render below
                })()}

                {/* Banner */}
                <div style={{ height: 110, background: profile.primaryColor || '#1A1265', overflow: 'hidden', position: 'relative' }}>
                    {profile.banner_url && <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                </div>
                
                <div style={{ padding: '0 16px 24px' }}>
                    {/* Avatar */}
                    <div style={{ 
                        width: 72, height: 72, borderRadius: 16, 
                        border: isDark ? '3px solid rgba(255,255,255,0.1)' : '3px solid white', 
                        background: '#EEF2FF', marginTop: -36, overflow: 'hidden', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 
                    }}>
                        {profile.photo_url ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', padding: 20 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` }} />}
                    </div>

                    <h3 style={{ marginTop: 12, fontWeight: 800, color: textColor, fontSize: 18, marginBottom: 2 }}>{profile.full_name || 'Votre Nom'}</h3>
                    {profile.job_title && <p style={{ fontSize: 12, color: profile.primaryColor, fontWeight: 700, marginBottom: 12 }}>{profile.job_title}</p>}
                    
                    <button style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, background: profile.primaryColor || '#1A1265', color: 'white', border: 'none', fontWeight: 700, fontSize: 13 }}>Enregistrer le contact</button>
                    
                    {profile.bio && (
                        <div key="bio" style={{ 
                            padding: 12, borderRadius: 14, fontSize: 12, lineHeight: 1.6,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.02)',
                            color: textColor,
                            marginTop: 12
                        }}>
                            {profile.bio.split('\n')[0].substring(0, 80)}...
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                        {(profile.section_order || ['contact_buttons', 'links', 'products', 'business_info']).filter(s => s !== 'bio').map(sectionId => {
                            if (sectionId === 'contact_buttons' && (profile.phone || profile.email)) {
                                return (
                                    <div key="contact_buttons" style={{ display: 'flex', gap: 8 }}>
                                        <div style={{ flex: 1, height: 40, background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, gap: '6px', color: textColor }}><div style={{ width: 14, height: 14, color: profile.primaryColor }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>` }} /> Appeler</div>
                                        <div style={{ flex: 1, height: 40, background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, gap: '6px', color: textColor }}><div style={{ width: 14, height: 14, color: profile.primaryColor }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>` }} /> Email</div>
                                    </div>
                                );
                            }
                            if (sectionId === 'links') {
                                const activeLinks = SOCIAL_NETWORKS.filter(s => {
                                    if (s.id === 'phone' || s.id === 'email') return false;
                                    const val = profile?.[s.id] || profile?.socials?.[s.id];
                                    if (!val) return false;
                                    if (typeof val === 'object') return !!val.value;
                                    return typeof val === 'string' && val.trim().length > 0;
                                });
                                const activeCustomLinks = (profile.customLinks || []).filter(l => l.url);

                                return (
                                    <div key="links" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {activeLinks.map(link => {
                                            const rawValue = profile[link.id] || profile?.socials?.[link.id];
                                            const linkValue = (typeof rawValue === 'object' && rawValue !== null) ? rawValue.value : rawValue;
                                            const subText = (typeof rawValue === 'object' && rawValue !== null) ? rawValue.subtitle : '';
                                            return (
                                                <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: cardBg, borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: link.id === 'snapchat' ? link.color : (isDark ? 'rgba(255,255,255,0.05)' : link.color + '15'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: `<div style="width:16px;height:16px;color:${link.id === 'snapchat' ? '#000' : (link.iconColor || link.color)}">${link.svg}</div>` }} />
                                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                                        <div style={{ fontWeight: 700, fontSize: 13, color: textColor }}>{link.label}</div>
                                                        {subText && <div style={{ fontSize: 10, color: subTextColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{subText}</div>}
                                                    </div>
                                                    <span style={{ color: '#CBD5E1', fontSize: 14 }}>→</span>
                                                </div>
                                            );
                                        })}
                                        {activeCustomLinks.map((link, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: cardBg, borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 10, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 6 }}>
                                                    <div style={{ width: '100%', height: '100%', color: profile.primaryColor || '#1A1265' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === link.iconId || i.emoji === link.emoji)?.svg || LINK_ICONS[0].svg }} />
                                                </div>
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <div style={{ fontWeight: 700, fontSize: 13, color: textColor }}>{link.label || link.title || 'Lien'}</div>
                                                </div>
                                                <span style={{ color: '#CBD5E1', fontSize: 14 }}>→</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            }
                            if (sectionId === 'products' && profile.show_products && profile.products?.length > 0) {
                                return (
                                    <div key="products" style={{ background: cardBg, borderRadius: 20, padding: 15, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <div style={{ width: 24, height: 24, borderRadius: 6, background: (profile.primaryColor || '#1A1265') + '15', color: profile.primaryColor || '#1A1265', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                                            </div>
                                            <span style={{ fontSize: 13, fontWeight: 800, color: textColor }}>{profile.section_titles?.products || 'Boutique'}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {profile.products.slice(0, 3).map(p => (
                                                <div key={p.id} style={{ display: 'flex', gap: 10, alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 8, borderRadius: 12, border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F1F5F9' }}>
                                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: '#DDD', overflow: 'hidden', flexShrink: 0 }}>
                                                        {p.image_url && <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    </div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: textColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                        <div style={{ fontSize: 10, color: profile.primaryColor || '#1A1265', fontWeight: 800 }}>{p.price}</div>
                                                    </div>
                                                    <div style={{ background: p.action_type === 'link' ? (profile.primaryColor || '#1A1265') : '#25D366', color: 'white', padding: '5px 8px', borderRadius: 8, fontSize: 8, fontWeight: 800, whiteSpace: 'nowrap', maxWidth: 65, overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                                                        {p.button_text || (p.action_type === 'link' ? 'Voir' : 'Commander')}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }
                            if (sectionId === 'business_info' && (profile.show_location || profile.show_hours)) {
                                return (
                                    <div key="business" style={{ background: cardBg, borderRadius: 20, padding: 15, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                                        {profile.show_location && profile.location_address && (
                                            <div style={{ marginBottom: profile.show_hours ? 12 : 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                    <div style={{ width: 20, height: 20, color: profile.primaryColor || '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>` }} />
                                                    <span style={{ fontSize: 12, fontWeight: 800, color: textColor }}>{profile.section_titles?.business_info_find || 'Nous trouver'}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: subTextColor, background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', padding: 8, borderRadius: 10 }}>{profile.location_address}</div>
                                            </div>
                                        )}
                                        {profile.show_hours && (
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                                    <div style={{ width: 20, height: 20, color: profile.primaryColor || '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` }} />
                                                    <span style={{ fontSize: 12, fontWeight: 800, color: textColor }}>{profile.section_titles?.business_info_hours || 'Horaires'}</span>
                                                </div>
                                                <div style={{ fontSize: 11, color: subTextColor, display: 'flex', justifyContent: 'space-between' }}>
                                                    <span>Aujourd'hui</span>
                                                    <span style={{ fontWeight: 700, color: '#10B981' }}>Ouvert</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            </div>
        </PhonePreview>
    );
}