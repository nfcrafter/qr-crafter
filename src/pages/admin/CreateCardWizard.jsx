// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import PhonePreview from '../../components/PhonePreview.jsx';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../../constants/socials.js';
import ImageUpload from '../../components/ImageUpload.jsx';

// Reusable color picker: swatch + hex text input
function ColorField({ label, value, onChange }) {
    return (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', border: '1px solid #E2E8F0', borderRadius: 12, padding: '6px 14px' }}>
                <input type="color" value={value} onChange={e => onChange(e.target.value)}
                    style={{ width: 36, height: 36, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'none' }} />
                <div style={{ width: 1, height: 28, background: '#E2E8F0' }} />
                <input type="text" value={value}
                    onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) onChange(e.target.value); }}
                    style={{ border: 'none', outline: 'none', fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: '#1A1265', width: 90, background: 'transparent' }}
                    maxLength={7} placeholder="#000000" />
                <div style={{ width: 24, height: 24, borderRadius: 6, background: value, border: '1px solid #E2E8F0', flexShrink: 0 }} />
            </div>
        </div>
    );
}

const QR_TYPES = [
    { id: 'url', icon: '🌐', label: 'Lien URL', desc: 'Redirige vers un site web existant.' },
    { id: 'profile', icon: '👤', label: 'Profil Personnel', desc: 'Page de contact digitale complète.' }
];

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];

export default function CreateCardWizard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const [cardId, setCardId] = useState(null);
    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState(null);
    const [generating, setGenerating] = useState(false);
    const [openSection, setOpenSection] = useState('info');
    const [previewMode, setPreviewMode] = useState('page');
    const [cardName, setCardName] = useState('');
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [activeSocialInput, setActiveSocialInput] = useState(null);

    const [profile, setProfile] = useState({
        banner_url: '', photo_url: '', full_name: '', job_title: '', bio: '',
        phone: '', email: '', primaryColor: '#1A1265',
        socials: {}, customLinks: [], url: ''
    });

    const [qrStyle, setQrStyle] = useState({
        dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersColor: '#1A1265', logo_url: ''
    });

    useEffect(() => {
        generateUniqueCardId().then(setCardId);
        supabase.from('folders').select('*').order('created_at').then(({ data }) => setFolders(data || []));
    }, []);

    useEffect(() => {
        if (!qrRef.current || !cardId) return;
        const url = selectedType === 'url' && profile.url ? profile.url : `${window.location.origin}/u/${cardId}`;
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
                data: url,
                dotsOptions: { color: qrStyle.dotsColor, type: qrStyle.dotsType },
                cornersSquareOptions: { color: qrStyle.cornersColor, type: qrStyle.cornersType },
                backgroundOptions: { color: qrStyle.bgColor },
                image: qrStyle.logo_url || ''
            });
        }
    }, [qrStyle, cardId, selectedType, profile.url, step]);

    function toggleSocial(id) {
        const s = { ...profile.socials };
        if (s[id] !== undefined) {
            delete s[id];
            setActiveSocialInput(null);
        } else {
            s[id] = '';
            setActiveSocialInput(id);
        }
        setProfile({ ...profile, socials: s });
    }

    function addCustomLink() {
        setProfile({ ...profile, customLinks: [...profile.customLinks, { label: '', url: '', emoji: '🔗' }] });
    }

    function updateCustomLink(idx, field, val) {
        const links = [...profile.customLinks];
        links[idx] = { ...links[idx], [field]: val };
        setProfile({ ...profile, customLinks: links });
    }

    function removeCustomLink(idx) {
        setProfile({ ...profile, customLinks: profile.customLinks.filter((_, i) => i !== idx) });
    }

    async function handleFinalize() {
        if (!selectedType) return toast('Choisissez un type', 'error');
        if (selectedType === 'url' && !profile.url) return toast('URL requise', 'error');
        if (selectedType === 'profile' && !profile.full_name) return toast('Nom requis', 'error');
        setGenerating(true);
        try {
            const { error } = await supabase.from('cards').insert({
                card_id: cardId,
                card_name: cardName || profile.full_name || 'Sans titre',
                folder_id: selectedFolderId || null,
                qr_appearance: qrStyle,
                type_data: { ...profile, qr_type: selectedType },
                status: 'active'
            });
            if (error) throw error;
            toast('QR créé avec succès !', 'success');
            navigate('/admin');
        } catch (err) { toast(err.message, 'error'); }
        finally { setGenerating(false); }
    }

    const acc = (id, icon, title, sub, content) => (
        <div className="accordion" key={id}>
            <div className="accordion-header" onClick={() => setOpenSection(openSection === id ? '' : id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1A1265' }}>{title}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</div>
                    </div>
                </div>
                <span style={{ transform: openSection === id ? 'rotate(180deg)' : 'none', transition: '.3s' }}>▼</span>
            </div>
            {openSection === id && <div className="accordion-content animate-fade-in">{content}</div>}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                {/* Stepper */}
                <div className="stepper">
                    {['Type', 'Contenu', 'Design QR'].map((label, i) => (
                        <><div key={label} className={`step ${step >= i+1 ? (step > i+1 ? 'done' : 'active') : ''}`}>
                            <div className="step-number">{i+1}</div>{label}
                        </div>{i < 2 && <div className="step-line" />}</>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>
                    <div className="animate-fade-in">

                        {/* Step 1 — Type */}
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Choisissez le type de QR</h2>
                                <div className="selection-grid">
                                    {QR_TYPES.map(t => (
                                        <div key={t.id} className={`selection-card ${selectedType === t.id ? 'active' : ''}`}
                                            onClick={() => { setSelectedType(t.id); setStep(2); }}>
                                            <i>{t.icon}</i><h3>{t.label}</h3><p>{t.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2 — Content */}
                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32 }}>Contenu</h2>

                                {selectedType === 'url' && acc('url', '🌐', 'URL de destination', 'Lien vers lequel le QR redirige.', (
                                    <div className="field" style={{ marginTop: 16 }}>
                                        <label>URL *</label>
                                        <input type="url" value={profile.url} onChange={e => setProfile({ ...profile, url: e.target.value })} placeholder="https://votresite.com" />
                                    </div>
                                ))}

                                {selectedType === 'profile' && <>
                                    {acc('info', '👤', 'Informations', 'Nom, bio, photo, bannière.', (
                                        <div style={{ marginTop: 16 }}>
                                            <div className="field"><label>Nom complet *</label><input type="text" value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} /></div>
                                            <div className="field"><label>Profession / Titre</label><input type="text" value={profile.job_title} onChange={e => setProfile({ ...profile, job_title: e.target.value })} /></div>
                                            <div className="field"><label>Description</label><textarea rows={3} value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} /></div>
                                            <div className="field"><label>Téléphone</label><input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+229 XX XX XX XX" /></div>
                                            <div className="field"><label>Email</label><input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="vous@email.com" /></div>
                                            <ImageUpload label="Photo de profil" value={profile.photo_url} onChange={v => setProfile({ ...profile, photo_url: v })} bucket="avatars" shape="circle" />
                                            <ImageUpload label="Bannière" value={profile.banner_url} onChange={v => setProfile({ ...profile, banner_url: v })} bucket="banners" shape="rect" />
                                            <ColorField label="Couleur principale" value={profile.primaryColor || '#1A1265'} onChange={v => setProfile({ ...profile, primaryColor: v })} />
                                        </div>
                                    ))}

                                    {acc('socials', '📱', 'Réseaux Sociaux', 'Cliquez sur un logo pour activer.', (
                                        <div style={{ marginTop: 16 }}>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                                                {SOCIAL_NETWORKS.map(net => {
                                                    const active = profile.socials[net.id] !== undefined;
                                                    return (
                                                        <div key={net.id} title={net.label}
                                                            onClick={() => toggleSocial(net.id)}
                                                            style={{ position: 'relative', cursor: 'pointer', transition: '.2s', transform: active ? 'scale(1.1)' : 'none' }}>
                                                            <img src={net.icon} alt={net.label} style={{ width: 44, height: 44, borderRadius: 12, padding: 4, border: active ? `2px solid ${net.color}` : '2px solid transparent', background: 'white', boxShadow: active ? `0 4px 12px ${net.color}44` : '0 2px 6px rgba(0,0,0,0.08)', opacity: active ? 1 : 0.45 }} />
                                                            {active && <div style={{ position: 'absolute', top: -4, right: -4, width: 14, height: 14, background: net.color, borderRadius: '50%', border: '2px solid white' }} />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            {Object.keys(profile.socials).map(key => {
                                                const net = SOCIAL_NETWORKS.find(n => n.id === key);
                                                if (!net) return null;
                                                return (
                                                    <div key={key} className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <img src={net.icon} alt={net.label} style={{ width: 32, height: 32, borderRadius: 8 }} />
                                                        <div style={{ flex: 1 }}>
                                                            <label>{net.label}</label>
                                                            <input type="text" value={profile.socials[key]} onChange={e => setProfile({ ...profile, socials: { ...profile.socials, [key]: e.target.value } })} placeholder={net.placeholder} autoFocus={activeSocialInput === key} />
                                                        </div>
                                                        <button onClick={() => toggleSocial(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 20, paddingTop: 20 }}>×</button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}

                                    {acc('links', '🔗', 'Liens Personnalisés', 'Boutique, portfolio, autres liens.', (
                                        <div style={{ marginTop: 16 }}>
                                            {profile.customLinks.map((link, idx) => (
                                                <div key={idx} style={{ background: '#F8FAFC', borderRadius: 16, padding: '16px', marginBottom: 12, border: '1px solid #E2E8F0' }}>
                                                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                                                            {LINK_ICONS.map(li => (
                                                                <span key={li.emoji} onClick={() => updateCustomLink(idx, 'emoji', li.emoji)}
                                                                    title={li.label}
                                                                    style={{ fontSize: 22, cursor: 'pointer', padding: 4, borderRadius: 8, background: link.emoji === li.emoji ? '#EEF2FF' : 'transparent', border: link.emoji === li.emoji ? '1px solid #6366F1' : '1px solid transparent' }}>
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
                                            <button onClick={addCustomLink} style={{ width: '100%', padding: '14px', borderRadius: 14, border: '2px dashed #CBD5E1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ Ajouter un lien</button>
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
                            </div>
                        )}

                        {/* Step 3 — QR Design */}
                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Design du Code QR</h2>
                                <p style={{ color: '#64748B', marginBottom: 28, fontSize: 14 }}>Le lien est <strong>permanent</strong> — il ne changera jamais, même après modification du contenu.</p>
                                <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E2E8F0' }}>
                                    <div className="field"><label>Style des points</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                                            {DOT_STYLES.map(s => <div key={s} onClick={() => setQrStyle({ ...qrStyle, dotsType: s })} style={{ padding: '10px 6px', border: qrStyle.dotsType === s ? '2px solid #1A1265' : '1px solid #E2E8F0', borderRadius: 12, textAlign: 'center', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: qrStyle.dotsType === s ? '#1A1265' : '#64748B', background: qrStyle.dotsType === s ? '#EEF2FF' : 'white' }}>{s}</div>)}
                                        </div>
                                    </div>
                                    <ColorField label="Couleur des points" value={qrStyle.dotsColor} onChange={v => setQrStyle({ ...qrStyle, dotsColor: v })} />
                                    <ColorField label="Couleur des coins" value={qrStyle.cornersColor} onChange={v => setQrStyle({ ...qrStyle, cornersColor: v })} />
                                    <ColorField label="Couleur de fond" value={qrStyle.bgColor} onChange={v => setQrStyle({ ...qrStyle, bgColor: v })} />
                                    <ImageUpload label="Logo central du QR (Image)" value={qrStyle.logo_url} onChange={v => setQrStyle({ ...qrStyle, logo_url: v })} bucket="qr-logos" shape="circle" />
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, paddingTop: 24, borderTop: '1px solid #E2E8F0' }}>
                            <button className="btn-nav-prev" onClick={() => step > 1 ? setStep(step - 1) : navigate('/admin')}>← Retour</button>
                            {step < 3
                                ? <button className="btn-nav-next" onClick={() => setStep(step + 1)} disabled={step === 1 && !selectedType}>Suivant →</button>
                                : <button className="btn-nav-next" onClick={handleFinalize} disabled={generating}>{generating ? 'Création...' : '✓ Valider & Créer'}</button>
                            }
                        </div>
                    </div>

                    {/* Right panel: QR-only on step 3, page preview on steps 1&2 */}
                    <div className="phone-preview-container">
                        {step < 3 && (
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                                <button onClick={() => setPreviewMode('qr')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: previewMode === 'qr' ? '#1A1265' : 'white', color: previewMode === 'qr' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Code QR</button>
                                <button onClick={() => setPreviewMode('page')} style={{ flex: 1, padding: '10px', borderRadius: 20, border: 'none', background: previewMode === 'page' ? '#1A1265' : 'white', color: previewMode === 'page' ? 'white' : '#64748B', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Aperçu Page</button>
                            </div>
                        )}
                        {step === 3 && (
                            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Aperçu du QR Code</p>
                        )}
                        <PhonePreview>
                            {/* Step 3 → always show QR */}
                            {(step === 3 || previewMode === 'qr') ? (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, background: '#F0F2F5' }}>
                                    <div style={{ background: qrStyle.bgColor || 'white', padding: 16, borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div ref={qrRef} />
                                    </div>
                                    <p style={{ marginTop: 14, fontSize: 10, color: '#94A3B8', textAlign: 'center', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>Lien permanent — ne change jamais</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ height: 110, background: profile.primaryColor, position: 'relative', overflow: 'hidden' }}>
                                        {profile.banner_url && <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                                    </div>
                                    <div style={{ padding: '0 16px 20px' }}>
                                        <div style={{ width: 64, height: 64, borderRadius: 16, border: '3px solid white', background: '#EEF2FF', marginTop: -32, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative', zIndex: 10 }}>
                                            {profile.photo_url && <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                                        </div>
                                        <h3 style={{ marginTop: 8, fontWeight: 900, color: '#1A1265', fontSize: 15 }}>{profile.full_name || 'Votre Nom'}</h3>
                                        <p style={{ fontSize: 11, color: '#64748B' }}>{profile.job_title || 'Profession'}</p>
                                        <button style={{ width: '100%', marginTop: 12, padding: '10px', borderRadius: 12, background: profile.primaryColor, color: 'white', border: 'none', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Enregistrer le contact</button>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
                                            {Object.keys(profile.socials).map(key => {
                                                const net = SOCIAL_NETWORKS.find(n => n.id === key);
                                                if (!net) return null;
                                                return (
                                                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                        <div style={{ width: 28, height: 28, borderRadius: 8, background: net.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <img src={net.icon} alt={net.label} style={{ width: 16, height: 16 }} />
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: 11, flex: 1, color: '#0F172A' }}>{net.label}</span>
                                                    </div>
                                                );
                                            })}
                                            {profile.customLinks.filter(l => l.label).map((link, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'white', borderRadius: 12, border: '1px solid #F1F5F9', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                                                    <div style={{ width: 28, height: 28, borderRadius: 8, background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{link.emoji || '🔗'}</div>
                                                    <span style={{ fontWeight: 700, fontSize: 11, flex: 1, color: '#0F172A' }}>{link.label}</span>
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
        </div>
    );
}