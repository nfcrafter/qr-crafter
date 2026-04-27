// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import ProfileForm from '../../components/ProfileForm.jsx';

const DOT_STYLES = [
    { id: 'rounded', label: 'Arrondi' },
    { id: 'dots', label: 'Points' },
    { id: 'classy', label: 'Classique' },
    { id: 'classy-rounded', label: 'Classique Arrondi' },
    { id: 'square', label: 'Carré' },
    { id: 'extra-rounded', label: 'Extra Arrondi' }
];

const CORNER_STYLES = [
    { id: 'square', label: 'Carré' },
    { id: 'extra-rounded', label: 'Arrondi' },
    { id: 'dot', label: 'Point' }
];

export default function CreateCardWizard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const [generatedCardId, setGeneratedCardId] = useState(null);

    const [step, setStep] = useState(1);
    const [generating, setGenerating] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const [clientInfo, setClientInfo] = useState({
        clientName: '',
        city: '',
        country: 'Bénin'
    });

    const [publicProfile, setPublicProfile] = useState({
        full_name: '',
        title: '',
        bio: '',
        photo_url: '',
        banner_url: '',
        theme_color: '#28C254',
        whatsapp: '',
        instagram: '',
        facebook: '',
        tiktok: '',
        twitter: '',
        linkedin: '',
        youtube: '',
        website: '',
        email: '',
        phone: '',
    });

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded',
        dotsColor: '#28C254',
        bgColor: '#FFFFFF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#28C254',
        cornersDotColor: '#28C254',
        logo_url: null,
    });

    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        loadFolders();
        generateUniqueCardId().then(id => setGeneratedCardId(id));
    }, []);

    useEffect(() => {
        if (step === 3 && qrRef.current && generatedCardId) {
            if (!qrCode.current) {
                initQRCode();
            } else {
                updateQRCode();
            }
        }
    }, [step, qrAppearance, generatedCardId]);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function initQRCode() {
        const url = `${window.location.origin}/u/${generatedCardId}`;
        qrCode.current = new QRCodeStyling({
            width: 300,
            height: 300,
            type: 'svg',
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
        if (!qrCode.current) return;
        qrCode.current.update({
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
            image: qrAppearance.logo_url || '',
        });
    }

    async function uploadLogo(file) {
        if (!file) return;
        setUploadingLogo(true);
        try {
            const fileName = `logo-${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from('qr-logos')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('qr-logos')
                .getPublicUrl(fileName);

            setQrAppearance(prev => ({ ...prev, logo_url: publicUrl }));
            toast('Logo ajouté avec succès', 'success');
        } catch (err) {
            toast('Erreur lors de l\'upload du logo', 'error');
        } finally {
            setUploadingLogo(false);
        }
    }

    async function finalizeCreate() {
        setGenerating(true);
        try {
            const token = Math.random().toString(36).substring(2, 10).toUpperCase();
            const { error } = await supabase.from('cards').insert({
                card_id: generatedCardId,
                card_name: clientInfo.clientName,
                status: 'pending',
                activation_token: token,
                city: clientInfo.city,
                country: clientInfo.country,
                folder_id: selectedFolder || null,
                admin_profile: publicProfile,
                qr_appearance: qrAppearance,
            });

            if (error) throw error;

            toast('Carte créée avec succès !', 'success');
            qrCode.current.download({ name: `QR-${generatedCardId}`, extension: 'png' });
            navigate('/admin');
        } catch (err) {
            toast('Erreur : ' + err.message, 'error');
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                {/* Header */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ marginBottom: '16px' }}>
                            ← Retour
                        </button>
                        <h1 style={{ fontSize: '32px' }}>Nouvelle Carte NFC</h1>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3].map(s => (
                            <div key={s} style={{ 
                                width: '40px', 
                                height: '8px', 
                                borderRadius: '4px', 
                                background: step >= s ? 'var(--primary)' : '#E2E8F0',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div style={{ display: 'grid', gridTemplateColumns: step === 1 ? '1fr' : '1fr 400px', gap: '40px' }}>
                    
                    {/* Main Form Area */}
                    <div className="premium-card animate-fade-in" key={step}>
                        {step === 1 && (
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <h2 style={{ marginBottom: '24px' }}>1. Informations du Client</h2>
                                <div className="field">
                                    <label>Nom du client / Entreprise</label>
                                    <input type="text" placeholder="Ex: Jean Dupont ou Restaurant L'Oasis" value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="field">
                                        <label>Ville</label>
                                        <input type="text" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Pays</label>
                                        <input type="text" value={clientInfo.country} onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })} />
                                    </div>
                                </div>
                                <div className="field">
                                    <label>Dossier</label>
                                    <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                                        <option value="">Sélectionner un dossier</option>
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginTop: '40px', textAlign: 'right' }}>
                                    <button className="btn-primary" onClick={() => setStep(2)} disabled={!clientInfo.clientName}>
                                        Continuer →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ marginBottom: '24px' }}>2. Profil Digital</h2>
                                <ProfileForm
                                    form={publicProfile}
                                    onChange={setPublicProfile}
                                    onUploadAvatar={(f) => {}} // Handle avatar upload
                                    onUploadBanner={(f) => {}} // Handle banner upload
                                />
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn-ghost" onClick={() => setStep(1)}>Précédent</button>
                                    <button className="btn-primary" onClick={() => setStep(3)}>Personnaliser le QR →</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ marginBottom: '24px' }}>3. Design du QR Code</h2>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Motif & Couleurs</h3>
                                        <div className="field">
                                            <label>Style des points</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {DOT_STYLES.map(s => (
                                                    <button 
                                                        key={s.id}
                                                        onClick={() => setQrAppearance({...qrAppearance, dotsType: s.id})}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            borderRadius: '8px', 
                                                            border: '1px solid var(--border)',
                                                            background: qrAppearance.dotsType === s.id ? 'var(--primary)' : 'white',
                                                            color: qrAppearance.dotsType === s.id ? 'white' : 'var(--text-700)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label>Couleur principale</label>
                                            <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value, cornersColor: e.target.value, cornersDotColor: e.target.value})} />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Coins & Logo</h3>
                                        <div className="field">
                                            <label>Style des coins</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {CORNER_STYLES.map(s => (
                                                    <button 
                                                        key={s.id}
                                                        onClick={() => setQrAppearance({...qrAppearance, cornersType: s.id})}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            borderRadius: '8px', 
                                                            border: '1px solid var(--border)',
                                                            background: qrAppearance.cornersType === s.id ? 'var(--primary)' : 'white',
                                                            color: qrAppearance.cornersType === s.id ? 'white' : 'var(--text-700)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label>Logo central</label>
                                            <input type="file" onChange={e => uploadLogo(e.target.files[0])} />
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn-ghost" onClick={() => setStep(2)}>Précédent</button>
                                    <button className="btn-primary" onClick={finalizeCreate} disabled={generating}>
                                        {generating ? 'Création...' : 'Terminer & Télécharger ✓'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Sidebar */}
                    {step > 1 && (
                        <div className="animate-fade-in">
                            <div style={{ position: 'sticky', top: '40px' }}>
                                <div className="premium-card" style={{ textAlign: 'center' }}>
                                    <h3 style={{ marginBottom: '20px' }}>Aperçu Final</h3>
                                    <div ref={qrRef} style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'inline-block', border: '1px solid var(--border)' }}></div>
                                    <p style={{ marginTop: '16px', color: 'var(--text-500)', fontSize: '14px' }}>
                                        Lien: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>/u/{generatedCardId}</span>
                                    </p>
                                    <div style={{ marginTop: '24px', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px', textAlign: 'left' }}>
                                        <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>Conseil NFC :</p>
                                        <p style={{ fontSize: '12px', color: 'var(--text-700)' }}>Utilisez un contraste élevé pour une meilleure lecture sur les cartes physiques.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}