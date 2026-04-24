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
    { id: 'profil', icon: '👤', label: 'Profil public' },
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
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const avatarRef = useRef(null);
    const bannerRef = useRef(null);

    const [profileForm, setProfileForm] = useState({});

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded',
        dotsColor: '#1A1265',
        bgColor: '#EBEBDF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1A1265',
        cornersDotColor: '#1A1265',
        logo: null,
        logo_url: null,
    });

    useEffect(() => {
        loadCard();
        loadFolders();
    }, [cardId]);

    useEffect(() => {
        if (activeSection === 'danger' && qrRef.current && !qrCode.current && card) {
            initQRCode();
        }
    }, [activeSection, card]);

    useEffect(() => {
        if (qrCode.current && activeSection === 'danger') {
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

        if (data.qr_appearance) {
            setQrAppearance({
                ...qrAppearance,
                ...data.qr_appearance,
                logo: data.qr_appearance.logo_url || null,
                logo_url: data.qr_appearance.logo_url || null,
            });
        }

        setLoading(false);
    }

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    async function uploadLogo(file) {
        if (!file) return;
        setUploadingLogo(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            const blob = dataURLToBlob(base64);
            const fileName = `qr-logo-${cardId}-${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
                .from('qr-logos')
                .upload(fileName, blob, { upsert: true });

            if (uploadError) {
                toast('Erreur upload logo', 'error');
                setUploadingLogo(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from('qr-logos')
                .getPublicUrl(fileName);

            setQrAppearance(prev => ({
                ...prev,
                logo: urlData.publicUrl,
                logo_url: urlData.publicUrl
            }));
            toast('Logo ajouté !', 'success');
            setUploadingLogo(false);
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        setQrAppearance(prev => ({ ...prev, logo: null, logo_url: null }));
        toast('Logo supprimé', 'info');
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
        if (qrAppearance.logo_url) {
            qrCode.current.update({ image: qrAppearance.logo_url });
        }
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }

    function updateQRCode() {
        const url = `${window.location.origin}/u/${cardId}`;
        qrCode.current.update({
            data: url,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
            image: qrAppearance.logo_url || '',
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

    async function saveQRAppearance() {
        setSavingQR(true);
        const { error } = await supabase
            .from('cards')
            .update({
                qr_appearance: {
                    dotsType: qrAppearance.dotsType,
                    dotsColor: qrAppearance.dotsColor,
                    bgColor: qrAppearance.bgColor,
                    cornersType: qrAppearance.cornersType,
                    cornersDotType: qrAppearance.cornersDotType,
                    cornersColor: qrAppearance.cornersColor,
                    cornersDotColor: qrAppearance.cornersDotColor,
                    logo_url: qrAppearance.logo_url,
                }
            })
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

                <div>
                    {/* SECTION INFOS */}
                    {activeSection === 'infos' && (
                        <div className="card">
                            <h2 style={titleStyle}>📋 Informations de la carte</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                                <InfoBox label="ID de la carte" value={`#${card?.card_id}`} mono accent />
                                <InfoBox label="Nom client" value={card?.card_name || '—'} />
                                <InfoBox label="Statut" value={card?.status === 'active' ? '✅ Active' : '⏳ En attente'} />
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

                    {/* SECTION PROFIL PUBLIC */}
                    {activeSection === 'profil' && (
                        <div className="card">
                            <h2 style={titleStyle}>👤 Profil public du client</h2>

                            <div className="field">
                                <label>Couleur thème</label>
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

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                                {SOCIAL_FIELDS.filter(f => f.key !== 'photo_url' && f.key !== 'banner_url' && f.key !== 'theme_color').map(field => (
                                    <div key={field.key} className="field" style={{ gridColumn: field.type === 'textarea' ? 'span 2' : 'span 1' }}>
                                        <label>{field.label}{field.key === 'full_name' && <span style={{ color: 'var(--error)' }}> *</span>}</label>
                                        {field.type === 'textarea' ? (
                                            <textarea rows={3} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => updateProfile(field.key, e.target.value)} />
                                        ) : (
                                            <input type={field.type} placeholder={field.placeholder}
                                                value={profileForm[field.key] || ''}
                                                onChange={e => updateProfile(field.key, e.target.value)} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '13px', marginTop: '8px' }}>
                                {saving ? 'Sauvegarde...' : '💾 Sauvegarder le profil public'}
                            </button>
                        </div>
                    )}

                    {/* SECTION DANGER */}
                    {activeSection === 'danger' && (
                        <div className="card" style={{ border: '1.5px solid #ffcdd2' }}>
                            <h2 style={{ ...titleStyle, color: '#e53935' }}>⚠️ Zone de danger</h2>

                            <div style={{ padding: '20px', background: '#fff3e0', borderRadius: 'var(--radius-lg)', border: '1px solid #ffe0b2', marginBottom: '20px' }}>
                                <h3 style={{ color: '#e65100', fontWeight: '700', marginBottom: '16px' }}>🎨 Personnalisation du QR Code</h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Style des modules</label>
                                        <select value={qrAppearance.dotsType} onChange={e => updateQR('dotsType', e.target.value)} className="field" style={{ marginTop: '4px' }}>
                                            {DOT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Couleur des modules</label>
                                        <input type="color" value={qrAppearance.dotsColor} onChange={e => updateQR('dotsColor', e.target.value)} style={{ width: '100%', marginTop: '4px', height: '38px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Couleur de fond</label>
                                        <input type="color" value={qrAppearance.bgColor} onChange={e => updateQR('bgColor', e.target.value)} style={{ width: '100%', marginTop: '4px', height: '38px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Style des coins</label>
                                        <select value={qrAppearance.cornersType} onChange={e => updateQR('cornersType', e.target.value)} className="field" style={{ marginTop: '4px' }}>
                                            {CORNER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Couleur des coins</label>
                                        <input type="color" value={qrAppearance.cornersColor} onChange={e => updateQR('cornersColor', e.target.value)} style={{ width: '100%', marginTop: '4px', height: '38px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Style points intérieurs</label>
                                        <select value={qrAppearance.cornersDotType} onChange={e => updateQR('cornersDotType', e.target.value)} className="field" style={{ marginTop: '4px' }}>
                                            {CORNER_DOT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Couleur points intérieurs</label>
                                        <input type="color" value={qrAppearance.cornersDotColor} onChange={e => updateQR('cornersDotColor', e.target.value)} style={{ width: '100%', marginTop: '4px', height: '38px' }} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '13px', fontWeight: '500' }}>Logo (PNG, SVG)</label>
                                        <input type="file" accept="image/*" onChange={e => e.target.files[0] && uploadLogo(e.target.files[0])} style={{ marginTop: '4px' }} />
                                        {uploadingLogo && <p style={{ fontSize: '11px', marginTop: '4px' }}>Chargement...</p>}
                                        {qrAppearance.logo_url && (
                                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img src={qrAppearance.logo_url} alt="Logo" style={{ width: '30px', height: '30px', objectFit: 'contain' }} />
                                                <button onClick={removeLogo} className="btn-ghost" style={{ fontSize: '12px' }}>🗑 Supprimer</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px', background: 'white', borderRadius: 'var(--radius-md)' }}>
                                    <label>Aperçu</label>
                                    <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginTop: '12px' }} />
                                </div>

                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                                    <button className="btn-primary" onClick={saveQRAppearance} disabled={savingQR} style={{ flex: 1 }}>
                                        {savingQR ? 'Sauvegarde...' : '💾 Sauvegarder le style QR'}
                                    </button>
                                    {['png', 'svg', 'jpeg'].map(fmt => (
                                        <button key={fmt} className="btn-secondary" onClick={() => downloadQR(fmt)} style={{ flex: 1 }}>
                                            ⬇ Télécharger {fmt.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: 'var(--radius-lg)', border: '1px solid #ffcdd2', marginBottom: '20px' }}>
                                <h3 style={{ color: '#c62828', fontWeight: '700', marginBottom: '6px' }}>🔗 Liens d'activation</h3>
                                <p style={{ fontSize: '13px', marginBottom: '12px' }}>Envoyez ces liens au client selon son statut :</p>
                                <div style={{ marginBottom: '12px' }}>
                                    <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>📌 Nouveau client (pas encore inscrit)</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input readOnly value={activationUrl} style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }} />
                                        <button className="btn-primary" onClick={() => copyText(activationUrl, 'Lien activation')}>📋 Copier</button>
                                    </div>
                                </div>
                                <div>
                                    <p style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px' }}>🔄 Client existant (déjà inscrit)</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input readOnly value={activationUrlExisting} style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace' }} />
                                        <button className="btn-primary" onClick={() => copyText(activationUrlExisting, 'Lien activation existant')}>📋 Copier</button>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '20px', background: '#fff5f5', borderRadius: 'var(--radius-lg)', border: '1px solid #ffcdd2' }}>
                                <h3 style={{ color: '#c62828', fontWeight: '700', marginBottom: '6px' }}>🗑 Supprimer la carte #{cardId}</h3>
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