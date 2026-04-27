// src/pages/Login.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, Link } from 'react-router-dom'

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
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error;

            // Admin check
            if (email === 'nfcrafter@gmail.com') {
                navigate('/admin')
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError(err.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : err.message)
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            padding: '20px'
        }}>
            <div className="premium-card" style={{
                padding: '48px 40px', width: '100%', maxWidth: '440px',
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '48px', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-900)', margin: 0 }}>
                        QR <span style={{ color: 'var(--primary)' }}>CRAFTER</span>
                    </h1>
                    <p style={{ color: 'var(--text-500)', fontSize: '15px', marginTop: '8px' }}>
                        Connectez-vous à votre espace
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
                            background: '#FEF2F2', border: '1px solid #FECACA',
                            color: '#DC2626', borderRadius: '12px',
                            padding: '12px 16px', fontSize: '14px', marginBottom: '24px'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                        disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <p style={{ color: 'var(--text-500)', fontSize: '14px' }}>
                        Accès réservé. Si vous êtes client, <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700' }}>activez votre carte</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}