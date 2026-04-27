// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import ProfileForm from '../../components/ProfileForm.jsx';
import PhonePreview from '../../components/PhonePreview.jsx';
import PublicProfile from '../PublicProfile.jsx';

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
        theme_color: '#1A1265',
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
        dotsColor: '#1A1265',
        bgColor: '#FFFFFF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1A1265',
        cornersDotColor: '#1A1265',
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

    async function uploadFile(file, bucket, setter, loadingSetter) {
        if (!file) return;
        loadingSetter(true);
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            setter(publicUrl);
            toast('Fichier ajouté avec succès', 'success');
        } catch (err) {
            console.error(err);
            toast("Erreur lors de l'upload. Assurez-vous que le dossier '" + bucket + "' existe dans Supabase Storage.", 'error');
        } finally {
            loadingSetter(false);
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ padding: '8px' }}>
                            ←
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
                            <div>
                                <h1 style={{ fontSize: '24px', margin: 0 }}>Nouvelle Carte NFC</h1>
                                <p style={{ fontSize: '13px', color: 'var(--text-500)', margin: 0 }}>Assistant de création premium</p>
                            </div>
                        </div>
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
                <div style={{ display: 'grid', gridTemplateColumns: step === 1 ? '1fr' : '1fr 400px', gap: '40px', alignItems: 'start' }}>
                    
                    {/* Main Form Area */}
                    <div className="premium-card animate-fade-in" key={step} style={{ minHeight: '500px' }}>
                        {step === 1 && (
                            <div style={{ maxWidth: '600px', margin: '40px auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏢</div>
                                    <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Informations du Client</h2>
                                    <p style={{ color: 'var(--text-500)' }}>Identifiez le client pour lequel vous créez cette carte.</p>
                                </div>

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
                                    <label>Dossier de rangement</label>
                                    <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                                        <option value="">Racine (aucun dossier)</option>
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginTop: '40px', textAlign: 'right' }}>
                                    <button className="btn-primary" onClick={() => setStep(2)} disabled={!clientInfo.clientName} style={{ padding: '16px 40px' }}>
                                        Configurer le profil →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ margin: 0 }}>Profil Digital</h2>
                                    <span style={{ fontSize: '13px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>Étape 2/3</span>
                                </div>
                                
                                <ProfileForm
                                    form={publicProfile}
                                    onChange={setPublicProfile}
                                    onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                                    onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                                    uploadingAvatar={uploadingAvatar}
                                    uploadingBanner={uploadingBanner}
                                />
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(1)}>Précédent</button>
                                    <button className="btn-primary" onClick={() => setStep(3)}>Personnaliser le QR →</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ margin: 0 }}>Design du QR Code</h2>
                                    <span style={{ fontSize: '13px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>Étape 3/3</span>
                                </div>
                                
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
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label>Couleur du QR</label>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                                <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value, cornersColor: e.target.value, cornersDotColor: e.target.value})} style={{ width: '40px', height: '40px', border: 'none', padding: 0, borderRadius: '8px' }} />
                                                <input type="text" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value, cornersColor: e.target.value, cornersDotColor: e.target.value})} style={{ flex: 1, fontFamily: 'monospace' }} />
                                            </div>
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
                                                            fontSize: '13px',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label>Logo au centre {uploadingLogo && '⌛'}</label>
                                            <input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setQrAppearance(prev => ({ ...prev, logo_url: url })), setUploadingLogo)} />
                                            <p style={{ fontSize: '11px', color: 'var(--text-500)', marginTop: '4px' }}>Utilisez un logo carré avec fond transparent pour un meilleur rendu.</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(2)}>Précédent</button>
                                    <button className="btn-primary" onClick={finalizeCreate} disabled={generating} style={{ padding: '16px 40px' }}>
                                        {generating ? 'Création...' : 'Terminer & Télécharger ✓'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Sidebar */}
                    <div className="animate-fade-in" style={{ position: 'sticky', top: '40px' }}>
                        {step === 2 ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '12px', fontWeight: '600', color: 'var(--text-500)', fontSize: '14px' }}>APERÇU MOBILE</p>
                                <PhonePreview>
                                    {/* Mock profile data for preview */}
                                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                                        <PublicProfile previewData={publicProfile} />
                                    </div>
                                </PhonePreview>
                            </div>
                        ) : step === 3 ? (
                            <div className="premium-card" style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '24px' }}>Aperçu du QR</h3>
                                <div ref={qrRef} style={{ background: 'white', padding: '20px', borderRadius: '24px', display: 'inline-block', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}></div>
                                <div style={{ marginTop: '24px', textAlign: 'left', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>Format optimisé</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-700)' }}>Le QR sera téléchargé en haute résolution (PNG) prêt pour l'impression sur vos cartes NFC.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-card" style={{ background: 'var(--primary)', color: 'white' }}>
                                <h3 style={{ color: 'white', marginBottom: '16px' }}>Pourquoi un assistant ?</h3>
                                <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                                    Cet outil vous permet de configurer entièrement l'expérience utilisateur avant même que le client ne reçoive sa carte.
                                </p>
                                <ul style={{ fontSize: '13px', marginTop: '16px', paddingLeft: '20px', opacity: 0.9 }}>
                                    <li style={{ marginBottom: '8px' }}>Profil pré-rempli</li>
                                    <li style={{ marginBottom: '8px' }}>QR Code personnalisé</li>
                                    <li>Lien d'activation unique</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
