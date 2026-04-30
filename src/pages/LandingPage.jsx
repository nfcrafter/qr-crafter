import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const whatsappNumber = "22991566846";

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
                
                /* Animated Background Orbs for Glassmorphism Context */
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

                .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
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

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .section { padding: 60px 0; }
                    .hero-title { font-size: 42px !important; line-height: 1.1 !important; }
                    .hero-subtitle { font-size: 18px !important; }
                    .bento-grid { grid-template-columns: 1fr; }
                    .pricing-grid { grid-template-columns: 1fr; }
                    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
                    .price-card { padding: 32px; }
                    
                    .glass-nav { width: calc(100% - 32px); padding: 0 16px; }
                    
                    .visual-stack { height: 160px; min-height: unset; display: flex; align-items: center; justify-content: center; transform: scale(0.65); margin-top: 40px; margin-bottom: 0; }
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
                            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary">
                                    Commander ma carte
                                </button>
                                <a href="#utilite" className="btn-secondary">Découvrir comment</a>
                            </div>
                        </div>

                        <div className="animate-fade-up delay-1">
                            <div className="visual-stack">
                                {/* Card Recto */}
                                <img src="/card-recto.png" alt="Card Front" className="glass-card front" onError={(e) => e.target.src = 'https://placehold.co/600x375/f8fafc/1a1265?text=Design+Recto'} />

                                {/* Card Verso */}
                                <img src="/card-verso.png" alt="Card Back" className="glass-card back" onError={(e) => e.target.src = 'https://placehold.co/600x375/f1f5f9/1a1265?text=Design+Verso'} />


                                {/* Plus Sign and Profile Mockup */}
                                <div className="mobile-hide" style={{ position: 'absolute', right: '-15%', top: '5%', zIndex: 4, display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ fontSize: '64px', fontWeight: '900', color: '#111827', textShadow: '0 10px 30px rgba(0,0,0,0.05)', fontFamily: 'Outfit' }}>+</div>
                                    <img src="/placeholder-public-profile.jpg" alt="Profile Public" style={{ width: '200px', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', animation: 'floatPackImg 6s ease-in-out infinite' }} onError={(e) => e.target.src='https://placehold.co/400x700/f8fafc/1a1265?text=Page+Profil'} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Utility Section */}
            <section id="utilite" className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Pourquoi choisir une carte intelligente ?</h2>
                        <p style={{ color: '#4B5563', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Fini les cartes en papier qui s'entassent et qu'on perd. Passez au niveau supérieur de votre networking.</p>
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
                                        <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>Lien en bio (Instagram, TikTok)</h4>
                                        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.5' }}>Un lien unique pour centraliser vos réseaux, portfolio et contacts. Vos abonnés ont accès à tout votre univers.</p>
                                    </div>
                                </li>
                                <li style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>📱</div>
                                    <div>
                                        <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>Votre code QR personnalisé</h4>
                                        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.5' }}>Affichez votre QR code sur ordinateur, flyers ou cartes de restaurant. Il suffit d'un scan pour y accéder.</p>
                                    </div>
                                </li>
                                <li style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>💼</div>
                                    <div>
                                        <h4 style={{ fontWeight: '800', fontSize: '18px', marginBottom: '6px' }}>Un véritable Mini-Portfolio</h4>
                                        <p style={{ color: '#4B5563', fontSize: '15px', lineHeight: '1.5' }}>Idéal pour les professionnels, intégrez vos créations et laissez vos clients vous contacter en un clic.</p>
                                    </div>
                                </li>
                            </ul>
                            
                            <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                                <img src="/placeholder-public-profile.jpg" alt="Capture profil public" style={{ height: '350px', width: 'auto', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', animation: 'floatPackImg 6s ease-in-out infinite' }} onError={(e) => e.target.src='https://placehold.co/400x700/f8fafc/1a1265?text=Page+Profil'} />
                                <div style={{ fontSize: '56px', fontWeight: '900', color: '#111827', textShadow: '0 10px 30px rgba(0,0,0,0.05)', fontFamily: 'Outfit' }}>+</div>
                                <img src="/placeholder-qr-custom.jpg" alt="QR Code personnalisé" style={{ height: '180px', width: '180px', objectFit: 'cover', borderRadius: '24px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', animation: 'floatPackImg 7s ease-in-out infinite 0.5s' }} onError={(e) => e.target.src='https://placehold.co/400x400/f1f5f9/1a1265?text=QR+Code'} />
                            </div>

                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-primary" style={{ background: '#111827', color: 'white', margin: '0 auto' }}>
                                Commander le Pack Digital
                            </button>
                        </div>
                    </div>
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
                            { step: "2", title: "Lien d'activation", desc: "Nous préparons votre commande et vous envoyons un lien d'activation pour créer votre compte sur notre plateforme." },
                            { step: "3", title: "Gérez votre profil", desc: "Connectez-vous à tout moment pour modifier les informations de votre profil quand vous le voulez." }
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
                            <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em', marginBottom: '32px' }}>5.000<small style={{ fontSize: '18px', fontWeight: '600', color: '#6B7280' }}>f CFA</small></div>

                            <ul className="price-list">
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Création du profil digital complet</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> QR Code dynamique généré</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Liens sociaux et contacts illimités</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Accès au tableau de bord</li>
                                <li style={{ color: '#9CA3AF' }}><span style={{ color: '#D1D5DB', fontWeight: '900' }}>✕</span> Pas de carte physique envoyée</li>
                            </ul>

                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-secondary" style={{ width: '100%', marginTop: 'auto', background: '#111827', color: '#D1D5DB' }}>Commander le Digital</button>
                        </div>

                        {/* Physical Pack */}
                        <div className="glass-panel price-card featured">
                            <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '24px', backdropFilter: 'blur(10px)' }}>Le Complet</div>
                            <h3 style={{ color: 'white', fontSize: '32px', fontWeight: '900', marginBottom: '8px', fontFamily: 'Outfit' }}>Pack Physique</h3>
                            <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em', marginBottom: '32px' }}>10.000<small style={{ fontSize: '18px', fontWeight: '600', color: '#9CA3AF' }}>f CFA</small></div>

                            <ul className="price-list">
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Carte physique NFC Premium</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Design avec votre nom/photo/logo</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Profil digital et QR code inclus</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Liens sociaux et contacts illimités</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Accès au tableau de bord</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Livraison au Bénin & sous-région</li>
                            </ul>

                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ width: '100%', background: 'white', color: '#111827', marginTop: 'auto' }}>Commander la Carte</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 24px', color: '#6B7280', textAlign: 'center', position: 'relative', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '24px', opacity: 0.6 }} />
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#111827', letterSpacing: '-0.5px', fontFamily: 'Outfit', opacity: 0.8 }}>NFCrafter</span>
                </div>
                <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>© 2026 NFCrafter. Fièrement fabriqué pour vous.</p>
            </footer>
        </div>
    );
}
