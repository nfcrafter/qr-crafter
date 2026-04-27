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
            case 'wifi': return `WIFI:T:${typeData.encryption || 'WPA'};S:${typeData.ssid || ''};P:${typeData.pass || ''};;`;
            case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${typeData.fn || ''}\nTEL:${typeData.tel || ''}\nEND:VCARD`;
            default: return typeData.url || profileUrl;
        }
    }

    function initQRCode(data) {
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, data: data,
            dotsOptions: { 
                color: qrAppearance.dotsColor, type: qrAppearance.dotsType,
                gradient: qrAppearance.useGradient ? { type: 'linear', rotation: 45, colorStops: [{ offset: 0, color: qrAppearance.dotsColor }, { offset: 1, color: qrAppearance.gradientColor }] } : null
            },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
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
            toast('Succès !', 'success');
            navigate('/admin');
        } catch (err) { toast('Erreur : ' + err.message, 'error'); } 
        finally { setGenerating(false); }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => step === 0 ? navigate('/admin') : setStep(step - 1)} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '800', cursor: 'pointer', color: '#1A1265' }}>← Retour</button>
                    <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1A1265' }}>Générateur de Code QR</h1>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '40px' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '24px', border: '1px solid #E2E8F0' }}>
                        {step === 0 && (
                            <div>
                                <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '900' }}>1. Type de contenu</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                                    {QR_TYPES.map(type => (
                                        <div key={type.id} onClick={() => { setSelectedType(type.id); setStep(1); }} style={{ padding: '20px', border: '1px solid #F1F5F9', borderRadius: '16px', cursor: 'pointer', textAlign: 'center', background: selectedType === type.id ? '#F0F7FF' : 'white', borderColor: selectedType === type.id ? '#1A1265' : '#F1F5F9' }}>
                                            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{type.icon}</div>
                                            <div style={{ fontWeight: '800', fontSize: '13px', color: '#1A1265' }}>{type.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '900' }}>2. Infos Client</h2>
                                <div className="field"><label>Nom Client</label><input type="text" value={clientInfo.clientName} onChange={e => setClientInfo({...clientInfo, clientName: e.target.value})} /></div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(0)} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Précédent</button>
                                    <button onClick={() => setStep(2)} style={{ flex: 2, padding: '16px', borderRadius: '12px', border: 'none', background: '#1A1265', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Suivant</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '900' }}>3. Configuration</h2>
                                {selectedType === 'url' ? (
                                    <ProfileForm form={publicProfile} onChange={setPublicProfile} onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)} onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)} uploadingAvatar={uploadingAvatar} uploadingBanner={uploadingBanner} />
                                ) : (
                                    <div className="field"><label>URL / Donnée</label><input type="text" onChange={e => setTypeData({...typeData, url: e.target.value})} /></div>
                                )}
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(1)} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Précédent</button>
                                    <button onClick={() => setStep(3)} style={{ flex: 2, padding: '16px', borderRadius: '12px', border: 'none', background: '#1A1265', color: 'white', fontWeight: '800', cursor: 'pointer' }}>Personnalisation →</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '900' }}>4. Design Final</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="field"><label>Couleur</label><input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} style={{ height: '54px' }} /></div>
                                    <div className="field"><label>Logo</label><input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setQrAppearance({...qrAppearance, logo_url: url}), setUploadingLogo)} /></div>
                                </div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button onClick={() => setStep(2)} style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '800', cursor: 'pointer' }}>Précédent</button>
                                    <button onClick={finalizeCreate} disabled={generating} style={{ flex: 2, padding: '16px', borderRadius: '12px', border: 'none', background: '#1A1265', color: 'white', fontWeight: '800', cursor: 'pointer' }}>{generating ? 'Enregistrement...' : 'Créer mon code QR ✓'}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: '40px' }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '24px', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                            <div ref={qrRef} style={{ background: 'white', padding: '20px', borderRadius: '20px', border: '1px solid #F1F5F9', display: 'inline-block' }}>
                                {step < 2 && <div style={{ width: '280px', height: '280px', border: '2px dashed #E2E8F0', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Aperçu du QR</div>}
                            </div>
                            <div style={{ marginTop: '24px', textAlign: 'left', background: '#F8FAFC', padding: '20px', borderRadius: '16px' }}>
                                <div style={{ fontWeight: '900', color: '#1A1265' }}>PROJET : {clientInfo.clientName || 'Nouveau'}</div>
                                <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>TYPE : {selectedType.toUpperCase()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}