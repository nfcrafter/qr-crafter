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

    // Profil privé (toujours visible pour tous les clients)
    const [profile, setProfile] = useState({ full_name: '', city: '', country: 'Bénin' });

    // Mot de passe
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Cartes du client
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);

    // Contenu selon le type de carte
    const [redirectUrl, setRedirectUrl] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiSecurity, setWifiSecurity] = useState('WPA');
    const [savingContent, setSavingContent] = useState(false);

    // Profil public (UNIQUEMENT pour les cartes de type 'profile')
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

        // Charger le contenu selon le type de carte
        if (data?.page_type === 'url') {
            setRedirectUrl(data.redirect_url || '');
        } else if (data?.page_type === 'wifi') {
            setWifiSsid(data.wifi_ssid || '');
            setWifiPassword(data.wifi_password || '');
            setWifiSecurity(data.wifi_security || 'WPA');
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

    async function saveUrlContent() {
        if (!selectedCard) return;
        setSavingContent(true);

        const { error } = await supabase
            .from('cards')
            .update({ redirect_url: redirectUrl })
            .eq('card_id', selectedCard.card_id);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('URL mise à jour !', 'success');
        setSavingContent(false);
    }

    async function saveWifiContent() {
        if (!selectedCard) return;
        setSavingContent(true);

        const { error } = await supabase
            .from('cards')
            .update({
                wifi_ssid: wifiSsid,
                wifi_password: wifiPassword,
                wifi_security: wifiSecurity
            })
            .eq('card_id', selectedCard.card_id);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Wi-Fi mis à jour !', 'success');
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
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBEBDF' }}>
                <p>Chargement...</p>
            </div>
        );
    }

    // Déterminer les onglets disponibles
    const getTabs = () => {
        const tabs = [{ id: 'profil', label: '👤 Mon profil' }];

        if (selectedCard) {
            if (cardDetails?.page_type === 'url') {
                tabs.push({ id: 'url', label: '🔗 URL' });
            } else if (cardDetails?.page_type === 'wifi') {
                tabs.push({ id: 'wifi', label: '📶 Wi-Fi' });
            } else if (cardDetails?.page_type === 'profile') {
                tabs.push({ id: 'public', label: '📄 Mon profil public' });
            }
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
                {/* Sélecteur de carte */}
                {userCards.length > 1 && (
                    <div style={{ background: 'white', borderRadius: '10px', padding: '20px', marginBottom: '20px', border: '1px solid #D4D4C8' }}>
                        <label>Mes cartes</label>
                        <select value={selectedCard?.card_id || ''} onChange={e => setSelectedCard(userCards.find(c => c.card_id === e.target.value))}>
                            {userCards.map(c => <option key={c.card_id} value={c.card_id}>{c.profile_name || c.card_id}</option>)}
                        </select>
                    </div>
                )}

                {/* Onglets */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {getTabs().map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                            background: activeTab === tab.id ? '#1A1265' : 'white', color: activeTab === tab.id ? 'white' : '#5A5A7A'
                        }}>{tab.label}</button>
                    ))}
                </div>

                {/* ===== ONGLET PROFIL PRIVÉ ===== */}
                {activeTab === 'profil' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>👤 Mes informations personnelles</h3>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Ces informations sont privées et visibles uniquement par vous.</p>
                        <div className="field"><label>Nom complet</label><input type="text" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
                        <div className="field-row"><div className="field"><label>Ville</label><input type="text" value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} /></div><div className="field"><label>Pays</label><input type="text" value={profile.country || ''} onChange={e => setProfile({ ...profile, country: e.target.value })} /></div></div>
                        <button onClick={savePrivateProfile} disabled={saving} className="btn-primary" style={{ width: '100%' }}>{saving ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
                    </div>
                )}

                {/* ===== ONGLET URL (type url uniquement) ===== */}
                {activeTab === 'url' && cardDetails?.page_type === 'url' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>🔗 URL de redirection</h3>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Les personnes qui scannent votre carte seront redirigées vers cette URL.</p>
                        <div className="field"><label>URL</label><input type="url" placeholder="https://exemple.com" value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} /></div>
                        <button onClick={saveUrlContent} disabled={savingContent} className="btn-primary" style={{ width: '100%' }}>{savingContent ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
                    </div>
                )}

                {/* ===== ONGLET WIFI (type wifi uniquement) ===== */}
                {activeTab === 'wifi' && cardDetails?.page_type === 'wifi' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>📶 Configuration Wi-Fi</h3>
                        <div className="field"><label>SSID (nom du réseau)</label><input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} /></div>
                        <div className="field"><label>Mot de passe</label><input type="text" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} /></div>
                        <div className="field"><label>Sécurité</label><select value={wifiSecurity} onChange={e => setWifiSecurity(e.target.value)}><option>WPA</option><option>WEP</option><option>nopass</option></select></div>
                        <button onClick={saveWifiContent} disabled={savingContent} className="btn-primary" style={{ width: '100%' }}>{savingContent ? 'Sauvegarde...' : '💾 Sauvegarder'}</button>
                    </div>
                )}

                {/* ===== ONGLET PROFIL PUBLIC (type profile uniquement) ===== */}
                {activeTab === 'public' && cardDetails?.page_type === 'profile' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>📄 Mon profil public</h3>
                        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Ces informations seront visibles sur votre page publique.</p>
                        <ProfileForm
                            form={publicProfile}
                            onChange={setPublicProfile}
                            onUploadAvatar={uploadPublicAvatar}
                            onUploadBanner={uploadPublicBanner}
                            uploadingAvatar={uploadingAvatar}
                            uploadingBanner={uploadingBanner}
                            readOnly={false}
                        />
                        <button onClick={savePublicProfile} disabled={savingPublicProfile} className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                            {savingPublicProfile ? 'Sauvegarde...' : '💾 Sauvegarder mon profil public'}
                        </button>
                    </div>
                )}

                {/* ===== ONGLET QR CODE ===== */}
                {activeTab === 'qr' && selectedCard && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>📱 Mon QR Code</h3>
                        <p style={{ marginBottom: '16px', fontSize: '13px', color: '#666' }}>Scannez ce QR pour accéder à votre page publique</p>
                        <div style={{ background: '#EBEBDF', padding: '20px', borderRadius: '12px', display: 'inline-block' }}>
                            <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(publicUrl)}`}
                                alt="QR Code"
                                style={{ width: '200px', height: '200px' }}
                            />
                        </div>
                        <p style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '16px', wordBreak: 'break-all' }}>{publicUrl}</p>
                        <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button onClick={() => window.open(publicUrl, '_blank')} className="btn-primary">Voir ma page</button>
                            <button onClick={() => navigator.clipboard.writeText(publicUrl)} className="btn-secondary">Copier le lien</button>
                        </div>
                    </div>
                )}

                {/* ===== ONGLET SÉCURITÉ ===== */}
                {activeTab === 'securite' && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                        <h3 style={{ marginBottom: '16px', color: '#1A1265' }}>🔒 Changer mon mot de passe</h3>
                        <div className="field"><label>Nouveau mot de passe</label><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} /></div>
                        <div className="field"><label>Confirmer</label><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
                        <button onClick={updatePassword} disabled={updatingPassword} className="btn-primary" style={{ width: '100%' }}>{updatingPassword ? 'Mise à jour...' : 'Mettre à jour'}</button>
                    </div>
                )}
            </main>
        </div>
    );
}