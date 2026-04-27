// src/pages/admin/CardSettings.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase.js';
import { useToast } from '../../components/Toast.jsx';
import QRCodeStyling from 'qr-code-styling';
import PhonePreview from '../../components/PhonePreview.jsx';

export default function CardSettings() {
    const { cardId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const qrRef = useRef(null);
    const qrCode = useRef(null);

    const [card, setCard] = useState(null);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [expandedAccordion, setExpandedAccordion] = useState('main');

    const [cardName, setCardName] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState(null);
    const [typeData, setTypeData] = useState({});
    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded', dotsColor: '#000000', bgColor: '#FFFFFF',
        cornersType: 'extra-rounded', cornersColor: '#000000',
        logo_url: null
    });

    useEffect(() => {
        loadCard();
        loadFolders();
    }, [cardId]);

    async function loadCard() {
        setLoading(true);
        const { data, error } = await supabase.from('cards').select('*').eq('card_id', cardId).single();
        if (error || !data) {
            toast('Carte introuvable', 'error');
            navigate('/admin');
            return;
        }
        setCard(data);
        setCardName(data.card_name || '');
        setSelectedFolderId(data.folder_id);
        setTypeData(data.type_data || {});
        if (data.qr_appearance) setQrAppearance(data.qr_appearance);
        setLoading(false);
    }

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at');
        setFolders(data || []);
    }

    useEffect(() => {
        if (qrRef.current && card) {
            const data = formatQRData();
            if (!qrCode.current) initQRCode(data);
            else updateQRCode(data);
        }
    }, [qrAppearance, card, typeData]);

    function formatQRData() {
        const profileUrl = `${window.location.origin}/u/${cardId}`;
        const selectedType = typeData.qr_type || 'url';
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
            cornersSquareOptions: { color: qrAppearance.cornersColor, type: qrAppearance.cornersType },
            image: qrAppearance.logo_url || '',
        });
    }

    async function saveChanges() {
        setSaving(true);
        try {
            const { error } = await supabase.from('cards').update({
                card_name: cardName,
                folder_id: selectedFolderId,
                qr_appearance: qrAppearance,
                type_data: typeData,
                updated_at: new Date().toISOString()
            }).eq('card_id', cardId);
            if (error) throw error;
            toast('Modifications enregistrées !', 'success');
        } catch (err) { toast(err.message, 'error'); } 
        finally { setSaving(false); }
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

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px 20px' }}>
            <div className="max-w-wrapper">
                <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', fontWeight: '800', cursor: 'pointer', color: '#1A1265' }}>← Retour</button>
                        <h1 style={{ fontSize: '22px', fontWeight: '900', color: '#1A1265' }}>Modifier le Projet</h1>
                    </div>
                    <button className="btn-nav-next" onClick={saveChanges} disabled={saving}>{saving ? 'Enregistrement...' : 'Enregistrer ✓'}</button>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '60px', alignItems: 'start' }}>
                    <div className="animate-fade-in">
                        <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: '800', color: 'var(--accent)' }}>Configuration & Contenu</h2>
                        
                        {renderAccordion('main', '🌐', 'Lien / Destination', 'Gérez le contenu de votre QR.', (
                            <div className="field" style={{ marginTop: '20px' }}>
                                <label>URL du site internet</label>
                                <input type="url" value={typeData.url || ''} onChange={e => setTypeData({...typeData, url: e.target.value})} />
                            </div>
                        ))}

                        {renderAccordion('name', '🏷️', 'Nom & Dossier', 'Organisation de votre projet.', (
                            <div style={{ marginTop: '20px' }}>
                                <div className="field"><label>Nom du projet</label><input type="text" value={cardName} onChange={e => setCardName(e.target.value)} /></div>
                                <div className="field">
                                    <label>Dossier</label>
                                    <select value={selectedFolderId || ''} onChange={e => setSelectedFolderId(e.target.value)}>
                                        <option value="">Sans dossier</option>
                                        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                            </div>
                        ))}

                        <h2 style={{ fontSize: '18px', marginBottom: '24px', marginTop: '40px', fontWeight: '800', color: 'var(--accent)' }}>Design & Personnalisation</h2>

                        {renderAccordion('pattern', '⬛', 'Motif & Couleurs', 'Personnalisez le visuel.', (
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
                                    <label>Couleur</label>
                                    <input type="color" value={qrAppearance.dotsColor} onChange={e => setQrAppearance({...qrAppearance, dotsColor: e.target.value})} />
                                </div>
                            </div>
                        ))}

                        {renderAccordion('corners', '🔳', 'Styles des coins', 'Sélectionnez le style de coins.', (
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
                                    <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>Modifications en direct</p>
                                </div>
                            </div>
                        </PhonePreview>
                    </div>
                </div>
            </div>
        </div>
    );
}