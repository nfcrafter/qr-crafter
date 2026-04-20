import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'

export default function Login() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
            setError('Email ou mot de passe incorrect')
            setLoading(false)
        } else {
            navigate('/')
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)',
        }}>
            <div style={{
                background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)',
                padding: '48px 40px', width: '100%', maxWidth: '420px',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <svg width="48" height="48" viewBox="0 0 32 32" fill="none" style={{ marginBottom: '12px' }}>
                        <rect width="32" height="32" rx="8" fill="#1A1265" />
                        <rect x="6" y="6" width="8" height="8" rx="1" fill="#EBEBDF" />
                        <rect x="18" y="6" width="8" height="8" rx="1" fill="#EBEBDF" />
                        <rect x="6" y="18" width="8" height="8" rx="1" fill="#EBEBDF" />
                        <rect x="18" y="18" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                        <rect x="23" y="18" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                        <rect x="18" y="23" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                        <rect x="23" y="23" width="3" height="3" rx="0.5" fill="#EBEBDF" />
                    </svg>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>
                        QR Crafter
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
                        Connectez-vous pour accéder à votre espace
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="field">
                        <label>Email</label>
                        <input type="email" placeholder="votre@email.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required autoFocus
                        />
                    </div>
                    <div className="field">
                        <label>Mot de passe</label>
                        <input type="password" placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: '#fff5f5', border: '1px solid #fed7d7',
                            color: 'var(--error)', borderRadius: 'var(--radius-sm)',
                            padding: '10px 14px', fontSize: '13px', marginBottom: '16px',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
                        disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>
            </div>
        </div>
    )
}