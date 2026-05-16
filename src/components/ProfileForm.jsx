// src/components/ProfileForm.jsx
import { useState, useRef } from 'react';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../constants/socials.js';

export default function ProfileForm({
    profile,
    setProfile,
    onUploadAvatar,
    onUploadBanner,
    onUploadPDF,
    onUploadProductImage, // Nouveau : pour les images de produits
    uploadingAvatar = false,
    uploadingBanner = false,
    uploadingProduct = false,
    toast
}) {
    const [openSection, setOpenSection] = useState('info');
    const avatarRef = useRef();
    const bannerRef = useRef();
    const productFileRef = useRef();
    const [activeProductId, setActiveProductId] = useState(null);

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
                    <div style={{ width: 20, height: 20, display: 'flex' }} dangerouslySetInnerHTML={{ __html: icon }} />
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
        links.push({ iconId: 'link', label: '', url: '' });
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

    // Product Helpers
    const addProduct = () => {
        const products = [...(profile.products || [])];
        products.push({ id: Date.now(), name: '', price: '', description: '', image_url: '' });
        setProfile({ ...profile, products });
    };

    const updateProduct = (id, field, val) => {
        const products = (profile.products || []).map(p => p.id === id ? { ...p, [field]: val } : p);
        setProfile({ ...profile, products });
    };

    const removeProduct = (id) => {
        const products = (profile.products || []).filter(p => p.id !== id);
        setProfile({ ...profile, products });
    };

    // Hours Helpers
    const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const updateHours = (day, field, val) => {
        const hours = { ...(profile.business_hours || {}) };
        if (!hours[day]) hours[day] = { open: '09:00', close: '18:00', active: true };
        hours[day] = { ...hours[day], [field]: val };
        setProfile({ ...profile, business_hours: hours });
    };

    const triggerProductUpload = (id) => {
        setActiveProductId(id);
        productFileRef.current.click();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {/* SECTION APPARENCE */}
            {acc('design', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`, 'Apparence & Design', 'Couleurs, thèmes et style.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="field">
                            <label>Couleur principale</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input type="color" value={profile.primaryColor || '#1A1265'} onChange={e => setProfile({ ...profile, primaryColor: e.target.value })} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer' }} />
                                <input type="text" value={profile.primaryColor || '#1A1265'} onChange={e => setProfile({ ...profile, primaryColor: e.target.value })} style={{ flex: 1, fontSize: 13 }} />
                            </div>
                        </div>
                        <div className="field">
                            <label>Couleur du fond</label>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <input type="color" value={profile.backgroundColor || '#f0f2f5'} onChange={e => setProfile({ ...profile, backgroundColor: e.target.value })} style={{ width: 44, height: 44, padding: 0, border: 'none', borderRadius: 10, cursor: 'pointer' }} />
                                <input type="text" value={profile.backgroundColor || '#f0f2f5'} onChange={e => setProfile({ ...profile, backgroundColor: e.target.value })} style={{ flex: 1, fontSize: 13 }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1265', marginBottom: 12, display: 'block' }}>Thèmes rapides</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
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

            {/* SECTION INFOS */}
            {acc('info', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`, 'Informations du profil', 'Nom, bio, photo, bannière.', (
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
                        <div style={{ marginTop: 6, fontSize: 11, color: '#64748B', display: 'flex', gap: 6, alignItems: 'center' }}>
                            <div style={{ width: 14, height: 14, color: '#F59E0B' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>` }} />
                            <span>Astuce : Commencez une ligne par <b>"-"</b> pour créer une liste à puces automatique.</span>
                        </div>
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
                                {profile.photo_url ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: 28, height: 28, color: '#94A3B8' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` }} />}
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
                                {profile.banner_url ? <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: 28, height: 28, color: '#94A3B8' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>` }} />}
                                {uploadingBanner && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ width: 20, height: 20 }}></div></div>}
                            </div>
                            <input ref={bannerRef} type="file" hidden onChange={e => e.target.files[0] && onUploadBanner(e.target.files[0])} />
                        </div>
                    </div>

                </div>
            ))}

            {/* SECTION SOCIALS */}
            {acc('socials', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>`, 'Réseaux Sociaux', 'Cliquez pour activer/désactiver.', (
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
        <div style={{ width: 22, height: 22, color: net.id === 'snapchat' ? '#000000' : (net.iconColor || net.color) }} dangerouslySetInnerHTML={{ __html: net.svg }} />
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
                                        <div style={{ width: 20, height: 20, color: net.id === 'snapchat' ? '#000000' : (net.iconColor || net.color) }} dangerouslySetInnerHTML={{ __html: net.svg }} />
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

            {/* SECTION BUSINESS */}
            {acc('business', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`, 'Infos Business', 'Horaires et localisation.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="field">
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span>Localisation (Adresse)</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 700 }}>Afficher</span>
                                <input type="checkbox" checked={profile.show_location} onChange={e => setProfile({ ...profile, show_location: e.target.checked })} />
                            </div>
                        </label>
                        <input type="text" value={profile.location_address || ''} onChange={e => setProfile({ ...profile, location_address: e.target.value })} placeholder="Ex: Cotonou, Bénin" />
                    </div>
                    <div className="field">
                        <label>Lien Google Maps (Optionnel)</label>
                        <input type="url" value={profile.location_map_url || ''} onChange={e => setProfile({ ...profile, location_map_url: e.target.value })} placeholder="https://goo.gl/maps/..." />
                    </div>

                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20 }}>
                        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Horaires d'ouverture</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, fontWeight: 700 }}>Afficher</span>
                                <input type="checkbox" checked={profile.show_hours} onChange={e => setProfile({ ...profile, show_hours: e.target.checked })} />
                            </div>
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {DAYS.map(day => {
                                const h = profile.business_hours?.[day] || { open: '09:00', close: '18:00', active: true };
                                return (
                                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: h.active ? '#F8FAFC' : 'transparent', borderRadius: 12, opacity: h.active ? 1 : 0.5 }}>
                                        <input type="checkbox" checked={h.active} onChange={e => updateHours(day, 'active', e.target.checked)} />
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: '#1A1265' }}>{day}</span>
                                        {h.active && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <input type="time" value={h.open} onChange={e => updateHours(day, 'open', e.target.value)} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                                                <span style={{ fontSize: 12 }}>-</span>
                                                <input type="time" value={h.close} onChange={e => updateHours(day, 'close', e.target.value)} style={{ padding: '4px 8px', fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            ))}

            {/* SECTION SHOP */}
            {acc('shop', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`, 'Boutique & Catalogue', 'Produits et services.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Activer la boutique</span>
                        <input type="checkbox" checked={profile.show_products} onChange={e => setProfile({ ...profile, show_products: e.target.checked })} />
                    </label>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {(profile.products || []).map(p => (
                            <div key={p.id} style={{ background: '#F8FAFC', borderRadius: 20, padding: 20, border: '1px solid #E2E8F0', position: 'relative' }}>
                                <button onClick={() => removeProduct(p.id)} style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', color: '#EF4444', fontSize: 20, cursor: 'pointer' }}>×</button>
                                
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div 
                                        onClick={() => triggerProductUpload(p.id)}
                                        style={{ width: 80, height: 80, borderRadius: 12, background: 'white', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, position: 'relative' }}
                                    >
                                        {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: 24, height: 24, color: '#94A3B8' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>` }} />}
                                        {uploadingProduct && activeProductId === p.id && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="loader" style={{ width: 20, height: 20 }}></div></div>}
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label>Nom du produit</label>
                                            <input type="text" value={p.name} onChange={e => updateProduct(p.id, 'name', e.target.value)} placeholder="Ex: Café Robusta" style={{ background: 'white' }} />
                                        </div>
                                        <div className="field" style={{ marginBottom: 0 }}>
                                            <label>Prix (ex: 5000 FCFA)</label>
                                            <input type="text" value={p.price} onChange={e => updateProduct(p.id, 'price', e.target.value)} placeholder="0" style={{ background: 'white' }} />
                    {profile.products.map(p => (
                        <div key={p.id} style={{ padding: 20, background: '#F8FAFC', borderRadius: 20, marginBottom: 16, border: '1px solid #E2E8F0', position: 'relative' }}>
                            <button onClick={() => deleteProduct(p.id)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                            
                            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                <div 
                                    onClick={() => triggerProductUpload(p.id)}
                                    style={{ width: 80, height: 80, borderRadius: 16, background: '#FFF', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0 }}
                                >
                                    {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: 24 }}>📸</div>}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <input placeholder="Nom du produit" value={p.name} onChange={e => updateProduct(p.id, { name: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }} />
                                    <input placeholder="Prix (ex: 5.000 F)" value={p.price} onChange={e => updateProduct(p.id, { price: e.target.value })} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0' }} />
                                </div>
                            </div>

                            <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', marginBottom: 8, textTransform: 'uppercase' }}>Action du bouton</div>
                                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                                    <button 
                                        onClick={() => updateProduct(p.id, { action_type: 'whatsapp' })}
                                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid', borderColor: p.action_type !== 'link' ? '#25D366' : '#E2E8F0', background: p.action_type !== 'link' ? '#F0FDF4' : 'white', color: p.action_type !== 'link' ? '#166534' : '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        WhatsApp
                                    </button>
                                    <button 
                                        onClick={() => updateProduct(p.id, { action_type: 'link' })}
                                        style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid', borderColor: p.action_type === 'link' ? '#6366F1' : '#E2E8F0', background: p.action_type === 'link' ? '#EEF2FF' : 'white', color: p.action_type === 'link' ? '#3730A3' : '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                    >
                                        Lien externe
                                    </button>
                                </div>
                                {p.action_type === 'link' && (
                                    <input 
                                        placeholder="https://votre-boutique.com/produit" 
                                        value={p.link_url || ''} 
                                        onChange={e => updateProduct(p.id, { link_url: e.target.value })} 
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} 
                                    />
                                )}
                            </div>
                        </div>
                    ))}

                    <div style={{ padding: 16, background: '#F8FAFC', borderRadius: 16, marginTop: 16, border: '1px solid #E2E8F0' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#1A1265', marginBottom: 12, textTransform: 'uppercase' }}>WhatsApp pour commandes</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, opacity: profile.socials?.whatsapp?.value ? 1 : 0.5 }}>
                                <input 
                                    type="radio" 
                                    name="wa_type" 
                                    disabled={!profile.socials?.whatsapp?.value}
                                    checked={profile.wa_order_type === 'whatsapp_social'} 
                                    onChange={() => setProfile({...profile, wa_order_type: 'whatsapp_social'})}
                                />
                                WhatsApp Personnel {profile.socials?.whatsapp?.value ? `(${profile.socials.whatsapp.value})` : '(Non configuré)'}
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, opacity: profile.socials?.whatsapp_business?.value ? 1 : 0.5 }}>
                                <input 
                                    type="radio" 
                                    name="wa_type" 
                                    disabled={!profile.socials?.whatsapp_business?.value}
                                    checked={profile.wa_order_type === 'business'} 
                                    onChange={() => setProfile({...profile, wa_order_type: 'business'})}
                                />
                                WhatsApp Business {profile.socials?.whatsapp_business?.value ? `(${profile.socials.whatsapp_business.value})` : '(Non configuré)'}
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14 }}>
                                <input 
                                    type="radio" 
                                    name="wa_type" 
                                    checked={profile.wa_order_type === 'custom'} 
                                    onChange={() => setProfile({...profile, wa_order_type: 'custom'})}
                                />
                                Autre numéro spécifique
                            </label>

                            {profile.wa_order_type === 'custom' && (
                                <input 
                                    type="tel" 
                                    placeholder="Ex: +22969000000"
                                    value={profile.business_whatsapp_number || ''}
                                    onChange={e => setProfile({...profile, business_whatsapp_number: e.target.value})}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 14 }}
                                />
                            )}
                        </div>
                    </div>

                    <button onClick={addProduct} style={{ width: '100%', padding: 16, borderRadius: 16, border: '2px dashed #CBD5E1', background: 'white', color: '#1A1265', fontWeight: 700, cursor: 'pointer', fontSize: 14, marginTop: 12 }}>+ Ajouter un produit</button>
                </div>
            ))}

            {/* SECTION CUSTOM LINKS */}
            {acc('links', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`, 'Liens Personnalisés', 'Boutique, portfolio, autres liens.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {(profile.customLinks || []).map((link, idx) => (
                        <div key={idx} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
                                    {LINK_ICONS.map(li => (
                                        <span key={li.id} onClick={() => updateCustomLink(idx, 'iconId', li.id)} title={li.label}
                                            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '5px', borderRadius: 8, background: link.iconId === li.id || (!link.iconId && link.emoji === li.emoji) ? '#EEF2FF' : 'transparent', border: link.iconId === li.id || (!link.iconId && link.emoji === li.emoji) ? '1px solid #6366F1' : '1px solid transparent', color: link.iconId === li.id || (!link.iconId && link.emoji === li.emoji) ? '#6366F1' : '#94A3B8', transition: '0.2s' }}>
                                            <div style={{ width: '100%', height: '100%' }} dangerouslySetInnerHTML={{ __html: li.svg }} />
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

            {/* SECTION AVANCÉE SUPPRIMÉE */}
            <input 
                ref={productFileRef} 
                type="file" 
                hidden 
                accept="image/*"
                onChange={e => {
                    if (e.target.files[0] && activeProductId) {
                        onUploadProductImage(activeProductId, e.target.files[0]);
                    }
                }} 
            />

            {renderAccordion('layout', 'Mise en page', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 13, color: '#64748B', marginBottom: 10 }}>Organisez l'ordre d'apparition des sections sur votre profil public.</p>
                    {(() => {
                        const sections = profile.section_order || ['bio', 'contact_buttons', 'links', 'products', 'business_info'];
                        const sectionLabels = {
                            bio: 'Ma présentation (Bio)',
                            contact_buttons: 'Boutons directs (Appel/Email)',
                            links: 'Réseaux Sociaux & Liens',
                            products: 'Boutique & Catalogue',
                            business_info: 'Infos Business (Horaires/Map)'
                        };
                        const move = (index, dir) => {
                            const newOrder = [...sections];
                            const temp = newOrder[index];
                            newOrder[index] = newOrder[index + dir];
                            newOrder[index + dir] = temp;
                            setProfile({ ...profile, section_order: newOrder });
                        };
                        return sections.map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                                <div style={{ flex: 1, fontWeight: 700, fontSize: 14, color: '#1A1265' }}>{sectionLabels[s] || s}</div>
                                <div style={{ display: 'flex', gap: 4 }}>
                                    <button disabled={i === 0} onClick={() => move(i, -1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', cursor: i === 0 ? 'default' : 'pointer', opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                                    <button disabled={i === sections.length - 1} onClick={() => move(i, 1)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E2E8F0', background: 'white', cursor: i === sections.length - 1 ? 'default' : 'pointer', opacity: i === sections.length - 1 ? 0.3 : 1 }}>↓</button>
                                </div>
                            </div>
                        ));
                    })()}
                </div>
            ))}
        </div>
    );
}