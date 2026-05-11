// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';
import PhonePreview from '../../components/PhonePreview.jsx';
import { SOCIAL_NETWORKS } from '../../constants/socials.js';

export default function ClientDashboard() {
    const navigate = useNavigate();
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

    const [publicProfile, setPublicProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265',
        socials: {}, customLinks: [], url: '', qr_type: 'profile'
    });

    useEffect(() => { loadUserData(); }, []);

    async function loadUserData() {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { navigate('/login'); return; }
        setUser(authUser);

        const { data: cards } = await supabase
            .from('cards')
            .select('*')
            .eq('owner_id', authUser.id)
            .order('created_at', { ascending: true });

        setUserCards(cards || []);
        
        if (cards?.length > 0) {
            const currentId = selectedCardId || cards[0].card_id;
            const card = cards.find(c => c.card_id === currentId) || cards[0];
            setSelectedCardId(card.card_id);
            setPublicProfile({
                banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
                phone: '', email: '', primaryColor: '#1A1265',
                socials: {}, customLinks: [], url: '', qr_type: 'profile',
                ...(card.admin_profile || {})
            });

            // Load scan count
            const { count } = await supabase
                .from('scan_logs')
                .select('*', { count: 'exact', head: true })
                .eq('card_id', card.card_id);
            setScanCount(count || 0);
        }
        setLoading(false);
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

    function handleWhatsAppOrder(isNew = false) {
        const message = isNew 
            ? `Bonjour NFCrafter ! Je souhaite créer un NOUVEAU profil digital (5.000f). Mon email : ${user?.email}`
            : `Bonjour NFCrafter ! Je souhaite ACTIVER mon premier profil digital (5.000f). Mon email : ${user?.email}`;
        window.open(`https://wa.me/22969473921?text=${encodeURIComponent(message)}`, '_blank');
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

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;

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

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            
            {/* Header Mobile Only */}
            <div className="mobile-header" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '70px', background: 'white', borderBottom: '1px solid #E2E8F0', zIndex: 100, display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '24px' }} />
                    <span style={{ fontWeight: '900', color: '#1A1265' }}>NFCrafter</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '800', fontSize: '13px' }}>
                    Menu
                </button>
            </div>

            {/* Overlay Mobile */}
            {isMobileMenuOpen && (
                <div onClick={() => setIsMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 190, backdropFilter: 'blur(4px)' }} />
            )}

            {/* Sidebar (Left) */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '300px', background: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 200, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: '10px 0 30px rgba(0,0,0,0.02)' }}>
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
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px', paddingLeft: '16px', letterSpacing: '1.5px' }}>Tableau de bord</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {userCards.map(card => (
                            <button key={card.card_id} onClick={() => setSelectedCardId(card.card_id)} style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: 'none', textAlign: 'left', cursor: 'pointer', background: selectedCardId === card.card_id ? '#F5F3FF' : 'transparent', color: selectedCardId === card.card_id ? '#7C3AED' : '#64748B', fontWeight: '700', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
                                {selectedCardId === card.card_id && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: '#7C3AED', borderRadius: '0 4px 4px 0' }} />}
                                <span style={{ fontSize: '18px', opacity: selectedCardId === card.card_id ? 1 : 0.6 }}>{selectedCardId === card.card_id ? '💎' : '👤'}</span> 
                                <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.card_name || 'Mon Profil'}</span>
                            </button>
                        ))}
                    </div>

                    <button onClick={() => handleWhatsAppOrder(true)} style={{ width: 'calc(100% - 32px)', margin: '24px 16px', padding: '16px', borderRadius: '16px', border: '2px dashed #E2E8F0', background: 'transparent', color: '#64748B', fontWeight: '800', cursor: 'pointer', fontSize: '13px', transition: '0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#1A1265'} onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'}>
                        + Ajouter un profil (5000f)
                    </button>
                </div>

                <div style={{ padding: '24px', background: '#F8FAFC' }}>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'white', color: '#EF4444', border: '1px solid #FEE2E2', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }}>Déconnexion</button>
                </div>
            </aside>

            {/* Main Content (Right) */}
            <main className="main-content" style={{ flex: 1, marginLeft: '280px', padding: '40px' }}>
                {userCards.length === 0 ? (
                    <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>👋</div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Bienvenue</h1>
                        <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>Vous n'avez pas encore de profil actif. Cliquez ci-dessous pour commander votre premier profil digital.</p>
                        <button onClick={() => handleWhatsAppOrder(false)} className="btn-primary" style={{ padding: '16px 40px', borderRadius: '100px', background: '#25D366', border: 'none' }}>🚀 Activer mon profil (2000f)</button>
                    </div>
                ) : (
                    <div className="dashboard-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px', alignItems: 'start' }}>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Link Box */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                                <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' }}>LIEN DU PROFIL</div>
                                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#6366F1', wordBreak: 'break-all' }}>{publicUrl}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => window.open(publicUrl, '_blank')} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>👁️ Voir</button>
                                        <button onClick={async () => { if (navigator.share) { try { await navigator.share({ title: 'NFCrafter', url: publicUrl }); } catch (e) {} } else { window.open(`https://wa.me/?text=${encodeURIComponent(publicUrl)}`, '_blank'); } }} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#25D366', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>📲 Partager</button>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' }}>Vues (Scans)</div>
                                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#1A1265' }}>{scanCount}</div>
                                    </div>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F0F9FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>📊</div>
                                </div>
                            </div>

                            {/* Banner - Physical Card */}
                            <div style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', padding: '30px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 20px 40px rgba(79,70,229,0.15)', position: 'relative', overflow: 'hidden' }}>
                                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '8px', color: 'white' }}>Carte Physique 💳</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', lineHeight: '1.5', maxWidth: '300px' }}>Commandez votre carte NFC premium personnalisée.</p>
                                </div>
                                <button onClick={() => window.open(`https://wa.me/22969473921?text=${encodeURIComponent('Commande carte : ' + publicUrl)}`, '_blank')} style={{ background: 'white', color: '#4F46E5', border: 'none', padding: '12px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', fontSize: '13px' }}>Commander</button>
                            </div>

                            {/* Editor */}
                            <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '16px', flexWrap: 'wrap' }}>
                                    <div>
                                        <h2 style={{ fontSize: '26px', fontWeight: '900', color: '#1A1265', margin: '0 0 8px 0' }}>Configuration</h2>
                                        <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Personnalisez l'apparence de votre profil.</p>
                                    </div>
                                    <button onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')} style={{ padding: '12px 28px', borderRadius: '16px', background: viewMode === 'edit' ? '#F1F5F9' : '#1A1265', color: viewMode === 'edit' ? '#1A1265' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }}>
                                        {viewMode === 'edit' ? 'Annuler' : '✏️ Modifier le profil'}
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
                                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
                                        <p style={{ color: '#64748B', fontWeight: '500', marginBottom: '24px' }}>Votre profil est en ligne et prêt à être partagé.</p>
                                        <button onClick={() => setViewMode('edit')} style={{ background: 'white', color: '#1A1265', border: '1px solid #E2E8F0', padding: '14px 32px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>✏️ Éditer les informations</button>
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
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
                        <button onClick={() => setShowMobilePreview(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', fontWeight: '900', cursor: 'pointer', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>✕</button>
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
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
                            background: '#1A1265', color: 'white', border: 'none', 
                            padding: '12px 24px', borderRadius: '30px', 
                            boxShadow: '0 10px 25px rgba(26,18,101,0.4)', 
                            zIndex: 900, cursor: 'pointer', fontSize: '14px',
                            fontWeight: '800', display: 'none', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>📱</span> Aperçu en direct
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

                @media (max-width: 968px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: block !important; }
                    .mobile-header { display: flex !important; }
                    .sidebar { transform: translateX(-100%); }
                    .sidebar.open { transform: translateX(0); }
                    .main-content { margin-left: 0 !important; padding: 100px 20px 40px !important; }
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
                        {profile.photo_url ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <span style={{fontSize: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>👤</span>}
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
                                {profile.phone && <div style={{ flex: 1, height: 40, background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>📞 Appeler</div>}
                                {profile.email && <div style={{ flex: 1, height: 40, background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>✉️ Email</div>}
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