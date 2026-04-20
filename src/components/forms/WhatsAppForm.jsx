export default function WhatsAppForm({ content, onChange }) {
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                💬 WhatsApp
            </h3>
            <div className="field">
                <label>Numéro de téléphone *</label>
                <input type="tel" placeholder="+33 6 12 34 56 78"
                    value={content.phone || ''}
                    onChange={e => onChange({ ...content, phone: e.target.value })}
                />
            </div>
            <div className="field">
                <label>Message pré-rempli (optionnel)</label>
                <textarea rows={3} placeholder="Écrivez votre message..."
                    value={content.message || ''}
                    onChange={e => onChange({ ...content, message: e.target.value })}
                />
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Mon WhatsApp"
                    value={content.name || ''}
                    onChange={e => onChange({ ...content, name: e.target.value })}
                />
            </div>
        </div>
    )
}