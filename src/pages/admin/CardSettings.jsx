// src/pages/admin/CardSettings.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import PhonePreview from '../../components/PhonePreview.jsx';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../../constants/socials.js';
import ImageUpload from '../../components/ImageUpload.jsx';
import Modal from '../../components/Modal.jsx';

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];

function ColorField({ label, value, onChange }) {
    return (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '6px 14px' }}>
                <input type="color" value={value || '#000000'} onChange={e => onChange(e.target.value)}
                    style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
                <div style={{ width: 1, height: 28, background: '#E2E8F0' }} />
                <input type="text" value={value || ''}
                    onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
                    style={{ border: 'none', outline: 'none', fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#1A1265', width: 90, background: 'transparent' }}
                    maxLength={7} placeholder="#000000" />
                <div style={{ width: 24, height: 24, borderRadius: 6, background: value || '#000', border: '1px solid #E2E8F0', flexShrink: 0 }} />
            </div>
        </div>
    );
}

export default function CardSettings() {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openSection, setOpenSection] = useState('info');
    const [previewMode, setPreviewMode] = useState('page');
    const [cardName, setCardName] = useState('');
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [activeSocialInput, setActiveSocialInput] = useState(null);
    const [qrType, setQrType] = useState('profile');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [showMobilePreview, setShowMobilePreview] = useState(false);

    const [profile, setProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265', backgroundColor: '#f0f2f5',
        socials: {}, customLinks: [], url: ''
    });

    const [qrStyle, setQrStyle] = useState({
        dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersColor: '#1A1265', logo_url: ''
    });

    useEffect(() => { loadData(); }, [cardId]);

    const handleDelete = async () => {
        setSaving(true);
        try {
            // 1. Supprimer les logs de scan associés
            await supabase.from('scan_logs').delete().eq('card_id', cardId);
            
            // 2. Supprimer les liens dans user_cards
            await supabase.from('user_cards').delete().eq('card_id', cardId);
            
            // 3. Détacher la carte des profils qui l'utilisent
            await supabase.from('profiles').update({ card_id: null }).eq('card_id', cardId);
            
            // 4. Puis supprimer la carte elle-même
            const { error } = await supabase.from('cards').delete().eq('card_id', cardId);
            
            if (error) throw error;
            
            toast('QR Code supprimé définitivement', 'success');
            navigate('/admin');
        } catch (e) {
            console.error(e);
            toast('Erreur lors de la suppression', 'error');
            setSaving(false);
        }
    };

    const getSocialValue = (key) => typeof profile.socials[key] === 'object' ? profile.socials[key].value || '' : profile.socials[key] || '';
    const getSocialSubtitle = (key) => typeof profile.socials[key] === 'object' ? profile.socials[key].subtitle || '' : '';
    const updateSocial = (key, field, val) => {
        const curr = profile.socials[key];
        const obj = typeof curr === 'object' ? curr : { value: curr || '', subtitle: '' };
        setProfile({ ...profile, socials: { ...profile.socials, [key]: { ...obj, [field]: val } } });
    };

    async function loadData() {
        setLoading(true);
        const { data: card, error } = await supabase.from('cards').select('*').eq('card_id', cardId).single();
        if (error || !card) { navigate('/admin'); return; }
        setCardName(card.card_name || '');
        setSelectedFolderId(card.folder_id);
        if (card.admin_profile) {
            const { qr_type, ...rest } = card.admin_profile;
            setQrType(qr_type || 'profile');
            setProfile({ 
                banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '', 
                phone: '', email: '', primaryColor: '#1A1265', 
                socials: {}, customLinks: [], url: '', 
                activation_token: card.activation_token, // Add this!
                ...rest 
            });
        }
        if (card.qr_appearance) setQrStyle({ dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#FFFFFF', cornersType: 'extra-rounded', cornersColor: '#1A1265', logo_url: '', ...card.qr_appearance });
        const { data: fd } = await supabase.from('folders').select('*').order('created_at');
        setFolders(fd || []);
        setLoading(false);
    }

    useEffect(() => {
        if (!qrRef.current || loading) return;
        const url = `${window.location.origin}/u/${cardId}`;
        if (!qrCode.current) {
            qrCode.current = new QRCodeStyling({
                width: 256, height: 256, data: url,
                dotsOptions: { color: qrStyle.dotsColor, type: qrStyle.dotsType },
                cornersSquareOptions: { color: qrStyle.cornersColor, type: qrStyle.cornersType },
                backgroundOptions: { color: qrStyle.bgColor },
                image: qrStyle.logo_url || '', imageOptions: { crossOrigin: 'anonymous', margin: 8 }
            });
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        } else {
            qrCode.current.update({
                dotsOptions: { color: qrStyle.dotsColor, type: qrStyle.dotsType },
                cornersSquareOptions: { color: qrStyle.cornersColor, type: qrStyle.cornersType },
                backgroundOptions: { color: qrStyle.bgColor },
                image: qrStyle.logo_url || ''
            });
        }
    }, [qrStyle, loading]);

    const isDark = (parseInt((profile.backgroundColor || '#f0f2f5').slice(1, 3), 16) * 299 + parseInt((profile.backgroundColor || '#f0f2f5').slice(3, 5), 16) * 587 + parseInt((profile.backgroundColor || '#f0f2f5').slice(5, 7), 16) * 114) / 1000 < 128;
    const textColor = isDark ? '#F8FAFC' : '#111';
    const subTextColor = isDark ? '#94A3B8' : '#64748B';
    const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'white';

    const toggleSocial = (id) => {
        const newSocials = { ...profile.socials };
        if (newSocials[id] !== undefined) {
            delete newSocials[id];
        } else {
            newSocials[id] = { value: '', subtitle: '' };
            setActiveSocialInput(id);
            setTimeout(() => setOpenSection('socials'), 100);
        }
        setProfile({ ...profile, socials: newSocials });
    };

    function addCustomLink() {
        setProfile({ ...profile, customLinks: [...(profile.customLinks || []), { label: '', url: '', iconId: 'link' }] });
    }

    function updateCustomLink(idx, field, val) {
        const links = [...(profile.customLinks || [])];
        links[idx] = { ...links[idx], [field]: val };
        setProfile({ ...profile, customLinks: links });
    }

    function removeCustomLink(idx) {
        setProfile({ ...profile, customLinks: (profile.customLinks || []).filter((_, i) => i !== idx) });
    }

    const productFileRef = useRef();
    const [activeProductId, setActiveProductId] = useState(null);

    const addProduct = () => {
        const products = [...(profile.products || [])];
        products.push({ id: Date.now(), name: '', price: '', action_type: 'whatsapp', image_url: '' });
        setProfile({ ...profile, products });
    };

    const updateProduct = (id, updates) => {
        const products = (profile.products || []).map(p => p.id === id ? { ...p, ...updates } : p);
        setProfile({ ...profile, products });
    };

    const removeProduct = (id) => {
        const products = (profile.products || []).filter(p => p.id !== id);
        setProfile({ ...profile, products });
    };

    const triggerProductUpload = (id) => {
        setActiveProductId(id);
        productFileRef.current.click();
    };

    async function onUploadProductImage(file) {
        if (!activeProductId) return;
        try {
            const ext = file.name.split('.').pop();
            const path = `products/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage.from('products').upload(path, file);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(path);
            updateProduct(activeProductId, { image_url: publicUrl });
        } catch (e) {
            toast('Erreur upload image', 'error');
        }
    }

    async function handleSave() {
        setSaving(true);
        try {
            const { error } = await supabase.from('cards').update({
                card_name: cardName,
                folder_id: selectedFolderId || null,
                qr_appearance: qrStyle,
                admin_profile: { ...profile, qr_type: qrType },
                updated_at: new Date().toISOString()
            }).eq('card_id', cardId);
            if (error) throw error;
            toast('Modifications enregistrées !', 'success');
        } catch (err) { toast(err.message, 'error'); }
        finally { setSaving(false); }
    }

    async function downloadQR() {
        const qr = new QRCodeStyling({
            width: 1200, height: 1200, data: `${window.location.origin}/u/${cardId}`,
            dotsOptions: { color: qrStyle.dotsColor, type: qrStyle.dotsType },
            cornersSquareOptions: { color: qrStyle.cornersColor, type: qrStyle.cornersType },
            backgroundOptions: { color: qrStyle.bgColor },
            image: qrStyle.logo_url || '', imageOptions: { crossOrigin: 'anonymous', margin: 12 }
        });
        await qr.download({ name: `QR-${cardId}`, extension: 'png' });
        toast('Téléchargement lancé', 'success');
    }

    const acc = (id, icon, title, sub, content, danger = false) => (
        <div className="accordion" style={{ border: danger ? '1px solid #FECACA' : undefined }} key={id}>
            <div className="accordion-header" style={{ background: danger ? '#FFF5F5' : undefined }} onClick={() => setOpenSection(openSection === id ? '' : id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 20, height: 20, display: 'flex', color: danger ? '#DC2626' : '#1A1265' }} dangerouslySetInnerHTML={{ __html: icon }} />
                    <div>
                        <div style={{ fontWeight: 700, color: danger ? '#DC2626' : '#1A1265' }}>{title}</div>
                        <div style={{ fontSize: 12, color: danger ? '#EF4444' : '#94A3B8' }}>{sub}</div>
                    </div>
                </div>
                <span style={{ transform: openSection === id ? 'rotate(180deg)' : 'none', transition: '.3s' }}>▼</span>
            </div>
            {openSection === id && <div className="accordion-content animate-fade-in">{content}</div>}
        </div>
    );

    if (loading) return <div style={{ padding: 100, textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                <header style={{ marginBottom: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <button className="btn-nav-prev" onClick={() => navigate('/admin')}>← Retour</button>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 900, color: '#1A1265' }}>Gérer le Projet</h1>
                            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>ID permanent : <code style={{ background: '#EEF2FF', padding: '2px 8px', borderRadius: 6, fontWeight: 700, color: '#6366F1' }}>{cardId}</code></p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={downloadQR} style={{ padding: '12px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>⬇ Télécharger QR</button>
                        <button className="btn-nav-next" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : '✓ Enregistrer'}</button>
                    </div>
                </header>

                <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
                    <div>
                        {/* APPEARANCE SECTION */}
                        {acc('design', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`, 'Apparence & Design', 'Couleurs, thèmes et style.', (
                            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <ColorField label="Couleur principale" value={profile.primaryColor || '#1A1265'} onChange={v => setProfile({ ...profile, primaryColor: v })} />
                                    <ColorField label="Couleur du fond" value={profile.backgroundColor || '#f0f2f5'} onChange={v => setProfile({ ...profile, backgroundColor: v })} />
                                </div>
                                
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1265', marginBottom: 12, display: 'block' }}>Thèmes rapides</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 10 }}>
                                        {[
                                            { name: 'Classique', primary: '#1A1265', bg: '#f0f2f5' },
                                            { name: 'Sombre', primary: '#6366F1', bg: '#0F172A' },
                                            { name: 'Nature', primary: '#059669', bg: '#F0FDF4' },
                                            { name: 'Doux', primary: '#DB2777', bg: '#FDF2F8' },
                                            { name: 'Océan', primary: '#0284C7', bg: '#F0F9FF' },
                                            { name: 'Luxe', primary: '#B45309', bg: '#FFFBEB' }
                                        ].map(t => (
                                            <button 
                                                key={t.name}
                                                onClick={() => setProfile({ ...profile, primaryColor: t.primary, backgroundColor: t.bg })}
                                                style={{ 
                                                    padding: '10px', borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: '0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.borderColor = t.primary}
                                                onMouseOut={e => e.currentTarget.style.borderColor = '#E2E8F0'}
                                            >
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.primary }} />
                                                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.bg, border: '1px solid #E2E8F0' }} />
                                                </div>
                                                <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>{t.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* LINKS SECTION */}
                        {acc('share', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path><path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path></svg>`, 'Partage & Activation', 'Liens à envoyer à votre client.', (
                            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                <div className="premium-card" style={{ padding: 20, background: 'white' }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1A1265', marginBottom: 10 }}>
                                        <div style={{ width: 16, height: 16, display: 'inline-block', verticalAlign: 'middle', marginRight: 6 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>` }} />
                                        Lien Public
                                    </h4>
                                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#6366F1', wordBreak: 'break-all', border: '1px solid #E2E8F0', marginBottom: 12 }}>
                                        {`${window.location.origin}/u/${cardId}`}
                                    </div>
                                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/u/${cardId}`); toast('Lien copié !', 'success'); }} className="btn-ghost" style={{ width: '100%', fontSize: 11, padding: '8px' }}>Copier le lien</button>
                                </div>
                                <div className="premium-card" style={{ padding: 20, background: '#EEF2FF', border: '1px solid #C7D2FE' }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1A1265', marginBottom: 10 }}>🔑 Lien d'Activation</h4>
                                    <div style={{ background: 'white', padding: 10, borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#1A1265', wordBreak: 'break-all', border: '1px solid #C7D2FE', marginBottom: 12 }}>
                                        {/* Get token from the card object if available, otherwise it's probably already activated or missing */}
                                        {loading ? '...' : `${window.location.origin}/activate?cardId=${cardId}&token=${profile.activation_token || 'TOKEN_EXPIRED'}`}
                                    </div>
                                    <button onClick={() => { 
                                        const token = profile.activation_token || '';
                                        if (!token) return toast('Carte déjà activée ou jeton manquant', 'warning');
                                        navigator.clipboard.writeText(`${window.location.origin}/activate?cardId=${cardId}&token=${token}`); 
                                        toast('Lien d\'activation copié !', 'success'); 
                                    }} className="btn-primary" style={{ width: '100%', fontSize: 11, padding: '8px' }}>Copier pour le client</button>
                                </div>
                            </div>
                        ))}

                        {/* URL type */}
                        {qrType === 'url' && acc('url', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`, 'URL de destination', 'Lien vers lequel le QR redirige.', (
                            <div className="field" style={{ marginTop: 16 }}>
                                <label>URL</label>
                                <input type="url" value={profile.url || ''} onChange={e => setProfile({ ...profile, url: e.target.value })} />
                            </div>
                        ))}

                        {/* Profile type */}
                        {qrType === 'profile' && <>
                            {acc('info', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`, 'Informations du profil', 'Nom, bio, photo, bannière.', (
                                <div style={{ marginTop: 16 }}>
                                    <div className="field"><label>Nom complet</label><input type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
                                    <div className="field"><label>Profession / Titre</label><input type="text" value={profile.job_title} onChange={e => setProfile({ ...profile, job_title: e.target.value })} /></div>
                                    <div className="field"><label>Description (Bio)</label><textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Astuce : Utilisez '-' pour les listes" /></div>
                                    <div className="field"><label>Téléphone</label><input type="tel" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
                                    <div className="field"><label>Email</label><input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
                                    <ImageUpload label="Photo de profil" value={profile.photo_url} onChange={v => setProfile({ ...profile, photo_url: v })} bucket="avatars" shape="circle" />
                                    <ImageUpload label="Bannière" value={profile.banner_url} onChange={v => setProfile({ ...profile, banner_url: v })} bucket="banners" shape="rect" />
                                </div>
                            ))}

                            {acc('socials', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`, 'Réseaux Sociaux', 'Cliquez pour activer/désactiver.', (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                                        {SOCIAL_NETWORKS.map(net => {
                                            const active = (profile.socials || {})[net.id] !== undefined;
                                            return (
                                                <div key={net.id} title={net.label} onClick={() => toggleSocial(net.id)} style={{ position: 'relative', cursor: 'pointer', transition: '.2s', transform: active ? 'scale(1.1)' : 'none' }}>
                                                        <div style={{ width: 44, height: 44, borderRadius: 12, padding: 4, border: active ? `2px solid ${net.color}` : '2px solid transparent', background: 'white', boxShadow: active ? `0 4px 12px ${net.color}44` : '0 2px 6px rgba(0,0,0,0.08)', opacity: active ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <div style={{ width: 24, height: 24, color: net.iconColor || net.color }} dangerouslySetInnerHTML={{ __html: net.svg }} />
                                                        </div>
                                                        {active && <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: net.color, borderRadius: '50%', border: '2px solid white' }} />}
                                                    </div>
                                            );
                                        })}
                                    </div>
                                    {Object.keys(profile.socials || {}).map(key => {
                                        const net = SOCIAL_NETWORKS.find(n => n.id === key);
                                        if (!net) return null;
                                        return (
                                            <div key={key} className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{ width: 32, height: 32, borderRadius: 8, background: net.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                    <div style={{ width: 18, height: 18, color: net.iconColor || net.color }} dangerouslySetInnerHTML={{ __html: net.svg }} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <label>{net.label}</label>
                                                    <input type={net.type || 'text'} value={getSocialValue(key)} onChange={e => updateSocial(key, 'value', e.target.value)} placeholder={net.placeholder} autoFocus={activeSocialInput === key} style={{ marginBottom: 4 }} />
                                                    <input type="text" value={getSocialSubtitle(key)} onChange={e => updateSocial(key, 'subtitle', e.target.value)} placeholder="Texte personnalisé (ex: Rejoignez mon canal)" style={{ fontSize: 12, padding: 6 }} />
                                                </div>
                                                <button onClick={() => toggleSocial(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 20, paddingTop: 20 }}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {acc('links', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`, 'Liens Personnalisés', 'Boutique, portfolio, autres liens.', (
                                <div style={{ marginTop: 16 }}>
                                    {(profile.customLinks || []).map((link, idx) => (
                                        <div key={idx} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 12, border: '1px solid #E2E8F0' }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
                                                    {LINK_ICONS.map(li => (
                                                        <span key={li.id} onClick={() => updateCustomLink(idx, 'iconId', li.id)} title={li.label}
                                                            style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 6, borderRadius: 8, background: link.iconId === li.id || (!link.iconId && link.emoji === li.emoji) ? '#EEF2FF' : 'transparent', border: link.iconId === li.id || (!link.iconId && link.emoji === li.emoji) ? '1px solid #6366F1' : '1px solid transparent', color: link.iconId === li.id || (!link.iconId && link.emoji === li.emoji) ? '#6366F1' : '#94A3B8' }}>
                                                            <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: li.svg }} />
                                                        </span>
                                                    ))}
                                                </div>
                                                <button onClick={() => removeCustomLink(idx)} style={{ background: '#FEE2E2', border: 'none', color: '#EF4444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
                                            </div>
                                            <div className="field" style={{ marginBottom: 8 }}><label>Libellé</label><input type="text" value={link.label} onChange={e => updateCustomLink(idx, 'label', e.target.value)} placeholder="Ex: Ma boutique" /></div>
                                            <div className="field" style={{ marginBottom: 0 }}><label>URL</label><input type="url" value={link.url} onChange={e => updateCustomLink(idx, 'url', e.target.value)} placeholder="https://..." /></div>
                                        </div>
                                    ))}
                                    <button onClick={addCustomLink} style={{ width: '100%', padding: 14, borderRadius: 14, border: '2px dashed #CBD5E1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ Ajouter un lien</button>
                                </div>
                            ))}

                            {acc('products', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`, 'Boutique & Catalogue', 'Gérez vos produits et services.', (
                                <div style={{ marginTop: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                        <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1265', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={profile.show_products} onChange={e => setProfile({ ...profile, show_products: e.target.checked })} style={{ width: 18, height: 18 }} /> Afficher la boutique
                                        </label>
                                    </div>
                                    
                                    {(profile.products || []).map(p => (
                                        <div key={p.id} style={{ padding: 16, background: '#F8FAFC', borderRadius: 16, marginBottom: 12, border: '1px solid #E2E8F0', position: 'relative' }}>
                                            <button onClick={() => removeProduct(p.id)} style={{ position: 'absolute', top: 10, right: 10, background: '#FEE2E2', border: 'none', color: '#EF4444', borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                                                <div onClick={() => triggerProductUpload(p.id)} style={{ width: 60, height: 60, borderRadius: 12, background: 'white', border: '1px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden' }}>
                                                    {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📸'}
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                    <input placeholder="Nom du produit" value={p.name} onChange={e => updateProduct(p.id, { name: e.target.value })} style={{ fontSize: 13, padding: '6px 10px' }} />
                                                    <input placeholder="Prix" value={p.price} onChange={e => updateProduct(p.id, { price: e.target.value })} style={{ fontSize: 13, padding: '6px 10px' }} />
                                                </div>
                                            </div>
                                            <div style={{ background: 'white', padding: 10, borderRadius: 10, border: '1px solid #E2E8F0' }}>
                                                <div style={{ fontSize: 10, fontWeight: 800, color: '#64748B', marginBottom: 6, textTransform: 'uppercase' }}>Action du bouton</div>
                                                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                    <button onClick={() => updateProduct(p.id, { action_type: 'whatsapp' })} style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid', borderColor: p.action_type !== 'link' ? '#25D366' : '#E2E8F0', background: p.action_type !== 'link' ? '#F0FDF4' : 'white', fontSize: 11, fontWeight: 700 }}>WhatsApp</button>
                                                    <button onClick={() => updateProduct(p.id, { action_type: 'link' })} style={{ flex: 1, padding: 6, borderRadius: 6, border: '1px solid', borderColor: p.action_type === 'link' ? '#6366F1' : '#E2E8F0', background: p.action_type === 'link' ? '#EEF2FF' : 'white', fontSize: 11, fontWeight: 700 }}>Lien</button>
                                                </div>
                                                {p.action_type === 'link' && <input placeholder="https://..." value={p.link_url || ''} onChange={e => updateProduct(p.id, { link_url: e.target.value })} style={{ fontSize: 12, padding: '6px 10px' }} />}
                                            </div>
                                        </div>
                                    ))}
                                    
                                    <div style={{ padding: 12, background: '#F1F5F9', borderRadius: 12, marginTop: 12 }}>
                                        <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 8 }}>CONFIG WHATSAPP COMMANDES</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                <input type="radio" checked={profile.wa_order_type === 'whatsapp_social'} onChange={() => setProfile({ ...profile, wa_order_type: 'whatsapp_social' })} /> WhatsApp Perso
                                            </label>
                                            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                <input type="radio" checked={profile.wa_order_type === 'business'} onChange={() => setProfile({ ...profile, wa_order_type: 'business' })} /> WhatsApp Business
                                            </label>
                                            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                <input type="radio" checked={profile.wa_order_type === 'custom'} onChange={() => setProfile({ ...profile, wa_order_type: 'custom' })} /> Numéro Spécifique
                                            </label>
                                            {profile.wa_order_type === 'custom' && <input placeholder="+229..." value={profile.business_whatsapp_number || ''} onChange={e => setProfile({ ...profile, business_whatsapp_number: e.target.value })} style={{ fontSize: 12, padding: 6 }} />}
                                        </div>
                                    </div>
                                    <button onClick={addProduct} style={{ width: '100%', padding: 12, borderRadius: 12, border: '2px dashed #CBD5E1', background: 'white', color: '#1A1265', fontWeight: 700, cursor: 'pointer', marginTop: 12 }}>+ Ajouter un produit</button>
                                </div>
                            ))}

                            {acc('layout', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"></path></svg>`, 'Mise en page', 'Ordre des sections du profil.', (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    {(() => {
                                        const sections = profile.section_order || ['bio', 'contact_buttons', 'links', 'products', 'business_info'];
                                        const sectionLabels = { bio: 'Bio', contact_buttons: 'Appel/Email', links: 'Réseaux Sociaux', products: 'Boutique', business_info: 'Horaires/Map' };
                                        const move = (idx, dir) => {
                                            const newOrder = [...sections];
                                            const tmp = newOrder[idx];
                                            newOrder[idx] = newOrder[idx+dir];
                                            newOrder[idx+dir] = tmp;
                                            setProfile({ ...profile, section_order: newOrder });
                                        };
                                        return sections.map((s, i) => (
                                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
                                                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1A1265' }}>{sectionLabels[s] || s}</span>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button disabled={i === 0} onClick={() => move(i, -1)} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                                                    <button disabled={i === sections.length - 1} onClick={() => move(i, 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer', opacity: i === sections.length - 1 ? 0.3 : 1 }}>↓</button>
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            ))}
                        </>}

                        {acc('config', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`, 'Organisation', 'Nom interne et dossier.', (
                            <div style={{ marginTop: 16 }}>
                                <div className="field"><label>Nom interne</label><input type="text" value={cardName} onChange={e => setCardName(e.target.value)} /></div>
                                <div className="field"><label>Dossier</label>
                                    <select value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value)}>
                                        <option value="">Aucun dossier</option>
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}

                        {/* DANGER ZONE */}
                        <div style={{ marginTop: 60, marginBottom: 40 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 20 }}>
                                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #FECACA, transparent)' }} />
                                <span style={{ fontSize: 12, fontWeight: 900, color: '#EF4444', letterSpacing: 3, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>` }} />
                                    Zone de Danger
                                </span>
                                <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, #FECACA, transparent)' }} />
                            </div>
                            <div style={{ 
                                background: 'white', 
                                border: '1px solid #FECACA', 
                                borderRadius: 24, 
                                padding: '32px',
                                boxShadow: '0 10px 30px rgba(239, 68, 68, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 24,
                                flexWrap: 'wrap'
                            }}>
                                <div style={{ flex: 1, minWidth: 280 }}>
                                    <h4 style={{ color: '#1A1265', margin: '0 0 8px 0', fontSize: 18, fontWeight: 900 }}>Supprimer ce QR Code</h4>
                                    <p style={{ color: '#64748B', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
                                        L'ID <code style={{ color: '#EF4444', fontWeight: 700 }}>{cardId}</code> sera définitivement libéré. Toutes les données associées seront perdues.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => setIsDeleteModalOpen(true)} 
                                    disabled={saving} 
                                    style={{ 
                                        background: '#FEF2F2', 
                                        color: '#DC2626', 
                                        border: '1px solid #FCA5A5', 
                                        padding: '14px 28px', 
                                        borderRadius: 16, 
                                        fontWeight: 800, 
                                        cursor: 'pointer', 
                                        transition: '0.2s',
                                        fontSize: 14
                                    }}
                                    onMouseEnter={e => { e.target.style.background = '#DC2626'; e.target.style.color = 'white'; }}
                                    onMouseLeave={e => { e.target.style.background = '#FEF2F2'; e.target.style.color = '#DC2626'; }}
                                >
                                    {saving ? 'Action en cours...' : 'Supprimer le projet'}
                                </button>
                            </div>
                        </div>

                        {/* DESIGN QR CODE */}
                        <div style={{ marginTop: 40 }}>
                            {acc('qr-design', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`, 'Design du Code QR', 'Modifier le visuel uniquement — le lien reste permanent.', (
                                <div style={{ marginTop: 16 }}>
                                    <div className="field"><label>Style des points</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                            {DOT_STYLES.map(s => <div key={s} onClick={() => setQrStyle({ ...qrStyle, dotsType: s })} style={{ padding: '10px 6px', border: qrStyle.dotsType === s ? '2px solid #EF4444' : '1px solid #E2E8F0', borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: qrStyle.dotsType === s ? '#EF4444' : '#64748B', background: qrStyle.dotsType === s ? '#FFF5F5' : 'white' }}>{s}</div>)}
                                        </div>
                                    </div>
                                    <ColorField label="Couleur des points" value={qrStyle.dotsColor} onChange={v => setQrStyle({ ...qrStyle, dotsColor: v })} />
                                    <ColorField label="Couleur des coins" value={qrStyle.cornersColor} onChange={v => setQrStyle({ ...qrStyle, cornersColor: v })} />
                                    <ColorField label="Couleur de fond" value={qrStyle.bgColor} onChange={v => setQrStyle({ ...qrStyle, bgColor: v })} />
                                    <ImageUpload label="Logo central du QR (Image)" value={qrStyle.logo_url} onChange={v => setQrStyle({ ...qrStyle, logo_url: v })} bucket="qr-logos" shape="circle" />
                                </div>
                            ), true)}
                        </div>
                    </div>

                    {/* Phone Preview Column (Desktop) */}
                    <div className="desktop-preview" style={{ position: 'sticky', top: '100px' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => setPreviewMode('page')} style={{ flex: 1, padding: 10, borderRadius: 20, border: 'none', background: previewMode === 'page' ? '#1A1265' : 'white', color: previewMode === 'page' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aperçu Page</button>
                            <button onClick={() => setPreviewMode('qr')} style={{ flex: 1, padding: 10, borderRadius: 20, border: 'none', background: previewMode === 'qr' ? '#1A1265' : 'white', color: previewMode === 'qr' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aperçu QR</button>
                        </div>
                        <AdminPhonePreview profile={profile} qrStyle={qrStyle} qrRef={qrRef} previewMode={previewMode} isDark={isDark} textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                    </div>
                </div>

                {/* Mobile Preview Overlay */}
                {showMobilePreview && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', padding: '20px' }}>
                        <button onClick={() => setShowMobilePreview(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', width: '44px', height: '44px', borderRadius: '50%', fontSize: '20px', fontWeight: '900', cursor: 'pointer', zIndex: 1001, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>✕</button>
                        <div style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <button onClick={() => setPreviewMode('page')} style={{ flex: 1, padding: 10, borderRadius: 20, border: 'none', background: previewMode === 'page' ? '#1A1265' : 'white', color: previewMode === 'page' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Page</button>
                                <button onClick={() => setPreviewMode('qr')} style={{ flex: 1, padding: 10, borderRadius: 20, border: 'none', background: previewMode === 'qr' ? '#1A1265' : 'white', color: previewMode === 'qr' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>QR</button>
                            </div>
                            <AdminPhonePreview profile={profile} qrStyle={qrStyle} qrRef={qrRef} previewMode={previewMode} isDark={isDark} textColor={textColor} subTextColor={subTextColor} cardBg={cardBg} />
                        </div>
                    </div>
                )}

                {/* Mobile Floating Preview Button */}
                <button 
                    onClick={() => setShowMobilePreview(true)} 
                    className="mobile-preview-btn"
                    style={{ 
                        position: 'fixed', bottom: '24px', right: '24px', 
                        background: '#1A1265', color: 'white', border: 'none', 
                        padding: '12px 24px', borderRadius: '30px', 
                        boxShadow: '0 10px 25px rgba(26,18,101,0.4)', 
                        zIndex: 900, cursor: 'pointer', fontSize: '14px',
                        fontWeight: '800', display: 'none', alignItems: 'center', gap: '10px'
                    }}
                >
                    <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>` }} /> Aperçu en direct
                </button>
            </div>

            <Modal 
                isOpen={isDeleteModalOpen} 
                title="Suppression définitive" 
                type="warning"
                confirmText="Oui, supprimer"
                confirmColor="#DC2626"
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
            >
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                    <div style={{ 
                        width: 64, height: 64, background: '#FEF2F2', borderRadius: '50%', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        color: '#EF4444', margin: '0 auto 20px' 
                    }}>
                        <div style={{ width: 32, height: 32 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>` }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 16, color: '#1A1265', fontWeight: 700 }}>Êtes-vous absolument sûr ?</p>
                    <p style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
                        Cette action supprimera définitivement le QR Code <strong>{cardName || cardId}</strong> et toutes ses statistiques.
                    </p>
                </div>
            </Modal>

            <input ref={productFileRef} type="file" hidden accept="image/*" onChange={e => e.target.files[0] && onUploadProductImage(e.target.files[0])} />
            <style>{`
                @media (max-width: 1100px) {
                    .admin-grid { grid-template-columns: 1fr !important; }
                    .desktop-preview { display: none !important; }
                    .mobile-preview-btn { display: flex !important; align-items: center; justify-content: center; }
                }
            `}</style>
        </div>
    );
}

function AdminPhonePreview({ profile, qrStyle, qrRef, previewMode, isDark, textColor, subTextColor, cardBg }) {
    return (
        <PhonePreview>
            {previewMode === 'qr' ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#F0F2F5' }}>
                    <div style={{ background: qrStyle.bgColor || 'white', padding: 16, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div ref={qrRef} />
                    </div>
                    <p style={{ marginTop: 12, fontSize: 10, color: '#94A3B8', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lien permanent — ne change jamais</p>
                </div>
            ) : (
                <div style={{ 
                    background: profile.backgroundColor || '#F0F2F5', 
                    minHeight: '100%',
                    color: textColor
                }}>
                    <div style={{ height: 110, background: profile.primaryColor || '#1A1265', overflow: 'hidden', position: 'relative' }}>
                        {profile.banner_url && <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                    </div>
                    <div style={{ padding: '0 16px 20px' }}>
                        <div style={{ 
                            width: 64, height: 64, borderRadius: 16, 
                            border: isDark ? '3px solid rgba(255,255,255,0.1)' : '3px solid white', 
                            background: '#EEF2FF', marginTop: -32, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 
                        }}>
                            {profile.photo_url && <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                        </div>
                        <h3 style={{ marginTop: 8, fontWeight: 900, color: textColor, fontSize: 15 }}>{profile.full_name || 'Votre Nom'}</h3>
                        <p style={{ fontSize: 11, color: subTextColor }}>{profile.job_title || 'Profession'}</p>
                        
                        {profile.bio && (
                            <div style={{ 
                                marginTop: 12, padding: 10, borderRadius: 12, fontSize: 11, lineHeight: 1.5,
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
                                color: textColor
                            }}>
                                {profile.bio.split('\n')[0]}...
                            </div>
                        )}

                        <button style={{ width: '100%', marginTop: 12, padding: 10, borderRadius: 12, background: profile.primaryColor || '#1A1265', color: 'white', border: 'none', fontWeight: 700, fontSize: 12 }}>Enregistrer le contact</button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                            {(profile.phone || profile.email) && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {profile.phone && (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: cardBg, borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)', fontWeight: 700, fontSize: 10, color: textColor }}>
                                            <div style={{ width: 12, height: 12, color: profile.primaryColor || '#1A1265' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === 'phone')?.svg }} /> Appeler
                                        </div>
                                    )}
                                    {profile.email && (
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: cardBg, borderRadius: 10, border: '1px solid rgba(0,0,0,0.05)', fontWeight: 700, fontSize: 10, color: textColor }}>
                                            <div style={{ width: 12, height: 12, color: profile.primaryColor || '#1A1265' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === 'email')?.svg }} /> Email
                                        </div>
                                    )}
                                </div>
                            )}
                            {Object.keys(profile.socials || {}).map(key => {
                                const net = SOCIAL_NETWORKS.find(n => n.id === key);
                                if (!net || !profile.socials[key]?.value) return null;
                                return (
                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: net.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <div style={{ width: 14, height: 14, color: net.iconColor || net.color }} dangerouslySetInnerHTML={{ __html: net.svg }} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 700, fontSize: 11, color: textColor }}>{net.label}</div>
                                        </div>
                                        <span style={{ color: '#CBD5E1', fontSize: 12 }}>→</span>
                                    </div>
                                );
                            })}
                            {(profile.customLinks || []).map((link, i) => {
                                if (!link.url) return null;
                                return (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: cardBg, borderRadius: 12, border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 6 }}>
                                            <div style={{ width: '100%', height: '100%', color: profile.primaryColor || '#1A1265' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === link.iconId || i.emoji === link.emoji)?.svg || LINK_ICONS[0].svg }} />
                                        </div>
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{ fontWeight: 700, fontSize: 11, color: textColor }}>{link.label || 'Lien'}</div>
                                        </div>
                                        <span style={{ color: '#CBD5E1', fontSize: 12 }}>→</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </PhonePreview>
    );
}