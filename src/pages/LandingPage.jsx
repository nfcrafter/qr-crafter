import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CARD_COLORS = [
    { id: 'black', name: 'Noir Onyx', hex: '#111827', imgCombined: '/assets/cards/black-combined.png', imgRecto: '/assets/cards/black-recto.png', imgVerso: '/assets/cards/black-verso.png' },
    { id: 'white', name: 'Blanc Neige', hex: '#F9FAFB', hexText: '#111827', imgCombined: '/assets/cards/white-combined.png', imgRecto: '/assets/cards/white-recto.png', imgVerso: '/assets/cards/white-verso.png' },
    { id: 'blue', name: 'Bleu Océan', hex: '#2563EB', imgCombined: '/assets/cards/blue-combined.png', imgRecto: '/assets/cards/blue-recto.png', imgVerso: '/assets/cards/blue-verso.png' },
    { id: 'gold', name: 'Or Premium', hex: '#D97706', imgCombined: '/assets/cards/gold-combined.png', imgRecto: '/assets/cards/gold-recto.png', imgVerso: '/assets/cards/gold-verso.png' },
    { id: 'red', name: 'Rouge Rubis', hex: '#DC2626', imgCombined: '/assets/cards/red-combined.png', imgRecto: '/assets/cards/red-recto.png', imgVerso: '/assets/cards/red-verso.png' },
    { id: 'green', name: 'Vert Émeraude', hex: '#059669', imgCombined: '/assets/cards/green-combined.png', imgRecto: '/assets/cards/green-recto.png', imgVerso: '/assets/cards/green-verso.png' },
    { id: 'purple', name: 'Violet Améthyste', hex: '#7C3AED', imgCombined: '/assets/cards/purple-combined.png', imgRecto: '/assets/cards/purple-recto.png', imgVerso: '/assets/cards/purple-verso.png' },
    { id: 'pink', name: 'Rose Poudré', hex: '#DB2777', imgCombined: '/assets/cards/pink-combined.png', imgRecto: '/assets/cards/pink-recto.png', imgVerso: '/assets/cards/pink-verso.png' }
];

const HERO_PROFILES = [
    {
        name: 'Romuald K.',
        role: "Architecte d'intérieur",
        color: '#111827',
        avatarBg: 'linear-gradient(135deg, #1F2937, #111827)',
        accent: '#D97706',
        letter: 'R',
        links: ['Mon Portfolio Mobilier', 'Prendre RDV (3D/Plan)']
    },
    {
        name: 'Dr. Clara M.',
        role: 'Chirurgien Dentiste',
        color: '#FFFFFF',
        textColor: '#111827',
        avatarBg: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
        accent: '#06B6D4',
        letter: 'C',
        links: ['Cabinet & Tarifs', 'Prendre RDV en ligne']
    },
    {
        name: 'Thomas L.',
        role: 'Développeur Fullstack',
        color: '#2563EB',
        avatarBg: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
        accent: '#2563EB',
        letter: 'T',
        links: ['Mon GitHub / Portfolio', 'Mes Services de Dev']
    },
    {
        name: 'Me. Antoine S.',
        role: "Avocat d'Affaires",
        color: '#D97706',
        avatarBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
        accent: '#D97706',
        letter: 'A',
        links: ['Mon Cabinet à Cotonou', 'Consultation juridique']
    },
    {
        name: 'Chef Damien B.',
        role: 'Gastronomie & Traiteur',
        color: '#DC2626',
        avatarBg: 'linear-gradient(135deg, #EF4444, #DC2626)',
        accent: '#DC2626',
        letter: 'D',
        links: ['Menu de la semaine', 'Commander un Buffet']
    },
    {
        name: 'Boutique Bio',
        role: 'Épicerie & Bien-être',
        color: '#059669',
        avatarBg: 'linear-gradient(135deg, #10B981, #059669)',
        accent: '#059669',
        letter: 'B',
        links: ['Catalogue Produits', 'Commander sur WhatsApp']
    },
    {
        name: 'Sonia G.',
        role: 'Photographe & Vidéaste',
        color: '#7C3AED',
        avatarBg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        accent: '#7C3AED',
        letter: 'S',
        links: ['Galerie Mariages / Pro', 'Réserver une Séance']
    },
    {
        name: 'Mélissa K.',
        role: 'Beauty Studio & Spa',
        color: '#DB2777',
        avatarBg: 'linear-gradient(135deg, #EC4899, #DB2777)',
        accent: '#DB2777',
        letter: 'M',
        links: ['Tarifs Soins & Ongles', 'Réserver un massage']
    }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [session, setSession] = useState(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [cardType, setCardType] = useState('physical'); // 'physical', 'digital', 'pro', 'corporate'
    const [activeDemoTab, setActiveDemoTab] = useState('visitor'); // 'visitor' or 'dashboard'
    
    // States for Hero Audacious flipping color-shifting card
    const [heroColorIndex, setHeroColorIndex] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Loop for audacious hero card flip & color change
        // Animation is 6s full rotation (360deg). Edge points are at 1.5s (90deg) and 4.5s (270deg).
        // Change color every 3s (half-turn), starting with a 1.5s initial offset.
        let colorInterval;
        const offsetTimeout = setTimeout(() => {
            setHeroColorIndex(prev => (prev + 1) % CARD_COLORS.length);
            colorInterval = setInterval(() => {
                setHeroColorIndex(prev => (prev + 1) % CARD_COLORS.length);
            }, 3000);
        }, 1500);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription?.unsubscribe();
            clearTimeout(offsetTimeout);
            if (colorInterval) clearInterval(colorInterval);
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
        } else if (type === 'pro') {
            message = `Bonjour NFCrafter, je souhaite commander le Pack Pro (3 Cartes) à 25.000f.`;
        } else if (type === 'corporate') {
            message = `Bonjour NFCrafter, je souhaite obtenir un devis pour la solution Corporate (10+ cartes).`;
        } else {
            message = `Bonjour NFCrafter, je souhaite souscrire au Profil Digital Unique à 7.000f.`;
        }
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    const heroCard = CARD_COLORS[heroColorIndex];

    return (
        <div style={{ background: '#F8FAFC', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Outfit', 'Inter', sans-serif", color: '#0F172A', position: 'relative' }}>
            
            {/* Glowing background orbs for frosted glass pop */}
            <div style={{ position: 'absolute', top: '10%', left: '5%', width: '40vw', height: '40vw', borderRadius: '50%', background: '#EEF2FF', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', top: '40%', right: '5%', width: '35vw', height: '35vw', borderRadius: '50%', background: '#F5F3FF', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', left: '15%', width: '38vw', height: '38vw', borderRadius: '50%', background: '#E0F2FE', filter: 'blur(100px)', zIndex: 0, pointerEvents: 'none' }}></div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
                
                html { scroll-behavior: smooth; }

                /* Premium Frosted White Glassmorphism styling */
                .glass-nav {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(26, 18, 101, 0.05);
                    transition: all 0.3s ease;
                }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 24px;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 10px 30px rgba(26, 18, 101, 0.04);
                }
                .glass-card:hover {
                    border-color: rgba(99, 102, 241, 0.2);
                    box-shadow: 0 20px 45px rgba(26, 18, 101, 0.08);
                    transform: translateY(-5px);
                }

                .bento-card {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 28px;
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(26, 18, 101, 0.04);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .bento-card:hover {
                    transform: translateY(-8px);
                    border-color: rgba(99, 102, 241, 0.3);
                    box-shadow: 0 30px 60px rgba(26, 18, 101, 0.12);
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

                .gallery-row {
                    display: flex;
                    gap: 20px;
                    width: max-content;
                    animation: infiniteScroll 45s linear infinite;
                }
                .gallery-row:hover {
                    animation-play-state: paused;
                }

                /* Custom Scrollbar */
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #F8FAFC; }
                ::-webkit-scrollbar-thumb { background: #1A1265; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #6366F1; }

                /* Details panel restyling */
                details {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.6);
                    border-radius: 16px;
                    margin-bottom: 16px;
                    transition: all 0.3s;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.01);
                }
                details[open] {
                    background: rgba(255, 255, 255, 0.9);
                    box-shadow: 0 10px 30px rgba(26, 18, 101, 0.05);
                }

                /* Responsive designs & Global fixes */
                .responsive-section {
                    padding: 120px 0;
                }
                .responsive-h2 {
                    font-size: 44px;
                    line-height: 1.2;
                }
                .responsive-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 48px;
                }

                @media (max-width: 768px) {
                    .responsive-section {
                        padding: 60px 0 !important;
                    }
                    .responsive-h2 {
                        font-size: 28px !important;
                    }
                    .bento-grid {
                        grid-template-columns: 1fr !important;
                        gap: 16px !important;
                    }
                    .bento-card {
                        grid-column: span 1 !important;
                        min-height: auto !important;
                        padding: 24px !important;
                    }
                    .hero-title {
                        font-size: 38px !important;
                        line-height: 1.15 !important;
                    }
                    .desktop-menu {
                        display: none !important;
                    }
                    .hero-buttons {
                        flex-direction: column !important;
                        width: 100% !important;
                        gap: 12px !important;
                    }
                    .hero-buttons a {
                        width: 100% !important;
                        text-align: center !important;
                        padding: 16px 24px !important;
                    }
                    .glass-nav {
                        height: 70px !important;
                    }
                    .nav-container {
                        padding: 0 16px !important;
                    }
                    .nav-actions {
                        gap: 8px !important;
                    }
                    .nav-actions button, .nav-actions a {
                        padding: 8px 14px !important;
                        font-size: 13px !important;
                    }
                    .card-visual-wrapper {
                        transform: scale(0.85);
                        margin: -20px 0;
                    }
                    .config-wrapper {
                        grid-template-columns: 1fr !important;
                        gap: 24px !important;
                    }
                }

                @keyframes continuousSpin {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }

                .spin-card-3d {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    animation: continuousSpin 6s linear infinite;
                    border-radius: 16px;
                    box-shadow: 0 30px 60px rgba(26, 18, 101, 0.18);
                }
            `}</style>

            {/* 1. NAVIGATION BAR */}
            <nav className="glass-nav" style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, height: '80px', display: 'flex', alignItems: 'center' }}>
                <div className="nav-container" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #1A1265, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '20px', color: 'white', boxShadow: '0 0 20px rgba(26, 18, 101, 0.2)' }}>N</div>
                        <span style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.03em', background: 'linear-gradient(90deg, #1A1265, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NFCrafter</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-menu">
                        <a href="#features" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>Fonctionnalités</a>
                        <a href="#demo" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>Profil Démo</a>
                        <a href="#tarifs" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>Tarifs</a>
                        <a href="#faq" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>FAQ</a>
                    </div>

                    <div className="nav-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {session ? (
                            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(26, 18, 101, 0.15)', color: '#1A1265', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Tableau de bord</button>
                        ) : (
                            <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(26, 18, 101, 0.15)', color: '#1A1265', padding: '10px 20px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer' }}>Connexion</button>
                        )}
                        <a href="#tarifs" style={{
                            background: 'linear-gradient(135deg, #1A1265, #6366F1)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '14px',
                            textDecoration: 'none',
                            boxShadow: '0 4px 15px rgba(26, 18, 101, 0.15)',
                            transition: 'all 0.3s ease',
                            display: 'inline-block'
                        }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 18, 101, 0.25)'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 18, 101, 0.15)'}>
                            Commander
                        </a>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION — AUDACIOUS 3D CARD FLIP LOOP (Light White Glass theme) */}
            <section className="responsive-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '100px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                    {/* Hero Left Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(26, 18, 101, 0.15)', background: 'rgba(26, 18, 101, 0.03)', padding: '6px 16px', borderRadius: '100px', width: 'fit-content' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A1265', animation: 'pulseBadge 2s infinite' }}></span>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#1A1265' }}>L'identité digitale des pros d'élite</span>
                        </div>

                        <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.05', margin: 0, color: '#0F172A' }}>
                            Votre dernière <br />
                            <span style={{ background: 'linear-gradient(90deg, #1A1265, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>carte de visite. À vie.</span>
                        </h1>

                        <p style={{ fontSize: '17px', color: '#475569', lineHeight: '1.6', margin: 0, maxWidth: '500px' }}>
                            Partagez vos contacts en 1 seconde. Vendez vos services directement via WhatsApp. Impressionnez vos futurs clients sans jamais avoir besoin de réimprimer.
                        </p>

                        <div className="hero-buttons" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '12px' }}>
                            <a href="#tarifs" style={{
                                background: 'linear-gradient(135deg, #1A1265, #6366F1)',
                                color: 'white',
                                padding: '18px 36px',
                                borderRadius: '16px',
                                fontWeight: '800',
                                fontSize: '16px',
                                textDecoration: 'none',
                                boxShadow: '0 10px 30px rgba(26, 18, 101, 0.15)',
                                transition: 'transform 0.2s, box-shadow 0.2s'
                            }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                                Créer mon profil — 7 000 FCFA
                            </a>
                            <a href="#demo" style={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                border: '1px solid rgba(26, 18, 101, 0.15)',
                                color: '#1A1265',
                                padding: '18px 36px',
                                borderRadius: '16px',
                                fontWeight: '700',
                                fontSize: '16px',
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(26, 18, 101, 0.03)'
                            }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)'; e.currentTarget.style.borderColor = 'rgba(26, 18, 101, 0.3)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)'; e.currentTarget.style.borderColor = 'rgba(26, 18, 101, 0.15)'; }}>
                                Voir une démo live →
                            </a>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', color: '#475569', fontSize: '13px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <span>✓ Paiement Unique</span>
                            <span>• Aucun Abonnement</span>
                            <span>• Expédié sous 48h à Cotonou</span>
                        </div>
                    </div>

                    {/* Hero Right Visuals - Audacious Color-shifting 3D Flipper with responsive scale wrapper */}
                    <div className="card-visual-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                        <div style={{ position: 'relative', width: '280px', height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            
                            {/* Perspective Card Container */}
                            <div style={{
                                perspective: '1000px',
                                width: '280px',
                                height: '175px',
                                position: 'absolute',
                                top: '40px',
                                zIndex: 5,
                            }}>
                                {/* Card Flipper Div */}
                                <div className="spin-card-3d">
                                    {/* Front Side (Recto) */}
                                    <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        borderRadius: '16px',
                                        overflow: 'hidden'
                                    }}>
                                        <img 
                                            src={heroCard.imgRecto} 
                                            alt={`NFCrafter Carte ${heroCard.name} Recto`} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = '/card-recto.png';
                                            }}
                                        />
                                    </div>

                                    {/* Back Side (Verso) */}
                                    <div style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)',
                                        borderRadius: '16px',
                                        overflow: 'hidden'
                                    }}>
                                        <img 
                                            src={heroCard.imgVerso} 
                                            alt={`NFCrafter Carte ${heroCard.name} Verso`} 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = '/card-recto.png';
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Phone Mockup floating slightly below */}
                            <div style={{
                                width: '170px',
                                height: '340px',
                                background: HERO_PROFILES[heroColorIndex].color === '#FFFFFF' ? '#F8FAFC' : '#0D0D12',
                                borderRadius: '28px',
                                border: HERO_PROFILES[heroColorIndex].color === '#FFFFFF' ? '6px solid #E2E8F0' : '6px solid #1F2937',
                                position: 'absolute',
                                bottom: '0px',
                                right: '-20px',
                                zIndex: 2,
                                boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                                overflow: 'hidden',
                                padding: '16px 12px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                transition: 'all 0.5s ease'
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '50%',
                                    background: HERO_PROFILES[heroColorIndex].avatarBg,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '900',
                                    fontSize: '13px',
                                    color: 'white',
                                    marginBottom: '12px',
                                    boxShadow: `0 4px 10px ${HERO_PROFILES[heroColorIndex].accent}30`,
                                    transition: 'all 0.5s ease'
                                }}>
                                    {HERO_PROFILES[heroColorIndex].letter}
                                </div>

                                {/* Name */}
                                <div style={{
                                    fontSize: '12px',
                                    fontWeight: '800',
                                    color: HERO_PROFILES[heroColorIndex].textColor || 'white',
                                    marginBottom: '3px',
                                    textAlign: 'center',
                                    transition: 'all 0.5s ease'
                                }}>
                                    {HERO_PROFILES[heroColorIndex].name}
                                </div>

                                {/* Role */}
                                <div style={{
                                    fontSize: '9px',
                                    fontWeight: '600',
                                    color: HERO_PROFILES[heroColorIndex].accent,
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    marginBottom: '16px',
                                    textAlign: 'center',
                                    transition: 'all 0.5s ease'
                                }}>
                                    {HERO_PROFILES[heroColorIndex].role}
                                </div>

                                {/* Action button */}
                                <div style={{
                                    width: '100%',
                                    height: '28px',
                                    background: HERO_PROFILES[heroColorIndex].accent,
                                    color: 'white',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '9px',
                                    fontWeight: '800',
                                    marginBottom: '14px',
                                    boxShadow: `0 4px 10px ${HERO_PROFILES[heroColorIndex].accent}30`,
                                    transition: 'all 0.5s ease'
                                }}>
                                    Enregistrer
                                </div>

                                {/* Dynamic custom links */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                                    {HERO_PROFILES[heroColorIndex].links.map((link, idx) => (
                                        <div key={idx} style={{
                                            background: HERO_PROFILES[heroColorIndex].color === '#FFFFFF' ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)',
                                            padding: '8px 10px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.5s ease',
                                            border: HERO_PROFILES[heroColorIndex].color === '#FFFFFF' ? '1px solid rgba(0,0,0,0.04)' : 'none'
                                        }}>
                                            <div style={{
                                                width: '6px',
                                                height: '6px',
                                                borderRadius: '50%',
                                                background: HERO_PROFILES[heroColorIndex].accent,
                                                transition: 'all 0.5s ease'
                                            }}></div>
                                            <span style={{
                                                fontSize: '9px',
                                                fontWeight: '600',
                                                color: HERO_PROFILES[heroColorIndex].textColor || 'white',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                transition: 'all 0.5s ease'
                                            }}>{link}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Infinite Ticker Banner */}
                <div style={{ background: 'rgba(26, 18, 101, 0.03)', borderTop: '1px solid rgba(26, 18, 101, 0.05)', borderBottom: '1px solid rgba(26, 18, 101, 0.05)', padding: '20px 0', marginTop: '100px', overflow: 'hidden' }}>
                    <div className="ticker-row">
                        {[1, 2, 3, 4].map(idx => (
                            <React.Fragment key={idx}>
                                <span style={{ color: '#1A1265', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ 500+ PROFESSIONNELS ACTIFS</span>
                                <span style={{ color: '#475569', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ LIVRAISON 48H COTONOU</span>
                                <span style={{ color: '#6366F1', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ ZÉRO ABONNEMENT</span>
                                <span style={{ color: '#1A1265', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ BOUTIQUE WHATSAPP INCLUSE</span>
                                <span style={{ color: '#475569', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ FABRIQUÉ POUR L'AFRIQUE 🇧🇯</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. SECTION PROBLÈME — CONSTAT BRUTAL */}
            <section className="responsive-section" style={{ background: 'rgba(255,255,255,0.5)', position: 'relative', borderTop: '1px solid rgba(26, 18, 101, 0.03)', borderBottom: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Les cartes papier vous font <span style={{ color: '#DC2626' }}>perdre des clients</span>.
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Chaque rencontre physique manquée est une opportunité d'affaires qui s'envole.
                        </p>
                    </div>

                    <div className="responsive-grid">
                        {/* Column Left - The Nightmare of Paper */}
                        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '4px solid #EF4444' }}>
                            <h3 style={{ color: '#EF4444', fontSize: '22px', fontWeight: '800', margin: 0 }}>Avant NFCrafter</h3>
                            
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>88% finissent à la poubelle</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Les cartes papier se perdent ou finissent froissées dans un sac en moins de 7 jours.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>La dictée pénible du numéro</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>"Zéro-Six..." Vous épelez pendant 5 minutes. Le prospect note mal votre nom et ne vous rappelle jamais.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Coûteuse réimpression</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Un simple changement de numéro ou de logo vous oblige à réimprimer tout un lot (10 000f perdus).</p>
                                </div>
                            </div>
                        </div>

                        {/* Column Right - The Revolution NFCrafter */}
                        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px', borderLeft: '4px solid #1A1265' }}>
                            <h3 style={{ color: '#1A1265', fontSize: '22px', fontWeight: '800', margin: 0 }}>Avec NFCrafter</h3>
                            
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(26, 18, 101, 0.05)', color: '#1A1265', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Un simple "Tap" magique</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>La carte effleure le téléphone de votre prospect, votre profil professionnel s'ouvre en 1 seconde chrono.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(26, 18, 101, 0.05)', color: '#1A1265', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Enregistrement direct</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Votre contact (numéro, email, site web) est enregistré automatiquement dans leur répertoire sans aucune erreur.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(26, 18, 101, 0.05)', color: '#1A1265', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Boutique WhatsApp & Commande</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Le client navigue dans votre mini-site, choisit un produit, commande via WhatsApp, et vous le livrez.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REAL-LIFE PRODUCT GALLERY SECTION (Using gallery-1 to gallery-8) */}
            <section style={{ padding: '80px 0', overflow: 'hidden', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', marginBottom: '36px', textAlign: 'center' }}>
                    <h2 className="responsive-h2" style={{ fontWeight: '800', color: '#0F172A' }}>Nos cartes en action</h2>
                    <p style={{ color: '#475569', marginTop: '8px' }}>Découvrez la qualité réelle et les finitions exceptionnelles de nos cartes Signature.</p>
                </div>
                
                <div className="gallery-row">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <div key={num} className="glass-card" style={{ width: '280px', height: '180px', flexShrink: 0, overflow: 'hidden', padding: '8px', background: 'rgba(255,255,255,0.8)' }}>
                            <img 
                                src={`/gallery-${num}.jpg`} 
                                alt={`NFCrafter Real ${num}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                                onError={(e) => { e.target.src = '/placeholder-qr-custom.jpg'; }}
                            />
                        </div>
                    ))}
                    {/* Repeat for seamless infinite scrolling */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <div key={`dup-${num}`} className="glass-card" style={{ width: '280px', height: '180px', flexShrink: 0, overflow: 'hidden', padding: '8px', background: 'rgba(255,255,255,0.8)' }}>
                            <img 
                                src={`/gallery-${num}.jpg`} 
                                alt={`NFCrafter Real ${num}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                                onError={(e) => { e.target.src = '/placeholder-qr-custom.jpg'; }}
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. SECTION ECOSYSTÈME — BENTO GRID WITH 10 FULL FEATURES (White Glass Theme) */}
            <section id="features" className="responsive-section" style={{ position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Pas juste une carte. <span style={{ color: '#1A1265' }}>Un écosystème complet.</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Découvrez les 10 fonctionnalités clés de NFCrafter qui propulsent votre visibilité et vos ventes au Bénin.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        
                        {/* 1. Partage NFC (L - 2 columns) */}
                        <div className="bento-card" style={{ gridColumn: 'span 2', minHeight: '320px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                <div style={{ maxWidth: '380px' }}>
                                    <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 1</span>
                                    <h3 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Technologie NFC Sans App</h3>
                                    <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Partagez vos coordonnées instantanément en effleurant n'importe quel smartphone moderne. Aucune application à télécharger pour votre interlocuteur. Transmission 1 seconde.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26, 18, 101, 0.05)', padding: '20px', borderRadius: '20px' }}>
                                    <div style={{ width: '40px', height: '40px', color: '#1A1265' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>` }} />
                                </div>
                            </div>
                        </div>

                        {/* 2. QR Code de Secours (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '320px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 2</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>QR Code Universel</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Gravé au dos de votre carte de signature, il assure 100% de compatibilité, même avec les téléphones plus anciens sans puce NFC.
                            </p>
                        </div>

                        {/* 3. Boutique WhatsApp sans commission (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 3</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Boutique WhatsApp</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Vendez vos produits directement. Vos clients consultent vos images, choisissent et commandent directement sur WhatsApp. ZÉRO commission sur vos ventes.
                            </p>
                        </div>

                        {/* 4. Mini-Site Pro Inclus (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 4</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Mini-Site Web Pro</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Votre vitrine professionnelle créée automatiquement en ligne. Présentez vos horaires, votre localisation et vos formulaires de contact.
                            </p>
                        </div>

                        {/* 5. Google Business Profile & Référencement (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 5</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Avis & Google Business</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Récupérez des avis clients Google instantanément lors des rencontres physiques, et apparaissez plus haut dans les recherches locales.
                            </p>
                        </div>

                        {/* 6. Portfolio & Galerie d'images */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 6</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Portfolio Visuel</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Exposez vos réalisations en haute définition (books, photos de projets, réalisations graphiques, plats).
                            </p>
                        </div>

                        {/* 7. Certifications & Badges */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 7</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Certifications & Badges</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Affichez vos diplômes officiels ou labels de compétences pour inspirer une confiance immédiate chez vos prospects.
                            </p>
                        </div>

                        {/* 8. Statistiques scans live */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 8</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Analytics Temps Réel</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Suivez vos statistiques de scan en direct pour mesurer l'efficacité de votre networking lors de vos événements.
                            </p>
                        </div>

                        {/* 9. Mise à jour illimitée à vie */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 9</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Mise à jour Gratuite</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Modifiez vos numéros, réseaux et tarifs en 2 clics. Votre profil est actualisé instantanément, sans aucune réimpression.
                            </p>
                        </div>

                        {/* 10. Prise de RDV simplifiée */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <span style={{ color: '#1A1265', fontWeight: '700', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>Fonctionnalité 10</span>
                                <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Prise de Rendez-vous</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Intégrez un calendrier (type Calendly) ou un formulaire de réservation de services directement sur votre profil public.
                            </p>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. DÉMO LIVE — SCANNEZ & VOYEZ */}
            <section id="demo" className="responsive-section" style={{ background: 'rgba(255,255,255,0.5)', position: 'relative', borderTop: '1px solid rgba(26, 18, 101, 0.03)', borderBottom: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Voici ce que <span style={{ color: '#1A1265' }}>vos contacts verront.</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Découvrez notre interface mobile d'exception et le panneau d'administration.
                        </p>
                    </div>

                    <div className="responsive-grid" style={{ gap: '40px', alignItems: 'center' }}>
                        
                        {/* Left Side - Interactive 3D Phone Mockup */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                                width: '270px',
                                height: '540px',
                                background: '#0F172A',
                                borderRadius: '36px',
                                border: '8px solid #1F2937',
                                boxShadow: '0 30px 80px rgba(26, 18, 101, 0.08)',
                                position: 'relative',
                                overflow: 'hidden',
                                padding: '24px 16px',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* Notch */}
                                <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '90px', height: '18px', background: '#1F2937', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', zIndex: 10 }}></div>

                                {activeDemoTab === 'visitor' ? (
                                    /* Visitor View Mockup */
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', overflowY: 'auto' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1265, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '22px', color: 'white', marginTop: '20px', marginBottom: '12px', boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' }}>R</div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '800', color: 'white' }}>Romuald K.</h3>
                                        <span style={{ fontSize: '11px', color: '#6366F1', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Architecte d'intérieur</span>

                                        <button style={{ width: '100%', background: '#6366F1', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '800', fontSize: '13px', cursor: 'pointer', marginBottom: '20px' }}>
                                            Enregistrer le Contact
                                        </button>

                                        {/* Fake Links */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '18px', height: '18px', background: '#6366F1', borderRadius: '4px' }}></div>
                                                <span style={{ fontSize: '12px', color: 'white' }}>Mon Portfolio en Ligne</span>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '18px', height: '18px', background: '#6366F1', borderRadius: '4px' }}></div>
                                                <span style={{ fontSize: '12px', color: 'white' }}>Boutique de nos créations</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Owner View Mockup (Dashboard) */
                                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: '900', margin: '20px 0 12px 0', color: '#6366F1' }}>Éditer le profil</h4>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ border: '1px dashed rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'white' }}>✥ En-tête de profil</span>
                                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Modifier</span>
                                            </div>
                                            <div style={{ border: '1px dashed rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'white' }}>✥ Bouton Contact</span>
                                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Modifier</span>
                                            </div>
                                            <div style={{ border: '1px dashed rgba(99, 102, 241, 0.4)', background: 'rgba(99, 102, 241, 0.05)', padding: '10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontSize: '11px', color: 'white' }}>✥ Section Portfolio</span>
                                                <span style={{ fontSize: '10px', color: '#9CA3AF' }}>Modifier</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Side - Toggles */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div>
                                <h3 className="responsive-h2" style={{ fontWeight: '800', fontFamily: 'Outfit', color: '#0F172A', margin: '0 0 16px 0' }}>Basculez entre les vues</h3>
                                <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                                    Visualisez le site du côté visiteur ou accédez à l'administration simplifiée pour modifier vos contenus en direct depuis votre dashboard NFCrafter.
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button onClick={() => setActiveDemoTab('visitor')} style={{
                                    flex: 1,
                                    background: activeDemoTab === 'visitor' ? 'linear-gradient(135deg, #1A1265, #6366F1)' : 'rgba(26, 18, 101, 0.03)',
                                    border: activeDemoTab === 'visitor' ? 'none' : '1px solid rgba(26, 18, 101, 0.15)',
                                    color: activeDemoTab === 'visitor' ? 'white' : '#1A1265',
                                    padding: '14px',
                                    borderRadius: '12px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}>
                                    Vue Visiteur
                                </button>
                                <button onClick={() => setActiveDemoTab('dashboard')} style={{
                                    flex: 1,
                                    background: activeDemoTab === 'dashboard' ? 'linear-gradient(135deg, #1A1265, #6366F1)' : 'rgba(26, 18, 101, 0.03)',
                                    border: activeDemoTab === 'dashboard' ? 'none' : '1px solid rgba(26, 18, 101, 0.15)',
                                    color: activeDemoTab === 'dashboard' ? 'white' : '#1A1265',
                                    padding: '14px',
                                    borderRadius: '12px',
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

            {/* 6. CONFIGURATEUR DE CARTE — CLEAN DYNAMIC PHOTO DISPLAY (Loads specific color-combined image) */}
            <section id="tarifs" className="responsive-section" style={{ position: 'relative', overflow: 'hidden' }}>
                {/* Dynamic radial glow behind color select */}
                <div style={{ position: 'absolute', top: '50%', left: '30%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', borderRadius: '50%', background: `radial-gradient(circle, ${buttonColor}12 0%, transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none', zIndex: 0, transition: 'background 0.5s ease' }} />

                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Choisissez <span style={{ color: '#1A1265' }}>votre identité.</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Configurez la couleur de votre carte physique et valisez votre offre.
                        </p>
                    </div>

                    <div className="config-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'center' }}>
                        
                        {/* Configurator Visualizer Left - Static display of the dynamic color combined image */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '380px',
                                borderRadius: '20px',
                                boxShadow: '0 30px 60px rgba(26, 18, 101, 0.1)',
                                overflow: 'hidden',
                                background: '#FFFFFF',
                                border: '1px solid rgba(26, 18, 101, 0.05)'
                            }}>
                                <img 
                                    src={activeColor.imgCombined} 
                                    alt={`NFCrafter Carte ${activeColor.name} Recto Verso Réel`} 
                                    style={{ width: '100%', height: 'auto', display: 'block', transition: 'opacity 0.3s ease' }}
                                    onError={(e) => {
                                        /* Falls back to generic card-recto image if color-combined photo not loaded yet */
                                        e.target.src = '/card-recto.png';
                                    }}
                                />
                            </div>
                        </div>

                        {/* Configurator Controls Right */}
                        <div className="glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Step 1: Pack Selection */}
                            <div>
                                <span style={{ color: '#475569', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Étape 1 : Choisir le Pack</span>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    <div onClick={() => setCardType('digital')} style={{
                                        flex: 1,
                                        minWidth: '130px',
                                        border: cardType === 'digital' ? '2px solid #1A1265' : '1px solid rgba(26, 18, 101, 0.1)',
                                        background: cardType === 'digital' ? 'rgba(26, 18, 101, 0.03)' : 'transparent',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px'
                                    }}>
                                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>Pack Digital</span>
                                        <span style={{ color: '#1A1265', fontWeight: '900', fontSize: '16px' }}>7 000 FCFA</span>
                                    </div>
                                    <div onClick={() => setCardType('physical')} style={{
                                        flex: 1,
                                        minWidth: '130px',
                                        border: cardType === 'physical' ? '2px solid #1A1265' : '1px solid rgba(26, 18, 101, 0.1)',
                                        background: cardType === 'physical' ? 'rgba(26, 18, 101, 0.03)' : 'transparent',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '4px',
                                        position: 'relative'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-10px', right: '10px', background: '#1A1265', color: 'white', fontSize: '8px', fontWeight: '800', padding: '2px 6px', borderRadius: '100px', textTransform: 'uppercase' }}>Populaire</div>
                                        <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>Pack Signature</span>
                                        <span style={{ color: '#1A1265', fontWeight: '900', fontSize: '16px' }}>10 000 FCFA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Step 2: Color Picker (Only visible if physical pack is selected) */}
                            {cardType === 'physical' && (
                                <div>
                                    <span style={{ color: '#475569', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Étape 2 : Couleur de la carte — <span style={{ color: '#1A1265' }}>{activeColor.name}</span></span>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        {CARD_COLORS.map((color, index) => (
                                            <div
                                                key={color.id}
                                                onClick={() => setSelectedColorIndex(index)}
                                                style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    background: color.hex,
                                                    cursor: 'pointer',
                                                    border: selectedColorIndex === index ? '3px solid #1A1265' : '2px solid transparent',
                                                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
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
                                padding: '16px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '15px',
                                cursor: 'pointer',
                                boxShadow: `0 10px 30px ${buttonColor}30`,
                                transition: 'all 0.3s ease'
                            }} onMouseOver={e => e.currentTarget.style.boxShadow = `0 15px 40px ${buttonColor}50`} onMouseOut={e => e.currentTarget.style.boxShadow = `0 10px 30px ${buttonColor}30`}>
                                Commander cette carte → ({cardType === 'physical' ? '10 000 FCFA' : '7 000 FCFA'})
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. PREUVE SOCIALE — BULLS DE MESSAGE */}
            <section className="responsive-section" style={{ background: 'rgba(255,255,255,0.5)', position: 'relative', borderTop: '1px solid rgba(26, 18, 101, 0.03)', borderBottom: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Les professionnels qui avancent <span style={{ color: '#1A1265' }}>utilisent NFCrafter.</span>
                        </h2>
                    </div>

                    <div className="responsive-grid" style={{ gap: '32px' }}>
                        {/* Testimonial Bubble 1 */}
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '4px', color: '#1A1265' }}>★★★★★</div>
                            <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                "Avant, je distribuais mes cartes de visite papier lors des cocktails d'affaires et la plupart finissaient jetées. Maintenant, les gens scannent ma carte NFCrafter, mon contact est directement mémorisé et ils parcourent mes conceptions de meubles. En 2 semaines, j'ai conclu 3 contrats importants !"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1265, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white' }}>R</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Romuald K.</h4>
                                    <span style={{ fontSize: '12px', color: '#475569' }}>Architecte, Cotonou</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial Bubble 2 */}
                        <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', gap: '4px', color: '#1A1265' }}>★★★★★</div>
                            <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                "La boutique WhatsApp intégrée à mon profil NFCrafter a complètement boosté mes ventes. Zéro commission, mes clientes parcourent mes articles et commandent d'un simple message WhatsApp. Je recommande les yeux fermés !"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1265, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', color: 'white' }}>M</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Mariam D.</h4>
                                    <span style={{ fontSize: '12px', color: '#475569' }}>Vendeuse de Prêt-à-porter, Calavi</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 8. TABLEAU COMPARATIF */}
            <section className="responsive-section" style={{ position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Pourquoi NFCrafter <span style={{ color: '#1A1265' }}>écrase la concurrence.</span>
                        </h2>
                    </div>

                    <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px', color: '#0F172A' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.08)' }}>
                                    <th style={{ textAlign: 'left', padding: '16px', color: '#475569', fontSize: '14px' }}>Critères</th>
                                    <th style={{ textAlign: 'center', padding: '16px', color: '#475569', fontSize: '14px' }}>Cartes Papier</th>
                                    <th style={{ textAlign: 'center', padding: '16px', color: '#475569', fontSize: '14px' }}>Site E-commerce classique</th>
                                    <th style={{ textAlign: 'center', padding: '16px', color: '#1A1265', background: 'rgba(26, 18, 101, 0.03)', fontWeight: '900', fontSize: '14px' }}>🏆 NFCrafter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Partage instantané</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981', background: 'rgba(26, 18, 101, 0.03)', fontWeight: 'bold', fontSize: '14px' }}>✓ Oui (NFC)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Boutique intégrée</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981' }}>✓</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981', background: 'rgba(26, 18, 101, 0.03)', fontWeight: 'bold', fontSize: '14px' }}>✓ Incluse</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Frais ou commission</td>
                                    <td style={{ textAlign: 'center', padding: '16px', fontSize: '14px' }}>N/A</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444', fontSize: '14px' }}>15% à 20%</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981', background: 'rgba(26, 18, 101, 0.03)', fontWeight: 'bold', fontSize: '14px' }}>✓ 0% commission</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Durée de vie</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444', fontSize: '14px' }}>Se perd / se déchire</td>
                                    <td style={{ textAlign: 'center', padding: '16px', fontSize: '14px' }}>N/A</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981', background: 'rgba(26, 18, 101, 0.03)', fontWeight: 'bold', fontSize: '14px' }}>✓ À vie</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* 9. FOIRE AUX QUESTIONS (FAQ) */}
            <section id="faq" className="responsive-section" style={{ background: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0' }}>
                            Questions <span style={{ color: '#1A1265' }}>Fréquentes</span>
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <details>
                            <summary style={{ padding: '20px', fontWeight: '800', color: '#0F172A', cursor: 'pointer' }}>
                                Est-ce compatible avec tous les téléphones ?
                            </summary>
                            <div style={{ padding: '0 20px 20px 20px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                Oui. Les téléphones récents disposent du NFC (un simple contact physique suffit). Pour les smartphones plus anciens, le QR code universel gravé au dos de votre carte assure une compatibilité totale.
                            </div>
                        </details>

                        <details>
                            <summary style={{ padding: '20px', fontWeight: '800', color: '#0F172A', cursor: 'pointer' }}>
                                Comment fonctionne la boutique WhatsApp ?
                            </summary>
                            <div style={{ padding: '0 20px 20px 20px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                Vous ajoutez vos articles avec photos et prix dans votre Espace Client NFCrafter. Vos clients parcourent votre boutique sur leur téléphone et cliquent sur commander. Cela vous envoie un message WhatsApp pré-rempli pour convenir de la livraison.
                            </div>
                        </details>

                        <details>
                            <summary style={{ padding: '20px', fontWeight: '800', color: '#0F172A', cursor: 'pointer' }}>
                                Que se passe-t-il si je change de numéro ou d'adresse ?
                            </summary>
                            <div style={{ padding: '0 20px 20px 20px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                                Pas besoin de réimprimer votre carte ! Vous vous connectez à votre tableau de bord NFCrafter, vous modifiez vos coordonnées en 2 clics et la mise à jour est instantanée pour toutes les personnes détenant votre carte physique.
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* 10. FOOTER CTA */}
            <section className="responsive-section" style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)', textAlign: 'center', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
                    <h2 className="responsive-h2" style={{ fontWeight: '900', marginBottom: '24px', fontFamily: 'Outfit', color: '#0F172A' }}>
                        Le futur du networking <span style={{ color: '#1A1265' }}>vous attend.</span>
                    </h2>
                    <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto 40px auto', lineHeight: '1.6' }}>
                        Commandez votre carte Signature NFC en quelques secondes et commencez à impressionner vos futurs clients.
                    </p>

                    <div className="hero-buttons" style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href="#tarifs" style={{
                            background: 'linear-gradient(135deg, #1A1265, #6366F1)',
                            color: 'white',
                            padding: '18px 36px',
                            borderRadius: '16px',
                            fontWeight: '800',
                            fontSize: '16px',
                            textDecoration: 'none',
                            boxShadow: '0 10px 30px rgba(26, 18, 101, 0.15)'
                        }}>
                            Commander maintenant
                        </a>
                        <a href={`https://wa.me/${whatsappNumber}`} style={{
                            background: 'rgba(255, 255, 255, 0.8)',
                            border: '1px solid rgba(26, 18, 101, 0.15)',
                            color: '#1A1265',
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
            <footer style={{ background: '#F8FAFC', padding: '40px 0', borderTop: '1px solid rgba(26, 18, 101, 0.05)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '18px', fontWeight: '900', color: '#1A1265' }}>NFCrafter</span>
                    </div>
                    <span style={{ color: '#475569', fontSize: '13px' }}>Fait avec passion au Bénin 🇧🇯 pour toute l'Afrique. © 2026.</span>
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
