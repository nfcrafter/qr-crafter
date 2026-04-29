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
        <div style={{ background: '#F4F5F7', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#111827' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@400;500;600;700&display=swap');
                
                html { scroll-behavior: smooth; }
                
                /* Layout */
                .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
                .section { padding: 100px 0; }
                
                /* Animations */
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-up { animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .delay-1 { animation-delay: 0.1s; }
                .delay-2 { animation-delay: 0.2s; }
                
                /* Nav */
                .glass-nav {
                    background: rgba(244, 245, 247, 0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
                    transition: all 0.3s ease;
                }
                .glass-nav.scrolled {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
                    background: rgba(255, 255, 255, 0.95);
                }
                .nav-link { color: #4B5563; text-decoration: none; font-weight: 600; font-size: 15px; transition: all 0.2s; cursor: pointer; padding: 8px 12px; border-radius: 8px; }
                .nav-link:hover { color: #111827; background: rgba(0,0,0,0.04); }

                /* Buttons */
                .btn-primary {
                    background: #111827; color: white; padding: 18px 36px; border-radius: 100px; 
                    font-size: 16px; font-weight: 700; border: none; cursor: pointer; 
                    transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px;
                }
                .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(17, 24, 39, 0.15); }
                
                .btn-secondary {
                    background: white; color: #111827; padding: 18px 36px; border-radius: 100px; 
                    font-size: 16px; font-weight: 700; border: 1px solid #E5E7EB; 
                    text-decoration: none; display: inline-flex; align-items: center; justify-content: center;
                    transition: all 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }
                .btn-secondary:hover { border-color: #D1D5DB; background: #F9FAFB; transform: translateY(-2px); }

                /* Hero */
                .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
                
                /* Cards & Grids */
                .bento-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .card-white {
                    background: white; border-radius: 32px; padding: 40px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                }
                .card-white:hover { box-shadow: 0 12px 32px rgba(0,0,0,0.06); transform: translateY(-4px); }
                
                .icon-circle {
                    width: 56px; height: 56px; border-radius: 50%; background: #F3F4F6;
                    display: flex; align-items: center; justify-content: center; font-size: 24px; margin-bottom: 24px;
                }

                /* Pricing */
                .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 900px; margin: 0 auto; }
                .price-card {
                    background: white; border-radius: 32px; padding: 48px;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.04);
                    display: flex; flex-direction: column; position: relative;
                }
                .price-card.featured { background: #111827; color: white; border: none; }
                .price-list { list-style: none; padding: 0; margin: 0 0 40px 0; display: flex; flex-direction: column; gap: 16px; }
                .price-list li { display: flex; align-items: center; gap: 12px; font-size: 15px; font-weight: 500; }

                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr; text-align: center; }
                    .hero-text { align-items: center; display: flex; flex-direction: column; }
                    .bento-grid { grid-template-columns: repeat(2, 1fr); }
                }

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .section { padding: 60px 0; }
                    .hero-title { font-size: 40px !important; line-height: 1.1 !important; }
                    .hero-subtitle { font-size: 18px !important; }
                    .bento-grid { grid-template-columns: 1fr; }
                    .pricing-grid { grid-template-columns: 1fr; }
                    .btn-primary, .btn-secondary { width: 100%; justify-content: center; }
                    .price-card { padding: 32px; }
                }
            `}</style>

            {/* Navigation */}
            <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`} style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontSize: '22px', fontWeight: '900', color: '#111827', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                    </div>
                    <div className="mobile-hide" style={{ display: 'flex', gap: '16px' }}>
                        <a href="#utilite" className="nav-link">Comment ça marche ?</a>
                        <a href="#tarifs" className="nav-link">Tarifs</a>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#111827', fontWeight: '700', cursor: 'pointer', fontSize: '15px', padding: '8px 16px' }}>Connexion</button>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>Commander</button>
                    </div>
                </div>
            </nav>

            <div style={{ height: '80px' }}></div>

            {/* Hero Section */}
            <section className="section">
                <div className="container">
                    <div className="hero-grid">
                        <div className="hero-text animate-fade-up">
                            <div style={{ background: '#E5E7EB', color: '#374151', padding: '8px 20px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '24px', display: 'inline-block' }}>
                                La carte de visite réinventée
                            </div>
                            <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', color: '#111827', letterSpacing: '-0.03em', lineHeight: '1.05', marginBottom: '24px', fontFamily: 'Outfit' }}>
                                Touchez, partagez, <br/>impressionnez.
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

                        <div className="animate-fade-up delay-1" style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                            <div style={{ position: 'relative', width: '100%', maxWidth: '500px', background: 'white', borderRadius: '40px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                <img src="/card-recto.png" alt="Carte NFC" style={{ width: '100%', borderRadius: '24px', display: 'block', marginBottom: '16px' }} onError={(e) => e.target.src='https://placehold.co/600x375/111827/ffffff?text=Design+Carte'} />
                                <div style={{ background: '#F3F4F6', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📱</div>
                                    <h3 style={{ fontWeight: '800', fontSize: '18px', color: '#111827', marginBottom: '4px' }}>Fonctionne partout</h3>
                                    <p style={{ color: '#6B7280', fontSize: '14px', margin: 0 }}>Approchez la carte d'un téléphone, votre profil s'ouvre instantanément.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Utility Section */}
            <section id="utilite" className="section" style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }} className="animate-fade-up">
                        <h2 style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Pourquoi choisir une carte intelligente ?</h2>
                        <p style={{ color: '#6B7280', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>Fini les cartes en papier qui s'entassent et qu'on perd. Passez au niveau supérieur de votre networking.</p>
                    </div>

                    <div className="bento-grid">
                        <div className="card-white animate-fade-up delay-1">
                            <div className="icon-circle">⚡</div>
                            <h3 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Sans application</h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6' }}>Votre interlocuteur n'a rien à télécharger. Le profil s'ouvre directement dans son navigateur web par simple contact NFC ou scan de QR code.</p>
                        </div>
                        <div className="card-white animate-fade-up delay-2">
                            <div className="icon-circle">🔄</div>
                            <h3 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Modifiable à l'infini</h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6' }}>Vous changez de numéro ou d'entreprise ? Modifiez vos informations en temps réel depuis votre tableau de bord. La carte physique reste la même.</p>
                        </div>
                        <div className="card-white animate-fade-up delay-3">
                            <div className="icon-circle">🌍</div>
                            <h3 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Un seul achat à vie</h3>
                            <p style={{ color: '#4B5563', lineHeight: '1.6' }}>Plus besoin de réimprimer 500 cartes tous les 6 mois. Une seule carte NFC robuste suffit pour des années de rencontres professionnelles.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="section">
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em' }}>Comment l'obtenir en 3 étapes</h2>
                    </div>

                    <div className="bento-grid">
                        {[
                            { step: "1", title: "Choisissez votre pack", desc: "Optez pour le profil digital seul ou recevez en plus notre carte physique premium chez vous." },
                            { step: "2", title: "Personnalisez", desc: "Créez votre profil en ligne, ajoutez votre photo, vos réseaux et vos moyens de contact." },
                            { step: "3", title: "Connectez", desc: "Faites bonne impression. Lors de votre prochain rendez-vous, touchez un téléphone et partagez tout." }
                        ].map((item, i) => (
                            <div key={i} className="card-white" style={{ position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '120px', fontWeight: '900', color: '#F3F4F6', lineHeight: 1, zIndex: 0, pointerEvents: 'none' }}>
                                    {item.step}
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h3 style={{ fontWeight: '800', fontSize: '22px', marginBottom: '16px' }}>{item.title}</h3>
                                    <p style={{ color: '#4B5563', lineHeight: '1.6', fontSize: '15px' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" className="section" style={{ background: 'white', borderTop: '1px solid rgba(0,0,0,0.03)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit', color: '#111827', letterSpacing: '-0.02em', marginBottom: '16px' }}>Nos Solutions</h2>
                        <p style={{ color: '#6B7280', fontSize: '18px' }}>Un investissement unique, pas d'abonnement.</p>
                    </div>

                    <div className="pricing-grid">
                        {/* Digital Pack */}
                        <div className="price-card">
                            <div style={{ background: '#F3F4F6', color: '#4B5563', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '24px' }}>L'essentiel</div>
                            <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Pack Digital</h3>
                            <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em', marginBottom: '32px' }}>5.000<small style={{ fontSize: '18px', fontWeight: '600', color: '#6B7280' }}>f CFA</small></div>
                            
                            <ul className="price-list">
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Création du profil digital complet</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> QR Code dynamique généré</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Liens sociaux et contacts illimités</li>
                                <li><span style={{ color: '#111827', fontWeight: '900' }}>✓</span> Accès au tableau de bord</li>
                                <li style={{ color: '#9CA3AF' }}><span style={{ color: '#D1D5DB', fontWeight: '900' }}>✕</span> Pas de carte physique envoyée</li>
                            </ul>
                            
                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>Commander le Digital</button>
                        </div>

                        {/* Physical Pack */}
                        <div className="price-card featured">
                            <div style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '6px 16px', borderRadius: '100px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', alignSelf: 'flex-start', marginBottom: '24px' }}>Le Complet</div>
                            <h3 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '8px' }}>Pack Physique</h3>
                            <div style={{ fontSize: '48px', fontWeight: '900', fontFamily: 'Outfit', letterSpacing: '-0.03em', marginBottom: '32px' }}>10.000<small style={{ fontSize: '18px', fontWeight: '600', color: '#9CA3AF' }}>f CFA</small></div>
                            
                            <ul className="price-list">
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Carte physique NFC Premium</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Design avec votre nom/logo</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Profil digital et QR code inclus</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Liens sociaux et contacts illimités</li>
                                <li><span style={{ color: 'white', fontWeight: '900' }}>✓</span> Livraison à domicile (Bénin & sous-région)</li>
                            </ul>
                            
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-primary" style={{ width: '100%', background: 'white', color: '#111827', marginTop: 'auto' }}>Commander la Carte</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 24px', background: '#F4F5F7', color: '#6B7280', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '16px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '24px', opacity: 0.6 }} />
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#111827', letterSpacing: '-0.5px', fontFamily: 'Outfit', opacity: 0.8 }}>NFCrafter</span>
                </div>
                <p style={{ fontWeight: '500', fontSize: '14px', margin: 0 }}>© 2024 NFCrafter. Fièrement fabriqué pour les leaders africains.</p>
            </footer>
        </div>
    );
}
