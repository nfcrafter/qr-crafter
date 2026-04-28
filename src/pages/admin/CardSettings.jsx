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

    const [profile, setProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265',
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
        setProfile({ ...profile, customLinks: [...(profile.customLinks || []), { label: '', url: '', emoji: '🔗' }] });
    }

    function updateCustomLink(idx, field, val) {
        const links = [...(profile.customLinks || [])];
        links[idx] = { ...links[idx], [field]: val };
        setProfile({ ...profile, customLinks: links });
    }

    function removeCustomLink(idx) {
        setProfile({ ...profile, customLinks: (profile.customLinks || []).filter((_, i) => i !== idx) });
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
                    <span style={{ fontSize: 20 }}>{icon}</span>
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
                    <div>
                        {/* LINKS SECTION */}
                        {acc('share', '🚀', 'Partage & Activation', 'Liens à envoyer à votre client.', (
                            <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                                <div className="premium-card" style={{ padding: 20, background: 'white' }}>
                                    <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1A1265', marginBottom: 10 }}>🔗 Lien Public</h4>
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
                        {qrType === 'url' && acc('url', '🌐', 'URL de destination', 'Lien vers lequel le QR redirige.', (
                            <div className="field" style={{ marginTop: 16 }}>
                                <label>URL</label>
                                <input type="url" value={profile.url || ''} onChange={e => setProfile({ ...profile, url: e.target.value })} />
                            </div>
                        ))}

                        {/* Profile type */}
                        {qrType === 'profile' && <>
                            {acc('info', '👤', 'Informations du profil', 'Nom, bio, photo, bannière.', (
                                <div style={{ marginTop: 16 }}>
                                    <div className="field"><label>Nom complet</label><input type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
                                    <div className="field"><label>Profession / Titre</label><input type="text" value={profile.job_title} onChange={e => setProfile({ ...profile, job_title: e.target.value })} /></div>
                                    <div className="field"><label>Description</label><textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} /></div>
                                    <div className="field"><label>Téléphone</label><input type="tel" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} /></div>
                                    <div className="field"><label>Email</label><input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} /></div>
                                    <ImageUpload label="Photo de profil" value={profile.photo_url} onChange={v => setProfile({ ...profile, photo_url: v })} bucket="avatars" shape="circle" />
                                    <ImageUpload label="Bannière" value={profile.banner_url} onChange={v => setProfile({ ...profile, banner_url: v })} bucket="banners" shape="rect" />
                                    <ColorField label="Couleur principale" value={profile.primaryColor || '#1A1265'} onChange={v => setProfile({ ...profile, primaryColor: v })} />
                                </div>
                            ))}

                            {acc('socials', '📱', 'Réseaux Sociaux', 'Cliquez pour activer/désactiver.', (
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
                                                    <input type="text" value={getSocialValue(key)} onChange={e => updateSocial(key, 'value', e.target.value)} placeholder={net.placeholder} autoFocus={activeSocialInput === key} style={{ marginBottom: 4 }} />
                                                    <input type="text" value={getSocialSubtitle(key)} onChange={e => updateSocial(key, 'subtitle', e.target.value)} placeholder="Texte personnalisé (ex: Rejoignez mon canal)" style={{ fontSize: 12, padding: 6 }} />
                                                </div>
                                                <button onClick={() => toggleSocial(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 20, paddingTop: 20 }}>×</button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}

                            {acc('links', '🔗', 'Liens Personnalisés', 'Boutique, portfolio, autres liens.', (
                                <div style={{ marginTop: 16 }}>
                                    {(profile.customLinks || []).map((link, idx) => (
                                        <div key={idx} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, marginBottom: 12, border: '1px solid #E2E8F0' }}>
                                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', flex: 1 }}>
                                                    {LINK_ICONS.map(li => (
                                                        <span key={li.emoji} onClick={() => updateCustomLink(idx, 'emoji', li.emoji)} title={li.label}
                                                            style={{ fontSize: 20, cursor: 'pointer', padding: 3, borderRadius: 7, background: link.emoji === li.emoji ? '#EEF2FF' : 'transparent', border: link.emoji === li.emoji ? '1px solid #6366F1' : '1px solid transparent' }}>
                                                            {li.emoji}
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
                        </>}

                        {acc('config', '⚙️', 'Organisation', 'Nom interne et dossier.', (
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
                                <span style={{ fontSize: 12, fontWeight: 900, color: '#EF4444', letterSpacing: 3, textTransform: 'uppercase' }}>⚠️ Zone de Danger</span>
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
                            {acc('qr-design', '🎨', 'Design du Code QR', 'Modifier le visuel uniquement — le lien reste permanent.', (
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

                    {/* Phone Preview */}
                    <div className="phone-preview-container">
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            <button onClick={() => setPreviewMode('page')} style={{ flex: 1, padding: 10, borderRadius: 20, border: 'none', background: previewMode === 'page' ? '#1A1265' : 'white', color: previewMode === 'page' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aperçu Page</button>
                            <button onClick={() => setPreviewMode('qr')} style={{ flex: 1, padding: 10, borderRadius: 20, border: 'none', background: previewMode === 'qr' ? '#1A1265' : 'white', color: previewMode === 'qr' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aperçu QR</button>
                        </div>
                        <PhonePreview>
                            {previewMode === 'qr' ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#F0F2F5' }}>
                                    <div style={{ background: qrStyle.bgColor || 'white', padding: 16, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <div ref={qrRef} />
                                    </div>
                                    <p style={{ marginTop: 12, fontSize: 10, color: '#94A3B8', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lien permanent — ne change jamais</p>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ height: 110, background: profile.primaryColor || '#1A1265', overflow: 'hidden', position: 'relative' }}>
                                        {profile.banner_url && <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                                    </div>
                                    <div style={{ padding: '0 16px 20px' }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 16, border: '3px solid white', background: '#EEF2FF', marginTop: -32, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
                                            {profile.photo_url && <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                                        </div>
                                        <h3 style={{ marginTop: 8, fontWeight: 900, color: '#1A1265', fontSize: 15 }}>{profile.full_name || 'Votre Nom'}</h3>
                                        <p style={{ fontSize: 11, color: '#64748B' }}>{profile.job_title || 'Profession'}</p>
                                        <button style={{ width: '100%', marginTop: 12, padding: 10, borderRadius: 12, background: profile.primaryColor || '#1A1265', color: 'white', border: 'none', fontWeight: 700, fontSize: 12 }}>Enregistrer le contact</button>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                                            {(profile.phone || profile.email) && (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    {profile.phone && (
                                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: 'white', borderRadius: 10, border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 700, fontSize: 10 }}>
                                                            <span>📞</span> Appeler
                                                        </div>
                                                    )}
                                                    {profile.email && (
                                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: 'white', borderRadius: 10, border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', fontWeight: 700, fontSize: 10 }}>
                                                            <span>✉️</span> Email
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {Object.keys(profile.socials || {}).filter(k => k !== 'phone' && k !== 'email').map(key => {
                                                const net = SOCIAL_NETWORKS.find(n => n.id === key);
                                                if (!net) return null;
                                                const valObj = profile.socials[key];
                                                const subText = typeof valObj === 'object' ? valObj.subtitle : '';
                                                return (
                                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: net.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                                                            dangerouslySetInnerHTML={{ __html: `<div style="width:14px;height:14px;color:${net.iconColor || net.color}">${net.svg}</div>` }} />
                                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                                            <div style={{ fontWeight: 700, fontSize: 11, color: '#0F172A' }}>{net.label}</div>
                                                            {subText && <div style={{ fontSize: 9, color: '#64748B', marginTop: 1 }}>{subText}</div>}
                                                        </div>
                                                        <span style={{ color: '#CBD5E1', fontSize: 12 }}>→</span>
                                                    </div>
                                                );
                                            })}
                                            {(profile.customLinks || []).filter(l => l.label).map((link, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{link.emoji || '🔗'}</div>
                                                    <span style={{ fontWeight: 700, fontSize: 11, flex: 1, color: '#0F172A' }}>{link.label}</span>
                                                    <span style={{ color: '#CBD5E1', fontSize: 12 }}>→</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </PhonePreview>
                    </div>
                </div>
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
                        fontSize: 32, margin: '0 auto 20px' 
                    }}>🗑️</div>
                    <p style={{ margin: 0, fontSize: 16, color: '#1A1265', fontWeight: 700 }}>Êtes-vous absolument sûr ?</p>
                    <p style={{ marginTop: 8, fontSize: 14, color: '#64748B' }}>
                        Cette action supprimera définitivement le QR Code <strong>{cardName || cardId}</strong> et toutes ses statistiques.
                    </p>
                </div>
            </Modal>
        </div>
    );
}