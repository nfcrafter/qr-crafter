// src/pages/admin/CardSettings.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';

const SOCIAL_FIELDS = [
    { key: 'full_name', label: 'Nom complet', type: 'text', placeholder: 'Jean Dupont' },
    { key: 'title', label: 'Titre / Poste', type: 'text', placeholder: 'Designer, Entrepreneur...' },
    { key: 'bio', label: 'Bio', type: 'textarea', placeholder: 'Description...' },
    { key: 'photo_url', label: 'Photo (URL)', type: 'text', placeholder: 'https://...' },
    { key: 'banner_url', label: 'Bannière (URL)', type: 'text', placeholder: 'https://...' },
    { key: 'theme_color', label: 'Couleur thème', type: 'color' },
    { key: 'whatsapp', label: 'WhatsApp', type: 'text', placeholder: '+229...' },
    { key: 'phone', label: 'Téléphone', type: 'text', placeholder: '+229...' },
    { key: 'email', label: 'Email', type: 'email', placeholder: 'jean@example.com' },
    { key: 'instagram', label: 'Instagram', type: 'text', placeholder: 'https://instagram.com/...' },
    { key: 'facebook', label: 'Facebook', type: 'text', placeholder: 'https://facebook.com/...' },
    { key: 'tiktok', label: 'TikTok', type: 'text', placeholder: 'https://tiktok.com/...' },
    { key: 'twitter', label: 'X / Twitter', type: 'text', placeholder: 'https://x.com/...' },
    { key: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'https://linkedin.com/...' },
    { key: 'youtube', label: 'YouTube', type: 'text', placeholder: 'https://youtube.com/...' },
    { key: 'website', label: 'Site web', type: 'text', placeholder: 'https://...' },
];

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_STYLES = ['square', 'extra-rounded', 'dot'];
const CORNER_DOT_STYLES = ['dot', 'square'];

const THEME_COLORS = [
    { label: 'NFCrafter', bg: '#1A1265' },
    { label: 'Noir', bg: '#1a1a1a' },
    { label: 'Bleu', bg: '#1877F2' },
    { label: 'Vert', bg: '#25D366' },
    { label: 'Rouge', bg: '#E53935' },
    { label: 'Or', bg: '#F59E0B' },
    { label: 'Rose', bg: '#E1306C' },
    { label: 'Violet', bg: '#7C3AED' },
];

const SECTIONS = [
    { id: 'infos', icon: '📋', label: 'Informations' },
    { id: 'profil', icon: '👤', label: 'Profil' },
    { id: 'contenu', icon: '📄', label: 'Contenu' },
    { id: 'design', icon: '🎨', label: 'Design page' },
    { id: 'qr', icon: '▣', label: 'QR Code' },
    { id: 'danger', icon: '⚠️', label: 'Danger' },
];

export default function CardSettings() {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [card, setCard] = useState(null);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeSection, setActiveSection] = useState('infos');
    const [saving, setSaving] = useState(false);
    const [savingQR, setSavingQR] = useState(false);
    const [showWifiPassword, setShowWifiPassword] = useState(false);

    // Profil form
    const [profileForm, setProfileForm] = useState({});

    // Contenu selon le type de carte
    const [redirectUrl, setRedirectUrl] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiSecurity, setWifiSecurity] = useState('WPA');
    const [savingContent, setSavingContent] = useState(false);

    // QR appearance
    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded',
        dotsColor: '#1A1265',
        bgColor: '#EBEBDF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1A1265',
        cornersDotColor: '#1A1265',
    });

    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const avatarRef = useRef(null);
    const bannerRef = useRef(null);

    useEffect(() => {
        loadCard();
        loadFolders();
    }, [cardId]);

    useEffect(() => {
        if (activeSection === 'qr' && qrRef.current && !qrCode.current) {
            initQRCode();
        }
    }, [activeSection]);

    useEffect(() => {
        if (qrCode.current && activeSection === 'qr') {
            updateQRCode();
        }
    }, [qrAppearance]);

    async function loadCard() {
        setLoading(true);
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('card_id', cardId)
            .single();

        if (error || !data) {
            toast('Carte introuvable', 'error');
            navigate('/admin');
            return;
        }

        setCard(data);
        setProfileForm(data.admin_profile || {});
        setRedirectUrl(data.redirect_url || '');
        setWifiSsid(data.wifi_ssid || '');
        setWifiPassword(data.wifi_password || '');
        setWifiSecurity(data.wifi_security || 'WPA');

        if (data.qr_appearance) {
            setQrAppearance({ ...qrAppearance, ...data.qr_appearance });
        }

        setLoading(false);
    }

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function initQRCode() {
        const url = `${window.location.origin}/u/${cardId}`;
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, type: 'svg',
            data: url,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
        });
        qrRef.current.innerHTML = '';
        qrCode.current.append(qrRef.current);
    }

    function updateQRCode() {
        const url = `${window.location.origin}/u/${cardId}`;
        qrCode.current.update({
            data: url,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
        });
    }

    function updateQR(key, value) {
        setQrAppearance(prev => ({ ...prev, [key]: value }));
    }

    async function uploadImage(file, bucket, field) {
        const maxSize = bucket === 'avatars' ? 3 * 1024 * 1024 : 8 * 1024 * 1024;
        if (file.size > maxSize) {
            toast('Image trop lourde', 'warning');
            return;
        }
        if (bucket === 'avatars') setUploadingAvatar(true);
        else setUploadingBanner(true);

        const ext = file.name.split('.').pop();
        const path = `admin/${cardId}/${field}_${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

        if (error) {
            toast('Erreur upload : ' + error.message, 'error');
        } else {
            const { data } = supabase.storage.from(bucket).getPublicUrl(path);
            setProfileForm(f => ({ ...f, [field]: data.publicUrl }));
            toast('Image uploadée !', 'success');
        }

        if (bucket === 'avatars') setUploadingAvatar(false);
        else setUploadingBanner(false);
    }

    async function saveProfile() {
        if (!profileForm.full_name?.trim()) {
            toast('Le nom complet est obligatoire', 'error');
            return;
        }
        setSaving(true);
        const { error } = await supabase
            .from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', cardId);

        if (error) toast('Erreur lors de la sauvegarde', 'error');
        else {
            toast('Profil sauvegardé !', 'success');
            loadCard();
        }
        setSaving(false);
    }

    async function saveContent() {
        setSavingContent(true);
        const updateData = {};

        if (card?.page_type === 'url') {
            if (!redirectUrl.trim()) {
                toast('L’URL de redirection est obligatoire', 'error');
                setSavingContent(false);
                return;
            }
            updateData.redirect_url = redirectUrl.trim();
        } else if (card?.page_type === 'wifi') {
            if (!wifiSsid.trim()) {
                toast('Le SSID (nom du réseau) est obligatoire', 'error');
                setSavingContent(false);
                return;
            }
            updateData.wifi_ssid = wifiSsid.trim();
            updateData.wifi_password = wifiPassword;
            updateData.wifi_security = wifiSecurity;
        }

        const { error } = await supabase
            .from('cards')
            .update(updateData)
            .eq('card_id', cardId);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Contenu sauvegardé !', 'success');
        setSavingContent(false);
    }

    async function saveQRAppearance() {
        setSavingQR(true);
        const { error } = await supabase
            .from('cards')
            .update({ qr_appearance: qrAppearance })
            .eq('card_id', cardId);

        if (error) toast('Erreur sauvegarde QR', 'error');
        else toast('Style QR sauvegardé !', 'success');
        setSavingQR(false);
    }

    async function moveToFolder(folderId) {
        const { error } = await supabase
            .from('cards')
            .update({ folder_id: folderId || null })
            .eq('card_id', cardId);

        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Dossier mis à jour', 'success');
            loadCard();
        }
    }

    async function deleteCard() {
        const { error } = await supabase.from('cards').delete().eq('card_id', cardId);
        if (error) toast('Erreur suppression', 'error');
        else {
            toast('Carte supprimée', 'warning');
            navigate('/admin');
        }
    }

    function downloadQR(format = 'png') {
        if (!qrCode.current) return;
        qrCode.current.download({ name: `QR-NFCrafter-${cardId}`, extension: format });
        toast(`Téléchargé en ${format.toUpperCase()} !`, 'success');
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text);
        toast(`${label} copié !`, 'info');
    }

    function updateProfile(key, value) {
        setProfileForm(f => ({ ...f, [key]: value }));
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
                <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
            </div>
        );
    }

    const publicUrl = `${window.location.origin}/u/${cardId}`;
    const activationUrl = `${window.location.origin}/register?card=${cardId}&token=${card?.activation_token}`;
    const activationUrlExisting = `${window.location.origin}/activate?card=${cardId}&token=${card?.activation_token}`;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
            {/* Header */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 24px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <button className="btn-ghost" onClick={() => navigate('/admin')} style={{ padding: '7px 14px', fontSize: '13px', flexShrink: 0 }}>
                        ← Retour
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '800', fontSize: '20px', color: 'var(--accent)', flexShrink: 0 }}>
                            #{cardId}
                        </span>
                        <span style={{ fontSize: '14px', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {card?.admin_profile?.full_name || card?.card_name || '—'}
                        </span>
                        <span style={{
                            fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: 'var(--radius-pill)', flexShrink: 0,
                            background: card?.status === 'active' ? '#e8f5e9' : '#fff3e0',
                            color: card?.status === 'active' ? '#2e7d32' : '#e65100',
                        }}>
                            {card?.status === 'active' ? '✅ Active' : '⏳ En attente'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button className="btn-ghost" onClick={() => window.open(publicUrl, '_blank')} style={{ fontSize: '13px', padding: '7px 14px' }}>
                            👁 Voir la page
                        </button>
                        <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ fontSize: '13px', padding: '7px 18px' }}>
                            {saving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                        </button>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', maxWidth: '1100px', margin: '0 auto', padding: '28px 24px', alignItems: 'start' }}>
                {/* Sidebar sections */}
                <div className="card" style={{ padding: '8px', position: 'sticky', top: '72px' }}>
                    {SECTIONS.map(s => (
                        <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '10px 12px', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '13px',
                            fontFamily: 'var(--font-body)', fontWeight: activeSection === s.id ? '700' : '400',
                            background: activeSection === s.id ? 'var(--accent-light)' : 'transparent',
                            color: activeSection === s.id ? 'var(--accent)' : s.id === 'danger' ? '#e53935' : 'var(--text)',
                            transition: 'all 0.15s', textAlign: 'left', marginBottom: '2px',
                        }}>
                            <span style={{ fontSize: '15px' }}>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Contenu principal */}
                <div>
                    {/* SECTION INFOS */}
                    {activeSection === 'infos' && (
                        <div className="card">
                            <h2 style={titleStyle}>📋 Informations de la carte</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <InfoBox label="ID de la carte" value={`#${card?.card_id}`} mono accent />
                                <InfoBox label="Nom client" value={card?.card_name || '—'} />
                                <InfoBox label="Statut" value={card?.status === 'active' ? '✅ Active' : '⏳ En attente'} />
                                <InfoBox label="Type" value={card?.page_type === 'profile' ? '📄 Profil' : card?.page_type === 'url' ? '🔗 URL' : '📶 Wi-Fi'} />
                                <InfoBox label="Ville / Pays" value={`${card?.city || '—'}, ${card?.country || 'Bénin'}`} />
                                <InfoBox label="Créée le" value={new Date(card?.created_at).toLocaleDateString('fr-FR')} />
                            </div>

                            <div className="field">
                                <label>📁 Dossier</label>
                                <select value={card?.folder_id || ''} onChange={e => moveToFolder(e.target.value || null)}>
                                    <option value="">— Aucun dossier —</option>
                                    {folders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
                                </select>
                            </div>

                            <div className="field">
                                <label>🌐 Lien public (à encoder sur la carte NFC)</label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input readOnly value={publicUrl} style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }} />
                                    <button className="btn-primary" onClick={() => copyText(publicUrl, 'Lien NFC')} style={{ whiteSpace: 'nowrap' }}>
                                        📡 Copier
                                    </button>
                                </div>
                                <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '6px' }}>
                                    👆 Collez ce lien dans NFC Tools pour encoder la carte physique
                                </p>
                            </div>
                        </div>
                    )}

                    {/* SECTION PROFIL */}
                    {activeSection === 'profil' && (
                        <div className="card">
                            <h2 style={titleStyle}>👤 Profil public du client</h2>

                            {/* Bannière */}
                            <div className="field">
                                <label>Bannière</label>
                                <div onClick={() => bannerRef.current?.click()} style={{
                                    height: '130px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                    border: '2px dashed var(--border)', overflow: 'hidden', position: 'relative',
                                    background: profileForm.banner_url ? `url(${profileForm.banner_url}) center/cover` : (profileForm.theme_color || 'var(--accent)'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <span style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>
                                            {uploadingBanner ? '⏳ Upload...' : profileForm.banner_url ? '✏️ Modifier la bannière' : '📷 Ajouter une bannière'}
                                        </span>
                                    </div>
                                </div>
                                <input ref={bannerRef} type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'banners', 'banner_url')} />
                            </div>

                            {/* Avatar */}
                            <div className="field">
                                <label>Photo de profil</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div onClick={() => avatarRef.current?.click()} style={{
                                        width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
                                        border: '3px solid var(--border)', cursor: 'pointer', overflow: 'hidden',
                                        background: profileForm.photo_url ? `url(${profileForm.photo_url}) center/cover` : 'var(--accent-light)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                                    }}>
                                        {!profileForm.photo_url && (uploadingAvatar ? '⏳' : '👤')}
                                    </div>
                                    <div>
                                        <button className="btn-secondary" onClick={() => avatarRef.current?.click()} style={{ fontSize: '13px', padding: '8px 16px' }}>
                                            {uploadingAvatar ? 'Upload...' : '📷 Choisir une photo'}
                                        </button>
                                        <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>PNG, JPG · max 3MB</p>
                                    </div>
                                </div>
                                <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }}
                                    onChange={e => e.target.files[0] && uploadImage(e.target.files[0], 'avatars', 'photo_url')} />
                            </div>

                            {/* Champs profil */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                {SOCIAL_FIELDS.map(field => (
                                    <div key={field.key} className="field" style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                                        <label>{field.label}{field.key === 'full_name' && <span style={{ color: 'var(--error)' }}> *</span>}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea rows={3} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => updateProfile(field.key, e.target.value)} />
                                        ) : field.type === 'color' ? (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input type="color" value={profileForm[field.key] || '#1A1265'} onChange={e => updateProfile(field.key, e.target.value)} style={{ width: '48px' }} />
                                                <input type="text" value={profileForm[field.key] || '#1A1265'} onChange={e => updateProfile(field.key, e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
                                            </div>
                                        ) : (
                                            <input type={field.type} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => updateProfile(field.key, e.target.value)} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}>
                                {saving ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
                            </button>
                        </div>
                    )}

                    {/* SECTION CONTENU (selon type de carte) */}
                    {activeSection === 'contenu' && (
                        <div className="card">
                            <h2 style={titleStyle}>
                                {card?.page_type === 'profile' && '📄 Page profil personnalisable'}
                                {card?.page_type === 'url' && '🔗 Redirection URL'}
                                {card?.page_type === 'wifi' && '📶 Configuration Wi-Fi'}
                            </h2>

                            {card?.page_type === 'profile' && (
                                <div style={{ padding: '20px', background: 'var(--accent-light)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
                                    <p style={{ color: 'var(--accent)', marginBottom: '8px' }}>✏️ Le client gère lui-même son profil</p>
                                    <p style={{ fontSize: '13px', color: 'var(--text-light)' }}>
                                        Le client peut modifier son nom, bio, liens sociaux, photo, etc. dans son dashboard.
                                        <br />L'admin ne peut pas modifier ces informations à la place du client.
                                    </p>
                                </div>
                            )}

                            {card?.page_type === 'url' && (
                                <>
                                    <div className="field">
                                        <label>URL de redirection</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="url"
                                                placeholder="https://exemple.com"
                                                value={redirectUrl}
                                                onChange={e => setRedirectUrl(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                className="btn-secondary"
                                                onClick={() => window.open(redirectUrl, '_blank')}
                                                disabled={!redirectUrl}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                Tester
                                            </button>
                                        </div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '4px' }}>
                                            Cette URL sera utilisée lorsque quelqu'un scannera la carte. Le client peut la modifier depuis son dashboard.
                                        </p>
                                    </div>
                                    <button className="btn-primary" onClick={saveContent} disabled={savingContent} style={{ width: '100%', justifyContent: 'center' }}>
                                        {savingContent ? 'Sauvegarde...' : '💾 Sauvegarder l\'URL par défaut'}
                                    </button>
                                </>
                            )}

                            {card?.page_type === 'wifi' && (
                                <>
                                    <div className="field">
                                        <label>SSID (nom du réseau)</label>
                                        <input type="text" placeholder="MonWiFi" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} />
                                    </div>
                                    <div className="field">
                                        <label>Mot de passe</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type={showWifiPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={wifiPassword}
                                                onChange={e => setWifiPassword(e.target.value)}
                                                style={{ flex: 1 }}
                                            />
                                            <button
                                                type="button"
                                                className="btn-ghost"
                                                onClick={() => setShowWifiPassword(!showWifiPassword)}
                                                style={{ whiteSpace: 'nowrap' }}
                                            >
                                                {showWifiPassword ? '🙈 Masquer' : '👁 Afficher'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label>Sécurité</label>
                                        <select value={wifiSecurity} onChange={e => setWifiSecurity(e.target.value)}>
                                            <option value="WPA">WPA/WPA2</option>
                                            <option value="WEP">WEP</option>
                                            <option value="nopass">Aucun (réseau ouvert)</option>
                                        </select>
                                    </div>
                                    <p style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '16px' }}>
                                        Ces identifiants seront affichés lorsque quelqu'un scannera la carte. Le client peut les modifier depuis son dashboard.
                                    </p>
                                    <button className="btn-primary" onClick={saveContent} disabled={savingContent} style={{ width: '100%', justifyContent: 'center' }}>
                                        {savingContent ? 'Sauvegarde...' : '💾 Sauvegarder les identifiants par défaut'}
                                    </button>
                                </>
                            )}
                        </div>
                    )}

                    {/* SECTION DESIGN PAGE */}
                    {activeSection === 'design' && (
                        <div className="card">
                            <h2 style={titleStyle}>🎨 Design de la page publique</h2>

                            <div className="field">
                                <label>Couleur principale</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '12px' }}>
                                    {THEME_COLORS.map(c => (
                                        <button key={c.bg} onClick={() => updateProfile('theme_color', c.bg)} style={{
                                            height: '44px', borderRadius: 'var(--radius-md)', background: c.bg,
                                            border: profileForm.theme_color === c.bg ? '3px solid #fff' : '2px solid transparent',
                                            cursor: 'pointer', color: 'white', fontSize: '11px', fontWeight: '600',
                                            boxShadow: profileForm.theme_color === c.bg ? `0 0 0 3px ${c.bg}` : 'var(--shadow)',
                                        }}>{c.label}</button>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input type="color" value={profileForm.theme_color || '#1A1265'} onChange={e => updateProfile('theme_color', e.target.value)} style={{ width: '48px' }} />
                                    <input type="text" value={profileForm.theme_color || '#1A1265'} onChange={e => updateProfile('theme_color', e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
                                </div>
                            </div>

                            {/* Aperçu */}
                            <div style={{ marginTop: '24px' }}>
                                <label>Aperçu de la page publique</label>
                                <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)', maxWidth: '300px', boxShadow: 'var(--shadow)' }}>
                                    <div style={{ height: '70px', background: profileForm.banner_url ? `url(${profileForm.banner_url}) center/cover` : (profileForm.theme_color || '#1A1265') }} />
                                    <div style={{ background: 'white', padding: '44px 16px 16px', position: 'relative' }}>
                                        <div style={{
                                            position: 'absolute', top: '-28px', left: '12px',
                                            width: '56px', height: '56px', borderRadius: '50%',
                                            border: '3px solid white',
                                            background: profileForm.photo_url ? `url(${profileForm.photo_url}) center/cover` : (profileForm.theme_color || '#1A1265'),
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px',
                                        }}>
                                            {!profileForm.photo_url && '👤'}
                                        </div>
                                        <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{profileForm.full_name || 'Nom du client'}</p>
                                        {profileForm.title && <p style={{ fontSize: '11px', color: profileForm.theme_color || '#1A1265', fontWeight: '600', marginBottom: '4px' }}>{profileForm.title}</p>}
                                        {profileForm.bio && <p style={{ fontSize: '11px', color: '#666', lineHeight: '1.4' }}>{profileForm.bio.substring(0, 60)}{profileForm.bio.length > 60 ? '...' : ''}</p>}
                                        <div style={{ marginTop: '10px', height: '28px', borderRadius: '6px', background: profileForm.theme_color || '#1A1265', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <span style={{ color: 'white', fontSize: '10px', fontWeight: '600' }}>👤 Enregistrer le contact</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '24px' }}>
                                {saving ? 'Sauvegarde...' : '💾 Sauvegarder le design'}
                            </button>
                        </div>
                    )}

                    {/* SECTION QR CODE */}
                    {activeSection === 'qr' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div className="card">
                                <h2 style={titleStyle}>▣ Aperçu et export</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px', alignItems: 'start' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '12px', boxShadow: 'var(--shadow-lg)' }} />
                                        <p style={{ fontSize: '11px', color: 'var(--text-light)', fontFamily: 'monospace', marginBottom: '16px', wordBreak: 'break-all' }}>{publicUrl}</p>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                                            {['png', 'svg', 'jpeg'].map(fmt => (
                                                <button key={fmt} className="btn-secondary" onClick={() => downloadQR(fmt)} style={{ padding: '7px 14px', fontSize: '12px' }}>
                                                    ⬇ {fmt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <div style={{ padding: '16px', background: 'var(--accent-light)', borderRadius: 'var(--radius-lg)', marginBottom: '12px' }}>
                                            <h3 style={{ fontWeight: '700', color: 'var(--accent)', fontSize: '13px', marginBottom: '8px' }}>📡 Encoder sur NFC</h3>
                                            <div style={{ display: 'flex', gap: '6px' }}>
                                                <input readOnly value={publicUrl} style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }} />
                                                <button className="btn-primary" onClick={() => copyText(publicUrl, 'Lien NFC')} style={{ padding: '7px 12px', fontSize: '12px' }}>📋</button>
                                            </div>
                                        </div>
                                        <div style={{ padding: '14px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', fontSize: '12px', color: 'var(--text-light)' }}>
                                            <strong style={{ color: 'var(--text)' }}>💡 Ce QR est permanent.</strong> Le lien reste le même même si le client modifie son contenu.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h2 style={titleStyle}>🎨 Style du QR Code</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                                    <div>
                                        <StylePicker label="Style des modules" valueKey="dotsType" options={DOT_STYLES} appearance={qrAppearance} update={updateQR} />
                                        <ColorPicker label="Couleur des modules" valueKey="dotsColor" appearance={qrAppearance} update={updateQR} />
                                        <ColorPicker label="Couleur fond" valueKey="bgColor" appearance={qrAppearance} update={updateQR} />
                                    </div>
                                    <div>
                                        <StylePicker label="Style des coins" valueKey="cornersType" options={CORNER_STYLES} appearance={qrAppearance} update={updateQR} />
                                        <ColorPicker label="Couleur des coins" valueKey="cornersColor" appearance={qrAppearance} update={updateQR} />
                                        <StylePicker label="Style point coins" valueKey="cornersDotType" options={CORNER_DOT_STYLES} appearance={qrAppearance} update={updateQR} />
                                        <ColorPicker label="Couleur point coins" valueKey="cornersDotColor" appearance={qrAppearance} update={updateQR} />
                                    </div>
                                </div>

                                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                    <label style={{ fontSize: '13px', fontWeight: '500', marginBottom: '10px', display: 'block' }}>Presets rapides</label>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {[
                                            { label: '🎯 Classic', app: { dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#EBEBDF', cornersType: 'extra-rounded', cornersDotType: 'dot', cornersColor: '#1A1265', cornersDotColor: '#1A1265' } },
                                            { label: '⬛ Dark', app: { dotsType: 'dots', dotsColor: '#000000', bgColor: '#ffffff', cornersType: 'extra-rounded', cornersDotType: 'dot', cornersColor: '#000000', cornersDotColor: '#000000' } },
                                            { label: '💜 Purple', app: { dotsType: 'classy-rounded', dotsColor: '#7C3AED', bgColor: '#f5f0ff', cornersType: 'extra-rounded', cornersDotType: 'dot', cornersColor: '#7C3AED', cornersDotColor: '#7C3AED' } },
                                            { label: '💚 Green', app: { dotsType: 'rounded', dotsColor: '#25D366', bgColor: '#f0fff4', cornersType: 'square', cornersDotType: 'square', cornersColor: '#128C7E', cornersDotColor: '#128C7E' } },
                                        ].map(preset => (
                                            <button key={preset.label} onClick={() => setQrAppearance(preset.app)} style={{
                                                padding: '7px 14px', borderRadius: 'var(--radius-pill)',
                                                border: '1.5px solid var(--border)', background: 'var(--bg-white)', cursor: 'pointer',
                                                fontSize: '13px', transition: 'all 0.15s',
                                            }}>
                                                {preset.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <button className="btn-primary" onClick={saveQRAppearance} disabled={savingQR} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '20px' }}>
                                    {savingQR ? 'Sauvegarde...' : '💾 Sauvegarder le style QR'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* SECTION DANGER */}
                    {activeSection === 'danger' && (
                        <div className="card" style={{ border: '1.5px solid #ffcdd2' }}>
                            <h2 style={{ ...titleStyle, color: '#e53935' }}>⚠️ Zone de danger</h2>
                            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '24px' }}>
                                Les actions ci-dessous sont <strong>irréversibles</strong>. Procédez avec précaution.
                            </p>

                            {/* Lien éjection client */}
                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: 'var(--radius-lg)', border: '1px solid #ffcdd2', marginBottom: '20px' }}>
                                <h3 style={{ color: '#c62828', fontWeight: '700', marginBottom: '6px' }}>🔗 Lien d'activation</h3>
                                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Envoyez ce lien au client pour qu'il active sa carte :</p>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input readOnly value={activationUrl} style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }} />
                                    <button className="btn-primary" onClick={() => copyText(activationUrl, 'Lien activation')}>📋 Copier</button>
                                </div>
                                <p style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '12px' }}>🔁 Si le client a déjà un compte, utilisez ce lien :</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                    <input readOnly value={activationUrlExisting} style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }} />
                                    <button className="btn-primary" onClick={() => copyText(activationUrlExisting, 'Lien activation existant')}>📋 Copier</button>
                                </div>
                            </div>

                            {/* Suppression */}
                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: 'var(--radius-lg)', border: '1px solid #ffcdd2' }}>
                                <h3 style={{ color: '#c62828', fontWeight: '700', marginBottom: '6px' }}>Supprimer la carte #{cardId}</h3>
                                <p style={{ fontSize: '13px', color: '#e57373', marginBottom: '20px' }}>
                                    La carte est supprimée définitivement. Le lien <code>/u/{cardId}</code> ne fonctionnera plus.
                                </p>
                                {!showDeleteConfirm ? (
                                    <button onClick={() => setShowDeleteConfirm(true)} style={{
                                        background: 'transparent', border: '1.5px solid #e53935', color: '#e53935',
                                        borderRadius: 'var(--radius-sm)', padding: '10px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                                    }}>
                                        🗑 Supprimer cette carte
                                    </button>
                                ) : (
                                    <div>
                                        <p style={{ fontSize: '14px', color: '#c62828', fontWeight: '700', marginBottom: '12px' }}>⚠️ Confirmer la suppression ?</p>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1 }}>Annuler</button>
                                            <button onClick={deleteCard} style={{
                                                flex: 1, padding: '11px', background: '#e53935', color: 'white',
                                                border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '14px', fontWeight: '700',
                                            }}>🗑 Confirmer</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Composants utilitaires
const titleStyle = {
    fontFamily: 'var(--font-display)', fontSize: '17px', fontWeight: '700',
    color: 'var(--accent)', marginBottom: '20px',
};

function InfoBox({ label, value, mono, accent }) {
    return (
        <div style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: accent ? 'var(--accent)' : 'var(--text)', fontFamily: mono ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value}</div>
        </div>
    );
}

function ColorPicker({ label, valueKey, appearance, update }) {
    return (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input type="color" value={appearance[valueKey]} onChange={e => update(valueKey, e.target.value)} style={{ width: '44px', height: '38px', borderRadius: '6px', border: '1px solid var(--border)' }} />
                <input type="text" value={appearance[valueKey]} onChange={e => update(valueKey, e.target.value)} style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }} />
            </div>
        </div>
    );
}

function StylePicker({ label, valueKey, options, appearance, update }) {
    return (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {options.map(opt => (
                    <button key={opt} onClick={() => update(valueKey, opt)} style={{
                        padding: '5px 12px', borderRadius: 'var(--radius-pill)',
                        border: appearance[valueKey] === opt ? 'none' : '1.5px solid var(--border)',
                        background: appearance[valueKey] === opt ? 'var(--accent)' : 'transparent',
                        color: appearance[valueKey] === opt ? 'white' : 'var(--text-light)',
                        fontSize: '12px', cursor: 'pointer', transition: 'all 0.15s',
                    }}>
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
}