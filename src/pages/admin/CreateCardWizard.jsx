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

const QR_TYPES = [
    { id: 'url', label: 'URL / Profil', description: 'Lien vers un profil ou site' },
    { id: 'vcard', label: 'VCard', description: 'Coordonnées de contact' },
    { id: 'text', label: 'Texte', description: 'Message ou note simple' },
    { id: 'wifi', label: 'WiFi', description: 'Partage de connexion' },
    { id: 'email', label: 'Email', description: 'Envoi de mail pré-rempli' },
    { id: 'sms', label: 'SMS', description: 'Envoi de SMS pré-rempli' },
    { id: 'phone', label: 'Téléphone', description: 'Appel direct' },
    { id: 'geo', label: 'Localisation', description: 'Coordonnées GPS' },
    { id: 'event', label: 'Événement', description: 'Calendrier iCal' },
    { id: 'crypto', label: 'Crypto', description: 'Adresse de wallet' },
    { id: 'instagram', label: 'Instagram', description: 'Profil ou lien post' },
    { id: 'facebook', label: 'Facebook', description: 'Page ou profil' },
    { id: 'pdf', label: 'PDF', description: 'Document téléchargeable' },
    { id: 'music', label: 'Musique', description: 'Lien audio ou playlist' },
    { id: 'video', label: 'Vidéo', description: 'Lien YouTube ou autre' },
    { id: 'image', label: 'Image', description: 'Galerie ou image seule' }
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

    const [clientInfo, setClientInfo] = useState({
        clientName: '',
        city: '',
        country: 'Bénin'
    });

    const [typeData, setTypeData] = useState({});

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

    useEffect(() => {
        generateUniqueCardId().then(id => setGeneratedCardId(id));
    }, []);

    useEffect(() => {
        if (step >= 2 && qrRef.current && generatedCardId) {
            const data = formatQRData();
            if (!qrCode.current) {
                initQRCode(data);
            } else {
                updateQRCode(data);
            }
        }
    }, [step, qrAppearance, generatedCardId, typeData, publicProfile]);

    function formatQRData() {
        const profileUrl = `${window.location.origin}/u/${generatedCardId}`;
        switch (selectedType) {
            case 'url': return typeData.url || profileUrl;
            case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${typeData.fn || ''}\nTEL:${typeData.tel || ''}\nEMAIL:${typeData.email || ''}\nEND:VCARD`;
            case 'text': return typeData.text || '';
            case 'wifi': return `WIFI:T:${typeData.encryption || 'WPA'};S:${typeData.ssid || ''};P:${typeData.pass || ''};;`;
            case 'email': return `mailto:${typeData.to || ''}?subject=${encodeURIComponent(typeData.sub || '')}&body=${encodeURIComponent(typeData.body || '')}`;
            case 'sms': return `SMSTO:${typeData.num || ''}:${typeData.msg || ''}`;
            case 'phone': return `tel:${typeData.num || ''}`;
            default: return profileUrl;
        }
    }

    function initQRCode(data) {
        qrCode.current = new QRCodeStyling({
            width: 250,
            height: 250,
            type: 'svg',
            data: data,
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

    function updateQRCode(data) {
        if (!qrCode.current) return;
        qrCode.current.update({
            data: data,
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
            const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
            if (error) throw error;
            const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
            setter(publicUrl);
            toast('Fichier ajouté', 'success');
        } catch (err) {
            toast("Erreur d'upload", 'error');
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
                admin_profile: { ...publicProfile, qr_type: selectedType },
                qr_appearance: qrAppearance,
                type_data: { ...typeData, qr_type: selectedType }
            });
            if (error) throw error;
            toast('Carte créée !', 'success');
            navigate('/admin');
        } catch (err) {
            toast('Erreur : ' + err.message, 'error');
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F4F7FA', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '50px' }} />
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1A1265', margin: 0 }}>Nouveau Code QR</h1>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            {[0, 1, 2, 3].map(s => (
                                <div key={s} style={{ width: '40px', height: '4px', background: step >= s ? '#1A1265' : '#CBD5E1', borderRadius: '2px' }} />
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                    {/* Main Content */}
                    <div style={{ background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                        {step === 0 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>1. Sélectionnez le type</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                                    {QR_TYPES.map(type => (
                                        <div 
                                            key={type.id}
                                            onClick={() => { setSelectedType(type.id); setStep(1); }}
                                            style={{ 
                                                padding: '20px', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer',
                                                background: selectedType === type.id ? '#F0F4FF' : 'transparent',
                                                borderColor: selectedType === type.id ? '#1A1265' : '#E2E8F0'
                                            }}
                                        >
                                            <div style={{ fontWeight: '700', color: '#1A1265' }}>{type.label}</div>
                                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>{type.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>2. Informations Client</h2>
                                <div className="field">
                                    <label>Nom du client ou entreprise</label>
                                    <input type="text" value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className="field">
                                        <label>Ville</label>
                                        <input type="text" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} />
                                    </div>
                                    <div className="field">
                                        <label>Pays</label>
                                        <input type="text" value={clientInfo.country} onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(0)}>Retour</button>
                                    <button className="btn-primary" onClick={() => setStep(2)}>Suivant</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>3. Contenu du QR ({selectedType})</h2>
                                {selectedType === 'url' ? (
                                    <ProfileForm form={publicProfile} onChange={setPublicProfile} />
                                ) : (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {selectedType === 'wifi' && (
                                            <>
                                                <div className="field"><label>SSID</label><input type="text" onChange={e => setTypeData({...typeData, ssid: e.target.value})} /></div>
                                                <div className="field"><label>Mot de passe</label><input type="text" onChange={e => setTypeData({...typeData, pass: e.target.value})} /></div>
                                            </>
                                        )}
                                        {selectedType === 'vcard' && (
                                            <>
                                                <div className="field"><label>Nom Complet</label><input type="text" onChange={e => setTypeData({...typeData, fn: e.target.value})} /></div>
                                                <div className="field"><label>Téléphone</label><input type="text" onChange={e => setTypeData({...typeData, tel: e.target.value})} /></div>
                                            </>
                                        )}
                                        {/* Add other types as needed, same pattern */}
                                        <div style={{ padding: '20px', background: '#F8FAFC', borderRadius: '8px', fontSize: '14px', color: '#64748B' }}>
                                            Remplissez les informations qui seront encodées dans le code QR.
                                        </div>
                                    </div>
                                )}
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(1)}>Retour</button>
                                    <button className="btn-primary" onClick={() => setStep(3)}>Suivant</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>4. Personnalisation</h2>
                                <div className="field">
                                    <label>Couleur principale</label>
                                    <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value, cornersColor: e.target.value})} />
                                </div>
                                <div className="field">
                                    <label>Style des points</label>
                                    <select value={qrAppearance.dotsType} onChange={e => setQrAppearance({...qrAppearance, dotsType: e.target.value})}>
                                        {DOT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                                    </select>
                                </div>
                                <div className="field">
                                    <label>Logo central</label>
                                    <input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setQrAppearance({...qrAppearance, logo_url: url}), setUploadingLogo)} />
                                </div>
                                <div style={{ marginTop: '32px', display: 'flex', gap: '12px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(2)}>Retour</button>
                                    <button className="btn-primary" onClick={finalizeCreate} disabled={generating}>{generating ? 'Enregistrement...' : 'Finaliser'}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Preview Sidebar */}
                    <div style={{ background: 'white', padding: '32px', borderRadius: '12px', border: '1px solid #E2E8F0', height: 'fit-content', position: 'sticky', top: '100px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', marginBottom: '20px', textTransform: 'uppercase' }}>Aperçu en direct</h3>
                        <div ref={qrRef} style={{ display: 'flex', justifyContent: 'center', background: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                            {step < 2 && <div style={{ width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', textAlign: 'center' }}>Le QR s'affichera à l'étape 3</div>}
                        </div>
                        <div style={{ marginTop: '24px' }}>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>Type: <span style={{ fontWeight: '700', color: '#1A1265' }}>{selectedType}</span></div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>Client: <span style={{ fontWeight: '700', color: '#1A1265' }}>{clientInfo.clientName || '-'}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}