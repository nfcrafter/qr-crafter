import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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
                    background: #111827; color: white; padding: 18px 36px; border-radius: 100px; 
                    font-size: 16px; font-weight: 700; border: none; cursor: pointer; 
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                    box-shadow: 0 10px 20px rgba(17, 24, 39, 0.15);
                }
                .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 15px 30px rgba(17, 24, 39, 0.25); }
                
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
                    background: #111827; color: white; border: 1px solid #374151; 
                    box-shadow: 0 20px 60px rgba(17, 24, 39, 0.3);
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

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                    <span className="mobile-hide" style={{ fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                </div>
                <div className="mobile-hide" style={{ display: 'flex', gap: '8px' }}>
                    <a href="#utilite" className="nav-link">Comment ça marche ?</a>
                    <a href="#tarifs" className="nav-link">Tarifs</a>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #E5E7EB',
                            color: '#111827',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '14px',
                            padding: '10px 20px',
                            borderRadius: '100px',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                        Connexion
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="section" style={{ paddingTop: '40px' }}>
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-text animate-fade-up">
                            <div style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(10px)', color: '#374151', padding: '10px 24px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                                La carte de visite réinventée
                            </div>
                            <h1 className="hero-title" style={{ fontSize: '68px', fontWeight: '900', color: '#111827', letterSpacing: '-0.03em', lineHeight: '1.05', marginBottom: '24px', fontFamily: 'Outfit' }}>
                                Touchez, partagez, <br />impressionnez.
                            </h1>
                            <p className="hero-subtitle" style={{ fontSize: '20px', color: '#4B5563', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>
                                Échangez vos coordonnées, réseaux sociaux et bien plus en un seul geste. Plus besoin d'épeler votre nom ou votre numéro.
                            </p>
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
                                <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary">
                                    Commander ma carte
                                </button>
                                {/* ⚠️ Remplacer /p/demo par le slug d'un vrai profil client */}
                                <a href="/p/demo" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                    <span>Voir un exemple</span>
                                    <span style={{ fontSize: '16px' }}>&#8594;</span>
                                </a>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6B7280', fontWeight: '600' }}>
                                <span style={{ fontSize: '16px' }}>🛡️</span> <span><strong style={{ color: '#10B981' }}>100% Sécurisé.</strong> Vos données sont modifiables uniquement par vous.</span>
                            </div>
                        </div>

                        <div className="animate-fade-up delay-1" style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
                                {/* Arrière-plan coloré pour faire ressortir l'image */}
                                <div style={{ position: 'absolute', top: '10px', left: '-10px', right: '10px', bottom: '-10px', background: 'linear-gradient(135deg, #4F46E5, #0EA5E9)', borderRadius: '32px', opacity: 0.15, filter: 'blur(20px)', zIndex: 0 }}></div>
                                
                                <img 
                                    src="/lifestyle.jpg" 
                                    alt="NFCrafter en action" 
                                    style={{ 
                                        width: '100%', 
                                        height: 'auto', 
                                        borderRadius: '32px', 
                                        boxShadow: '0 25px 60px rgba(0,0,0,0.15)', 
                                        transform: 'rotate(-2deg)', 
                                        border: '6px solid white',
                                        position: 'relative',
                                        zIndex: 1,
                                        animation: 'floatSlow 6s ease-in-out infinite',
                                        aspectRatio: '1/1',
                                        objectFit: 'cover'
                                    }} 
                                    onError={(e) => { e.target.src = 'https://placehold.co/800x800/f8fafc/1a1265?text=Image+Lifestyle'; }}
                                />
                                
                                {/* Badge de statut flottant */}
                                <div className="glass-panel" style={{ position: 'absolute', bottom: '-15px', right: '-10px', padding: '10px 20px', borderRadius: '100px', zIndex: 2, display: 'flex', alignItems: 'center', gap: '10px', animation: 'floatFast 4s ease-in-out infinite', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></div>
                                    <span style={{ fontWeight: '800', fontSize: '14px', color: '#111827' }}>Profil activé</span>
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

                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-primary" style={{ background: '#111827', color: 'white', margin: '0 auto' }}>
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
                                <h3 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Outfit', margin: 0, color: 'white' }}>Le Pack Physique</h3>
                                <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', color: '#34D399' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 10px #10B981' }}></span>
                                    Bénin
                                </div>
                            </div>
                            
                            <div style={{ fontWeight: '700', color: '#9CA3AF', marginBottom: '32px', fontSize: '16px', position: 'relative', zIndex: 1 }}>L'atout des rencontres en présentiel :</div>
                            
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
                            
                            <div style={{ marginTop: '32px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative', zIndex: 1 }}>
                                <div style={{ fontSize: '20px' }}>📍</div>
                                <div>
                                    <div style={{ color: '#FCA5A5', fontWeight: '700', fontSize: '14px', marginBottom: '4px' }}>Disponibilité Limitée</div>
                                    <div style={{ color: '#D1D5DB', fontSize: '13px', lineHeight: '1.5' }}>La carte physique est actuellement disponible <strong>uniquement au Bénin</strong> pour le moment.</div>
                                </div>
                            </div>
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
                    <p style={{ color: '#4B5563', fontSize: '13px', marginTop: '16px', fontWeight: '600' }}>Design inclus — Livraison sous 24-48h au Bénin</p>
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
                            { step: "2", title: "Reçu sous 24–48h", desc: "Nous préparons votre commande et vous envoyons un lien d'activation sous 24 à 48 heures ouvrées pour créer votre compte sur notre plateforme." },
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
                                "J'ai commandé 5 cartes physiques pour mon équipe commerciale au Bénin. Le design est hyper qualitatif. Quand nos commerciaux vont en rendez-vous, l'image de marque qu'on dégage fait vraiment la différence."
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
                        <p style={{ color: '#4B5563', fontSize: '18px' }}>Un investissement unique, pas d'abonnement.</p>
                    </div>

                    <div className="pricing-grid">
                        {/* Digital Pack */}
                        <div className="glass-panel price-card">
                            <div style={{ background: 'rgba(255,255,255,0.8)', color: '#4B5563', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.05)' }}>L'essentiel</div>
                            <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px', fontFamily: 'Outfit' }}>Pack Digital</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>5.000<small style={{ fontSize: '18px', fontWeight: '600', color: '#6B7280' }}>f CFA</small></div>
                                <div style={{ fontSize: '20px', fontWeight: '700', color: '#9CA3AF', textDecoration: 'line-through' }}>7.500f</div>
                            </div>

                            <ul className="price-list">
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Création du profil digital complet</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> QR Code personnalisé </li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Liens sociaux et contacts illimités</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Accès au tableau de bord</li>
                                <li style={{ color: '#9CA3AF' }}><span style={{ color: '#D1D5DB', fontWeight: '900' }}>✕</span> Pas de carte physique</li>
                            </ul>

                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-secondary" style={{ width: '100%', marginTop: 'auto', background: '#111827', color: '#D1D5DB' }}>Commander le Digital</button>
                        </div>

                        {/* Physical Pack */}
                        <div className="glass-panel price-card featured">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', backdropFilter: 'blur(10px)' }}>Le Complet</div>
                                <div style={{ background: '#EF4444', color: 'white', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', animation: 'pulseBadge 2s infinite' }}>🔥 Offre de Lancement</div>
                            </div>
                            <h3 style={{ color: 'white', fontSize: '32px', fontWeight: '900', marginBottom: '8px', fontFamily: 'Outfit' }}>Pack Physique</h3>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '32px' }}>
                                <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>10.000<small style={{ fontSize: '18px', fontWeight: '600', color: '#9CA3AF' }}>f CFA</small></div>
                                <div style={{ fontSize: '24px', fontWeight: '700', color: '#6B7280', textDecoration: 'line-through' }}>15.000f</div>
                            </div>

                            <ul className="price-list">
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Carte physique NFC Premium</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Design avec votre nom/photo/logo</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Profil digital et QR code inclus</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Liens sociaux et contacts illimités</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Accès au tableau de bord</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Livraison uniquement au Bénin (pour le moment)</li>
                            </ul>

                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ width: '100%', background: 'white', color: '#111827', marginTop: 'auto', marginBottom: '16px' }}>Commander la Carte</button>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#9CA3AF', justifyContent: 'center' }}>
                                <span style={{ fontSize: '14px' }}>🛡️</span> <span><strong>Sécurité garantie.</strong> Contrôlez l'accès à vos données.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Autres Services Section */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Autres services</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Allons plus loin ensemble.</p>
                    </div>

                    <div className="glass-panel animate-fade-up delay-1" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '48px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-20px', left: '-20px', fontSize: '150px', opacity: '0.03', pointerEvents: 'none' }}>💻</div>
                        <h3 style={{ fontSize: '28px', fontWeight: '900', fontFamily: 'Outfit', marginBottom: '16px', color: '#111827' }}>Création de Site Internet</h3>
                        <p style={{ color: '#4B5563', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
                            Vous avez besoin d'une présence en ligne plus complète ? Notre équipe conçoit et développe votre propre site web vitrine ou e-commerce sur-mesure pour votre activité. Un design professionnel, adapté aux mobiles et optimisé pour Google.
                        </p>
                        <button onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour NFCrafter, je souhaite avoir plus d\'informations sur la création d\'un site internet pour mon entreprise.')}`, '_blank')} className="btn-primary" style={{ background: '#111827', color: 'white' }}>
                            Demander un devis sur WhatsApp
                        </button>
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
                                Oui, à 100% ! Tous les smartphones récents (iPhone depuis 2018, Android) intègrent la technologie NFC et scannent la carte par simple contact. Pour les téléphones plus anciens, le QR Code gravé sur le dos de la carte prend le relais instantanément via l'appareil photo.
                            </div>
                        </details>
                        
                        <details>
                            <summary>Mon interlocuteur a-t-il besoin d'une application ?</summary>
                            <div className="faq-content">
                                Absolument pas. C'est la beauté du système : votre profil s'ouvre directement dans le navigateur web par défaut de la personne (Safari, Chrome, etc.), comme un site internet classique.
                            </div>
                        </details>

                        <details>
                            <summary>Y a-t-il un abonnement caché à payer ?</summary>
                            <div className="faq-content">
                                Non, c'est un paiement unique ! Vous payez une seule fois votre Pack Digital (5.000f) ou votre Pack Physique (10.000f) et vous en profitez à vie. Vous pouvez modifier vos informations à l'infini depuis votre espace client gratuit.
                            </div>
                        </details>

                        <details>
                            <summary>Comment se passe la livraison de la carte physique ?</summary>
                            <div className="faq-content">
                                Après validation de votre design, nous expédions la carte. La livraison est actuellement disponible uniquement au Bénin (via nos coursiers partenaires). Vous recevrez votre carte en général sous 24 à 48 heures ouvrées.
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
                <p style={{ color: '#9CA3AF', fontSize: '15px', marginBottom: '32px', maxWidth: '400px', margin: '0 auto 32px auto', lineHeight: '1.6' }}>La carte de visite intelligente qui vous fait remarquer. Disponible au Bénin.</p>
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
