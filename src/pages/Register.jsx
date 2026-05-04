import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { translateError } from '../lib/utils.js'

export default function Register() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cardId = searchParams.get('card') || searchParams.get('cardId')
    const token = searchParams.get('token')

    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [cardInfo, setCardInfo] = useState(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        if (cardId && token) verifyCard()
    }, [cardId, token])

    async function verifyCard() {
        const { data } = await supabase
            .from('cards')
            .select('*')
            .eq('card_id', cardId)
            .eq('activation_token', token)
            .single()
        if (data) setCardInfo(data)
    }

    function update(k, v) { setForm(f => ({ ...f, [k]: v })) }

    async function handleRegister(e) {
        e.preventDefault()
        setError('')

        if (!cardId || !token || !cardInfo) {
            setError("Vous devez posséder un lien d'activation valide pour créer un compte.")
            return
        }

        if (form.password !== form.confirm) {
            setError('Les mots de passe ne correspondent pas')
            return
        }
        if (form.password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères')
            return
        }
        if (!form.fullName.trim()) {
            setError('Le nom complet est obligatoire')
            return
        }

        setLoading(true)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: form.email,
            password: form.password,
            options: { data: { full_name: form.fullName } }
        })

        if (signUpError) {
            setError(translateError(signUpError.message))
            setLoading(false)
            return
        }

        if (data.user) {
            const adminProfile = cardInfo?.admin_profile || {}
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: form.fullName,
                email: form.email,
                card_id: cardId || null,
                ...adminProfile,
            })

            await supabase.from('cards')
                .update({ 
                    owner_id: data.user.id, 
                    status: 'active',
                    activation_token: null
                })
                .eq('card_id', cardId)
                .eq('activation_token', token)

            await supabase.from('user_cards').upsert({
                user_id: data.user.id,
                card_id: cardId,
                profile_name: form.fullName,
            })
        }

        setLoading(false)
        navigate('/dashboard')
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #E0E7FF 100%)',
            position: 'relative', overflow: 'hidden',
            padding: '40px 20px'
        }}>
            {/* Orbs de fond */}
            <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw', background: '#4F46E5', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>
            <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '35vw', height: '35vw', background: '#EC4899', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.15 }}></div>

            <div className="animate-fade-in" style={{
                padding: '48px 40px', width: '100%', maxWidth: '500px',
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
                    <h1 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px', color: '#111827', margin: 0, fontFamily: 'Outfit' }}>
                        {cardId ? 'ACTIVER MA CARTE' : 'CRÉER MON COMPTE'}
                    </h1>
                    
                    {cardId && cardInfo && (
                        <div style={{
                            marginTop: '16px', padding: '12px 16px',
                            background: 'rgba(22, 163, 74, 0.1)', borderRadius: '16px',
                            fontSize: '14px', color: '#166534', fontWeight: '700',
                            border: '1px solid rgba(22, 163, 74, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span>✅</span> Carte #{cardId} reconnue
                        </div>
                    )}
                    
                    {cardId && !cardInfo && (
                        <div style={{
                            marginTop: '16px', padding: '12px 16px',
                            background: 'rgba(220, 38, 38, 0.1)', borderRadius: '16px',
                            fontSize: '14px', color: '#991B1B', fontWeight: '700',
                            border: '1px solid rgba(220, 38, 38, 0.2)', display: 'inline-flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span>⚠️</span> Lien invalide ou expiré
                        </div>
                    )}

                    {!cardId && (
                        <p style={{ color: '#64748B', fontSize: '15px', marginTop: '8px' }}>
                            Rejoignez la révolution des cartes de visite numériques
                        </p>
                    )}
                </div>

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Nom complet</label>
                        <input type="text" placeholder="Jean Dupont"
                            value={form.fullName} onChange={e => update('fullName', e.target.value)}
                            required autoFocus
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Email</label>
                        <input type="email" placeholder="jean@example.com"
                            value={form.email} onChange={e => update('email', e.target.value)}
                            required
                            style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                            onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Mot de passe</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••"
                                    value={form.password} onChange={e => update('password', e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '16px', paddingRight: '44px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                                    onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '13px', color: '#374151' }}>Confirmer</label>
                            <div style={{ position: 'relative' }}>
                                <input type={showConfirm ? "text" : "password"} placeholder="••••••••"
                                    value={form.confirm} onChange={e => update('confirm', e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '16px', paddingRight: '44px', borderRadius: '16px', border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.8)', fontSize: '15px', outline: 'none', transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}
                                    onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)'; }}
                                    onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', display: 'flex' }}>
                                    {showConfirm ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                    )}
                                </button>
                            </div>
                        </div>
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
                        {loading ? 'Création...' : cardId ? '🚀 Activer ma carte' : 'Créer mon compte'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>
                        Déjà un compte ?{' '}
                        <Link to={cardId ? `/activate?card=${cardId}&token=${token}` : '/login'}
                            style={{ color: '#4F46E5', fontWeight: '800', textDecoration: 'none' }}>
                            Se connecter
                        </Link>
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '14px', cursor: 'pointer', fontWeight: '600', transition: 'color 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onMouseOver={e => e.currentTarget.style.color = '#4B5563'}
                        onMouseOut={e => e.currentTarget.style.color = '#94A3B8'}
                    >
                        <span>🏠</span> Retour à l'accueil
                    </button>
                </div>
            </div>
        </div>
    )
}