// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import ProfileForm from '../../components/ProfileForm.jsx';

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_STYLES = ['square', 'extra-rounded', 'dot'];
const CORNER_DOT_STYLES = ['dot', 'square'];

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
        bgColor: '#EBEBDF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1A1265',
        cornersDotColor: '#1A1265',
        logo: null,
    });

    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (step === 3 && qrRef.current && !qrCode.current && generatedCardId) {
            initQRCode();
        }
    }, [step, generatedCardId]);

    useEffect(() => {
        if (qrCode.current && step === 3 && generatedCardId) {
            updateQRCode();
        }
    }, [qrAppearance, step, generatedCardId]);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function dataURLToBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
    }

    async function uploadLogo(file) {
        if (!file) return;
        setUploadingLogo(true);
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            const blob = dataURLToBlob(base64);
            const fileName = `qr-logo-${generatedCardId || 'temp'}-${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
                .from('qr-logos')
                .upload(fileName, blob, { upsert: true });

            if (uploadError) {
                toast('Erreur upload logo', 'error');
                setUploadingLogo(false);
                return;
            }

            const { data: urlData } = supabase.storage
                .from('qr-logos')
                .getPublicUrl(fileName);

            setQrAppearance(prev => ({
                ...prev,
                logo: urlData.publicUrl,
                logo_url: urlData.publicUrl
            }));
            toast('Logo ajouté !', 'success');
            setUploadingLogo(false);
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        setQrAppearance(prev => ({ ...prev, logo: null, logo_url: null }));
        toast('Logo supprimé', 'info');
    }

    function initQRCode() {
        const url = `${window.location.origin}/u/${generatedCardId}`;
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, type: 'svg',
            data: url,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
        });
        if (qrAppearance.logo_url) {
            qrCode.current.update({ image: qrAppearance.logo_url });
        }
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }

    function updateQRCode() {
        const url = `${window.location.origin}/u/${generatedCardId}`;
        qrCode.current.update({
            data: url,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
            image: qrAppearance.logo_url || '',
        });
    }

    function updateQR(key, value) {
        setQrAppearance(prev => ({ ...prev, [key]: value }));
    }

    async function uploadPublicAvatar(file) {
        if (!file) return;
        setUploadingAvatar(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPublicProfile({ ...publicProfile, photo_url: ev.target.result });
            toast('Photo ajoutée', 'success');
            setUploadingAvatar(false);
        };
        reader.readAsDataURL(file);
    }

    async function uploadPublicBanner(file) {
        if (!file) return;
        setUploadingBanner(true);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPublicProfile({ ...publicProfile, banner_url: ev.target.result });
            toast('Bannière ajoutée', 'success');
            setUploadingBanner(false);
        };
        reader.readAsDataURL(file);
    }

    function validateStep1() {
        if (!clientInfo.clientName.trim()) {
            toast('Le nom du client est obligatoire', 'error');
            return false;
        }
        return true;
    }

    function validateStep2() {
        if (!publicProfile.full_name?.trim()) {
            toast('Le nom complet du profil public est obligatoire', 'error');
            return false;
        }
        return true;
    }

    async function finalizeCreate() {
        if (!validateStep1() || !validateStep2()) return;

        setGenerating(true);
        const cardId = await generateUniqueCardId();
        setGeneratedCardId(cardId);
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        const cardData = {
            card_id: cardId,
            card_name: clientInfo.clientName.trim(),
            status: 'pending',
            activation_token: token,
            city: clientInfo.city,
            country: clientInfo.country,
            folder_id: selectedFolder || null,
            admin_profile: publicProfile,
            qr_appearance: {
                dotsType: qrAppearance.dotsType,
                dotsColor: qrAppearance.dotsColor,
                bgColor: qrAppearance.bgColor,
                cornersType: qrAppearance.cornersType,
                cornersDotType: qrAppearance.cornersDotType,
                cornersColor: qrAppearance.cornersColor,
                cornersDotColor: qrAppearance.cornersDotColor,
                logo_url: qrAppearance.logo_url,
            },
        };

        const { error } = await supabase.from('cards').insert(cardData);
        if (error) {
            toast('Erreur : ' + error.message, 'error');
        } else {
            toast(`Carte ${cardId} créée avec succès !`, 'success');
            setTimeout(() => {
                if (qrCode.current) {
                    qrCode.current.download({ name: `QR-${cardId}`, extension: 'png' });
                }
                navigate('/admin');
            }, 500);
        }
        setGenerating(false);
    }

    useEffect(() => {
        if (clientInfo.clientName && !publicProfile.full_name) {
            setPublicProfile(prev => ({ ...prev, full_name: clientInfo.clientName }));
        }
    }, [clientInfo.clientName]);

    useEffect(() => {
        if (step === 3 && !generatedCardId && !generating) {
            generateUniqueCardId().then(id => setGeneratedCardId(id));
        }
    }, [step]);

    return (
        <div style={{ minHeight: '100vh', background: '#EBEBDF', padding: '32px 24px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                <div style={{ marginBottom: '32px' }}>
                    <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ marginBottom: '16px' }}>
                        ← Retour à l'administration
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {[
                            { step: 1, label: 'Infos client' },
                            { step: 2, label: 'Profil public' },
                            { step: 3, label: 'Apparence QR' },
                        ].map(s => (
                            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: step > s.step ? '#27AE60' : step === s.step ? '#1A1265' : '#D4D4C8',
                                    color: step >= s.step ? 'white' : '#5A5A7A',
                                    fontWeight: '700', fontSize: '14px',
                                }}>
                                    {step > s.step ? '✓' : s.step}
                                </div>
                                <span style={{ fontWeight: step === s.step ? '600' : '400', color: step === s.step ? '#1A1265' : '#5A5A7A' }}>
                                    {s.label}
                                </span>
                                {s.step < 3 && <div style={{ width: '40px', height: '1px', background: '#D4D4C8', marginLeft: '8px' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                {step === 1 && (
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', maxWidth: '500px', border: '1px solid #D4D4C8' }}>
                        <h2 style={{ fontFamily: 'Inter', fontSize: '20px', marginBottom: '8px' }}>👤 Informations client</h2>
                        <p style={{ fontSize: '13px', color: '#5A5A7A', marginBottom: '24px' }}>
                            Ces informations sont privées et visibles uniquement par l'administrateur.
                        </p>

                        <div className="field">
                            <label>Nom complet *</label>
                            <input type="text" placeholder="Jean Dupont" autoFocus value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} />
                        </div>
                        <div className="field-row">
                            <div className="field"><label>Ville</label><input type="text" placeholder="Cotonou" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} /></div>
                            <div className="field"><label>Pays</label><input type="text" placeholder="Bénin" value={clientInfo.country} onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })} /></div>
                        </div>
                        <div className="field">
                            <label>📁 Dossier (optionnel)</label>
                            <select value={selectedFolder} onChange={e => setSelectedFolder(e.target.value)}>
                                <option value="">— Aucun dossier —</option>
                                {folders.map(f => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                            <button className="btn-primary" onClick={() => { if (validateStep1()) setStep(2); }}>Suivant →</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                        <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', marginBottom: '24px' }}>📄 Profil public</h2>
                            <ProfileForm
                                form={publicProfile}
                                onChange={setPublicProfile}
                                onUploadAvatar={uploadPublicAvatar}
                                onUploadBanner={uploadPublicBanner}
                                uploadingAvatar={uploadingAvatar}
                                uploadingBanner={uploadingBanner}
                                readOnly={false}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                <button className="btn-ghost" onClick={() => setStep(1)}>← Retour</button>
                                <button className="btn-primary" onClick={() => { if (validateStep2()) setStep(3); }}>Suivant →</button>
                            </div>
                        </div>

                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #D4D4C8' }}>
                                <h3 style={{ marginBottom: '16px' }}>📱 Aperçu de la page publique</h3>
                                <div style={{ background: '#1A1A2E', borderRadius: '32px', padding: '12px', width: '260px', margin: '0 auto' }}>
                                    <div style={{ background: '#000', borderRadius: '16px', padding: '8px' }}>
                                        <div style={{ background: '#fff', borderRadius: '24px', minHeight: '420px', padding: '16px' }}>
                                            <div style={{ textAlign: 'center' }}>
                                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#1A1265', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: 'white' }}>👤</div>
                                                <p style={{ fontWeight: 'bold' }}>{publicProfile.full_name || 'Nom du client'}</p>
                                                <p style={{ fontSize: '11px', color: '#666' }}>{publicProfile.title || 'Titre'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                        <div>
                            <h2 style={{ fontFamily: 'Inter', fontSize: '20px', marginBottom: '24px' }}>🎨 Personnalisation du QR Code</h2>

                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #D4D4C8' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Motif</h3>
                                <div className="field"><label>Style</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{DOT_STYLES.map(s => <button key={s} onClick={() => updateQR('dotsType', s)} style={{ padding: '6px 12px', borderRadius: '20px', border: qrAppearance.dotsType === s ? 'none' : '1px solid #D4D4C8', background: qrAppearance.dotsType === s ? '#1A1265' : 'transparent', color: qrAppearance.dotsType === s ? 'white' : '#5A5A7A', cursor: 'pointer' }}>{s}</button>)}</div></div>
                                <div className="field"><label>Couleur</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.dotsColor} onChange={e => updateQR('dotsColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.dotsColor} onChange={e => updateQR('dotsColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                                <div className="field"><label>Fond</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.bgColor} onChange={e => updateQR('bgColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.bgColor} onChange={e => updateQR('bgColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                            </div>

                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', marginBottom: '16px', border: '1px solid #D4D4C8' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Coins</h3>
                                <div className="field"><label>Style des coins</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{CORNER_STYLES.map(s => <button key={s} onClick={() => updateQR('cornersType', s)} style={{ padding: '6px 12px', borderRadius: '20px', border: qrAppearance.cornersType === s ? 'none' : '1px solid #D4D4C8', background: qrAppearance.cornersType === s ? '#1A1265' : 'transparent', color: qrAppearance.cornersType === s ? 'white' : '#5A5A7A', cursor: 'pointer' }}>{s}</button>)}</div></div>
                                <div className="field"><label>Couleur des coins</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.cornersColor} onChange={e => updateQR('cornersColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.cornersColor} onChange={e => updateQR('cornersColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                                <div className="field"><label>Style des points intérieurs</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{CORNER_DOT_STYLES.map(s => <button key={s} onClick={() => updateQR('cornersDotType', s)} style={{ padding: '6px 12px', borderRadius: '20px', border: qrAppearance.cornersDotType === s ? 'none' : '1px solid #D4D4C8', background: qrAppearance.cornersDotType === s ? '#1A1265' : 'transparent', color: qrAppearance.cornersDotType === s ? 'white' : '#5A5A7A', cursor: 'pointer' }}>{s}</button>)}</div></div>
                                <div className="field"><label>Couleur des points intérieurs</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.cornersDotColor} onChange={e => updateQR('cornersDotColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.cornersDotColor} onChange={e => updateQR('cornersDotColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                            </div>

                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #D4D4C8' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Logo</h3>
                                <div className="field"><label>Image (PNG, SVG, JPG)</label><input type="file" accept="image/*" onChange={e => e.target.files[0] && uploadLogo(e.target.files[0])} /></div>
                                {uploadingLogo && <p style={{ fontSize: '12px', marginTop: '8px' }}>Chargement...</p>}
                                {qrAppearance.logo_url && (
                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img src={qrAppearance.logo_url} alt="Logo" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                        <button className="btn-ghost" onClick={removeLogo}>🗑 Supprimer le logo</button>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                <button className="btn-ghost" onClick={() => setStep(2)}>← Retour</button>
                                <button className="btn-primary" onClick={finalizeCreate} disabled={generating} style={{ padding: '12px 32px' }}>
                                    {generating ? 'Création...' : '✓ Créer la carte'}
                                </button>
                            </div>
                        </div>

                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div style={{ background: 'white', borderRadius: '16px', padding: '24px', textAlign: 'center', border: '1px solid #D4D4C8' }}>
                                <h3 style={{ marginBottom: '16px' }}>🔍 Aperçu du QR</h3>
                                <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }} />
                                {generatedCardId && (
                                    <p style={{ fontSize: '12px', color: '#5A5A7A', fontFamily: 'monospace' }}>
                                        {window.location.origin}/u/{generatedCardId}
                                    </p>
                                )}
                                <p style={{ fontSize: '11px', color: '#5A5A7A', marginTop: '8px' }}>
                                    Ce QR pointera vers la page publique de la carte
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}