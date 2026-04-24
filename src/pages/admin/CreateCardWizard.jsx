// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';

const DOT_STYLES = ['rounded', 'dots', 'classy', 'classy-rounded', 'square', 'extra-rounded'];
const CORNER_STYLES = ['square', 'extra-rounded', 'dot'];
const CORNER_DOT_STYLES = ['dot', 'square'];

export default function CreateCardWizard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [step, setStep] = useState(1);
    const [generating, setGenerating] = useState(false);

    // Étape 1 : Infos client
    const [clientInfo, setClientInfo] = useState({
        clientName: '',
        city: '',
        country: 'Bénin'
    });

    // Étape 2 : Type de contenu
    const [pageType, setPageType] = useState('profile');
    const [redirectUrl, setRedirectUrl] = useState('');
    const [wifiSsid, setWifiSsid] = useState('');
    const [wifiPassword, setWifiPassword] = useState('');
    const [wifiSecurity, setWifiSecurity] = useState('WPA');

    // Étape 3 : Apparence QR
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

    // Dossiers disponibles
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('');

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (step === 3 && qrRef.current && !qrCode.current) {
            initQRCode();
        }
    }, [step]);

    useEffect(() => {
        if (qrCode.current && step === 3) {
            updateQRCode();
        }
    }, [qrAppearance, step]);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    function initQRCode() {
        const previewData = 'https://nfcrafter.app/apercu';
        qrCode.current = new QRCodeStyling({
            width: 280, height: 280, type: 'svg',
            data: previewData,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
        });
        if (qrRef.current) {
            qrRef.current.innerHTML = '';
            qrCode.current.append(qrRef.current);
        }
    }

    function updateQRCode() {
        qrCode.current.update({
            data: 'https://nfcrafter.app/apercu',
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            cornersDotOptions: { color: qrAppearance.cornersDotColor, type: qrAppearance.cornersDotType },
        });
    }

    function updateQR(key, value) {
        setQrAppearance(prev => ({ ...prev, [key]: value }));
    }

    async function uploadLogo(file) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            updateQR('logo', ev.target.result);
            if (qrCode.current) {
                qrCode.current.update({ image: ev.target.result });
            }
        };
        reader.readAsDataURL(file);
    }

    function removeLogo() {
        updateQR('logo', null);
        if (qrCode.current) {
            qrCode.current.update({ image: '' });
        }
    }

    function validateStep1() {
        if (!clientInfo.clientName.trim()) {
            toast('Le nom du client est obligatoire', 'error');
            return false;
        }
        return true;
    }

    function validateStep2() {
        if (pageType === 'url' && !redirectUrl.trim()) {
            toast('L’URL de redirection est obligatoire', 'error');
            return false;
        }
        if (pageType === 'wifi' && !wifiSsid.trim()) {
            toast('Le SSID (nom du réseau) est obligatoire', 'error');
            return false;
        }
        return true;
    }

    async function finalizeCreate() {
        if (!validateStep1() || !validateStep2()) return;

        setGenerating(true);
        const cardId = await generateUniqueCardId();
        const token = Math.random().toString(36).substring(2, 10).toUpperCase();

        const cardData = {
            card_id: cardId,
            card_name: clientInfo.clientName.trim(),
            status: 'pending',
            activation_token: token,
            city: clientInfo.city,
            country: clientInfo.country,
            page_type: pageType,
            folder_id: selectedFolder || null,
            qr_appearance: {
                dotsType: qrAppearance.dotsType,
                dotsColor: qrAppearance.dotsColor,
                bgColor: qrAppearance.bgColor,
                cornersType: qrAppearance.cornersType,
                cornersDotType: qrAppearance.cornersDotType,
                cornersColor: qrAppearance.cornersColor,
                cornersDotColor: qrAppearance.cornersDotColor,
            },
            admin_profile: { full_name: clientInfo.clientName.trim() }
        };

        if (pageType === 'url') {
            cardData.redirect_url = redirectUrl.trim();
        } else if (pageType === 'wifi') {
            cardData.wifi_ssid = wifiSsid.trim();
            cardData.wifi_password = wifiPassword;
            cardData.wifi_security = wifiSecurity;
        }

        const { error } = await supabase.from('cards').insert(cardData);
        if (error) {
            toast('Erreur : ' + error.message, 'error');
        } else {
            toast(`Carte ${cardId} créée avec succès !`, 'success');
            navigate('/admin');
        }
        setGenerating(false);
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 24px' }}>
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Header avec stepper */}
                <div style={{ marginBottom: '32px' }}>
                    <button onClick={() => navigate('/admin')} className="btn-ghost" style={{ marginBottom: '16px' }}>
                        ← Retour à l'administration
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {[
                            { step: 1, label: 'Client' },
                            { step: 2, label: 'Contenu' },
                            { step: 3, label: 'Apparence QR' },
                        ].map(s => (
                            <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{
                                    width: '32px', height: '32px', borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: step > s.step ? 'var(--success)' : step === s.step ? 'var(--accent)' : 'var(--border)',
                                    color: step >= s.step ? 'white' : 'var(--text-light)',
                                    fontWeight: '700', fontSize: '14px',
                                }}>
                                    {step > s.step ? '✓' : s.step}
                                </div>
                                <span style={{ fontWeight: step === s.step ? '600' : '400', color: step === s.step ? 'var(--accent)' : 'var(--text-light)' }}>
                                    {s.label}
                                </span>
                                {s.step < 3 && <div style={{ width: '40px', height: '1px', background: 'var(--border)', marginLeft: '8px' }} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ÉTAPE 1 : Infos client */}
                {step === 1 && (
                    <div className="card" style={{ maxWidth: '500px' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '24px' }}>👤 Informations client</h2>
                        <div className="field">
                            <label>Nom complet *</label>
                            <input type="text" placeholder="Jean Dupont" autoFocus
                                value={clientInfo.clientName} onChange={e => setClientInfo({ ...clientInfo, clientName: e.target.value })} />
                        </div>
                        <div className="field-row">
                            <div className="field"><label>Ville</label><input type="text" placeholder="Cotonou" value={clientInfo.city} onChange={e => setClientInfo({ ...clientInfo, city: e.target.value })} /></div>
                            <div className="field"><label>Pays</label><input type="text" placeholder="Bénin" value={clientInfo.country} onChange={e => setClientInfo({ ...clientInfo, country: e.target.value })} /></div>
                        </div>
                        <div className="field">
                            <label>Dossier (optionnel)</label>
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

                {/* ÉTAPE 2 : Type de contenu */}
                {step === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
                        <div className="card">
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '24px' }}>📄 Type de contenu</h2>
                            <div className="field">
                                <label>Type de page *</label>
                                <select value={pageType} onChange={e => setPageType(e.target.value)}>
                                    <option value="profile">📄 Page profil personnalisable (client modifie bio, liens, etc.)</option>
                                    <option value="url">🔗 Redirection vers une URL (client pourra modifier l'URL)</option>
                                    <option value="wifi">📶 Page Wi-Fi (client pourra modifier SSID/mot de passe)</option>
                                </select>
                            </div>

                            {pageType === 'url' && (
                                <div className="field">
                                    <label>URL de redirection par défaut *</label>
                                    <input type="url" placeholder="https://exemple.com" value={redirectUrl} onChange={e => setRedirectUrl(e.target.value)} />
                                </div>
                            )}

                            {pageType === 'wifi' && (
                                <>
                                    <div className="field"><label>SSID (nom du réseau) *</label><input type="text" placeholder="MonWiFi" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} /></div>
                                    <div className="field"><label>Mot de passe</label><input type="text" placeholder="••••••••" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} /></div>
                                    <div className="field"><label>Sécurité</label><select value={wifiSecurity} onChange={e => setWifiSecurity(e.target.value)}><option>WPA</option><option>WEP</option><option>nopass</option></select></div>
                                </>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                <button className="btn-ghost" onClick={() => setStep(1)}>← Retour</button>
                                <button className="btn-primary" onClick={() => { if (validateStep2()) setStep(3); }}>Suivant →</button>
                            </div>
                        </div>

                        {/* Aperçu téléphone */}
                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div className="card" style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '16px' }}>📱 Aperçu</h3>
                                <div style={{
                                    background: '#1A1A2E', borderRadius: '32px', padding: '12px',
                                    width: '260px', margin: '0 auto'
                                }}>
                                    <div style={{ background: '#000', borderRadius: '16px', padding: '8px' }}>
                                        <div style={{ background: '#fff', borderRadius: '24px', minHeight: '420px', padding: '16px' }}>
                                            {pageType === 'profile' && <div style={{ textAlign: 'center' }}>👤 Profil client</div>}
                                            {pageType === 'url' && <div style={{ textAlign: 'center' }}>🔗 {redirectUrl || 'https://exemple.com'}</div>}
                                            {pageType === 'wifi' && <div style={{ textAlign: 'center' }}>📶 {wifiSsid || 'Nom du réseau'}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ÉTAPE 3 : Apparence QR */}
                {step === 3 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                        <div>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '24px' }}>🎨 Personnalisation du QR Code</h2>

                            <div className="card" style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Motif</h3>
                                <div className="field"><label>Style</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{DOT_STYLES.map(s => <button key={s} onClick={() => updateQR('dotsType', s)} style={{ padding: '6px 12px', borderRadius: '20px', border: qrAppearance.dotsType === s ? 'none' : '1px solid var(--border)', background: qrAppearance.dotsType === s ? 'var(--accent)' : 'transparent', color: qrAppearance.dotsType === s ? 'white' : 'var(--text-light)' }}>{s}</button>)}</div></div>
                                <div className="field"><label>Couleur</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.dotsColor} onChange={e => updateQR('dotsColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.dotsColor} onChange={e => updateQR('dotsColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                                <div className="field"><label>Fond</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.bgColor} onChange={e => updateQR('bgColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.bgColor} onChange={e => updateQR('bgColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                            </div>

                            <div className="card" style={{ marginBottom: '16px' }}>
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Coins</h3>
                                <div className="field"><label>Style coins</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{CORNER_STYLES.map(s => <button key={s} onClick={() => updateQR('cornersType', s)} style={{ padding: '6px 12px', borderRadius: '20px', border: qrAppearance.cornersType === s ? 'none' : '1px solid var(--border)', background: qrAppearance.cornersType === s ? 'var(--accent)' : 'transparent', color: qrAppearance.cornersType === s ? 'white' : 'var(--text-light)' }}>{s}</button>)}</div></div>
                                <div className="field"><label>Couleur coins</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.cornersColor} onChange={e => updateQR('cornersColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.cornersColor} onChange={e => updateQR('cornersColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                                <div className="field"><label>Style points intérieurs</label><div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>{CORNER_DOT_STYLES.map(s => <button key={s} onClick={() => updateQR('cornersDotType', s)} style={{ padding: '6px 12px', borderRadius: '20px', border: qrAppearance.cornersDotType === s ? 'none' : '1px solid var(--border)', background: qrAppearance.cornersDotType === s ? 'var(--accent)' : 'transparent', color: qrAppearance.cornersDotType === s ? 'white' : 'var(--text-light)' }}>{s}</button>)}</div></div>
                                <div className="field"><label>Couleur points intérieurs</label><div style={{ display: 'flex', gap: '8px' }}><input type="color" value={qrAppearance.cornersDotColor} onChange={e => updateQR('cornersDotColor', e.target.value)} style={{ width: '48px' }} /><input type="text" value={qrAppearance.cornersDotColor} onChange={e => updateQR('cornersDotColor', e.target.value)} style={{ flex: 1 }} /></div></div>
                            </div>

                            <div className="card">
                                <h3 style={{ fontWeight: '700', marginBottom: '16px' }}>Logo</h3>
                                <div className="field"><label>Image (PNG, SVG, JPG)</label><input type="file" accept="image/*" onChange={e => e.target.files[0] && uploadLogo(e.target.files[0])} /></div>
                                {qrAppearance.logo && <button className="btn-ghost" onClick={removeLogo} style={{ marginTop: '8px' }}>🗑 Supprimer le logo</button>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
                                <button className="btn-ghost" onClick={() => setStep(2)}>← Retour</button>
                                <button className="btn-primary" onClick={finalizeCreate} disabled={generating} style={{ padding: '12px 32px' }}>
                                    {generating ? 'Création...' : '✓ Créer la carte'}
                                </button>
                            </div>
                        </div>

                        <div style={{ position: 'sticky', top: '20px' }}>
                            <div className="card" style={{ textAlign: 'center' }}>
                                <h3 style={{ marginBottom: '16px' }}>🔍 Aperçu du QR</h3>
                                <div ref={qrRef} style={{ display: 'inline-block', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px' }} />
                                <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>Le QR pointera vers la page publique de la carte</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}