// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import ProfileForm from '../../components/ProfileForm.jsx';

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_STYLES = ['square', 'extra-rounded', 'dot'];
const CORNER_DOT_STYLES = ['dot', 'square'];

export default function CreateCardWizard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [step, setStep] = useState(1);
    const [generating, setGenerating] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);

    // Étape 1 : Infos privées du client (visible uniquement par l'admin)
    const [clientInfo, setClientInfo] = useState({
        clientName: '',
        city: '',
        country: 'Bénin'
    });

    // Étape 2 : Type de carte et son contenu
    const [pageType, setPageType] = useState('profile');

    // Pour type URL
    const [redirectUrl, setRedirectUrl] = useState('');

    // Pour type Wi-Fi
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiSecurity, setWifiSecurity] = useState('WPA');

    // Pour type Profile (profil public)
    const [publicProfile, setPublicProfile] = useState({
        full_name: '',
        title: '',
        bio: '',
        photo_url: '',
        banner_url: '',
        theme_color: '#1A1265',
        whatsapp: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        website: '',
        email: '',
        phone: '',
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    // Étape 3 : Apparence QR
    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded',
        dotsColor: '#1A1265',
        bgColor: '#EBEBDF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1A1265',
        cornersDotColor: '#1A1265',
        logo: null,
    });

    // Dossiers disponibles
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (step === 3 && qrRef.current && !qrCode.current) {
            initQRCode();
        }
    }, [step]);

    useEffect(() => {
        if (qrCode.current && step === 3) {
            updateQRCode();
        }
    }, [qrAppearance, step]);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function initQRCode() {
        const previewData = 'https://nfcrafter.app/apercu';
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, type: 'svg',
            data: previewData,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
        });
        if (qrAppearance.logo) {
            qrCode.current.update({ image: qrAppearance.logo });
        }
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }

    function updateQRCode() {
        qrCode.current.update({
            data: 'https://nfcrafter.app/apercu',
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
            image: qrAppearance.logo || '',
        });
    }

    function updateQR(key, value) {
        setQrAppearance(prev => ({ ...prev, [key]: value }));
    }

    async function uploadLogo(file) {
        if (!file) return;
        setUploadingLogo(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateQR('logo', ev.target.result);
            toast('Logo ajouté !', 'success');
            setUploadingLogo(false);
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        updateQR('logo', null);
        toast('Logo supprimé', 'info');
    }

    async function uploadPublicAvatar(file) {
        if (!file) return;
        setUploadingAvatar(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPublicProfile({ ...publicProfile, photo_url: ev.target.result });
            setUploadingAvatar(false);
            toast('Photo ajoutée', 'success');
        };
        reader.readAsDataURL(file);
    }

    async function uploadPublicBanner(file) {
        if (!file) return;
        setUploadingBanner(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPublicProfile({ ...publicProfile, banner_url: ev.target.result });
            setUploadingBanner(false);
            toast('Bannière ajoutée', 'success');
        };
        reader.readAsDataURL(file);
    }

    function validateStep1() {
        if (!clientInfo.clientName.trim()) {
            toast('Le nom du client est obligatoire', 'error');
            return false;
        }
        return true;
    }

    function validateStep2() {
        if (pageType === 'url' && !redirectUrl.trim()) {
            toast('L’URL de redirection est obligatoire', 'error');
            return false;
        }
        if (pageType === 'wifi' && !wifiSsid.trim()) {
            toast('Le SSID (nom du réseau) est obligatoire', 'error');
            return false;
        }
        if (pageType === 'profile' && !publicProfile.full_name?.trim()) {
            toast('Le nom complet du profil public est obligatoire', 'error');
            return false;
        }
        return true;
    }

    async function finalizeCreate() {
        if (!validateStep1() || !validateStep2()) return;

        setGenerating(true);
        const cardId = await generateUniqueCardId();
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        // Construction du profil admin (qui sera le profil public si type = profile)
        let adminProfile = {};
        if (pageType === 'profile') {
            adminProfile = { ...publicProfile };
        } else {
            adminProfile = { full_name: clientInfo.clientName.trim() };
        }

        const cardData = {
            card_id: cardId,
            card_name: clientInfo.clientName.trim(),
            status: 'pending',
            activation_token: token,
            city: clientInfo.city,
            country: clientInfo.country,
            page_type: pageType,
            folder_id: selectedFolder || null,
            admin_profile: adminProfile,
            qr_appearance: {
                dotsType: qrAppearance.dotsType,
                dotsColor: qrAppearance.dotsColor,
                bgColor: qrAppearance.bgColor,
                cornersType: qrAppearance.cornersType,
                cornersDotType: qrAppearance.cornersDotType,
                cornersColor: qrAppearance.cornersColor,
                cornersDotColor: qrAppearance.cornersDotColor,
            },
        };

        if (pageType === 'url') {
            cardData.redirect_url = redirectUrl.trim();
        } else if (pageType === 'wifi') {
            cardData.wifi_ssid = wifiSsid.trim();
            cardData.wifi_password = wifiPassword;
            cardData.wifi_security = wifiSecurity;
        }

        const { error } = await supabase.from('cards').insert(cardData);
        if (error) {
            toast('Erreur : ' + error.message, 'error');
        } else {
            toast(`Carte ${cardId} créée avec succès !`, 'success');
            navigate('/admin');
        }
        setGenerating(false);
    }

    // Mise à jour automatique du nom dans le profil public
    useEffect(() => {
        if (pageType === 'profile' && clientInfo.clientName) {
            setPublicProfile(prev => ({ ...prev, full_name: clientInfo.clientName }));
        }
    }, [clientInfo.clientName, pageType]);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header avec stepper */}
                <div style={{ marginBottom: '32px' }}>
                    <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ marginBottom: '16px' }}>
                        ← Retour à l'administration
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {[
                            { step: 1, label: 'Infos client' },
                            { step: 2, label: 'Type de carte' },
                            { step: 3, label: 'Apparence QR' },
                        ].map(s => (
                            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: step > s.step ? 'var(--success)' : step === s.step ? 'var(--accent)' : 'var(--border)',
                                    color: step >= s.step ? 'white' : 'var(--text-light)',
                                    fontWeight: '700', fontSize: '14px',
                                }}>
                                    {step > s.step ? '✓' : s.step}
                                </div>
                                <span style={{ fontWeight: step === s.step ? '600' : '400', color: step === s.step ? 'var(--accent)' : 'var(--text-light)' }}>
                                    {s.label}
                                </span>
                                {s.step < 3 && <div style={{ width: '40px', height: '1px', background: 'var(--border)', marginLeft: '8px' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ÉTAPE 1 : Infos privées du client */}
                {step === 1 && (
                    <div className="card" style={{ maxWidth: '500px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>👤 Informations client</h2>
                        <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>
                            Ces informations sont privées et visibles uniquement par l'administrateur.
                        </p>

                        <div className="field">
                            <label>Nom complet *</label>
                            <input
                                type="text"
                                placeholder="Jean Dupont"
                                autoFocus
                                value={clientInfo.clientName}
                                onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })}
                            />
                        </div>
                        <div className="field-row">
                            <div className="field">
                                <label>Ville</label>
                                <input
                                    type="text"
                                    placeholder="Cotonou"
                                    value={clientInfo.city}
                                    onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })}
                                />
                            </div>
                            <div className="field">
                                <label>Pays</label>
                                <input
                                    type="text"
                                    placeholder="Bénin"
                                    value={clientInfo.country}
                                    onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label>📁 Dossier (optionnel)</label>
                            <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                                <option value="">— Aucun dossier —</option>
                                {folders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button className="btn-primary" onClick={() => { if (validateStep1()) setStep(2); }}>
                                Suivant →
                            </button>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 2 : Type de carte et contenu */}
                {step === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '24px' }}>📄 Type de carte</h2>

                            <div className="field">
                                <label>Type de carte *</label>
                                <select value={pageType} onChange={e => setPageType(e.target.value)}>
                                    <option value="profile">📄 Page profil public (client modifie son profil)</option>
                                    <option value="url">🔗 Redirection URL (client modifie l'URL)</option>
                                    <option value="wifi">📶 Connexion Wi-Fi (client modifie SSID/mot de passe)</option>
                                </select>
                                <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                                    {pageType === 'profile' && 'Le client pourra modifier son nom, bio, photo, liens sociaux, etc.'}
                                    {pageType === 'url' && 'Le client pourra modifier l\'URL de redirection.'}
                                    {pageType === 'wifi' && 'Le client pourra modifier le SSID et le mot de passe.'}
                                </p>
                            </div>

                            {/* Formulaire pour type URL */}
                            {pageType === 'url' && (
                                <div className="field">
                                    <label>URL de redirection par défaut *</label>
                                    <input
                                        type="url"
                                        placeholder="https://exemple.com"
                                        value={redirectUrl}
                                        onChange={e => setRedirectUrl(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Formulaire pour type Wi-Fi */}
                            {pageType === 'wifi' && (
                                <>
                                    <div className="field">
                                        <label>SSID (nom du réseau) *</label>
                                        <input
                                            type="text"
                                            placeholder="MonWiFi"
                                            value={wifiSsid}
                                            onChange={e => setWifiSsid(e.target.value)}
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Mot de passe</label>
                                        <input
                                            type="text"
                                            placeholder="••••••••"
                                            value={wifiPassword}
                                            onChange={e => setWifiPassword(e.target.value)}
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Sécurité</label>
                                        <select value={wifiSecurity} onChange={e => setWifiSecurity(e.target.value)}>
                                            <option value="WPA">WPA/WPA2</option>
                                            <option value="WEP">WEP</option>
                                            <option value="nopass">Aucun (réseau ouvert)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            {/* Formulaire pour type Profile (profil public) */}
                            {pageType === 'profile' && (
                                <>
                                    <p style={{ fontSize: '13px', color: 'var(--accent)', fontWeight: '600', marginBottom: '16px' }}>
                                        📝 Remplissez le profil public du client
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
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                <button className="btn-ghost" onClick={() => setStep(1)}>← Retour</button>
                                <button className="btn-primary" onClick={() => { if (validateStep2()) setStep(3); }}>
                                    Suivant →
                                </button>
                            </div>
                        </div>

                        {/* Aperçu téléphone */}
                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div className="card" style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '16px' }}>📱 Aperçu de la page publique</h3>
                                <div style={{
                                    background: '#1A1A2E', borderRadius: '32px', padding: '12px',
                                    width: '260px', margin: '0 auto'
                                }}>
                                    <div style={{ background: '#000', borderRadius: '16px', padding: '8px' }}>
                                        <div style={{ background: '#fff', borderRadius: '24px', minHeight: '420px', padding: '16px' }}>
                                            {pageType === 'profile' && (
                                                <div style={{ textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '60px', height: '60px', borderRadius: '50%',
                                                        background: publicProfile.photo_url ? `url(${publicProfile.photo_url}) center/cover` : '#1A1265',
                                                        margin: '0 auto 12px',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '24px', color: 'white'
                                                    }}>
                                                        {!publicProfile.photo_url && '👤'}
                                                    </div>
                                                    <p style={{ fontWeight: 'bold' }}>{publicProfile.full_name || 'Nom du client'}</p>
                                                    <p style={{ fontSize: '11px', color: '#666' }}>{publicProfile.title || 'Titre'}</p>
                                                </div>
                                            )}
                                            {pageType === 'url' && (
                                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔗</div>
                                                    <p style={{ fontSize: '12px', wordBreak: 'break-all' }}>{redirectUrl || 'https://exemple.com'}</p>
                                                    <p style={{ fontSize: '11px', color: '#666', marginTop: '12px' }}>Redirection automatique</p>
                                                </div>
                                            )}
                                            {pageType === 'wifi' && (
                                                <div style={{ textAlign: 'center', padding: '20px' }}>
                                                    <div style={{ fontSize: '48px', marginBottom: '12px' }}>📶</div>
                                                    <p style={{ fontWeight: 'bold' }}>{wifiSsid || 'Nom du réseau'}</p>
                                                    {wifiPassword && <p style={{ fontSize: '11px', color: '#666' }}>Mot de passe : ••••••••</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 3 : Apparence QR */}
                {step === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '24px' }}>🎨 Personnalisation du QR Code</h2>

                            {/* Style des points */}
                            <div className="card" style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Motif</h3>
                                <div className="field">
                                    <label>Style</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {DOT_STYLES.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateQR('dotsType', s)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: '20px',
                                                    border: qrAppearance.dotsType === s ? 'none' : '1px solid var(--border)',
                                                    background: qrAppearance.dotsType === s ? 'var(--accent)' : 'transparent',
                                                    color: qrAppearance.dotsType === s ? 'white' : 'var(--text-light)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Couleur</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={qrAppearance.dotsColor}
                                            onChange={e => updateQR('dotsColor', e.target.value)}
                                            style={{ width: '48px' }}
                                        />
                                        <input
                                            type="text"
                                            value={qrAppearance.dotsColor}
                                            onChange={e => updateQR('dotsColor', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Fond</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={qrAppearance.bgColor}
                                            onChange={e => updateQR('bgColor', e.target.value)}
                                            style={{ width: '48px' }}
                                        />
                                        <input
                                            type="text"
                                            value={qrAppearance.bgColor}
                                            onChange={e => updateQR('bgColor', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Style des coins */}
                            <div className="card" style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Coins</h3>
                                <div className="field">
                                    <label>Style des coins</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {CORNER_STYLES.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateQR('cornersType', s)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: '20px',
                                                    border: qrAppearance.cornersType === s ? 'none' : '1px solid var(--border)',
                                                    background: qrAppearance.cornersType === s ? 'var(--accent)' : 'transparent',
                                                    color: qrAppearance.cornersType === s ? 'white' : 'var(--text-light)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Couleur des coins</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={qrAppearance.cornersColor}
                                            onChange={e => updateQR('cornersColor', e.target.value)}
                                            style={{ width: '48px' }}
                                        />
                                        <input
                                            type="text"
                                            value={qrAppearance.cornersColor}
                                            onChange={e => updateQR('cornersColor', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Style des points intérieurs</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {CORNER_DOT_STYLES.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateQR('cornersDotType', s)}
                                                style={{
                                                    padding: '6px 12px', borderRadius: '20px',
                                                    border: qrAppearance.cornersDotType === s ? 'none' : '1px solid var(--border)',
                                                    background: qrAppearance.cornersDotType === s ? 'var(--accent)' : 'transparent',
                                                    color: qrAppearance.cornersDotType === s ? 'white' : 'var(--text-light)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Couleur des points intérieurs</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="color"
                                            value={qrAppearance.cornersDotColor}
                                            onChange={e => updateQR('cornersDotColor', e.target.value)}
                                            style={{ width: '48px' }}
                                        />
                                        <input
                                            type="text"
                                            value={qrAppearance.cornersDotColor}
                                            onChange={e => updateQR('cornersDotColor', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Logo */}
                            <div className="card">
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Logo</h3>
                                <div className="field">
                                    <label>Image (PNG, SVG, JPG)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => e.target.files[0] && uploadLogo(e.target.files[0])}
                                    />
                                    {uploadingLogo && <p style={{ fontSize: '12px', marginTop: '8px' }}>Chargement...</p>}
                                </div>
                                {qrAppearance.logo && (
                                    <button className="btn-ghost" onClick={removeLogo} style={{ marginTop: '8px' }}>
                                        🗑 Supprimer le logo
                                    </button>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                <button className="btn-ghost" onClick={() => setStep(2)}>← Retour</button>
                                <button className="btn-primary" onClick={finalizeCreate} disabled={generating} style={{ padding: '12px 32px' }}>
                                    {generating ? 'Création...' : '✓ Créer la carte'}
                                </button>
                            </div>
                        </div>

                        {/* Aperçu QR */}
                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div className="card" style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '16px' }}>🔍 Aperçu du QR</h3>
                                <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }} />
                                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                                    Le QR pointera vers: <code style={{ fontSize: '11px' }}>/u/ID_CARTE</code>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}