// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';
import { SOCIAL_NETWORKS } from '../../constants/socials.js';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [viewMode, setViewMode] = useState('view'); // 'view' or 'edit'
    
    const [user, setUser] = useState(null);
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [publicProfile, setPublicProfile] = useState({});
    const [qrType, setQrType] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    async function uploadFile(file, bucket, onUrl, setUploading) {
        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(filePath);

            onUrl(publicUrl);
            toast('Image mise à jour !', 'success');
        } catch (error) {
            toast('Erreur upload : ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    }

    useEffect(() => { loadUserData(); }, []);

    useEffect(() => {
        if (selectedCard) {
            loadCardDetails();
        }
    }, [selectedCard]);

    async function loadUserData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { navigate('/login'); return; }
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
        
        // Fetch card data including admin_profile and owner_id
        const { data: cardData } = await supabase
            .from('cards')
            .select('admin_profile, owner_id')
            .eq('card_id', selectedCard.card_id)
            .single();

        if (!cardData) return;

        // Fetch profile data from 'profiles' table for the owner
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', cardData.owner_id)
            .single();

        let adminBase = cardData.admin_profile || {};
        
        // Merge logic exactly as in PublicProfile.jsx to get "true" content
        let merged = {
            banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
            phone: '', email: '', primaryColor: '#1A1265',
            socials: {}, customLinks: [], url: '',
            ...adminBase
        };

        if (profileData) {
            for (const k in profileData) {
                if (profileData[k] !== null && profileData[k] !== undefined && profileData[k] !== '') {
                    merged[k] = profileData[k];
                }
            }
        }

        // Migrate old flat socials to new socials object if needed
        if (!merged.socials || Object.keys(merged.socials).length === 0) {
            const socials = {};
            SOCIAL_NETWORKS.forEach(net => {
                if (merged[net.id]) {
                    socials[net.id] = { value: merged[net.id], subtitle: '' };
                }
            });
            if (Object.keys(socials).length > 0) {
                merged.socials = socials;
            }
        }
        
        setQrType(merged.qr_type || 'profile');
        setPublicProfile(merged);
    }

    async function savePublicProfile() {
        if (!selectedCard) return;
        setSaving(true);
        
        // Update the card's admin_profile with the current state
        const { error } = await supabase
            .from('cards')
            .update({ admin_profile: publicProfile })
            .eq('card_id', selectedCard.card_id);

        if (error) {
            toast('Erreur : ' + error.message, 'error');
        } else {
            toast('Modifications enregistrées !', 'success');
            setViewMode('view');
        }
        setSaving(false);
    }

    async function requestDesignChange() {
        const message = `Bonjour, je souhaite modifier le design de ma carte QR (ID: ${selectedCard.card_id}). Client: ${user.email}`;
        const whatsappUrl = `https://wa.me/22991566846?text=${encodeURIComponent(message)}`;
        const { error } = await supabase.from('cards').update({ design_request: 'pending' }).eq('card_id', selectedCard.card_id);
        if (!error) {
            toast('Demande envoyée ! Redirection...', 'success');
            setTimeout(() => window.open(whatsappUrl, '_blank'), 1500);
        }
    }

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader"></div></div>;

    const publicUrl = selectedCard ? `${window.location.origin}/u/${selectedCard.card_id}` : '';

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Header / Nav */}
            <header style={{ background: 'white', borderBottom: '1px solid #E2E8F0', padding: '0 24px', sticky: 'top', zIndex: 100 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="Logo" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '900', fontSize: '20px', color: '#1A1265' }}>NFCrafter</span>
                    </div>

                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div className="desktop-only" style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#1A1265' }}>Mon Espace</div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>{user?.email}</div>
                        </div>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mobile-only" style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>☰</button>
                        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} className="desktop-only" style={{ padding: '10px 16px', borderRadius: '12px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Déconnexion</button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 200, padding: '40px 24px', animation: 'slideIn 0.3s ease-out' }}>
                    <button onClick={() => setIsMenuOpen(false)} style={{ position: 'absolute', right: '24px', top: '24px', fontSize: '32px', background: 'none', border: 'none' }}>✕</button>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '40px' }}>
                        <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '16px' }}>
                            <div style={{ fontWeight: '800', color: '#1A1265' }}>{user?.email}</div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>Client NFCrafter</div>
                        </div>
                        <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={{ width: '100%', padding: '16px', borderRadius: '16px', background: '#FEF2F2', color: '#DC2626', border: 'none', fontWeight: '800' }}>Déconnexion</button>
                    </div>
                </div>
            )}

            <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Title */}
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1A1265', margin: 0 }}>Tableau de Bord</h1>
                        <p style={{ color: '#64748B', marginTop: '4px' }}>Gérez votre profil digital et personnalisez votre expérience.</p>
                    </div>

                    {/* Public Link Box - Always visible */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '24px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#94A3B8', marginBottom: '8px' }}>VOTRE LIEN PUBLIC</div>
                            <div style={{ fontSize: '15px', fontWeight: '700', color: '#6366F1', wordBreak: 'break-all' }}>{publicUrl}</div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => window.open(publicUrl, '_blank')} className="btn-ghost" style={{ padding: '12px 20px' }}>👁️ Voir ma page</button>
                            <button onClick={() => { navigator.clipboard.writeText(publicUrl); toast('Lien copié !', 'success'); }} className="btn-primary" style={{ padding: '12px 24px' }}>Copier le lien</button>
                        </div>
                    </div>

                    {/* Profile Section */}
                    <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', margin: 0 }}>
                                {qrType === 'url' ? 'Lien de Redirection' : 'Votre Profil'}
                            </h2>
                            <button 
                                onClick={() => setViewMode(viewMode === 'view' ? 'edit' : 'view')}
                                style={{ padding: '10px 20px', borderRadius: '12px', background: viewMode === 'edit' ? '#F1F5F9' : '#1A1265', color: viewMode === 'edit' ? '#1A1265' : 'white', border: 'none', fontWeight: '800', cursor: 'pointer' }}
                            >
                                {viewMode === 'edit' ? 'Annuler' : 'Modifier'}
                            </button>
                        </div>

                        {viewMode === 'edit' ? (
                            <>
                                {qrType === 'url' ? (
                                    <div className="field">
                                        <label>URL de destination</label>
                                        <input 
                                            type="url" 
                                            value={publicProfile.url || ''} 
                                            onChange={e => setPublicProfile({...publicProfile, url: e.target.value})} 
                                            placeholder="https://votre-site.com" 
                                            autoFocus
                                        />
                                        <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>Votre code QR redirigera directement vers cette adresse.</p>
                                    </div>
                                ) : (
                                    <ProfileForm
                                        profile={publicProfile}
                                        setProfile={setPublicProfile}
                                        onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                                        onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                                        uploadingAvatar={uploadingAvatar}
                                        uploadingBanner={uploadingBanner}
                                        toast={toast}
                                    />
                                )}
                                <div style={{ marginTop: '32px', borderTop: '1px solid #F1F5F9', paddingTop: '32px' }}>
                                    <button onClick={savePublicProfile} disabled={saving} className="btn-primary" style={{ width: '100%', padding: '16px', borderRadius: '16px' }}>
                                        {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                                <p style={{ color: '#64748B', margin: 0 }}>
                                    {qrType === 'url' 
                                        ? `Redirection active vers : ${publicProfile.url || 'aucune URL'}`
                                        : 'Cliquez sur le bouton pour modifier vos informations.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Danger Zone / Info */}
                    <div style={{ background: '#FFF5F5', padding: '24px', borderRadius: '20px', border: '1px solid #FCA5A5' }}>
                        <h3 style={{ color: '#DC2626', fontWeight: '900', fontSize: '15px', margin: '0 0 8px 0' }}>Modification du design physique 🎨</h3>
                        <p style={{ color: '#991B1B', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                            Votre code QR a été imprimé ou encodé avec un design spécifique (couleurs, logo). Vous pouvez modifier le contenu à tout moment, mais pour changer le design du code lui-même, vous devez nous contacter.
                        </p>
                        <button onClick={requestDesignChange} style={{ background: 'white', color: '#DC2626', border: '1px solid #FCA5A5', padding: '12px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }}>
                            Demander une modification via WhatsApp
                        </button>
                    </div>
                </div>
            </main>

            <style>{`
                @keyframes slideIn { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes spin { to { transform: rotate(360deg); } }
                .loader { width: 32px; height: 32px; border: 3px solid #EEF2FF; border-top-color: #1A1265; border-radius: 50%; animation: spin 1s linear infinite; }
                
                @media (max-width: 968px) {
                    .desktop-only { display: none !important; }
                    .mobile-only { display: block !important; }
                }
                @media (min-width: 969px) {
                    .mobile-only { display: none !important; }
                }
            `}</style>
        </div>
    );
}