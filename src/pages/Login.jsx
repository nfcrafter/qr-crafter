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
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            padding: '20px'
        }}>
            <div className="premium-card" style={{
                padding: '48px 40px', width: '100%', maxWidth: '440px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{ 
                        width: '48px', height: '48px', background: 'var(--primary)', 
                        borderRadius: '12px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', color: 'white', fontWeight: 'bold', 
                        fontSize: '24px', margin: '0 auto 16px',
                        boxShadow: '0 8px 16px rgba(40, 194, 84, 0.2)'
                    }}>Q</div>
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-900)', margin: 0 }}>
                        QR CRAFTER
                    </h1>
                    <p style={{ color: 'var(--text-500)', fontSize: '15px', marginTop: '8px' }}>
                        Connectez-vous à votre espace personnel
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div className="field">
                        <label style={{ fontWeight: '600', color: 'var(--text-700)' }}>Email</label>
                        <input type="email" placeholder="votre@email.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required autoFocus
                        />
                    </div>
                    <div className="field">
                        <label style={{ fontWeight: '600', color: 'var(--text-700)' }}>Mot de passe</label>
                        <input type="password" placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{
                            background: '#FEF2F2', border: '1px solid #FECACA',
                            color: '#DC2626', borderRadius: '12px',
                            padding: '12px 16px', fontSize: '14px', marginBottom: '24px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <button type="submit" className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
                        disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <p style={{ color: 'var(--text-500)', fontSize: '14px' }}>
                        Pas encore de compte ? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>Activez votre carte</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}