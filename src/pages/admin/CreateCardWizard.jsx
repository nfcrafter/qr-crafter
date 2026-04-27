// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import ProfileForm from '../../components/ProfileForm.jsx';

const QR_TYPES = [
    { id: 'url', icon: '🔗', label: 'URL / Profil' },
    { id: 'vcard', icon: '👤', label: 'VCard' },
    { id: 'text', icon: '📝', label: 'Texte' },
    { id: 'wifi', icon: '📶', label: 'WiFi' },
    { id: 'email', icon: '📧', label: 'Email' },
    { id: 'sms', icon: '💬', label: 'SMS' },
    { id: 'phone', icon: '📞', label: 'Téléphone' },
    { id: 'geo', icon: '📍', label: 'Localisation' },
    { id: 'event', icon: '📅', label: 'Événement' },
    { id: 'crypto', icon: '₿', label: 'Crypto' },
    { id: 'instagram', icon: '📸', label: 'Instagram' },
    { id: 'facebook', icon: '👥', label: 'Facebook' },
    { id: 'pdf', icon: '📄', label: 'PDF' },
    { id: 'music', icon: '🎵', label: 'Musique' },
    { id: 'video', icon: '🎞️', label: 'Vidéo' },
    { id: 'image', icon: '🖼️', label: 'Image' }
];

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

    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState('url');
    const [generating, setGenerating] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);

    const [clientInfo, setClientInfo] = useState({ clientName: '', city: '', country: 'Bénin' });
    const [typeData, setTypeData] = useState({});
    const [publicProfile, setPublicProfile] = useState({
        full_name: '', title: '', bio: '', photo_url: '', banner_url: '', theme_color: '#1A1265',
        whatsapp: '', instagram: '', facebook: '', tiktok: '', twitter: '', linkedin: '', youtube: '', website: '', email: '', phone: '',
    });

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded', dotsColor: '#1A1265', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersDotType: 'dot', cornersColor: '#1A1265', cornersDotColor: '#1A1265',
        logo_url: null, useGradient: false, gradientColor: '#6366F1'
    });

    useEffect(() => {
        generateUniqueCardId().then(id => setGeneratedCardId(id));
    }, []);

    useEffect(() => {
        if (step >= 2 && qrRef.current && generatedCardId) {
            const data = formatQRData();
            if (!qrCode.current) initQRCode(data);
            else updateQRCode(data);
        }
    }, [step, qrAppearance, generatedCardId, typeData, publicProfile]);

    function formatQRData() {
        const profileUrl = `${window.location.origin}/u/${generatedCardId}`;
        switch (selectedType) {
            case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${typeData.fn || ''}\nTEL:${typeData.tel || ''}\nEMAIL:${typeData.email || ''}\nEND:VCARD`;
            case 'wifi': return `WIFI:T:${typeData.encryption || 'WPA'};S:${typeData.ssid || ''};P:${typeData.pass || ''};;`;
            case 'text': return typeData.text || '';
            default: return typeData.url || profileUrl;
        }
    }

    function initQRCode(data) {
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, type: 'svg', data: data,
            dotsOptions: { 
                color: qrAppearance.dotsColor, type: qrAppearance.dotsType,
                gradient: qrAppearance.useGradient ? { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: qrAppearance.dotsColor }, { offset: 1, color: qrAppearance.gradientColor }] } : null
            },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
            image: qrAppearance.logo_url || '',
            imageOptions: { crossOrigin: 'anonymous', margin: 10 }
        });
        if (qrRef.current) { qrRef.current.innerHTML = ''; qrCode.current.append(qrRef.current); }
    }

    function updateQRCode(data) {
        if (!qrCode.current) return;
        qrCode.current.update({
            data: data,
            dotsOptions: { 
                color: qrAppearance.dotsColor, type: qrAppearance.dotsType,
                gradient: qrAppearance.useGradient ? { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: qrAppearance.dotsColor }, { offset: 1, color: qrAppearance.gradientColor }] } : null
            },
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
            const { error } = await supabase.storage.from(bucket).upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            setter(publicUrl);
            toast('Fichier chargé', 'success');
        } catch (err) { toast("Erreur d'upload", 'error'); } 
        finally { loadingSetter(false); }
    }

    async function finalizeCreate() {
        setGenerating(true);
        try {
            const typeLabel = QR_TYPES.find(t => t.id === selectedType)?.label || selectedType.toUpperCase();
            let folderId = null;
            const { data: existingFolders } = await supabase.from('folders').select('id').eq('name', typeLabel).limit(1);
            if (existingFolders?.length > 0) folderId = existingFolders[0].id;
            else {
                const { data: newFolder } = await supabase.from('folders').insert({ name: typeLabel, color: qrAppearance.dotsColor }).select().single();
                if (newFolder) folderId = newFolder.id;
            }

            const { error } = await supabase.from('cards').insert({
                card_id: generatedCardId,
                card_name: clientInfo.clientName,
                status: 'pending',
                activation_token: Math.random().toString(36).substring(2, 10).toUpperCase(),
                city: clientInfo.city,
                country: clientInfo.country,
                folder_id: folderId,
                admin_profile: { ...publicProfile, qr_type: selectedType },
                qr_appearance: qrAppearance,
                type_data: { ...typeData, qr_type: selectedType }
            });
            if (error) throw error;
            toast('Code QR créé avec succès !', 'success');
            navigate('/admin');
        } catch (err) { toast('Erreur : ' + err.message, 'error'); } 
        finally { setGenerating(false); }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div onClick={() => navigate('/admin')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '36px' }} />
                        <h1 style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', margin: 0 }}>GÉNÉRATEUR STUDIO</h1>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                        {step === 0 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Étape 1 : Type de QR</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                    {QR_TYPES.map(type => (
                                        <div 
                                            key={type.id}
                                            onClick={() => { setSelectedType(type.id); setStep(1); }}
                                            style={{ 
                                                padding: '20px 10px', border: '1px solid #F1F5F9', borderRadius: '16px', cursor: 'pointer',
                                                background: selectedType === type.id ? '#EEF2FF' : 'white',
                                                borderColor: selectedType === type.id ? '#1A1265' : '#F1F5F9',
                                                textAlign: 'center', transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#1A1265'}
                                            onMouseLeave={e => { if(selectedType !== type.id) e.currentTarget.style.borderColor = '#F1F5F9'; }}
                                        >
                                            <div style={{ fontSize: '28px', marginBottom: '10px' }}>{type.icon}</div>
                                            <div style={{ fontWeight: '800', color: '#1A1265', fontSize: '13px' }}>{type.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Étape 2 : Infos Client</h2>
                                <div className="field"><label>Nom Client</label><input type="text" value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="field"><label>Ville</label><input type="text" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} /></div>
                                    <div className="field"><label>Pays</label><input type="text" value={clientInfo.country} onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })} /></div>
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>Retour</button>
                                    <button className="btn-primary" style={{ flex: 2, background: '#1A1265', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }} onClick={() => setStep(2)}>Continuer</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Étape 3 : Contenu</h2>
                                {selectedType === 'url' ? (
                                    <ProfileForm 
                                        form={publicProfile} onChange={setPublicProfile}
                                        onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                                        onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                                        uploadingAvatar={uploadingAvatar} uploadingBanner={uploadingBanner}
                                    />
                                ) : (
                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        {selectedType === 'wifi' && (
                                            <>
                                                <div className="field"><label>SSID</label><input type="text" onChange={e => setTypeData({...typeData, ssid: e.target.value})} /></div>
                                                <div className="field"><label>Mot de passe</label><input type="text" onChange={e => setTypeData({...typeData, pass: e.target.value})} /></div>
                                            </>
                                        )}
                                        <div className="field"><label>Lien ou Donnée</label><input type="text" value={typeData.url || ''} onChange={e => setTypeData({...typeData, url: e.target.value})} placeholder="https://..." /></div>
                                    </div>
                                )}
                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Retour</button>
                                    <button className="btn-primary" style={{ flex: 2, background: '#1A1265', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }} onClick={() => setStep(3)}>Design</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Étape 4 : Personnalisation</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="field"><label>Couleur</label><input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} style={{ height: '54px' }} /></div>
                                    <div className="field"><label>Forme Points</label><select value={qrAppearance.dotsType} onChange={e => setQrAppearance({...qrAppearance, dotsType: e.target.value})}>{DOT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                                    <div className="field" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700' }}>
                                            <input type="checkbox" checked={qrAppearance.useGradient} onChange={e => setQrAppearance({...qrAppearance, useGradient: e.target.checked})} />
                                            Utiliser un dégradé
                                        </label>
                                        {qrAppearance.useGradient && <input type="color" value={qrAppearance.gradientColor} onChange={e => setQrAppearance({...qrAppearance, gradientColor: e.target.value})} style={{ marginTop: '10px', height: '54px' }} />}
                                    </div>
                                    <div className="field"><label>Logo central</label><input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setQrAppearance({...qrAppearance, logo_url: url}), setUploadingLogo)} /></div>
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>Retour</button>
                                    <button className="btn-primary" style={{ flex: 2, background: '#1A1265', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer' }} onClick={finalizeCreate} disabled={generating}>{generating ? 'Enregistrement...' : 'Finaliser le QR ✓'}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: '40px' }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '32px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
                            <div ref={qrRef} style={{ background: 'white', padding: '20px', borderRadius: '24px', display: 'inline-block', border: '1px solid #F1F5F9' }}>
                                {step < 2 && <div style={{ width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', border: '2px dashed #F1F5F9', borderRadius: '24px' }}>Aperçu</div>}
                            </div>
                            <div style={{ marginTop: '24px', textAlign: 'left', background: '#F8FAFC', padding: '20px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                                <div style={{ fontWeight: '900', color: '#1A1265', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>{QR_TYPES.find(t => t.id === selectedType)?.icon}</span>
                                    <span>{QR_TYPES.find(t => t.id === selectedType)?.label}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '8px' }}>Génère automatiquement un code QR de haute qualité.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}