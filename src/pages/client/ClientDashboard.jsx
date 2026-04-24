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
    const [saving, setSaving] = useState(false);

    // Profil privé
    const [profile, setProfile] = useState({ full_name: '', city: '', country: 'Bénin' });

    // Mot de passe
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Cartes
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);

    // Contenu modifiable
    const [cardContent, setCardContent] = useState({});
    const [savingContent, setSavingContent] = useState(false);

    // Profil public (pour type profile)
    const [publicProfile, setPublicProfile] = useState({});
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [savingPublicProfile, setSavingPublicProfile] = useState(false);

    const [activeTab, setActiveTab] = useState('profil');

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

        let { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, city, country')
            .eq('id', user.id)
            .single();

        if (!profileData) {
            profileData = { full_name: user.user_metadata?.full_name || '', city: '', country: 'Bénin' };
            await supabase.from('profiles').upsert({ id: user.id, ...profileData });
        }
        setProfile(profileData);

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
            .select('page_type, redirect_url, wifi_ssid, wifi_password, wifi_security, admin_profile')
            .eq('card_id', selectedCard.card_id)
            .single();

        setCardDetails(data);

        // Charger le contenu selon le type
        if (data?.page_type === 'url') {
            setCardContent({ redirect_url: data.redirect_url || '' });
        } else if (data?.page_type === 'wifi') {
            setCardContent({
                wifi_ssid: data.wifi_ssid || '',
                wifi_password: data.wifi_password || '',
                wifi_security: data.wifi_security || 'WPA'
            });
        } else if (data?.page_type === 'profile') {
            setPublicProfile(data.admin_profile || {});
        }
    }

    async function savePrivateProfile() {
        setSaving(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: profile.full_name, city: profile.city, country: profile.country })
            .eq('id', user.id);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Profil mis à jour !', 'success');
        setSaving(false);
    }

    async function updatePassword() {
        if (newPassword.length < 6) {
            toast('Le mot de passe doit contenir au moins 6 caractères', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast('Les mots de passe ne correspondent pas', 'error');
            return;
        }
        setUpdatingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Mot de passe mis à jour !', 'success');
            setNewPassword('');
            setConfirmPassword('');
        }
        setUpdatingPassword(false);
    }

    async function saveCardContent() {
        if (!selectedCard) return;
        setSavingContent(true);

        const updateData = {};
        if (cardDetails?.page_type === 'url') {
            updateData.redirect_url = cardContent.redirect_url;
        } else if (cardDetails?.page_type === 'wifi') {
            updateData.wifi_ssid = cardContent.wifi_ssid;
            updateData.wifi_password = cardContent.wifi_password;
            updateData.wifi_security = cardContent.wifi_security;
        }

        const { error } = await supabase
            .from('cards')
            .update(updateData)
            .eq('card_id', selectedCard.card_id);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Contenu mis à jour !', 'success');
        setSavingContent(false);
    }

    async function savePublicProfile() {
        if (!selectedCard) return;
        setSavingPublicProfile(true);
        const { error } = await supabase
            .from('cards')
            .update({ admin_profile: publicProfile })
            .eq('card_id', selectedCard.card_id);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Profil public mis à jour !', 'success');
        setSavingPublicProfile(false);
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
        return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBEBDF' }}><p>Chargement...</p></div>;
    }

    const getTabs = () => {
        const tabs = [{ id: 'profil', label: '👤 Mon profil' }];
        if (selectedCard) {
            if (cardDetails?.page_type === 'url') tabs.push({ id: 'contenu', label: '🔗 URL' });
            else if (cardDetails?.page_type === 'wifi') tabs.push({ id: 'contenu', label: '📶 Wi-Fi' });
            else if (cardDetails?.page_type === 'profile') tabs.push({ id: 'contenu', label: '📄 Mon profil public' });
            tabs.push({ id: 'qr', label: '▣ QR Code' });
        }
        tabs.push({ id: 'securite', label: '🔒 Sécurité' });
        return tabs;
    };

    const publicUrl = selectedCard ? `${window.location.origin}/u/${selectedCard.card_id}` : '';

    return (
        <div style={{ minHeight: '100vh', background: '#EBEBDF' }}>
            <header style={{ background: 'white', borderBottom: '1px solid #D4D4C8', padding: '0 24px', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: '680px', margin: '0 auto', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '800', fontSize: '18px', color: '#1A1265' }}>NFCrafter</span>
                    </div>
                    <button onClick={logout} style={{ background: 'transparent', border: '1px solid #D4D4C8', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}>Déconnexion</button>
                </div>
            </header>

            <main style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>
                {userCards.length > 1 && (
                    <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px', border: '1px solid #D4D4C8' }}>
                        <label>Mes cartes</label>
                        <select value={selectedCard?.card_id || ''} onChange={e => setSelectedCard(userCards.find(c => c.card_id === e.target.value))}>
                            {userCards.map(c => <option key={c.card_id} value={c.card_id}>{c.profile_name || c.card_id}</option>)}
                        </select>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {getTabs().map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                            background: activeTab === tab.id ? '#1A1265' : 'white', color: activeTab === tab.id ? 'white' : '#5A5A7A'
                        }}>{tab.label}</button>
                    ))}
                </div>

                {activeTab === 'profil' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>👤 Mes informations personnelles</h3>
                        <div className="field"><label>Nom complet</label><input type="text" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
                        <div className="field-row"><div className="field"><label>Ville</label><input type="text" value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} /></div><div className="field"><label>Pays</label><input type="text" value={profile.country || ''} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div></div>
                        <button onClick={savePrivateProfile} disabled={saving} style={{ width: '100%', background: '#1A1265', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>{saving ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
                    </div>
                )}

                {activeTab === 'contenu' && cardDetails && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>
                            {cardDetails.page_type === 'url' && '🔗 URL de redirection'}
                            {cardDetails.page_type === 'wifi' && '📶 Configuration Wi-Fi'}
                            {cardDetails.page_type === 'profile' && '📄 Mon profil public'}
                        </h3>

                        {cardDetails.page_type === 'url' && (
                            <>
                                <div className="field"><label>URL de redirection</label><input type="url" placeholder="https://exemple.com" value={cardContent.redirect_url || ''} onChange={e => setCardContent({ ...cardContent, redirect_url: e.target.value })} /></div>
                                <button onClick={saveCardContent} disabled={savingContent} style={{ width: '100%', background: '#1A1265', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>{savingContent ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
                            </>
                        )}

                        {cardDetails.page_type === 'wifi' && (
                            <>
                                <div className="field"><label>SSID</label><input type="text" value={cardContent.wifi_ssid || ''} onChange={e => setCardContent({ ...cardContent, wifi_ssid: e.target.value })} /></div>
                                <div className="field"><label>Mot de passe</label><input type="text" value={cardContent.wifi_password || ''} onChange={e => setCardContent({ ...cardContent, wifi_password: e.target.value })} /></div>
                                <button onClick={saveCardContent} disabled={savingContent} style={{ width: '100%', background: '#1A1265', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>{savingContent ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
                            </>
                        )}

                        {cardDetails.page_type === 'profile' && (
                            <>
                                <ProfileForm form={publicProfile} onChange={setPublicProfile} onUploadAvatar={uploadPublicAvatar} onUploadBanner={uploadPublicBanner} uploadingAvatar={uploadingAvatar} uploadingBanner={uploadingBanner} readOnly={false} />
                                <button onClick={savePublicProfile} disabled={savingPublicProfile} style={{ width: '100%', background: '#1A1265', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', marginTop: '16px' }}>{savingPublicProfile ? 'Sauvegarde...' : '💾 Sauvegarder mon profil public'}</button>
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'qr' && selectedCard && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>📱 Mon QR Code</h3>
                        <p style={{ marginBottom: '16px', fontSize: '13px', color: '#666' }}>Scannez ce QR pour accéder à votre page publique</p>
                        <div id="qr-container" style={{ display: 'inline-block', background: '#EBEBDF', padding: '16px', borderRadius: '12px' }}>
                            <p style={{ fontSize: '12px' }}>QR Code généré à la création de la carte</p>
                            <p style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '8px' }}>{publicUrl}</p>
                        </div>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => window.open(publicUrl, '_blank')} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>Voir ma page</button>
                            <button onClick={() => navigator.clipboard.writeText(publicUrl)} style={{ background: 'transparent', border: '1px solid #1A1265', color: '#1A1265', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer' }}>Copier le lien</button>
                        </div>
                    </div>
                )}

                {activeTab === 'securite' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>🔒 Changer mon mot de passe</h3>
                        <div className="field"><label>Nouveau mot de passe</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                        <div className="field"><label>Confirmer</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
                        <button onClick={updatePassword} disabled={updatingPassword} style={{ width: '100%', background: '#1A1265', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer' }}>{updatingPassword ? 'Mise à jour...' : 'Mettre à jour'}</button>
                    </div>
                )}
            </main>
        </div>
    );
}