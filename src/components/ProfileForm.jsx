// src/components/ProfileForm.jsx
import { useState, useRef } from 'react';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../constants/socials.js';

export default function ProfileForm({
    profile,
    setProfile,
    onUploadAvatar,
    onUploadBanner,
    uploadingAvatar = false,
    uploadingBanner = false,
    toast
}) {
    const [openSection, setOpenSection] = useState('info');
    const avatarRef = useRef();
    const bannerRef = useRef();

    const acc = (id, icon, title, sub, content) => (
        <div className="accordion" key={id} style={{ marginBottom: 12, border: '1px solid #E2E8F0', borderRadius: 16, background: 'white', overflow: 'hidden' }}>
            <div 
                className="accordion-header" 
                onClick={() => setOpenSection(openSection === id ? '' : id)}
                style={{ 
                    padding: '16px 20px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    cursor: 'pointer',
                    background: openSection === id ? '#F8FAFC' : 'white',
                    transition: '0.2s'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                        <div style={{ fontWeight: 700, color: '#1A1265' }}>{title}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8' }}>{sub}</div>
                    </div>
                </div>
                <span style={{ transform: openSection === id ? 'rotate(180deg)' : 'none', transition: '.3s', fontSize: 12, color: '#94A3B8' }}>▼</span>
            </div>
            {openSection === id && (
                <div className="accordion-content animate-fade-in" style={{ padding: '24px', borderTop: '1px solid #F1F5F9' }}>
                    {content}
                </div>
            )}
        </div>
    );

    // Helpers
    const toggleSocial = (id) => {
        const newSocials = { ...(profile.socials || {}) };
        if (newSocials[id] !== undefined) delete newSocials[id];
        else newSocials[id] = { value: '', subtitle: '' };
        setProfile({ ...profile, socials: newSocials });
    };

    const updateSocial = (id, field, val) => {
        const newSocials = { ...(profile.socials || {}) };
        if (newSocials[id]) {
            newSocials[id] = { ...newSocials[id], [field]: val };
            setProfile({ ...profile, socials: newSocials });
        }
    };

    const getSocialValue = (id) => profile.socials?.[id]?.value || '';
    const getSocialSubtitle = (id) => profile.socials?.[id]?.subtitle || '';

    const addCustomLink = () => {
        const links = [...(profile.customLinks || [])];
        links.push({ emoji: '🔗', label: '', url: '' });
        setProfile({ ...profile, customLinks: links });
    };

    const updateCustomLink = (idx, field, val) => {
        const links = [...(profile.customLinks || [])];
        links[idx] = { ...links[idx], [field]: val };
        setProfile({ ...profile, customLinks: links });
    };

    const removeCustomLink = (idx) => {
        const links = [...(profile.customLinks || [])];
        links.splice(idx, 1);
        setProfile({ ...profile, customLinks: links });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* SECTION INFOS */}
            {acc('info', '👤', 'Informations du profil', 'Nom, bio, photo, bannière.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="field">
                        <label>Nom complet</label>
                        <input type="text" value={profile.full_name || ''} onChange={e => setProfile({ ...profile, full_name: e.target.value })} placeholder="Jean Dupont" />
                    </div>
                    <div className="field">
                        <label>Profession / Titre</label>
                        <input type="text" value={profile.job_title || ''} onChange={e => setProfile({ ...profile, job_title: e.target.value })} placeholder="Ex: Designer, Entrepreneur..." />
                    </div>
                    <div className="field">
                        <label>Description (Bio)</label>
                        <textarea rows={3} value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="Parlez-nous de vous..." />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="field">
                            <label>Téléphone direct</label>
                            <input type="tel" value={profile.phone || ''} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="+229 XX..." />
                        </div>
                        <div className="field">
                            <label>Email direct</label>
                            <input type="email" value={profile.email || ''} onChange={e => setProfile({ ...profile, email: e.target.value })} placeholder="mon@email.com" />
                        </div>
                    </div>

                    {/* Image Uploads */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1265', marginBottom: 8, display: 'block' }}>Photo de profil</label>
                            <div 
                                onClick={() => avatarRef.current.click()}
                                style={{ 
                                    width: 80, height: 80, borderRadius: '50%', background: '#F1F5F9', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    border: '2px dashed #CBD5E1', overflow: 'hidden', position: 'relative'
                                }}
                            >
                                {profile.photo_url ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>👤</span>}
                                {uploadingAvatar && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ width: 20, height: 20 }}></div></div>}
                            </div>
                            <input ref={avatarRef} type="file" hidden onChange={e => e.target.files[0] && onUploadAvatar(e.target.files[0])} />
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1265', marginBottom: 8, display: 'block' }}>Bannière</label>
                            <div 
                                onClick={() => bannerRef.current.click()}
                                style={{ 
                                    height: 80, borderRadius: 12, background: '#F1F5F9', 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    border: '2px dashed #CBD5E1', overflow: 'hidden', position: 'relative'
                                }}
                            >
                                {profile.banner_url ? <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>🖼️</span>}
                                {uploadingBanner && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ width: 20, height: 20 }}></div></div>}
                            </div>
                            <input ref={bannerRef} type="file" hidden onChange={e => e.target.files[0] && onUploadBanner(e.target.files[0])} />
                        </div>
                    </div>

                    <div className="field">
                        <label>Couleur principale</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <input type="color" value={profile.primaryColor || '#1A1265'} onChange={e => setProfile({ ...profile, primaryColor: e.target.value })} style={{ width: 50, height: 40, padding: 0, border: 'none', borderRadius: 8, cursor: 'pointer' }} />
                            <input type="text" value={profile.primaryColor || '#1A1265'} onChange={e => setProfile({ ...profile, primaryColor: e.target.value })} style={{ flex: 1 }} />
                        </div>
                    </div>
                </div>
            ))}

            {/* SECTION SOCIALS */}
            {acc('socials', '📱', 'Réseaux Sociaux', 'Cliquez pour activer/désactiver.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {SOCIAL_NETWORKS.map(net => {
                            const active = (profile.socials || {})[net.id] !== undefined;
                            return (
                                <div key={net.id} title={net.label} onClick={() => toggleSocial(net.id)} style={{ position: 'relative', cursor: 'pointer', transition: '.2s', transform: active ? 'scale(1.05)' : 'none' }}>
                                    <div style={{ 
                                        width: 44, height: 44, borderRadius: 12, padding: 4, 
                                        border: active ? `2px solid ${net.color}` : '2px solid transparent', 
                                        background: 'white', boxShadow: active ? `0 4px 12px ${net.color}44` : '0 2px 6px rgba(0,0,0,0.08)', 
                                        opacity: active ? 1 : 0.45, display: 'flex', alignItems: 'center', justifyContent: 'center' 
                                    }}>
                                        <div style={{ width: 22, height: 22, color: net.iconColor || net.color }} dangerouslySetInnerHTML={{ __html: net.svg }} />
                                    </div>
                                    {active && <div style={{ position: 'absolute', top: -3, right: -3, width: 12, height: 12, background: net.color, borderRadius: '50%', border: '2px solid white' }} />}
                                </div>
                            );
                        })}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {Object.keys(profile.socials || {}).map(key => {
                            const net = SOCIAL_NETWORKS.find(n => n.id === key);
                            if (!net) return null;
                            return (
                                <div key={key} className="field" style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: net.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 4 }}>
                                        <div style={{ width: 20, height: 20, color: net.iconColor || net.color }} dangerouslySetInnerHTML={{ __html: net.svg }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ marginBottom: 4 }}>{net.label}</label>
                                        <input 
                                            type={net.type || 'text'} 
                                            value={getSocialValue(key)} 
                                            onChange={e => updateSocial(key, 'value', e.target.value)} 
                                            placeholder={net.placeholder} 
                                            style={{ marginBottom: 8, background: 'white' }} 
                                        />
                                        <input 
                                            type="text" 
                                            value={getSocialSubtitle(key)} 
                                            onChange={e => updateSocial(key, 'subtitle', e.target.value)} 
                                            placeholder="Texte personnalisé (ex: Rejoignez mon canal)" 
                                            style={{ fontSize: 12, padding: 8, background: 'white' }} 
                                        />
                                    </div>
                                    <button onClick={() => toggleSocial(key)} style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 20, cursor: 'pointer', padding: 0 }}>×</button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* SECTION CUSTOM LINKS */}
            {acc('links', '🔗', 'Liens Personnalisés', 'Boutique, portfolio, autres liens.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(profile.customLinks || []).map((link, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                                    {LINK_ICONS.map(li => (
                                        <span key={li.emoji} onClick={() => updateCustomLink(idx, 'emoji', li.emoji)} title={li.label}
                                            style={{ fontSize: 18, cursor: 'pointer', padding: '4px', borderRadius: 8, background: link.emoji === li.emoji ? '#EEF2FF' : 'transparent', border: link.emoji === li.emoji ? '1px solid #6366F1' : '1px solid transparent', transition: '0.2s' }}>
                                            {li.emoji}
                                        </span>
                                    ))}
                                </div>
                                <button onClick={() => removeCustomLink(idx)} style={{ background: '#FEF2F2', border: 'none', color: '#EF4444', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 800, fontSize: 12 }}>✕</button>
                            </div>
                            <div className="field" style={{ marginBottom: 10 }}>
                                <label>Libellé</label>
                                <input type="text" value={link.label || ''} onChange={e => updateCustomLink(idx, 'label', e.target.value)} placeholder="Ex: Ma boutique" style={{ background: 'white' }} />
                            </div>
                            <div className="field" style={{ marginBottom: 0 }}>
                                <label>URL</label>
                                <input type="url" value={link.url || ''} onChange={e => updateCustomLink(idx, 'url', e.target.value)} placeholder="https://..." style={{ background: 'white' }} />
                            </div>
                        </div>
                    ))}
                    <button onClick={addCustomLink} style={{ width: '100%', padding: 16, borderRadius: 16, border: '2px dashed #CBD5E1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ Ajouter un lien personnalisé</button>
                </div>
            ))}
        </div>
    );
}