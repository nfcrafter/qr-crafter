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
    { label: 'Primary', bg: '#28C254' },
    { label: 'Premium', bg: '#707BFF' },
    { label: 'Dark', bg: '#1E293B' },
    { label: 'Gold', bg: '#F59E0B' },
];

const SECTIONS = [
    { id: 'infos', icon: '📊', label: 'Informations' },
    { id: 'profil', icon: '👤', label: 'Profil Public' },
    { id: 'qr', icon: '🎨', label: 'Design QR' },
    { id: 'danger', icon: '⚠️', label: 'Zone Danger' },
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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const avatarRef = useRef(null);
    const bannerRef = useRef(null);

    const [profileForm, setProfileForm] = useState({});

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded',
        dotsColor: '#1E293B',
        bgColor: '#FFFFFF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1E293B',
        cornersDotColor: '#1E293B',
        logo_url: null,
    });

    useEffect(() => {
        loadCard();
        loadFolders();
    }, [cardId]);

    useEffect(() => {
        if (activeSection === 'qr' && qrRef.current && card) {
            if (!qrCode.current) {
                initQRCode();
            } else {
                updateQRCode();
            }
        }
    }, [activeSection, card, qrAppearance]);

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
            });
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
            image: qrAppearance.logo_url || '',
            imageOptions: { crossOrigin: 'anonymous', margin: 10 }
        });

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

    async function saveProfile() {
        setSaving(true);
        const { error } = await supabase
            .from('cards')
            .update({ admin_profile: profileForm })
            .eq('card_id', cardId);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Profil mis à jour !', 'success');
        setSaving(false);
    }

    async function saveQRAppearance() {
        setSavingQR(true);
        const { error } = await supabase
            .from('cards')
            .update({ qr_appearance: qrAppearance })
            .eq('card_id', cardId);

        if (error) toast('Erreur : ' + error.message, 'error');
        else toast('Design QR sauvegardé !', 'success');
        setSavingQR(false);
    }

    async function deleteCard() {
        const { error } = await supabase.from('cards').delete().eq('card_id', cardId);
        if (error) toast('Erreur : ' + error.message, 'error');
        else {
            toast('Carte supprimée !', 'success');
            navigate('/admin');
        }
    }

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Chargement...</div>;

    const publicUrl = `${window.location.origin}/u/${cardId}`;
    const activationUrl = `${window.location.origin}/register?card=${cardId}&token=${card?.activation_token}`;

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
            {/* Sidebar Settings */}
            <aside style={{ width: '300px', background: 'white', borderRight: '1px solid var(--border)', padding: '40px 24px', position: 'sticky', top: 0, height: '100vh' }}>
                <button onClick={() => navigate('/admin')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-500)', background: 'none', border: 'none', cursor: 'pointer', marginBottom: '32px', fontWeight: '600' }}>
                    ← Retour au dashboard
                </button>

                <div style={{ marginBottom: '40px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-400)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>Carte</div>
                    <h1 style={{ fontSize: '24px', margin: 0, color: 'var(--primary)', fontFamily: 'monospace' }}>#{cardId}</h1>
                    <p style={{ color: 'var(--text-500)', fontSize: '14px', marginTop: '4px' }}>{card.card_name}</p>
                </div>

                <nav>
                    {SECTIONS.map(s => (
                        <button 
                            key={s.id} 
                            onClick={() => setActiveSection(s.id)}
                            style={{ 
                                width: '100%', padding: '12px 16px', borderRadius: '12px', border: 'none', 
                                background: activeSection === s.id ? 'var(--primary-light)' : 'transparent',
                                color: activeSection === s.id ? 'var(--primary)' : 'var(--text-600)',
                                fontWeight: '600', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px'
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>{s.icon}</span>
                            {s.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Content Area */}
            <main style={{ flex: 1, padding: '60px 40px' }}>
                <div style={{ maxWidth: '800px' }}>
                    
                    {activeSection === 'infos' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Détails de la carte</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                                <div className="premium-card" style={{ padding: '24px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-400)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Statut</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: card.status === 'active' ? '#166534' : '#92400E' }}>
                                        {card.status === 'active' ? '✅ Active' : '⏳ En attente'}
                                    </div>
                                </div>
                                <div className="premium-card" style={{ padding: '24px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-400)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Lien NFC</div>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => { navigator.clipboard.writeText(publicUrl); toast('Lien copié !', 'success'); }}>
                                        {publicUrl}
                                    </div>
                                </div>
                            </div>

                            <div className="premium-card" style={{ padding: '32px' }}>
                                <h3 style={{ marginBottom: '24px' }}>Lien d'activation</h3>
                                <p style={{ color: 'var(--text-500)', fontSize: '14px', marginBottom: '16px' }}>Envoyez ce lien au client pour qu'il puisse activer sa carte et créer son compte.</p>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <input readOnly value={activationUrl} style={{ flex: 1 }} />
                                    <button className="btn-primary" onClick={() => { navigator.clipboard.writeText(activationUrl); toast('Lien copié !', 'success'); }}>Copier</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'profil' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Configuration du Profil</h2>
                            <div className="premium-card" style={{ padding: '32px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    {SOCIAL_FIELDS.map(f => (
                                        <div key={f.key} className="field" style={{ gridColumn: f.type === 'textarea' ? 'span 2' : 'span 1' }}>
                                            <label>{f.label}</label>
                                            {f.type === 'textarea' ? (
                                                <textarea rows={3} value={profileForm[f.key] || ''} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} />
                                            ) : (
                                                <input type={f.type} value={profileForm[f.key] || ''} onChange={e => setProfileForm({ ...profileForm, [f.key]: e.target.value })} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <button className="btn-primary" style={{ width: '100%', marginTop: '32px' }} onClick={saveProfile} disabled={saving}>
                                    {saving ? 'Sauvegarde...' : '💾 Sauvegarder le profil'}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'qr' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '32px' }}>Design du QR Code</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '32px' }}>
                                <div className="premium-card" style={{ padding: '32px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className="field">
                                            <label>Style modules</label>
                                            <select value={qrAppearance.dotsType} onChange={e => setQrAppearance({ ...qrAppearance, dotsType: e.target.value })}>
                                                {DOT_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Couleur modules</label>
                                            <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({ ...qrAppearance, dotsColor: e.target.value })} />
                                        </div>
                                        <div className="field">
                                            <label>Style coins</label>
                                            <select value={qrAppearance.cornersType} onChange={e => setQrAppearance({ ...qrAppearance, cornersType: e.target.value })}>
                                                {CORNER_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Couleur coins</label>
                                            <input type="color" value={qrAppearance.cornersColor} onChange={e => setQrAppearance({ ...qrAppearance, cornersColor: e.target.value })} />
                                        </div>
                                    </div>
                                    <button className="btn-primary" style={{ width: '100%', marginTop: '32px' }} onClick={saveQRAppearance} disabled={savingQR}>
                                        {savingQR ? 'Sauvegarde...' : '💾 Sauvegarder le design'}
                                    </button>
                                </div>
                                
                                <div style={{ textAlign: 'center' }}>
                                    <div ref={qrRef} style={{ background: 'white', padding: '10px', borderRadius: '24px', boxShadow: 'var(--shadow-lg)', display: 'inline-block', marginBottom: '16px' }}></div>
                                    <button className="btn-ghost" style={{ width: '100%' }} onClick={() => qrCode.current?.download({ name: `QR-${cardId}`, extension: 'png' })}>
                                        ⬇ Télécharger PNG
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'danger' && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '24px', marginBottom: '32px', color: '#EF4444' }}>Zone de danger</h2>
                            <div className="premium-card" style={{ padding: '32px', border: '1px solid #FECACA', background: '#FEF2F2' }}>
                                <h3>Supprimer cette carte</h3>
                                <p style={{ color: '#991B1B', fontSize: '14px', marginBottom: '24px' }}>Cette action est irréversible. Toutes les données associées à cette carte seront perdues.</p>
                                {!showDeleteConfirm ? (
                                    <button className="btn-primary" style={{ background: '#EF4444' }} onClick={() => setShowDeleteConfirm(true)}>Supprimer la carte</button>
                                ) : (
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button className="btn-primary" style={{ background: '#EF4444' }} onClick={deleteCard}>Confirmer la suppression</button>
                                        <button className="btn-ghost" onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>
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