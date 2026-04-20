const TYPES = [
    { id: 'url', icon: '🌐', label: 'Site internet', desc: 'Renvoyez vers l\'URL de n\'importe quel site' },
    { id: 'vcard', icon: '👤', label: 'vCard', desc: 'Partagez votre carte professionnelle' },
    { id: 'social', icon: '📣', label: 'Réseaux sociaux', desc: 'Partagez vos profils sociaux' },
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp', desc: 'Recevez des messages WhatsApp' },
    { id: 'wifi', icon: '📶', label: 'Wi-Fi', desc: 'Connectez-vous à un réseau Wi-Fi' },
    { id: 'text', icon: '📝', label: 'Texte', desc: 'Partagez un texte libre' },
    { id: 'email', icon: '✉️', label: 'Email', desc: 'Envoyez un email pré-rempli' },
    { id: 'phone', icon: '📞', label: 'Téléphone', desc: 'Lancez un appel téléphonique' },
    { id: 'sms', icon: '💬', label: 'SMS', desc: 'Envoyez un SMS pré-rempli' },
]

export default function Step1Type({ onSelect }) {
    return (
        <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--text)', marginBottom: '24px' }}>
                1. Sélectionnez un type de code QR
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px',
            }}>
                {TYPES.map(type => (
                    <button key={type.id} onClick={() => onSelect(type.id)}
                        style={{
                            background: 'var(--bg-white)', border: '1.5px solid var(--border)',
                            borderRadius: 'var(--radius-lg)', padding: '28px 20px',
                            cursor: 'pointer', textAlign: 'center',
                            transition: 'all 0.2s', display: 'flex',
                            flexDirection: 'column', alignItems: 'center', gap: '12px',
                            boxShadow: 'var(--shadow)',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.borderColor = 'var(--accent)'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.borderColor = 'var(--border)'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'var(--shadow)'
                        }}
                    >
                        <span style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: 'var(--accent-light)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '24px',
                        }}>
                            {type.icon}
                        </span>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
                                {type.label}
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-light)', lineHeight: '1.4' }}>
                                {type.desc}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}