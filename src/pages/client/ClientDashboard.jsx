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
            toast("Erreur lors de l'upload. Assurez-vous que le dossier '" + bucket + "' existe dans Supabase Storage.", 'error');
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
        <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Nav */}
            <header style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '800', fontSize: '20px', letterSpacing: '-0.5px', color: 'var(--primary)' }}>QR CRAFTER</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-900)' }}>{user?.email}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-500)' }}>Espace Membre</div>
                        </div>
                        <button onClick={logout} className="btn-ghost" style={{ padding: '8px 16px' }}>Déconnexion</button>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px', alignItems: 'start' }}>
                    
                    {/* Main Settings */}
                    <div className="premium-card" style={{ padding: '32px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '24px' }}>Modifier mon profil</h2>
                                <p style={{ color: 'var(--text-500)', fontSize: '14px' }}>Personnalisez votre page de profil numérique.</p>
                            </div>
                        </div>

                        <ProfileForm
                            form={publicProfile}
                            onChange={setPublicProfile}
                            onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                            onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                            uploadingAvatar={uploadingAvatar}
                            uploadingBanner={uploadingBanner}
                        />

                        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
                            <button 
                                onClick={savePublicProfile} 
                                disabled={saving} 
                                className="btn-primary" 
                                style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
                            >
                                {saving ? 'Sauvegarde en cours...' : '💾 Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>

                    {/* Sidebar Info & Preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ marginBottom: '12px', fontWeight: '600', color: 'var(--text-500)', fontSize: '12px', letterSpacing: '1px' }}>APERÇU EN DIRECT</p>
                            <PhonePreview>
                                <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                                    <PublicProfile previewData={publicProfile} />
                                </div>
                            </PhonePreview>
                        </div>

                        <div className="premium-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Ma Carte Actuelle</h3>
                            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '16px', marginBottom: '20px', border: '1px solid var(--border)' }}>
                                <div style={{ fontSize: '10px', color: 'var(--text-400)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '1px' }}>ID CARTE UNIQUE</div>
                                <code style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary)' }}>{selectedCard?.card_id}</code>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <button 
                                    onClick={() => window.open(publicUrl, '_blank')} 
                                    className="btn-secondary" 
                                    style={{ width: '100%', justifyContent: 'center' }}
                                >
                                    🔗 Voir ma page publique
                                </button>
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(publicUrl);
                                        toast('Lien copié !', 'success');
                                    }} 
                                    className="btn-ghost" 
                                    style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }}
                                >
                                    📋 Copier le lien
                                </button>
                            </div>
                        </div>

                        {userCards.length > 1 && (
                            <div className="premium-card" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Mes autres cartes</h3>
                                {userCards.map(c => (
                                    <button 
                                        key={c.card_id}
                                        onClick={() => setSelectedCard(c)}
                                        style={{ 
                                            width: '100%', padding: '12px', borderRadius: '12px', textAlign: 'left', 
                                            border: selectedCard?.card_id === c.card_id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                            background: selectedCard?.card_id === c.card_id ? 'var(--primary-light)' : 'white',
                                            marginBottom: '8px', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: '700', fontSize: '14px', color: selectedCard?.card_id === c.card_id ? 'var(--primary)' : 'var(--text-900)' }}>{c.profile_name || c.card_id}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-400)' }}>{c.card_id}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
