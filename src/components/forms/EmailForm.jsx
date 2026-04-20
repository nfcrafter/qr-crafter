export default function EmailForm({ content, onChange }) {
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                ✉️ Email
            </h3>
            <div className="field">
                <label>Destinataire *</label>
                <input type="email" placeholder="user@example.com"
                    value={content.to || ''}
                    onChange={e => onChange({ ...content, to: e.target.value, name: content.name || e.target.value })}
                />
            </div>
            <div className="field">
                <label>Sujet</label>
                <input type="text" placeholder="Sujet de l'email"
                    value={content.subject || ''}
                    onChange={e => onChange({ ...content, subject: e.target.value })}
                />
            </div>
            <div className="field">
                <label>Message</label>
                <textarea rows={4} placeholder="Corps du message..."
                    value={content.body || ''}
                    onChange={e => onChange({ ...content, body: e.target.value })}
                />
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Mon email"
                    value={content.name || ''}
                    onChange={e => onChange({ ...content, name: e.target.value })}
                />
            </div>
        </div>
    )
}