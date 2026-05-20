import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PhonePreview from '../components/PhonePreview.jsx';

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

const COLOR_MAP = {
    black: { theme: '#111827', bg: '#0F172A' },
    white: { theme: '#111827', bg: '#F8FAFC' },
    blue: { theme: '#2563EB', bg: '#EFF6FF' },
    gold: { theme: '#D97706', bg: '#FEF3C7' },
    red: { theme: '#DC2626', bg: '#FEF2F2' },
    green: { theme: '#059669', bg: '#ECFDF5' },
    purple: { theme: '#7C3AED', bg: '#F5F3FF' },
    pink: { theme: '#DB2777', bg: '#FDF2F8' }
};

const HERO_PROFILES = [
    {
        name: 'Romuald K.',
        role: "Architecte d'intérieur",
        color: '#111827',
        avatarBg: 'linear-gradient(135deg, #1F2937, #111827)',
        accent: '#D97706',
        letter: 'R',
        links: ['Mon Portfolio Mobilier', 'Prendre RDV (3D/Plan)'],
        profileImage: '/assets/cards/black-profile.png'
    },
    {
        name: 'Dr. Clara M.',
        role: 'Chirurgien Dentiste',
        color: '#FFFFFF',
        textColor: '#111827',
        avatarBg: 'linear-gradient(135deg, #06B6D4, #3B82F6)',
        accent: '#06B6D4',
        letter: 'C',
        links: ['Cabinet & Tarifs', 'Prendre RDV en ligne'],
        profileImage: '/assets/cards/white-profile.png'
    },
    {
        name: 'Thomas L.',
        role: 'Développeur Fullstack',
        color: '#2563EB',
        avatarBg: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
        accent: '#2563EB',
        letter: 'T',
        links: ['Mon GitHub / Portfolio', 'Mes Services de Dev'],
        profileImage: '/assets/cards/blue-profile.png'
    },
    {
        name: 'Me. Antoine S.',
        role: "Avocat d'Affaires",
        color: '#D97706',
        avatarBg: 'linear-gradient(135deg, #F59E0B, #D97706)',
        accent: '#D97706',
        letter: 'A',
        links: ['Mon Cabinet à Cotonou', 'Consultation juridique'],
        profileImage: '/assets/cards/gold-profile.png'
    },
    {
        name: 'Chef Damien B.',
        role: 'Gastronomie & Traiteur',
        color: '#DC2626',
        avatarBg: 'linear-gradient(135deg, #EF4444, #DC2626)',
        accent: '#DC2626',
        letter: 'D',
        links: ['Menu de la semaine', 'Commander un Buffet'],
        profileImage: '/assets/cards/red-profile.png'
    },
    {
        name: 'Boutique Bio',
        role: 'Épicerie & Bien-être',
        color: '#059669',
        avatarBg: 'linear-gradient(135deg, #10B981, #059669)',
        accent: '#059669',
        letter: 'B',
        links: ['Catalogue Produits', 'Commander sur WhatsApp'],
        profileImage: '/assets/cards/green-profile.png'
    },
    {
        name: 'Sonia G.',
        role: 'Photographe & Vidéaste',
        color: '#7C3AED',
        avatarBg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        accent: '#7C3AED',
        letter: 'S',
        links: ['Galerie Mariages / Pro', 'Réserver une Séance'],
        profileImage: '/assets/cards/purple-profile.png'
    },
    {
        name: 'Mélissa K.',
        role: 'Beauty Studio & Spa',
        color: '#DB2777',
        avatarBg: 'linear-gradient(135deg, #EC4899, #DB2777)',
        accent: '#DB2777',
        letter: 'M',
        links: ['Tarifs Soins & Ongles', 'Réserver un massage'],
        profileImage: '/assets/cards/pink-profile.png'
    }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [session, setSession] = useState(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [cardType, setCardType] = useState('physical');
    // Scroll position for smart back-to-top
    const [scrollY, setScrollY] = useState(0);
    const [backToTopStage, setBackToTopStage] = useState(0); // 0=hidden, 1=scroll-to-tarifs, 2=scroll-to-top
    
    // Live preview states for Demo Section
    const [selectedDemoProfileIndex, setSelectedDemoProfileIndex] = useState(0);
    const [demoThemeColor, setDemoThemeColor] = useState('#111827');
    const [demoBgColor, setDemoBgColor] = useState('#0F172A');
    
    // States for Hero Audacious flipping color-shifting card
    const [heroColorIndex, setHeroColorIndex] = useState(0);

    // Modal states
    const [showLiveDemoModal, setShowLiveDemoModal] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const DEMO_LIVE_PREVIEW_URL = "/u/VDDOHE3O";
    // Chemin vers votre vidéo MP4 dans le dossier public/
    const DEMO_VIDEO_SRC = "/demo-video.mp4";

    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            setScrollY(y);
            // Show buttons after passing #tarifs section (~1000px, adjust if needed)
            const tarifsEl = document.getElementById('tarifs');
            if (tarifsEl) {
                const tarifsBottom = tarifsEl.getBoundingClientRect().bottom + y;
                if (y > tarifsBottom) {
                    setBackToTopStage(2); // past tarifs: direct to top
                } else if (y > tarifsEl.offsetTop) {
                    setBackToTopStage(1); // in tarifs: scroll to tarifs first
                } else {
                    setBackToTopStage(0);
                }
            }
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
            message = `Bonjour NFCrafter, je souhaite commander la Carte NFC Signature en couleur *${activeColor.name}* à 10.000f.`;
        } else if (type === 'premium') {
            message = `Bonjour NFCrafter, je souhaite commander la Carte Ultra Personnalisée (Pack Premium) à 15.000f. Je souhaite y faire graver mon nom/photo/logo.`;
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
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .ticker-row {
                    display: flex;
                    width: max-content;
                    animation: infiniteScroll 25s linear infinite;
                    gap: 40px;
                    will-change: transform;
                    transform: translate3d(0, 0, 0);
                }

                .gallery-row {
                    display: flex;
                    gap: 20px;
                    width: max-content;
                    animation: infiniteScroll 30s linear infinite;
                    will-change: transform;
                    transform: translate3d(0, 0, 0);
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
                    border: 1px solid rgba(26, 18, 101, 0.08);
                    border-radius: 18px;
                    margin-bottom: 16px;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 4px 20px rgba(26, 18, 101, 0.02);
                }
                details:hover {
                    border-color: rgba(99, 102, 241, 0.25);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 30px rgba(26, 18, 101, 0.05);
                }
                details[open] {
                    background: #FFFFFF;
                    border-color: rgba(26, 18, 101, 0.15);
                    box-shadow: 0 20px 40px rgba(26, 18, 101, 0.06);
                }
                summary {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    font-weight: 800;
                    color: #0F172A;
                    cursor: pointer;
                    list-style: none;
                    outline: none;
                    user-select: none;
                }
                summary::-webkit-details-marker {
                    display: none;
                }
                summary::after {
                    content: '+';
                    font-size: 22px;
                    font-weight: 400;
                    color: #6366F1;
                    transition: transform 0.3s ease;
                }
                details[open] summary::after {
                    transform: rotate(45deg);
                    color: #D97706;
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
                    .gallery-row {
                        animation-duration: 14s !important;
                    }
                    .responsive-section {
                        padding: 60px 0 !important;
                    }
                    .hero-section {
                        padding-top: 130px !important;
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
                    .config-controls {
                        order: 1 !important;
                    }
                    .config-visualizer {
                        order: 2 !important;
                    }
                    .demo-controls-wrapper {
                        order: 1 !important;
                    }
                    .demo-mockup-wrapper {
                        order: 2 !important;
                    }
                    .gallery-cta-btn {
                        width: 100% !important;
                        max-width: 340px !important;
                        font-size: 14px !important;
                        padding: 12px 20px !important;
                        justify-content: center !important;
                        box-sizing: border-box !important;
                    }
                }

                @keyframes continuousSpin {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleUp {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
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
                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src="/logo.png" alt="NFCrafter Logo" style={{ height: '45px', width: 'auto', objectFit: 'contain' }} />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="desktop-menu">
                        <a href="#features" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>Fonctionnalités</a>
                        <a href="#demo" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>Profil Démo</a>
                        <a href="#tarifs" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>Tarifs</a>
                        <a href="#faq" style={{ color: '#475569', textDecoration: 'none', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#1A1265'} onMouseOut={e => e.target.style.color = '#475569'}>FAQ</a>
                    </div>

                    <div className="nav-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {session ? (
                            <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid rgba(26, 18, 101, 0.15)', color: '#1A1265', padding: '8px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Tableau de bord</button>
                        ) : (
                            <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: '1px solid rgba(26, 18, 101, 0.15)', color: '#1A1265', padding: '8px 16px', borderRadius: '12px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Connexion</button>
                        )}
                        <a href="#tarifs" style={{
                            background: 'linear-gradient(135deg, #1A1265, #6366F1)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 20px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            fontSize: '14px',
                            textDecoration: 'none',
                            boxShadow: '0 4px 15px rgba(26, 18, 101, 0.15)',
                            transition: 'all 0.3s ease',
                            display: 'inline-block',
                            whiteSpace: 'nowrap'
                        }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(26, 18, 101, 0.25)'} onMouseOut={e => e.currentTarget.style.boxShadow = '0 4px 15px rgba(26, 18, 101, 0.15)'}>
                            Commander
                        </a>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION — AUDACIOUS 3D CARD FLIP LOOP (Light White Glass theme) */}
            <section className="responsive-section hero-section" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '120px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                    {/* Hero Left Content */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(26, 18, 101, 0.15)', background: 'rgba(26, 18, 101, 0.03)', padding: '6px 16px', borderRadius: '100px', width: 'fit-content' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A1265', animation: 'pulseBadge 2s infinite' }}></span>
                            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '2px', color: '#1A1265' }}>L'identité digitale des pros</span>
                        </div>

                        <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-0.04em', lineHeight: '1.05', margin: 0, color: '#0F172A' }}>
                            Votre dernière <br />
                            <span style={{ background: 'linear-gradient(90deg, #1A1265, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>carte de visite. À vie.</span>
                        </h1>

                        <p style={{ fontSize: '17px', color: '#475569', lineHeight: '1.6', margin: 0, maxWidth: '500px' }}>
                            Partagez instantanément vos coordonnées : numéro, e-mail, réseaux sociaux, portfolio, etc. Redirigez vos visiteurs vers votre boutique en ligne(Maketou,Shopify,etc). Impressionnez vos futurs contacts sans jamais dicter votre numéro ou réimprimer vos cartes.
                        </p>

                        <div className="hero-buttons" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>

                            {/* Bouton Vidéo */}
                            <button 
                                onClick={() => setShowVideoModal(true)}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.85)',
                                    border: '1px solid rgba(26, 18, 101, 0.15)',
                                    color: '#1A1265',
                                    padding: '16px 28px',
                                    borderRadius: '16px',
                                    fontWeight: '700',
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(26, 18, 101, 0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }} 
                                onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(26, 18, 101, 0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} 
                                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'; e.currentTarget.style.borderColor = 'rgba(26, 18, 101, 0.15)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                            >
                                {/* Icône play */}
                                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1265, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                                </div>
                                Comment ça marche ?
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', color: '#475569', fontSize: '13px', marginTop: '16px', flexWrap: 'wrap' }}>
                            <span>✓ Paiement Unique</span>
                            <span>✓ Livraison rapide</span>
                            <span>✓ Page personnalisable avec photo de profil et bannière</span>
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

                            {/* Phone Mockup floating slightly below - now displaying exact screenshot image */}
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
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.5s ease'
                            }}>
                                <img 
                                    src={HERO_PROFILES[heroColorIndex].profileImage} 
                                    alt={`NFCrafter Profil Rendu Réel - ${HERO_PROFILES[heroColorIndex].name}`}
                                    style={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'cover', 
                                        transition: 'opacity 0.3s ease'
                                    }}
                                    onError={(e) => {
                                        // Excellent fallback if screenshot not yet uploaded
                                        e.target.src = '/placeholder-public-profile.jpg';
                                    }}
                                />
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
                                <span style={{ color: '#475569', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ LIVRAISON RAPIDE</span>
                                <span style={{ color: '#6366F1', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ TOUS VOS RESEAUX SOCIAUX EN 1 SEULE TOUCHE</span>
                                <span style={{ color: '#1A1265', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ LIEN VERS BOUTIQUE INCLUSE</span>
                                <span style={{ color: '#475569', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '13px' }}>✦ MINI SITE WEB PERSONNEL</span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2.5 COMMENT ÇA MARCHE (LE PARCOURS) */}
            <section className="responsive-section" style={{ padding: '100px 0', background: '#FFFFFF', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Comment ça <span style={{ color: '#1A1265' }}>fonctionne ?</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Une expérience simple et rapide, de la commande jusqu'au partage de vos coordonnées.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px', position: 'relative' }}>
                        {/* Connecting Line (Desktop only) - Note: hidden on mobile in CSS but kept simple here */}
                        <div style={{ position: 'absolute', top: '40px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, rgba(26, 18, 101, 0.05), rgba(99, 102, 241, 0.2), rgba(26, 18, 101, 0.05))', zIndex: 0 }} />

                        {/* Step 1 */}
                        <div className="glass-card" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px', background: 'rgba(255, 255, 255, 0.9)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)', border: '2px solid rgba(26, 18, 101, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 30px rgba(26, 18, 101, 0.05)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A1265" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            </div>
                            <div style={{ background: '#1A1265', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', position: 'absolute', top: '-14px', right: 'calc(50% - 14px)', boxShadow: '0 4px 10px rgba(26,18,101,0.2)' }}>1</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>La Commande</h3>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Choisissez votre pack (Site personnalisée: 7000FCFA, Carte NFCrafter avec votre site : 10000FCFA, Carte ultra personnalisée avec votre nom/photo/logo + site personnalisée : 15000FCFA).</p>
                        </div>

                        {/* Step 2 */}
                        <div className="glass-card" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px', background: 'rgba(255, 255, 255, 0.9)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)', border: '2px solid rgba(26, 18, 101, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 30px rgba(26, 18, 101, 0.05)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A1265" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                            </div>
                            <div style={{ background: '#1A1265', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', position: 'absolute', top: '-14px', right: 'calc(50% - 14px)', boxShadow: '0 4px 10px rgba(26,18,101,0.2)' }}>2</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>L'Activation</h3>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Si vous avez opté pour une carte, scannez le code QR au dos de la carte et vous serez redirigé vers une page. Créez donc votre compte et accédez à votre tableau de bord.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="glass-card" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px', background: 'rgba(255, 255, 255, 0.9)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #F8FAFC, #FFFFFF)', border: '2px solid rgba(26, 18, 101, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 30px rgba(26, 18, 101, 0.05)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1A1265" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                            </div>
                            <div style={{ background: '#1A1265', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', position: 'absolute', top: '-14px', right: 'calc(50% - 14px)', boxShadow: '0 4px 10px rgba(26,18,101,0.2)' }}>3</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>La Personnalisation</h3>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Personnalisez votre page en temps réel depuis votre tableau de bord: ajoutez photo, bannière, des liens vers vos réseaux sociaux, d'autres liens utiles, vos compétences, portfolios, une gallerie d'image,etc. NB: L'ajout de tout cela est optionnel, vous personnalisez votre page en fonction de vos informations et envies.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="glass-card" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '32px 24px', background: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #EEF2FF, #FFFFFF)', border: '2px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', boxShadow: '0 10px 30px rgba(99, 102, 241, 0.1)' }}>
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            </div>
                            <div style={{ background: '#6366F1', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', position: 'absolute', top: '-14px', right: 'calc(50% - 14px)', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}>4</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#0F172A', marginBottom: '12px' }}>Le Partage Magique</h3>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>Approchez la carte d'un téléphone. Votre interlocuteur enregistre vos coordonnées en 1 seconde. Son téléphone est très ancien ? Pas de panique, la carte dispose d'un QR code que votre interlocuteur peut scanner avec son téléphone.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. SECTION PROBLÈME — CONSTAT BRUTAL */}
            <section className="responsive-section" style={{ background: 'rgba(255,255,255,0.5)', position: 'relative', borderTop: '1px solid rgba(26, 18, 101, 0.03)', borderBottom: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Les cartes papier vous font <span style={{ color: '#DC2626' }}>perdre des contacts</span>.
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Chaque rencontre physique non sauvegardée est une opportunité (amicale ou professionnelle) qui s'envole.
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
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Limite d'écriture</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Le format papier restreint l'information à des données statiques. À l'inverse, les cartes de NFCrafter permettent d'intégrer des liens dynamiques vers des réseaux sociaux, des portfolios en ligne,etc.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>La dictée pénible du numéro</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>"Zéro-Six..." Vous épelez pendant 2 minutes. Votre interlocuteur note mal votre numéro et ne vous rappelle jamais.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(239, 68, 68, 0.08)', color: '#EF4444', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✕</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Coûteuse réimpression</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Un simple changement de numéro ou de logo vous oblige à réimprimer tout un lot (plus de 10 000f perdus).</p>
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
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>La carte effleure le téléphone de votre interlocuteur, votre profil professionnel s'ouvre en 1 seconde chrono. Simple, rapide et très professionnel.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(26, 18, 101, 0.05)', color: '#1A1265', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Enregistrement direct</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Votre contact (numéro, email, réseaux sociaux, le lien de votre page NFCrafter,etc) est enregistré automatiquement dans leur répertoire sans aucune erreur.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(26, 18, 101, 0.05)', color: '#1A1265', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Boutique & Commande</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Le client navigue dans votre mini-site, choisit un produit, est redirigé vers votre boutique en ligne pour finaliser la commande.</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                <div style={{ background: 'rgba(26, 18, 101, 0.05)', color: '#1A1265', padding: '10px', borderRadius: '12px', fontWeight: 'bold' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0F172A' }}>Prise de contact rapide</h4>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.5' }}>Que vous soyez dans le bruit ou pressé, un simple effleurement de la carte suffit pour transmettre vos coordonnées instantanément. Aucune application requise de la part de votre interlocuteur.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* REAL-LIFE PRODUCT GALLERY SECTION (Using gallery-1 to gallery-8) */}
            <section style={{ padding: '80px 0', overflow: 'hidden', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', marginBottom: '36px', textAlign: 'center' }}>
                    <h2 className="responsive-h2" style={{ fontWeight: '800', color: '#0F172A' }}>Vous pouvez personnaliser votre carte</h2>
                    <p style={{ color: '#475569', marginTop: '8px' }}>Vous rêvez d'avoir une carte intelligente NFC ultra personnalisée qui parle à votre place et est à votre image ? Eh bien il suffit de nous contacter.</p>
                </div>
                
                <div className="gallery-row">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <div key={num} className="glass-card" style={{ width: '280px', height: '180px', flexShrink: 0, overflow: 'hidden', padding: 0, background: 'rgba(255,255,255,0.8)' }}>
                            <img 
                                src={`/gallery-${num}.jpg`} 
                                alt={`NFCrafter Real ${num}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.src = '/placeholder-qr-custom.jpg'; }}
                            />
                        </div>
                    ))}
                    {/* Repeat for seamless infinite scrolling */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <div key={`dup-${num}`} className="glass-card" style={{ width: '280px', height: '180px', flexShrink: 0, overflow: 'hidden', padding: 0, background: 'rgba(255,255,255,0.8)' }}>
                            <img 
                                src={`/gallery-${num}.jpg`} 
                                alt={`NFCrafter Real ${num}`} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                onError={(e) => { e.target.src = '/placeholder-qr-custom.jpg'; }}
                            />
                        </div>
                    ))}
                </div>

                {/* Button Centered Below the Scrolling Gallery */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
                    <a 
                        href="#tarifs"
                        className="gallery-cta-btn"
                        style={{
                            background: 'linear-gradient(135deg, #1A1265, #6366F1)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 32px',
                            borderRadius: '12px',
                            fontWeight: '800',
                            fontSize: '15px',
                            textDecoration: 'none',
                            boxShadow: '0 8px 20px rgba(26, 18, 101, 0.15)',
                            transition: 'all 0.3s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            textAlign: 'center'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 10px 25px rgba(26, 18, 101, 0.25)';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 8px 20px rgba(26, 18, 101, 0.15)';
                        }}
                    >
                        <span>Commander ma carte personnalisée <span style={{ whiteSpace: 'nowrap' }}>(15 000 FCFA)</span></span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </a>
                </div>
            </section>

            {/* 4. SECTION ECOSYSTÈME — BENTO GRID WITH 10 FULL FEATURES (White Glass Theme) */}
            <section id="features" className="responsive-section" style={{ position: 'relative' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Pas juste une carte ou un site web personnel. <span style={{ color: '#1A1265' }}>Un écosystème complet.</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Découvrez les 12 fonctionnalités clés de NFCrafter qui propulsent votre visibilité.
                        </p>
                    </div>

                    {/* Bento Grid */}
                    <div className="bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                        
                        {/* 1. Partage NFC & Mode Hors-Ligne (L - 2 columns) */}
                        <div className="bento-card" style={{ gridColumn: 'span 2', minHeight: '320px', background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.9))' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                                <div style={{ maxWidth: '380px' }}>
                                    <span style={{ color: '#1A1265', fontWeight: '800', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                                        <div style={{width:'8px', height:'8px', borderRadius:'50%', background:'#10B981'}}></div> 100% SANS CONNEXION
                                    </span>
                                    <h3 style={{ fontSize: '26px', fontWeight: '900', margin: '0 0 12px 0', color: '#0F172A', letterSpacing: '-0.02em' }}>Le partage qui marche sans connexion internet.</h3>
                                    <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>Partagez vos coordonnées juste en effleurant un téléphone. Plus de connexion ? Aucun problème. Notre <strong style={{ color: '#1A1265' }}>technologie de QR Code de secours</strong> vous permet de transmettre vos contacts même en mode avion depuis l'application installable via votre tableau de bord NFCrafter.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(26, 18, 101, 0.05)', padding: '24px', borderRadius: '24px', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.02)' }}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A1265" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                                </div>
                            </div>
                        </div>

                        {/* 2. Enregistrement Intelligent vCard (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '320px', borderTop: '4px solid #6366F1' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(99, 102, 241, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5c-1.1 0-2 .9-2 2v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Bouton "Enregistrer le contact" intelligent</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Grâce à ce bouton, vos informations vont directement dans le répertoire de votre interlocuteur, avec votre photo de profil et <strong style={{color:'#1A1265'}}>tous vos liens inclus</strong>.
                            </p>
                        </div>

                        {/* 3. Boutique WhatsApp (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(16, 185, 129, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Catalogue & E-commerce</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Affichez vos produits digital ou physique. Redirigez vos visiteurs vers votre WhatsApp, ou vers votre site externe (Maketou, Shopify, etc.).
                            </p>
                        </div>

                        {/* 4. Mini-Site Pro Inclus (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(245, 158, 11, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Mini-Site Web Personnel</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Une vraie page professionnelle personnalisable avec votre photo, votre bannière de couverture, et tous vos réseaux sociaux.
                            </p>
                        </div>

                        {/* 5. Avis Clients (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(234, 179, 8, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Avis Clients Privés</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Recevez des avis et commentaires privés de vos contacts directement via votre page pro, et consultez-les dans votre espace pour améliorer vos services ou projets.
                            </p>
                        </div>

                        {/* 6. Portfolio & Galerie (S - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(139, 92, 246, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Galerie de Réalisations</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Mettez en avant vos plus beaux travaux ou vos articles grâce à notre galerie d'images fluide et parfaite.
                            </p>
                        </div>

                        {/* 7. Modification Facile (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(236, 72, 153, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Promotion de vos évènements</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Vous organisez un évènement ? Formations, Coaching, Conférence,Chill ? Mentionnez le directement dans votre profil et ajouter le lien vers la billeterie ou WhatsApp.
                            </p>
                        </div>

                        {/* 8. Multi-profils */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(56, 189, 248, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Gestion Multi-Cartes</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Que vous soyez chef d'entreprise,étudiant ou freelancer avec plusieurs projets, vous pouvez gérer plusieurs cartes ou celles de votre équipe depuis un seul compte.
                            </p>
                        </div>

                        {/* 9. Analytics */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(239, 68, 68, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Statistiques des Scans</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Surveillez l'impact de vos rencontres. Découvrez combien de fois votre profil a été consulté.
                            </p>
                        </div>

                        {/* 10. Mise à jour illimitée */}
                        <div className="bento-card" style={{ gridColumn: 'span 2', minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(168, 85, 247, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Mises à jour gratuites à vie</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Ne jetez plus jamais de carte parce que votre numéro a changé. Mettez à jour vos infos instantanément sans débourser un centime de plus.
                            </p>
                        </div>

                        {/* 11. Certifications/Compétences */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{width:'40px', height:'40px', background:'rgba(14, 165, 233, 0.1)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'16px'}}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Certifications/Compétences</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Vous avez des compétences ou vous disposez de certifications ? Mentionnez-les directement sur votre profil.
                            </p>
                        </div>

                        {/* 12. Modification Facile (M - 1 column) */}
                        <div className="bento-card" style={{ minHeight: '300px' }}>
                            <div>
                                <div style={{ width: '40px', height: '40px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="5 9 2 12 5 15"></polyline><polyline points="9 5 12 2 15 5"></polyline><polyline points="19 9 22 12 19 15"></polyline><polyline points="9 19 12 22 15 19"></polyline><line x1="2" y1="12" x2="22" y2="12"></line><line x1="12" y1="2" x2="12" y2="22"></line></svg>
                                </div>
                                <h3 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 12px 0', color: '#0F172A' }}>Modification très facile</h3>
                            </div>
                            <p style={{ color: '#475569', fontSize: '14px', lineHeight: '1.5', margin: 0 }}>
                                Vous changez de position à vos sections(portfolio, boutiques, liens réseaux sociaux) simplement en glissant et déposant depuis votre tableau de bord dans l'onglet  "Mise en page". Tout est pris en compte à la seconde.
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
                            Voici un exemple de ce que <span style={{ color: '#1A1265' }}>vos interlocuteurs verront.</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '600px', margin: '0 auto' }}>
                            Testez les couleurs en temps réel.
                        </p>
                    </div>

                    <div className="responsive-grid" style={{ gap: '40px', alignItems: 'center' }}>
                        
                        {/* Phone Mockup Wrapper (Visual Preview) */}
                        <div className="demo-mockup-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', justifyContent: 'center' }}>
                            <div style={{
                                width: '266px', /* 250px + 16px borders */
                                height: '516px', /* 500px + 16px borders */
                                background: '#0F172A',
                                borderRadius: '36px',
                                border: '8px solid #1F2937',
                                boxShadow: '0 25px 60px rgba(26, 18, 101, 0.12)',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column'
                            }}>
                                {/* Notch */}
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '0', 
                                    left: '50%', 
                                    transform: 'translateX(-50%)', 
                                    width: '80px', 
                                    height: '16px', 
                                    background: '#1F2937', 
                                    borderBottomLeftRadius: '10px', 
                                    borderBottomRightRadius: '10px', 
                                    zIndex: 10,
                                    pointerEvents: 'none' 
                                }}></div>

                                {/* Scaled Iframe to prevent responsiveness/overflow issues */}
                                <div style={{ width: '250px', height: '500px', overflow: 'hidden', position: 'relative' }}>
                                    <iframe 
                                        src={`/u/VDDOHE3O?theme_color=${encodeURIComponent(demoThemeColor)}&bg_color=${encodeURIComponent(demoBgColor)}`}
                                        style={{ 
                                            width: '375px', 
                                            height: '750px', 
                                            border: 'none', 
                                            transform: 'scale(0.667)', 
                                            transformOrigin: 'top left',
                                            background: demoBgColor 
                                        }}
                                        title="NFCrafter Live Preview"
                                    />
                                </div>
                            </div>

                            {/* Open Fullscreen Link */}
                            <a 
                                href={`/u/VDDOHE3O?theme_color=${encodeURIComponent(demoThemeColor)}&bg_color=${encodeURIComponent(demoBgColor)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '10px 20px',
                                    background: 'white',
                                    border: '1px solid rgba(26, 18, 101, 0.15)',
                                    borderRadius: '12px',
                                    color: '#1A1265',
                                    textDecoration: 'none',
                                    fontWeight: '700',
                                    fontSize: '13px',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.background = '#F8FAFC'}
                                onMouseOut={e => e.currentTarget.style.background = 'white'}
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M10 14 21 3"></path><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path></svg>
                                Ouvrir en plein écran
                            </a>
                        </div>

                        {/* Right Side - Interactive Customization Panel */}
                        <div className="demo-controls-wrapper glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255, 255, 255, 0.85)', justifyContent: 'center' }}>
                            
                            {/* 1. Theme color customize */}
                            <div>
                                <span style={{ color: '#475569', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>
                                    Personnaliser la Couleur de Thème
                                </span >
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                                    {CARD_COLORS.map((color) => {
                                        const config = COLOR_MAP[color.id] || { theme: color.hex, bg: '#f8fafc' };
                                        const isActive = demoThemeColor === config.theme && demoBgColor === config.bg;
                                        return (
                                            <div
                                                key={color.id}
                                                onClick={() => {
                                                    setDemoThemeColor(config.theme);
                                                    setDemoBgColor(config.bg);
                                                }}
                                                style={{
                                                    width: '28px',
                                                    height: '28px',
                                                    borderRadius: '50%',
                                                    background: color.hex,
                                                    cursor: 'pointer',
                                                    border: isActive ? '3px solid #1D4ED8' : '2px solid transparent',
                                                    boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                                                    transition: 'transform 0.2s'
                                                }}
                                                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5.5 SECTION LIENS BIO & CODES QR IMPRIMABLES (Diffuser au-delà de la carte) */}
            <section style={{ padding: '80px 0', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)', position: 'relative', borderBottom: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Un seul profil, <span style={{ color: '#1A1265' }}>des milliers de façons de le partager.</span>
                        </h2>
                        <p style={{ color: '#475569', fontSize: '17px', maxWidth: '750px', margin: '0 auto 28px' }}>
                            Votre carte NFC est magique, mais votre profil digital est conçu pour être partagé partout où se trouvent vos clients potentiels.
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
                        
                        {/* Channel 1: Social Bios */}
                        <div className="glass-card" style={{ padding: '36px 30px', background: 'rgba(255,255,255,0.85)', borderRadius: '24px', border: '1px solid rgba(26, 18, 101, 0.04)', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366F1' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Lien en Bio Réseaux Sociaux</h3>
                            <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
                                Insérez votre lien personnalisé <strong style={{ color: '#1A1265' }}>nfcrafter.com/u/votre-nom</strong> dans votre bio <strong style={{ color: '#1A1265' }}>Instagram, TikTok, Facebook ou YouTube</strong>. Dirigez tout votre trafic vers votre hub professionnel unique.
                            </p>
                        </div>

                        {/* Channel 2: WhatsApp Business */}
                        <div className="glass-card" style={{ padding: '36px 30px', background: 'rgba(255,255,255,0.85)', borderRadius: '24px', border: '1px solid rgba(26, 18, 101, 0.04)', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>WhatsApp Business</h3>
                            <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
                                Intégrez votre lien NFCrafter comme site web de votre profil <strong style={{ color: '#1A1265' }}>WhatsApp Business</strong>. Vos clients accèdent à vos informations, catalogues de produits et portfolios directement depuis leur chat.
                            </p>
                        </div>

                        {/* Channel 3: Printable QR Code */}
                        <div className="glass-card" style={{ padding: '36px 30px', background: 'rgba(255,255,255,0.85)', borderRadius: '24px', border: '1px solid rgba(26, 18, 101, 0.04)', display: 'flex', flexDirection: 'column', gap: '18px', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'rgba(249, 115, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0F172A', margin: 0 }}>Affiches, Flyers & Vitrines</h3>
                            <p style={{ color: '#475569', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
                                Téléchargez votre <strong style={{ color: '#1A1265' }}>QR code en ligne haute résolution</strong> depuis votre tableau de bord et imprimez-le sur vos flyers, menus de table ou vitrines de magasin.
                            </p>
                        </div>
                        
                        {/* CTA Sans Carte */}
                        <a
                            href={`https://wa.me/22969473921?text=${encodeURIComponent('Bonjour NFCrafter, je souhaite créer mon Profil Digital Unique sans carte à 7.000f.')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '10px',
                                background: 'linear-gradient(135deg, #1A1265, #6366F1)',
                                color: 'white',
                                padding: '14px 28px',
                                borderRadius: '14px',
                                fontWeight: '800',
                                fontSize: '15px',
                                textDecoration: 'none',
                                boxShadow: '0 8px 24px rgba(26,18,101,0.25)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,18,101,0.35)'; }}
                            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,18,101,0.25)'; }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                            Créer mon profil sans carte — 7 000 FCFA
                        </a>

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

                    <div className="config-wrapper" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '48px', alignItems: 'start' }}>
                        
                        {/* Visualizer Left — adapts to selected pack */}
                        <div className="config-visualizer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '380px',
                                borderRadius: '20px',
                                boxShadow: '0 30px 60px rgba(26, 18, 101, 0.1)',
                                overflow: 'hidden',
                                background: '#FFFFFF',
                                border: '1px solid rgba(26, 18, 101, 0.05)',
                                transition: 'all 0.4s ease'
                            }}>
                                {cardType === 'digital' ? (
                                    /* Digital pack: show a phone mockup illustration */
                                    <div style={{ background: 'linear-gradient(135deg, #1A1265 0%, #6366F1 100%)', padding: '48px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                                        <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                                        </div>
                                        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', fontWeight: '700', textAlign: 'center', margin: 0 }}>Votre profil digital</p>
                                        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px', textAlign: 'center', margin: 0, lineHeight: '1.5' }}>nfcrafter.com/u/votre-nom<br/>Partageable partout, tout de suite</p>
                                    </div>
                                ) : cardType === 'premium' ? (
                                    <img 
                                        src="/gallery-2.jpg" 
                                        alt="NFCrafter Carte Premium Personnalisée Sarah Kouamé" 
                                        style={{ width: '100%', height: 'auto', display: 'block', transition: 'opacity 0.3s ease' }}
                                        onError={(e) => { e.target.src = '/card-recto.png'; }}
                                    />
                                ) : (
                                    <img 
                                        src={activeColor.imgCombined} 
                                        alt={`NFCrafter Carte ${activeColor.name} Recto Verso Réel`} 
                                        style={{ width: '100%', height: 'auto', display: 'block', transition: 'opacity 0.3s ease' }}
                                        onError={(e) => { e.target.src = '/card-recto.png'; }}
                                    />
                                )}
                            </div>
                            {/* Pack badge */}
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px',
                                background: cardType === 'digital' ? 'rgba(99,102,241,0.08)' : cardType === 'physical' ? 'rgba(26,18,101,0.06)' : 'rgba(217,119,6,0.08)',
                                border: `1px solid ${cardType === 'digital' ? 'rgba(99,102,241,0.2)' : cardType === 'physical' ? 'rgba(26,18,101,0.15)' : 'rgba(217,119,6,0.25)'}`,
                                borderRadius: '100px', padding: '8px 16px'
                            }}>
                                <span style={{ fontSize: '13px', fontWeight: '800', color: cardType === 'digital' ? '#6366F1' : cardType === 'physical' ? '#1A1265' : '#D97706' }}>
                                    {cardType === 'digital' ? '📱 Pack Digital' : cardType === 'physical' ? '💳 Pack Signature' : '✨ Pack Premium'}
                                </span>
                                <span style={{ fontSize: '13px', fontWeight: '900', color: cardType === 'premium' ? '#D97706' : '#1A1265' }}>
                                    {cardType === 'digital' ? '7 000 FCFA' : cardType === 'physical' ? '10 000 FCFA' : '15 000 FCFA'}
                                </span>
                            </div>
                        </div>

                        {/* Configurator Controls Right */}
                        <div className="config-controls glass-card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Step 1: Pack Selection — 3 cards */}
                            <div>
                                <span style={{ color: '#475569', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '12px' }}>Étape 1 : Choisir le Pack</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    
                                    {/* Pack Digital */}
                                    <div onClick={() => setCardType('digital')} style={{
                                        border: cardType === 'digital' ? '2px solid #6366F1' : '1px solid rgba(26, 18, 101, 0.1)',
                                        background: cardType === 'digital' ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>📱 Pack Digital</span>
                                            <span style={{ fontSize: '12px', color: '#64748B' }}>Profil digital uniquement · Sans carte</span>
                                        </div>
                                        <span style={{ color: '#6366F1', fontWeight: '900', fontSize: '15px', whiteSpace: 'nowrap' }}>7 000 FCFA</span>
                                    </div>

                                    {/* Pack Signature */}
                                    <div onClick={() => setCardType('physical')} style={{
                                        border: cardType === 'physical' ? '2px solid #1A1265' : '1px solid rgba(26, 18, 101, 0.1)',
                                        background: cardType === 'physical' ? 'rgba(26, 18, 101, 0.03)' : 'transparent',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        position: 'relative',
                                        gap: '12px'
                                    }}>
                                        <div style={{ position: 'absolute', top: '-10px', right: '12px', background: '#1A1265', color: 'white', fontSize: '9px', fontWeight: '800', padding: '2px 8px', borderRadius: '100px', textTransform: 'uppercase' }}>⭐ Populaire</div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>💳 Pack Signature</span>
                                            <span style={{ fontSize: '12px', color: '#64748B' }}>Carte NFC couleur + Profil digital</span>
                                        </div>
                                        <span style={{ color: '#1A1265', fontWeight: '900', fontSize: '15px', whiteSpace: 'nowrap' }}>10 000 FCFA</span>
                                    </div>

                                    {/* Pack Premium */}
                                    <div onClick={() => setCardType('premium')} style={{
                                        border: cardType === 'premium' ? '2px solid #D97706' : '1px solid rgba(26, 18, 101, 0.1)',
                                        background: cardType === 'premium' ? 'rgba(217, 119, 6, 0.04)' : 'transparent',
                                        padding: '14px 16px',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s',
                                        gap: '12px'
                                    }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontWeight: '800', fontSize: '14px', color: '#0F172A' }}>✨ Pack Premium</span>
                                            <span style={{ fontSize: '12px', color: '#64748B' }}>Carte ultra personnalisée (logo/photo) + Profil</span>
                                        </div>
                                        <span style={{ color: '#D97706', fontWeight: '900', fontSize: '15px', whiteSpace: 'nowrap' }}>15 000 FCFA</span>
                                    </div>
                                </div>
                            </div>

                            {/* Description du pack sélectionné */}
                            <div style={{ background: 'rgba(26,18,101,0.02)', borderRadius: '12px', padding: '14px 16px', fontSize: '13px', color: '#475569', lineHeight: '1.6' }}>
                                {cardType === 'digital' && (
                                    <span>🌐 <strong style={{ color: '#1A1265' }}>Profil digital complet</strong> accessible via lien personnalisé. Partagez-le sur WhatsApp, Instagram, TikTok, par QR code imprimable… Sans jamais dicter votre numéro.</span>
                                )}
                                {cardType === 'physical' && (
                                    <span>💳 <strong style={{ color: '#1A1265' }}>Carte NFC</strong> dans la couleur de votre choix + profil digital. Un simple effleurement et votre contact est transmis instantanément.</span>
                                )}
                                {cardType === 'premium' && (
                                    <span>✨ <strong style={{ color: '#D97706' }}>Carte ultra personnalisée</strong> avec votre nom, photo et logo gravés + profil digital complet. L'identité professionnelle ultime.</span>
                                )}
                            </div>

                            {/* Step 2: Color Picker (Pack Signature uniquement) */}
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
                            {/* Premium: design 100% sur mesure, pas de color picker */}
                            {cardType === 'premium' && (
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: 'rgba(217,119,6,0.05)', border: '1px solid rgba(217,119,6,0.15)', borderRadius: '12px', padding: '14px 16px' }}>
                                    <span style={{ fontSize: '20px', flexShrink: 0 }}>🎨</span>
                                    <p style={{ margin: 0, fontSize: '13px', color: '#92400E', lineHeight: '1.6' }}>
                                        <strong>Design 100% sur mesure.</strong> Votre carte sera conçue par notre équipe selon vos préférences (couleur, logo, photo, police…). Précisez vos souhaits directement sur WhatsApp.
                                    </p>
                                </div>
                            )}


                            {/* CTA Button — adapté au pack */}
                            <button onClick={() => window.open(getWhatsAppUrl(), '_blank')} style={{
                                width: '100%',
                                background: cardType === 'premium'
                                    ? 'linear-gradient(135deg, #D97706, #F59E0B)'
                                    : cardType === 'digital'
                                    ? 'linear-gradient(135deg, #1A1265, #6366F1)'
                                    : buttonColor,
                                color: cardType === 'physical' ? buttonTextColor : 'white',
                                border: 'none',
                                padding: '16px',
                                borderRadius: '14px',
                                fontWeight: '900',
                                fontSize: '15px',
                                cursor: 'pointer',
                                boxShadow: cardType === 'premium' ? '0 10px 30px rgba(217,119,6,0.3)' : `0 10px 30px ${cardType === 'digital' ? 'rgba(99,102,241,0.25)' : buttonColor + '30'}`,
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {cardType === 'digital' && 'Créer mon profil digital — 7 000 FCFA'}
                                {cardType === 'physical' && `Commander ma carte ${activeColor.name} — 10 000 FCFA`}
                                {cardType === 'premium' && 'Commander ma carte Premium — 15 000 FCFA'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>


            {/* 7. PREUVE SOCIALE — TÉMOIGNAGES */}
            <section className="responsive-section" style={{ background: 'rgba(255,255,255,0.5)', position: 'relative', borderTop: '1px solid rgba(26, 18, 101, 0.03)', borderBottom: '1px solid rgba(26, 18, 101, 0.03)' }}>
                <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Les pros qui avancent <span style={{ color: '#1A1265' }}>utilisent NFCrafter.</span>
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Plus de 200 professionnels en Afrique de l'Ouest nous font confiance.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>

                        {/* Testimonial 1 */}
                        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}>{'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#FBBF24', fontSize: '16px' }}>{s}</span>)}</div>
                            <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>
                                "3 contrats signés en une semaine. Mes clients scannent, mon profil s'ouvre. Fini les cartes papier."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(26,18,101,0.05)' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1A1265, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '18px', flexShrink: 0 }}>R</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Romuald K.</h4>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>Architecte · Cotonou</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}>{'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#FBBF24', fontSize: '16px' }}>{s}</span>)}</div>
                            <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>
                                "Ma boutique WhatsApp intégrée a doublé mes ventes. Zéro commission, mes clientes commandent en direct."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(26,18,101,0.05)' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #DB2777, #F472B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '18px', flexShrink: 0 }}>M</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Mariam D.</h4>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>Mode et prêt-à-porter · Calavi</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}>{'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#FBBF24', fontSize: '16px' }}>{s}</span>)}</div>
                            <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>
                                "Je présente mes services d'un seul tap lors des séminaires. Les investisseurs apprécient le professionnalisme."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(26,18,101,0.05)' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #D97706, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '18px', flexShrink: 0 }}>K</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Kofi A.</h4>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>Entrepreneur · Lomé</span>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 4 */}
                        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', gap: '3px' }}>{'★★★★★'.split('').map((s,i) => <span key={i} style={{ color: '#FBBF24', fontSize: '16px' }}>{s}</span>)}</div>
                            <p style={{ margin: 0, color: '#334155', fontSize: '14px', lineHeight: '1.7', fontStyle: 'italic' }}>
                                "Mon agenda est plein depuis que j'ai la carte NFCrafter. Mes patients trouvent mes horaires directement."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid rgba(26,18,101,0.05)' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: 'white', fontSize: '18px', flexShrink: 0 }}>A</div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#0F172A' }}>Dr. Aïssatou M.</h4>
                                    <span style={{ fontSize: '12px', color: '#64748B' }}>Médecin généraliste · Abidjan</span>
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
                                    <th style={{ textAlign: 'center', padding: '16px', color: '#1A1265', background: 'rgba(26, 18, 101, 0.03)', fontWeight: '900', fontSize: '14px' }}>🏆 NFCrafter</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Partage instantané</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981', background: 'rgba(26, 18, 101, 0.03)', fontWeight: 'bold', fontSize: '14px' }}>✓ Oui (NFC)</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Boutique intégrée</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444' }}>✕</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#10B981', background: 'rgba(26, 18, 101, 0.03)', fontWeight: 'bold', fontSize: '14px' }}>✓ Incluse</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid rgba(26, 18, 101, 0.05)' }}>
                                    <td style={{ padding: '16px', fontWeight: '700', fontSize: '14px' }}>Durée de vie</td>
                                    <td style={{ textAlign: 'center', padding: '16px', color: '#EF4444', fontSize: '14px' }}>Se perd / se déchire</td>
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
                        <h2 className="responsive-h2" style={{ fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
                            Questions <span style={{ color: '#1A1265' }}>Fréquentes</span>
                        </h2>
                        <p style={{ color: '#64748B', fontSize: '15px', margin: 0 }}>Tout ce que vous devez savoir avant de commander.</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                        <details>
                            <summary><span>Est-ce compatible avec tous les téléphones ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Oui. Les téléphones récents utilisent le NFC (un simple effleurement suffit). Pour les anciens modèles, un QR code est gravé au dos de la carte et fonctionne avec n'importe quel appareil photo.
                            </div>
                        </details>

                        <details>
                            <summary><span>Que faire si je change de numéro ou d'adresse ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Pas besoin de racheter une carte. Connectez-vous à votre tableau de bord NFCrafter et modifiez vos infos en 2 clics — la mise à jour est instantanée et sans frais.
                            </div>
                        </details>

                        <details>
                            <summary><span>Combien de temps pour recevoir ma carte ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Le Pack Digital est activé en moins de 24h. Pour les cartes physiques (Signature et Premium), comptez 3 à 7 jours ouvrés selon votre ville.
                            </div>
                        </details>

                        <details>
                            <summary><span>Quels modes de paiement sont acceptés ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Nous acceptons MTN MoMo, Moov Money, Wave et la carte bancaire (Visa/Mastercard). Le paiement se finalise directement via WhatsApp après confirmation de votre commande.
                            </div>
                        </details>

                        <details>
                            <summary><span>Puis-je personnaliser le design de ma carte ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Oui. Le Pack Signature propose 8 couleurs. Le Pack Premium est 100% sur mesure : votre nom, photo, logo et couleurs gravés sur la carte selon vos préférences.
                            </div>
                        </details>

                        <details>
                            <summary><span>Mes données sont-elles sécurisées ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Oui. Vos données sont hébergées sur des serveurs sécurisés (chiffrement SSL). Vous contrôlez ce qui est visible publiquement et pouvez supprimer votre profil à tout moment.
                            </div>
                        </details>

                        <details>
                            <summary><span>Livrez-vous dans toute l'Afrique de l'Ouest ?</span></summary>
                            <div style={{ padding: '0 24px 24px 24px', color: '#475569', fontSize: '14px', lineHeight: '1.7' }}>
                                Oui, nous livrons au Bénin, en Côte d'Ivoire, au Sénégal, au Togo et dans d'autres pays sur demande. Contactez-nous via WhatsApp pour un délai personnalisé.
                            </div>
                        </details>

                    </div>

                    <div style={{ marginTop: '48px', textAlign: 'center', background: 'rgba(26,18,101,0.03)', border: '1px solid rgba(26,18,101,0.08)', borderRadius: '20px', padding: '32px 24px' }}>
                        <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: '#0F172A' }}>Vous avez une autre question ?</h3>
                        <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 20px 0' }}>Notre équipe répond en moins de 5 minutes sur WhatsApp.</p>
                        <a href={`https://wa.me/22967646161?text=Bonjour%20NFCrafter%2C%20j'ai%20une%20question%20svp`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', padding: '14px 28px', borderRadius: '12px', fontWeight: '800', fontSize: '14px', textDecoration: 'none', boxShadow: '0 8px 20px rgba(37,211,102,0.25)' }}>
                            Poser ma question sur WhatsApp
                        </a>
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

            {/* ── FLOATING BUTTONS (WhatsApp left + Back-to-top right) ── */}

            {/* WhatsApp — Bottom Left */}
            <div style={{
                position: 'fixed',
                bottom: '28px',
                left: '24px',
                zIndex: 999,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                opacity: scrollY > 200 ? 1 : 0,
                transform: scrollY > 200 ? 'translateY(0)' : 'translateY(12px)',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: scrollY > 200 ? 'auto' : 'none'
            }}>
                <a
                    href="https://wa.me/22969473921"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Nous contacter sur WhatsApp"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: '#25D366',
                        borderRadius: '50px',
                        padding: '10px 18px 10px 12px',
                        boxShadow: '0 8px 24px rgba(37, 211, 102, 0.35)',
                        textDecoration: 'none',
                        transition: 'transform 0.25s, box-shadow 0.25s'
                    }}
                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,211,102,0.5)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,211,102,0.35)'; }}
                >
                    <svg viewBox="0 0 24 24" fill="white" style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                        <path d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.765.459 3.486 1.33 5.011L2 22l5.127-1.343c1.472.802 3.125 1.226 4.885 1.226 5.527 0 10.012-4.485 10.012-10.012C22.024 6.485 17.539 2 12.012 2zm6.059 14.398c-.25.702-1.246 1.285-1.721 1.344-.475.059-.95.089-2.73-.623-2.278-.91-3.704-3.21-3.818-3.364-.114-.154-.93-1.233-.93-2.353 0-1.12.583-1.67.792-1.898.208-.228.455-.287.607-.287.152 0 .303.003.435.01.135.007.316-.051.495.38.185.443.633 1.543.687 1.654.054.111.089.24.015.388-.074.148-.111.24-.222.37-.111.13-.233.29-.332.39-.1.1-.205.21-.089.41.116.2.515.85.1 1.488.497.443.917.72 1.396.953.479.232.571.2.782-.047.21-.247.917-1.077 1.164-1.448.247-.37.495-.308.825-.185.33.123 2.102 1.025 2.463 1.205.36.18.601.272.688.423.087.151.087.876-.163 1.578z"/>
                    </svg>
                </a>
            </div>

            {/* Back-to-top — Bottom Right (glass, smart 2-stage) */}
            <button
                onClick={() => {
                    if (backToTopStage === 1) {
                        // First click: scroll to start of #tarifs
                        const el = document.getElementById('tarifs');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        // Second click (or past tarifs): scroll to very top
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }}
                title={backToTopStage === 1 ? 'Revenir au catalogue' : 'Haut de page'}
                style={{
                    position: 'fixed',
                    bottom: '28px',
                    right: '24px',
                    zIndex: 999,
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(16px)',
                    WebkitBackdropFilter: 'blur(16px)',
                    boxShadow: '0 8px 24px rgba(26, 18, 101, 0.15)',
                    color: '#1A1265',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: backToTopStage > 0 ? 1 : 0,
                    transform: backToTopStage > 0 ? 'translateY(0)' : 'translateY(16px)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease, background 0.2s',
                    pointerEvents: backToTopStage > 0 ? 'auto' : 'none'
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(26, 18, 101, 0.12)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'; }}
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A1265" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15"/>
                </svg>
            </button>

            {/* LIVE DEMO PREVIEW MODAL — with inline color picker */}
            {showLiveDemoModal && (
                <div 
                    onClick={() => setShowLiveDemoModal(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(15, 23, 42, 0.80)',
                        backdropFilter: 'blur(14px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease',
                        padding: '60px 20px 20px',
                        overflowY: 'auto',
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%' }}>
                    {/* Close button */}
                    <button 
                        onClick={() => setShowLiveDemoModal(false)}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            background: 'white',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            color: '#1A1265',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 1020,
                            fontWeight: '900',
                            fontSize: '18px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ✕
                    </button>

                    {/* Phone mockup */}
                    <div 
                        onClick={e => e.stopPropagation()}
                        style={{ animation: 'scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', flexShrink: 0 }}
                    >
                        <div style={{ transform: 'scale(min(1, calc((100vh - 200px) / 650)))', transformOrigin: 'top center' }}>
                            <PhonePreview>
                                <iframe 
                                    src={`${DEMO_LIVE_PREVIEW_URL}?theme_color=${encodeURIComponent(demoThemeColor)}&bg_color=${encodeURIComponent(demoBgColor)}`}
                                    style={{ 
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '375px', 
                                        height: '792px', 
                                        border: 'none', 
                                        transform: 'scale(0.768)',
                                        transformOrigin: 'top left',
                                        background: demoBgColor
                                    }}
                                    title="NFCrafter Real Live Demo"
                                />
                            </PhonePreview>
                        </div>
                    </div>

                    {/* Inline Color Picker — below the phone */}
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'rgba(255,255,255,0.10)',
                            backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '20px',
                            padding: '14px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '10px',
                            animation: 'scaleUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                    >
                        <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                            🎨 Choisir la couleur du profil
                        </span>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {CARD_COLORS.map((color) => {
                                const config = COLOR_MAP[color.id] || { theme: color.hex, bg: '#f8fafc' };
                                const isActive = demoThemeColor === config.theme && demoBgColor === config.bg;
                                return (
                                    <button
                                        key={color.id}
                                        onClick={() => { setDemoThemeColor(config.theme); setDemoBgColor(config.bg); }}
                                        title={color.name}
                                        style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: color.hex,
                                            border: isActive ? '3px solid white' : '2px solid rgba(255,255,255,0.25)',
                                            cursor: 'pointer',
                                            outline: isActive ? '2px solid rgba(255,255,255,0.6)' : 'none',
                                            outlineOffset: '2px',
                                            boxShadow: isActive ? '0 0 12px rgba(255,255,255,0.4)' : '0 2px 6px rgba(0,0,0,0.3)',
                                            transition: 'all 0.2s',
                                            transform: isActive ? 'scale(1.18)' : 'scale(1)'
                                        }}
                                        onMouseOver={e => { if (!isActive) e.currentTarget.style.transform = 'scale(1.15)'; }}
                                        onMouseOut={e => { if (!isActive) e.currentTarget.style.transform = 'scale(1)'; }}
                                    />
                                );
                            })}
                        </div>
                        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>
                            Le profil se recharge avec la couleur sélectionnée
                        </span>
                    </div>
                    </div>
                </div>
            )}

            {/* VIDEO MODAL — Comment ça marche ? */}
            {showVideoModal && (
                <div
                    onClick={() => setShowVideoModal(false)}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(10, 15, 30, 0.90)',
                        backdropFilter: 'blur(16px)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'fadeIn 0.3s ease',
                        padding: '20px'
                    }}
                >
                    {/* Close */}
                    <button
                        onClick={() => setShowVideoModal(false)}
                        style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            background: 'white',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            color: '#1A1265',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            zIndex: 1020,
                            fontWeight: '900',
                            fontSize: '18px',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                            transition: 'transform 0.2s'
                        }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        ✕
                    </button>

                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            width: '100%',
                            maxWidth: '430px', // More portrait/upright for portrait phone demo
                            animation: 'scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '16px'
                        }}
                    >
                        <div style={{ textAlign: 'center' }}>
                            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '2px' }}>Démonstration NFCrafter</span>
                            <h3 style={{ color: 'white', fontFamily: 'Outfit', fontSize: '22px', fontWeight: '900', margin: '6px 0 0 0' }}>Comment fonctionne la carte ? 📲</h3>
                        </div>

                        {/* Responsive video wrapper 4:5 aspect ratio (Vertical Screen Format) */}
                        <div style={{ position: 'relative', paddingBottom: '125%', height: 0, borderRadius: '24px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <video
                                src={DEMO_VIDEO_SRC}
                                autoPlay
                                controls
                                playsInline
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                                onError={e => { e.currentTarget.parentElement.innerHTML = '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.5);gap:12px"><svg width=48 height=48 viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M15 10l4.553-2.07A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.9L15 14M4 8a2 2 0 012-2h9a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z\"/></svg><span style=\"font-size:13px\">Vidéo bientôt disponible</span></div>'; }}
                            />
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center', margin: 0 }}>
                            Cliquez en dehors de la vidéo pour fermer
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
