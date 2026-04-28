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
    const [verifying, setVerifying] = useState(true)

    useEffect(() => { 
        console.log("Activation Attempt:", { cardId, token });
        if (cardId && token) verifyCard();
        else {
            setError("Lien incomplet : ID ou Jeton manquant.");
            setVerifying(false);
        }
    }, [])

    async function verifyCard() {
        setVerifying(true);
        try {
            const { data, error: fetchError } = await supabase.from('cards')
                .select('*')
                .eq('card_id', cardId)
                .eq('activation_token', token)
                .single()
            
            if (fetchError) {
                console.error("Verification Error:", fetchError);
                if (fetchError.code === 'PGRST116') {
                    setError("Lien invalide ou déjà utilisé. Ce QR code n'attend plus d'activation.");
                } else {
                    setError("Erreur technique lors de la vérification : " + fetchError.message);
                }
            } else {
                setCardInfo(data);
            }
        } catch (e) {
            console.error("Catch error:", e);
            setError("Une erreur inattendue est survenue.");
        } finally {
            setVerifying(false);
        }
    }

    async function activateCard() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) { 
            // This case is now handled by the UI showing Login/Register buttons
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('cards')
            .update({ 
                owner_id: user.id, 
                status: 'active',
                activation_token: null 
            })
            .eq('card_id', cardId)
            .eq('activation_token', token)

        if (error) {
            setError("L'activation a échoué : " + error.message);
            setLoading(false);
            return;
        }

        await supabase.from('profiles').update({ card_id: cardId }).eq('id', user.id)
        await supabase.from('user_cards').upsert({ user_id: user.id, card_id: cardId })

        setLoading(false)
        navigate('/dashboard')
    }

    const [user, setUser] = useState(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => setUser(data.user));
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', padding: '24px' }}>
            <div className="premium-card" style={{ padding: '48px 40px', width: '100%', maxWidth: '440px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: '#1A1265', margin: '0 0 12px 0' }}>ACTIVATION</h1>
                
                {verifying ? (
                    <div style={{ padding: '40px 0' }}>Vérification en cours...</div>
                ) : cardInfo ? (
                    <>
                        <div style={{ margin: '24px 0', padding: '20px', background: '#EEF2FF', borderRadius: '16px', border: '1px solid #C7D2FE' }}>
                            <div style={{ fontSize: '12px', color: '#6366F1', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Projet détecté</div>
                            <div style={{ fontSize: '18px', color: '#1A1265', fontWeight: '800' }}>{cardInfo.card_name}</div>
                            <div style={{ fontSize: '13px', color: '#64748B', marginTop: 4 }}>ID: {cardId}</div>
                        </div>

                        {!user ? (
                            <div style={{ marginTop: 32 }}>
                                <p style={{ color: '#64748B', fontSize: '14px', marginBottom: 24, lineHeight: 1.5 }}>
                                    Pour activer cette carte, vous devez d'abord vous connecter ou créer un compte.
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <button 
                                        onClick={() => navigate(`/register?card=${cardId}&token=${token}`)}
                                        className="btn-primary" 
                                        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                                    >
                                        🚀 Créer mon compte client
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/login?card=${cardId}&token=${token}`)}
                                        className="btn-ghost" 
                                        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
                                    >
                                        J'ai déjà un compte (Connexion)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '32px', lineHeight: 1.5 }}>
                                    Cette carte est prête à être activée. Elle sera liée à votre compte <strong>{user.email}</strong>.
                                </p>
                                <button className="btn-primary" onClick={activateCard} disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px', boxShadow: '0 10px 20px rgba(26, 18, 101, 0.2)' }}>
                                    {loading ? 'Activation...' : '🚀 Activer ma carte'}
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ padding: '24px', background: '#FEF2F2', borderRadius: '16px', color: '#DC2626', border: '1px solid #FECACA', textAlign: 'left' }}>
                            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: 8 }}>Oups !</div>
                            <div style={{ fontSize: '14px', lineHeight: 1.5, opacity: 0.9 }}>{error || "Le lien d'activation est invalide ou a déjà été utilisé."}</div>
                        </div>
                        <button onClick={() => navigate('/')} className="btn-ghost" style={{ width: '100%', marginTop: 24, padding: 14 }}>Retour à l'accueil</button>
                    </div>
                )}
            </div>
        </div>
    )
}