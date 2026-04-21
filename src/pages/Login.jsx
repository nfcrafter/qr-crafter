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
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '64px', width: 'auto', marginBottom: '12px' }} />
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'var(--accent)' }}>
                        NFCrafter
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