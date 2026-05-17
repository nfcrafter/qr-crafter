import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CARD_COLORS = [
    { id: 'black', name: 'Noir Onyx', hex: '#111827', imgRecto: '/assets/cards/black-recto.png', imgVerso: '/assets/cards/black-verso.png' },
    { id: 'white', name: 'Blanc Neige', hex: '#F9FAFB', hexText: '#111827', imgRecto: '/assets/cards/white-recto.png', imgVerso: '/assets/cards/white-verso.png' },
    { id: 'blue', name: 'Bleu Océan', hex: '#2563EB', imgRecto: '/assets/cards/blue-recto.png', imgVerso: '/assets/cards/blue-verso.png' },
    { id: 'gold', name: 'Or Premium', hex: '#C9A84C', imgRecto: '/assets/cards/gold-recto.png', imgVerso: '/assets/cards/gold-verso.png' },
    { id: 'red', name: 'Rouge Rubis', hex: '#DC2626', imgRecto: '/assets/cards/red-recto.png', imgVerso: '/assets/cards/red-verso.png' },
    { id: 'green', name: 'Vert Émeraude', hex: '#059669', imgRecto: '/assets/cards/green-recto.png', imgVerso: '/assets/cards/green-verso.png' },
    { id: 'purple', name: 'Violet Améthyste', hex: '#7C3AED', imgRecto: '/assets/cards/purple-recto.png', imgVerso: '/assets/cards/purple-verso.png' },
    { id: 'pink', name: 'Rose Poudré', hex: '#DB2777', imgRecto: '/assets/cards/pink-recto.png', imgVerso: '/assets/cards/pink-verso.png' }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [session, setSession] = useState(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [cardType, setCardType] = useState('physical'); // 'physical' or 'digital'
    const [activeDemoTab, setActiveDemoTab] = useState('visitor'); // 'visitor' or 'dashboard'
    
    // Custom cursor trace position
    const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
    const [cursorVisible, setCursorVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
            setCursorVisible(true);
        };
        const handleMouseLeave = () => {
            setCursorVisible(false);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mouseleave', handleMouseLeave);

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mouseleave', handleMouseLeave);
            subscription?.unsubscribe();
        };
    }, []);

    const whatsappNumber = "22969473921";

    const activeColor = CARD_COLORS[selectedColorIndex];
    const buttonColor = activeColor.hex;
    const buttonTextColor = activeColor.hexText || 'white';

    const getWhatsAppUrl = (type = cardType) => {
        let message = '';
        if (type === 'physical') {
            message = `Bonjour NFCrafter, je souhaite commander la Carte Premium NFC en couleur *${activeColor.name}* à 10.000f.`;
        } else {
            message = `Bonjour NFCrafter, je souhaite souscrire au Profil Digital Unique à 7.000f.`;
        }
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div style={{ background: '#0A0A0F', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif", color: '#FFFFFF', position: 'relative' }}>
            
            {/* Custom cursor desktop */}
            {cursorVisible && (
                <div style={{
                    position: 'fixed',
                    left: mousePos.x,
                    top: mousePos.y,
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#C9A84C',
                    pointerEvents: 'none',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999,
                    boxShadow: '0 0 15px #C9A84C, 0 0 30px #C9A84C',
                    transition: 'width 0.2s, height 0.2s',
                    opacity: 0.8
                }} />
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
                
                html { scroll-behavior: smooth; }

                /* Premium Glassmorphism styling */
                .glass-nav {
                    background: rgba(10, 10, 15, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(201, 168, 76, 0.1);
                    transition: all 0.3s ease;
                }
                
                .glass-card {
                    background: rgba(17, 17, 24, 0.7);
                    backdrop-filter: blur(15px);
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .glass-card:hover {
                    border-color: rgba(201, 168, 76, 0.2);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.1);
                    transform: translateY(-5px);
                }

                .bento-card {
                    background: rgba(17, 17, 24, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 28px;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .bento-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(201, 168, 76, 0.3);
                    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(201, 168, 76, 0.1);
                }

                /* 3D Animations & Wobbles */
                @keyframes cardSpin3D {
                    0% { transform: perspective(1000px) rotateY(0deg) rotateX(10deg); }
                    50% { transform: perspective(1000px) rotateY(180deg) rotateX(-5deg); }
                    100% { transform: perspective(1000px) rotateY(360deg) rotateX(10deg); }
                }
                .spinning-card {
                    animation: cardSpin3D 15s linear infinite;
                    transform-style: preserve-3d;
                }
                .spinning-card:hover {
                    animation-play-state: paused;
                }

                @keyframes infiniteScroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .ticker-row {
                    display: flex;
                    width: max-content;
                    animation: infiniteScroll 25s linear infinite;
                    gap: 40px;
                }

                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0A0A0F; }
                ::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #E5C366; }

                /* Responsive designs */
                @media (max-width: 768px) {
                    .bento-grid {
                        grid-template-columns: 1fr !important;
                    }
                    .hero-title {
                        font-size: 40px !important;
                        line-height: 1.1 !important;
                    }
                }
            `}</style>

            {/* 1. NAVIGATION BAR */}
            <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, height: '80px', display: 'flex', alignItems: 'center' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #C9A84C, #947225)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: '#0A0A0F', boxShadow: '0 0 20px rgba(201, 168, 76, 0.4)' }}>N</div>
                        <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #FFFFFF, #C9A84C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NFCrafter</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-menu">
                        <a href="#features" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#C9A84C'} onMouseOut={e => e.target.style.color = '#9CA3AF'}>Fonctionnalités</a>
                        <a href="#demo" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#C9A84C'} onMouseOut={e => e.target.style.color = '#9CA3AF'}>Profil Démo</a>
                        <a href="#tarifs" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#C9A84C'} onMouseOut={e => e.target.style.color = '#9CA3AF'}>Tarifs</a>
                        <a href="#faq" style={{ color: '#9CA3AF', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#C9A84C'} onMouseOut={e => e.target.style.color = '#9CA3AF'}>FAQ</a>
                    </div>

                    <div>
                        <a href="#tarifs" style={{
                            background: 'linear-gradient(135deg, #C9A84C, #947225)',
                            color: '#0A0A0F',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '14px',
                            textDecoration: 'none',
                            boxShadow: '0 0 15px rgba(201, 168, 76, 0.2)',
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 0 25px rgba(201, 168, 76, 0.4)'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 0 15px rgba(201, 168, 76, 0.2)'}>
                            Commander
                        </a>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION — WOW EFFECT */}
            <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '120px', position: 'relative', overflow: 'hidden' }}>
                {/* Radial golden halo */}
                <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201, 168, 76, 0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0 }} />

                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                    {/* Hero Left Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(201, 168, 76, 0.3)', background: 'rgba(201, 168, 76, 0.05)', padding: '6px 16px', borderRadius: '100px', width: 'fit-content' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C9A84C', animation: 'pulseBadge 2s infinite' }}></span>
                            <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#C9A84C' }}>L'identité digitale des pros d'élite</span>
                        </div>

                        <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.05', margin: 0 }}>
                            Votre dernière <br />
                            <span style={{ background: 'linear-gradient(90deg, #FFFFFF, #C9A84C, #E5C366)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>carte de visite. À vie.</span>
                        </h1>

                        <p style={{ fontSize: '18px', color: '#9CA3AF', lineHeight: '1.6', margin: 0, maxWidth: '500px' }}>
                            Partagez vos contacts en 1 seconde. Vendez vos services directement via WhatsApp. Impressionnez vos futurs clients sans jamais avoir besoin de réimprimer.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                            <a href="#tarifs" style={{
                                background: 'linear-gradient(135deg, #C9A84C, #947225)',
                                color: '#0A0A0F',
                                padding: '18px 36px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '16px',
                                textDecoration: 'none',
                                boxShadow: '0 10px 30px rgba(201, 168, 76, 0.2)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                Créer mon profil — 7 000 FCFA
                            </a>
                            <a href="#demo" style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#FFFFFF',
                                padding: '18px 36px',
                                borderRadius: '16px',
                                fontWeight: '700',
                                fontSize: '16px',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease'
                            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.4)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}>
                                Voir une démo live →
                            </a>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', color: '#9CA3AF', fontSize: '13px', marginTop: '16px' }}>
                            <span>✓ Paiement Unique</span>
                            <span>• Aucun Abonnement</span>
                            <span>• Expédié sous 48h à Cotonou</span>
                        </div>
                    </div>

                    {/* Hero Right Visuals - 3D Card Animation */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '400px' }}>
                        <div style={{ position: 'relative', width: '320px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            {/* Rotative Card 3D */}
                            <div className="spinning-card" style={{
                                width: '280px',
                                height: '176px',
                                background: '#111118',
                                borderRadius: '18px',
                                border: '1px solid rgba(201, 168, 76, 0.3)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(201, 168, 76, 0.15)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '24px',
                                position: 'absolute',
                                top: '40px',
                                zIndex: 5,
                                transformStyle: 'preserve-3d'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #C9A84C, #947225)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0A0A0F' }}>N</div>
                                    <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: '700', letterSpacing: '2px' }}>SIGNATURE</span>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '-0.02em', color: '#FFFFFF' }}>Romuald K.</h4>
                                    <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Architecte d'intérieur</span>
                                </div>
                            </div>

                            {/* Phone Mockup floating slightly below */}
                            <div style={{
                                width: '180px',
                                height: '360px',
                                background: '#0D0D12',
                                borderRadius: '32px',
                                border: '6px solid #1F2937',
                                position: 'absolute',
                                bottom: '0px',
                                right: '-20px',
                                zIndex: 2,
                                boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                                overflow: 'hidden',
                                padding: '16px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center'
                            }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #947225)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '14px', color: '#0A0A0F', marginBottom: '12px' }}>R</div>
                                <div style={{ width: '100px', height: '10px', background: 'white', borderRadius: '4px', marginBottom: '6px' }}></div>
                                <div style={{ width: '60px', height: '6px', background: '#9CA3AF', borderRadius: '4px', marginBottom: '20px' }}></div>
                                <div style={{ width: '100%', height: '32px', background: '#C9A84C', borderRadius: '8px', marginBottom: '8px' }}></div>
                                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '6px' }}></div>
                                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '6px' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Infinite Ticker Banner */}
                <div style={{ background: '#111118', borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '20px 0', marginTop: '120px', overflow: 'hidden' }}>
                    <div className="ticker-row">
                        {[1, 2, 3, 4].map(idx => (
                            <React.Fragment key={idx}>
                                <span style={{ color: '#C9A84C', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ 500+ PROFESSIONNELS ACTIFS</span>
                                <span style={{ color: '#9CA3AF', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ LIVRAISON 48H COTONOU</span>
                                <span style={{ color: '#FFFFFF', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ ZÉRO ABONNEMENT</span>
                                <span style={{ color: '#C9A84C', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ BOUTIQUE WHATSAPP INCLUSE</span>
                                <span style={{ color: '#9CA3AF', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ FABRIQUÉ POUR L'AFRIQUE 🇧🇯</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SECTION PROBLÈME — CONSTAT BRUTAL */}
            <section style={{ padding: '120px 0', background: '#111118', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Les cartes papier vous font <span style={{ color: '#DC2626' }}>perdre des clients</span>.
                        </h2>
                        <p style={{ color: '#9CA3AF', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            Chaque rencontre physique manquée est une opportunité d'affaires qui s'envole.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                        {/* Column Left - The Nightmare of Paper */}
                        <div style={{ background: 'rgba(220, 38, 38, 0.03)', border: '1px solid rgba(220, 38, 38, 0.1)', padding: '40px', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h3 style={{ color: '#EF4444', fontSize: '24px', fontWeight: '800', margin: 0 }}>Avant NFCrafter</h3>
                            
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>88% finissent à la poubelle</h4>
                                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px', lineHeight: '1.5' }}>Les cartes papier se perdent ou finissent froissées dans un sac en moins de 7 jours.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>La dictée pénible du numéro</h4>
                                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px', lineHeight: '1.5' }}>"Zéro-Six..." Vous épelez pendant 5 minutes. Le prospect note mal votre nom et ne vous rappelle jamais.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>Coûteuse réimpression</h4>
                                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px', lineHeight: '1.5' }}>Un simple changement de numéro ou de logo vous oblige à réimprimer tout un lot (10 000f perdus).</p>
                                </div>
                            </div>
                        </div>

                        {/* Column Right - The Revolution NFCrafter */}
                        <div style={{ background: 'rgba(201, 168, 76, 0.03)', border: '1px solid rgba(201, 168, 76, 0.15)', padding: '40px', borderRadius: '28px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <h3 style={{ color: '#C9A84C', fontSize: '24px', fontWeight: '800', margin: 0 }}>Avec NFCrafter</h3>
                            
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: '#C9A84C', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>Un simple "Tap" magique</h4>
                                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px', lineHeight: '1.5' }}>La carte effleure le téléphone de votre prospect, votre profil professionnel s'ouvre en 1 seconde chrono.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: '#C9A84C', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>Enregistrement direct</h4>
                                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px', lineHeight: '1.5' }}>Votre contact (numéro, email, site web) est enregistré automatiquement dans leur répertoire sans aucune erreur.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(201, 168, 76, 0.1)', color: '#C9A84C', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#FFFFFF' }}>Boutique WhatsApp & Commande</h4>
                                    <p style={{ margin: 0, color: '#9CA3AF', fontSize: '14px', lineHeight: '1.5' }}>Le client navigue dans votre mini-site, choisit un produit, commande via WhatsApp, et vous le livrez.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. SECTION ECOSYSTÈME — BENTO GRID */}
            <section id="features" style={{ padding: '120px 0', background: '#0A0A0F' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Pas juste une carte. <span style={{ color: '#C9A84C' }}>Un écosystème complet.</span>
                        </h2>
                        <p style={{ color: '#9CA3AF', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            Découvrez le mini-site et le dashboard ultra-performants inclus avec votre carte.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        {/* 1. Profil Digital (XL - 2 columns wide) */}
                        <div className="bento-card" style={{ gridColumn: 'span 2', minHeight: '380px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                <div style={{ maxWidth: '300px' }}>
                                    <span style={{ color: '#C9A84C', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>S'ouvre en 1 seconde</span>
                                    <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 12px 0', color: 'white' }}>Le Profil Digital Pro</h3>
                                    <p style={{ color: '#9CA3AF', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Un mini-site mobile haut de gamme avec photo, bio, liens vers vos réseaux et bouton magique pour vous enregistrer instantanément dans le téléphone.</p>
                                </div>
                                <div style={{ width: '140px', height: '240px', background: '#111118', borderRadius: '16px', border: '3px solid #1F2937', padding: '12px 8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C9A84C', marginBottom: '8px' }} />
                                    <div style={{ width: '80px', height: '8px', background: 'white', borderRadius: '2px', marginBottom: '4px' }} />
                                    <div style={{ width: '50px', height: '6px', background: '#9CA3AF', borderRadius: '2px', marginBottom: '16px' }} />
                                    <div style={{ width: '100%', height: '20px', background: '#C9A84C', borderRadius: '4px', marginBottom: '6px' }} />
                                    <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '4px' }} />
                                    <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Analytics (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '380px' }}>
                            <div>
                                <span style={{ color: '#C9A84C', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Sachez qui vous remarque</span>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: 'white' }}>Analytics en Live</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ fontSize: '36px', fontWeight: '900', color: '#FFFFFF', letterSpacing: '-1px' }}>247 <span style={{ fontSize: '14px', color: '#9CA3AF', fontWeight: 'normal' }}>scans ce mois</span></div>
                                <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-end', padding: '10px', gap: '8px' }}>
                                    <div style={{ height: '30%', flex: 1, background: 'rgba(201, 168, 76, 0.3)', borderRadius: '2px' }} />
                                    <div style={{ height: '45%', flex: 1, background: 'rgba(201, 168, 76, 0.4)', borderRadius: '2px' }} />
                                    <div style={{ height: '60%', flex: 1, background: 'rgba(201, 168, 76, 0.6)', borderRadius: '2px' }} />
                                    <div style={{ height: '90%', flex: 1, background: '#C9A84C', borderRadius: '2px' }} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Portfolio Visuel (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '320px' }}>
                            <div>
                                <span style={{ color: '#C9A84C', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Montrez, ne dites pas</span>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: 'white' }}>Portfolio</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <div style={{ height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                                <div style={{ height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                                <div style={{ height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                                <div style={{ height: '50px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }} />
                            </div>
                        </div>

                        {/* 4. Boutique WhatsApp (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '320px' }}>
                            <div>
                                <span style={{ color: '#C9A84C', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Ventes directes sans commission</span>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: 'white' }}>Boutique WhatsApp</h3>
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>Gérez vos articles, vos clients commandent directement par message WhatsApp et payent cash à la livraison.</p>
                        </div>

                        {/* 5. QR Code Universel (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '320px' }}>
                            <div>
                                <span style={{ color: '#C9A84C', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Compatibilité 100% garantie</span>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: 'white' }}>QR Code de Secours</h3>
                            </div>
                            <p style={{ color: '#9CA3AF', fontSize: '13px', lineHeight: '1.5', margin: 0 }}>Générez votre QR code vectoriel pour l'imprimer sur vos signatures de mail, flyers ou supports publicitaires.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. DÉMO LIVE — SCANNEZ & VOYEZ */}
            <section id="demo" style={{ padding: '120px 0', background: '#111118', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Voici ce que <span style={{ color: '#C9A84C' }}>vos contacts verront.</span>
                        </h2>
                        <p style={{ color: '#9CA3AF', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            Découvrez notre interface mobile d'exception et le panneau d'administration.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '64px', alignItems: 'center' }}>
                        
                        {/* Left Side - Interactive 3D Phone Mockup */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: '280px',
                                height: '560px',
                                background: '#0A0A0F',
                                borderRadius: '44px',
                                border: '10px solid #1F2937',
                                boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 0 40px rgba(201, 168, 76, 0.1)',
                                position: 'relative',
                                overflow: 'hidden',
                                padding: '24px 16px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* Notch */}
                                <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '20px', background: '#1F2937', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px', zIndex: 10 }}></div>

                                {activeDemoTab === 'visitor' ? (
                                    /* Visitor View Mockup */
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflowY: 'auto' }}>
                                        <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #C9A84C, #947225)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '24px', color: '#0A0A0F', marginTop: '20px', marginBottom: '12px', boxShadow: '0 0 20px rgba(201, 168, 76, 0.3)' }}>R</div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '800', color: 'white' }}>Romuald K.</h3>
                                        <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Architecte d'intérieur</span>

                                        <button style={{ width: '100%', background: '#C9A84C', color: '#0A0A0F', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
                                            Enregistrer le Contact
                                        </button>

                                        {/* Fake Links */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '20px', height: '20px', background: '#C9A84C', borderRadius: '4px' }}></div>
                                                <span style={{ fontSize: '12px', color: 'white' }}>Mon Portfolio en Ligne</span>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '20px', height: '20px', background: '#C9A84C', borderRadius: '4px' }}></div>
                                                <span style={{ fontSize: '12px', color: 'white' }}>Boutique de nos créations</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Owner View Mockup (Dashboard) */
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <h4 style={{ fontSize: '16px', fontWeight: '900', margin: '20px 0 12px 0', color: '#C9A84C' }}>Éditer le profil</h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                            <div style={{ border: '1px dashed rgba(201, 168, 76, 0.4)', background: 'rgba(201, 168, 76, 0.05)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'white' }}>✥ En-tête de profil</span>
                                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Modifier</span>
                                            </div>
                                            <div style={{ border: '1px dashed rgba(201, 168, 76, 0.4)', background: 'rgba(201, 168, 76, 0.05)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'white' }}>✥ Bouton Contact</span>
                                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Modifier</span>
                                            </div>
                                            <div style={{ border: '1px dashed rgba(201, 168, 76, 0.4)', background: 'rgba(201, 168, 76, 0.05)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'white' }}>✥ Section Portfolio</span>
                                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Modifier</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Toggles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            <div>
                                <h3 style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'Outfit', color: 'white', margin: '0 0 16px 0' }}>Basculez entre les vues</h3>
                                <p style={{ color: '#9CA3AF', fontSize: '16px', lineHeight: '1.6', margin: 0 }}>
                                    Visualisez le site du côté visiteur ou accédez à l'administration simplifiée pour modifier vos contenus en direct.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button onClick={() => setActiveDemoTab('visitor')} style={{
                                    flex: 1,
                                    background: activeDemoTab === 'visitor' ? 'linear-gradient(135deg, #C9A84C, #947225)' : 'rgba(255,255,255,0.02)',
                                    border: activeDemoTab === 'visitor' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    color: activeDemoTab === 'visitor' ? '#0A0A0F' : 'white',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}>
                                    Vue Visiteur
                                </button>
                                <button onClick={() => setActiveDemoTab('dashboard')} style={{
                                    flex: 1,
                                    background: activeDemoTab === 'dashboard' ? 'linear-gradient(135deg, #C9A84C, #947225)' : 'rgba(255,255,255,0.02)',
                                    border: activeDemoTab === 'dashboard' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    color: activeDemoTab === 'dashboard' ? '#0A0A0F' : 'white',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}>
                                    Vue Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. CONFIGURATEUR DE CARTE — PIECE MAITRESSE */}
            <section id="tarifs" style={{ padding: '120px 0', background: '#0A0A0F', position: 'relative' }}>
                {/* Dynamic radial glow behind color select */}
                <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle, ${buttonColor}15 0%, transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0, transition: 'background 0.5s ease' }} />

                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Choisissez <span style={{ color: '#C9A84C' }}>votre identité.</span>
                        </h2>
                        <p style={{ color: '#9CA3AF', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
                            Configurez la couleur de votre carte physique et validez votre offre.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
                        
                        {/* Configurator Visualizer Left */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '380px',
                                aspectRatio: '1.58',
                                background: activeColor.hex,
                                borderRadius: '24px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 50px rgba(255,255,255,0.02)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                padding: '32px',
                                position: 'relative',
                                transition: 'background 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                                overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: activeColor.id === 'white' ? '#111827' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '22px', color: activeColor.id === 'white' ? 'white' : '#0A0A0F' }}>N</div>
                                    <span style={{ fontSize: '12px', color: activeColor.id === 'white' ? '#111827' : '#9CA3AF', fontWeight: '700', letterSpacing: '2px' }}>SIGNATURE</span>
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '22px', fontWeight: '900', letterSpacing: '-0.02em', color: activeColor.id === 'white' ? '#111827' : '#FFFFFF' }}>NFCrafter</h4>
                                    <span style={{ fontSize: '12px', color: activeColor.id === 'white' ? '#4B5563' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>{activeColor.name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Configurator Controls Right */}
                        <div style={{ background: 'rgba(17, 17, 24, 0.7)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '32px', padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                            {/* Step 1: Pack Selection */}
                            <div>
                                <span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>Étape 1 : Choisir le Pack</span>
                                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <div onClick={() => setCardType('digital')} style={{
                                        flex: 1,
                                        minWidth: '140px',
                                        border: cardType === 'digital' ? '2px solid #C9A84C' : '1px solid rgba(255, 255, 255, 0.1)',
                                        background: cardType === 'digital' ? 'rgba(201, 168, 76, 0.05)' : 'transparent',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px'
                                    }}>
                                        <span style={{ fontWeight: '800', fontSize: '15px' }}>Pack Digital</span>
                                        <span style={{ color: '#C9A84C', fontWeight: '900', fontSize: '18px' }}>7 000 FCFA</span>
                                    </div>
                                    <div onClick={() => setCardType('physical')} style={{
                                        flex: 1,
                                        minWidth: '140px',
                                        border: cardType === 'physical' ? '2px solid #C9A84C' : '1px solid rgba(255, 255, 255, 0.1)',
                                        background: cardType === 'physical' ? 'rgba(201, 168, 76, 0.05)' : 'transparent',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '6px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#C9A84C', color: '#0A0A0F', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>Populaire</div>
                                        <span style={{ fontWeight: '800', fontSize: '15px' }}>Pack Signature NFC</span>
                                        <span style={{ color: '#C9A84C', fontWeight: '900', fontSize: '18px' }}>10 000 FCFA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Color Picker (Only visible if physical pack is selected) */}
                            {cardType === 'physical' && (
                                <div>
                                    <span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '16px' }}>Étape 2 : Couleur de la carte — <span style={{ color: '#C9A84C' }}>{activeColor.name}</span></span>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {CARD_COLORS.map((color, index) => (
                                            <div
                                                key={color.id}
                                                onClick={() => setSelectedColorIndex(index)}
                                                style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: '50%',
                                                    background: color.hex,
                                                    cursor: 'pointer',
                                                    border: selectedColorIndex === index ? '3px solid #C9A84C' : '2px solid transparent',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Buy button dynamics */}
                            <button onClick={() => window.open(getWhatsAppUrl(), '_blank')} style={{
                                width: '100%',
                                background: buttonColor,
                                color: buttonTextColor,
                                border: 'none',
                                padding: '20px',
                                borderRadius: '16px',
                                fontWeight: '900',
                                fontSize: '16px',
                                cursor: 'pointer',
                                boxShadow: `0 10px 30px ${buttonColor}30`,
                                transition: 'all 0.3s ease'
                            }} onMouseOver={e => e.currentTarget.style.boxShadow = `0 15px 40px ${buttonColor}60`} onMouseOut={e => e.currentTarget.style.boxShadow = `0 10px 30px ${buttonColor}30`}>
                                Commander cette carte → ({cardType === 'physical' ? '10 000 FCFA' : '7 000 FCFA'})
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PREUVE SOCIALE — BULLS DE MESSAGE */}
            <section style={{ padding: '120px 0', background: '#111118', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Les professionnels qui avancent <span style={{ color: '#C9A84C' }}>utilisent NFCrafter.</span>
                        </h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                        {/* Testimonial Bubble 1 */}
                        <div style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.03)', padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '4px', color: '#C9A84C' }}>★★★★★</div>
                            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                "Avant, je distribuais mes cartes de visite papier lors des cocktails d'affaires et la plupart finissaient jetées. Maintenant, les gens scannent ma carte NFCrafter, mon contact est directement mémorisé et ils parcourent mes conceptions de meubles. En 2 semaines, j'ai conclu 3 contrats importants !"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0A0A0F' }}>R</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Romuald K.</h4>
                                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Architecte, Cotonou</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial Bubble 2 */}
                        <div style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.03)', padding: '32px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '4px', color: '#C9A84C' }}>★★★★★</div>
                            <p style={{ margin: 0, color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                "La boutique WhatsApp intégrée à mon profil NFCrafter a complètement boosté mes ventes. Zéro commission, mes clientes parcourent mes articles et commandent d'un simple message WhatsApp. Je recommande les yeux fermés !"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#C9A84C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: '#0A0A0F' }}>M</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Mariam D.</h4>
                                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Vendeuse de Prêt-à-porter, Calavi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. TABLEAU COMPARATIF */}
            <section style={{ padding: '120px 0', background: '#0A0A0F' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Pourquoi NFCrafter <span style={{ color: '#C9A84C' }}>écrase la concurrence.</span>
                        </h2>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', color: '#FFFFFF' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ textAlign: 'left', padding: '20px', color: '#9CA3AF' }}>Critères</th>
                                    <th style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>Cartes Papier</th>
                                    <th style={{ textAlign: 'center', padding: '20px', color: '#9CA3AF' }}>Site E-commerce classique</th>
                                    <th style={{ textAlign: 'center', padding: '20px', color: '#C9A84C', background: 'rgba(201, 168, 76, 0.05)', fontWeight: '900' }}>🏆 NFCrafter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px', fontWeight: '700' }}>Partage instantané</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#10B981', background: 'rgba(201, 168, 76, 0.05)', fontWeight: 'bold' }}>✓ Oui (NFC)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px', fontWeight: '700' }}>Boutique intégrée</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#10B981' }}>✓</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#10B981', background: 'rgba(201, 168, 76, 0.05)', fontWeight: 'bold' }}>✓ Incluse</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px', fontWeight: '700' }}>Frais ou commission</td>
                                    <td style={{ textAlign: 'center', padding: '20px' }}>N/A</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#EF4444' }}>15% à 20%</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#10B981', background: 'rgba(201, 168, 76, 0.05)', fontWeight: 'bold' }}>✓ 0% commission</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '20px', fontWeight: '700' }}>Durée de vie</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#EF4444' }}>Se perd / se déchire</td>
                                    <td style={{ textAlign: 'center', padding: '20px' }}>N/A</td>
                                    <td style={{ textAlign: 'center', padding: '20px', color: '#10B981', background: 'rgba(201, 168, 76, 0.05)', fontWeight: 'bold' }}>✓ À vie</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 9. FOIRE AUX QUESTIONS (FAQ) */}
            <section id="faq" style={{ padding: '120px 0', background: '#111118' }}>
                <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#FFFFFF', letterSpacing: '-0.02em', margin: '0' }}>
                            Questions <span style={{ color: '#C9A84C' }}>Fréquentes</span>
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <details style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
                            <summary style={{ padding: '24px', fontWeight: '800', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                Est-ce compatible avec tous les téléphones ?
                            </summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6' }}>
                                Oui. Les téléphones récents disposent du NFC (un simple contact physique suffit). Pour les smartphones plus anciens, le QR code universel gravé au dos de votre carte assure une compatibilité totale.
                            </div>
                        </details>

                        <details style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
                            <summary style={{ padding: '24px', fontWeight: '800', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                Comment fonctionne la boutique WhatsApp ?
                            </summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6' }}>
                                Vous ajoutez vos articles avec photos et prix dans votre Espace Client NFCrafter. Vos clients parcourent votre boutique sur leur téléphone et cliquent sur commander. Cela vous envoie un message WhatsApp pré-rempli pour convenir de la livraison.
                            </div>
                        </details>

                        <details style={{ background: '#0D0D12', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '16px', overflow: 'hidden' }}>
                            <summary style={{ padding: '24px', fontWeight: '800', color: 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                                Que se passe-t-il si je change de numéro ou d'adresse ?
                            </summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#9CA3AF', fontSize: '15px', lineHeight: '1.6' }}>
                                Pas besoin de réimprimer votre carte ! Vous vous connectez à votre tableau de bord NFCrafter, vous modifiez vos coordonnées en 2 clics et la mise à jour est instantanée pour toutes les personnes détenant votre carte physique.
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* 10. FOOTER CTA */}
            <section style={{ padding: '120px 0', background: 'linear-gradient(180deg, #0A0A0F 0%, #111118 100%)', textAlign: 'center', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                    <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px', fontFamily: 'Outfit' }}>
                        Le futur du networking <span style={{ color: '#C9A84C' }}>vous attend.</span>
                    </h2>
                    <p style={{ color: '#9CA3AF', fontSize: '18px', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
                        Commandez votre carte Signature NFC en quelques secondes et commencez à impressionner vos futurs clients.
                    </p>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="#tarifs" style={{
                            background: 'linear-gradient(135deg, #C9A84C, #947225)',
                            color: '#0A0A0F',
                            padding: '18px 36px',
                            borderRadius: '16px',
                            fontWeight: '800',
                            fontSize: '16px',
                            textDecoration: 'none',
                            boxShadow: '0 10px 30px rgba(201, 168, 76, 0.2)'
                        }}>
                            Commander maintenant
                        </a>
                        <a href={`https://wa.me/${whatsappNumber}`} style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#FFFFFF',
                            padding: '18px 36px',
                            borderRadius: '16px',
                            fontWeight: '700',
                            fontSize: '16px',
                            textDecoration: 'none'
                        }}>
                            Nous contacter sur WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* 11. FOOTER */}
            <footer style={{ background: '#0A0A0F', padding: '40px 0', borderTop: '1px solid rgba(255,255,255,0.03)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#FFFFFF' }}>NFCrafter</span>
                    </div>
                    <span style={{ color: '#9CA3AF', fontSize: '13px' }}>Fait avec passion au Bénin 🇧🇯 pour toute l'Afrique. © 2026.</span>
                </div>
            </footer>

            {/* Sticky Mobile WhatsApp CTA */}
            <div style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 999,
                background: '#25D366',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(37, 211, 102, 0.4)',
                cursor: 'pointer',
                transition: 'transform 0.3s'
            }} onClick={() => window.open(`https://wa.me/${whatsappNumber}`, '_blank')} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                <svg viewBox="0 0 24 24" fill="white" style={{ width: '32px', height: '32px' }}>
                    <path d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.765.459 3.486 1.33 5.011L2 22l5.127-1.343c1.472.802 3.125 1.226 4.885 1.226 5.527 0 10.012-4.485 10.012-10.012C22.024 6.485 17.539 2 12.012 2zm6.059 14.398c-.25.702-1.246 1.285-1.721 1.344-.475.059-.95.089-2.73-.623-2.278-.91-3.704-3.21-3.818-3.364-.114-.154-.93-1.233-.93-2.353 0-1.12.583-1.67.792-1.898.208-.228.455-.287.607-.287.152 0 .303.003.435.01.135.007.316-.051.495.38.185.443.633 1.543.687 1.654.054.111.089.24.015.388-.074.148-.111.24-.222.37-.111.13-.233.29-.332.39-.1.1-.205.21-.089.41.116.2.515.85.1 1.488.497.443.917.72 1.396.953.479.232.571.2.782-.047.21-.247.917-1.077 1.164-1.448.247-.37.495-.308.825-.185.33.123 2.102 1.025 2.463 1.205.36.18.601.272.688.423.087.151.087.876-.163 1.578z" />
                </svg>
            </div>
        </div>
    );
}
