// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';
import PhonePreview from '../../components/PhonePreview.jsx';
import PublicProfile from '../PublicProfile.jsx';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [publicProfile, setPublicProfile] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadUserData(); }, []);

    useEffect(() => {
        if (selectedCard) {
            loadCardDetails();
        }
    }, [selectedCard]);

    async function loadUserData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data: cards } = await supabase
            .from('user_cards')
            .select('card_id, profile_name')
            .eq('user_id', user.id);

        setUserCards(cards || []);
        if (cards?.length > 0) {
            setSelectedCard(cards[0]);
        }

        setLoading(false);
    }

    async function loadCardDetails() {
        if (!selectedCard) return;

        const { data } = await supabase
            .from('cards')
            .select('admin_profile')
            .eq('card_id', selectedCard.card_id)
            .single();

        setPublicProfile(data?.admin_profile || {});
    }

    async function savePublicProfile() {
        if (!selectedCard) return;
        setSaving(true);
        const { error } = await supabase
            .from('cards')
            .update({ admin_profile: publicProfile })
            .eq('card_id', selectedCard.card_id);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Profil mis à jour avec succès !', 'success');
        setSaving(false);
    }

    async function uploadFile(file, bucket, setter, loadingSetter) {
        if (!file) return;
        loadingSetter(true);
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            setter(publicUrl);
            toast('Fichier ajouté avec succès', 'success');
        } catch (err) {
            console.error(err);
            toast("Erreur d'upload. Vérifiez le bucket '" + bucket + "'.", 'error');
        } finally {
            loadingSetter(false);
        }
    }

    async function logout() {
        await supabase.auth.signOut();
        navigate('/login');
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        );
    }

    const publicUrl = selectedCard ? `${window.location.origin}/u/${selectedCard.card_id}` : '';

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)' }}>
            {/* Header with Glassmorphism */}
            <header style={{ background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255, 255, 255, 0.3)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
                        </div>
                        <span style={{ fontWeight: '900', fontSize: '22px', letterSpacing: '-1px', color: 'var(--primary)' }}>QR CRAFTER</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-900)' }}>Espace Client</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-500)', fontWeight: '600' }}>{user?.email}</div>
                        </div>
                        <button onClick={logout} className="btn-ghost" style={{ padding: '10px 20px', borderRadius: '12px', color: '#EF4444', borderColor: '#FEE2E2', background: '#FEF2F2' }}>Déconnexion</button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '48px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '48px', alignItems: 'start' }}>
                    
                    {/* Settings Form */}
                    <div className="premium-card" style={{ padding: '40px', animation: 'fadeInLeft 0.8s ease-out', borderRadius: '32px' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '900', letterSpacing: '-1.5px', color: 'var(--primary)' }}>Personnaliser mon Profil</h1>
                            <p style={{ color: 'var(--text-500)', fontSize: '16px', fontWeight: '500', marginTop: '8px' }}>Mettez à jour vos informations en temps réel.</p>
                        </div>

                        <ProfileForm
                            form={publicProfile}
                            onChange={setPublicProfile}
                            onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                            onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                            uploadingAvatar={uploadingAvatar}
                            uploadingBanner={uploadingBanner}
                        />

                        <div style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px solid #F1F5F9' }}>
                            <button 
                                onClick={savePublicProfile} 
                                disabled={saving} 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '20px', borderRadius: '20px', fontSize: '18px', fontWeight: '800', boxShadow: '0 15px 30px rgba(26, 18, 101, 0.2)' }}
                            >
                                {saving ? 'Enregistrement...' : 'Sauvegarder les modifications ✨'}
                            </button>
                        </div>
                    </div>

                    {/* Preview & Card Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', animation: 'fadeInRight 0.8s ease-out' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '20px', fontWeight: '800', color: 'var(--primary)', fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase' }}>Aperçu Mobile Live</p>
                            <PhonePreview>
                                <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                                    <PublicProfile previewData={publicProfile} />
                                </div>
                            </PhonePreview>
                        </div>

                        <div className="premium-card" style={{ padding: '32px', borderRadius: '28px', background: 'linear-gradient(135deg, #1A1265 0%, #4338CA 100%)', color: 'white', border: 'none' }}>
                            <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'white', fontWeight: '800' }}>Votre Carte Digitale</h3>
                            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '20px', padding: '24px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '1px' }}>ID CARTE</div>
                                <code style={{ fontSize: '20px', fontWeight: '900', color: 'var(--accent)' }}>{selectedCard?.card_id}</code>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <button 
                                    onClick={() => window.open(publicUrl, '_blank')} 
                                    className="btn-primary" 
                                    style={{ width: '100%', background: 'white', color: 'var(--primary)', padding: '16px', borderRadius: '16px' }}
                                >
                                    🔗 Voir ma page publique
                                </button>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicUrl);
                                        toast('Lien copié !', 'success');
                                    }} 
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '14px', borderRadius: '16px', cursor: 'pointer', fontWeight: '700' }}
                                >
                                    📋 Copier le lien
                                </button>
                            </div>
                        </div>

                        {userCards.length > 1 && (
                            <div className="premium-card" style={{ padding: '32px', borderRadius: '28px' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '800' }}>Mes Cartes</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {userCards.map(c => (
                                        <button 
                                            key={c.card_id}
                                            onClick={() => setSelectedCard(c)}
                                            style={{ 
                                                width: '100%', padding: '16px', borderRadius: '16px', textAlign: 'left', 
                                                border: selectedCard?.card_id === c.card_id ? '2px solid var(--primary)' : '1px solid #F1F5F9',
                                                background: selectedCard?.card_id === c.card_id ? 'var(--primary-light)' : 'white',
                                                cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{ fontWeight: '800', fontSize: '15px', color: selectedCard?.card_id === c.card_id ? 'var(--primary)' : 'var(--text-900)' }}>{c.profile_name || 'Ma Carte'}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-400)', fontWeight: '600' }}>{c.card_id}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}