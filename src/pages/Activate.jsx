import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function Activate() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cardId = searchParams.get('card') || searchParams.get('cardId')
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
        
        if (!user) { 
            navigate(`/login?redirect=/activate?card=${cardId}&token=${token}`); 
            return;
        }

        // Lier la carte et CLEAR le token pour qu'il ne soit plus utilisable
        const { error } = await supabase.from('cards')
            .update({ 
                owner_id: user.id, 
                status: 'active',
                activation_token: null // Une seule utilisation !
            })
            .eq('card_id', cardId).eq('activation_token', token)

        if (error) {
            setError("Erreur lors de l'activation : " + error.message);
            setLoading(false);
            return;
        }

        // Mettre à jour le profil
        await supabase.from('profiles')
            .update({ card_id: cardId })
            .eq('id', user.id)

        // Ajouter à la liste des cartes de l'utilisateur
        await supabase.from('user_cards').upsert({
            user_id: user.id, 
            card_id: cardId,
        })

        setLoading(false)
        navigate('/dashboard')
    }

    return (
        <div style={{
            minHeight: '100vh', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
            padding: '24px'
        }}>
            <div className="premium-card" style={{
                padding: '48px 40px', width: '100%', maxWidth: '440px',
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
            }}>
                <img src="/logo.png" alt="Logo" style={{ height: '48px', marginBottom: '24px' }} />
                
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: 'var(--text-900)', margin: '0 0 12px 0' }}>
                    AJOUTER UNE CARTE
                </h1>

                {cardInfo ? (
                    <>
                        <div style={{
                            margin: '24px 0', padding: '16px',
                            background: 'var(--primary-light)', borderRadius: '12px',
                            fontSize: '15px', color: '#166534', fontWeight: '600',
                            border: '1px solid #BBF7D0'
                        }}>
                            Carte reconnue : <strong>#{cardId}</strong><br/>
                            <span style={{ fontSize: '13px', opacity: 0.8 }}>({cardInfo.card_name})</span>
                        </div>
                        <p style={{ color: 'var(--text-500)', fontSize: '15px', marginBottom: '32px' }}>
                            Souhaitez-vous lier cette nouvelle carte à votre compte actuel ?
                        </p>
                        <button className="btn-primary" onClick={activateCard} disabled={loading}
                            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}>
                            {loading ? 'Activation...' : '✅ Ajouter à mon compte'}
                        </button>
                    </>
                ) : (
                    <div style={{
                        marginTop: '16px', padding: '16px',
                        background: '#FEF2F2', borderRadius: '12px',
                        fontSize: '15px', color: '#DC2626', fontWeight: '600',
                        border: '1px solid #FECACA'
                    }}>
                        ⚠️ Lien d'activation invalide ou expiré
                    </div>
                )}
                
                <div style={{ marginTop: '32px', textAlign: 'center', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                    <button onClick={() => navigate('/dashboard')} className="btn-ghost" style={{ fontSize: '14px' }}>
                        Retour au dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}