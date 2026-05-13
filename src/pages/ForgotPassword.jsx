// src/pages/ForgotPassword.jsx
import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast.jsx'
import { translateError } from '../lib/utils.js'

export default function ForgotPassword() {
    const navigate = useNavigate()
    const toast = useToast()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    async function handleReset(e) {
        e.preventDefault()
        setLoading(true)
        
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) throw error;
            setSubmitted(true)
            toast('Lien de réinitialisation envoyé !', 'success')
        } catch (err) {
            console.error('Password reset error:', err)
            toast(translateError(err.message), 'error')
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div style={{
                minHeight: '100vh', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%)',
                position: 'relative', overflow: 'hidden',
                padding: '20px'
            }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40vw', height: '40vw', background: '#3B82F6', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '-5%', width: '35vw', height: '35vw', background: '#8B5CF6', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>
                
                <div className="animate-fade-in" style={{
                    padding: '48px 40px', width: '100%', maxWidth: '440px',
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    boxShadow: '0 40px 80px rgba(0,0,0,0.07), inset 0 0 0 1px rgba(255,255,255,0.5)',
                    position: 'relative', zIndex: 10,
                    textAlign: 'center'
                }}>
                    <div style={{ width: '80px', height: '80px', background: '#ECFDF5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: '#10B981' }}>
                        <div style={{ width: 40, height: 40 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>` }} />
                    </div>
                    <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#111827', marginBottom: '16px', fontFamily: 'Outfit' }}>
                        Vérifiez vos emails
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                        Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>. 
                        N'oubliez pas de vérifier vos courriers indésirables.
                    </p>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '16px', 
                            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: 'white', 
                            fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                        }}
                    >
                        Retour à la connexion
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%)',
            position: 'relative', overflow: 'hidden',
            padding: '20px'
        }}>
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
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', color: '#111827', margin: 0, fontFamily: 'Outfit' }}>
                        Mot de passe oublié
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', marginTop: '8px' }}>
                        Entrez votre email pour réinitialiser votre mot de passe
                    </p>
                </div>

                <form onSubmit={handleReset}>
                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Email</label>
                        <input type="email" placeholder="votre@email.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            required autoFocus
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                        />
                    </div>

                    <button type="submit" 
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '16px', 
                            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: 'white', 
                            fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                        }}
                        disabled={loading}>
                        {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center' }}>
                    <button 
                        onClick={() => navigate('/login')}
                        style={{ background: 'none', border: 'none', color: '#64748B', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s' }}
                        onMouseOver={e => e.currentTarget.style.color = '#111827'}
                        onMouseOut={e => e.currentTarget.style.color = '#64748B'}
                    >
                        Retour à la connexion
                    </button>
                </div>
            </div>
        </div>
    )
}
