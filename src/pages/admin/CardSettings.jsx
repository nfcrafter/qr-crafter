// src/pages/admin/CardSettings.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import PhonePreview from '../../components/PhonePreview.jsx';

const SOCIAL_NETWORKS = [
    { id: 'whatsapp', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png', label: 'WhatsApp' },
    { id: 'instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', label: 'Instagram' },
    { id: 'facebook', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png', label: 'Facebook' },
    { id: 'tiktok', icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', label: 'TikTok' },
    { id: 'linkedin', icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png', label: 'LinkedIn' },
    { id: 'twitter', icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256013.png', label: 'Twitter' },
    { id: 'youtube', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', label: 'YouTube' }
];

export default function CardSettings() {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState('info');
    const [previewMode, setPreviewMode] = useState('page');

    const [cardName, setCardName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [folders, setFolders] = useState([]);
    
    const [profileData, setProfileData] = useState({
        banner_url: '',
        photo_url: '',
        full_name: '',
        job_title: '',
        bio: '',
        primaryColor: '#1A1265',
        socials: {},
        customLinks: []
    });

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersColor: '#1A1265',
        logo_url: null
    });

    useEffect(() => {
        loadData();
    }, [cardId]);

    async function loadData() {
        setLoading(true);
        const { data: card, error } = await supabase.from('cards').select('*').eq('card_id', cardId).single();
        if (error || !card) { navigate('/admin'); return; }

        setCardName(card.card_name || '');
        setSelectedFolderId(card.folder_id);
        if (card.type_data) setProfileData(card.type_data);
        if (card.qr_appearance) setQrAppearance(card.qr_appearance);

        const { data: folderData } = await supabase.from('folders').select('*').order('created_at');
        setFolders(folderData || []);
        setLoading(false);
    }

    useEffect(() => {
        if (qrRef.current && !loading) {
            const data = `${window.location.origin}/u/${cardId}`;
            if (!qrCode.current) {
                qrCode.current = new QRCodeStyling({
                    width: 260, height: 260, data: data,
                    dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
                    cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
                    image: qrAppearance.logo_url || '',
                    imageOptions: { crossOrigin: 'anonymous', margin: 8 }
                });
                qrCode.current.append(qrRef.current);
            } else {
                qrCode.current.update({
                    dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
                    cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
                    image: qrAppearance.logo_url || '',
                });
            }
        }
    }, [qrAppearance, loading]);

    async function handleSave() {
        setSaving(true);
        try {
            const { error } = await supabase.from('cards').update({
                card_name: cardName,
                folder_id: selectedFolderId,
                qr_appearance: qrAppearance,
                type_data: profileData,
                updated_at: new Date().toISOString()
            }).eq('card_id', cardId);
            if (error) throw error;
            toast('Modifications enregistrées !', 'success');
        } catch (err) { toast(err.message, 'error'); } 
        finally { setSaving(false); }
    }

    const renderAccordion = (id, icon, title, subtitle, children, isDanger = false) => (
        <div className="accordion" style={{ border: isDanger ? '1px solid #FECACA' : '1px solid var(--border)' }}>
            <div className="accordion-header" onClick={() => setExpandedAccordion(expandedAccordion === id ? '' : id)} style={{ background: isDanger ? '#FFF5F5' : 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '20px' }}>{icon}</div>
                    <div>
                        <div style={{ fontWeight: '700', color: isDanger ? '#DC2626' : '#1A1265' }}>{title}</div>
                        <div style={{ fontSize: '12px', color: isDanger ? '#EF4444' : '#94A3B8' }}>{subtitle}</div>
                    </div>
                </div>
                <div style={{ transform: expandedAccordion === id ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</div>
            </div>
            {expandedAccordion === id && <div className="accordion-content animate-fade-in">{children}</div>}
        </div>
    );

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/admin')} className="btn-nav-prev">← Retour</button>
                        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1A1265' }}>Gérer le Projet</h1>
                    </div>
                    <button className="btn-nav-next" onClick={handleSave} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer les modifications ✓'}</button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>
                    <div>
                        {profileData.qr_type === 'url' ? (
                            renderAccordion('url', '🌐', 'Lien de redirection', 'URL de destination du QR.', (
                                <div className="field" style={{ marginTop: '20px' }}><label>URL du site</label><input type="url" value={profileData.url || ''} onChange={e => setProfileData({...profileData, url: e.target.value})} /></div>
                            ))
                        ) : (
                            <>
                                {renderAccordion('info', '👤', 'Contenu du Profil', 'Informations affichées sur la page.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="field"><label>Nom Complet</label><input type="text" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} /></div>
                                        <div className="field"><label>Titre / Job</label><input type="text" value={profileData.job_title} onChange={e => setProfileData({...profileData, job_title: e.target.value})} /></div>
                                        <div className="field"><label>Biographie</label><textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} /></div>
                                    </div>
                                ))}

                                {renderAccordion('socials', '📱', 'Réseaux Sociaux', 'Gérez vos liens de contact.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                            {SOCIAL_NETWORKS.map(net => (
                                                <img key={net.id} src={net.icon} onClick={() => setProfileData({...profileData, socials: {...profileData.socials, [net.id]: profileData.socials[net.id] === undefined ? '' : profileData.socials[net.id]}})} style={{ width: '40px', height: '40px', cursor: 'pointer', opacity: profileData.socials[net.id] !== undefined ? 1 : 0.3 }} alt="" />
                                            ))}
                                        </div>
                                        {Object.keys(profileData.socials).map(key => (
                                            <div key={key} className="field"><label>{SOCIAL_NETWORKS.find(n => n.id === key)?.label}</label><input type="text" value={profileData.socials[key]} onChange={e => setProfileData({...profileData, socials: {...profileData.socials, [key]: e.target.value}})} /></div>
                                        ))}
                                    </div>
                                ))}
                            </>
                        )}

                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#EF4444', marginBottom: '16px', letterSpacing: '1px' }}>ZONE DE DANGER</h3>
                            {renderAccordion('qr-design', '🎨', 'Design du Code QR', 'Attention : Toute modification changera le visuel.', (
                                <div style={{ marginTop: '20px' }}>
                                    <div className="field"><label>Motif</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                            {['rounded', 'dots', 'classy', 'square'].map(s => (
                                                <div key={s} onClick={() => setQrAppearance({...qrAppearance, dotsType: s})} style={{ padding: '8px', border: qrAppearance.dotsType === s ? '2px solid #EF4444' : '1px solid #E2E8F0', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', fontSize: '12px' }}>{s}</div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="field"><label>Couleur du QR</label><input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} /></div>
                                    <div className="field"><label>Logo central</label><input type="text" value={qrAppearance.logo_url || ''} onChange={e => setQrAppearance({...qrAppearance, logo_url: e.target.value})} placeholder="URL du logo..." /></div>
                                </div>
                            ), true)}
                        </div>
                    </div>

                    <div className="phone-preview-container">
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                            <button onClick={() => setPreviewMode('page')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: previewMode === 'page' ? '#1A1265' : 'white', color: previewMode === 'page' ? 'white' : '#64748B', fontWeight: '700', fontSize: '11px' }}>Aperçu Page</button>
                            <button onClick={() => setPreviewMode('qr')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: previewMode === 'qr' ? '#1A1265' : 'white', color: previewMode === 'qr' ? 'white' : '#64748B', fontWeight: '700', fontSize: '11px' }}>Aperçu QR</button>
                        </div>
                        <PhonePreview>
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                {previewMode === 'qr' ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <div ref={qrRef} style={{ background: 'white', padding: '10px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}></div>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ height: '120px', background: '#1A1265', borderRadius: '20px', margin: '-40px -20px 0' }}></div>
                                        <div style={{ width: '80px', height: '80px', background: '#eee', borderRadius: '50%', border: '4px solid white', marginTop: '-40px', marginLeft: '10px' }}></div>
                                        <div style={{ marginTop: '16px' }}>
                                            <h3 style={{ fontWeight: '900', color: '#1A1265' }}>{profileData.full_name || 'Votre Nom'}</h3>
                                            <p style={{ fontSize: '12px', color: '#64748B' }}>{profileData.job_title || 'Profession'}</p>
                                            <button style={{ width: '100%', marginTop: '20px', padding: '12px', borderRadius: '12px', background: '#1A1265', color: 'white', border: 'none', fontWeight: '700', fontSize: '12px' }}>Enregistrer le contact</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </PhonePreview>
                    </div>
                </div>
            </div>
        </div>
    );
}