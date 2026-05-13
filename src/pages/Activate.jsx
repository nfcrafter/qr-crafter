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
            // First, check if the card exists at all
            const { data: existingCard, error: initialError } = await supabase.from('cards')
                .select('*')
                .eq('card_id', cardId)
                .single();

            if (initialError) {
                setError("Cette carte n'existe pas dans notre système.");
                return;
            }

            // If the card is already activated (has an owner), redirect to public profile
            if (existingCard.owner_id) {
                navigate(`/u/${cardId}`);
                return;
            }

            // If not activated, verify the token
            if (existingCard.activation_token !== token) {
                setError("Lien d'activation invalide ou corrompu.");
                return;
            }

            setCardInfo(existingCard);
        } catch (e) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setVerifying(false);
        }
    }

    async function activateCard() {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) { 
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
                            <div style={{ margin: '16px auto 0', width: '48px', height: '48px', color: 'var(--accent)' }} dangerouslySetInnerHTML={{ __html: TYPE_ICONS[cardInfo.type] || TYPE_ICONS.url }} />
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
                                        style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
                                    >
                                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>` }} />
                                        Créer mon compte client
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
                                <button className="btn-primary" onClick={activateCard} disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px', boxShadow: '0 10px 20px rgba(26, 18, 101, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    {loading ? 'Activation...' : (
                                        <>
                                            <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>` }} />
                                            Activer ma carte
                                        </>
                                    )}
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#CBD5E1' }}>
                            <div style={{ width: 64, height: 64, margin: '0 auto 16px' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5C2 7 4 5 6.5 5H18c2.2 0 4 1.8 4 4v8Z"></path><polyline points="15,9 18,9 21,9"></polyline><path d="M12 5V3"></path><path d="M17 3l-2 2"></path><path d="M7 3l2 2"></path></svg>` }} />
                        </div>
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