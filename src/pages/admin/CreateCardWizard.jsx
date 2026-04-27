// src/pages/admin/CreateCardWizard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import { generateUniqueCardId } from '../../lib/utils.js';
import PhonePreview from '../../components/PhonePreview.jsx';

const QR_TYPES = [
    { id: 'url', icon: '🌐', label: 'Site internet', desc: 'Renvoyez vers l\'URL de n\'importe quel site.' },
    { id: 'pdf', icon: '📄', label: 'PDF', desc: 'Partagez un document PDF.' },
    { id: 'vcard', icon: '👤', label: 'vCard', desc: 'Partagez votre carte pro électronique.' },
    { id: 'wifi', icon: '📶', label: 'Wi-Fi', desc: 'Connectez-vous à un réseau Wi-Fi.' },
    { id: 'social', icon: '📱', label: 'Réseaux sociaux', desc: 'Partagez vos profils sociaux.' },
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp', desc: 'Recevez des messages directs.' },
    { id: 'email', icon: '📧', label: 'Email', desc: 'Envoyez un email pré-rempli.' },
    { id: 'phone', icon: '📞', label: 'Téléphone', desc: 'Lancez un appel téléphonique.' }
];

export default function CreateCardWizard() {
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);
    const [generatedCardId, setGeneratedCardId] = useState(null);

    const [step, setStep] = useState(1);
    const [selectedType, setSelectedType] = useState('url');
    const [generating, setGenerating] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState('main');

    const [cardName, setCardName] = useState('');
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [typeData, setTypeData] = useState({ url: 'https://google.com' });
    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded', dotsColor: '#000000', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersDotType: 'dot', cornersColor: '#000000',
        logo_url: null
    });

    useEffect(() => {
        generateUniqueCardId().then(id => setGeneratedCardId(id));
        loadFolders();
    }, []);

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    useEffect(() => {
        if (qrRef.current && generatedCardId) {
            const data = formatQRData();
            if (!qrCode.current) initQRCode(data);
            else updateQRCode(data);
        }
    }, [qrAppearance, generatedCardId, typeData, selectedType, step]);

    function formatQRData() {
        const profileUrl = `${window.location.origin}/u/${generatedCardId}`;
        switch (selectedType) {
            case 'wifi': return `WIFI:T:WPA;S:${typeData.ssid || ''};P:${typeData.pass || ''};;`;
            case 'vcard': return `BEGIN:VCARD\nVERSION:3.0\nFN:${typeData.fn || ''}\nTEL:${typeData.tel || ''}\nEND:VCARD`;
            default: return typeData.url || profileUrl;
        }
    }

    function initQRCode(data) {
        qrCode.current = new QRCodeStyling({
            width: 260, height: 260, data: data,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            backgroundOptions: { color: qrAppearance.bgColor },
            image: qrAppearance.logo_url || '',
            imageOptions: { crossOrigin: 'anonymous', margin: 10 }
        });
        if (qrRef.current) { qrRef.current.innerHTML = ''; qrCode.current.append(qrRef.current); }
    }

    function updateQRCode(data) {
        if (!qrCode.current) return;
        qrCode.current.update({
            data: data,
            dotsOptions: { color: qrAppearance.dotsColor, type: qrAppearance.dotsType },
            backgroundOptions: { color: qrAppearance.bgColor },
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            image: qrAppearance.logo_url || '',
        });
    }

    async function handleFinalize() {
        setGenerating(true);
        try {
            const { error } = await supabase.from('cards').insert({
                card_id: generatedCardId,
                card_name: cardName || 'Sans nom',
                folder_id: selectedFolderId,
                qr_appearance: qrAppearance,
                type_data: { ...typeData, qr_type: selectedType },
                status: 'active'
            });
            if (error) throw error;
            toast('QR Code créé avec succès !', 'success');
            navigate('/admin');
        } catch (err) { toast(err.message, 'error'); } 
        finally { setGenerating(false); }
    }

    const renderAccordion = (id, icon, title, subtitle, children) => (
        <div className="accordion">
            <div className="accordion-header" onClick={() => setExpandedAccordion(expandedAccordion === id ? '' : id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '20px' }}>{icon}</div>
                    <div>
                        <div style={{ fontWeight: '700', color: '#1A1265' }}>{title}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>{subtitle}</div>
                    </div>
                </div>
                <div style={{ transform: expandedAccordion === id ? 'rotate(180deg)' : 'none', transition: '0.3s' }}>▼</div>
            </div>
            {expandedAccordion === id && <div className="accordion-content">{children}</div>}
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                {/* Stepper */}
                <div className="stepper">
                    <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}>
                        <div className="step-number">1</div> Type de code QR
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}>
                        <div className="step-number">2</div> Contenu
                    </div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 3 ? (step > 3 ? 'done' : 'active') : ''}`}>
                        <div className="step-number">3</div> Apparence du QR
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>
                    {/* Main Content Area */}
                    <div className="animate-fade-in">
                        {step === 1 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>1. Sélectionnez un type de code QR</h2>
                                <div className="selection-grid">
                                    {QR_TYPES.map(type => (
                                        <div key={type.id} className={`selection-card ${selectedType === type.id ? 'active' : ''}`} onClick={() => { setSelectedType(type.id); setStep(2); }}>
                                            <i>{type.icon}</i>
                                            <h3>{type.label}</h3>
                                            <p>{type.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>2. Ajoutez du contenu à votre code QR</h2>
                                {renderAccordion('main', '🌐', 'Informations sur le site', 'Saisissez l\'URL vers laquelle ce QR redirigera.', (
                                    <div className="field" style={{ marginTop: '20px' }}>
                                        <label>URL du site internet *</label>
                                        <input type="url" value={typeData.url} onChange={e => setTypeData({...typeData, url: e.target.value})} placeholder="https://google.com" />
                                    </div>
                                ))}
                                {renderAccordion('name', '🏷️', 'Nom du code QR', 'Donnez un nom à votre code QR.', (
                                    <div className="field" style={{ marginTop: '20px' }}>
                                        <label>Nom du projet</label>
                                        <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Ex: Campagne Printemps" />
                                    </div>
                                ))}
                                {renderAccordion('folder', '📂', 'Dossier', 'Liez ce QR à un dossier existant.', (
                                    <div className="field" style={{ marginTop: '20px' }}>
                                        <label>Choisir un dossier</label>
                                        <select value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value)}>
                                            <option value="">Sélectionner un dossier</option>
                                            {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>3. Choisissez l'apparence du QR</h2>
                                {renderAccordion('pattern', '⬛', 'Motif du code QR', 'Choisissez un motif et des couleurs.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="field">
                                            <label>Style de motif</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {['rounded', 'dots', 'classy', 'square'].map(s => (
                                                    <button key={s} onClick={() => setQrAppearance({...qrAppearance, dotsType: s})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: qrAppearance.dotsType === s ? '2px solid var(--accent)' : '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field">
                                            <label>Couleur du motif</label>
                                            <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} />
                                        </div>
                                    </div>
                                ))}
                                {renderAccordion('corners', '🔳', 'Coins du code QR', 'Sélectionnez le style de coins.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="field">
                                            <label>Style de coins</label>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {['square', 'extra-rounded', 'dot'].map(s => (
                                                    <button key={s} onClick={() => setQrAppearance({...qrAppearance, cornersType: s})} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: qrAppearance.cornersType === s ? '2px solid var(--accent)' : '1px solid var(--border)', background: 'white', cursor: 'pointer' }}>{s}</button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bottom Navigation */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '24px 0', borderTop: '1px solid #E2E8F0' }}>
                            <button className="btn-nav-prev" onClick={() => step > 1 ? setStep(step - 1) : navigate('/admin')}>← Retour</button>
                            {step < 3 ? (
                                <button className="btn-nav-next" onClick={() => setStep(step + 1)}>Suivant →</button>
                            ) : (
                                <button className="btn-nav-next" onClick={handleFinalize} disabled={generating}>{generating ? 'Création...' : 'Créer le QR ✓'}</button>
                            )}
                        </div>
                    </div>

                    {/* Preview Sidebar */}
                    <div className="phone-preview-container">
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <button style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: 'var(--accent)', color: 'white', fontWeight: '700', fontSize: '13px' }}>Code QR</button>
                            <button style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '700', fontSize: '13px' }}>Aperçu</button>
                        </div>
                        <PhonePreview>
                            <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'center' }}>
                                <div ref={qrRef} style={{ background: 'white', padding: '10px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}></div>
                                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                                    <h4 style={{ fontWeight: '900', color: '#1A1265' }}>{cardName || 'Sans titre'}</h4>
                                    <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Scannez pour tester</p>
                                </div>
                            </div>
                        </PhonePreview>
                    </div>
                </div>
            </div>
        </div>
    );
}