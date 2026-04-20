import { useNavigate, useLocation } from 'react-router-dom'

export default function Sidebar() {
    const navigate = useNavigate()
    const location = useLocation()

    const links = [
        { icon: '＋', label: 'Créer un code QR', path: '/create' },
        { icon: '▣', label: 'Mes codes QR', path: '/' },
    ]

    return (
        <aside style={{
            width: '220px', minHeight: '100vh', background: 'var(--bg-white)',
            borderRight: '1px solid var(--border)', padding: '24px 16px',
            display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0,
        }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="8" fill="#1A1265" />
                    <rect x="6" y="6" width="8" height="8" rx="1" fill="#EBEBDF" />
                    <rect x="18" y="6" width="8" height="8" rx="1" fill="#EBEBDF" />
                    <rect x="6" y="18" width="8" height="8" rx="1" fill="#EBEBDF" />
                    <rect x="18" y="18" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                    <rect x="23" y="18" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                    <rect x="18" y="23" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                    <rect x="23" y="23" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                </svg>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                    QR Crafter
                </span>
            </div>

            {links.map(link => (
                <button key={link.path} onClick={() => navigate(link.path)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        border: 'none', cursor: 'pointer', fontSize: '14px',
                        fontFamily: 'var(--font-body)', fontWeight: '500',
                        background: location.pathname === link.path ? 'var(--accent-light)' : 'transparent',
                        color: location.pathname === link.path ? 'var(--accent)' : 'var(--text-light)',
                        transition: 'all 0.2s', textAlign: 'left', width: '100%',
                    }}>
                    <span>{link.icon}</span>
                    {link.label}
                </button>
            ))}
        </aside>
    )
}