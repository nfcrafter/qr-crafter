// src/pages/Login.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '../components/Toast.jsx'
import { translateError } from '../lib/utils.js'

export default function Login() {
    const navigate = useNavigate()
    const toast = useToast()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        setLoading(true)
        setError('')
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password })
            if (error) throw error;

            // Check for activation redirect
            const search = new URLSearchParams(window.location.search);
            const cardId = search.get('card') || search.get('cardId');
            const token = search.get('token');

            if (email === 'nfcrafter@gmail.com') {
                navigate('/admin')
            } else if (cardId && token) {
                navigate(`/activate?card=${cardId}&token=${token}`)
            } else {
                navigate('/dashboard')
            }
        } catch (err) {
            setError(translateError(err.message))
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%)',
            position: 'relative', overflow: 'hidden',
            padding: '20px'
        }}>
            {/* Orbs de fond */}
            <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: '#3B82F6', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', background: '#8B5CF6', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>
            
            <div className="animate-fade-in" style={{
                padding: '48px 40px', width: '100%', maxWidth: '440px',
                background: 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '32px',
                boxShadow: '0 40px 80px rgba(0,0,0,0.07), inset 0 0 0 1px rgba(255,255,255,0.5)',
                position: 'relative', zIndex: 10
            }}>
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ width: '64px', height: '64px', background: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '40px' }} />
                    </div>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', color: '#111827', margin: 0, fontFamily: 'Outfit' }}>
                        Bon retour
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', marginTop: '8px' }}>
                        Accédez à votre espace NFCrafter
                    </p>
                </div>

                <div style={{
                    background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px', padding: '12px 16px', marginBottom: '24px',
                    display: 'flex', alignItems: 'flex-start', gap: '12px'
                }}>
                    <div style={{ color: '#3B82F6', marginTop: '2px' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                        <strong>Accès privé :</strong> La connexion est exclusivement réservée aux utilisateurs ayant acheté une carte ou un profil digital NFCrafter.
                    </p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Email</label>
                        <input type="email" placeholder="votre@email.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required autoFocus
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                        />
                    </div>
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                    color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            background: '#FEF2F2', border: '1px solid #FECACA',
                            color: '#DC2626', borderRadius: '12px',
                            padding: '12px 16px', fontSize: '14px', marginBottom: '24px',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <div style={{ width: 14, height: 14, color: '#DC2626' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>` }} /> {error}
                        </div>
                    )}

                    <button type="submit" 
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '16px', 
                            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: 'white', 
                            fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(79, 70, 229, 0.4)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(79, 70, 229, 0.3)'; }}
                        disabled={loading}>
                        {loading ? 'Connexion en cours...' : 'Se connecter'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button 
                        onClick={() => navigate('/forgot-password')}
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#111827'}
                        onMouseOut={e => e.currentTarget.style.color = '#64748B'}
                    >
                        Mot de passe oublié ?
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onMouseOver={e => e.currentTarget.style.color = '#4B5563'}
                        onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                        <div style={{ width: 14, height: 14 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>` }} /> Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    )
}