const PLATFORMS = [
    { id: 'instagram', label: 'Instagram', prefix: 'https://instagram.com/' },
    { id: 'facebook', label: 'Facebook', prefix: 'https://facebook.com/' },
    { id: 'tiktok', label: 'TikTok', prefix: 'https://tiktok.com/@' },
    { id: 'linkedin', label: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
    { id: 'twitter', label: 'X / Twitter', prefix: 'https://x.com/' },
    { id: 'youtube', label: 'YouTube', prefix: 'https://youtube.com/@' },
    { id: 'snapchat', label: 'Snapchat', prefix: 'https://snapchat.com/add/' },
    { id: 'pinterest', label: 'Pinterest', prefix: 'https://pinterest.com/' },
    { id: 'threads', label: 'Threads', prefix: 'https://threads.net/@' },
    { id: 'github', label: 'GitHub', prefix: 'https://github.com/' },
]

export default function SocialForm({ content, onChange }) {
    function update(key, val) {
        onChange({ ...content, [key]: val })
    }
    const platform = PLATFORMS.find(p => p.id === content.platform) || PLATFORMS[0]

    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                📣 Réseaux sociaux
            </h3>
            <div className="field">
                <label>Plateforme *</label>
                <select value={content.platform || 'instagram'}
                    onChange={e => update('platform', e.target.value)}>
                    {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                </select>
            </div>
            <div className="field">
                <label>Nom d'utilisateur ou URL *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                    <span style={{
                        padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRight: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                        fontSize: '12px', color: 'var(--text-light)', whiteSpace: 'nowrap',
                    }}>
                        {platform.prefix}
                    </span>
                    <input type="text" placeholder="monprofil"
                        value={content.username || ''}
                        onChange={e => {
                            const username = e.target.value
                            update('username', username)
                            onChange({ ...content, username, url: platform.prefix + username, name: content.name || username })
                        }}
                        style={{ borderRadius: '0 var(--radius-sm) var(--radius-sm) 0' }}
                    />
                </div>
            </div>
            <div className="field">
                <label>Nom affiché (optionnel)</label>
                <input type="text" placeholder="Mon Nom" value={content.name || ''} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="field">
                <label>Téléphone (optionnel — pour enregistrer le contact)</label>
                <input type="tel" placeholder="+33 6 12 34 56 78" value={content.phone || ''} onChange={e => update('phone', e.target.value)} />
            </div>
            <div className="field">
                <label>Email (optionnel — pour enregistrer le contact)</label>
                <input type="email" placeholder="contact@example.com" value={content.email || ''} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : Mon Instagram"
                    value={content.name || ''}
                    onChange={e => update('name', e.target.value)}
                />
            </div>
        </div>
    )
}