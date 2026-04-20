export default function TextForm({ content, onChange }) {
    const len = (content.text || '').length
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                📝 Texte libre
            </h3>
            <div className="field">
                <label>Texte *</label>
                <textarea rows={5} placeholder="Entrez votre texte..." maxLength={900}
                    value={content.text || ''}
                    onChange={e => onChange({ ...content, text: e.target.value, name: content.name })}
                    style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: '12px', color: len > 800 ? 'var(--error)' : 'var(--text-light)', textAlign: 'right', marginTop: '4px' }}>
                    {len} / 900
                </div>
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Mon texte"
                    value={content.name || ''}
                    onChange={e => onChange({ ...content, name: e.target.value })}
                />
            </div>
        </div>
    )
}