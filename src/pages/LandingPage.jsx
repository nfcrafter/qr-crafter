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
                
                .hero-gradient { background: radial-gradient(circle at 70% 30%, #F5F3FF 0%, #FFFFFF 100%); }
                
                .pricing-card { 
                    padding: 40px; border-radius: 32px; border: 1px solid #E2E8F0; 
                    background: white; transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); 
                    display: flex; flex-direction: column; position: relative; overflow: hidden;
                }
                .pricing-card:hover { transform: translateY(-10px); box-shadow: 0 30px 60px rgba(26, 18, 101, 0.1); border-color: #6366F1; }
                .pricing-card.featured { border: 2px solid #6366F1; background: #1A1265; color: white; }
                
                .step-circle { 
                    width: 48px; height: 48px; border-radius: 16px; background: #EEF2FF; 
                    color: #6366F1; display: flex; align-items: center; justify-content: center; 
                    font-weight: 800; font-size: 20px; margin-bottom: 24px;
                }
                .featured .step-circle { background: rgba(255,255,255,0.1); color: white; }
                
                .faq-item { border-bottom: 1px solid #F1F5F9; padding: 24px 0; cursor: pointer; }
                .faq-question { display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 18px; }
                .faq-answer { margin-top: 12px; color: #64748B; line-height: 1.6; font-size: 15px; }

                .glass-nav {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(16px) saturate(180%);
                    -webkit-backdrop-filter: blur(16px) saturate(180%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
                }

                .card-visual {
                    width: 320px;
                    height: 200px;
                    border-radius: 16px;
                    background: #111;
                    color: white;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }
                
                .card-visual:hover {
                    transform: translateY(-10px) rotateY(5deg);
                }

                .phone-mockup {
                    width: 240px;
                    height: 480px;
                    background: #000;
                    border-radius: 40px;
                    border: 8px solid #222;
                    padding: 10px;
                    box-shadow: 0 30px 60px rgba(0,0,0,0.4);
                    position: relative;
                    overflow: hidden;
                }

                .phone-screen {
                    width: 100%;
                    height: 100%;
                    background: white;
                    border-radius: 24px;
                    overflow: hidden;
                    position: relative;
                }

                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }

                .floating { animation: float 6s ease-in-out infinite; }

                @media (max-width: 1024px) {
                    .hero-container { grid-template-columns: 1fr !important; text-align: center; }
                    .hero-visuals { justify-content: center !important; margin-top: 60px; }
                    .hero-text { align-items: center !important; }
                }

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .pricing-grid { grid-template-columns: 1fr !important; }
                    .hero-title { font-size: 38px !important; }
                    .nav-container { padding: 0 20px !important; }
                    .card-visual { width: 280px; height: 175px; }
                }
            `}</style>

            {/* Navigation */}
            <nav className="glass-nav" style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
                <div className="nav-container" style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                        <span style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                    </div>
                    <div className="mobile-hide" style={{ display: 'flex', gap: '32px' }}>
                        <a href="#concept" className="nav-link">Comment ça marche</a>
                        <a href="#tarifs" className="nav-link">Nos Packs</a>
                        <a href="#faq" className="nav-link">FAQ</a>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#1A1265', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Connexion</button>
                        <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px', boxShadow: '0 4px 12px rgba(26, 18, 101, 0.2)' }}>Commander</button>
                    </div>
                </div>
            </nav>

            <div style={{ height: '80px' }}></div>

            {/* Hero Section Redesigned */}
            <section className="hero-gradient" style={{ padding: '60px 20px 100px', position: 'relative', overflow: 'hidden' }}>
                <div className="hero-container" style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '40px', alignItems: 'center' }}>
                    
                    {/* Left: Text Content */}
                    <div className="hero-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div style={{ display: 'inline-block', padding: '8px 20px', background: '#EEF2FF', color: '#6366F1', borderRadius: '100px', fontSize: '12px', fontWeight: '900', marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase' }}>Identité Professionnelle 2.0</div>
                        <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', color: '#1A1265', letterSpacing: '-2px', lineHeight: '1.05', marginBottom: '24px', fontFamily: 'Outfit' }}>
                            La dernière carte de visite <span style={{ color: '#6366F1' }}>dont vous aurez besoin.</span>
                        </h1>
                        <p style={{ fontSize: '20px', color: '#64748B', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6', fontWeight: '500' }}>
                            Un simple contact sur un téléphone et vos clients reçoivent instantanément toutes vos informations. Impressionnez dès la première rencontre.
                        </p>
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: '#1A1265', color: 'white', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(26, 18, 101, 0.2)' }}>Commander ma carte (10.000f)</button>
                            <a href="#tarifs" style={{ background: 'white', color: '#1A1265', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: '1px solid #E2E8F0', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>Voir les tarifs</a>
                        </div>
                        
                        <div style={{ marginTop: '48px', display: 'flex', gap: '24px', alignItems: 'center' }}>
                            <div style={{ display: 'flex', marginLeft: '12px' }}>
                                {[1,2,3,4].map(i => <div key={i} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid white', background: '#E2E8F0', marginLeft: '-12px', overflow: 'hidden' }}><img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="" /></div>)}
                            </div>
                            <p style={{ fontSize: '14px', fontWeight: '700', color: '#64748B' }}><span style={{ color: '#1A1265' }}>+500 leaders</span> nous font déjà confiance</p>
                        </div>
                    </div>

                    {/* Right: Premium Visuals (Wow effect) */}
                    <div className="hero-visuals" style={{ position: 'relative', display: 'flex', justifyContent: 'flex-end', height: '540px' }}>
                        
                        {/* Phone Mockup */}
                        <div className="phone-mockup floating" style={{ position: 'absolute', right: '40px', bottom: '0', zIndex: 2 }}>
                            <div className="phone-screen">
                                {/* Simulated Public Profile Content */}
                                <div style={{ height: '80px', background: '#1A1265' }}></div>
                                <div style={{ padding: '0 16px' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', border: '3px solid white', background: '#F1F5F9', marginTop: '-30px', overflow: 'hidden' }}>
                                        <img src="https://i.pravatar.cc/100?img=12" style={{ width: '100%' }} alt="" />
                                    </div>
                                    <div style={{ marginTop: '12px', height: '14px', width: '120px', background: '#1A1265', borderRadius: '4px' }}></div>
                                    <div style={{ marginTop: '6px', height: '10px', width: '80px', background: '#94A3B8', borderRadius: '3px' }}></div>
                                    
                                    <div style={{ marginTop: '24px', height: '36px', width: '100%', background: '#1A1265', borderRadius: '10px' }}></div>
                                    
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                                        <div style={{ flex: 1, height: '32px', background: '#F1F5F9', borderRadius: '8px' }}></div>
                                        <div style={{ flex: 1, height: '32px', background: '#F1F5F9', borderRadius: '8px' }}></div>
                                    </div>

                                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {[1,2,3].map(i => <div key={i} style={{ height: '44px', width: '100%', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}></div>)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Recto (Front) */}
                        <div className="card-visual floating" style={{ position: 'absolute', left: '0', top: '40px', zIndex: 3, animationDelay: '-1s', background: 'linear-gradient(135deg, #111 0%, #333 100%)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <img src="/logo.png" alt="" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
                                <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.5, letterSpacing: '1px' }}>NFC CHIP INSIDE</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>Votre Nom Ici</div>
                                <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Votre Profession</div>
                            </div>
                        </div>

                        {/* Card Verso (Back) */}
                        <div className="card-visual floating" style={{ position: 'absolute', left: '60px', top: '180px', zIndex: 1, animationDelay: '-2s', background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: 'white', borderRadius: '12px', padding: '8px' }}>
                                    {/* Placeholder for QR Code */}
                                    <div style={{ width: '100%', height: '100%', background: '#000', opacity: 0.1 }}></div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', fontSize: '8px', opacity: 0.4 }}>www.nfcrafter.com</div>
                        </div>

                    </div>
                </div>
            </section>

            {/* NFC Explanation Section */}
            <section id="concept" style={{ padding: '100px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', alignItems: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            {/* Phone with public page capture mockup */}
                            <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div className="phone-mockup" style={{ width: '280px', height: '560px' }}>
                                    <div className="phone-screen" style={{ background: '#F1F5F9' }}>
                                        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontWeight: '800', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                                            [Capture d'écran de votre page publique réelle]
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '38px', fontWeight: '900', marginBottom: '24px', lineHeight: '1.2', fontFamily: 'Outfit' }}>Comment ça marche ?</h2>
                            <p style={{ color: '#64748B', fontSize: '18px', lineHeight: '1.7', marginBottom: '32px' }}>
                                Imaginez la simplicité d'un paiement Mobile Money. Notre carte utilise la même technologie (NFC) pour transmettre vos coordonnées sans aucun effort.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {[
                                    { t: "Un simple 'Tap'", d: "Posez votre carte sur le dos d'un smartphone et votre profil s'affiche comme par magie." },
                                    { t: "Aucune App requise", d: "Votre client n'a rien à installer. Son téléphone détecte la carte automatiquement." },
                                    { t: "Modifiable à l'infini", d: "Changez votre numéro ou votre entreprise sur le site, votre carte physique se met à jour seule." },
                                    { t: "Prestige & Professionnalisme", d: "Donnez une image de leader moderne et technologique dès la première rencontre." }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '18px' }}>
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#6366F1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>✓</div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '17px', color: '#1A1265', marginBottom: '4px' }}>{item.t}</div>
                                            <div style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>{item.d}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="tarifs" style={{ padding: '100px 20px' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '42px', fontWeight: '900', marginBottom: '16px', fontFamily: 'Outfit' }}>Nos Solutions</h2>
                        <p style={{ color: '#64748B', fontSize: '18px', fontWeight: '500' }}>Investissez une fois dans votre carrière, profitez-en pour toujours.</p>
                    </div>

                    <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Pack Digital */}
                        <div className="pricing-card">
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#6366F1', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Rapide & Efficace</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Pack Digital</h3>
                            <div style={{ fontSize: '42px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>5.000<span style={{ fontSize: '20px', fontWeight: '700', marginLeft: '4px' }}>f CFA</span></div>
                            
                            <div style={{ flex: 1, marginBottom: '32px' }}>
                                <div style={{ height: '160px', background: '#F8FAFC', borderRadius: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', fontSize: '12px', textAlign: 'center', padding: '20px', border: '1px dashed #CBD5E1' }}>
                                    [Image : Smartphone affichant votre QR Code Premium]
                                </div>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Profil Digital Personnalisé</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Code QR stylisé à votre image</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Liens vers tous vos réseaux</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700', color: '#94A3B8' }}>✕ Pas de carte physique</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Livraison digitale par WhatsApp</li>
                                </ul>
                            </div>
                            <button onClick={() => window.open(getWhatsAppUrl('digital'), '_blank')} className="btn-ghost" style={{ padding: '18px', borderRadius: '16px', width: '100%', fontSize: '15px' }}>Commander par WhatsApp</button>
                        </div>

                        {/* Pack Physique */}
                        <div className="pricing-card featured">
                            <div style={{ position: 'absolute', top: '22px', right: '-35px', background: '#6366F1', color: 'white', padding: '6px 40px', transform: 'rotate(45deg)', fontSize: '11px', fontWeight: '900', letterSpacing: '1px' }}>RECOMMANDÉ</div>
                            <div style={{ fontSize: '12px', fontWeight: '900', color: '#A5B4FC', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Prestige Total</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: 'white' }}>Pack Physique</h3>
                            <div style={{ fontSize: '42px', fontWeight: '900', color: 'white', marginBottom: '24px' }}>10.000<span style={{ fontSize: '20px', fontWeight: '700', marginLeft: '4px' }}>f CFA</span></div>
                            
                            <div style={{ flex: 1, marginBottom: '32px' }}>
                                <div style={{ height: '160px', background: 'rgba(255,255,255,0.1)', borderRadius: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A5B4FC', fontSize: '12px', textAlign: 'center', padding: '20px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                                    [Image : Votre carte NFC physique personnalisée]
                                </div>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Carte NFC Premium gravée</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Design sur-mesure (Logo/Nom)</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Profil Digital & QR inclus</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Mise à jour des infos illimitée</li>
                                    <li style={{ display: 'flex', gap: '12px', fontSize: '15px', fontWeight: '700' }}>✓ Livraison Physique à domicile</li>
                                </ul>
                            </div>
                            <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ padding: '18px', borderRadius: '16px', width: '100%', background: 'white', color: '#1A1265', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '15px' }}>Commander par WhatsApp</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section style={{ padding: '100px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '16px', fontFamily: 'Outfit' }}>De la commande à la livraison</h2>
                        <p style={{ color: '#64748B', fontSize: '18px', fontWeight: '500' }}>Un processus simple et sécurisé.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="step-circle" style={{ margin: '0 auto 24px' }}>1</div>
                            <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Paiement & Infos</h4>
                            <p style={{ color: '#64748B', lineHeight: '1.6', fontWeight: '500' }}>Contactez-nous sur WhatsApp pour valider votre choix et envoyer vos informations (Nom, Logo, Liens).</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="step-circle" style={{ margin: '0 auto 24px' }}>2</div>
                            <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Personnalisation</h4>
                            <p style={{ color: '#64748B', lineHeight: '1.6', fontWeight: '500' }}>Nous préparons votre profil digital et personnalisons votre carte physique selon vos préférences.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="step-circle" style={{ margin: '0 auto 24px' }}>3</div>
                            <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Expédition</h4>
                            <p style={{ color: '#64748B', lineHeight: '1.6', fontWeight: '500' }}>Pour le digital, c'est immédiat. Pour la carte, nous vous livrons chez vous ou au bureau en 48h.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" style={{ padding: '100px 20px' }}>
                <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '40px', textAlign: 'center', fontFamily: 'Outfit' }}>Questions Fréquentes</h2>
                    <div>
                        {faqs.map((faq, i) => (
                            <div key={i} className="faq-item" onClick={() => toggleFaq(i)}>
                                <div className="faq-question">
                                    <span>{faq.q}</span>
                                    <span style={{ fontSize: '24px', transition: '0.3s', transform: openFaq === i ? 'rotate(180deg)' : 'none' }}>▼</span>
                                </div>
                                {openFaq === i && <div className="faq-answer animate-fade-in">{faq.a}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section style={{ padding: '120px 20px', background: '#1A1265', color: 'white', textAlign: 'center', position: 'relative' }}>
                <div style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '52px', fontWeight: '900', marginBottom: '24px', fontFamily: 'Outfit', letterSpacing: '-1px' }}>Donnez une nouvelle dimension à votre réseau.</h2>
                    <p style={{ fontSize: '20px', color: '#A5B4FC', marginBottom: '44px', lineHeight: '1.6', fontWeight: '500' }}>
                        Faites comme les leaders de demain : passez à la carte intelligente NFCrafter.
                    </p>
                    <button onClick={() => window.open(getWhatsAppUrl('physique'), '_blank')} style={{ background: 'white', color: '#1A1265', padding: '20px 56px', borderRadius: '20px', fontSize: '20px', fontWeight: '900', border: 'none', cursor: 'pointer', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>Discuter sur WhatsApp</button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 20px', background: '#0F172A', color: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <img src="/logo.png" alt="NFCrafter" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                        </div>
                        <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '500' }}>© 2024 NFCrafter. Solution de networking intelligente.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '60px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <span style={{ fontWeight: '900', fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Légal</span>
                            <a href="#" className="nav-link" style={{ color: '#94A3B8' }}>Mentions légales</a>
                            <a href="#" className="nav-link" style={{ color: '#94A3B8' }}>CGV</a>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <span style={{ fontWeight: '900', fontSize: '13px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Contact</span>
                            <a href={`https://wa.me/${whatsappNumber}`} className="nav-link" style={{ color: '#94A3B8' }}>WhatsApp</a>
                            <a href="mailto:contact@nfcrafter.com" className="nav-link" style={{ color: '#94A3B8' }}>Email</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
