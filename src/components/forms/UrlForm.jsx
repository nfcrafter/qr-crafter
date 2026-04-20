export default function UrlForm({ content, onChange }) {
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                🌐 Informations sur le site internet
            </h3>
            <div className="field">
                <label>URL du site internet *</label>
                <input type="url" placeholder="Par exemple https://www.monsite.com/"
                    value={content.url || ''}
                    onChange={e => {
                        let val = e.target.value
                        if (val && !val.startsWith('http')) val = 'https://' + val
                        onChange({ ...content, url: val })
                    }}
                />
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Mon code QR"
                    value={content.name || ''}
                    onChange={e => onChange({ ...content, name: e.target.value })}
                />
            </div>
        </div>
    )
}