import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const CARD_COLORS = [
    { id: 'black', name: 'Noir Onyx', hex: '#111827', imgRecto: '/assets/cards/black-recto.png', imgVerso: '/assets/cards/black-verso.png' },
    { id: 'white', name: 'Blanc Neige', hex: '#F9FAFB', hexText: '#111827', imgRecto: '/assets/cards/white-recto.png', imgVerso: '/assets/cards/white-verso.png' },
    { id: 'blue', name: 'Bleu Océan', hex: '#2563EB', imgRecto: '/assets/cards/blue-recto.png', imgVerso: '/assets/cards/blue-verso.png' },
    { id: 'gold', name: 'Or Premium', hex: '#D97706', imgRecto: '/assets/cards/gold-recto.png', imgVerso: '/assets/cards/gold-verso.png' },
    { id: 'red', name: 'Rouge Rubis', hex: '#DC2626', imgRecto: '/assets/cards/red-recto.png', imgVerso: '/assets/cards/red-verso.png' },
    { id: 'green', name: 'Vert Émeraude', hex: '#059669', imgRecto: '/assets/cards/green-recto.png', imgVerso: '/assets/cards/green-verso.png' },
    { id: 'purple', name: 'Violet Améthyste', hex: '#7C3AED', imgRecto: '/assets/cards/purple-recto.png', imgVerso: '/assets/cards/purple-verso.png' },
    { id: 'pink', name: 'Rose Poudré', hex: '#DB2777', imgRecto: '/assets/cards/pink-recto.png', imgVerso: '/assets/cards/pink-verso.png' }
];

const FEATURES = [
    { icon: '📱', title: 'Mini-site V-Card', desc: 'Regroupez tous vos liens, réseaux sociaux et contacts au même endroit.' },
    { icon: '🎨', title: 'Portfolio', desc: 'Montrez vos plus belles réalisations, projets et travaux.' },
    { icon: '🏅', title: 'Certifications', desc: 'Affichez vos badges et diplômes professionnels.' },
    { icon: '🛍️', title: 'Boutique Intégrée', desc: 'Exposez vos produits et services avec lien vers WhatsApp.' },
    { icon: '📊', title: 'Statistiques en Temps Réel', desc: 'Suivez le nombre de scans et les retours clients instantanément.' },
    { icon: '📥', title: 'Enregistrement Rapide', desc: 'Vos clients enregistrent vos coordonnées en 1 clic.' },
    { icon: '⭐', title: 'Témoignages', desc: 'Collectez des avis depuis votre profil public.' },
    { icon: '🔄', title: 'Mise à jour illimitée', desc: 'Modifiez vos informations à tout moment, la carte se met à jour.' }
];

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);
    const [session, setSession] = useState(null);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription?.unsubscribe();
        };
    }, []);

    const activeColor = CARD_COLORS[selectedColorIndex];
    const buttonColor = activeColor.hex;
    const buttonTextColor = activeColor.hexText || 'white';
    
    const whatsappNumber = "22969473921";
    const paymentLinkDigital = "https://pay.fedapay.com/votre-lien-digital-7000"; // Remplacer par le vrai lien
    const getWhatsAppUrl = () => {
        const message = `Bonjour NFCrafter, je souhaite commander la Carte Premium NFC en couleur *${activeColor.name}* à 10.000f.`;
        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    };

    return (
        <div style={{ background: '#FAFAFA', minHeight: '100vh', width: '100%', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", color: '#111827' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800;900&family=Inter:wght@400;500;700&display=swap');
                html { scroll-behavior: smooth; }
                
                .glass-nav {
                    position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
                    width: calc(100% - 40px); max-width: 1000px; height: 70px; border-radius: 100px;
                    background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; padding: 0 24px;
                    z-index: 1000; transition: 0.3s;
                }
                .glass-nav.scrolled { background: rgba(255, 255, 255, 0.95); box-shadow: 0 15px 50px rgba(0,0,0,0.08); top: 10px; }
                
                .hero-section { padding: 160px 20px 80px 20px; display: flex; flex-direction: column; align-items: center; text-align: center; }
                
                .flip-card { background-color: transparent; width: 300px; height: 480px; perspective: 1500px; margin: 0 auto; cursor: pointer; }
                .flip-card-inner { position: relative; width: 100%; height: 100%; text-align: center; transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); transform-style: preserve-3d; }
                .flip-card.flipped .flip-card-inner { transform: rotateY(180deg); }
                .flip-card-front, .flip-card-back { position: absolute; width: 100%; height: 100%; -webkit-backface-visibility: hidden; backface-visibility: hidden; border-radius: 24px; box-shadow: 0 20px 50px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; font-weight: bold; overflow: hidden; }
                .flip-card-back { transform: rotateY(180deg); }
                
                .card-img-placeholder { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .card-img-real { width: 100%; height: 100%; object-fit: cover; }
                
                .color-btn { width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.1); cursor: pointer; transition: 0.2s; }
                .color-btn:hover { transform: scale(1.1); }
                .color-btn.active { transform: scale(1.15); box-shadow: 0 0 0 3px #111827; }

                .btn { padding: 16px 32px; border-radius: 100px; font-weight: 800; font-size: 16px; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: 0.2s; border: none; }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
                
                .features-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
                .feature-card { background: white; padding: 32px; border-radius: 24px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(0,0,0,0.02); transition: 0.3s; }
                .feature-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(0,0,0,0.05); }

                .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; max-width: 900px; margin: 0 auto; padding: 40px 20px; }
                .pricing-card { background: white; padding: 40px; border-radius: 32px; border: 1px solid #E2E8F0; box-shadow: 0 10px 40px rgba(0,0,0,0.03); display: flex; flex-direction: column; position: relative; overflow: hidden; }
                .pricing-card.popular { border: 2px solid ${buttonColor}; transform: scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.08); }
                .popular-badge { position: absolute; top: 16px; right: 16px; background: ${buttonColor}; color: ${buttonTextColor}; padding: 6px 12px; border-radius: 100px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }

            `}</style>

            {/* Navbar */}
            <nav className={`glass-nav ${scrolled ? 'scrolled' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', background: buttonColor, borderRadius: '8px', color: buttonTextColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>N</div>
                    <span style={{ fontSize: '20px', fontWeight: '900', fontFamily: "'Outfit', sans-serif", letterSpacing: '-0.5px' }}>NFCrafter</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {session ? (
                        <button onClick={() => navigate('/client/dashboard')} className="btn" style={{ background: '#111827', color: 'white', padding: '10px 20px', fontSize: '14px' }}>Mon Dashboard</button>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontWeight: '700', color: '#4B5563', cursor: 'pointer', fontSize: '14px' }}>Connexion</button>
                            <button onClick={() => window.location.href = '#pricing'} className="btn" style={{ background: buttonColor, color: buttonTextColor, padding: '10px 20px', fontSize: '14px' }}>Commander</button>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero & Interactive Card Selector */}
            <section className="hero-section">
                <div style={{ display: 'inline-block', padding: '8px 16px', background: '#F3F4F6', borderRadius: '100px', fontSize: '13px', fontWeight: '800', color: '#4B5563', marginBottom: '24px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Nouvelle version disponible ✨
                </div>
                <h1 style={{ fontSize: 'clamp(40px, 8vw, 64px)', fontWeight: '900', fontFamily: "'Outfit', sans-serif", lineHeight: '1.1', letterSpacing: '-0.03em', maxWidth: '800px', margin: '0 0 20px 0' }}>
                    Votre identité professionnelle, <span style={{ color: buttonColor, transition: 'color 0.3s' }}>réinventée.</span>
                </h1>
                <p style={{ fontSize: '18px', color: '#4B5563', maxWidth: '600px', marginBottom: '40px', lineHeight: '1.6' }}>
                    La carte de visite intelligente et le mini-site qui centralisent vos liens, réalisations et produits. Impressionnez vos clients dès la première rencontre.
                </p>

                {/* 3D Interactive Card */}
                <div style={{ marginBottom: '40px', position: 'relative' }}>
                    <div className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={() => setIsFlipped(!isFlipped)}>
                        <div className="flip-card-inner">
                            <div className="flip-card-front" style={{ background: activeColor.hex }}>
                                <img src={activeColor.imgRecto} alt={`Carte ${activeColor.name} Recto`} className="card-img-real" onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }} />
                                <div className="card-img-placeholder" style={{ display: 'none', color: activeColor.hexText || 'white' }}>
                                    <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>NFCrafter</div>
                                    <div style={{ fontSize: 12, opacity: 0.8 }}>Recto - {activeColor.name}</div>
                                </div>
                            </div>
                            <div className="flip-card-back" style={{ background: activeColor.hex }}>
                                <img src={activeColor.imgVerso} alt={`Carte ${activeColor.name} Verso`} className="card-img-real" onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                }} />
                                <div className="card-img-placeholder" style={{ display: 'none', color: activeColor.hexText || 'white' }}>
                                    <div style={{ width: 100, height: 100, background: 'white', borderRadius: 10, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: 'black', fontSize: 10 }}>QR Code</span></div>
                                    <div style={{ fontSize: 12, opacity: 0.8 }}>Verso - Scanner</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Cliquez sur la carte pour voir le {isFlipped ? 'recto' : 'verso'}
                    </div>
                </div>

                {/* Color Selector */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', background: 'white', padding: '16px 24px', borderRadius: '100px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                    {CARD_COLORS.map((color, index) => (
                        <div 
                            key={color.id} 
                            className={`color-btn ${selectedColorIndex === index ? 'active' : ''}`}
                            style={{ background: color.hex }}
                            onClick={() => setSelectedColorIndex(index)}
                            title={color.name}
                        />
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <a href="#pricing" className="btn" style={{ background: buttonColor, color: buttonTextColor }}>
                        Voir les tarifs
                    </a>
                    <a href="https://nfcrafter.com/p/demo" target="_blank" className="btn" style={{ background: 'white', color: '#111827', border: '1px solid #E2E8F0' }}>
                        Voir un profil d'exemple
                    </a>
                </div>
            </section>

            {/* Features Showcase */}
            <section style={{ background: 'white', padding: '80px 0' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '36px', fontWeight: '900', fontFamily: "'Outfit', sans-serif", color: '#111827', marginBottom: '16px' }}>Tout ce dont vous avez besoin.</h2>
                    <p style={{ fontSize: '18px', color: '#64748B' }}>Bien plus qu'une simple carte de visite, c'est votre écosystème digital.</p>
                </div>
                <div className="features-grid">
                    {FEATURES.map((feat, i) => (
                        <div key={i} className="feature-card">
                            <div style={{ fontSize: '32px', marginBottom: '16px', background: '#F8FAFC', width: '60px', height: '60px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{feat.icon}</div>
                            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#1A1265' }}>{feat.title}</h3>
                            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{feat.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" style={{ padding: '100px 0', background: '#FAFAFA' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '40px', fontWeight: '900', fontFamily: "'Outfit', sans-serif", color: '#111827', marginBottom: '16px' }}>Passez au niveau supérieur.</h2>
                    <p style={{ fontSize: '18px', color: '#64748B' }}>Choisissez l'offre qui correspond à vos besoins. Paiement unique, pas d'abonnement.</p>
                </div>

                <div className="pricing-grid">
                    {/* Digital Only */}
                    <div className="pricing-card">
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0' }}>Profil Digital 100%</h3>
                            <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>Pour ceux qui veulent juste le lien en bio et le QR Code.</p>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <span style={{ fontSize: '48px', fontWeight: '900', color: '#111827', letterSpacing: '-2px' }}>7 000</span>
                            <span style={{ fontSize: '18px', color: '#64748B', fontWeight: '700' }}> FCFA</span>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>Paiement unique (À vie)</div>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            {['Mini-site V-Card Personnalisable', 'Portfolio & Boutique', 'QR Code téléchargeable', 'Statistiques de base', 'Lien personnalisable (nfcrafter.com/p/nom)'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#4B5563' }}>
                                    <div style={{ color: '#10B981', fontWeight: '900' }}>✓</div> {item}
                                </li>
                            ))}
                            <li style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#9CA3AF', textDecoration: 'line-through' }}>
                                <div style={{ color: '#EF4444', fontWeight: '900' }}>✕</div> Carte physique NFC
                            </li>
                        </ul>
                        <a href={paymentLinkDigital} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: '#F1F5F9', color: '#111827', width: '100%' }}>
                            Acheter le profil en ligne
                        </a>
                    </div>

                    {/* Physical + Digital */}
                    <div className="pricing-card popular">
                        <div className="popular-badge">Le plus choisi</div>
                        <div style={{ marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#111827', margin: '0 0 8px 0' }}>Carte Premium NFC</h3>
                            <p style={{ color: '#64748B', margin: 0, fontSize: '14px' }}>L'expérience complète : Profil digital + Carte physique.</p>
                        </div>
                        <div style={{ marginBottom: '32px' }}>
                            <span style={{ fontSize: '48px', fontWeight: '900', color: '#111827', letterSpacing: '-2px' }}>10 000</span>
                            <span style={{ fontSize: '18px', color: '#64748B', fontWeight: '700' }}> FCFA</span>
                            <div style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '700', textTransform: 'uppercase', marginTop: '4px' }}>Paiement unique (À vie)</div>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 40px 0', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                            {['Carte physique NFC Premium (Couleur au choix)', 'Livraison incluse (selon zone)', 'Mini-site V-Card Personnalisable', 'Portfolio & Boutique', 'QR Code gravé au dos', 'Toutes les fonctionnalités digitales'].map((item, i) => (
                                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: '#4B5563', fontWeight: i === 0 ? '700' : '400' }}>
                                    <div style={{ color: buttonColor, fontWeight: '900' }}>✓</div> {item}
                                </li>
                            ))}
                        </ul>
                        <a href={getWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: buttonColor, color: buttonTextColor, width: '100%' }}>
                            Commander sur WhatsApp
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ background: '#111827', padding: '60px 20px', color: 'white', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '8px', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>N</div>
                    <span style={{ fontSize: '24px', fontWeight: '900', fontFamily: "'Outfit', sans-serif" }}>NFCrafter</span>
                </div>
                <p style={{ color: '#9CA3AF', maxWidth: '400px', margin: '0 auto 30px auto', lineHeight: '1.6' }}>
                    Le futur du networking est là. Impressionnez, connectez et convertissez plus rapidement.
                </p>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                    © 2026 NFCrafter. Tous droits réservés.
                </div>
            </footer>
        </div>
    );
}
