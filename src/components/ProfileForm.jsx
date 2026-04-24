// src/components/ProfileForm.jsx
// Ce formulaire est pour la PAGE PUBLIQUE (type profile uniquement)
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
        <>
            {/* Bannière */}
            <div style={{ position: 'relative', marginBottom: '60px' }}>
                <div
                    onClick={() => !readOnly && bannerRef.current?.click()}
                    style={{
                        height: '140px',
                        borderRadius: 'var(--radius-md)',
                        background: form.banner_url
                            ? `url(${form.banner_url}) center/cover no-repeat`
                            : (form.theme_color || 'var(--accent)'),
                        cursor: readOnly ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px dashed rgba(255,255,255,0.3)',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {!form.banner_url && !readOnly && (
                        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                            {uploadingBanner ? '⏳ Upload...' : '📷 Ajouter une bannière'}
                        </span>
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
                <div style={{ position: 'absolute', bottom: '-48px', left: '20px' }}>
                    <div
                        onClick={() => !readOnly && avatarRef.current?.click()}
                        style={{
                            width: '96px', height: '96px', borderRadius: '50%',
                            border: '4px solid white',
                            cursor: readOnly ? 'default' : 'pointer',
                            overflow: 'hidden',
                            background: form.photo_url
                                ? `url(${form.photo_url}) center/cover`
                                : 'var(--accent-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            boxShadow: 'var(--shadow)',
                        }}
                    >
                        {!form.photo_url && (uploadingAvatar ? '⏳' : '👤')}
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

            {/* Champs du profil public */}
            <div className="field">
                <label>Nom complet *</label>
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
                    placeholder="Ex: Designer Graphique, Entrepreneur..."
                    value={form.title || ''}
                    onChange={e => update('title', e.target.value)}
                    readOnly={readOnly}
                />
            </div>

            <div className="field">
                <label>Bio</label>
                <textarea
                    rows={3}
                    placeholder="Décrivez-vous en quelques mots..."
                    value={form.bio || ''}
                    onChange={e => update('bio', e.target.value)}
                    readOnly={readOnly}
                    style={{ resize: 'vertical' }}
                />
            </div>

            {/* Liens sociaux */}
            <h3 style={{ fontWeight: '700', marginTop: '24px', marginBottom: '16px', color: 'var(--accent)' }}>
                🔗 Liens sociaux
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-light)', marginBottom: '16px' }}>
                Remplissez uniquement les liens que vous souhaitez afficher sur votre page publique.
            </p>

            {SOCIAL_FIELDS.map(field => (
                <div key={field.key} className="field">
                    <label>{field.icon} {field.label}</label>
                    <input
                        type={field.type}
                        placeholder={field.placeholder}
                        value={form[field.key] || ''}
                        onChange={e => update(field.key, e.target.value)}
                        readOnly={readOnly}
                    />
                </div>
            ))}

            {/* Couleur thème */}
            <div className="field">
                <label>Couleur thème</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <input type="color" value={form.theme_color || '#1A1265'} onChange={e => update('theme_color', e.target.value)} style={{ width: '48px' }} />
                    <input type="text" value={form.theme_color || '#1A1265'} onChange={e => update('theme_color', e.target.value)} style={{ flex: 1, fontFamily: 'monospace' }} />
                </div>
            </div>
        </>
    );
}