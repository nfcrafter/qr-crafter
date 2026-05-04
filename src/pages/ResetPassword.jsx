// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../components/Toast.jsx'
import { translateError } from '../lib/utils.js'

export default function ResetPassword() {
    const navigate = useNavigate()
    const toast = useToast()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(true)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                setChecking(false)
            } else if (!session) {
                toast('Session invalide ou expirée', 'error')
                navigate('/login')
            } else {
                setChecking(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [navigate, toast])

    if (checking) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    async function handleUpdate(e) {
        e.preventDefault()
        
        if (password !== confirmPassword) {
            toast('Les mots de passe ne correspondent pas', 'error')
            return
        }

        if (password.length < 6) {
            toast('Le mot de passe doit faire au moins 6 caractères', 'error')
            return
        }

        setLoading(true)
        
        try {
            const { error } = await supabase.auth.updateUser({ password })
            if (error) throw error;
            
            // Sign out to force fresh login with new password
            await supabase.auth.signOut()
            
            toast('Mot de passe mis à jour avec succès !', 'success')
            navigate('/login')
        } catch (err) {
            toast(translateError(err.message), 'error')
        } finally {
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
                        Nouveau mot de passe
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', marginTop: '8px' }}>
                        Définissez votre nouveau mot de passe sécurisé
                    </p>
                </div>

                <form onSubmit={handleUpdate}>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Nouveau mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                                value={password} onChange={e => setPassword(e.target.value)}
                                required autoFocus
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

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Confirmer le mot de passe</label>
                        <div style={{ position: 'relative' }}>
                            <input type={showConfirm ? "text" : "password"} placeholder="••••••••"
                                value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                required
                                style={{ width: '100%', padding: '16px', paddingRight: '50px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                                onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                style={{
                                    position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                                    color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                {showConfirm ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" 
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '16px', 
                            background: 'linear-gradient(135deg, #4F46E5, #3B82F6)', color: 'white', 
                            fontSize: '16px', fontWeight: '800', border: 'none', cursor: 'pointer',
                            boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)', transition: 'all 0.2s'
                        }}
                        disabled={loading}>
                        {loading ? 'Mise à jour...' : 'Enregistrer le mot de passe'}
                    </button>
                </form>
            </div>
        </div>
    )
}
