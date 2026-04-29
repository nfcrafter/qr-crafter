import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const whatsappNumber = "22991566846";
    
    const getWhatsAppUrl = (pack) => {
        const message = pack === 'physique' 
            ? "Bonjour NFCrafter, je souhaite commander le Pack Physique (Carte + Profil) à 10.000f."
            : "Bonjour NFCrafter, je souhaite commander le Pack Digital (QR + Profil) à 5.000f.";
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "Est-ce que ça marche sur tous les téléphones en Afrique ?",
            a: "Oui ! Pour les smartphones récents (iPhone, Samsung, Huawei, etc.), il suffit de toucher la carte. Pour les modèles plus anciens, le client peut simplement scanner le code QR personnalisé qui se trouve sur votre carte ou votre page."
        },
        {
            q: "Comment se passe la livraison ?",
            a: "Pour le Pack Digital, vous recevez vos accès instantanément. Pour la carte physique, nous livrons partout au Bénin et dans la sous-région sous 48h à 72h."
        },
        {
            q: "Dois-je payer un abonnement chaque mois ?",
            a: "Non, aucun abonnement. Vous payez une seule fois pour votre carte ou votre profil, et c'est à vous pour toujours."
        },
        {
            q: "Puis-je changer mon numéro plus tard ?",
            a: "Absolument. Vous avez un accès personnel pour modifier vos infos (téléphone, liens, photo) à tout moment. Votre carte physique restera toujours à jour."
        }
    ];

    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#1A1265' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
                
                .nav-link { color: #1A1265; text-decoration: none; font-weight: 700; font-size: 14px; transition: all 0.2s; cursor: pointer; opacity: 0.8; }
                .nav-link:hover { opacity: 1; }
                
                .glass-nav {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(16px) saturate(180%);
                    -webkit-backdrop-filter: blur(16px) saturate(180%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                }

                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                .floating { animation: float 5s ease-in-out infinite; }

                /* --- RESPONSIVE LOGIC --- */
                .hero-grid { 
                    max-width: 1200px; margin: 0 auto; display: grid; 
                    grid-template-columns: 1.1fr 1fr; gap: 40px; align-items: center; 
                }

                .visual-stack { position: relative; width: 100%; height: 500px; display: flex; align-items: center; justify-content: center; }
                .img-card { width: 300px; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); position: absolute; }
                .img-phone { width: 240px; border-radius: 40px; border: 8px solid #222; box-shadow: 0 30px 60px rgba(0,0,0,0.3); position: absolute; z-index: 2; overflow: hidden; background: #000; }

                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr; text-align: center; padding-top: 40px; }
                    .hero-text { display: flex; flex-direction: column; align-items: center; }
                    .visual-stack { height: 450px; margin-top: 40px; }
                }

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .hero-title { font-size: 40px !important; line-height: 1.1 !important; }
                    .hero-subtitle { font-size: 17px !important; }
                    
                    /* Visuals on Mobile */
                    .visual-stack { height: auto; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: scale(0.9); }
                    .img-phone { position: relative !important; top: auto !important; right: auto !important; left: auto !important; width: 220px !important; margin: 0 auto; }
                    .img-card { display: none !important; } /* Hidden main cards to avoid mess */
                    .mobile-cards-row { display: flex !important; gap: 12px; justify-content: center; margin-top: 20px; width: 100%; }
                    .mobile-cards-row img { width: 45%; max-width: 160px; border-radius: 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                }

                .price-card { padding: 40px 24px; border-radius: 24px; border: 1px solid #E2E8F0; background: white; text-align: center; transition: 0.3s; }
                .price-card.featured { background: #1A1265; color: white; border: none; }
                .pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 40px; }
                
                @media (max-width: 600px) {
                    .pricing-grid { grid-template-columns: 1fr !important; }
                }

                .faq-item { border-bottom: 1px solid #F1F5F9; padding: 20px 0; cursor: pointer; }
            `}</style>

            {/* Navigation */}
            <nav className="glass-nav" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <div className="nav-container" style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                    </div>
                    <div className="mobile-hide" style={{ display: 'flex', gap: '32px' }}>
                        <a href="#concept" className="nav-link">Concept</a>
                        <a href="#tarifs" className="nav-link">Tarifs</a>
                        <a href="#faq" className="nav-link">FAQ</a>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Connexion</button>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>Commander</button>
                    </div>
                </div>
            </nav>

            <div style={{ height: '80px' }}></div>

            {/* Hero Section */}
            <section style={{ padding: '60px 20px 80px', background: 'radial-gradient(circle at 70% 30%, #F5F3FF 0%, #FFFFFF 100%)' }}>
                <div className="hero-grid">
                    <div className="hero-text">
                        <div style={{ display: 'inline-block', padding: '8px 20px', background: '#EEF2FF', color: '#6366F1', borderRadius: '100px', fontSize: '12px', fontWeight: '900', marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase' }}>Identité Professionnelle 2.0</div>
                        <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', color: '#1A1265', letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '24px', fontFamily: 'Outfit' }}>
                            La dernière carte de visite <span style={{ color: '#6366F1' }}>dont vous aurez besoin.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '20px', color: '#64748B', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>
                            Un simple geste sur un téléphone pour partager tout votre univers. Moderne, écologique et sans limites.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(26, 18, 101, 0.2)' }}>Commander ma carte (10.000f)</button>
                            <a href="#tarifs" style={{ background: 'white', color: '#1A1265', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: '1px solid #E2E8F0', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Voir les tarifs</a>
                        </div>
                    </div>

                    <div className="hero-visuals">
                        <div className="visual-stack">
                            {/* Phone Mockup */}
                            <div className="img-phone floating" style={{ top: '0', right: '0' }}>
                                <img src="/profile-mockup.png" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/400x800/white/1A1265?text=Profil+Digital'} />
                            </div>

                            {/* Card Recto */}
                            <div className="img-card floating" style={{ top: '15%', left: '0', zIndex: 3 }}>
                                <img src="/card-recto.png" alt="Card Front" style={{ width: '100%', borderRadius: '16px' }} onError={(e) => e.target.src='https://placehold.co/600x375/111/white?text=Design+Recto'} />
                            </div>

                            {/* Card Verso */}
                            <div className="img-card floating" style={{ top: '50%', left: '40px', zIndex: 1, animationDelay: '-2s' }}>
                                <img src="/card-verso.png" alt="Card Back" style={{ width: '100%', borderRadius: '16px' }} onError={(e) => e.target.src='https://placehold.co/600x375/222/white?text=Design+Verso'} />
                            </div>

                            {/* Mobile only cards row */}
                            <div className="mobile-cards-row" style={{ display: 'none' }}>
                                <img src="/card-recto.png" alt="Card Front" onError={(e) => e.target.src='https://placehold.co/600x375/111/white?text=Recto'} />
                                <img src="/card-verso.png" alt="Card Back" onError={(e) => e.target.src='https://placehold.co/600x375/222/white?text=Verso'} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Concept Section */}
            <section id="concept" style={{ padding: '80px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <h2 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '40px', fontFamily: 'Outfit' }}>Comment ça marche ?</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                        {[
                            { t: "1. Commandez", d: "Choisissez votre pack sur WhatsApp et envoyez vos infos." },
                            { t: "2. Personnalisez", d: "Nous créons votre profil et votre carte sur-mesure." },
                            { t: "3. Connectez", d: "Recevez votre carte et touchez un téléphone pour partager." }
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ fontWeight: '800', marginBottom: '12px' }}>{item.t}</h3>
                                <p style={{ color: '#64748B', fontSize: '15px' }}>{item.d}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" style={{ padding: '80px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '900', fontFamily: 'Outfit' }}>Nos Solutions</h2>
                    </div>
                    <div className="pricing-grid">
                        <div className="price-card">
                            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Pack Digital</h3>
                            <div style={{ fontSize: '42px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>5.000<small style={{ fontSize: '18px' }}>f CFA</small></div>
                            <ul style={{ listStyle: 'none', marginBottom: '32px', textAlign: 'left', display: 'inline-block' }}>
                                <li>✅ Profil Digital Unique</li>
                                <li>✅ Code QR Stylisé</li>
                                <li>❌ Pas de carte physique</li>
                                <li>✅ Livraison Immédiate</li>
                            </ul>
                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #1A1265', background: 'transparent', color: '#1A1265', fontWeight: '800', cursor: 'pointer' }}>Commander</button>
                        </div>
                        <div className="price-card featured">
                            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '16px' }}>Pack Physique</h3>
                            <div style={{ fontSize: '42px', fontWeight: '900', marginBottom: '24px' }}>10.000<small style={{ fontSize: '18px' }}>f CFA</small></div>
                            <ul style={{ listStyle: 'none', marginBottom: '32px', textAlign: 'left', display: 'inline-block' }}>
                                <li>✅ Carte NFC Premium</li>
                                <li>✅ Design Personnalisé</li>
                                <li>✅ Profil Digital Inclus</li>
                                <li>✅ Livraison à domicile</li>
                            </ul>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ width: '100%', padding: '16px', borderRadius: '12px', border: 'none', background: 'white', color: '#1A1265', fontWeight: '800', cursor: 'pointer' }}>Commander</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 20px', background: '#0F172A', color: 'white', textAlign: 'center' }}>
                <p>© 2024 NFCrafter. Fièrement fabriqué pour les leaders africains.</p>
            </footer>
        </div>
    );
}
