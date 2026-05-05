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
    const [showPaywall, setShowPaywall] = useState(false);
    
    const [user, setUser] = useState(null);
    const [userCards, setUserCards] = useState([]);
    const [selectedCardId, setSelectedCardId] = useState(null);
    const [publicProfile, setPublicProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265',
        socials: {}, customLinks: [], url: '', qr_type: 'profile'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    useEffect(() => { loadUserData(); }, []);

    async function loadUserData() {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) { navigate('/login'); return; }
        setUser(authUser);

        const { data: cards } = await supabase
            .from('cards')
            .select('*')
            .eq('owner_id', authUser.id);

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
            setShowPaywall(false);
        } else {
            setShowPaywall(true);
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
                setViewMode('view');
            }
        }
    }, [selectedCardId]);

    async function handlePaymentAndCreate() {
        setSaving(true);
        try {
            const cardId = Math.random().toString(36).substring(2, 10).toUpperCase();
            const { error } = await supabase.from('cards').insert({
                card_id: cardId,
                owner_id: user.id,
                card_name: `Profil ${userCards.length + 1}`,
                status: 'active',
                admin_profile: { ...publicProfile, full_name: `Profil ${userCards.length + 1}` }
            });

            if (error) throw error;
            
            toast('Nouveau profil créé !', 'success');
            setSelectedCardId(cardId);
            setShowPaywall(false);
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
            toast('Modifications enregistrées !', 'success');
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
            toast('Image mise à jour !', 'success');
        } catch (error) {
            toast('Erreur upload : ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;

    const publicUrl = selectedCardId ? `${window.location.origin}/u/${selectedCardId}` : '';

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265' }}>NFCrafter</span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div className="desktop-only" style={{ fontSize: '13px', color: '#64748B' }}>{user?.email}</div>
                        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ padding: '8px 16px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Quitter</button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
                {showPaywall ? (
                    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ background: 'white', padding: '48px 32px', borderRadius: '32px', border: '1px solid #E2E8F0', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
                            <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1265', marginBottom: '16px' }}>Lancez votre Profil Digital</h1>
                            <p style={{ color: '#64748B', fontSize: '18px', maxWidth: '500px', margin: '0 auto 32px' }}>Créez votre carte de visite intelligente pour seulement <strong>2.000f CFA</strong>.</p>
                            <button onClick={handlePaymentAndCreate} disabled={saving} className="btn-primary" style={{ padding: '18px 48px', fontSize: '18px', borderRadius: '100px' }}>
                                {saving ? 'Création...' : 'Créer mon premier profil (2.000f)'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        
                        {/* Profile Switcher */}
                        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}>
                            {userCards.map((card, idx) => (
                                <button 
                                    key={card.card_id}
                                    onClick={() => setSelectedCardId(card.card_id)}
                                    style={{ 
                                        padding: '12px 24px', 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        background: selectedCardId === card.card_id ? '#1A1265' : 'white', 
                                        color: selectedCardId === card.card_id ? 'white' : '#64748B',
                                        fontWeight: '800',
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                        transition: '0.2s'
                                    }}
                                >
                                    👤 {card.card_name || `Profil ${idx + 1}`}
                                </button>
                            ))}
                            <button 
                                onClick={handlePaymentAndCreate}
                                disabled={saving}
                                style={{ 
                                    padding: '12px 24px', 
                                    borderRadius: '16px', 
                                    border: '2px dashed #CBD5E1', 
                                    background: 'transparent', 
                                    color: '#475569',
                                    fontWeight: '800',
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                }}
                            >
                                + Nouveau (2.000f)
                            </button>
                        </div>

                        {/* Physical Card Upsell */}
                        <div style={{ background: 'linear-gradient(135deg, #1A1265 0%, #312E81 100%)', color: 'white', padding: '24px 32px', borderRadius: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', margin: 0 }}>Commander la carte physique 💳</h3>
                                <p style={{ opacity: 0.8, fontSize: '13px', marginTop: '4px' }}>Pour le profil : {publicProfile.full_name || 'Sans nom'}</p>
                            </div>
                            <button 
                                onClick={() => window.open(`https://wa.me/22991566846?text=${encodeURIComponent('Bonjour, je souhaite commander la carte physique pour mon profil : ' + publicUrl)}`, '_blank')} 
                                style={{ background: 'white', color: '#1A1265', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}
                            >
                                Commander (WhatsApp)
                            </button>
                        </div>

                        {/* Public Link & Actions */}
                        <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <div style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px' }}>LIEN DU PROFIL SÉLECTIONNÉ</div>
                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#6366F1' }}>{publicUrl}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => window.open(publicUrl, '_blank')} className="btn-ghost" style={{ padding: '12px 16px' }}>👁️ Voir</button>
                                <button 
                                    onClick={async () => {
                                        if (navigator.share) {
                                            try { await navigator.share({ title: 'Mon Profil', url: publicUrl }); } catch (e) {}
                                        } else { window.open(`https://wa.me/?text=${encodeURIComponent(publicUrl)}`, '_blank'); }
                                    }} 
                                    className="btn-primary" 
                                    style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #25D366, #128C7E)', border: 'none' }}
                                >
                                    📲 Partager
                                </button>
                            </div>
                        </div>

                        {/* Editor Section */}
                        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', margin: 0 }}>Éditer le profil</h2>
                                <button 
                                    onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')}
                                    style={{ padding: '10px 20px', borderRadius: '12px', background: viewMode === 'edit' ? '#F1F5F9' : '#1A1265', color: viewMode === 'edit' ? '#1A1265' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                                >
                                    {viewMode === 'edit' ? 'Annuler' : '✏️ Modifier'}
                                </button>
                            </div>

                            {viewMode === 'edit' ? (
                                <>
                                    <ProfileForm
                                        profile={publicProfile}
                                        setProfile={setPublicProfile}
                                        onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                                        onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                                        uploadingAvatar={uploadingAvatar}
                                        uploadingBanner={uploadingBanner}
                                        toast={toast}
                                    />
                                    <div style={{ marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
                                        <button onClick={savePublicProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>
                                            {saving ? 'Enregistrement...' : '✅ Enregistrer les modifications'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 0', background: '#F8FAFC', borderRadius: '20px' }}>
                                    <p style={{ color: '#64748B', fontSize: '15px' }}>Ce profil est actif. Cliquez sur modifier pour le personnaliser.</p>
                                    <button onClick={() => setViewMode('edit')} style={{ marginTop: '12px', background: 'transparent', color: '#1A1265', border: '1px solid #E2E8F0', padding: '8px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>Modifier les infos</button>
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
                @media (max-width: 768px) { .desktop-only { display: none !important; } }
            `}</style>
        </div>
    );
}