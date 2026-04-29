import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);
    const [scrolled, setScrolled] = useState(false);

    const whatsappNumber = "22991566846";
    
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const getWhatsAppUrl = (pack) => {
        const message = pack === 'physique' 
            ? "Bonjour NFCrafter, je souhaite commander le Pack Physique (Carte + Profil) à 10.000f."
            : "Bonjour NFCrafter, je souhaite commander le Pack Digital (QR + Profil) à 5.000f.";
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    const faqs = [
        {
            q: "Est-ce que ça marche sur tous les téléphones ?",
            a: "Oui ! Les smartphones récents utilisent le NFC (sans contact). Pour les plus anciens, votre profil s'ouvre via le Code QR personnalisé présent sur votre carte."
        },
        {
            q: "Combien de temps dure la carte ?",
            a: "À vie ! Il n'y a pas de batterie, pas d'abonnement. Une fois achetée, elle est à vous pour toujours."
        },
        {
            q: "Puis-je modifier mes informations ?",
            a: "Oui, à tout moment et gratuitement. Changez votre numéro, vos réseaux sociaux ou votre photo depuis votre espace client."
        }
    ];

    return (
        <div style={{ background: '#050505', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Outfit', sans-serif", color: '#FFFFFF' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap');
                
                :root { 
                    --accent: #6366F1; 
                    --gradient: linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%); 
                }

                * { box-sizing: border-box; margin: 0; padding: 0; }
                html { scroll-behavior: smooth; }

                .glass-nav {
                    background: ${scrolled ? 'rgba(5, 5, 5, 0.8)' : 'transparent'};
                    backdrop-filter: ${scrolled ? 'blur(20px)' : 'none'};
                    border-bottom: ${scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
                    transition: all 0.4s ease;
                }

                .text-gradient {
                    background: var(--gradient);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .hero-visual-container {
                    perspective: 2000px;
                    width: 100%;
                    max-width: 600px;
                    height: 600px;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .card-3d {
                    width: 320px;
                    height: 200px;
                    border-radius: 20px;
                    position: absolute;
                    transform-style: preserve-3d;
                    transition: all 0.5s ease;
                    box-shadow: 0 50px 100px rgba(0,0,0,0.5);
                }

                .card-front {
                    background: linear-gradient(135deg, #111 0%, #222 100%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transform: rotateY(-20deg) rotateX(10deg) translateZ(50px);
                    z-index: 3;
                }

                .card-back {
                    background: #111;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    transform: rotateY(-15deg) rotateX(5deg) translateZ(-50px) translateY(120px) translateX(-40px);
                    z-index: 1;
                    opacity: 0.8;
                }

                .phone-mockup {
                    width: 260px;
                    height: 520px;
                    background: #000;
                    border: 12px solid #1A1A1A;
                    border-radius: 45px;
                    position: relative;
                    z-index: 2;
                    transform: rotateY(15deg) rotateX(5deg);
                    box-shadow: 0 100px 200px rgba(99, 102, 241, 0.2);
                    overflow: hidden;
                }

                .btn-premium {
                    background: var(--gradient);
                    color: white;
                    padding: 20px 48px;
                    border-radius: 100px;
                    font-weight: 900;
                    font-size: 18px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3);
                }
                .btn-premium:hover {
                    transform: scale(1.05) translateY(-5px);
                    box-shadow: 0 30px 60px rgba(99, 102, 241, 0.5);
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0) rotateY(-20deg) rotateX(10deg) translateZ(50px); }
                    50% { transform: translateY(-30px) rotateY(-15deg) rotateX(5deg) translateZ(60px); }
                }
                .floating-card { animation: float 8s ease-in-out infinite; }

                @media (max-width: 1024px) {
                    .hero-section { flex-direction: column !important; text-align: center; padding-top: 140px !important; }
                    .hero-visual-container { margin-top: 80px; transform: scale(0.8); }
                }

                @media (max-width: 768px) {
                    .hero-title { font-size: 48px !important; }
                    .hero-visual-container { transform: scale(0.65); height: 450px; }
                    .mobile-nav { display: none; }
                }

                .price-glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 40px;
                    padding: 60px 40px;
                    transition: all 0.4s ease;
                }
                .price-glass-card:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: var(--accent);
                    transform: translateY(-15px);
                }
            `}</style>

            {/* Premium Nav */}
            <nav className="glass-nav" style={{ height: '90px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, zIndex: 1000 }}>
                <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '36px' }} />
                        <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>NFCrafter</span>
                    </div>
                    <div className="mobile-nav" style={{ display: 'flex', gap: '40px' }}>
                        <a href="#concept" style={{ color: '#999', textDecoration: 'none', fontWeight: '600' }}>Concept</a>
                        <a href="#tarifs" style={{ color: '#999', textDecoration: 'none', fontWeight: '600' }}>Tarifs</a>
                        <a href="#faq" style={{ color: '#999', textDecoration: 'none', fontWeight: '600' }}>FAQ</a>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: 'white', fontWeight: '700', cursor: 'pointer' }}>Connexion</button>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: 'white', color: 'black', border: 'none', padding: '12px 28px', borderRadius: '100px', fontWeight: '800', cursor: 'pointer' }}>Commander</button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section" style={{ padding: '180px 40px 100px', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '1400px', margin: '0 auto', gap: '40px' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '100px', color: '#818CF8', fontWeight: '800', fontSize: '14px', marginBottom: '32px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818CF8' }}></span>
                        ÉDITION AFRICAINE 2024
                    </div>
                    <h1 className="hero-title" style={{ fontSize: 'clamp(48px, 8vw, 84px)', fontWeight: '950', lineHeight: '0.95', letterSpacing: '-4px', marginBottom: '40px' }}>
                        Faites <span className="text-gradient">parler</span> votre carte.
                    </h1>
                    <p style={{ fontSize: '22px', color: '#999', lineHeight: '1.5', maxWidth: '600px', marginBottom: '56px', fontWeight: '500' }}>
                        La dernière carte de visite que vous achèterez. Échangez vos coordonnées d'un simple geste, sans contact, sans limites.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-premium">Commander ma carte</button>
                        <a href="#concept" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '700', textDecoration: 'none', fontSize: '18px' }}>
                            <span style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>▶</span>
                            Voir le concept
                        </a>
                    </div>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <div className="hero-visual-container">
                        {/* Phone Mockup */}
                        <div className="phone-mockup">
                            <img src="/profile-mockup.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/400x800/111/6366F1?text=Aperçu+Profil'} alt="Profile" />
                        </div>
                        {/* Card Front */}
                        <div className="card-3d card-front floating-card">
                            <img src="/card-recto.png" style={{ width: '100%', height: '100%', borderRadius: '20px' }} onError={(e) => e.target.src='https://placehold.co/600x375/111/white?text=Design+Premium'} alt="Recto" />
                        </div>
                        {/* Card Back */}
                        <div className="card-3d card-back">
                            <img src="/card-verso.png" style={{ width: '100%', height: '100%', borderRadius: '20px' }} onError={(e) => e.target.src='https://placehold.co/600x375/111/white?text=Design+Verso'} alt="Verso" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Concept Section */}
            <section id="concept" style={{ padding: '120px 40px', background: '#080808' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: '900', letterSpacing: '-2px', marginBottom: '80px', textAlign: 'center' }}>Plus qu'une carte, <br/><span className="text-gradient">un outil de pouvoir.</span></h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        {[
                            { title: "Zéro Papier", desc: "Économisez des milliers de cartes papier chaque année. Un choix écologique pour l'Afrique de demain." },
                            { title: "Mise à jour en temps réel", desc: "Changez votre job ou votre numéro ? Modifiez votre profil digital instantanément, sans frais." },
                            { title: "Partout, sans App", desc: "Le client approche son téléphone, votre profil s'affiche. Pas d'application à installer." }
                        ].map((feat, i) => (
                            <div key={i} style={{ padding: '40px', background: '#111', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ fontSize: '32px', marginBottom: '24px' }}>✨</div>
                                <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>{feat.title}</h3>
                                <p style={{ color: '#999', lineHeight: '1.6' }}>{feat.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" style={{ padding: '120px 40px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <h2 style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-3px' }}>Simple. <span className="text-gradient">Transparent.</span></h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
                        {/* Pack Digital */}
                        <div className="price-glass-card">
                            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px', color: '#999' }}>PACK DIGITAL</h3>
                            <div style={{ fontSize: '64px', fontWeight: '950', marginBottom: '32px' }}>5.000<small style={{ fontSize: '20px' }}>f CFA</small></div>
                            <ul style={{ listStyle: 'none', marginBottom: '48px', color: '#999', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li>✓ Profil Digital Premium</li>
                                <li>✓ Code QR personnalisé</li>
                                <li>✓ Mise à jour illimitée</li>
                                <li>✕ Pas de carte physique</li>
                            </ul>
                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} style={{ width: '100%', padding: '20px', borderRadius: '100px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', fontWeight: '800', cursor: 'pointer' }}>Choisir le Digital</button>
                        </div>

                        {/* Pack Physique */}
                        <div className="price-glass-card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.05)' }}>
                            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--accent)', borderRadius: '6px', fontSize: '10px', fontWeight: '900', marginBottom: '16px' }}>PLUS POPULAIRE</div>
                            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>PACK PHYSIQUE</h3>
                            <div style={{ fontSize: '64px', fontWeight: '950', marginBottom: '32px' }}>10.000<small style={{ fontSize: '20px' }}>f CFA</small></div>
                            <ul style={{ listStyle: 'none', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <li>✓ Carte NFC Premium gravée</li>
                                <li>✓ Design Recto/Verso sur-mesure</li>
                                <li>✓ Profil Digital Inclus</li>
                                <li>✓ Livraison à domicile</li>
                            </ul>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} className="btn-premium" style={{ width: '100%' }}>Commander ma carte</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section id="faq" style={{ padding: '120px 40px', background: '#080808' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: '900', textAlign: 'center', marginBottom: '64px' }}>Questions.</h2>
                    {faqs.map((faq, i) => (
                        <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '32px 0', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '20px', fontWeight: '700' }}>
                                <span>{faq.q}</span>
                                <span style={{ transition: '0.3s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                            </div>
                            {openFaq === i && <div style={{ marginTop: '20px', color: '#999', lineHeight: '1.6', fontSize: '18px' }}>{faq.a}</div>}
                        </div>
                    ))}
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '100px 40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '28px' }} />
                    <span style={{ fontSize: '22px', fontWeight: '900' }}>NFCrafter</span>
                </div>
                <p style={{ color: '#555', fontWeight: '600' }}>© 2024 NFCrafter. Propulser le networking en Afrique.</p>
            </footer>
        </div>
    );
}
