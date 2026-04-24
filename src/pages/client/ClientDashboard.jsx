// src/pages/client/ClientDashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase.js';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';

export default function ClientDashboard() {
    const navigate = useNavigate();
    const toast = useToast();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profil privé (visible uniquement par le client)
    const [profile, setProfile] = useState({
        full_name: '',
        city: '',
        country: 'Bénin'
    });

    // Mot de passe
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updatingPassword, setUpdatingPassword] = useState(false);

    // Cartes du client
    const [userCards, setUserCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [cardDetails, setCardDetails] = useState(null);
    const [qrCodeImage, setQrCodeImage] = useState(null);
    const [generatingQR, setGeneratingQR] = useState(false);

    // Contenu modifiable selon le type de carte
    const [cardContent, setCardContent] = useState({});
    const [savingContent, setSavingContent] = useState(false);

    // Onglet actif
    const [activeTab, setActiveTab] = useState('profil');

    useEffect(() => {
        loadUserData();
    }, []);

    useEffect(() => {
        if (selectedCard) {
            loadCardDetails();
        }
    }, [selectedCard]);

    async function loadUserData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Charger profil privé
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

        // Charger les cartes du client
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
            .select('page_type, redirect_url, wifi_ssid, wifi_password, wifi_security')
            .eq('card_id', selectedCard.card_id)
            .single();

        setCardDetails(data);
        setCardContent({
            redirect_url: data?.redirect_url || '',
            wifi_ssid: data?.wifi_ssid || '',
            wifi_password: data?.wifi_password || '',
            wifi_security: data?.wifi_security || 'WPA'
        });
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

    async function generateQR() {
        if (!selectedCard) return;
        setGeneratingQR(true);
        const url = `${window.location.origin}/u/${selectedCard.card_id}`;
        const QRCodeStyling = (await import('qr-code-styling')).default;
        const qr = new QRCodeStyling({
            width: 300, height: 300, type: 'svg',
            data: url,
            dotsOptions: { color: '#1A1265', type: 'rounded' },
            backgroundOptions: { color: '#EBEBDF' },
            cornersSquareOptions: { color: '#1A1265', type: 'extra-rounded' },
        });
        const canvas = await qr.getRawData('png');
        setQrCodeImage(canvas);
        setGeneratingQR(false);
    }

    async function logout() {
        await supabase.auth.signOut();
        navigate('/login');
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <p>Chargement...</p>
            </div>
        );
    }

    // Déterminer les onglets disponibles
    const getTabs = () => {
        const tabs = [{ id: 'profil', label: '👤 Mon profil' }];

        if (selectedCard) {
            tabs.push({ id: 'carte', label: '💳 Ma carte' });

            if (cardDetails?.page_type === 'url') {
                tabs.push({ id: 'contenu', label: '🔗 URL' });
            } else if (cardDetails?.page_type === 'wifi') {
                tabs.push({ id: 'contenu', label: '📶 Wi-Fi' });
            } else if (cardDetails?.page_type === 'profile') {
                tabs.push({ id: 'contenu', label: '📄 Profil public' });
            }

            tabs.push({ id: 'qr', label: '▣ QR Code' });
        }

        tabs.push({ id: 'securite', label: '🔒 Sécurité' });
        return tabs;
    };

    const tabs = getTabs();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Header */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '680px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>NFCrafter</span>
                    </div>
                    <button className="btn-ghost" onClick={logout} style={{ padding: '8px 16px', fontSize: '13px' }}>
                        Déconnexion
                    </button>
                </div>
            </header>

            <main style={{ maxWidth: '680px', margin: '0 auto', padding: '24px 16px' }}>

                {/* Sélecteur de carte (si plusieurs cartes) */}
                {userCards.length > 1 && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <label>Mes cartes</label>
                        <select
                            value={selectedCard?.card_id || ''}
                            onChange={e => setSelectedCard(userCards.find(c => c.card_id === e.target.value))}
                        >
                            {userCards.map(c => (
                                <option key={c.card_id} value={c.card_id}>
                                    {c.profile_name || c.card_id}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Onglets */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                            padding: '10px 16px', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                            background: activeTab === tab.id ? 'var(--accent)' : 'var(--bg-white)',
                            color: activeTab === tab.id ? 'white' : 'var(--text-light)',
                        }}>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab PROFIL PRIVÉ */}
                {activeTab === 'profil' && (
                    <div className="card">
                        <h3 style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--accent)' }}>👤 Mes informations personnelles</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                            Ces informations sont privées et visibles uniquement par vous.
                        </p>

                        <div className="field">
                            <label>Nom complet</label>
                            <input type="text" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                        </div>
                        <div className="field-row">
                            <div className="field">
                                <label>Ville</label>
                                <input type="text" placeholder="Cotonou" value={profile.city || ''} onChange={e => setProfile({ ...profile, city: e.target.value })} />
                            </div>
                            <div className="field">
                                <label>Pays</label>
                                <input type="text" placeholder="Bénin" value={profile.country || ''} onChange={e => setProfile({ ...profile, country: e.target.value })} />
                            </div>
                        </div>

                        <button className="btn-primary" onClick={savePrivateProfile} disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>
                            {saving ? 'Sauvegarde...' : '💾 Sauvegarder mon profil'}
                        </button>
                    </div>
                )}

                {/* Tab INFO CARTE */}
                {activeTab === 'carte' && selectedCard && (
                    <div className="card">
                        <h3 style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--accent)' }}>💳 Informations de ma carte</h3>

                        <InfoRow label="ID de la carte" value={selectedCard.card_id} />
                        <InfoRow label="Nom de la carte" value={selectedCard.profile_name || '—'} />
                        <InfoRow label="Type de carte" value={
                            cardDetails?.page_type === 'profile' ? '📄 Page profil' :
                                cardDetails?.page_type === 'url' ? '🔗 Redirection URL' :
                                    cardDetails?.page_type === 'wifi' ? '📶 Connexion Wi-Fi' : '—'
                        } />
                        <InfoRow label="Lien public" value={`${window.location.origin}/u/${selectedCard.card_id}`} isLink />
                    </div>
                )}

                {/* Tab CONTENU (selon le type de carte) */}
                {activeTab === 'contenu' && cardDetails && (
                    <div className="card">
                        <h3 style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--accent)' }}>
                            {cardDetails.page_type === 'url' && '🔗 URL de redirection'}
                            {cardDetails.page_type === 'wifi' && '📶 Configuration Wi-Fi'}
                            {cardDetails.page_type === 'profile' && '📄 Mon profil public'}
                        </h3>

                        {cardDetails.page_type === 'url' && (
                            <>
                                <div className="field">
                                    <label>URL de redirection</label>
                                    <input
                                        type="url"
                                        placeholder="https://exemple.com"
                                        value={cardContent.redirect_url || ''}
                                        onChange={e => setCardContent({ ...cardContent, redirect_url: e.target.value })}
                                    />
                                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                                        Les personnes qui scannent votre carte seront redirigées vers cette URL.
                                    </p>
                                </div>
                                <button className="btn-primary" onClick={saveCardContent} disabled={savingContent} style={{ width: '100%' }}>
                                    {savingContent ? 'Sauvegarde...' : '💾 Sauvegarder l\'URL'}
                                </button>
                            </>
                        )}

                        {cardDetails.page_type === 'wifi' && (
                            <>
                                <div className="field">
                                    <label>SSID (nom du réseau)</label>
                                    <input type="text" value={cardContent.wifi_ssid || ''} onChange={e => setCardContent({ ...cardContent, wifi_ssid: e.target.value })} />
                                </div>
                                <div className="field">
                                    <label>Mot de passe</label>
                                    <input type="text" value={cardContent.wifi_password || ''} onChange={e => setCardContent({ ...cardContent, wifi_password: e.target.value })} />
                                </div>
                                <div className="field">
                                    <label>Sécurité</label>
                                    <select value={cardContent.wifi_security || 'WPA'} onChange={e => setCardContent({ ...cardContent, wifi_security: e.target.value })}>
                                        <option>WPA</option><option>WEP</option><option>nopass</option>
                                    </select>
                                </div>
                                <button className="btn-primary" onClick={saveCardContent} disabled={savingContent} style={{ width: '100%' }}>
                                    {savingContent ? 'Sauvegarde...' : '💾 Sauvegarder le Wi-Fi'}
                                </button>
                            </>
                        )}

                        {cardDetails.page_type === 'profile' && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p style={{ color: 'var(--accent)', marginBottom: '8px' }}>📄 Votre page publique</p>
                                <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                    Pour modifier votre profil public (nom, bio, photo, liens sociaux),
                                    <br />contactez l'administrateur.
                                </p>
                                <a href={`/u/${selectedCard.card_id}`} target="_blank" className="btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>
                                    Voir ma page publique →
                                </a>
                            </div>
                        )}
                    </div>
                )}

                {/* Tab QR CODE */}
                {activeTab === 'qr' && selectedCard && (
                    <div className="card" style={{ textAlign: 'center' }}>
                        <h3 style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--accent)' }}>📱 Mon QR Code</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                            Scannez ce QR pour accéder à votre page publique
                        </p>

                        {qrCodeImage ? (
                            <div>
                                <img src={URL.createObjectURL(qrCodeImage)} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px' }}>
                                    <a href={URL.createObjectURL(qrCodeImage)} download={`qr-${selectedCard.card_id}.png`} className="btn-primary" style={{ textDecoration: 'none' }}>
                                        ⬇ Télécharger PNG
                                    </a>
                                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(`${window.location.origin}/u/${selectedCard.card_id}`)}>
                                        📋 Copier le lien
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button className="btn-primary" onClick={generateQR} disabled={generatingQR}>
                                {generatingQR ? 'Génération...' : '🎨 Générer mon QR Code'}
                            </button>
                        )}
                    </div>
                )}

                {/* Tab SÉCURITÉ */}
                {activeTab === 'securite' && (
                    <div className="card">
                        <h3 style={{ fontWeight: '700', marginBottom: '16px', color: 'var(--accent)' }}>🔒 Changer mon mot de passe</h3>

                        <div className="field">
                            <label>Nouveau mot de passe</label>
                            <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                        <div className="field">
                            <label>Confirmer</label>
                            <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                        </div>

                        <button className="btn-primary" onClick={updatePassword} disabled={updatingPassword} style={{ width: '100%', justifyContent: 'center' }}>
                            {updatingPassword ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
}

function InfoRow({ label, value, isLink }) {
    return (
        <div style={{ marginBottom: '12px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '2px' }}>{label}</p>
            {isLink ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input readOnly value={value} style={{ flex: 1, fontSize: '12px', fontFamily: 'monospace' }} />
                    <button className="btn-secondary" onClick={() => navigator.clipboard.writeText(value)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                        Copier
                    </button>
                </div>
            ) : (
                <p style={{ fontWeight: '600', fontFamily: value.includes('/') ? 'monospace' : 'inherit' }}>{value}</p>
            )}
        </div>
    );
}