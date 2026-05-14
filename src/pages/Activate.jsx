import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase.js'
import { useNavigate, useSearchParams } from 'react-router-dom'
import QRCodeStyling from 'qr-code-styling'

const TYPE_ICONS = {
    url: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`,
    vcard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`,
    wifi: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`
};

export default function Activate() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const cardId = searchParams.get('card') || searchParams.get('cardId')
    const token = searchParams.get('token')
    const [cardInfo, setCardInfo] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [verifying, setVerifying] = useState(true)
    const [customCardName, setCustomCardName] = useState('')
    const qrRef = useRef(null)

    useEffect(() => {
        if (cardInfo && qrRef.current) {
            const activationUrl = `${window.location.origin}/activate?card=${cardId}&token=${token}`;
            const qrColor = cardInfo.admin_profile?.primaryColor || "#1A1265";
            const qrCode = new QRCodeStyling({
                width: 180, height: 180, data: activationUrl,
                dotsOptions: { color: qrColor, type: "rounded" },
                cornersSquareOptions: { color: qrColor, type: "extra-rounded" },
                backgroundOptions: { color: "transparent" }
            });
            qrRef.current.innerHTML = '';
            qrCode.append(qrRef.current);
        }
    }, [cardInfo]);

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

            // If the card is already activated (has an owner), redirect to dashboard if it's the current user, else public profile
            if (existingCard.owner_id) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user?.id === existingCard.owner_id) {
                    navigate(`/dashboard?activated=${cardId}`);
                } else {
                    navigate(`/u/${cardId}`);
                }
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
        setLoading(true);
        setError('');
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Vous devez être connecté.");

            const normalizedId = cardId.toUpperCase();

            // 1. Fetch user profile
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            // 2. Prepare card profile info
            const updatedProfile = {
                ...(cardInfo?.admin_profile || {}),
                full_name: profile?.full_name || cardInfo?.admin_profile?.full_name,
                email: profile?.email || cardInfo?.admin_profile?.email,
                phone: profile?.phone || cardInfo?.admin_profile?.phone,
                job_title: profile?.job_title || cardInfo?.admin_profile?.job_title,
                bio: profile?.bio || cardInfo?.admin_profile?.bio,
                photo_url: profile?.photo_url || cardInfo?.admin_profile?.photo_url,
                banner_url: profile?.banner_url || cardInfo?.admin_profile?.banner_url,
                primaryColor: profile?.primaryColor || cardInfo?.admin_profile?.primaryColor,
                backgroundColor: profile?.backgroundColor || cardInfo?.admin_profile?.backgroundColor,
                socials: profile?.socials || cardInfo?.admin_profile?.socials || {},
                customLinks: profile?.customLinks || cardInfo?.admin_profile?.customLinks || [],
            };

            // 3. Perform atomic update on the card
            console.log('Attempting to activate card:', normalizedId, 'with token:', token);
            
            const { data: updatedCard, error: updateError } = await supabase.from('cards')
                .update({ 
                    owner_id: user.id, 
                    status: 'active',
                    activation_token: null,
                    admin_profile: updatedProfile,
                    card_name: customCardName || profile?.full_name || cardInfo?.card_name || 'Mon Profil'
                })
                .ilike('card_id', normalizedId)
                .eq('activation_token', token)
                .select();

            if (updateError) {
                console.error('Update error:', updateError);
                throw updateError;
            }

            if (!updatedCard || updatedCard.length === 0) {
                console.warn('No card updated. Checking if card exists...');
                const { data: checkCard } = await supabase.from('cards').select('card_id, status, activation_token').ilike('card_id', normalizedId).single();
                console.log('Card state in DB:', checkCard);
                
                if (!checkCard) throw new Error("Cette carte n'existe pas.");
                if (checkCard.status === 'active' && !checkCard.activation_token) {
                    throw new Error("Cette carte est déjà activée.");
                }
                throw new Error("Impossible d'activer cette carte. Le jeton d'activation est peut-être invalide.");
            }

            console.log('Card activated successfully:', updatedCard[0]);

            // 4. Update secondary tables
            await supabase.from('profiles').update({ card_id: normalizedId }).eq('id', user.id);
            await supabase.from('user_cards').upsert({ 
                user_id: user.id, 
                card_id: normalizedId,
                profile_name: customCardName || profile?.full_name || 'Mon Profil'
            });

            setLoading(false);
            localStorage.removeItem('pending_activation');
            navigate(`/dashboard?activated=${normalizedId}`);
        } catch (e) {
            console.error("Activation error:", e);
            setError(e.message || "L'activation a échoué.");
            setLoading(false);
        }
    }

    const [user, setUser] = useState(null);
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            const currentUser = data.user;
            setUser(currentUser);
            
            // If user just logged in and we have a card to activate, it will be handled by verifyCard or activateCard
            if (currentUser && cardId && token) {
                console.log("User detected, proceeding with verification/activation info");
            } else if (!currentUser && cardId && token) {
                // Save for later if they navigate away to login/register
                console.log("Saving pending activation for later");
                localStorage.setItem('pending_activation', JSON.stringify({ cardId, token, customCardName }));
            }
        });
    }, [cardId, token]);

    const themeColor = cardInfo?.admin_profile?.primaryColor || "#1A1265";

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${themeColor}10 0%, #F8FAFC 100%)`, padding: '24px' }}>
            <div className="premium-card" style={{ padding: '48px 40px', width: '100%', maxWidth: '440px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)', textAlign: 'center', borderTop: `6px solid ${themeColor}` }}>
                <h1 style={{ fontSize: '28px', fontWeight: '800', letterSpacing: '-1px', color: themeColor, margin: '0 0 12px 0' }}>ACTIVATION</h1>
                
                {verifying ? (
                    <div style={{ padding: '40px 0' }}>Vérification en cours...</div>
                ) : cardInfo ? (
                    <>
                        <div style={{ margin: '24px 0', padding: '32px 24px', background: '#F8FAFC', borderRadius: '24px', border: `2px solid ${themeColor}20` }}>
                            <div style={{ fontSize: '12px', color: themeColor, fontWeight: 800, textTransform: 'uppercase', marginBottom: 16, letterSpacing: '2px' }}>ID DE LA CARTE</div>
                            
                            <div style={{ fontSize: '42px', color: themeColor, fontWeight: '1000', letterSpacing: '-1px', marginBottom: '8px', fontFamily: 'monospace' }}>
                                {cardId}
                            </div>

                            <div style={{ fontSize: '16px', color: '#64748B', fontWeight: '700' }}>{cardInfo.card_name}</div>
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
                                        style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: themeColor }}
                                    >
                                        <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>` }} />
                                        Créer mon compte client
                                    </button>
                                    <button 
                                        onClick={() => navigate(`/login?card=${cardId}&token=${token}`)}
                                        className="btn-ghost" 
                                        style={{ width: '100%', padding: '16px', fontSize: '16px', color: themeColor }}
                                    >
                                        J'ai déjà un compte (Connexion)
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div style={{ marginBottom: 24, textAlign: 'left', marginTop: 32 }}>
                                    <label style={{ display: 'block', marginBottom: 8, fontSize: 13, fontWeight: 700, color: '#64748B' }}>DONNEZ UN NOM À CETTE CARTE</label>
                                    <input 
                                        type="text" 
                                        value={customCardName} 
                                        onChange={e => setCustomCardName(e.target.value)}
                                        placeholder="Ex: Profil Professionnel, Perso, etc."
                                        style={{ width: '100%', padding: '14px', borderRadius: '12px', border: `1px solid ${themeColor}30`, fontSize: '15px', outline: 'none', background: 'white' }}
                                    />
                                </div>

                                 <button className="btn-primary" onClick={activateCard} disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '16px', background: themeColor, boxShadow: `0 10px 20px ${themeColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                    {loading ? 'Activation...' : (
                                        <>
                                            <div style={{ width: 18, height: 18 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>` }} />
                                            Activer et continuer
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