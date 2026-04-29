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
        <div style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#1A1265' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
                
                .nav-link { color: #1A1265; text-decoration: none; font-weight: 700; font-size: 14px; transition: all 0.2s; cursor: pointer; opacity: 0.8; }
                .nav-link:hover { opacity: 1; transform: translateY(-1px); }
                
                .glass-nav {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(16px) saturate(180%);
                    -webkit-backdrop-filter: blur(16px) saturate(180%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                }

                /* Hero Animations */
                @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                .floating { animation: float 5s ease-in-out infinite; }

                /* Responsiveness Utilities */
                @media (max-width: 1024px) {
                    .hero-grid { grid-template-columns: 1fr !important; text-align: center; padding-top: 40px !important; }
                    .hero-text { align-items: center !important; }
                    .hero-visuals { height: auto !important; margin-top: 40px; padding-bottom: 40px; }
                }

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .pricing-grid { grid-template-columns: 1fr !important; }
                    .hero-title { font-size: 38px !important; letter-spacing: -1px !important; }
                    .hero-subtitle { font-size: 18px !important; }
                    
                    /* Adjust Visuals for Mobile */
                    .visual-stack { transform: scale(0.8); margin-bottom: 0 !important; }
                    .phone-mockup { right: 50% !important; transform: translateX(50%) !important; position: relative !important; }
                    .card-recto, .card-verso { display: none !important; } /* Hide cards on mobile to avoid clutter, or show them below */
                    .mobile-show-cards { display: flex !important; gap: 12px; justify-content: center; margin-top: -40px; position: relative; z-index: 10; }
                }

                .faq-item { border-bottom: 1px solid #F1F5F9; padding: 24px 0; cursor: pointer; }
                .faq-question { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 18px; }
                .faq-answer { margin-top: 12px; color: #64748B; line-height: 1.6; font-size: 15px; }
            `}</style>

            {/* Navigation */}
            <nav className="glass-nav" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <div className="nav-container" style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                    </div>
                    <div className="mobile-hide" style={{ display: 'flex', gap: '32px' }}>
                        <a href="#concept" className="nav-link">Le Concept</a>
                        <a href="#tarifs" className="nav-link">Nos Tarifs</a>
                        <a href="#faq" className="nav-link">FAQ</a>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Connexion</button>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(26, 18, 101, 0.2)' }}>Commander</button>
                    </div>
                </div>
            </nav>

            <div style={{ height: '80px' }}></div>

            {/* Hero Section Redesigned for Responsiveness */}
            <section style={{ padding: '60px 20px 80px', background: 'radial-gradient(circle at 70% 30%, #F5F3FF 0%, #FFFFFF 100%)' }}>
                <div className="hero-grid" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                    
                    {/* Hero Text */}
                    <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'inline-block', padding: '8px 20px', background: '#EEF2FF', color: '#6366F1', borderRadius: '100px', fontSize: '12px', fontWeight: '900', marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase' }}>Révolutionnez votre Networking</div>
                        <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', color: '#1A1265', letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '24px', fontFamily: 'Outfit' }}>
                            La carte de visite <span style={{ color: '#6366F1' }}>intelligente.</span>
                        </h1>
                        <p className="hero-subtitle" style={{ fontSize: '20px', color: '#64748B', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>
                            Échangez vos informations d'un simple geste. Une carte physique premium connectée à votre profil digital modifiable à l'infini.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'inherit' }}>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(26, 18, 101, 0.2)' }}>Commander ma carte</button>
                            <a href="#concept" style={{ background: 'white', color: '#1A1265', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: '1px solid #E2E8F0', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>En savoir plus</a>
                        </div>
                    </div>

                    {/* Hero Visuals (With Image Slots for User) */}
                    <div className="hero-visuals" style={{ position: 'relative', height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="visual-stack" style={{ position: 'relative', width: '100%', height: '100%' }}>
                            
                            {/* Card Recto - Replacement Image */}
                            <div className="card-recto floating" style={{ position: 'absolute', top: '10%', left: '0', zIndex: 3, width: '300px', borderRadius: '16px', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
                                <img src="/card-recto.png" alt="Card Front Design" style={{ width: '100%', display: 'block', background: '#111' }} onError={(e) => e.target.src='https://placehold.co/600x375/111/white?text=Design+Recto+Carte'} />
                            </div>

                            {/* Card Verso - Replacement Image */}
                            <div className="card-verso floating" style={{ position: 'absolute', top: '45%', left: '40px', zIndex: 1, width: '300px', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden', animationDelay: '-2s' }}>
                                <img src="/card-verso.png" alt="Card Back Design" style={{ width: '100%', display: 'block', background: '#222' }} onError={(e) => e.target.src='https://placehold.co/600x375/222/white?text=Design+Verso+Carte'} />
                            </div>

                            {/* Phone Mockup - Replacement Image */}
                            <div className="phone-mockup floating" style={{ position: 'absolute', top: '0', right: '0', zIndex: 2, width: '240px', height: '480px', background: '#000', borderRadius: '40px', border: '8px solid #222', overflow: 'hidden', animationDelay: '-1s' }}>
                                <img src="/profile-mockup.png" alt="Profile Screen Capture" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/400x800/white/1A1265?text=Capture+Profil+Digital'} />
                            </div>
                        </div>

                        {/* Mobile view cards (Visible only on mobile via CSS) */}
                        <div className="mobile-show-cards" style={{ display: 'none' }}>
                             <img src="/card-recto.png" alt="Card Front" style={{ width: '140px', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} onError={(e) => e.target.src='https://placehold.co/600x375/111/white?text=Recto'} />
                             <img src="/card-verso.png" alt="Card Back" style={{ width: '140px', borderRadius: '8px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }} onError={(e) => e.target.src='https://placehold.co/600x375/222/white?text=Verso'} />
                        </div>
                    </div>

                </div>
            </section>

            {/* Rest of sections (Concept, Pricing, FAQ, Footer) ... */}
            <section id="concept" style={{ padding: '80px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{ width: '280px', height: '560px', background: '#000', borderRadius: '40px', border: '8px solid #222', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)' }}>
                                <img src="/profile-full.png" alt="Full Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.src='https://placehold.co/400x800/F1F5F9/94A3B8?text=Capture+Profil+Complet'} />
                            </div>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '24px', fontFamily: 'Outfit' }}>Comment ça marche ?</h2>
                            <p style={{ color: '#64748B', fontSize: '18px', lineHeight: '1.7', marginBottom: '32px' }}>
                                Plus besoin d'application. Votre interlocuteur approche simplement son téléphone de votre carte pour découvrir votre univers.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {[
                                    { t: "Un simple 'Tap'", d: "Posez votre carte sur le dos d'un smartphone et votre profil s'affiche instantanément." },
                                    { t: "Aucune App requise", d: "Fonctionne nativement sur iPhone et Android sans rien installer." },
                                    { t: "Modifiable à l'infini", d: "Mettez à jour vos réseaux sociaux et vos infos à tout moment." },
                                    { t: "Impact Mémorable", d: "Marquez les esprits avec une présentation technologique et moderne." }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '18px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>✓</div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '17px', color: '#1A1265', marginBottom: '4px' }}>{item.t}</div>
                                            <div style={{ color: '#64748B', fontSize: '15px' }}>{item.d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" style={{ padding: '80px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '16px', fontFamily: 'Outfit' }}>Nos Solutions</h2>
                        <p style={{ color: '#64748B', fontSize: '18px' }}>Paiement unique. Pas d'abonnement.</p>
                    </div>

                    <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Pack Digital */}
                        <div className="pricing-card">
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#6366F1', textTransform: 'uppercase', marginBottom: '16px' }}>Digital uniquement</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Pack Digital</h3>
                            <div style={{ fontSize: '42px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>5.000<span style={{ fontSize: '20px' }}>f CFA</span></div>
                            
                            <div style={{ flex: 1, marginBottom: '32px' }}>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Profil Digital Personnalisé</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Code QR stylisé</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Liens Illimités</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700', color: '#94A3B8' }}>✕ Pas de carte physique</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Livraison par WhatsApp</li>
                                </ul>
                            </div>
                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} style={{ padding: '18px', borderRadius: '16px', width: '100%', background: 'transparent', border: '1px solid #1A1265', color: '#1A1265', fontWeight: '800', cursor: 'pointer' }}>Commander</button>
                        </div>

                        {/* Pack Physique */}
                        <div className="pricing-card featured">
                            <div style={{ position: 'absolute', top: '22px', right: '-35px', background: '#6366F1', color: 'white', padding: '6px 40px', transform: 'rotate(45deg)', fontSize: '11px', fontWeight: '900' }}>RECOMMANDÉ</div>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#A5B4FC', textTransform: 'uppercase', marginBottom: '16px' }}>Complet</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: 'white' }}>Pack Physique</h3>
                            <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', marginBottom: '24px' }}>10.000<span style={{ fontSize: '20px' }}>f CFA</span></div>
                            
                            <div style={{ flex: 1, marginBottom: '32px' }}>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Carte NFC Premium</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Design sur-mesure</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Profil Digital inclus</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Mise à jour illimitée</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Livraison à domicile</li>
                                </ul>
                            </div>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ padding: '18px', borderRadius: '16px', width: '100%', background: 'white', color: '#1A1265', border: 'none', fontWeight: '900', cursor: 'pointer' }}>Commander</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" style={{ padding: '80px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '40px', textAlign: 'center', fontFamily: 'Outfit' }}>Questions Fréquentes</h2>
                    <div>
                        {faqs.map((faq, i) => (
                            <div key={i} className="faq-item" onClick={() => toggleFaq(i)}>
                                <div className="faq-question">
                                    <span>{faq.q}</span>
                                    <span style={{ fontSize: '24px', transition: '0.3s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>▼</span>
                                </div>
                                {openFaq === i && <div className="faq-answer">{faq.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 20px', background: '#0F172A', color: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                            <img src="/logo.png" alt="NFCrafter" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'Outfit' }}>NFCrafter</span>
                        </div>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>© 2024 NFCrafter. Networking intelligent en Afrique.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <a href={`https://wa.me/${whatsappNumber}`} className="nav-link" style={{ color: '#94A3B8' }}>WhatsApp</a>
                        <a href="mailto:contact@nfcrafter.com" className="nav-link" style={{ color: '#94A3B8' }}>Email</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
