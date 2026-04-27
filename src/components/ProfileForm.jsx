// src/components/ProfileForm.jsx
import { useRef } from 'react';

const SOCIAL_FIELDS = [
    { key: 'whatsapp', label: 'WhatsApp', placeholder: '+229 XX XX XX XX', icon: '💬', type: 'tel' },
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/monprofil', icon: '📸', type: 'url' },
    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/monprofil', icon: '👥', type: 'url' },
    { key: 'tiktok', label: 'TikTok', placeholder: 'https://tiktok.com/@monprofil', icon: '🎵', type: 'url' },
    { key: 'twitter', label: 'X / Twitter', placeholder: 'https://x.com/monprofil', icon: '🐦', type: 'url' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/monprofil', icon: '💼', type: 'url' },
    { key: 'youtube', label: 'YouTube', placeholder: 'https://youtube.com/@monprofil', icon: '▶️', type: 'url' },
    { key: 'website', label: 'Site web', placeholder: 'https://monsite.com', icon: '🌐', type: 'url' },
    { key: 'email', label: 'Email', placeholder: 'mon@email.com', icon: '✉️', type: 'email' },
    { key: 'phone', label: 'Téléphone', placeholder: '+229 XX XX XX XX', icon: '📞', type: 'tel' },
];

export default function ProfileForm({
    form,
    onChange,
    onUploadAvatar,
    onUploadBanner,
    uploadingAvatar = false,
    uploadingBanner = false,
    readOnly = false
}) {
    const avatarRef = useRef();
    const bannerRef = useRef();

    function update(key, value) {
        if (!readOnly) onChange({ ...form, [key]: value });
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Bannière */}
            <div style={{ position: 'relative', marginBottom: '40px' }}>
                <div
                    onClick={() => !readOnly && bannerRef.current?.click()}
                    style={{
                        height: '160px',
                        borderRadius: '16px',
                        background: form.banner_url
                            ? `url(${form.banner_url}) center/cover no-repeat`
                            : (form.theme_color || 'var(--primary)'),
                        cursor: readOnly ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border)',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {!readOnly && (
                        <div style={{ 
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: uploadingBanner ? 1 : 0, transition: 'opacity 0.2s'
                        }} className="hover-show">
                            <span style={{ color: 'white', fontSize: '14px', fontWeight: '600', background: 'rgba(0,0,0,0.5)', padding: '8px 16px', borderRadius: '20px' }}>
                                {uploadingBanner ? 'Chargement...' : 'Changer la bannière'}
                            </span>
                        </div>
                    )}
                </div>
                <input
                    ref={bannerRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && onUploadBanner(e.target.files[0])}
                />

                {/* Avatar */}
                <div style={{ position: 'absolute', bottom: '-30px', left: '24px' }}>
                    <div
                        onClick={() => !readOnly && avatarRef.current?.click()}
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            border: '4px solid white',
                            cursor: readOnly ? 'default' : 'pointer',
                            overflow: 'hidden',
                            background: form.photo_url
                                ? `url(${form.photo_url}) center/cover`
                                : '#E2E8F0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            position: 'relative'
                        }}
                    >
                        {!form.photo_url && !uploadingAvatar && <span style={{ fontSize: '32px' }}>👤</span>}
                        {uploadingAvatar && <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>}
                    </div>
                    <input
                        ref={avatarRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => e.target.files[0] && onUploadAvatar(e.target.files[0])}
                    />
                </div>
            </div>

            {/* Champs du profil */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="field">
                    <label>Nom complet</label>
                    <input
                        type="text"
                        placeholder="Jean Dupont"
                        value={form.full_name || ''}
                        onChange={e => update('full_name', e.target.value)}
                        readOnly={readOnly}
                    />
                </div>

                <div className="field">
                    <label>Titre / Poste</label>
                    <input
                        type="text"
                        placeholder="Ex: Designer, Entrepreneur..."
                        value={form.title || ''}
                        onChange={e => update('title', e.target.value)}
                        readOnly={readOnly}
                    />
                </div>

                <div className="field" style={{ gridColumn: 'span 2' }}>
                    <label>Biographie</label>
                    <textarea
                        rows={3}
                        placeholder="Parlez-nous de vous..."
                        value={form.bio || ''}
                        onChange={e => update('bio', e.target.value)}
                        readOnly={readOnly}
                    />
                </div>
            </div>

            <div style={{ marginTop: '12px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>Réseaux Sociaux</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {SOCIAL_FIELDS.map(field => (
                        <div key={field.key} className="field">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>{field.icon}</span> {field.label}
                            </label>
                            <input
                                type={field.type}
                                placeholder={field.placeholder}
                                value={form[field.key] || ''}
                                onChange={e => update(field.key, e.target.value)}
                                readOnly={readOnly}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="field">
                <label>Couleur d'accentuation</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input 
                        type="color" 
                        value={form.theme_color || '#28C254'} 
                        onChange={e => update('theme_color', e.target.value)} 
                        style={{ width: '50px', height: '50px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer' }} 
                    />
                    <input 
                        type="text" 
                        value={form.theme_color || '#28C254'} 
                        onChange={e => update('theme_color', e.target.value)} 
                        style={{ flex: 1, fontFamily: 'monospace' }} 
                        placeholder="#HEXCODE"
                    />
                </div>
            </div>
        </div>
    );
}