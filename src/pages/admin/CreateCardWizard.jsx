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
    { id: 'links', icon: '🔗', label: 'Liste de liens', desc: 'Partagez plusieurs liens sur une page.' },
    { id: 'vcard', icon: '👤', label: 'vCard', desc: 'Partagez votre carte pro électronique.' },
    { id: 'business', icon: '🏢', label: 'Entreprise', desc: 'Partagez des infos sur votre entreprise.' }
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

    // Content State
    const [cardName, setCardName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [folders, setFolders] = useState([]);
    
    // Complex Data State
    const [typeData, setTypeData] = useState({
        url: '',
        title: '',
        description: '',
        logo_url: null,
        primaryColor: '#1A1265',
        secondaryColor: '#6366F1',
        links: [{ id: Date.now(), label: '', url: '', icon: '' }],
        socials: {},
        hours: {},
        contact: { phone: '', email: '', website: '', address: '' },
        company: { name: '', position: '', about: '' }
    });

    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded', dotsColor: '#000000', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersColor: '#000000',
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
        // For complex types, the QR always points to the digital profile
        if (['vcard', 'business', 'links', 'pdf'].includes(selectedType)) return profileUrl;
        return typeData.url || profileUrl;
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
            toast('QR Code créé !', 'success');
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
            {expandedAccordion === id && <div className="accordion-content animate-fade-in">{children}</div>}
        </div>
    );

    const CommonFields = () => (
        <>
            {renderAccordion('meta', '🏷️', 'Nom du code QR', 'Donnez un nom à votre projet.', (
                <div className="field" style={{ marginTop: '20px' }}>
                    <label>Nom du projet *</label>
                    <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Ex: Campagne Marketing" />
                </div>
            ))}
            {renderAccordion('folder', '📂', 'Dossier', 'Rangez ce QR dans un dossier.', (
                <div className="field" style={{ marginTop: '20px' }}>
                    <label>Choisir un dossier</label>
                    <select value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value)}>
                        <option value="">Aucun dossier</option>
                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                </div>
            ))}
        </>
    );

    const AppearanceSection = () => renderAccordion('theme', '🎨', 'Apparence', 'Choisissez un thème de couleur.', (
        <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {['#1A1265', '#22C55E', '#EF4444', '#F59E0B', '#6366F1'].map(c => (
                    <div key={c} onClick={() => setTypeData({...typeData, primaryColor: c})} style={{ width: '32px', height: '32px', borderRadius: '8px', background: c, cursor: 'pointer', border: typeData.primaryColor === c ? '3px solid white' : 'none', boxShadow: '0 0 0 1px #E2E8F0' }}></div>
                ))}
            </div>
            <div className="field"><label>Couleur personnalisée</label><input type="color" value={typeData.primaryColor} onChange={e => setTypeData({...typeData, primaryColor: e.target.value})} /></div>
        </div>
    ));

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                {/* Stepper */}
                <div className="stepper">
                    <div className={`step ${step >= 1 ? (step > 1 ? 'done' : 'active') : ''}`}><div className="step-number">1</div> Type de code QR</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 2 ? (step > 2 ? 'done' : 'active') : ''}`}><div className="step-number">2</div> Contenu</div>
                    <div className="step-line"></div>
                    <div className={`step ${step >= 3 ? (step > 3 ? 'done' : 'active') : ''}`}><div className="step-number">3</div> Apparence du QR</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>
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
                                
                                {/* 1. Site Internet (URL) */}
                                {selectedType === 'url' && (
                                    renderAccordion('main', '🌐', 'Informations sur le site', 'Saisissez l\'URL de destination.', (
                                        <div className="field" style={{ marginTop: '20px' }}>
                                            <label>URL du site internet *</label>
                                            <input type="url" value={typeData.url} onChange={e => setTypeData({...typeData, url: e.target.value})} placeholder="https://votresite.com" />
                                        </div>
                                    ))
                                )}

                                {/* 2. PDF */}
                                {selectedType === 'pdf' && (
                                    <>
                                        {renderAccordion('main', '📄', 'Fichier PDF', 'Téléchargez le document PDF.', (
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{ border: '2px dashed #E2E8F0', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
                                                    <div style={{ fontSize: '40px', marginBottom: '16px' }}>☁️</div>
                                                    <button className="btn-nav-next" style={{ margin: '0 auto' }}>Choisir un fichier</button>
                                                    <p style={{ marginTop: '12px', fontSize: '12px', color: '#94A3B8' }}>PDF uniquement (max 10Mo)</p>
                                                </div>
                                            </div>
                                        ))}
                                        {renderAccordion('info', 'ℹ️', 'Informations sur le PDF', 'Titre et description.', (
                                            <div style={{ marginTop: '20px' }}>
                                                <div className="field"><label>Titre du PDF</label><input type="text" value={typeData.title} onChange={e => setTypeData({...typeData, title: e.target.value})} placeholder="Ex: Menu Restaurant" /></div>
                                                <div className="field"><label>Description</label><textarea value={typeData.description} onChange={e => setTypeData({...typeData, description: e.target.value})} placeholder="Description du contenu..." /></div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* 3. Liste de liens */}
                                {selectedType === 'links' && (
                                    <>
                                        {renderAccordion('main', '🔗', 'Liste de liens', 'Ajoutez vos liens personnalisés.', (
                                            <div style={{ marginTop: '20px' }}>
                                                {typeData.links.map((link, idx) => (
                                                    <div key={link.id} style={{ padding: '20px', border: '1px solid #F1F5F9', borderRadius: '12px', marginBottom: '12px' }}>
                                                        <div className="field"><label>Titre du lien</label><input type="text" value={link.label} onChange={e => {
                                                            const newLinks = [...typeData.links];
                                                            newLinks[idx].label = e.target.value;
                                                            setTypeData({...typeData, links: newLinks});
                                                        }} placeholder="Ex: Mon Site" /></div>
                                                        <div className="field"><label>URL</label><input type="url" value={link.url} onChange={e => {
                                                            const newLinks = [...typeData.links];
                                                            newLinks[idx].url = e.target.value;
                                                            setTypeData({...typeData, links: newLinks});
                                                        }} placeholder="https://..." /></div>
                                                    </div>
                                                ))}
                                                <button className="btn-nav-prev" style={{ width: '100%', borderStyle: 'dashed' }} onClick={() => setTypeData({...typeData, links: [...typeData.links, { id: Date.now(), label: '', url: '' }]})}>+ Ajouter un lien</button>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* 4. vCard */}
                                {selectedType === 'vcard' && (
                                    <>
                                        {renderAccordion('main', '👤', 'Coordonnées personnelles', 'Nom, téléphone et email.', (
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                    <div className="field"><label>Prénom</label><input type="text" onChange={e => setTypeData({...typeData, fn: e.target.value})} /></div>
                                                    <div className="field"><label>Nom</label><input type="text" /></div>
                                                </div>
                                                <div className="field"><label>Téléphone</label><input type="tel" placeholder="+229..." /></div>
                                                <div className="field"><label>Email</label><input type="email" placeholder="nom@exemple.com" /></div>
                                            </div>
                                        ))}
                                    </>
                                )}

                                {/* 5. Entreprise */}
                                {selectedType === 'business' && (
                                    <>
                                        {renderAccordion('main', '🏢', 'Informations de l\'entreprise', 'Détails de votre établissement.', (
                                            <div style={{ marginTop: '20px' }}>
                                                <div className="field"><label>Nom de l'entreprise</label><input type="text" placeholder="Ex: Ma Boutique" /></div>
                                                <div className="field"><label>Description</label><textarea placeholder="À propos de nous..." /></div>
                                            </div>
                                        ))}
                                        {renderAccordion('hours', '⏰', 'Horaires d\'ouverture', 'Indiquez quand vous êtes ouvert.', (
                                            <div style={{ marginTop: '20px' }}>
                                                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => (
                                                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                        <span style={{ width: '80px', fontSize: '13px', fontWeight: '600' }}>{day}</span>
                                                        <input type="time" style={{ padding: '8px' }} />
                                                        <span>à</span>
                                                        <input type="time" style={{ padding: '8px' }} />
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                )}

                                {selectedType !== 'url' && <AppearanceSection />}
                                <CommonFields />
                            </div>
                        )}

                        {step === 3 && (
                            <div>
                                <h2 style={{ fontSize: '24px', marginBottom: '32px', fontWeight: '800' }}>3. Choisissez l'apparence du QR</h2>
                                {renderAccordion('pattern', '⬛', 'Motif du code QR', 'Choisissez un motif.', (
                                    <div style={{ marginTop: '20px' }}>
                                        <div className="field">
                                            <label>Style de motif</label>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                                {['rounded', 'dots', 'classy', 'square'].map(s => (
                                                    <div key={s} onClick={() => setQrAppearance({...qrAppearance, dotsType: s})} style={{ aspectRatio: '1', border: qrAppearance.dotsType === s ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>{s}</div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="field"><label>Couleur du motif</label><input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} /></div>
                                    </div>
                                ))}
                                {renderAccordion('corners', '🔳', 'Coins du code QR', 'Style des coins.', (
                                    <div className="field" style={{ marginTop: '20px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                                            {['square', 'extra-rounded', 'dot'].map(s => (
                                                <div key={s} onClick={() => setQrAppearance({...qrAppearance, cornersType: s})} style={{ aspectRatio: '1', border: qrAppearance.cornersType === s ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>{s}</div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '40px', padding: '24px 0', borderTop: '1px solid #E2E8F0' }}>
                            <button className="btn-nav-prev" onClick={() => step > 1 ? setStep(step - 1) : navigate('/admin')}>← Retour</button>
                            {step < 3 ? (
                                <button className="btn-nav-next" onClick={() => setStep(step + 1)}>Suivant →</button>
                            ) : (
                                <button className="btn-nav-next" onClick={handleFinalize} disabled={generating}>{generating ? 'Création...' : 'Créer le QR ✓'}</button>
                            )}
                        </div>
                    </div>

                    <div className="phone-preview-container">
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <button style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: '700', fontSize: '13px' }}>Code QR</button>
                            <button style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #E2E8F0', background: 'white', color: '#64748B', fontWeight: '700', fontSize: '13px' }}>Aperçu</button>
                        </div>
                        <PhonePreview>
                            <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%' }}>
                                <div ref={qrRef} style={{ background: 'white', padding: '10px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom: '32px' }}></div>
                                {selectedType !== 'url' && (
                                    <div style={{ width: '100%', textAlign: 'left' }}>
                                        <div style={{ height: '120px', background: typeData.primaryColor, borderRadius: '20px', marginBottom: '-40px' }}></div>
                                        <div style={{ width: '80px', height: '80px', background: '#eee', borderRadius: '50%', border: '4px solid white', marginLeft: '20px', position: 'relative' }}></div>
                                        <div style={{ padding: '10px 20px' }}>
                                            <h4 style={{ fontWeight: '900', color: '#1A1265' }}>{cardName || 'Sans titre'}</h4>
                                            <p style={{ fontSize: '12px', color: '#94A3B8' }}>{typeData.description || 'Description du profil'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </PhonePreview>
                    </div>
                </div>
            </div>
        </div>
    );
}