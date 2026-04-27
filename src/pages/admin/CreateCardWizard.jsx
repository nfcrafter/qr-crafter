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
    { id: 'url', icon: '🔗', label: 'URL / Profil', description: 'Lien vers un profil ou site' },
    { id: 'vcard', icon: '👤', label: 'VCard', description: 'Coordonnées de contact' },
    { id: 'text', icon: '📝', label: 'Texte', description: 'Message ou note simple' },
    { id: 'wifi', icon: '📶', label: 'WiFi', description: 'Partage de connexion' },
    { id: 'email', icon: '📧', label: 'Email', description: 'Envoi de mail pré-rempli' },
    { id: 'sms', icon: '💬', label: 'SMS', description: 'Envoi de SMS pré-rempli' },
    { id: 'phone', icon: '📞', label: 'Téléphone', description: 'Appel direct' },
    { id: 'geo', icon: '📍', label: 'Localisation', description: 'Coordonnées GPS' },
    { id: 'event', icon: '📅', label: 'Événement', description: 'Calendrier iCal' },
    { id: 'crypto', icon: '₿', label: 'Crypto', description: 'Adresse de wallet' },
    { id: 'instagram', icon: '📸', label: 'Instagram', description: 'Profil ou lien post' },
    { id: 'facebook', icon: '👥', label: 'Facebook', description: 'Page ou profil' },
    { id: 'pdf', icon: '📄', label: 'PDF', description: 'Document téléchargeable' },
    { id: 'music', icon: '🎵', label: 'Musique', description: 'Lien audio ou playlist' },
    { id: 'video', icon: '🎞️', label: 'Vidéo', description: 'Lien YouTube ou autre' },
    { id: 'image', icon: '🖼️', label: 'Image', description: 'Galerie ou image seule' }
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
            case 'url': return typeData.url || profileUrl;
            case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${typeData.fn || ''}\nTEL:${typeData.tel || ''}\nEMAIL:${typeData.email || ''}\nORG:${typeData.org || ''}\nEND:VCARD`;
            case 'text': return typeData.text || '';
            case 'wifi': return `WIFI:T:${typeData.encryption || 'WPA'};S:${typeData.ssid || ''};P:${typeData.pass || ''};;`;
            case 'email': return `mailto:${typeData.to || ''}?subject=${encodeURIComponent(typeData.sub || '')}&body=${encodeURIComponent(typeData.body || '')}`;
            case 'sms': return `SMSTO:${typeData.num || ''}:${typeData.msg || ''}`;
            case 'phone': return `tel:${typeData.num || ''}`;
            case 'geo': return `geo:${typeData.lat || ''},${typeData.lng || ''}`;
            case 'event': return `BEGIN:VEVENT\nSUMMARY:${typeData.summary || ''}\nDTSTART:${typeData.start?.replace(/[-:]/g, '') || ''}\nDTEND:${typeData.end?.replace(/[-:]/g, '') || ''}\nLOCATION:${typeData.location || ''}\nEND:VEVENT`;
            case 'crypto': return `${typeData.coin || 'bitcoin'}:${typeData.addr || ''}`;
            default: return typeData.url || profileUrl;
        }
    }

    function initQRCode(data) {
        const options = {
            width: 280, height: 280, type: 'svg', data: data,
            dotsOptions: { 
                color: qrAppearance.dotsColor, 
                type: qrAppearance.dotsType,
                gradient: qrAppearance.useGradient ? {
                    type: 'linear', rotation: 45,
                    colorStops: [{ offset: 0, color: qrAppearance.dotsColor }, { offset: 1, color: qrAppearance.gradientColor }]
                } : null
            },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
            image: qrAppearance.logo_url || '',
            imageOptions: { crossOrigin: 'anonymous', margin: 10 }
        };
        qrCode.current = new QRCodeStyling(options);
        if (qrRef.current) { qrRef.current.innerHTML = ''; qrCode.current.append(qrRef.current); }
    }

    function updateQRCode(data) {
        if (!qrCode.current) return;
        qrCode.current.update({
            data: data,
            dotsOptions: { 
                color: qrAppearance.dotsColor, 
                type: qrAppearance.dotsType,
                gradient: qrAppearance.useGradient ? {
                    type: 'linear', rotation: 45,
                    colorStops: [{ offset: 0, color: qrAppearance.dotsColor }, { offset: 1, color: qrAppearance.gradientColor }]
                } : null
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
            toast('Succès : Image chargée', 'success');
        } catch (err) { toast("Erreur lors de l'upload. Vérifiez que le bucket est public.", 'error'); } 
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

            const token = Math.random().toString(36).substring(2, 10).toUpperCase();
            const { error } = await supabase.from('cards').insert({
                card_id: generatedCardId,
                card_name: clientInfo.clientName,
                status: 'pending',
                activation_token: token,
                city: clientInfo.city,
                country: clientInfo.country,
                folder_id: folderId,
                admin_profile: { ...publicProfile, qr_type: selectedType },
                qr_appearance: qrAppearance,
                type_data: { ...typeData, qr_type: selectedType }
            });
            if (error) throw error;
            toast('Félicitations ! Code QR créé.', 'success');
            navigate('/admin');
        } catch (err) { toast('Erreur : ' + err.message, 'error'); } 
        finally { setGenerating(false); }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                <header style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
                    <div onClick={() => navigate('/admin')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '42px' }} />
                        <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1A1265', margin: 0 }}>QR CRAFTER <span style={{ fontWeight: '400', color: '#94A3B8' }}>| STUDIO</span></h1>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 450px', gap: '40px' }}>
                    <div style={{ background: 'white', padding: '40px', borderRadius: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', border: '1px solid #E2E8F0' }}>
                        {step === 0 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Sélectionnez le type de QR</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
                                    {QR_TYPES.map(type => (
                                        <div key={type.id} onClick={() => { setSelectedType(type.id); setStep(1); }} style={{ padding: '32px 20px', border: '2px solid #F1F5F9', borderRadius: '24px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', background: selectedType === type.id ? '#EEF2FF' : 'white' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-8px)'; e.currentTarget.style.borderColor = '#1A1265'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(26, 18, 101, 0.1)'; }}>
                                            <div style={{ fontSize: '42px', marginBottom: '16px' }}>{type.icon}</div>
                                            <div style={{ fontWeight: '800', color: '#1A1265', fontSize: '15px' }}>{type.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Informations Client</h2>
                                <div className="field"><label>Nom ou Entreprise</label><input type="text" value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} placeholder="Ex: Jean Dupont" /></div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="field"><label>Ville</label><input type="text" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} placeholder="Cotonou" /></div>
                                    <div className="field"><label>Pays</label><input type="text" value={clientInfo.country} onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })} /></div>
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(0)}>Retour</button>
                                    <button className="btn-primary" style={{ flex: 2, background: '#1A1265', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }} onClick={() => setStep(2)}>Suivant</button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Données du QR : {selectedType.toUpperCase()}</h2>
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
                                                <div className="field"><label>Nom du Réseau</label><input type="text" value={typeData.ssid || ''} onChange={e => setTypeData({...typeData, ssid: e.target.value})} /></div>
                                                <div className="field"><label>Mot de passe</label><input type="text" value={typeData.pass || ''} onChange={e => setTypeData({...typeData, pass: e.target.value})} /></div>
                                                <div className="field"><label>Sécurité</label><select value={typeData.encryption || 'WPA'} onChange={e => setTypeData({...typeData, encryption: e.target.value})}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">Aucun</option></select></div>
                                            </>
                                        )}
                                        {selectedType === 'vcard' && (
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="field" style={{ gridColumn: 'span 2' }}><label>Nom Complet</label><input type="text" value={typeData.fn || ''} onChange={e => setTypeData({...typeData, fn: e.target.value})} /></div>
                                                <div className="field"><label>Tel</label><input type="text" value={typeData.tel || ''} onChange={e => setTypeData({...typeData, tel: e.target.value})} /></div>
                                                <div className="field"><label>Email</label><input type="text" value={typeData.email || ''} onChange={e => setTypeData({...typeData, email: e.target.value})} /></div>
                                            </div>
                                        )}
                                        {selectedType === 'sms' && (
                                            <>
                                                <div className="field"><label>Numéro</label><input type="text" value={typeData.num || ''} onChange={e => setTypeData({...typeData, num: e.target.value})} /></div>
                                                <div className="field"><label>Message</label><textarea value={typeData.msg || ''} onChange={e => setTypeData({...typeData, msg: e.target.value})} /></div>
                                            </>
                                        )}
                                        {selectedType === 'event' && (
                                            <>
                                                <div className="field"><label>Titre</label><input type="text" value={typeData.summary || ''} onChange={e => setTypeData({...typeData, summary: e.target.value})} /></div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div className="field"><label>Début</label><input type="datetime-local" onChange={e => setTypeData({...typeData, start: e.target.value})} /></div>
                                                    <div className="field"><label>Fin</label><input type="datetime-local" onChange={e => setTypeData({...typeData, end: e.target.value})} /></div>
                                                </div>
                                            </>
                                        )}
                                        {['pdf', 'music', 'video', 'image'].includes(selectedType) && (
                                            <div className="field">
                                                <label>Uploader le fichier {uploadingMedia && '⌛'}</label>
                                                <input type="file" onChange={e => uploadFile(e.target.files[0], 'media', (url) => setTypeData({...typeData, url: url}), setUploadingMedia)} />
                                                {typeData.url && <p style={{ fontSize: '12px', color: '#10B981', marginTop: '8px' }}>✓ Fichier prêt : {typeData.url.split('/').pop()}</p>}
                                            </div>
                                        )}
                                        {!['url', 'wifi', 'vcard', 'sms', 'event', 'pdf', 'music', 'video', 'image'].includes(selectedType) && (
                                            <div className="field"><label>URL ou Donnée</label><input type="text" value={typeData.url || ''} onChange={e => setTypeData({...typeData, url: e.target.value})} placeholder="https://..." /></div>
                                        )}
                                    </div>
                                )}
                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(1)}>Retour</button>
                                    <button className="btn-primary" style={{ flex: 2, background: '#1A1265', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }} onClick={() => setStep(3)}>Personnalisation →</button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="animate-fade-in">
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '900', color: '#1A1265' }}>Design & Esthétique</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div className="field"><label>Couleur Points</label><input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} style={{ height: '54px' }} /></div>
                                    <div className="field"><label>Forme Points</label><select value={qrAppearance.dotsType} onChange={e => setQrAppearance({...qrAppearance, dotsType: e.target.value})}>{DOT_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                                    <div className="field" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <input type="checkbox" checked={qrAppearance.useGradient} onChange={e => setQrAppearance({...qrAppearance, useGradient: e.target.checked})} />
                                            Activer Dégradé (Gradient)
                                        </label>
                                        {qrAppearance.useGradient && <input type="color" value={qrAppearance.gradientColor} onChange={e => setQrAppearance({...qrAppearance, gradientColor: e.target.value})} style={{ marginTop: '12px', height: '54px' }} />}
                                    </div>
                                    <div className="field"><label>Coins (Square)</label><select value={qrAppearance.cornersType} onChange={e => setQrAppearance({...qrAppearance, cornersType: e.target.value})}>{CORNER_STYLES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
                                    <div className="field"><label>Logo central {uploadingLogo && '⏳'}</label><input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setQrAppearance({...qrAppearance, logo_url: url}), setUploadingLogo)} /></div>
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', gap: '16px' }}>
                                    <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setStep(2)}>Retour</button>
                                    <button className="btn-primary" style={{ flex: 2, background: '#1A1265', color: 'white', border: 'none', padding: '18px', borderRadius: '16px', fontWeight: '800', cursor: 'pointer' }} onClick={finalizeCreate} disabled={generating}>{generating ? 'Création...' : 'Finaliser le QR'}</button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ position: 'sticky', top: '40px' }}>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '40px', border: '1px solid #E2E8F0', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.05)' }}>
                            <div ref={qrRef} style={{ background: 'white', padding: '24px', borderRadius: '32px', display: 'inline-block', border: '1px solid #F1F5F9' }}>
                                {step < 2 && <div style={{ width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1', border: '3px dashed #F1F5F9', borderRadius: '32px', fontSize: '14px' }}>Configurez le contenu pour l'aperçu</div>}
                            </div>
                            <div style={{ marginTop: '32px', textAlign: 'left', background: '#F8FAFC', padding: '32px', borderRadius: '24px', border: '1px solid #F1F5F9' }}>
                                <div style={{ fontSize: '10px', color: '#94A3B8', fontWeight: '900', letterSpacing: '2px', marginBottom: '8px' }}>RÉSUMÉ DU PROJET</div>
                                <div style={{ fontSize: '22px', fontWeight: '900', color: '#1A1265', marginBottom: '12px' }}>{QR_TYPES.find(t => t.id === selectedType)?.label}</div>
                                <div style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                                    Ce code QR sera automatiquement classé dans le dossier <strong>{QR_TYPES.find(t => t.id === selectedType)?.label}</strong>. Vous pourrez le personnaliser davantage après sa création.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}