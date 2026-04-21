import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

    async function handleRegister(e) {
        e.preventDefault()
        setError('')
        if (form.password !== form.confirm) {
            setError('Les mots de passe ne correspondent pas')
            return
        }
        if (form.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères')
            return
        }
        setLoading(true)
        const { data, error } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.fullName } }
        })
        if (error) {
            setError(error.message)
            setLoading(false)
            return
        }
        // Créer le profil
        if (data.user) {
            await supabase.from('profiles').insert({
                id: data.user.id,
                full_name: form.fullName,
                email: form.email,
            })
        }
        setLoading(false)
        navigate('/dashboard')
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'var(--bg)',
        }}>
            <div style={{
                background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)',
                padding: '48px 40px', width: '100%', maxWidth: '440px',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)',
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '56px', width: 'auto', marginBottom: '12px' }} />
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--accent)' }}>
                        Créer mon compte
                    </h1>
                    <p style={{ color: 'var(--text-light)', fontSize: '14px', marginTop: '4px' }}>
                        Gérez votre carte NFCrafter
                    </p>
                </div>

                <form onSubmit={handleRegister}>
                    <div className="field">
                        <label>Nom complet *</label>
                        <input type="text" placeholder="Jean Dupont"
                            value={form.fullName}
                            onChange={e => update('fullName', e.target.value)}
                            required autoFocus
                        />
                    </div>
                    <div className="field">
                        <label>Email *</label>
                        <input type="email" placeholder="jean@example.com"
                            value={form.email}
                            onChange={e => update('email', e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Mot de passe *</label>
                        <input type="password" placeholder="Minimum 6 caractères"
                            value={form.password}
                            onChange={e => update('password', e.target.value)}
                            required
                        />
                    </div>
                    <div className="field">
                        <label>Confirmer le mot de passe *</label>
                        <input type="password" placeholder="Répétez le mot de passe"
                            value={form.confirm}
                            onChange={e => update('confirm', e.target.value)}
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
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-light)' }}>
                    Déjà un compte ?{' '}
                    <Link to="/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>
                        Se connecter
                    </Link>
                </p>
            </div>
        </div>
    )
}