import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Activate() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cardId = searchParams.get('card')
    const token = searchParams.get('token')
    const [cardInfo, setCardInfo] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => { if (cardId && token) verifyCard() }, [])

    async function verifyCard() {
        const { data } = await supabase.from('cards')
            .select('*').eq('card_id', cardId).eq('activation_token', token).single()
        setCardInfo(data)
    }

    async function activateCard() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { navigate(`/login?redirect=/activate?card=${cardId}&token=${token}`); return }

        await supabase.from('cards')
            .update({ owner_id: user.id, status: 'active' })
            .eq('card_id', cardId).eq('activation_token', token)

        await supabase.from('profiles')
            .update({ card_id: cardId })
            .eq('id', user.id)

        await supabase.from('user_cards').upsert({
            user_id: user.id, card_id: cardId,
        })

        setLoading(false)
        navigate('/dashboard')
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
            <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)', padding: '48px 40px', width: '100%', maxWidth: '440px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
                <img src="/logo.png" alt="NFCrafter" style={{ height: '56px', marginBottom: '16px' }} />
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'var(--accent)', marginBottom: '8px' }}>
                    Ajouter une carte
                </h1>
                {cardInfo ? (
                    <>
                        <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>
                            Carte <strong>{cardId}</strong> — {cardInfo.card_name}
                        </p>
                        <button className="btn-primary" onClick={activateCard} disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}>
                            {loading ? 'Activation...' : '✅ Ajouter à mon compte'}
                        </button>
                    </>
                ) : (
                    <p style={{ color: 'var(--error)' }}>⚠️ Lien invalide ou expiré</p>
                )}
            </div>
        </div>
    )
}