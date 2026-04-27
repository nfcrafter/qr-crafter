import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'

export default function Register() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cardId = searchParams.get('card')
    const token = searchParams.get('token')

    const [form, setForm] = useState({ fullName: '', email: '', password: '', confirm: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [cardInfo, setCardInfo] = useState(null)

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

        if (data.user) {
            // Créer le profil avec les infos admin si disponibles
            const adminProfile = cardInfo?.admin_profile || {}
            await supabase.from('profiles').upsert({
                id: data.user.id,
                full_name: form.fullName,
                email: form.email,
                card_id: cardId || null,
                ...adminProfile,
            })

            // Lier la carte si token valide
            if (cardId && token && cardInfo) {
                await supabase.from('cards')
                    .update({ owner_id: data.user.id, status: 'active' })
                    .eq('card_id', cardId)
                    .eq('activation_token', token)

                await supabase.from('user_cards').upsert({
                    user_id: data.user.id,
                    card_id: cardId,
                    profile_name: form.fullName,
                })
            }
        }

        setLoading(false)
        navigate('/dashboard')
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            padding: '40px 20px'
        }}>
            <div className="premium-card" style={{
                padding: '48px 40px', width: '100%', maxWidth: '500px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <img src="/logo.png" alt="Logo" style={{ height: '48px', marginBottom: '16px' }} />
                    <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-900)', margin: 0 }}>
                        {cardId ? 'ACTIVER MA CARTE' : 'CRÉER MON COMPTE'}
                    </h1>
                    
                    {cardId && cardInfo && (
                        <div style={{
                            marginTop: '16px', padding: '12px 16px',
                            background: 'var(--primary-light)', borderRadius: '12px',
                            fontSize: '14px', color: '#166534', fontWeight: '600',
                            border: '1px solid #BBF7D0', display: 'inline-flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span>✅</span> Carte #{cardId} reconnue ({cardInfo.card_name})
                        </div>
                    )}
                    
                    {cardId && !cardInfo && (
                        <div style={{
                            marginTop: '16px', padding: '12px 16px',
                            background: '#FEF2F2', borderRadius: '12px',
                            fontSize: '14px', color: '#991B1B', fontWeight: '600',
                            border: '1px solid #FECACA', display: 'inline-flex', alignItems: 'center', gap: '8px'
                        }}>
                            <span>⚠️</span> Lien d'activation invalide ou expiré
                        </div>
                    )}

                    {!cardId && (
                        <p style={{ color: 'var(--text-500)', fontSize: '15px', marginTop: '8px' }}>
                            Rejoignez la révolution des cartes de visite numériques
                        </p>
                    )}
                </div>

                <form onSubmit={handleRegister}>
                    <div className="field">
                        <label style={{ fontWeight: '600', color: 'var(--text-700)' }}>Nom complet</label>
                        <input type="text" placeholder="Jean Dupont"
                            value={form.fullName}
                            onChange={e => update('fullName', e.target.value)}
                            required autoFocus
                        />
                    </div>
                    <div className="field">
                        <label style={{ fontWeight: '600', color: 'var(--text-700)' }}>Email</label>
                        <input type="email" placeholder="jean@example.com"
                            value={form.email}
                            onChange={e => update('email', e.target.value)}
                            required
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="field">
                            <label style={{ fontWeight: '600', color: 'var(--text-700)' }}>Mot de passe</label>
                            <input type="password" placeholder="••••••••"
                                value={form.password}
                                onChange={e => update('password', e.target.value)}
                                required
                            />
                        </div>
                        <div className="field">
                            <label style={{ fontWeight: '600', color: 'var(--text-700)' }}>Confirmer</label>
                            <input type="password" placeholder="••••••••"
                                value={form.confirm}
                                onChange={e => update('confirm', e.target.value)}
                                required
                            />
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

                    <button type="submit" className="btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '8px' }}
                        disabled={loading}>
                        {loading ? 'Création...' : cardId ? '🚀 Activer ma carte' : 'Créer mon compte'}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <p style={{ color: 'var(--text-500)', fontSize: '14px' }}>
                        Déjà un compte ?{' '}
                        <Link to={cardId ? `/activate?card=${cardId}&token=${token}` : '/login'}
                            style={{ color: 'var(--primary)', fontWeight: '700', textDecoration: 'none' }}>
                            Se connecter
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}