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

    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        loadFolders();
        generateUniqueCardId().then(id => setGeneratedCardId(id));
    }, []);

    useEffect(() => {
        if (step === 3 && qrRef.current && generatedCardId) {
            const data = formatQRData();
            if (!qrCode.current) {
                initQRCode(data);
            } else {
                updateQRCode(data);
            }
        }
    }, [step, qrAppearance, generatedCardId, typeData, publicProfile]);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function formatQRData() {
        const profileUrl = `${window.location.origin}/u/${generatedCardId}`;
        
        switch (selectedType) {
            case 'url': return typeData.url || profileUrl;
            case 'vcard': 
                return `BEGIN:VCARD\nVERSION:3.0\nFN:${typeData.fn || ''}\nTEL:${typeData.tel || ''}\nEMAIL:${typeData.email || ''}\nEND:VCARD`;
            case 'text': return typeData.text || '';
            case 'wifi': 
                return `WIFI:T:${typeData.encryption || 'WPA'};S:${typeData.ssid || ''};P:${typeData.pass || ''};;`;
            case 'email': 
                return `mailto:${typeData.to || ''}?subject=${encodeURIComponent(typeData.sub || '')}&body=${encodeURIComponent(typeData.body || '')}`;
            case 'sms': 
                return `SMSTO:${typeData.num || ''}:${typeData.msg || ''}`;
            case 'phone': return `tel:${typeData.num || ''}`;
            default: return profileUrl;
        }
    }

    function initQRCode(data) {
        qrCode.current = new QRCodeStyling({
            width: 300,
            height: 300,
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
            toast("Erreur d'upload. Vérifiez que le bucket '" + bucket + "' est PUBLIC dans Supabase.", 'error');
        } finally {
            loadingSetter(false);
        }
    }

    async function finalizeCreate() {
        setGenerating(true);
        try {
            // Auto-folder logic
            let folderId = selectedFolder;
            if (!folderId) {
                const typeLabel = QR_TYPES.find(t => t.id === selectedType)?.label || selectedType.toUpperCase();
                // Check if folder exists
                const { data: existingFolders } = await supabase.from('folders').select('id').eq('name', typeLabel).limit(1);
                
                if (existingFolders && existingFolders.length > 0) {
                    folderId = existingFolders[0].id;
                } else {
                    // Create new folder for this type
                    const { data: newFolder, error: folderError } = await supabase.from('folders').insert({
                        name: typeLabel,
                        color: qrAppearance.dotsColor
                    }).select().single();
                    if (!folderError) folderId = newFolder.id;
                }
            }

            const token = Math.random().toString(36).substring(2, 10).toUpperCase();
            const { error } = await supabase.from('cards').insert({
                card_id: generatedCardId,
                card_name: clientInfo.clientName,
                status: 'pending',
                activation_token: token,
                city: clientInfo.city,
                country: clientInfo.country,
                folder_id: folderId || null,
                admin_profile: { ...publicProfile, qr_type: selectedType }, // Store type in admin_profile to avoid schema error
                qr_appearance: qrAppearance,
                type_data: { ...typeData, qr_type: selectedType } // Also in type_data for safety
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
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', animation: 'slideDown 0.5s ease-out' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ padding: '8px', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            ←
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '40px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                            <div>
                                <h1 style={{ fontSize: '24px', margin: 0, fontWeight: '800', letterSpacing: '-0.5px' }}>Créer un Code QR</h1>
                                <p style={{ fontSize: '13px', color: 'var(--text-500)', margin: 0 }}>L'excellence digitale par QR Crafter</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.5)', padding: '8px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                        {[0, 1, 2, 3].map(s => (
                            <div key={s} style={{ 
                                width: '40px', 
                                height: '6px', 
                                borderRadius: '3px', 
                                background: step >= s ? 'var(--primary)' : '#CBD5E1',
                                transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }} />
                        ))}
                    </div>
                </div>

                {/* Content Layout */}
                <div style={{ 
                    display: 'flex', 
                    gap: '40px', 
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    
                    {/* Main Content (Flexible) */}
                    <div className="premium-card" key={step} style={{ 
                        flex: '1 1 600px', 
                        minHeight: '600px', 
                        animation: 'fadeInUp 0.6s ease-out',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
                        border: '1px solid rgba(255,255,255,0.8)'
                    }}>
                        {step === 0 && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: '800' }}>Type de Code QR</h2>
                                    <p style={{ color: 'var(--text-500)', fontSize: '16px' }}>Choisissez le format idéal pour votre projet.</p>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', 
                                    gap: '16px' 
                                }}>
                                    {QR_TYPES.map(type => (
                                        <div 
                                            key={type.id}
                                            onClick={() => { setSelectedType(type.id); setStep(1); }}
                                            className="type-card"
                                            style={{ 
                                                padding: '24px 16px', 
                                                border: selectedType === type.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                borderRadius: '20px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                background: selectedType === type.id ? 'var(--primary-light)' : 'white',
                                                boxShadow: selectedType === type.id ? '0 10px 20px -5px rgba(26, 18, 101, 0.2)' : 'none'
                                            }}
                                        >
                                            <div style={{ fontSize: '36px', marginBottom: '12px', transition: 'transform 0.3s' }}>{type.icon}</div>
                                            <div style={{ fontWeight: '800', fontSize: '15px', color: 'var(--text-900)' }}>{type.label}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-500)', marginTop: '6px', lineHeight: '1.4' }}>{type.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ fontSize: '56px', marginBottom: '16px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>🏢</div>
                                    <h2 style={{ fontSize: '32px', marginBottom: '12px', fontWeight: '800' }}>Client & Organisation</h2>
                                    <p style={{ color: 'var(--text-500)' }}>Identifiez le porteur de ce code QR.</p>
                                </div>

                                <div className="field">
                                    <label>Nom du client / Entreprise</label>
                                    <input type="text" placeholder="Ex: Jean Dupont" value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} />
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
                                    <label>Dossier (Optionnel)</label>
                                    <p style={{ fontSize: '12px', color: 'var(--text-400)', marginBottom: '8px' }}>Sera automatiquement rangé dans "{QR_TYPES.find(t => t.id === selectedType)?.label}" si vide.</p>
                                    <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                                        <option value="">Auto-classement par type</option>
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn-ghost" onClick={() => setStep(0)}>Retour</button>
                                    <button className="btn-primary" onClick={() => setStep(2)} disabled={!clientInfo.clientName} style={{ padding: '16px 40px' }}>
                                        Configurer le contenu →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <div>
                                        <h2 style={{ margin: 0, fontWeight: '800' }}>Contenu du QR</h2>
                                        <p style={{ color: 'var(--text-500)', fontSize: '14px' }}>Type sélectionné : {QR_TYPES.find(t => t.id === selectedType)?.label}</p>
                                    </div>
                                    <span style={{ fontSize: '13px', background: 'var(--primary)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontWeight: '700' }}>Étape 2/3</span>
                                </div>
                                
                                {selectedType === 'url' ? (
                                    <ProfileForm
                                        form={publicProfile}
                                        onChange={setPublicProfile}
                                        onUploadAvatar={(f) => uploadFile(f, 'avatars', (url) => setPublicProfile(p => ({...p, photo_url: url})), setUploadingAvatar)}
                                        onUploadBanner={(f) => uploadFile(f, 'banners', (url) => setPublicProfile(p => ({...p, banner_url: url})), setUploadingBanner)}
                                        uploadingAvatar={uploadingAvatar}
                                        uploadingBanner={uploadingBanner}
                                    />
                                ) : (
                                    <div style={{ maxWidth: '700px', margin: '0 auto', animation: 'fadeIn 0.5s' }}>
                                        {selectedType === 'wifi' && (
                                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                                    <label>Nom du Réseau (SSID)</label>
                                                    <input type="text" value={typeData.ssid || ''} onChange={e => setTypeData({...typeData, ssid: e.target.value})} placeholder="MaBox_WiFi" />
                                                </div>
                                                <div className="field">
                                                    <label>Mot de passe</label>
                                                    <input type="text" value={typeData.pass || ''} onChange={e => setTypeData({...typeData, pass: e.target.value})} placeholder="••••••••" />
                                                </div>
                                                <div className="field">
                                                    <label>Cryptage</label>
                                                    <select value={typeData.encryption || 'WPA'} onChange={e => setTypeData({...typeData, encryption: e.target.value})}>
                                                        <option value="WPA">WPA/WPA2</option>
                                                        <option value="WEP">WEP</option>
                                                        <option value="nopass">Aucun</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {(selectedType === 'phone' || selectedType === 'sms') && (
                                            <div className="field">
                                                <label>Numéro de téléphone</label>
                                                <input type="tel" value={typeData.num || ''} onChange={e => setTypeData({...typeData, num: e.target.value})} placeholder="+229 00 00 00 00" />
                                                {selectedType === 'sms' && (
                                                    <div className="field" style={{ marginTop: '20px' }}>
                                                        <label>Message pré-rempli</label>
                                                        <textarea rows="3" value={typeData.msg || ''} onChange={e => setTypeData({...typeData, msg: e.target.value})} placeholder="Bonjour, je vous contacte suite à..." />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {selectedType === 'email' && (
                                            <div className="form-grid">
                                                <div className="field">
                                                    <label>Destinataire</label>
                                                    <input type="email" value={typeData.to || ''} onChange={e => setTypeData({...typeData, to: e.target.value})} placeholder="contact@exemple.com" />
                                                </div>
                                                <div className="field">
                                                    <label>Sujet</label>
                                                    <input type="text" value={typeData.sub || ''} onChange={e => setTypeData({...typeData, sub: e.target.value})} placeholder="Demande d'informations" />
                                                </div>
                                                <div className="field">
                                                    <label>Message</label>
                                                    <textarea rows="4" value={typeData.body || ''} onChange={e => setTypeData({...typeData, body: e.target.value})} placeholder="Votre message ici..." />
                                                </div>
                                            </div>
                                        )}

                                        {selectedType === 'vcard' && (
                                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                                    <label>Nom Complet</label>
                                                    <input type="text" value={typeData.fn || ''} onChange={e => setTypeData({...typeData, fn: e.target.value})} />
                                                </div>
                                                <div className="field">
                                                    <label>Téléphone</label>
                                                    <input type="text" value={typeData.tel || ''} onChange={e => setTypeData({...typeData, tel: e.target.value})} />
                                                </div>
                                                <div className="field">
                                                    <label>Email</label>
                                                    <input type="email" value={typeData.email || ''} onChange={e => setTypeData({...typeData, email: e.target.value})} />
                                                </div>
                                                <div className="field" style={{ gridColumn: 'span 2' }}>
                                                    <label>Entreprise / Titre</label>
                                                    <input type="text" value={typeData.org || ''} onChange={e => setTypeData({...typeData, org: e.target.value})} />
                                                </div>
                                            </div>
                                        )}

                                        {(selectedType === 'instagram' || selectedType === 'facebook' || selectedType === 'video' || selectedType === 'music' || selectedType === 'pdf') && (
                                            <div className="field">
                                                <label>Lien (URL)</label>
                                                <input type="url" value={typeData.url || ''} onChange={e => setTypeData({...typeData, url: e.target.value})} placeholder="https://..." />
                                                <p style={{ fontSize: '12px', color: 'var(--text-400)', marginTop: '8px' }}>Collez ici le lien direct vers votre {selectedType}.</p>
                                            </div>
                                        )}

                                        {selectedType === 'text' && (
                                            <div className="field">
                                                <label>Votre texte / Note</label>
                                                <textarea rows="8" value={typeData.text || ''} onChange={e => setTypeData({...typeData, text: e.target.value})} placeholder="Écrivez ce que vous voulez coder dans le QR..." />
                                            </div>
                                        )}

                                        {selectedType === 'geo' && (
                                            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                <div className="field">
                                                    <label>Latitude</label>
                                                    <input type="text" value={typeData.lat || ''} onChange={e => setTypeData({...typeData, lat: e.target.value})} placeholder="6.3703" />
                                                </div>
                                                <div className="field">
                                                    <label>Longitude</label>
                                                    <input type="text" value={typeData.lng || ''} onChange={e => setTypeData({...typeData, lng: e.target.value})} placeholder="2.3912" />
                                                </div>
                                            </div>
                                        )}

                                        {selectedType === 'event' && (
                                            <div className="form-grid">
                                                <div className="field">
                                                    <label>Nom de l'événement</label>
                                                    <input type="text" value={typeData.title || ''} onChange={e => setTypeData({...typeData, title: e.target.value})} />
                                                </div>
                                                <div className="field">
                                                    <label>Lieu</label>
                                                    <input type="text" value={typeData.loc || ''} onChange={e => setTypeData({...typeData, loc: e.target.value})} />
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                                    <div className="field">
                                                        <label>Début</label>
                                                        <input type="datetime-local" value={typeData.start || ''} onChange={e => setTypeData({...typeData, start: e.target.value})} />
                                                    </div>
                                                    <div className="field">
                                                        <label>Fin</label>
                                                        <input type="datetime-local" value={typeData.end || ''} onChange={e => setTypeData({...typeData, end: e.target.value})} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {selectedType === 'crypto' && (
                                            <div className="form-grid">
                                                <div className="field">
                                                    <label>Adresse du Wallet</label>
                                                    <input type="text" value={typeData.addr || ''} onChange={e => setTypeData({...typeData, addr: e.target.value})} placeholder="0x..." />
                                                </div>
                                                <div className="field">
                                                    <label>Type de Monnaie</label>
                                                    <select value={typeData.coin || 'BTC'} onChange={e => setTypeData({...typeData, coin: e.target.value})}>
                                                        <option value="BTC">Bitcoin (BTC)</option>
                                                        <option value="ETH">Ethereum (ETH)</option>
                                                        <option value="USDT">Tether (USDT)</option>
                                                        <option value="BNB">Binance Coin (BNB)</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {selectedType === 'image' && (
                                            <div className="field">
                                                <label>Lien de l'image {uploadingLogo && '⌛'}</label>
                                                <input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setTypeData({ ...typeData, url: url }), setUploadingLogo)} />
                                                {typeData.url && <img src={typeData.url} alt="Aperçu" style={{ marginTop: '12px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '12px' }} />}
                                            </div>
                                        )}

                                        <div style={{ marginTop: '30px', padding: '20px', background: 'var(--primary-light)', borderRadius: '16px', border: '1px dashed var(--primary)' }}>
                                            <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600', textAlign: 'center', margin: 0 }}>
                                                💡 Astuce : Les données sont encodées directement dans le QR en temps réel.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(1)}>Précédent</button>
                                    <button className="btn-primary" onClick={() => setStep(3)} style={{ padding: '16px 40px' }}>
                                        Personnaliser le Design →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ margin: 0, fontWeight: '800' }}>Design du QR Code</h2>
                                    <span style={{ fontSize: '13px', background: 'var(--accent)', color: 'var(--primary)', padding: '6px 16px', borderRadius: '20px', fontWeight: '800' }}>Étape 3/3</span>
                                </div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                    <div>
                                        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>Motif & Couleurs</h3>
                                        <div className="field">
                                            <label>Style des points</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {DOT_STYLES.map(s => (
                                                    <button 
                                                        key={s.id}
                                                        onClick={() => setQrAppearance({...qrAppearance, dotsType: s.id})}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            borderRadius: '10px', 
                                                            border: '1px solid var(--border)',
                                                            background: qrAppearance.dotsType === s.id ? 'var(--primary)' : 'white',
                                                            color: qrAppearance.dotsType === s.id ? 'white' : 'var(--text-700)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
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
                                                <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value, cornersColor: e.target.value, cornersDotColor: e.target.value})} style={{ width: '50px', height: '50px', border: 'none', padding: 0, borderRadius: '12px', cursor: 'pointer' }} />
                                                <input type="text" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value, cornersColor: e.target.value, cornersDotColor: e.target.value})} style={{ flex: 1, fontFamily: 'monospace', fontWeight: 'bold' }} />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 style={{ fontSize: '18px', marginBottom: '16px', fontWeight: '700' }}>Coins & Logo</h3>
                                        <div className="field">
                                            <label>Style des coins</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {CORNER_STYLES.map(s => (
                                                    <button 
                                                        key={s.id}
                                                        onClick={() => setQrAppearance({...qrAppearance, cornersType: s.id})}
                                                        style={{ 
                                                            padding: '8px 16px', 
                                                            borderRadius: '10px', 
                                                            border: '1px solid var(--border)',
                                                            background: qrAppearance.cornersType === s.id ? 'var(--primary)' : 'white',
                                                            color: qrAppearance.cornersType === s.id ? 'white' : 'var(--text-700)',
                                                            cursor: 'pointer',
                                                            fontSize: '13px',
                                                            fontWeight: '600',
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
                                            <div style={{ position: 'relative' }}>
                                                <input type="file" onChange={e => uploadFile(e.target.files[0], 'qr-logos', (url) => setQrAppearance(prev => ({ ...prev, logo_url: url })), setUploadingLogo)} style={{ padding: '40px 20px', border: '2px dashed var(--border)', borderRadius: '16px', cursor: 'pointer', textAlign: 'center' }} />
                                                {qrAppearance.logo_url && <img src={qrAppearance.logo_url} style={{ width: '40px', position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', borderRadius: '4px' }} />}
                                            </div>
                                            <p style={{ fontSize: '11px', color: 'var(--text-500)', marginTop: '8px' }}>Format recommandé : PNG ou SVG carré (512x512).</p>
                                        </div>
                                    </div>
                                </div>
 
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                                    <button className="btn-ghost" onClick={() => setStep(2)}>Précédent</button>
                                    <button className="btn-primary" onClick={finalizeCreate} disabled={generating} style={{ padding: '16px 60px', borderRadius: '40px', boxShadow: '0 10px 30px rgba(26, 18, 101, 0.2)' }}>
                                        {generating ? 'Finalisation...' : 'Terminer ✓'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
 
                    {/* Preview Area (Fixed) */}
                    <div style={{ flex: '0 0 400px', position: 'sticky', top: '40px', height: 'fit-content', animation: 'fadeInRight 0.8s ease-out' }}>
                        {step === 2 && selectedType === 'url' ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '16px', fontWeight: '800', color: 'var(--primary)', fontSize: '12px', letterSpacing: '2px' }}>VUE CLIENT MOBILE</p>
                                <PhonePreview>
                                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                                        <PublicProfile previewData={publicProfile} />
                                    </div>
                                </PhonePreview>
                            </div>
                        ) : step >= 2 ? (
                            <div className="premium-card" style={{ textAlign: 'center', background: 'white', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginBottom: '24px', fontWeight: '800' }}>Live QR Preview</h3>
                                <div ref={qrRef} style={{ background: 'white', padding: '24px', borderRadius: '32px', display: 'inline-block', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9' }}></div>
                                <div style={{ marginTop: '32px', textAlign: 'left', padding: '20px', background: 'linear-gradient(135deg, var(--primary) 0%, #4338CA 100%)', borderRadius: '24px', color: 'white' }}>
                                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Encodage</p>
                                    <p style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>{QR_TYPES.find(t => t.id === selectedType)?.label}</p>
                                    <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.9, lineHeight: '1.5' }}>
                                        Votre code QR est généré dynamiquement. Toutes les modifications de design sont visibles instantanément.
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-card" style={{ background: 'var(--primary)', color: 'white', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
                                <h3 style={{ color: 'white', marginBottom: '16px', fontSize: '24px', fontWeight: '800' }}>{QR_TYPES.find(t => t.id === selectedType)?.label}</h3>
                                <p style={{ fontSize: '15px', opacity: 0.9, lineHeight: '1.7' }}>
                                    Vous configurez actuellement un service <strong style={{ color: 'var(--accent)' }}>{selectedType.toUpperCase()}</strong>. 
                                    Suivez les étapes pour un résultat professionnel.
                                </p>
                                <div style={{ marginTop: '32px', background: 'rgba(0,0,0,0.2)', padding: '24px', borderRadius: '20px' }}>
                                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' }}>Progression</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <div style={{ width: `${(step / 3) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                                        </div>
                                        <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent)' }}>{Math.round((step / 3) * 100)}%</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}