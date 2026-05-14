// src/pages/client/ClientDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';
import PhonePreview from '../../components/PhonePreview.jsx';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../../constants/socials.js';

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
    const [scanCount, setScanCount] = useState(0);
    const [showMobilePreview, setShowMobilePreview] = useState(false);
    const [renamingCardId, setRenamingCardId] = useState(null);
    const [newName, setNewName] = useState('');
    
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
            const { data: authData, error: authError } = await supabase.auth.getUser();
            if (authError || !authData?.user) { navigate('/login'); return; }
            const authUser = authData.user;
            setUser(authUser);

            // Fetch cards where owner_id is the user — only source of truth
            const { data: ownedCards, error: ownedError } = await supabase
                .from('cards')
                .select('*')
                .eq('owner_id', authUser.id)
                .order('created_at', { ascending: false });

            // Don't throw on error — just use empty array and show empty state
            const finalCards = ownedError ? [] : (ownedCards || []);
            if (ownedError) console.warn("Cards fetch warning:", ownedError.message);

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

                // Update scan count when card changes
                supabase
                    .from('scan_logs')
                    .select('*', { count: 'exact', head: true })
                    .eq('card_id', selectedCardId)
                    .then(({ count }) => setScanCount(count || 0));

                setViewMode('view');
                setIsMobileMenuOpen(false);
            }
        }
    }, [selectedCardId]);

    function handleWhatsAppOrder() {
        const message = `Bonjour NFCrafter ! Je souhaite commander une carte NFC personnalisée. Mon email : ${user?.email}`;
        window.open(`https://wa.me/22969473921?text=${encodeURIComponent(message)}`, '_blank');
    }
    
    async function handleRenameCard(e, cardId) {
        e.stopPropagation();
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

    async function uploadFile(file, bucket, onUrl, setUploading) {
        const isFunc = typeof setUploading === 'function';
        if (isFunc) setUploading(true);
        try {
            // Check if bucket is pdfs, if not default to banners/avatars
            const targetBucket = bucket || 'banners';
            const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
            
            const { error: uploadError } = await supabase.storage
                .from(targetBucket)
                .upload(fileName, file, {
                    contentType: file.type, // Explicitly set content type
                    upsert: true
                });

            if (uploadError) throw uploadError;
            
            const { data: { publicUrl } } = supabase.storage.from(targetBucket).getPublicUrl(fileName);
            onUrl(publicUrl);
            toast('Fichier téléchargé !', 'success');
        } catch (e) { 
            console.error('Upload error:', e);
            toast('Erreur upload : ' + e.message, 'error'); 
        }
        finally { if (isFunc) setUploading(false); }
    }

    const downloadQR = () => {
        import('qr-code-styling').then(QRCodeStyling => {
            const qrCode = new QRCodeStyling.default({
                width: 1000,
                height: 1000,
                data: `${window.location.origin}/u/${selectedCardId}`,
                dotsOptions: { color: "#1A1265", type: "rounded" },
                cornersSquareOptions: { color: "#1A1265", type: "extra-rounded" },
                backgroundOptions: { color: "#FFFFFF" }
            });
            qrCode.download({ name: `nfcrafter-qr-${selectedCardId}`, extension: "png" });
        });
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
            <div className="loader" style={{ width: 40, height: 40, border: '4px solid #EEF2FF', borderTopColor: '#1A1265', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    const publicUrl = selectedCardId ? `${window.location.origin}/u/${selectedCardId}` : '';

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

    const editorRef = useRef(null);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', maxWidth: '100vw', overflowX: 'hidden' }}>
            
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

                <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
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


                </div>

                <div style={{ padding: '24px', background: '#F8FAFC' }}>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'white', color: '#EF4444', border: '1px solid #FEE2E2', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }}>Déconnexion</button>
                </div>
            </aside>

            {/* Main Content (Right) */}
            <main className="main-content" style={{ flex: 1, marginLeft: '280px', padding: '40px' }}>
                {userCards.length === 0 ? (
                    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '80px', height: '80px', margin: '0 auto 24px auto', color: '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"></path><path d="M10 12h.01"></path><path d="M16 2v2"></path><path d="M6 2v2"></path></svg>` }} />
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Bienvenue</h1>
                        <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>Vous n'avez pas encore de profil actif. Cliquez ci-dessous pour commander votre premier profil digital.</p>
                        <button onClick={() => handleWhatsAppOrder()} className="btn-primary" style={{ padding: '16px 40px', borderRadius: '100px', background: '#25D366', border: 'none' }}>🚀 Commander ma carte</button>
                    </div>
                ) : (
                    <div className="dashboard-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            
                            {/* Incomplete Profile Banner */}
                            {isProfileIncomplete && viewMode === 'view' && (
                                <div style={{ 
                                    background: 'linear-gradient(135deg, #1A1265 0%, #3B82F6 100%)', 
                                    padding: '24px 32px', 
                                    borderRadius: '24px', 
                                    color: 'white', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'space-between', 
                                    gap: '24px',
                                    boxShadow: '0 20px 40px rgba(26,18,101,0.15)',
                                    animation: 'fadeIn 0.6s ease-out',
                                    flexWrap: 'wrap'
                                }}>
                                    <div style={{ flex: 1, minWidth: '280px' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '24px' }}>✨</span> Configurez votre profil
                                        </h3>
                                        <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                                            Votre carte est active ! Ajoutez vos contacts et réseaux sociaux pour que vos futurs contacts puissent vous enregistrer en un clic.
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setViewMode('edit');
                                            setTimeout(() => {
                                                editorRef.current?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }}
                                        style={{ 
                                            background: 'white', 
                                            color: '#1A1265', 
                                            padding: '12px 24px', 
                                            borderRadius: '14px', 
                                            border: 'none', 
                                            fontWeight: '800', 
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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

                            {/* Banner - Physical Card */}
                            <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', padding: '30px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 20px 40px rgba(79,70,229,0.15)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        Carte Physique <div style={{ width: 20, height: 20 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>` }} />
                                    </h3>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.5', maxWidth: '300px' }}>Commandez votre carte NFC premium personnalisée.</p>
                                </div>
                                <button onClick={() => window.open(`https://wa.me/22969473921?text=${encodeURIComponent('Commande carte : ' + publicUrl)}`, '_blank')} style={{ background: 'white', color: '#4F46E5', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>Commander</button>
                            </div>

                            {/* Editor */}
                            <div ref={editorRef} style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
                                    <div>
                                        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265', margin: '0 0 8px 0' }}>Configuration</h2>
                                        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Personnalisez l'apparence de votre profil.</p>
                                    </div>
                                    <button onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')} style={{ padding: '12px 28px', borderRadius: '16px', background: viewMode === 'edit' ? '#F1F5F9' : '#1A1265', color: viewMode === 'edit' ? '#1A1265' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
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
                                            uploadingAvatar={uploadingAvatar} 
                                            uploadingBanner={uploadingBanner} 
                                            toast={toast} 
                                        />
                                        <button onClick={savePublicProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '18px', borderRadius: '20px', marginTop: '40px', background: '#1A1265', fontSize: '16px', boxShadow: '0 10px 20px rgba(26,18,101,0.15)' }}>
                                            {saving ? 'Enregistrement...' : '✅ Enregistrer les modifications'}
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '60px 0', background: '#F8FAFC', borderRadius: '28px', border: '2px dashed #E2E8F0' }}>
                                        <div style={{ width: '48px', height: '48px', margin: '0 auto 16px auto', color: '#6366F1' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>` }} />
                                        <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '24px' }}>Votre profil est en ligne et prêt à être partagé.</p>
                                        <button onClick={() => setViewMode('edit')} style={{ background: 'white', color: '#1A1265', border: '1px solid #E2E8F0', padding: '14px 32px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: 16, height: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>` }} /> Éditer les informations
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* iPhone Preview Column (Desktop) */}
                        <div className="desktop-preview" style={{ position: 'sticky', top: '100px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Aperçu en direct</span>
                            </div>
                            <DashboardPhonePreview profile={publicProfile} isDark={isDark} textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                        </div>
                    </div>
                )}

                {/* Mobile Preview Overlay */}
                {showMobilePreview && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px', touchAction: 'none' }}>
                        <button onClick={() => setShowMobilePreview(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', fontWeight: '900', cursor: 'pointer', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>✕</button>
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
            </main>

            <style>{`
                .loader { width: 32px; height: 32px; border: 3px solid #EEF2FF; border-top-color: #1A1265; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                @media (max-width: 1100px) {
                    .dashboard-grid { grid-template-columns: 1fr !important; }
                    .desktop-preview { display: none !important; }
                    .mobile-preview-btn { display: flex !important; align-items: center; justify-content: center; }
                }

                @media (max-width: 768px) {
                    .sidebar { transform: translateX(-100%); }
                    .sidebar.open { transform: translateX(0); }
                    .main-content { marginLeft: 0 !important; padding: 20px !important; marginTop: 70px !important; }
                    .mobile-header { display: flex !important; }
                    .desktop-only { display: none !important; }
                    .mobile-only { display: flex !important; }
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
                    
                    {/* Bio Magazine Style Preview */}
                    {profile.bio && (
                        <div style={{ 
                            marginTop: 12, padding: 12, borderRadius: 14, fontSize: 12, lineHeight: 1.6,
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.02)',
                            color: textColor
                        }}>
                            {profile.bio.split('\n')[0].substring(0, 80)}...
                        </div>
                    )}

                    <button style={{ width: '100%', marginTop: 16, padding: '12px', borderRadius: 12, background: profile.primaryColor || '#1A1265', color: 'white', border: 'none', fontWeight: 700, fontSize: 13 }}>Enregistrer le contact</button>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
                        {(profile.phone || profile.email) && (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <div style={{ flex: 1, height: 40, background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, gap: '6px', color: textColor }}><div style={{ width: 14, height: 14, color: profile.primaryColor }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>` }} /> Appeler</div>
                                <div style={{ flex: 1, height: 40, background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, gap: '6px', color: textColor }}><div style={{ width: 14, height: 14, color: profile.primaryColor }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>` }} /> Email</div>
                            </div>
                        )}
                        
                        {Object.keys(profile.socials || {}).map(key => {
                            const net = SOCIAL_NETWORKS.find(n => n.id === key);
                            if (!net || !profile.socials[key]?.value) return null;
                            return (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: cardBg, borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: net.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <div style={{ width: 16, height: 16, color: net.iconColor || net.color }} dangerouslySetInnerHTML={{ __html: net.svg }} />
                                    </div>
                                    <div style={{ flex: 1, fontWeight: 700, fontSize: 13, color: textColor }}>{net.label}</div>
                                    <span style={{ color: '#CBD5E1', fontSize: 14 }}>→</span>
                                </div>
                            );
                        })}

                        {(profile.customLinks || []).map((link, i) => {
                            if (!link.url) return null;
                            return (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: cardBg, borderRadius: 14, border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{link.emoji || '🔗'}</div>
                                    <div style={{ flex: 1, fontWeight: 700, fontSize: 13, color: textColor }}>{link.label || 'Lien'}</div>
                                    <span style={{ color: '#CBD5E1', fontSize: 14 }}>→</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </PhonePreview>
    );
}