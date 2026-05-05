import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [session, setSession] = useState(null);

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
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription?.unsubscribe();
        };
    }, []);

    const whatsappNumber = "22969473921";

    const getWhatsAppUrl = (pack) => {
        const message = pack === 'physique'
            ? "Bonjour NFCrafter, je souhaite commander le Pack Physique (Carte + Profil) à 10.000f."
            : "Bonjour NFCrafter, je souhaite commander le Pack Digital (QR + Profil) à 5.000f.";
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div style={{ background: '#F4F6F9', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#111827', position: 'relative' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
                
                html { scroll-behavior: smooth; }

                /* ── Gallery Premium ── */
                @keyframes cardWobble1 {
                    0%, 100% { transform: perspective(900px) rotateY(-22deg) rotateX(6deg) translateY(0px) scale(1); }
                    50% { transform: perspective(900px) rotateY(22deg) rotateX(-4deg) translateY(-14px) scale(1.04); }
                }
                @keyframes cardWobble2 {
                    0%, 100% { transform: perspective(900px) rotateY(18deg) rotateX(-6deg) translateY(0px) scale(1); }
                    50% { transform: perspective(900px) rotateY(-24deg) rotateX(6deg) translateY(-16px) scale(1.03); }
                }
                @keyframes cardWobble3 {
                    0%, 100% { transform: perspective(900px) rotateY(-26deg) rotateX(4deg) translateY(0px) scale(1); }
                    50% { transform: perspective(900px) rotateY(18deg) rotateX(-6deg) translateY(-12px) scale(1.05); }
                }
                @keyframes galleryScrollLeft {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .gallery-row-left {
                    display: flex; gap: 32px;
                    animation: galleryScrollLeft 40s linear infinite;
                    width: max-content; padding: 20px 0;
                }
                /* Pause only on real pointer devices — not on touch screens */
                @media (hover: hover) {
                    .gallery-fade:hover .gallery-row-left { animation-play-state: paused; }
                }
                /* Faster on mobile */
                @media (max-width: 768px) {
                    .gallery-row-left { animation-duration: 18s; gap: 20px; }
                }
                .gallery-fade {
                    -webkit-mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
                    mask-image: linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%);
                    overflow: hidden;
                }
                .gcw {
                    flex-shrink: 0; border-radius: 18px; overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08);
                    backface-visibility: hidden; -webkit-backface-visibility: hidden;
                    cursor: pointer; transition: transform 0.3s, box-shadow 0.3s;
                }
                .gcw:hover { box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.2); }
                .gcw:nth-child(3n+1) { animation: cardWobble1 7s ease-in-out infinite; }
                .gcw:nth-child(3n+2) { animation: cardWobble2 8.5s ease-in-out infinite; animation-delay: -3s; }
                .gcw:nth-child(3n+3) { animation: cardWobble3 6s ease-in-out infinite; animation-delay: -5s; }
                .gallery-dot-grid {
                    position: absolute; inset: 0;
                    background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
                    background-size: 32px 32px;
                    pointer-events: none; z-index: 0;
                }
                

                .bg-orb {
                    position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5; pointer-events: none; z-index: 0;
                }
                .orb-1 { top: -10%; left: -5%; width: 50vw; height: 50vw; background: #E0E7FF; }
                .orb-2 { top: 20%; right: -10%; width: 40vw; height: 40vw; background: #F3E8FF; }
                .orb-3 { bottom: 10%; left: 10%; width: 45vw; height: 45vw; background: #E0F2FE; }

                /* Layout */
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative; z-index: 10; }
                .section { padding: 120px 0; }
                
                /* Animations */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
                @keyframes floatMed { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(2deg); } }
                @keyframes floatFast { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(-2deg); } }

                @keyframes pulseBadge { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
                @keyframes scrollText { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                
                .marquee-container { overflow: hidden; white-space: nowrap; padding: 16px 0; background: rgba(255,255,255,0.5); border-top: 1px solid rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.03); }
                .marquee-content { display: inline-block; animation: scrollText 30s linear infinite; font-size: 14px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; letter-spacing: 2px; }
                .marquee-content span { margin: 0 24px; }
                
                details { background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.9); border-radius: 16px; margin-bottom: 16px; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.02); overflow: hidden; }
                details[open] { background: rgba(255,255,255,0.9); box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
                summary { padding: 24px; font-weight: 800; font-size: 18px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; color: #111827; }
                summary::-webkit-details-marker { display: none; }
                summary::after { content: '+'; font-size: 24px; font-weight: 400; color: #6B7280; transition: transform 0.3s; }
                details[open] summary::after { transform: rotate(45deg); }
                .faq-content { padding: 0 24px 24px 24px; color: #4B5563; line-height: 1.6; font-size: 16px; }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }
                .delay-3 { animation-delay: 0.3s; }
                
                /* Floating Glass Nav */
                .glass-nav {
                    position: fixed;
                    top: 24px; left: 50%; transform: translateX(-50%);
                    width: calc(100% - 48px); max-width: 1000px;
                    height: 72px;
                    border-radius: 100px;
                    background: rgba(255, 255, 255, 0.4);
                    backdrop-filter: blur(24px) saturate(180%);
                    -webkit-backdrop-filter: blur(24px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                    display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
                    z-index: 1000;
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .glass-nav.scrolled {
                    background: rgba(255, 255, 255, 0.75);
                    box-shadow: 0 15px 50px rgba(0,0,0,0.08);
                    top: 16px;
                    width: calc(100% - 32px);
                }
                .nav-link { color: #4B5563; text-decoration: none; font-weight: 600; font-size: 15px; transition: all 0.2s; cursor: pointer; padding: 8px 16px; border-radius: 100px; }
                .nav-link:hover { color: #111827; background: rgba(255,255,255,0.6); box-shadow: 0 2px 10px rgba(0,0,0,0.02); }

                /* Glass Panels */
                .glass-panel {
                    background: rgba(255, 255, 255, 0.6);
                    backdrop-filter: blur(30px) saturate(150%);
                    -webkit-backdrop-filter: blur(30px) saturate(150%);
                    border: 1px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 10px 40px rgba(31, 38, 135, 0.05);
                    border-radius: 32px;
                    padding: 40px;
                    transition: all 0.4s ease;
                }
                .glass-panel:hover {
                    box-shadow: 0 15px 50px rgba(31, 38, 135, 0.08);
                    background: rgba(255, 255, 255, 0.7);
                    transform: translateY(-4px);
                }

                /* Buttons */
                .btn-primary {
                    background: linear-gradient(135deg, #4F46E5, #3B82F6); color: white; padding: 18px 36px; border-radius: 100px; 
                    font-size: 16px; font-weight: 800; border: none; cursor: pointer; 
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.3);
                    position: relative; overflow: hidden;
                }
                .btn-primary::after {
                    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    animation: shine 3s infinite;
                }
                @keyframes shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(79, 70, 229, 0.4); }
                
                .btn-secondary {
                    background: rgba(255, 255, 255, 0.7); color: #111827; padding: 18px 36px; border-radius: 100px; 
                    font-size: 16px; font-weight: 700; border: 1px solid rgba(255,255,255,0.9); 
                    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(10px); box-shadow: 0 4px 15px rgba(0,0,0,0.03);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .btn-secondary:hover { background: white; transform: translateY(-3px); box-shadow: 0 8px 25px rgba(0,0,0,0.05); }

                /* Hero */
                .hero-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 60px; align-items: center; min-height: 80vh; padding-top: 100px; }
                
                /* Hero Visual Stack */
                .visual-stack { position: relative; width: 100%; height: 500px; display: flex; align-items: center; justify-content: center; perspective: 1200px; }
                .glass-card {
                    width: 360px; border-radius: 22px; position: absolute;
                    border: 1px solid rgba(255,255,255,0.9);
                    box-shadow: 0 25px 60px rgba(0,0,0,0.2);
                    backdrop-filter: blur(10px);
                    transition: all 0.5s ease-out;
                }
                .glass-card.front { top: 15%; left: 5%; z-index: 3; animation: float3dFront 6s ease-in-out infinite; }
                .glass-card.back { bottom: 15%; right: 5%; z-index: 1; animation: float3dBack 7.5s ease-in-out infinite; animation-delay: 1s; }

                @keyframes float3dFront {
                    0%, 100% { transform: translateY(0) rotateY(15deg) rotateX(10deg) rotateZ(-5deg) scale(1); }
                    50% { transform: translateY(-20px) rotateY(5deg) rotateX(5deg) rotateZ(-2deg) scale(1.02); }
                }
                @keyframes float3dBack {
                    0%, 100% { transform: translateY(0) rotateY(-15deg) rotateX(-10deg) rotateZ(5deg) scale(1); }
                    50% { transform: translateY(-25px) rotateY(-5deg) rotateX(-5deg) rotateZ(2deg) scale(1.02); }
                }

                @keyframes floatPackImg {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes floatPackImgOffset {
                    0%, 100% { transform: translateY(30px); }
                    50% { transform: translateY(15px); }
                }

                /* Cards & Grids */
                .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                
                .icon-circle {
                    width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.8);
                    display: flex; align-items: center; justify-content: center; font-size: 28px; margin-bottom: 24px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,0.9);
                }

                /* Pricing */
                .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 900px; margin: 0 auto; }
                .price-card {
                    display: flex; flex-direction: column; position: relative;
                }
                .price-card.featured { 
                    background: white; color: #111827; border: 2px solid #4F46E5; 
                    box-shadow: 0 20px 60px rgba(79, 70, 229, 0.1);
                }
                .price-card.premium {
                    background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%);
                    border: 2px solid #3B82F6;
                    box-shadow: 0 20px 60px rgba(59, 130, 246, 0.15);
                }
                .price-list { list-style: none; padding: 0; margin: 0 0 40px 0; display: flex; flex-direction: column; gap: 16px; }
                .price-list li { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 500; }

                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr; text-align: center; }
                    .hero-text { align-items: center; display: flex; flex-direction: column; }
                    .bento-grid { grid-template-columns: repeat(2, 1fr); }
                    .visual-stack { height: 500px; margin-top: 40px; }
                    .glass-card.front { left: 10%; }
                    .glass-card.back { right: 10%; }
                }

                .pack-images-row { display: flex; gap: 32px; margin-bottom: 40px; align-items: center; justify-content: center; flex-wrap: nowrap; }
                .pack-profile-img { height: 350px; width: auto; object-fit: cover; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); animation: floatPackImg 6s ease-in-out infinite; }
                .pack-plus { font-size: 56px; font-weight: 900; color: #111827; text-shadow: 0 10px 30px rgba(0,0,0,0.05); font-family: Outfit; }
                .pack-qr-img { height: 180px; width: 180px; object-fit: cover; border-radius: 24px; box-shadow: 0 25px 50px rgba(0,0,0,0.15); animation: floatPackImg 7s ease-in-out infinite 0.5s; }

                @media (min-width: 769px) {
                    .mobile-only { display: none !important; }
                }
                @media (max-width: 768px) {
                    .desktop-only { display: none !important; }
                    .mobile-hide { display: none !important; }
                    .showcase-mobile-fix { padding: 60px 0 20px 0 !important; }
                    .showcase-stack-mobile { transform: scale(0.75) !important; height: 200px !important; margin-top: 20px !important; margin-bottom: 20px !important; }
                    .section { padding: 60px 0; }
                    .hero-title { font-size: 42px !important; line-height: 1.1 !important; }
                    .hero-subtitle { font-size: 18px !important; }
                    .bento-grid { grid-template-columns: 1fr; }
                    .pricing-grid { grid-template-columns: 1fr; }
                    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
                    .price-card { padding: 32px; }
                    
                    .glass-nav { width: calc(100% - 32px); padding: 0 16px; }
                    
                    .visual-stack { height: 160px; min-height: unset; display: flex; align-items: center; justify-content: center; transform: scale(0.65); margin-top: 40px; margin-bottom: 0; }
                    
                    .pack-images-row { gap: 12px; margin-bottom: 24px; }
                    .pack-profile-img { height: 200px; }
                    .pack-plus { font-size: 32px; }
                    .pack-qr-img { height: 100px; width: 100px; }
                }
            `}</style>

            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>
            <div className="bg-orb orb-3"></div>

            {/* Navigation */}
            <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '28px' }} />
                    <span className="mobile-hide" style={{ fontSize: '20px', fontWeight: '900', color: '#111827', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                </div>
                <div className="mobile-hide" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <a href="#utilite" className="nav-link">Comment ça marche ?</a>
                    <a href="#tarifs" className="nav-link">Nos Packs</a>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    
                    {/* Bouton WhatsApp (Desktop) */}
                    <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary desktop-only" style={{ padding: '10px 16px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                        Commander
                    </button>
                    
                    {/* Bouton WhatsApp (Mobile) */}
                    <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="mobile-only" style={{ background: '#25D366', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(37, 211, 102, 0.3)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                    </button>

                    {/* Bouton Espace Client / Connexion */}
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: session ? '#EEF2FF' : '#FFFFFF',
                            border: session ? '1px solid #C7D2FE' : '1px solid #E5E7EB',
                            color: session ? '#4F46E5' : '#4B5563',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '13px',
                            padding: '8px 12px',
                            borderRadius: '100px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            whiteSpace: 'nowrap'
                        }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        <span style={{ fontSize: '14px' }}>{session ? '👤' : '🔒'}</span>
                        <span>{session ? 'Mon Espace' : 'Connexion'}</span>
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="section" style={{ paddingTop: '40px' }}>
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-text animate-fade-up">
                            <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', color: '#374151', padding: '10px 24px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                La carte de visite intelligente
                            </div>
                            <h1 className="hero-title" style={{ fontSize: '68px', fontWeight: '900', color: '#111827', letterSpacing: '-0.03em', lineHeight: '1.05', marginBottom: '24px', fontFamily: 'Outfit' }}>
                                Touchez, partagez, <br />impressionnez.
                            </h1>
                            <p className="hero-subtitle" style={{ fontSize: '20px', color: '#4B5563', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>
                                Échangez vos coordonnées, réseaux sociaux et bien plus en un seul geste. Plus besoin d'épeler votre nom ou votre numéro.
                            </p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                                <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary">
                                    Créer ma carte maintenant
                                </button>
                                {/* ⚠️ Remplacer /p/demo par le slug d'un vrai profil client */}
                                <a href="u/10j24wrb" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span>👀 Tester un profil</span>
                                    <span style={{ fontSize: '16px' }}>&#8594;</span>
                                </a>
                            </div>
                           
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                               <span><strong style={{ color: '#10B981' }}>100% Sécurisé.</strong> Vos données sont modifiables uniquement par vous.</span>
                            </div>
                        </div>

                        <div className="animate-fade-up delay-1" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                                {/* Arrière-plan coloré pour faire ressortir l'image */}
                                <div style={{ position: 'absolute', top: '10px', left: '-10px', right: '10px', bottom: '-10px', background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', borderRadius: '32px', opacity: 0.15, filter: 'blur(20px)', zIndex: 0 }}></div>
                                
                                <video 
                                    src="/demo-nfc.mp4" 
                                    autoPlay 
                                    loop 
                                    muted 
                                    playsInline
                                    controls
                                    style={{ 
                                        width: '100%', 
                                        height: '400px', 
                                        borderRadius: '32px', 
                                        boxShadow: '0 25px 60px rgba(0,0,0,0.15)', 
                                        transform: 'rotate(-2deg)', 
                                        border: '6px solid white',
                                        position: 'relative',
                                        zIndex: 1,
                                        animation: 'floatSlow 6s ease-in-out infinite',
                                        objectFit: 'cover',
                                        backgroundColor: '#1A1265'
                                    }} 
                                />
                                
                                {/* Badge de statut flottant */}
                                <div className="glass-panel" style={{ position: 'absolute', bottom: '-15px', right: '-15px', padding: '10px 18px', borderRadius: '100px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '8px', animation: 'floatFast 4s ease-in-out infinite', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                    <span style={{ fontSize: '18px' }}>🎬</span>
                                    <span style={{ fontWeight: '800', fontSize: '13px', color: '#111827' }}>Démonstration</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Scrolling Banner */}
            <div className="marquee-container">
                <div className="marquee-content">
                    <span>Étudiants</span> • <span>E-commercants</span> • <span>Médecins</span> • <span>Commerciaux</span> • <span>Artisans</span> • <span>Influenceurs</span> • <span>Avocats</span> • <span>Restaurateurs</span> • <span>Freelances</span> • <span>Dirigeants</span> • <span>Artistes</span> • <span>Vidéastes/Graphistes/Photographes</span> • <span>Coachs</span> • <span>Coiffeuses/Coiffeurs</span> • <span>Boutiques</span> • <span>Tout le monde</span> •
                    <span>Étudiants</span> • <span>E-commercants</span> • <span>Médecins</span> • <span>Commerciaux</span> • <span>Artisans</span> • <span>Influenceurs</span> • <span>Avocats</span> • <span>Restaurateurs</span> • <span>Freelances</span> • <span>Dirigeants</span> • <span>Artistes</span> • <span>Vidéastes/Graphistes/Photographes</span> • <span>Coachs</span> • <span>Coiffeuses/Coiffeurs</span> • <span>Boutiques</span> • <span>Tout le monde</span> •
                    <span>Étudiants</span> • <span>E-commercants</span> • <span>Médecins</span> • <span>Commerciaux</span> • <span>Artisans</span> • <span>Influenceurs</span> • <span>Avocats</span> • <span>Restaurateurs</span> • <span>Freelances</span> • <span>Dirigeants</span> • <span>Artistes</span> • <span>Vidéastes/Graphistes/Photographes</span> • <span>Coachs</span> • <span>Coiffeuses/Coiffeurs</span> • <span>Boutiques</span> • <span>Tout le monde</span> •
                    <span>Étudiants</span> • <span>E-commercants</span> • <span>Médecins</span> • <span>Commerciaux</span> • <span>Artisans</span> • <span>Influenceurs</span> • <span>Avocats</span> • <span>Restaurateurs</span> • <span>Freelances</span> • <span>Dirigeants</span> • <span>Artistes</span> • <span>Vidéastes/Graphistes/Photographes</span> • <span>Coachs</span> • <span>Coiffeuses/Coiffeurs</span> • <span>Boutiques</span> • <span>Tout le monde</span> •
                </div>
            </div>

            {/* Utility Section */}
            <section id="utilite" className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Pourquoi choisir une carte intelligente ?</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Oubliez les dictées de numéros et les cartes en papier perdues. Passez au niveau supérieur dans toutes vos rencontres.</p>
                    </div>

                    <div className="bento-grid">
                        <div className="glass-panel animate-fade-up delay-1">
                            <div className="icon-circle">⚡</div>
                            <h3 style={{ fontWeight: '800', fontSize: '22px', marginBottom: '12px', fontFamily: 'Outfit' }}>Sans application</h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6' }}>Votre interlocuteur n'a rien à télécharger. Le profil s'ouvre directement dans son navigateur web par simple contact NFC ou scan de QR code.</p>
                        </div>
                        <div className="glass-panel animate-fade-up delay-2">
                            <div className="icon-circle">🔄</div>
                            <h3 style={{ fontWeight: '800', fontSize: '22px', marginBottom: '12px', fontFamily: 'Outfit' }}>Modifiable à l'infini</h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6' }}>Vous changez de numéro ou de réseau social ? Modifiez vos informations en temps réel depuis votre tableau de bord. La carte physique reste la même.</p>
                        </div>
                        <div className="glass-panel animate-fade-up delay-3">
                            <div className="icon-circle">🌍</div>
                            <h3 style={{ fontWeight: '800', fontSize: '22px', marginBottom: '12px', fontFamily: 'Outfit' }}>Un seul achat à vie</h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6' }}>Plus besoin de réimprimer 500 cartes tous les 6 mois. Une seule carte NFC robuste suffit pour des années de rencontres.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Showcase 3D Cards Section (Dark Mode Premium) */}
            <section className="section showcase-mobile-fix" style={{ background: '#111827', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div className="bg-orb" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80vw', height: '80vw', background: '#374151', filter: 'blur(120px)', opacity: 0.6 }}></div>
                
                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="hero-grid" style={{ minHeight: 'unset', padding: '0', alignItems: 'center' }}>
                        <div className="hero-text animate-fade-up">
                            <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: 'white', letterSpacing: '-0.02em', marginBottom: '24px' }}>
                                Une carte premium,<br/>100% à votre image.
                            </h2>
                            <p style={{ color: '#D1D5DB', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                                Ne vous contentez pas d'une carte standard. Intégrez votre logo, votre nom et vos couleurs. Nos cartes NFC sont conçues en matériaux durables pour laisser une impression inoubliable à chaque rencontre.
                            </p>
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#E5E7EB' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>✓</div>
                                    Finition brillante
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#E5E7EB' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>✓</div>
                                    Puce NFC ultra-rapide intégrée
                                </li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', color: '#E5E7EB' }}>
                                    <div style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34D399', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>✓</div>
                                    QR Code permanent gravé au verso de la carte
                                </li>
                            </ul>

                            
                            
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ background: 'white', color: '#111827', border: 'none', boxShadow: '0 10px 20px rgba(0,0,0,0.3)' }}>
                                Je veux ma carte physique
                            </button>
                        </div>
                        
                        {/* 3D Floating Cards optimized for mobile */}
                        <div className="animate-fade-up delay-1" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <div className="visual-stack showcase-stack-mobile">
                                {/* Card Recto */}
                                <img src="/card-recto.png" alt="Card Front" className="glass-card front" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.2)' }} onError={(e) => e.target.src = 'https://placehold.co/600x375/334155/ffffff?text=Design+Recto'} />

                                {/* Card Verso */}
                                <img src="/card-verso.png" alt="Card Back" className="glass-card back" style={{ boxShadow: '0 30px 60px rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)' }} onError={(e) => e.target.src = 'https://placehold.co/600x375/1e293b/ffffff?text=Design+Verso'} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Digital Pack Extra Features Section */}
            <section className="section" style={{ background: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.5)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <div className="animate-fade-up">
                            <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '24px' }}>
                                Le Pack Digital : Votre identité partout
                            </h2>
                            <p style={{ color: '#4B5563', fontSize: '18px', marginBottom: '32px', lineHeight: '1.6' }}>
                                Le Pack Digital est parfait pour booster votre visibilité en ligne. Commandez-le directement et transformez votre manière de communiquer, sans même avoir besoin de carte physique.
                            </p>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
                                <li style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>🔗</div>
                                    <div>
                                        <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>Lien en bio (Instagram, TikTok,etc.)</h4>
                                        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.5' }}>Un lien unique pour centraliser vos réseaux, portfolio et contacts. Vos abonnés ont accès à tout votre univers.</p>
                                    </div>
                                </li>
                                <li style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>📅</div>
                                    <div>
                                        <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>Prise de Rendez-vous simplifiée</h4>
                                        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.5' }}>Médecins, artisans, salons : posez votre QR Code sur votre comptoir ou bureau. Vos clients y trouvent vos liens Doctolib, Calendly ou WhatsApp pour booker en 1 clic.</p>
                                    </div>
                                </li>
                                <li style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>📱</div>
                                    <div>
                                        <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>Votre code QR personnalisé</h4>
                                        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.5' }}>Affichez-le sur vos flyers, menus ou cartes classiques. Idéal pour partager votre univers digital sans le moindre effort.</p>
                                    </div>
                                </li>
                            </ul>
                            
                            <div className="pack-images-row">
                                <img src="/placeholder-public-profile.jpg" alt="Capture profil public" className="pack-profile-img" onError={(e) => e.target.src='https://placehold.co/400x700/f8fafc/1a1265?text=Page+Profil'} />
                                <div className="pack-plus">+</div>
                                <img src="/placeholder-qr-custom.jpg" alt="QR Code personnalisé" className="pack-qr-img" onError={(e) => e.target.src='https://placehold.co/400x400/f1f5f9/1a1265?text=QR+Code'} />
                            </div>

                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-primary" style={{ margin: '0 auto' }}>
                                Commander le Pack Digital
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Target Audience Section */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>À qui s'adresse NFCrafter ?</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Absolument tout le monde ! C'est l'outil ultime pour toutes vos prises de contact rapides, pro ou perso.</p>
                    </div>

                    <div className="pricing-grid">
                        {/* Digital Audience */}
                        <div className="glass-panel animate-fade-up delay-1" style={{ padding: '40px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '150px', opacity: '0.05', pointerEvents: 'none' }}>🌐</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Outfit', marginBottom: '12px', color: '#111827', position: 'relative', zIndex: 1 }}>Le Pack Digital</h3>
                            <div style={{ fontWeight: '700', color: '#4B5563', marginBottom: '32px', fontSize: '16px', position: 'relative', zIndex: 1 }}>L'identité 100% connectée :</div>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, position: 'relative', zIndex: 1 }}>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ background: '#E0E7FF', color: '#4F46E5', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold' }}>✓</div>
                                    <span style={{ color: '#374151', lineHeight: '1.6', fontSize: '16px' }}><strong>Créateurs & Freelances</strong> souhaitant un "Lien en bio" premium pour centraliser tous leurs réseaux et portfolios.</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ background: '#E0E7FF', color: '#4F46E5', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold' }}>✓</div>
                                    <span style={{ color: '#374151', lineHeight: '1.6', fontSize: '16px' }}><strong>Commerces & Boutiques</strong> désirant afficher un QR Code élégant à scanner sur leur comptoir ou menu.</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ background: '#E0E7FF', color: '#4F46E5', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold' }}>✓</div>
                                    <span style={{ color: '#374151', lineHeight: '1.6', fontSize: '16px' }}><strong>Pour tous au quotidien</strong> : Un lien unique à envoyer par message ou à mettre en bio pour donner toutes vos infos d'un coup.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Physical Audience */}
                        <div className="glass-panel animate-fade-up delay-2" style={{ padding: '40px', background: '#111827', color: 'white', border: '1px solid #374151', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '150px', opacity: '0.05', pointerEvents: 'none' }}>💳</div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ background: 'linear-gradient(90deg, #F59E0B, #FBBF24)', color: '#111827', padding: '4px 12px', borderRadius: '100px', fontSize: '11px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', alignSelf: 'flex-start', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        <span>🌟</span> LE PLUS POPULAIRE
                                    </div>
                                    <h3 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Outfit', margin: 0, color: 'white' }}>Le Pack Physique</h3>
                                </div>
                            </div>
                            
                            <div style={{ fontWeight: '700', color: '#9CA3AF', marginBottom: '32px', fontSize: '16px', position: 'relative', zIndex: 1 }}>L'atout des rencontres en présentiel </div>
                            
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, position: 'relative', zIndex: 1 }}>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold' }}>✓</div>
                                    <span style={{ color: '#D1D5DB', lineHeight: '1.6', fontSize: '16px' }}><strong>En Soirée, Concerts & Festivals</strong> : La musique est trop forte ? Sortez votre carte et partagez vos coordonnées en un "tap".</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold' }}>✓</div>
                                    <span style={{ color: '#D1D5DB', lineHeight: '1.6', fontSize: '16px' }}><strong>Dans la rue & en Voyage</strong> : Une rencontre inattendue ? Plus besoin de dicter les chiffres ou d'épeler votre nom.</span>
                                </li>
                                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px', fontWeight: 'bold' }}>✓</div>
                                    <span style={{ color: '#D1D5DB', lineHeight: '1.6', fontSize: '16px' }}><strong>Networking, Meetings & Étudiants</strong> : Faites le show ! Marquez les esprits lors de vos conférences ou événements en donnant vos contacts, vos réseaux sociaux ou portfolio en un clic.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>


            {/* Gallery Section — Premium */}
            <section style={{ background: 'linear-gradient(160deg, #0B0F1A 0%, #111827 45%, #0D1321 100%)', overflow: 'hidden', padding: '72px 0', position: 'relative' }}>
                {/* Dot grid */}
                <div className="gallery-dot-grid"></div>

                {/* Glows */}
                <div style={{ position: 'absolute', top: '20%', left: '15%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', top: '60%', left: '55%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(168,85,247,0.10) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }}></div>

                {/* Header */}
                <div className="container" style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px', color: '#9CA3AF' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#E5E7EB', display: 'inline-block' }}></span>
                        Pour tous types de métiers
                    </div>
                    <h2 style={{ fontSize: '52px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em', marginBottom: '20px', lineHeight: 1.05, color: '#FFFFFF' }}>
                        Des cartes qui font tourner les têtes
                    </h2>
                    <p style={{ color: '#6B7280', fontSize: '18px', maxWidth: '520px', margin: '0 auto', lineHeight: '1.6' }}>Chaque design est créé sur-mesure. Votre identité, votre style, votre carte.</p>
                </div>

                {/* Single-row scrolling gallery */}
                <div className="gallery-fade" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="gallery-row-left">
                        {[
                            { src: '/gallery-1.jpg', label: 'Entrepreneur' },
                            { src: '/gallery-2.jpg', label: 'Comptable' },
                            { src: '/gallery-3.jpg', label: 'Commercial' },
                            { src: '/gallery-4.jpg', label: 'Corporate' },
                            { src: '/gallery-5.jpg', label: 'Étudiant' },
                            { src: '/gallery-6.jpg', label: 'Médecin' },
                            { src: '/gallery-7.jpg', label: 'Sans photo' },
                            { src: '/gallery-8.jpg', label: 'Marque' },
                            { src: '/gallery-1.jpg', label: 'Entrepreneur' },
                            { src: '/gallery-2.jpg', label: 'Comptable' },
                            { src: '/gallery-3.jpg', label: 'Commercial' },
                            { src: '/gallery-4.jpg', label: 'Corporate' },
                            { src: '/gallery-5.jpg', label: 'Étudiant' },
                            { src: '/gallery-6.jpg', label: 'Médecin' },
                            { src: '/gallery-7.jpg', label: 'Sans photo' },
                            { src: '/gallery-8.jpg', label: 'Marque' },
                        ].map((card, i) => (
                            <div key={i} className="gcw" style={{ width: '300px', height: '190px', position: 'relative' }}>
                                <img src={card.src} alt={`Carte NFC ${card.label}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={(e) => { e.target.src = `https://placehold.co/600x380/1e2d4a/818CF8?text=${encodeURIComponent(card.label)}`; }} />
                                <div style={{ position: 'absolute', bottom: '10px', left: '14px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', color: 'white', padding: '3px 11px', borderRadius: '100px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.5px', border: '1px solid rgba(255,255,255,0.12)' }}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA */}
                <div style={{ textAlign: 'center', marginTop: '40px', position: 'relative', zIndex: 2 }}>
                    <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ background: 'white', color: '#111827', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.35)', fontSize: '16px', padding: '18px 40px' }}>
                        ✦ Je veux ma carte personnalisée
                    </button>
                    <p style={{ color: '#4B5563', fontSize: '13px', marginTop: '16px', fontWeight: '600' }}>Design inclus — Livraison sous 24-48h</p>
                </div>
            </section>
            

            {/* Steps Section */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em' }}>Comment l'obtenir en 3 étapes</h2>
                    </div>

                    <div className="bento-grid">
                        {[
                            { step: "1", title: "Commandez via WhatsApp", desc: "Choisissez votre pack digital ou physique. Contactez-nous et envoyez-nous vos informations personnelles." },
                            { step: "2", title: "Reçu sous 24–48h", desc: "Nous préparons votre commande et vous envoyons un lien d'activation quelques minutes après pour le pack digital et sous 24 à 48 heures ouvrées pour le pack physique pour créer votre compte sur notre plateforme." },
                            { step: "3", title: "Gérez votre profil", desc: "Connectez-vous à tout moment pour modifier vos informations en temps réel. Votre carte physique, elle, reste inchangée." }
                        ].map((item, i) => (
                            <div key={i} className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '140px', fontWeight: '900', color: 'rgba(255,255,255,0.8)', textShadow: '0 10px 30px rgba(0,0,0,0.02)', lineHeight: 1, zIndex: 0, pointerEvents: 'none', fontFamily: 'Outfit' }}>
                                    {item.step}
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ fontWeight: '800', fontSize: '24px', marginBottom: '16px', fontFamily: 'Outfit' }}>{item.title}</h3>
                                    <p style={{ color: '#4B5563', lineHeight: '1.6', fontSize: '16px' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="section" style={{ background: 'rgba(255,255,255,0.6)', borderTop: '1px solid rgba(255,255,255,0.9)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Ils ont passé le cap</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Découvrez pourquoi nos utilisateurs ne jurent plus que par NFCrafter pour leur quotidien.</p>
                    </div>

                    <div className="bento-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                        {/* Testimonial 1 */}
                        <div className="glass-panel animate-fade-up delay-1" style={{ padding: '32px', position: 'relative' }}>
                            <div style={{ fontSize: '60px', color: '#E5E7EB', position: 'absolute', top: '16px', right: '24px', fontFamily: 'serif', lineHeight: 1 }}>"</div>
                            <div style={{ display: 'flex', gap: '4px', color: '#FBBF24', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                                "Hier à la fin d'une conférence, on m'a demandé mes coordonnées. Au lieu de dicter les chiffres, j'ai juste sorti ma carte et touché le téléphone de mon interlocuteur. Il a lâché un 'Wow' et m'a enregistré instantanément. Ça change tout."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E0E7FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#4F46E5', fontSize: '18px' }}>M</div>
                                <div>
                                    <div style={{ fontWeight: '800', color: '#111827' }}>Marc A.</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Entrepreneur</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 2 */}
                        <div className="glass-panel animate-fade-up delay-2" style={{ padding: '32px', position: 'relative' }}>
                            <div style={{ fontSize: '60px', color: '#E5E7EB', position: 'absolute', top: '16px', right: '24px', fontFamily: 'serif', lineHeight: 1 }}>"</div>
                            <div style={{ display: 'flex', gap: '4px', color: '#FBBF24', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                                "Ce week-end en pleine ambiance, avec la musique à fond, c'était impossible de dicter mon Snap. J'ai sorti ma carte, je l'ai déposé une seconde en haut de l'écran du gars et paf, ajouté direct. Meilleur truc du monde pour faire des rencontres sans crier !"
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#D97706', fontSize: '18px' }}>L</div>
                                <div>
                                    <div style={{ fontWeight: '800', color: '#111827' }}>Nadia M.</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Étudiante</div>
                                </div>
                            </div>
                        </div>

                        {/* Testimonial 3 */}
                        <div className="glass-panel animate-fade-up delay-3" style={{ padding: '32px', position: 'relative' }}>
                            <div style={{ fontSize: '60px', color: '#E5E7EB', position: 'absolute', top: '16px', right: '24px', fontFamily: 'serif', lineHeight: 1 }}>"</div>
                            <div style={{ display: 'flex', gap: '4px', color: '#FBBF24', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic', position: 'relative', zIndex: 1 }}>
                                "J'ai commandé 5 cartes physiques pour mon équipe commerciale. Le design est hyper qualitatif. Quand nos commerciaux vont en rendez-vous, l'image de marque qu'on dégage fait vraiment la différence."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#059669', fontSize: '18px' }}>E</div>
                                <div>
                                    <div style={{ fontWeight: '800', color: '#111827' }}>Emmanuel T.</div>
                                    <div style={{ fontSize: '13px', color: '#6B7280' }}>Directeur d'Agence</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Nos Solutions</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px' }}>Un investissement pour la vie, un abonnement pour l'excellence.</p>
                    </div>

                    <div className="pricing-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', maxWidth: '1100px' }}>
                        {/* Digital Pack */}
                        <div className="glass-panel price-card">
                            <div style={{ background: '#F3F4F6', color: '#4B5563', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>L'essentiel</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', fontFamily: 'Outfit' }}>Pack Digital</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>5.000<small style={{ fontSize: '16px', fontWeight: '600', color: '#6B7280' }}>f CFA</small></div>
                            </div>

                            <ul className="price-list">
                                <li><span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> Profil digital de base inclus</li>
                                <li><span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> QR Code personnalisé</li>
                                <li><span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> Liens sociaux illimités</li>
                                <li><span style={{ color: '#10B981', fontWeight: '900' }}>✓</span> Partage rapide (Dashboard)</li>
                                <li style={{ color: '#9CA3AF' }}><span style={{ color: '#D1D5DB', fontWeight: '900' }}>✕</span> Pas de carte physique</li>
                            </ul>

                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-secondary" style={{ width: '100%', marginTop: 'auto', background: '#F3F4F6', color: '#1F2937', border: '1px solid #E5E7EB' }}>Choisir le Digital</button>
                        </div>

                        {/* Physical Pack */}
                        <div className="glass-panel price-card featured">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ background: '#EEF2FF', color: '#4F46E5', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Le Complet</div>
                                <div style={{ background: '#EF4444', color: 'white', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', animation: 'pulseBadge 2s infinite' }}>🔥 Populaire</div>
                            </div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', fontFamily: 'Outfit' }}>Pack Physique</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>10.000<small style={{ fontSize: '16px', fontWeight: '600', color: '#6B7280' }}>f CFA</small></div>
                            </div>

                            <ul className="price-list">
                                <li><span style={{ color: '#4F46E5', fontWeight: '900' }}>✓</span> <strong>Carte physique NFC Premium</strong></li>
                                <li><span style={{ color: '#4F46E5', fontWeight: '900' }}>✓</span> Design sur-mesure inclus</li>
                                <li><span style={{ color: '#4F46E5', fontWeight: '900' }}>✓</span> Profil digital & QR inclus</li>
                                <li><span style={{ color: '#4F46E5', fontWeight: '900' }}>✓</span> Partage rapide (Dashboard)</li>
                                <li><span style={{ color: '#4F46E5', fontWeight: '900' }}>✓</span> Livraison 24-48h</li>
                            </ul>

                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ width: '100%', marginTop: 'auto' }}>Commander la Carte</button>
                        </div>

                        {/* Pro Pack - New! */}
                        <div className="glass-panel price-card premium">
                            <div style={{ background: '#DBEAFE', color: '#1E40AF', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '24px' }}>L'excellence</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', fontFamily: 'Outfit', color: '#1E3A8A' }}>Pack Pro</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em', color: '#1E3A8A' }}>1.000<small style={{ fontSize: '16px', fontWeight: '600', color: '#1E40AF' }}>f CFA / mois</small></div>
                            </div>

                            <ul className="price-list">
                                <li><span style={{ color: '#3B82F6', fontWeight: '900' }}>✦</span> <strong>Nom personnalisé</strong> (marc.nfcrafter.com)</li>
                                <li><span style={{ color: '#3B82F6', fontWeight: '900' }}>✦</span> Bouton <strong>vCard</strong> (Enregistrer contact)</li>
                                <li><span style={{ color: '#3B82F6', fontWeight: '900' }}>✦</span> <strong>Badge 'Vérifié'</strong> bleu sur le profil</li>
                                <li><span style={{ color: '#3B82F6', fontWeight: '900' }}>✦</span> <strong>Zéro publicité</strong> NFCrafter</li>
                                <li><span style={{ color: '#3B82F6', fontWeight: '900' }}>✦</span> Thèmes animés & Vidéos</li>
                            </ul>

                            <button onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour, je souhaite activer le Pack Pro à 1000f/mois pour mon profil.')}`, '_blank')} className="btn-primary" style={{ width: '100%', marginTop: 'auto', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)' }}>Activer le Pack Pro</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Web Design Service Section */}
            <section className="section" style={{ background: '#111827', color: 'white', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                    <div className="hero-grid" style={{ alignItems: 'center', gap: '64px', minHeight: 'unset', padding: '0' }}>
                        
                        {/* Text Content */}
                        <div className="animate-fade-up">
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.4)', padding: '8px 20px', borderRadius: '100px', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '24px', color: '#A5B4FC' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8', display: 'inline-block', boxShadow: '0 0 10px #818CF8' }}></span>
                                Au-delà de la carte
                            </div>
                            
                            <h2 style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', color: 'white', letterSpacing: '-0.02em', marginBottom: '24px', lineHeight: '1.1' }}>
                                On crée aussi votre <span style={{ color: '#818CF8', textShadow: '0 0 30px rgba(129, 140, 248, 0.4)' }}>Site Internet</span> de A à Z.
                            </h2>
                            
                            <p style={{ color: '#D1D5DB', fontSize: '18px', marginBottom: '24px', lineHeight: '1.6' }}>
                                La carte NFC est parfaite pour le contact physique. Mais pour exister en ligne et digitaliser votre business, il vous faut un site web sur-mesure à intégrer dans votre profil digital NFCrafter ainsi que dans votre carte physique NFC. Confiez-nous votre projet.
                            </p>

                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(90deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2))', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px 24px', borderRadius: '12px', marginBottom: '40px' }}>
                                <span style={{ fontSize: '24px' }}>🎁</span>
                                <span style={{ color: '#34D399', fontWeight: '800', fontSize: '16px', letterSpacing: '0.5px' }}>Un site commandé = Une carte personnalisée offerte !</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '40px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>💎</div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit', color: 'white', marginBottom: '8px' }}>Sites Vitrines</h4>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.5' }}>Présentez votre entreprise, vos services et attirez de nouveaux prospects.</p>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '24px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>🛍️</div>
                                    <h4 style={{ fontSize: '18px', fontWeight: '800', fontFamily: 'Outfit', color: 'white', marginBottom: '8px' }}>Boutiques E-commerce</h4>
                                    <p style={{ fontSize: '14px', color: '#9CA3AF', lineHeight: '1.5' }}>Vendez vos produits en ligne avec des paiements sécurisés intégrés.</p>
                                </div>
                            </div>

                            <button onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour NFCrafter, je voudrais discuter de la création d\'un site internet professionnel pour mon entreprise. Pouvons-nous en parler ?')}`, '_blank')} className="btn-primary" style={{ background: 'white', color: '#111827', width: '100%', maxWidth: '400px', fontSize: '16px', padding: '20px 32px' }}>
                                Discuter à propos
                            </button>
                        </div>

                        {/* Visual Mockup */}
                        <div className="animate-fade-up delay-1" style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                                {/* Decorative elements */}
                                <div style={{ position: 'absolute', top: '10%', right: '-5%', width: '120px', height: '120px', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', borderRadius: '50%', filter: 'blur(40px)', zIndex: 0 }}></div>
                                
                                {/* Main Laptop Mockup */}
                                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '16px', position: 'relative', zIndex: 1, backdropFilter: 'blur(20px)', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' }}>
                                    <div style={{ background: '#0F172A', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {/* Browser Toolbar */}
                                        <div style={{ background: '#1E293B', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
                                            <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '24px', borderRadius: '100px', marginLeft: '12px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                                                <span style={{ fontSize: '10px', color: '#64748B' }}>www.votresite.com</span>
                                            </div>
                                        </div>
                                        {/* Browser Content */}
                                        <div style={{ padding: '32px 24px', position: 'relative' }}>
                                            {/* Hero Mockup */}
                                            <div style={{ width: '40%', height: '16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '24px' }}></div>
                                            <div style={{ width: '80%', height: '32px', background: 'linear-gradient(90deg, #818CF8, #38BDF8)', borderRadius: '8px', marginBottom: '16px' }}></div>
                                            <div style={{ width: '60%', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '32px' }}></div>
                                            
                                            <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
                                                <div style={{ width: '120px', height: '36px', background: '#38BDF8', borderRadius: '100px' }}></div>
                                                <div style={{ width: '120px', height: '36px', background: 'rgba(255,255,255,0.1)', borderRadius: '100px' }}></div>
                                            </div>

                                            {/* Grid Mockup */}
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                                <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}></div>
                                                <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}></div>
                                                <div style={{ height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Mobile Mockup overlapping */}
                                    <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '140px', background: '#0F172A', border: '4px solid #1E293B', borderRadius: '24px', padding: '8px', zIndex: 2, boxShadow: '0 20px 40px rgba(0,0,0,0.6)' }}>
                                        <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', margin: '0 auto 12px auto' }}></div>
                                        <div style={{ width: '100%', height: '80px', background: 'linear-gradient(135deg, #38BDF8, #818CF8)', borderRadius: '12px', marginBottom: '12px' }}></div>
                                        <div style={{ width: '80%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '8px' }}></div>
                                        <div style={{ width: '60%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '24px' }}></div>
                                        <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '8px' }}></div>
                                        <div style={{ width: '100%', height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Testimonials Section */}
            <section className="section" style={{ background: 'white' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Ils l'ont adoptée</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Des centaines de professionnels utilisent déjà des cartes NFC pour booster leur réseau.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        <div className="glass-panel animate-fade-up delay-1" style={{ padding: '32px', background: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ color: '#F59E0B', fontSize: '20px', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>"Je ne perds plus aucun contact après mes séminaires. Les gens scannent ma carte et j'ai directement un nouveau follower ou un message WhatsApp. C'est magique !"</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👨🏾‍💼</div>
                                <div>
                                    <h4 style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>Alain D.</h4>
                                    <span style={{ color: '#64748B', fontSize: '13px' }}>Entrepreneur Web</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel animate-fade-up delay-2" style={{ padding: '32px', background: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ color: '#F59E0B', fontSize: '20px', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>"Mes clients au restaurant adorent ! Ils scannent la carte sur le comptoir, voient le menu (que j'ai commandé sur NFCrafter) et s'abonnent à notre page Instagram. C'est ultra pratique et pro."</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>👩🏾‍🍳</div>
                                <div>
                                    <h4 style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>Sarah M.</h4>
                                    <span style={{ color: '#64748B', fontSize: '13px' }}>Gérante de Restaurant</span>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel animate-fade-up delay-3" style={{ padding: '32px', background: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
                            <div style={{ color: '#F59E0B', fontSize: '20px', marginBottom: '16px' }}>★★★★★</div>
                            <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '24px', fontStyle: 'italic' }}>"La qualité de la carte est incroyable. Quand je la sors en rendez-vous client, ça crée direct l'effet waouh. C'est le meilleur investissement pour mon business."</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🧑🏾‍💻</div>
                                <div>
                                    <h4 style={{ fontWeight: '800', color: '#111827', fontSize: '15px' }}>Marc K.</h4>
                                    <span style={{ color: '#64748B', fontSize: '13px' }}>Freelance IT</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="section" style={{ background: '#F4F6F9', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                <div className="container" style={{ maxWidth: '800px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '48px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Questions Fréquentes</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px' }}>Vous hésitez encore ? Voici tout ce que vous devez savoir.</p>
                    </div>

                    <div className="animate-fade-up delay-1">
                        <details>
                            <summary>Est-ce que ça marche avec tous les téléphones ?</summary>
                            <div className="faq-content">
                                Oui, à 100% ! Tous les smartphones récents (iPhone depuis 2018, Android) intègrent la technologie NFC et scannent la carte par simple contact. Pour les téléphones plus anciens, le QR Code gravé sur le dos de la carte prend le relais instantanément via scan QR.
                            </div>
                        </details>
                        
                        <details>
                            <summary>Mon interlocuteur a-t-il besoin d'une application ?</summary>
                            <div className="faq-content">
                                Absolument pas. C'est la beauté du système : votre profil s'ouvre directement dans le navigateur web par défaut de la personne (Safari, Chrome, etc.), comme un site internet.
                            </div>
                        </details>

                        <details>
                            <summary>Y a-t-il un abonnement à payer ?</summary>
                            <div className="faq-content">
                                L'utilisation de base de votre profil est <strong>gratuite à vie</strong> après l'achat de votre pack. Cependant, nous proposons une <strong>Option Pack Pro à 1000f/mois</strong> pour ceux qui veulent des fonctionnalités avancées : nom personnalisé (ex: marc.nfcrafter.com), bouton d'enregistrement de contact direct, badge vérifié et thèmes premium.
                            </div>
                        </details>

                        <details>
                            <summary>Comment se passe la livraison de la carte physique ?</summary>
                            <div className="faq-content">
                                Après validation de votre design, nous expédions la carte. Vous recevrez votre carte en général sous 24 à 48 heures ouvrées.
                            </div>
                        </details>

                        <details>
                            <summary>C'est sécurisé ? Que se passe-t-il si je perds ma carte ?</summary>
                            <div className="faq-content">
                                Votre carte ne partage que les informations que vous avez choisi de rendre publiques sur votre profil digital. En cas de perte, il suffit de nous contacter et nous la désactiverons à distance et gratuitement.
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#111827', padding: '60px 24px 40px 24px', color: '#6B7280', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '28px', opacity: 0.8 }} />
                    <span style={{ fontSize: '22px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                </div>
                <p style={{ color: '#9CA3AF', fontSize: '15px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>La carte de visite intelligente qui vous fait remarquer.</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '40px' }}>
                    <a
                        href={`https://wa.me/22969473921?text=${encodeURIComponent('Bonjour NFCrafter, j\'ai une question concernant vos cartes.')}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: 'white', padding: '12px 24px', borderRadius: '100px', fontWeight: '700', fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}
                        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(37,211,102,0.4)'; }}
                        onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(37,211,102,0.3)'; }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Nous contacter sur WhatsApp
                    </a>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px' }}>
                    <p style={{ fontWeight: '500', fontSize: '13px', margin: 0, color: '#4B5563' }}>© 2026 NFCrafter — Fièrement personnalisé pour vous</p>
                </div>
            </footer>

        </div>
    );
}
