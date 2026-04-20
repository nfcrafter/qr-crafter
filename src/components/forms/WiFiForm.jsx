import { useState } from 'react'
export default function WiFiForm({ content, onChange }) {
    const [showPass, setShowPass] = useState(false)
    return (
        <div className="card">
            <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', color: 'var(--accent)', marginBottom: '16px' }}>
                📶 Wi-Fi
            </h3>
            <div className="field">
                <label>Nom du réseau (SSID) *</label>
                <input type="text" placeholder="Par exemple : MonWiFi"
                    value={content.ssid || ''}
                    onChange={e => onChange({ ...content, ssid: e.target.value, name: content.name || e.target.value })}
                />
            </div>
            <div className="field">
                <label>Mot de passe</label>
                <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} placeholder="Mot de passe du réseau"
                        value={content.password || ''}
                        onChange={e => onChange({ ...content, password: e.target.value })}
                        style={{ paddingRight: '44px' }}
                    />
                    <button onClick={() => setShowPass(s => !s)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                        {showPass ? '🙈' : '👁'}
                    </button>
                </div>
            </div>
            <div className="field">
                <label>Type de chiffrement</label>
                <select value={content.security || 'WPA'}
                    onChange={e => onChange({ ...content, security: e.target.value })}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Aucun</option>
                </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <input type="checkbox" id="hidden" checked={content.hidden || false}
                    onChange={e => onChange({ ...content, hidden: e.target.checked })}
                    style={{ width: 'auto' }}
                />
                <label htmlFor="hidden" style={{ margin: 0 }}>Réseau caché</label>
            </div>
            <div className="field">
                <label>Nom du code QR</label>
                <input type="text" placeholder="Par exemple : WiFi Maison"
                    value={content.name || ''}
                    onChange={e => onChange({ ...content, name: e.target.value })}
                />
            </div>
        </div>
    )
}