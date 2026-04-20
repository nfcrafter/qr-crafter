export default function SMSForm({ content, onChange }) {
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                💬 SMS
            </h3>
            <div className="field">
                <label>Numéro de téléphone *</label>
                <input type="tel" placeholder="+33 6 12 34 56 78"
                    value={content.phone || ''}
                    onChange={e => onChange({ ...content, phone: e.target.value })}
                />
            </div>
            <div className="field">
                <label>Message</label>
                <textarea rows={3} placeholder="Votre message pré-rempli..."
                    value={content.message || ''}
                    onChange={e => onChange({ ...content, message: e.target.value })}
                />
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Mon SMS"
                    value={content.name || ''}
                    onChange={e => onChange({ ...content, name: e.target.value })}
                />
            </div>
        </div>
    )
}