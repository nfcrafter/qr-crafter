import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            q: "Comment fonctionne la carte NFC ?",
            a: "La carte contient une puce invisible. Lorsque vous la rapprochez d'un smartphone récent, une notification apparaît automatiquement pour ouvrir votre profil digital. Aucun téléchargement d'application n'est requis."
        },
        {
            q: "Quels téléphones sont compatibles ?",
            a: "Presque tous les smartphones sortis après 2017 (iPhone et Android) possèdent la technologie NFC. Pour les modèles plus anciens, nous intégrons un code QR personnalisé sur votre page et votre carte."
        },
        {
            q: "Puis-je modifier mes informations après l'achat ?",
            a: "Oui, c'est l'avantage majeur ! Vous pouvez modifier votre photo, vos réseaux sociaux ou votre numéro de téléphone à tout moment depuis votre tableau de bord, sans changer de carte physique."
        },
        {
            q: "Quels sont les délais de livraison ?",
            a: "Pour le Pack Digital, la livraison est instantanée par email dès la validation. Pour le Pack Physique, comptez 48h à 72h pour la personnalisation et la livraison à votre domicile."
        }
    ];

    return (
        <div style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#1A1265' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
                
                .nav-link { color: #64748B; text-decoration: none; font-weight: 600; font-size: 14px; transition: color 0.2s; cursor: pointer; }
                .nav-link:hover { color: #1A1265; }
                
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

                @media (max-width: 768px) {
                    .mobile-hide { display: none; }
                    .pricing-grid { grid-template-columns: 1fr !important; }
                    .hero-title { font-size: 40px !important; }
                }
            `}</style>

            {/* Navigation */}
            <nav style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, borderBottom: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#1A1265', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                </div>
                <div className="mobile-hide" style={{ display: 'flex', gap: '32px' }}>
                    <a href="#concept" className="nav-link">Le Concept</a>
                    <a href="#tarifs" className="nav-link">Tarifs</a>
                    <a href="#etapes" className="nav-link">Comment commander</a>
                    <a href="#faq" className="nav-link">FAQ</a>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#1A1265', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Connexion</button>
                    <button onClick={() => navigate('/register')} style={{ background: '#1A1265', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}>Commencer</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-gradient" style={{ padding: '100px 20px 140px', textAlign: 'center' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                    <div style={{ display: 'inline-block', padding: '6px 16px', background: '#EEF2FF', color: '#6366F1', borderRadius: '100px', fontSize: '12px', fontWeight: '800', marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase' }}>La révolution du Networking</div>
                    <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', color: '#1A1265', letterSpacing: '-2px', lineHeight: '1.1', marginBottom: '24px', fontFamily: 'Outfit' }}>
                        Dites adieu aux cartes de visite <span style={{ color: '#6366F1' }}>qui finissent à la poubelle.</span>
                    </h1>
                    <p style={{ fontSize: '20px', color: '#64748B', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                        Échangez vos coordonnées, réseaux sociaux et bien plus d'un simple geste. Une carte intelligente pour un profil digital illimité.
                    </p>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/register')} style={{ background: '#1A1265', color: 'white', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: 'none', cursor: 'pointer', boxShadow: '0 20px 40px rgba(26, 18, 101, 0.2)' }}>Commander ma carte</button>
                        <a href="#concept" style={{ background: 'white', color: '#1A1265', padding: '18px 40px', borderRadius: '16px', fontSize: '18px', fontWeight: '800', border: '1px solid #E2E8F0', textDecoration: 'none', display: 'flex', align_items: 'center' }}>Voir comment ça marche</a>
                    </div>
                </div>
            </section>

            {/* NFC Explanation Section */}
            <section id="concept" style={{ padding: '100px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '60px', align_items: 'center' }}>
                        <div style={{ position: 'relative' }}>
                            {/* Placeholder for "Image 1: Hero NFC Tap" */}
                            <div style={{ width: '100%', height: '400px', background: '#E2E8F0', borderRadius: '40px', display: 'flex', align_items: 'center', justify_content: 'center', color: '#94A3B8', fontWeight: '800', fontSize: '14px', textAlign: 'center', padding: '40px' }}>
                                [Image 1: Une main approchant une carte NFC d'un smartphone, avec un profil digital qui apparaît à l'écran]
                            </div>
                        </div>
                        <div>
                            <h2 style={{ fontSize: '36px', fontWeight: '900', marginBottom: '24px', lineHeight: '1.2', fontFamily: 'Outfit' }}>C'est quoi une carte NFC ?</h2>
                            <p style={{ color: '#64748B', fontSize: '18px', lineHeight: '1.7', marginBottom: '32px' }}>
                                La technologie <b>NFC</b> (Near Field Communication) permet de transférer des données sans contact. C'est la même technologie que vous utilisez pour le paiement sans contact.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {[
                                    { t: "Zéro Papier", d: "Une seule carte pour toute une vie. Réduisez votre empreinte écologique." },
                                    { t: "Mise à jour instantanée", d: "Changez votre numéro ou votre job ? Modifiez votre profil en 2 secondes, pas besoin de réimprimer." },
                                    { t: "Impact Mémorable", d: "Surprenez vos interlocuteurs avec une expérience technologique et moderne." },
                                    { t: "Compatible Partout", d: "Fonctionne avec iPhone et Android. Sans application à installer." }
                                ].map((item, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '16px' }}>
                                        <div style={{ color: '#6366F1', fontSize: '20px', paddingTop: '4px' }}>✓</div>
                                        <div>
                                            <div style={{ fontWeight: '800', fontSize: '16px' }}>{item.t}</div>
                                            <div style={{ color: '#64748B', fontSize: '14px' }}>{item.d}</div>
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
                        <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '16px', fontFamily: 'Outfit' }}>Choisissez votre pack</h2>
                        <p style={{ color: '#64748B', fontSize: '18px' }}>Paiement unique. Pas d'abonnement mensuel.</p>
                    </div>

                    <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                        {/* Pack Digital */}
                        <div className="pricing-card">
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#6366F1', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Digital uniquement</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px' }}>Pack Digital</h3>
                            <div style={{ fontSize: '40px', fontWeight: '900', color: '#1A1265', marginBottom: '24px' }}>5.000<span style={{ fontSize: '20px' }}>f CFA</span></div>
                            
                            <div style={{ flex: 1, marginBottom: '32px' }}>
                                <div style={{ height: '140px', background: '#F8FAFC', border_radius: '20px', marginBottom: '20px', display: 'flex', align_items: 'center', justify_content: 'center', color: '#94A3B8', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                                    [Image 2: Smartphone affichant un QR code stylisé]
                                </div>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Profil Digital Personnalisé</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Code QR Haute Qualité</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Liens Sociaux Illimités</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600', color: '#64748B' }}>✕ Pas de carte physique</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Livraison digitale (E-mail)</li>
                                </ul>
                            </div>
                            <button onClick={() => navigate('/register')} className="btn-ghost" style={{ padding: '16px', borderRadius: '14px', width: '100%' }}>Commander le pack digital</button>
                        </div>

                        {/* Pack Physique */}
                        <div className="pricing-card featured">
                            <div style={{ position: 'absolute', top: '20px', right: '-40px', background: '#6366F1', color: 'white', padding: '8px 40px', transform: 'rotate(45deg)', fontSize: '12px', fontWeight: '900' }}>POPULAIRE</div>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#A5B4FC', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>Complet</div>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', color: 'white' }}>Pack Physique</h3>
                            <div style={{ fontSize: '40px', fontWeight: '900', color: 'white', marginBottom: '24px' }}>10.000<span style={{ fontSize: '20px' }}>f CFA</span></div>
                            
                            <div style={{ flex: 1, marginBottom: '32px' }}>
                                <div style={{ height: '140px', background: 'rgba(255,255,255,0.05)', border_radius: '20px', marginBottom: '20px', display: 'flex', align_items: 'center', justify_content: 'center', color: '#A5B4FC', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                                    [Image 3: Carte physique premium en gros plan]
                                </div>
                                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Carte NFC Premium</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Design Personnalisé</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Profil Digital Personnalisé</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Liens Sociaux Illimités</li>
                                    <li style={{ display: 'flex', gap: '10px', fontSize: '14px', fontWeight: '600' }}>✓ Livraison Physique Incluse</li>
                                </ul>
                            </div>
                            <button onClick={() => navigate('/register')} style={{ padding: '16px', borderRadius: '14px', width: '100%', background: 'white', color: '#1A1265', border: 'none', fontWeight: '800', cursor: 'pointer' }}>Commander le pack physique</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section id="etapes" style={{ padding: '100px 20px', background: '#F8FAFC' }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '900', marginBottom: '16px', fontFamily: 'Outfit' }}>Comment ça marche ?</h2>
                        <p style={{ color: '#64748B', fontSize: '18px' }}>Votre nouvelle identité digitale en 3 étapes simples.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div className="step-circle" style={{ margin: '0 auto 24px' }}>1</div>
                            <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Commander</h4>
                            <p style={{ color: '#64748B', lineHeight: '1.6' }}>Choisissez votre pack et réglez en ligne de manière sécurisée.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="step-circle" style={{ margin: '0 auto 24px' }}>2</div>
                            <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Personnaliser</h4>
                            <p style={{ color: '#64748B', lineHeight: '1.6' }}>Créez votre profil : ajoutez vos réseaux sociaux, votre photo et vos informations.</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div className="step-circle" style={{ margin: '0 auto 24px' }}>3</div>
                            <h4 style={{ fontWeight: '800', fontSize: '20px', marginBottom: '12px' }}>Connecter</h4>
                            <p style={{ color: '#64748B', lineHeight: '1.6' }}>Recevez votre carte et commencez à réseauter comme jamais auparavant.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" style={{ padding: '100px 20px' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            <section style={{ padding: '100px 20px', background: '#1A1265', color: 'white', textAlign: 'center' }}>
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '24px', fontFamily: 'Outfit' }}>Prêt à passer au futur ?</h2>
                    <p style={{ fontSize: '20px', color: '#A5B4FC', marginBottom: '40px', lineHeight: '1.6' }}>
                        Rejoignez des milliers de professionnels qui ont déjà adopté la carte de visite intelligente.
                    </p>
                    <button onClick={() => navigate('/register')} style={{ background: 'white', color: '#1A1265', padding: '18px 48px', borderRadius: '16px', fontSize: '20px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>Commander maintenant</button>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 20px', background: '#0F172A', color: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', align_items: 'center', flexWrap: 'wrap', gap: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', align_items: 'center', gap: '12px', marginBottom: '16px' }}>
                            <img src="/logo.png" alt="NFCrafter" style={{ height: '28px', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', fontFamily: 'Outfit' }}>NFCrafter</span>
                        </div>
                        <p style={{ color: '#64748B', fontSize: '14px' }}>© 2024 NFCrafter. Fièrement fabriqué pour les professionnels.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span style={{ fontWeight: '800', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase' }}>Légal</span>
                            <a href="#" className="nav-link" style={{ color: '#94A3B8' }}>Mentions légales</a>
                            <a href="#" className="nav-link" style={{ color: '#94A3B8' }}>CGV</a>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span style={{ fontWeight: '800', fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase' }}>Contact</span>
                            <a href="#" className="nav-link" style={{ color: '#94A3B8' }}>Support WhatsApp</a>
                            <a href="#" className="nav-link" style={{ color: '#94A3B8' }}>Email</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
