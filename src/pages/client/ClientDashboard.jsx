// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';

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

    const [publicProfile, setPublicProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265',
        socials: {}, customLinks: [], url: '', qr_type: 'profile',
        isDark: false, pdf_url: ''
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
                isDark: false, pdf_url: '',
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
                    isDark: false, pdf_url: '',
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
            const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            onUrl(publicUrl);
        } catch (e) { toast(e.message, 'error'); }
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
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{ width: '280px', background: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh', zIndex: 200, transition: 'transform 0.3s ease' }}>
                <div style={{ padding: '32px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '900', fontSize: '18px', color: '#1A1265' }}>NFCrafter</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="mobile-only" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Mes Profils</div>
                    {userCards.map(card => (
                        <button key={card.card_id} onClick={() => setSelectedCardId(card.card_id)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', textAlign: 'left', marginBottom: '8px', cursor: 'pointer', background: selectedCardId === card.card_id ? '#1A1265' : 'transparent', color: selectedCardId === card.card_id ? 'white' : '#475569', fontWeight: '700', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span>👤</span> {card.card_name || 'Sans titre'}
                        </button>
                    ))}
                    <button onClick={() => handleWhatsAppOrder(true)} style={{ width: '100%', marginTop: '24px', padding: '14px', borderRadius: '12px', border: '2px dashed #25D366', background: 'white', color: '#128C7E', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                        + Nouveau Profil (2000f)
                    </button>
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Déconnexion</button>
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
                    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
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

                            <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase' }}>Votre QR Code</div>
                                    <button onClick={downloadQR} style={{ background: '#F1F5F9', border: 'none', padding: '8px 16px', borderRadius: '10px', color: '#475569', fontWeight: '800', cursor: 'pointer', fontSize: '12px', marginTop: '4px' }}>📥 Télécharger PNG</button>
                                </div>
                                <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', border: '1px solid #E2E8F0' }}>🔳</div>
                            </div>
                        </div>

                        {/* Banner */}
                        <div style={{ background: 'linear-gradient(135deg, #1A1265 0%, #312E81 100%)', color: 'white', padding: '32px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', boxShadow: '0 10px 30px rgba(26,18,101,0.2)' }}>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Carte physique 💳</h3>
                                <p style={{ opacity: 0.8, fontSize: '14px' }}>Matérialisez votre profil avec une carte NFCrafter.</p>
                            </div>
                            <button onClick={() => window.open(`https://wa.me/22969473921?text=${encodeURIComponent('Commande carte : ' + publicUrl)}`, '_blank')} style={{ background: 'white', color: '#1A1265', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,255,255,0.2)' }}>Commander</button>
                        </div>

                        {/* Editor */}
                        <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1A1265', margin: 0 }}>Personnaliser le profil</h2>
                                <button onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')} style={{ padding: '10px 20px', borderRadius: '12px', background: viewMode === 'edit' ? '#F1F5F9' : '#1A1265', color: viewMode === 'edit' ? '#1A1265' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}>{viewMode === 'edit' ? 'Annuler' : '✏️ Modifier'}</button>
                            </div>

                            {viewMode === 'edit' ? (
                                <div className="animate-fade-in">
                                    <ProfileForm profile={publicProfile} setProfile={setPublicProfile} onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)} onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)} uploadingAvatar={uploadingAvatar} uploadingBanner={uploadingBanner} toast={toast} />
                                    <button onClick={savePublicProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px', marginTop: '32px' }}>{saving ? '...' : '✅ Enregistrer'}</button>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', background: '#F8FAFC', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                                    <p style={{ color: '#64748B' }}>Votre profil est actif.</p>
                                    <button onClick={() => setViewMode('edit')} style={{ marginTop: '16px', background: 'transparent', color: '#1A1265', border: '1px solid #E2E8F0', padding: '10px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>✏️ Éditer</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <style>{`
                .loader { width: 32px; height: 32px; border: 3px solid #EEF2FF; border-top-color: #1A1265; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
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