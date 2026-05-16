import { useState, useRef } from 'react';
import { SOCIAL_NETWORKS, LINK_ICONS } from '../constants/socials.js';
import { OFFICIAL_CARD_COLORS } from '../constants/cardColors.js';
import Modal from './Modal.jsx';

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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

    const openConfirm = (title, message, onConfirm) => setConfirmModal({ isOpen: true, title, message, onConfirm });

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
        openConfirm('Supprimer le produit', 'Voulez-vous vraiment supprimer ce produit de votre boutique ?', () => {
            const products = (profile.products || []).filter(p => p.id !== id);
            setProfile({ ...profile, products });
        });
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

    // Gallery Helpers
    const galleryFileRef = useRef();
    const [activeGalleryAction, setActiveGalleryAction] = useState(null);
    const addGalleryItem = () => {
        setActiveGalleryAction('add');
        galleryFileRef.current.click();
    };
    const removeGalleryItem = (id) => {
        openConfirm('Supprimer l\'élément', 'Voulez-vous vraiment supprimer cet élément de la galerie ?', () => {
            setProfile({ ...profile, gallery: (profile.gallery || []).filter(g => g.id !== id) });
        });
    };

    // Testimonials
    const addTestimonial = () => setProfile({ ...profile, testimonials: [...(profile.testimonials || []), { id: Date.now(), name: '', text: '', rating: 5 }] });
    const updateTestimonial = (id, f, v) => setProfile({ ...profile, testimonials: (profile.testimonials || []).map(t => t.id === id ? { ...t, [f]: v } : t) });
    const removeTestimonial = (id) => { 
        openConfirm('Supprimer l\'avis', 'Supprimer cet avis client ?', () => {
            setProfile({ ...profile, testimonials: (profile.testimonials || []).filter(t => t.id !== id) });
        });
    };

    // FAQ
    const addFaq = () => setProfile({ ...profile, faq: [...(profile.faq || []), { id: Date.now(), question: '', answer: '' }] });
    const updateFaq = (id, f, v) => setProfile({ ...profile, faq: (profile.faq || []).map(q => q.id === id ? { ...q, [f]: v } : q) });
    const removeFaq = (id) => { openConfirm('Supprimer', 'Supprimer cette question ?', () => setProfile({ ...profile, faq: (profile.faq || []).filter(q => q.id !== id) })); };

    // Events
    const addEvent = () => setProfile({ ...profile, events: [...(profile.events || []), { id: Date.now(), title: '', date: '', location: '', description: '', link: '' }] });
    const updateEvent = (id, f, v) => setProfile({ ...profile, events: (profile.events || []).map(e => e.id === id ? { ...e, [f]: v } : e) });
    const removeEvent = (id) => {
        openConfirm('Supprimer l\'événement', 'Voulez-vous vraiment supprimer cet événement ?', () => {
            setProfile({ ...profile, events: (profile.events || []).filter(e => e.id !== id) });
        });
    };

    // Skills
    const [skillInput, setSkillInput] = useState('');
    const addSkill = () => { if (!skillInput.trim()) return; setProfile({ ...profile, skills: [...(profile.skills || []), skillInput.trim()] }); setSkillInput(''); };
    const removeSkill = (idx) => { const s = [...(profile.skills || [])]; s.splice(idx, 1); setProfile({ ...profile, skills: s }); };

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
                        <label style={{ fontSize: 13, fontWeight: 700, color: '#1A1265', marginBottom: 12, display: 'block' }}>Thèmes Rapides</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
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

                        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#64748B', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Réinitialiser via Thème Officiel</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                                {Object.entries(OFFICIAL_CARD_COLORS).map(([key, theme]) => (
                                    <button 
                                        key={key} 
                                        onClick={() => {
                                            setProfile({ ...profile, primaryColor: theme.qrPoints, backgroundColor: theme.qrBg });
                                            toast?.('Thème ' + theme.name + ' appliqué !', 'success');
                                        }}
                                        style={{ 
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', 
                                            padding: '8px', background: 'white', border: profile.primaryColor === theme.qrPoints ? '2px solid #1A1265' : '1px solid #E2E8F0', 
                                            borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: theme.card, border: '1px solid rgba(0,0,0,0.1)' }} />
                                        <span style={{ fontSize: '10px', fontWeight: '700', color: '#1A1265' }}>{theme.name.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
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
                                <button onClick={() => removeProduct(p.id)} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                
                                <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                    <div 
                                        onClick={() => triggerProductUpload(p.id)}
                                        style={{ width: 80, height: 80, borderRadius: 16, background: '#FFF', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, position: 'relative' }}
                                    >
                                        {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: 24 }}>📸</div>}
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
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: 'white', padding: 12, borderRadius: 12, border: '1px solid #E2E8F0' }}>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', marginBottom: 12, textTransform: 'uppercase' }}>Configuration du bouton</div>
                                    
                                    {/* Type d'action */}
                                    <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                                        <button 
                                            onClick={() => updateProduct(p.id, 'action_type', 'whatsapp')}
                                            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid', borderColor: p.action_type !== 'link' ? '#25D366' : '#E2E8F0', background: p.action_type !== 'link' ? '#F0FDF4' : 'white', color: p.action_type !== 'link' ? '#166534' : '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            WhatsApp
                                        </button>
                                        <button 
                                            onClick={() => updateProduct(p.id, 'action_type', 'link')}
                                            style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid', borderColor: p.action_type === 'link' ? '#6366F1' : '#E2E8F0', background: p.action_type === 'link' ? '#EEF2FF' : 'white', color: p.action_type === 'link' ? '#3730A3' : '#64748B', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                                        >
                                            Lien externe
                                        </button>
                                    </div>

                                    {/* Texte du bouton */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase' }}>Texte du bouton</label>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                                            {['Commander', 'Acheter', 'Voir plus', 'En savoir plus'].map(txt => (
                                                <button 
                                                    key={txt}
                                                    onClick={() => updateProduct(p.id, 'button_text', txt)}
                                                    style={{ padding: '6px 10px', fontSize: 10, fontWeight: 600, borderRadius: 6, border: '1px solid', borderColor: p.button_text === txt ? '#1A1265' : '#E2E8F0', background: p.button_text === txt ? '#EEF2FF' : 'white', color: p.button_text === txt ? '#1A1265' : '#64748B', cursor: 'pointer' }}
                                                >
                                                    {txt}
                                                </button>
                                            ))}
                                        </div>
                                        <input 
                                            placeholder="Ou texte personnalisé..." 
                                            value={p.button_text || ''} 
                                            onChange={e => updateProduct(p.id, 'button_text', e.target.value)} 
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} 
                                        />
                                    </div>

                                    {/* Destination */}
                                    {p.action_type !== 'link' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase' }}>Destination WhatsApp</label>
                                            <select 
                                                value={p.wa_type || 'personal'}
                                                onChange={e => updateProduct(p.id, 'wa_type', e.target.value)}
                                                style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #E2E8F0', background: 'white', fontSize: 13, fontWeight: 600, color: '#1A1265' }}
                                            >
                                                <option value="personal">WhatsApp Personnel ({(profile.socials?.whatsapp?.value || profile.phone || 'Non config.')})</option>
                                                <option value="business">WhatsApp Business ({(profile.socials?.whatsapp_business?.value || 'Non config.')})</option>
                                                <option value="custom">Numéro spécifique...</option>
                                            </select>
                                            
                                            {p.wa_type === 'custom' && (
                                                <input 
                                                    type="tel"
                                                    placeholder="+22969000000"
                                                    value={p.wa_number || ''}
                                                    onChange={e => updateProduct(p.id, 'wa_number', e.target.value)}
                                                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <label style={{ display: 'block', fontSize: 10, fontWeight: 800, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase' }}>Lien de redirection</label>
                                            <input 
                                                placeholder="https://votre-boutique.com/produit" 
                                                value={p.link_url || ''} 
                                                onChange={e => updateProduct(p.id, 'link_url', e.target.value)} 
                                                style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #E2E8F0', fontSize: 13 }} 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

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

            {/* GALLERY */}
            {acc('gallery', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`, 'Galerie Photos', 'Montrez vos plus belles images.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Activer la galerie</span>
                        <input type="checkbox" checked={profile.show_gallery || false} onChange={e => setProfile({ ...profile, show_gallery: e.target.checked })} />
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                        {(profile.gallery || []).filter(item => item.type !== 'video').map(item => (
                            <div key={item.id} style={{ width: 90, height: 90, borderRadius: 12, overflow: 'hidden', position: 'relative', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                                <img src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <button onClick={() => removeGalleryItem(item.id)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 900 }}>✕</button>
                            </div>
                        ))}
                    </div>
                    <button onClick={addGalleryItem} style={{ width: '100%', padding: 14, borderRadius: 14, border: '2px dashed #CBD5E1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Ajouter une photo</button>
                </div>
            ))}


            {/* SKILLS / TAGS */}
            {acc('skills', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`, 'Compétences / Tags', 'Affichez vos domaines d\'expertise.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Afficher les compétences</span>
                        <input type="checkbox" checked={profile.show_skills || false} onChange={e => setProfile({ ...profile, show_skills: e.target.checked })} />
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {(profile.skills || []).map((s, i) => (
                            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: '#EEF2FF', color: '#4F46E5', borderRadius: 100, fontWeight: 700, fontSize: 13 }}>
                                {s}
                                <button onClick={() => removeSkill(i)} style={{ background: 'none', border: 'none', color: '#4F46E5', cursor: 'pointer', fontWeight: 900, fontSize: 14, padding: 0 }}>×</button>
                            </span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="Ex: Design, Marketing..." style={{ flex: 1, padding: '12px 16px', borderRadius: 12, border: '1px solid #E2E8F0', background: '#F8FAFC' }} />
                        <button onClick={addSkill} style={{ padding: '12px 20px', borderRadius: 12, background: '#4F46E5', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}>+</button>
                    </div>
                </div>
            ))}

            {/* TESTIMONIALS */}
            {acc('testimonials', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>`, 'Témoignages / Avis', 'Avis reçus de vos visiteurs.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <p style={{ fontSize: 13, color: '#64748B', marginBottom: 5 }}>Les avis sont soumis directement par vos visiteurs sur votre profil public. Vous pouvez gérer ici ceux qui s'affichent.</p>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Afficher les témoignages</span>
                        <input type="checkbox" checked={profile.show_testimonials || false} onChange={e => setProfile({ ...profile, show_testimonials: e.target.checked })} />
                    </label>
                    {(profile.testimonials || []).length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', background: '#F8FAFC', borderRadius: 16, border: '1px dashed #E2E8F0', color: '#94A3B8', fontSize: 13 }}>Aucun avis reçu pour le moment.</div>
                    ) : (
                        (profile.testimonials || []).map(t => (
                            <div key={t.id} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0', position: 'relative' }}>
                                <button onClick={() => removeTestimonial(t.id)} style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                                <div style={{ fontWeight: 800, color: '#1A1265', fontSize: 14, marginBottom: 4 }}>{t.name}</div>
                                <div style={{ color: '#F59E0B', fontSize: 12, marginBottom: 8 }}>{'★'.repeat(t.rating)}{'☆'.repeat(5-t.rating)}</div>
                                <div style={{ fontSize: 13, color: '#475569', fontStyle: 'italic' }}>"{t.text}"</div>
                            </div>
                        ))
                    )}
                </div>
            ))}

            {/* FAQ */}
            {acc('faq', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`, 'FAQ', 'Questions fréquemment posées.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Afficher la FAQ</span>
                        <input type="checkbox" checked={profile.show_faq || false} onChange={e => setProfile({ ...profile, show_faq: e.target.checked })} />
                    </label>
                    {(profile.faq || []).map(q => (
                        <div key={q.id} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0', position: 'relative' }}>
                            <button onClick={() => removeFaq(q.id)} style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                            <div className="field" style={{ marginBottom: 10 }}><label>Question</label><input type="text" value={q.question} onChange={e => updateFaq(q.id, 'question', e.target.value)} placeholder="Comment ça marche ?" style={{ background: 'white' }} /></div>
                            <div className="field" style={{ marginBottom: 0 }}><label>Réponse</label><textarea value={q.answer} onChange={e => updateFaq(q.id, 'answer', e.target.value)} placeholder="Très simplement..." rows={2} style={{ background: 'white', width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #E2E8F0', resize: 'vertical', fontFamily: 'inherit' }} /></div>
                        </div>
                    ))}
                    <button onClick={addFaq} style={{ width: '100%', padding: 14, borderRadius: 14, border: '2px dashed #CBD5E1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Ajouter une question</button>
                </div>
            ))}

            {/* EVENTS */}
            {acc('events', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`, 'Événements à Venir', 'Annoncez vos prochains événements.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1265' }}>Afficher les événements</span>
                        <input type="checkbox" checked={profile.show_events || false} onChange={e => setProfile({ ...profile, show_events: e.target.checked })} />
                    </label>
                    {(profile.events || []).map(ev => (
                        <div key={ev.id} style={{ background: '#F8FAFC', borderRadius: 16, padding: 16, border: '1px solid #E2E8F0', position: 'relative' }}>
                            <button onClick={() => removeEvent(ev.id)} style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: '50%', background: '#FEE2E2', color: '#EF4444', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                                <div className="field" style={{ marginBottom: 0 }}><label>Titre</label><input type="text" value={ev.title} onChange={e => updateEvent(ev.id, 'title', e.target.value)} placeholder="Workshop Design" style={{ background: 'white' }} /></div>
                                <div className="field" style={{ marginBottom: 0 }}><label>Date</label><input type="date" value={ev.date} onChange={e => updateEvent(ev.id, 'date', e.target.value)} style={{ background: 'white' }} /></div>
                            </div>
                            <div className="field" style={{ marginBottom: 10 }}><label>Lieu</label><input type="text" value={ev.location} onChange={e => updateEvent(ev.id, 'location', e.target.value)} placeholder="Cotonou, Bénin" style={{ background: 'white' }} /></div>
                            <div className="field" style={{ marginBottom: 10 }}><label>Description</label><textarea value={ev.description} onChange={e => updateEvent(ev.id, 'description', e.target.value)} placeholder="Détails..." rows={2} style={{ background: 'white', width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #E2E8F0', resize: 'vertical', fontFamily: 'inherit' }} /></div>
                            <div className="field" style={{ marginBottom: 0 }}><label>Lien (optionnel)</label><input type="url" value={ev.link} onChange={e => updateEvent(ev.id, 'link', e.target.value)} placeholder="https://..." style={{ background: 'white' }} /></div>
                        </div>
                    ))}
                    <button onClick={addEvent} style={{ width: '100%', padding: 14, borderRadius: 14, border: '2px dashed #CBD5E1', background: 'white', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Ajouter un événement</button>
                </div>
            ))}


            {/* SECTION MISE EN PAGE */}
            {acc('layout', `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10H3M21 6H3M21 14H3M21 18H3"></path></svg>`, 'Mise en page', 'Ordre des sections du profil.', (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 13, color: '#64748B', marginBottom: 10 }}>Organisez l'ordre d'apparition des sections sur votre profil public.</p>
                    {(() => {
                        const defaultSections = ['contact_buttons', 'links', 'products', 'business_info', 'gallery', 'skills', 'testimonials', 'faq', 'events'];
                        const currentOrder = profile.section_order || [];
                        const missing = defaultSections.filter(s => !currentOrder.includes(s));
                        const sections = [...currentOrder, ...missing].filter(s => s !== 'bio' && defaultSections.includes(s));
                        
                        const sectionLabels = {
                            contact_buttons: 'Boutons directs (Appel/Email)',
                            links: 'Réseaux Sociaux & Liens',
                            products: 'Boutique & Catalogue',
                            business_info: 'Infos Business (Horaires/Map)',
                            gallery: 'Galerie Photos',
                            skills: 'Compétences / Tags',
                            testimonials: 'Témoignages / Avis',
                            faq: 'FAQ',
                            events: 'Événements à Venir'
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

            <input ref={galleryFileRef} type="file" hidden accept="image/*" onChange={e => {
                if (e.target.files[0] && onUploadBanner) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = (re) => {
                        const items = [...(profile.gallery || []), { id: Date.now(), url: re.target.result, caption: '', type: 'image' }];
                        setProfile({ ...profile, gallery: items });
                        // Also upload to storage for persistence
                        if (onUploadBanner) {
                            onUploadBanner({ target: { files: [file] } }, (url) => {
                                setProfile(prev => ({...prev, gallery: (prev.gallery || []).map(g => g.id === items[items.length-1].id ? {...g, url} : g)}));
                            });
                        }
                    };
                    reader.readAsDataURL(file);
                }
            }} />

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

            <Modal 
                isOpen={confirmModal.isOpen} 
                title={confirmModal.title} 
                type="warning" 
                confirmText="Supprimer" 
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
                onConfirm={confirmModal.onConfirm}
            >
                {confirmModal.message}
            </Modal>
        </div>
    );
}