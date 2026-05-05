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
    const [user, setUser] = useState(null);
    const [userCards, setUserCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

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
        }
        setLoading(false);
    }

    // Switch profile effect
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
            }
        }
    }, [selectedCardId]);

    // FedaPay Integration
    function handleFedaPay() {
        if (!window.FedaPay) {
            toast("Erreur : Système de paiement indisponible", "error");
            return;
        }

        const widget = window.FedaPay.init({
            public_key: 'pk_sandbox_66p8vI9E9D9D9D9D9D9D9D9D', // REMPLACER PAR TA CLÉ RÉELLE
            transaction: {
                amount: 2000,
                description: 'Création de profil NFCrafter'
            },
            onComplete: async (data) => {
                if (data.status === 'approved') {
                    await createNewProfile();
                } else {
                    toast("Le paiement n'a pas été validé.", "error");
                }
            }
        });
        widget.open();
    }

    async function createNewProfile() {
        setSaving(true);
        try {
            const cardId = Math.random().toString(36).substring(2, 10).toUpperCase();
            const newName = `Nouveau Profil ${userCards.length + 1}`;
            const { error } = await supabase.from('cards').insert({
                card_id: cardId,
                owner_id: user.id,
                card_name: newName,
                status: 'active',
                admin_profile: { ...publicProfile, full_name: newName, socials: {}, customLinks: [] }
            });

            if (error) throw error;
            
            toast('Paiement validé ! Votre nouveau profil est créé.', 'success');
            setSelectedCardId(cardId);
            await loadUserData();
        } catch (e) {
            toast(e.message, 'error');
        } finally {
            setSaving(false);
        }
    }

    async function savePublicProfile() {
        if (!selectedCardId) return;
        setSaving(true);
        const { error } = await supabase
            .from('cards')
            .update({ 
                admin_profile: publicProfile,
                card_name: publicProfile.full_name || 'Mon Profil'
            })
            .eq('card_id', selectedCardId);

        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Profil mis à jour !', 'success');
            setViewMode('view');
            loadUserData();
        }
        setSaving(false);
    }

    async function uploadFile(file, bucket, onUrl, setUploading) {
        setUploading(true);
        try {
            const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
            const { error: uploadError } = await supabase.storage.from(bucket).upload(fileName, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            onUrl(publicUrl);
        } catch (e) { toast(e.message, 'error'); }
        finally { setUploading(false); }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;

    const publicUrl = selectedCardId ? `${window.location.origin}/u/${selectedCardId}` : '';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            
            {/* Sidebar (Left) */}
            <aside style={{ width: '280px', background: 'white', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', position: 'fixed', height: '100vh' }} className="desktop-only">
                <div style={{ padding: '32px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                    <span style={{ fontWeight: '900', fontSize: '18px', color: '#1A1265' }}>NFCrafter</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Mes Profils</div>
                    
                    {userCards.map(card => (
                        <button 
                            key={card.card_id}
                            onClick={() => setSelectedCardId(card.card_id)}
                            style={{ 
                                width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', textAlign: 'left', marginBottom: '8px', cursor: 'pointer',
                                background: selectedCardId === card.card_id ? '#1A1265' : 'transparent',
                                color: selectedCardId === card.card_id ? 'white' : '#475569',
                                fontWeight: '700', transition: '0.2s', display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                        >
                            <span>👤</span> {card.card_name || 'Sans titre'}
                        </button>
                    ))}

                    <button 
                        onClick={handleFedaPay}
                        style={{ width: '100%', marginTop: '24px', padding: '14px', borderRadius: '12px', border: '2px dashed #CBD5E1', background: 'white', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}
                    >
                        + Nouveau Profil (2000f)
                    </button>
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid #F1F5F9' }}>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Déconnexion</button>
                </div>
            </aside>

            {/* Main Content (Right) */}
            <main style={{ flex: 1, marginLeft: '280px', padding: '40px' }} className="main-content">
                
                {userCards.length === 0 ? (
                    <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center', background: 'white', padding: '60px 40px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: '64px', marginBottom: '24px' }}>👋</div>
                        <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Bienvenue sur NFCrafter</h1>
                        <p style={{ color: '#64748B', lineHeight: '1.6', marginBottom: '32px' }}>Commencez par créer votre premier profil digital pour partager vos contacts en un clin d'œil.</p>
                        <button onClick={handleFedaPay} className="btn-primary" style={{ padding: '16px 40px', borderRadius: '100px' }}>Activer mon profil (2000f)</button>
                    </div>
                ) : (
                    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        
                        {/* Top Bar: Profile Link */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '20px 24px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', fontWeight: '800', color: '#94A3B8', marginBottom: '4px' }}>LIEN PUBLIC DU PROFIL</div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#6366F1' }}>{publicUrl}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => window.open(publicUrl, '_blank')} style={{ padding: '10px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: '700', cursor: 'pointer' }}>👁️ Voir</button>
                                <button 
                                    onClick={async () => {
                                        if (navigator.share) {
                                            try { await navigator.share({ title: 'NFCrafter', url: publicUrl }); } catch (e) {}
                                        } else { window.open(`https://wa.me/?text=${encodeURIComponent(publicUrl)}`, '_blank'); }
                                    }} 
                                    style={{ padding: '10px 16px', borderRadius: '10px', background: '#25D366', color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                                >
                                    📲 Partager
                                </button>
                            </div>
                        </div>

                        {/* Physical Card Upsell */}
                        <div style={{ background: 'linear-gradient(135deg, #1A1265 0%, #312E81 100%)', color: 'white', padding: '32px', borderRadius: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 12px 30px rgba(26,18,101,0.2)' }}>
                            <div>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px' }}>Commander ma carte physique 💳</h3>
                                <p style={{ opacity: 0.8, fontSize: '14px' }}>Matérialisez votre profil digital pour impressionner vos interlocuteurs.</p>
                            </div>
                            <button 
                                onClick={() => window.open(`https://wa.me/22991566846?text=${encodeURIComponent('Bonjour, je souhaite commander ma carte physique NFCrafter pour mon profil : ' + publicUrl)}`, '_blank')} 
                                style={{ background: 'white', color: '#1A1265', border: 'none', padding: '14px 24px', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}
                            >
                                Commander (WhatsApp)
                            </button>
                        </div>

                        {/* Editor Section */}
                        <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1A1265', margin: 0 }}>Personnaliser le profil</h2>
                                <button 
                                    onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')}
                                    style={{ padding: '10px 20px', borderRadius: '12px', background: viewMode === 'edit' ? '#F1F5F9' : '#1A1265', color: viewMode === 'edit' ? '#1A1265' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    {viewMode === 'edit' ? 'Annuler' : '✏️ Modifier'}
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
                                    <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #F1F5F9' }}>
                                        <button onClick={savePublicProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>
                                            {saving ? 'Enregistrement...' : '✅ Enregistrer les modifications'}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', background: '#F8FAFC', borderRadius: '24px', border: '1px dashed #E2E8F0' }}>
                                    <p style={{ color: '#64748B' }}>Ce profil est actif. Vous pouvez modifier vos informations à tout moment.</p>
                                    <button onClick={() => setViewMode('edit')} style={{ marginTop: '16px', background: 'transparent', color: '#1A1265', border: '1px solid #E2E8F0', padding: '10px 24px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer' }}>✏️ Éditer les informations</button>
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
                    .main-content { marginLeft: 0 !important; padding: 20px !important; }
                    aside { display: none !important; }
                }
            `}</style>
        </div>
    );
}