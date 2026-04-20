export default function VCardForm({ content, onChange }) {
    function update(key, val) {
        onChange({ ...content, [key]: val })
    }
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                👤 Carte de contact (vCard)
            </h3>
            <div className="field-row">
                <div className="field" style={{ margin: 0 }}>
                    <label>Prénom *</label>
                    <input type="text" placeholder="Jean" value={content.firstName || ''} onChange={e => update('firstName', e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                    <label>Nom *</label>
                    <input type="text" placeholder="Dupont" value={content.lastName || ''} onChange={e => update('lastName', e.target.value)} />
                </div>
            </div>
            <div className="field">
                <label>Téléphone</label>
                <input type="tel" placeholder="+33 6 12 34 56 78" value={content.phone || ''} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="field">
                <label>Email</label>
                <input type="email" placeholder="jean@example.com" value={content.email || ''} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="field-row">
                <div className="field" style={{ margin: 0 }}>
                    <label>Entreprise</label>
                    <input type="text" placeholder="Mon Entreprise" value={content.company || ''} onChange={e => update('company', e.target.value)} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                    <label>Poste / Titre</label>
                    <input type="text" placeholder="Directeur" value={content.title || ''} onChange={e => update('title', e.target.value)} />
                </div>
            </div>
            <div className="field">
                <label>Site web</label>
                <input type="url" placeholder="https://monsite.com" value={content.website || ''} onChange={e => update('website', e.target.value)} />
            </div>
            <div className="field">
                <label>Adresse</label>
                <input type="text" placeholder="1 Rue de la Paix, Paris" value={content.address || ''} onChange={e => update('address', e.target.value)} />
            </div>
            <div className="field">
                <label>Note</label>
                <textarea rows={2} placeholder="Une note..." value={content.note || ''} onChange={e => update('note', e.target.value)} />
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Ma carte de visite"
                    value={content.name || ''}
                    onChange={e => update('name', e.target.value)}
                />
            </div>
        </div>
    )
}