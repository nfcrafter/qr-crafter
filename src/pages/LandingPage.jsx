import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
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
        <div style={{ background: '#FAFAFB', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#0F172A' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
                
                html { scroll-behavior: smooth; }
                
                /* Animations */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(1deg); }
                }
                @keyframes floatMed {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-10px) rotate(-1deg); }
                }
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }

                .fade-in-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }
                .delay-3 { animation-delay: 0.3s; }

                /* Nav */
                .nav-link { 
                    color: #475569; text-decoration: none; font-weight: 600; font-size: 15px; 
                    transition: all 0.2s; cursor: pointer; padding: 8px 12px; border-radius: 8px;
                }
                .nav-link:hover { color: #1A1265; background: rgba(0,0,0,0.03); }
                
                .glass-nav {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.5);
                    transition: all 0.3s ease;
                }
                .glass-nav.scrolled {
                    box-shadow: 0 4px 30px rgba(0,0,0,0.05);
                    background: rgba(255, 255, 255, 0.9);
                }

                /* Hero */
                .hero-section {
                    position: relative;
                    padding: 140px 20px 80px;
                    background: #FAFAFB;
                    overflow: hidden;
                }
                .hero-bg-shapes {
                    position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
                }
                .shape-1 {
                    position: absolute; top: -10%; right: -5%; width: 50vw; height: 50vw;
                    border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(99,102,241,0) 70%);
                    filter: blur(60px);
                }
                .shape-2 {
                    position: absolute; bottom: 10%; left: -10%; width: 40vw; height: 40vw;
                    border-radius: 50%; background: radial-gradient(circle, rgba(236,72,153,0.08) 0%, rgba(236,72,153,0) 70%);
                    filter: blur(60px);
                }

                .hero-grid { 
                    max-width: 1200px; margin: 0 auto; display: grid; 
                    grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; 
                    position: relative; z-index: 10;
                }

                .visual-stack { position: relative; width: 100%; height: 550px; display: flex; align-items: center; justify-content: center; }
                
                .img-phone { 
                    width: 250px; border-radius: 38px; 
                    border: 6px solid #F8FAFC; 
                    box-shadow: 0 30px 60px rgba(0,0,0,0.12), inset 0 0 0 1px #E2E8F0; 
                    position: absolute; z-index: 2; overflow: hidden; background: white;
                    animation: floatSlow 6s ease-in-out infinite;
                }
                .img-card { 
                    width: 300px; border-radius: 16px; 
                    box-shadow: 0 24px 48px rgba(0,0,0,0.15); position: absolute; 
                    border: 1px solid rgba(255,255,255,0.8);
                }
                .card-front { top: 20%; left: -10px; z-index: 3; animation: floatMed 5s ease-in-out infinite; animation-delay: 0.5s; }
                .card-back { top: 45%; left: 80px; z-index: 1; animation: floatMed 5.5s ease-in-out infinite; animation-delay: 1s; }

                /* Buttons */
                .btn-primary {
                    background: linear-gradient(135deg, #1A1265 0%, #31259A 100%);
                    color: white; padding: 18px 40px; border-radius: 100px; 
                    font-size: 17px; font-weight: 800; border: none; cursor: pointer; 
                    box-shadow: 0 10px 25px rgba(26, 18, 101, 0.25);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
                }
                .btn-primary:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 20px 35px rgba(26, 18, 101, 0.3);
                }
                .btn-secondary {
                    background: white; color: #1A1265; padding: 18px 40px; border-radius: 100px; 
                    font-size: 17px; font-weight: 800; border: 1px solid #E2E8F0; 
                    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
                    transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(0,0,0,0.02);
                }
                .btn-secondary:hover {
                    background: #F8FAFC; border-color: #CBD5E1; transform: translateY(-2px);
                }

                /* Cards */
                .feature-card {
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(20px);
                    padding: 40px 32px; border-radius: 32px; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03); border: 1px solid rgba(255,255,255,1);
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                    height: 100%; display: flex; flex-direction: column;
                }
                .feature-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 24px 48px rgba(0,0,0,0.06);
                    border-color: rgba(99, 102, 241, 0.2);
                }

                .price-card { 
                    padding: 48px 40px; border-radius: 32px; 
                    border: 1px solid #E2E8F0; background: white; 
                    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
                    display: flex; flex-direction: column; position: relative;
                }
                .price-card:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(0,0,0,0.08); }
                .price-card.featured { 
                    background: linear-gradient(135deg, #1A1265 0%, #31259A 100%); 
                    color: white; border: none; box-shadow: 0 20px 40px rgba(26, 18, 101, 0.2);
                }
                .price-card.featured:hover { box-shadow: 0 30px 60px rgba(26, 18, 101, 0.3); }

                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr; text-align: center; }
                    .hero-text { display: flex; flex-direction: column; align-items: center; }
                    .visual-stack { height: 450px; margin-top: 20px; }
                    .card-front { left: 10%; top: 10%; }
                    .card-back { left: 50%; top: 40%; }
                }

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .hero-title { font-size: 42px !important; line-height: 1.1 !important; }
                    .hero-subtitle { font-size: 18px !important; }
                    
                    .visual-stack { height: auto; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: scale(0.9); }
                    .img-phone { position: relative !important; top: auto !important; right: auto !important; left: auto !important; width: 220px !important; margin: 0 auto; animation: none; }
                    .img-card { display: none !important; } 
                    .mobile-cards-row { display: flex !important; gap: 16px; justify-content: center; margin-top: 30px; width: 100%; }
                    .mobile-cards-row img { width: 45%; max-width: 160px; border-radius: 12px; box-shadow: 0 15px 30px rgba(0,0,0,0.15); }
                    
                    .pricing-grid { grid-template-columns: 1fr !important; }
                    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
                }
            `}</style>

            {/* Navigation */}
            <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`} style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#1A1265', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                    </div>
                    <div className="mobile-hide" style={{ display: 'flex', gap: '16px' }}>
                        <a href="#concept" className="nav-link">Concept</a>
                        <a href="#tarifs" className="nav-link">Tarifs</a>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '15px', padding: '8px 16px' }}>Connexion</button>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '100px', fontWeight: '800', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 12px rgba(26,18,101,0.2)' }}>Commander</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-bg-shapes">
                    <div className="shape-1"></div>
                    <div className="shape-2"></div>
                </div>
                
                <div className="hero-grid">
                    <div className="hero-text fade-in-up">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'white', border: '1px solid #E2E8F0', color: '#6366F1', borderRadius: '100px', fontSize: '13px', fontWeight: '800', marginBottom: '24px', letterSpacing: '0.5px', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#6366F1', display: 'inline-block', animation: 'pulseGlow 2s infinite' }}></span>
                            Identité Professionnelle 2.0
                        </div>
                        <h1 className="hero-title" style={{ fontSize: '68px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.03em', lineHeight: '1.05', marginBottom: '24px', fontFamily: 'Outfit' }}>
                            La dernière carte de visite <br/><span style={{ background: 'linear-gradient(135deg, #6366F1, #A855F7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dont vous aurez besoin.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '20px', color: '#475569', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>
                            Un simple geste sur un téléphone pour partager tout votre univers. Moderne, écologique et sans limites.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary">
                                Commander ma carte (10.000f)
                            </button>
                            <a href="#tarifs" className="btn-secondary">Voir les tarifs</a>
                        </div>
                    </div>

                    <div className="hero-visuals fade-in-up delay-1">
                        <div className="visual-stack">
                            <div className="img-phone">
                                <img src="/profile-mockup.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/400x800/white/1A1265?text=Profil+Digital'} />
                            </div>

                            <div className="img-card card-front">
                                <img src="/card-recto.png" alt="Card Front" style={{ width: '100%', borderRadius: '16px', display: 'block' }} onError={(e) => e.target.src='https://placehold.co/600x375/f8fafc/1a1265?text=Design+Recto'} />
                            </div>

                            <div className="img-card card-back">
                                <img src="/card-verso.png" alt="Card Back" style={{ width: '100%', borderRadius: '16px', display: 'block' }} onError={(e) => e.target.src='https://placehold.co/600x375/f1f5f9/1a1265?text=Design+Verso'} />
                            </div>

                            <div className="mobile-cards-row">
                                <img src="/card-recto.png" alt="Card Front" onError={(e) => e.target.src='https://placehold.co/600x375/f8fafc/1a1265?text=Recto'} />
                                <img src="/card-verso.png" alt="Card Back" onError={(e) => e.target.src='https://placehold.co/600x375/f1f5f9/1a1265?text=Verso'} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Concept Section */}
            <section id="concept" style={{ padding: '100px 20px', background: '#FFFFFF', position: 'relative' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 className="fade-in-up" style={{ fontSize: '44px', fontWeight: '900', marginBottom: '60px', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em' }}>Comment ça marche ?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        {[
                            { t: "Commandez", d: "Choisissez votre pack sur WhatsApp et envoyez vos infos.", icon: "🛍️" },
                            { t: "Personnalisez", d: "Nous créons votre profil et votre carte sur-mesure.", icon: "✨" },
                            { t: "Connectez", d: "Recevez votre carte et touchez un téléphone pour partager.", icon: "🤝" }
                        ].map((item, i) => (
                            <div key={i} className={`feature-card fade-in-up delay-${i+1}`}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px' }}>
                                    {item.icon}
                                </div>
                                <h3 style={{ fontWeight: '900', fontSize: '22px', marginBottom: '12px', color: '#0F172A' }}>{item.t}</h3>
                                <p style={{ color: '#475569', fontSize: '16px', lineHeight: '1.6' }}>{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" style={{ padding: '120px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }} className="fade-in-up">
                        <h2 style={{ fontSize: '44px', fontWeight: '900', fontFamily: 'Outfit', color: '#0F172A', letterSpacing: '-0.02em', marginBottom: '16px' }}>Nos Solutions</h2>
                        <p style={{ color: '#64748B', fontSize: '18px' }}>Un paiement unique, votre profil pour la vie.</p>
                    </div>
                    <div className="pricing-grid">
                        <div className="price-card fade-in-up delay-1">
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#6366F1', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Essentiel</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '16px', color: '#0F172A' }}>Pack Digital</h3>
                            <div style={{ fontSize: '48px', fontWeight: '900', color: '#1A1265', marginBottom: '32px', fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>5.000<small style={{ fontSize: '20px', fontWeight: '700', color: '#64748B' }}>f CFA</small></div>
                            <ul style={{ listStyle: 'none', marginBottom: '40px', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600', color: '#334155' }}><span style={{ color: '#10B981', fontSize: '20px' }}>✓</span> Profil Digital Unique</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600', color: '#334155' }}><span style={{ color: '#10B981', fontSize: '20px' }}>✓</span> Code QR Stylisé</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600', color: '#94A3B8' }}><span style={{ color: '#CBD5E1', fontSize: '20px' }}>✕</span> Pas de carte physique</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600', color: '#334155' }}><span style={{ color: '#10B981', fontSize: '20px' }}>✓</span> Livraison Immédiate</li>
                            </ul>
                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} style={{ width: '100%', padding: '18px', borderRadius: '100px', border: '2px solid #E2E8F0', background: 'transparent', color: '#0F172A', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }} onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#E2E8F0'; }}>Commander le Digital</button>
                        </div>
                        <div className="price-card featured fade-in-up delay-2">
                            <div style={{ position: 'absolute', top: '-16px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #6366F1, #A855F7)', color: 'white', padding: '6px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}>Le plus populaire</div>
                            <div style={{ fontSize: '13px', fontWeight: '800', color: '#A5B4FC', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Complet</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '16px' }}>Pack Physique</h3>
                            <div style={{ fontSize: '48px', fontWeight: '900', marginBottom: '32px', fontFamily: 'Outfit', letterSpacing: '-0.03em' }}>10.000<small style={{ fontSize: '20px', fontWeight: '700', color: '#A5B4FC' }}>f CFA</small></div>
                            <ul style={{ listStyle: 'none', marginBottom: '40px', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600' }}><span style={{ color: '#34D399', fontSize: '20px' }}>✓</span> Carte NFC Premium</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600' }}><span style={{ color: '#34D399', fontSize: '20px' }}>✓</span> Design Personnalisé</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600' }}><span style={{ color: '#34D399', fontSize: '20px' }}>✓</span> Profil Digital Inclus</li>
                                <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '16px', fontWeight: '600' }}><span style={{ color: '#34D399', fontSize: '20px' }}>✓</span> Livraison à domicile</li>
                            </ul>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ width: '100%', padding: '18px', borderRadius: '100px', border: 'none', background: 'white', color: '#1A1265', fontWeight: '800', fontSize: '16px', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.02)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; }}>Commander la Carte</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 20px 40px', background: '#FFFFFF', color: '#64748B', textAlign: 'center', borderTop: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '28px', opacity: 0.8 }} />
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#0F172A', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                </div>
                <p style={{ fontWeight: '500', fontSize: '15px' }}>© 2024 NFCrafter. Fièrement fabriqué pour les leaders africains.</p>
            </footer>
        </div>
    );
}
