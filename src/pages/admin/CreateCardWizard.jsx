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
                qr_type: selectedType,
                type_data: typeData
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
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <div style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ padding: '8px' }}>
                            ←
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
                            <div>
                                <h1 style={{ fontSize: '24px', margin: 0 }}>Créer un Code QR</h1>
                                <p style={{ fontSize: '13px', color: 'var(--text-500)', margin: 0 }}>Générateur multi-types premium</p>
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {[0, 1, 2, 3].map(s => (
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

                {/* Content Layout */}
                <div style={{ 
                    display: 'flex', 
                    gap: '40px', 
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    
                    {/* Main Content (Flexible) */}
                    <div className="premium-card animate-fade-in" key={step} style={{ flex: '1 1 600px', minHeight: '600px' }}>
                        {step === 0 && (
                            <div>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Choisissez le type de Code QR</h2>
                                    <p style={{ color: 'var(--text-500)' }}>Sélectionnez le format qui correspond à votre besoin.</p>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
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
                                                borderRadius: '16px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: selectedType === type.id ? 'var(--primary-light)' : 'white'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{type.icon}</div>
                                            <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-900)' }}>{type.label}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-500)', marginTop: '4px' }}>{type.description}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>🏢</div>
                                    <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>Informations du Client</h2>
                                    <p style={{ color: 'var(--text-500)' }}>Détails administratifs pour la gestion.</p>
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
                                    <label>Dossier de rangement</label>
                                    <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                                        <option value="">Racine (aucun dossier)</option>
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                    <button className="btn-ghost" onClick={() => setStep(0)}>Retour</button>
                                    <button className="btn-primary" onClick={() => setStep(2)} disabled={!clientInfo.clientName}>
                                        Continuer →
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                    <h2 style={{ margin: 0 }}>Contenu du QR ({selectedType.toUpperCase()})</h2>
                                    <span style={{ fontSize: '13px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '4px 12px', borderRadius: '20px', fontWeight: '600' }}>Étape 2/3</span>
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
                                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                                        {selectedType === 'wifi' && (
                                            <>
                                                <div className="field">
                                                    <label>Nom du Réseau (SSID)</label>
                                                    <input type="text" value={typeData.ssid || ''} onChange={e => setTypeData({...typeData, ssid: e.target.value})} />
                                                </div>
                                                <div className="field">
                                                    <label>Mot de passe</label>
                                                    <input type="text" value={typeData.pass || ''} onChange={e => setTypeData({...typeData, pass: e.target.value})} />
                                                </div>
                                                <div className="field">
                                                    <label>Cryptage</label>
                                                    <select value={typeData.encryption || 'WPA'} onChange={e => setTypeData({...typeData, encryption: e.target.value})}>
                                                        <option value="WPA">WPA/WPA2</option>
                                                        <option value="WEP">WEP</option>
                                                        <option value="nopass">Aucun</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        {selectedType === 'vcard' && (
                                            <>
                                                <div className="field">
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
                                            </>
                                        )}
                                        {selectedType === 'text' && (
                                            <div className="field">
                                                <label>Votre texte</label>
                                                <textarea rows="5" value={typeData.text || ''} onChange={e => setTypeData({...typeData, text: e.target.value})} />
                                            </div>
                                        )}
                                        {/* Add other types as needed... */}
                                        <p style={{ padding: '20px', background: '#F8FAFC', borderRadius: '12px', fontSize: '13px', color: 'var(--text-500)', textAlign: 'center' }}>
                                            Remplissez les champs ci-dessus pour générer votre code QR {selectedType.toUpperCase()}.
                                        </p>
                                    </div>
                                )}

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
                                
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
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
                                            <p style={{ fontSize: '11px', color: 'var(--text-500)', marginTop: '4px' }}>Utilisez un logo carré.</p>
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

                    {/* Preview Area (Fixed) */}
                    <div style={{ flex: '0 0 400px', position: 'sticky', top: '40px', height: 'fit-content' }}>
                        {step === 2 && selectedType === 'url' ? (
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ marginBottom: '12px', fontWeight: '700', color: 'var(--text-400)', fontSize: '12px', letterSpacing: '1px' }}>APERÇU MOBILE</p>
                                <PhonePreview>
                                    <div style={{ transform: 'scale(0.8)', transformOrigin: 'top center' }}>
                                        <PublicProfile previewData={publicProfile} />
                                    </div>
                                </PhonePreview>
                            </div>
                        ) : step >= 2 ? (
                            <div className="premium-card" style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '24px' }}>Aperçu du QR</h3>
                                <div ref={qrRef} style={{ background: 'white', padding: '20px', borderRadius: '24px', display: 'inline-block', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}></div>
                                <div style={{ marginTop: '24px', textAlign: 'left', padding: '16px', background: 'var(--primary-light)', borderRadius: '12px' }}>
                                    <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>Type : {selectedType.toUpperCase()}</p>
                                    <p style={{ fontSize: '12px', color: 'var(--text-700)' }}>Le code se met à jour en temps réel.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="premium-card" style={{ background: 'var(--primary)', color: 'white' }}>
                                <h3 style={{ color: 'white', marginBottom: '16px' }}>{QR_TYPES.find(t => t.id === selectedType)?.label}</h3>
                                <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                                    Vous créez un code QR de type <strong style={{ color: 'var(--accent)' }}>{selectedType.toUpperCase()}</strong>.
                                </p>
                                <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
                                    <p style={{ fontSize: '12px', opacity: 0.7 }}>Progression : {Math.round((step / 3) * 100)}%</p>
                                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '8px' }}>
                                        <div style={{ width: `${(step / 3) * 100}%`, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}

