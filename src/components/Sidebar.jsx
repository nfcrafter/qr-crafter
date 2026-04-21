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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px', paddingLeft: '8px' }}>
                <img src="/logo.png" alt="NFCrafter" style={{ height: '32px', width: 'auto' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                    NFCrafter
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