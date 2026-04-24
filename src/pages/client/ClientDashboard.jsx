// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import ProfileForm from '../../components/ProfileForm.jsx';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);
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

        setCardDetails(data);
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
        else toast('Profil public mis à jour !', 'success');
        setSaving(false);
    }

    async function uploadPublicAvatar(file) {
        if (!file) return;
        setUploadingAvatar(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPublicProfile({ ...publicProfile, photo_url: ev.target.result });
            toast('Photo mise à jour', 'success');
            setUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
    }

    async function uploadPublicBanner(file) {
        if (!file) return;
        setUploadingBanner(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPublicProfile({ ...publicProfile, banner_url: ev.target.result });
            toast('Bannière mise à jour', 'success');
            setUploadingBanner(false);
        };
        reader.readAsDataURL(file);
    }

    async function logout() {
        await supabase.auth.signOut();
        navigate('/login');
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBEBDF' }}>
                <p>Chargement...</p>
            </div>
        );
    }

    const publicUrl = selectedCard ? `${window.location.origin}/u/${selectedCard.card_id}` : '';

    if (!selectedCard) {
        return (
            <div style={{ minHeight: '100vh', background: '#EBEBDF', padding: '24px' }}>
                <div style={{ maxWidth: '500px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '60px', marginBottom: '16px' }} />
                    <h2>Bienvenue sur NFCrafter</h2>
                    <p style={{ color: '#666', marginBottom: '24px' }}>Vous n'avez pas encore de carte active.</p>
                    <button onClick={logout} className="btn-primary">Se déconnecter</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#EBEBDF' }}>
            <header style={{
                background: 'white', borderBottom: '1px solid #D4D4C8', padding: '0 24px',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ maxWidth: '800px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '800', fontSize: '18px', color: '#1A1265' }}>NFCrafter</span>
                    </div>
                    <button onClick={logout} className="btn-ghost">Déconnexion</button>
                </div>
            </header>

            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px' }}>

                {userCards.length > 1 && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid #D4D4C8' }}>
                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>📱 Mes cartes</label>
                        <select
                            value={selectedCard?.card_id || ''}
                            onChange={e => setSelectedCard(userCards.find(c => c.card_id === e.target.value))}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D4D4C8' }}
                        >
                            {userCards.map(c => (
                                <option key={c.card_id} value={c.card_id}>
                                    {c.profile_name || c.card_id}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ margin: 0, color: '#1A1265' }}>📄 Mon profil public</h2>
                        <button onClick={() => window.open(publicUrl, '_blank')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                            🔗 Voir ma page
                        </button>
                    </div>
                    <p style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>
                        Ces informations seront visibles par toute personne qui scanne votre carte.
                    </p>

                    <ProfileForm
                        form={publicProfile}
                        onChange={setPublicProfile}
                        onUploadAvatar={uploadPublicAvatar}
                        onUploadBanner={uploadPublicBanner}
                        uploadingAvatar={uploadingAvatar}
                        uploadingBanner={uploadingBanner}
                        readOnly={false}
                    />

                    <div className="field">
                        <label>Lien de votre carte (à partager)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input readOnly value={publicUrl} style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }} />
                            <button onClick={() => navigator.clipboard.writeText(publicUrl)} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                                📋 Copier
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={savePublicProfile}
                        disabled={saving}
                        className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', marginTop: '16px' }}
                    >
                        {saving ? 'Sauvegarde...' : '💾 Sauvegarder mon profil public'}
                    </button>
                </div>

            </main>
        </div>
    );
}