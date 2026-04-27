// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import PhonePreview from '../../components/PhonePreview.jsx';

const QR_TYPES = [
    { id: 'url', icon: '🌐', label: 'Lien URL', desc: 'Redirigez vers un site existant.' },
    { id: 'profile', icon: '👤', label: 'Profil Personnel', desc: 'Créez une page de profil digitale complète.' }
];

const SOCIAL_NETWORKS = [
    { id: 'whatsapp', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png', label: 'WhatsApp' },
    { id: 'instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', label: 'Instagram' },
    { id: 'facebook', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png', label: 'Facebook' },
    { id: 'tiktok', icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', label: 'TikTok' },
    { id: 'linkedin', icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png', label: 'LinkedIn' },
    { id: 'twitter', icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256013.png', label: 'X (Twitter)' },
    { id: 'youtube', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', label: 'YouTube' }
];

export default function CreateCardWizard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const [generatedCardId, setGeneratedCardId] = useState(null);

    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState('profile');
    const [generating, setGenerating] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState('info');
    const [previewMode, setPreviewMode] = useState('page');

    // Content State
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
        socials: {}, // { whatsapp: '+229...', instagram: '@user' }
        customLinks: [] // [{ label: '', url: '', icon: '' }]
    });

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersColor: '#1A1265',
        logo_url: null
    });

    useEffect(() => {
        generateUniqueCardId().then(id => setGeneratedCardId(id));
        loadFolders();
    }, []);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    useEffect(() => {
        if (qrRef.current && generatedCardId) {
            const data = formatQRData();
            if (!qrCode.current) initQRCode(data);
            else updateQRCode(data);
        }
    }, [qrAppearance, generatedCardId, profileData, selectedType, step]);

    function formatQRData() {
        const profileUrl = `${window.location.origin}/u/${generatedCardId}`;
        if (selectedType === 'url') return profileData.url || profileUrl;
        return profileUrl;
    }

    function initQRCode(data) {
        qrCode.current = new QRCodeStyling({
            width: 260, height: 260, data: data,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            image: qrAppearance.logo_url || '',
            imageOptions: { crossOrigin: 'anonymous', margin: 8 }
        });
        if (qrRef.current) { qrRef.current.innerHTML = ''; qrCode.current.append(qrRef.current); }
    }

    function updateQRCode(data) {
        if (!qrCode.current) return;
        qrCode.current.update({
            data: data,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            image: qrAppearance.logo_url || '',
        });
    }

    async function handleFinalize() {
        setGenerating(true);
        try {
            const { error } = await supabase.from('cards').insert({
                card_id: generatedCardId,
                card_name: cardName || profileData.full_name || 'Sans titre',
                folder_id: selectedFolderId,
                qr_appearance: qrAppearance,
                type_data: { ...profileData, qr_type: selectedType },
                status: 'active'
            });
            if (error) throw error;
            toast('Projet créé avec succès !', 'success');
            navigate('/admin');
        } catch (err) { toast(err.message, 'error'); } 
        finally { setGenerating(false); }
    }

    const renderAccordion = (id, icon, title, subtitle, children) => (
        <div className="accordion">
            <div className="accordion-header" onClick={() => setExpandedAccordion(expandedAccordion === id ? '' : id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '20px' }}>{icon}</div>
                    <div>
                        <div style={{ fontWeight: '700', color: '#1A1265' }}>{title}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>{subtitle}</div>
                    </div>
                </div>
                <div style={{ transform: expandedAccordion === id ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</div>
            </div>
            {expandedAccordion === id && <div className="accordion-content animate-fade-in">{children}</div>}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                <div className="stepper">
                    <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}><div className="step-number">1</div> Type</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}><div className="step-number">2</div> Contenu</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 3 ? (step > 3 ? 'done' : 'active') : ''}`}><div className="step-number">3</div> Design</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>
                    <div className="animate-fade-in">
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>Choisissez le type de QR</h2>
                                <div className="selection-grid">
                                    {QR_TYPES.map(type => (
                                        <div key={type.id} className={`selection-card ${selectedType === type.id ? 'active' : ''}`} onClick={() => { setSelectedType(type.id); setStep(2); }}>
                                            <i>{type.icon}</i>
                                            <h3>{type.label}</h3>
                                            <p>{type.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>Ajoutez votre contenu</h2>
                                
                                {selectedType === 'url' ? (
                                    renderAccordion('url', '🌐', 'Lien de redirection', 'Saisissez l\'URL de destination.', (
                                        <div className="field" style={{ marginTop: '20px' }}><label>URL du site *</label><input type="url" value={profileData.url || ''} onChange={e => setProfileData({...profileData, url: e.target.value})} placeholder="https://votresite.com" /></div>
                                    ))
                                ) : (
                                    <>
                                        {renderAccordion('info', '👤', 'Informations de base', 'Photo, nom et biographie.', (
                                            <div style={{ marginTop: '20px' }}>
                                                <div className="field"><label>Nom Complet *</label><input type="text" value={profileData.full_name} onChange={e => setProfileData({...profileData, full_name: e.target.value})} /></div>
                                                <div className="field"><label>Profession / Titre</label><input type="text" value={profileData.job_title} onChange={e => setProfileData({...profileData, job_title: e.target.value})} /></div>
                                                <div className="field"><label>Bio</label><textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} /></div>
                                            </div>
                                        ))}

                                        {renderAccordion('socials', '📱', 'Réseaux Sociaux', 'Cliquez pour ajouter vos liens.', (
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                                                    {SOCIAL_NETWORKS.map(net => (
                                                        <img key={net.id} src={net.icon} onClick={() => setProfileData({...profileData, socials: {...profileData.socials, [net.id]: profileData.socials[net.id] === undefined ? '' : profileData.socials[net.id]}})} style={{ width: '40px', height: '40px', cursor: 'pointer', opacity: profileData.socials[net.id] !== undefined ? 1 : 0.3, transition: '0.2s' }} alt={net.label} />
                                                    ))}
                                                </div>
                                                {Object.keys(profileData.socials).map(key => (
                                                    <div key={key} className="field"><label>{SOCIAL_NETWORKS.find(n => n.id === key)?.label}</label><input type="text" value={profileData.socials[key]} onChange={e => setProfileData({...profileData, socials: {...profileData.socials, [key]: e.target.value}})} placeholder="Identifiant ou lien..." /></div>
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {renderAccordion('config', '⚙️', 'Organisation', 'Dossier et nom interne.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="field"><label>Nom interne du projet</label><input type="text" value={cardName} onChange={e => setCardName(e.target.value)} /></div>
                                        <div className="field">
                                            <label>Dossier</label>
                                            <select value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value)}>
                                                <option value="">Aucun dossier</option>
                                                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>Design du Code QR</h2>
                                {renderAccordion('qr-motif', '⬛', 'Motif & Couleurs', 'Personnalisez le QR code.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="field"><label>Style</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                                {['rounded', 'dots', 'classy', 'square'].map(s => (
                                                    <div key={s} onClick={() => setQrAppearance({...qrAppearance, dotsType: s})} style={{ padding: '10px', border: qrAppearance.dotsType === s ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', background: 'white' }}>{s}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field"><label>Couleur</label><input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} /></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', padding: '30px 0', borderTop: '1px solid #E2E8F0' }}>
                            <button className="btn-nav-prev" onClick={() => step > 1 ? setStep(step - 1) : navigate('/admin')}>← Retour</button>
                            {step < 3 ? (
                                <button className="btn-nav-next" onClick={() => setStep(step + 1)}>Suivant →</button>
                            ) : (
                                <button className="btn-nav-next" onClick={handleFinalize} disabled={generating}>{generating ? 'Création...' : 'Valider & Créer ✓'}</button>
                            )}
                        </div>
                    </div>

                    <div className="phone-preview-container">
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                            <button onClick={() => setPreviewMode('qr')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: previewMode === 'qr' ? 'var(--primary)' : 'white', color: previewMode === 'qr' ? 'white' : '#64748B', fontWeight: '700', fontSize: '12px' }}>Code QR</button>
                            <button onClick={() => setPreviewMode('page')} style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: previewMode === 'page' ? 'var(--primary)' : 'white', color: previewMode === 'page' ? 'white' : '#64748B', fontWeight: '700', fontSize: '12px' }}>Aperçu Page</button>
                        </div>
                        
                        <PhonePreview>
                            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                                {previewMode === 'qr' ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                        <div ref={qrRef} style={{ background: 'white', padding: '10px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', marginBottom: '32px' }}></div>
                                        <h4 style={{ fontWeight: '900', color: '#1A1265' }}>{cardName || profileData.full_name || 'Sans titre'}</h4>
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ height: '120px', background: '#1A1265', borderRadius: '20px', margin: '-40px -20px 0' }}></div>
                                        <div style={{ width: '80px', height: '80px', background: '#F1F5F9', borderRadius: '50%', border: '4px solid white', marginTop: '-40px', marginLeft: '10px' }}></div>
                                        <div style={{ marginTop: '16px' }}>
                                            <h3 style={{ fontWeight: '900', color: '#1A1265' }}>{profileData.full_name || 'Votre Nom'}</h3>
                                            <p style={{ fontSize: '13px', color: '#64748B' }}>{profileData.job_title || 'Profession'}</p>
                                            
                                            <button style={{ width: '100%', marginTop: '24px', padding: '14px', borderRadius: '12px', background: '#1A1265', color: 'white', border: 'none', fontWeight: '700', fontSize: '13px' }}>Enregistrer le contact</button>
                                            
                                            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                                {Object.keys(profileData.socials).map(key => (
                                                    <img key={key} src={SOCIAL_NETWORKS.find(n => n.id === key)?.icon} style={{ width: '36px', height: '36px' }} alt="" />
                                                ))}
                                            </div>
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