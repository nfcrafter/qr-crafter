import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page" style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>
            {/* Navigation */}
            <nav style={{ 
                height: '80px', 
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px',
                position: 'sticky',
                top: 0,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="QR Crafter" style={{ height: '36px' }} />
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#1A1265', letterSpacing: '-0.5px' }}>
                        QR CRAFTER
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={() => navigate('/login')} style={{ background: 'transparent', border: 'none', color: '#1A1265', fontWeight: '600', cursor: 'pointer' }}>Connexion</button>
                    <button className="btn-primary" onClick={() => navigate('/register')} style={{ padding: '10px 24px', borderRadius: '8px' }}>Commencer</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                padding: '100px 20px', 
                background: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
                textAlign: 'center'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                    <h1 style={{ 
                        fontSize: 'clamp(40px, 8vw, 64px)', 
                        fontWeight: '900', 
                        marginBottom: '24px',
                        color: '#1A1265',
                        letterSpacing: '-1px'
                    }}>
                        Générez des codes QR <span style={{ color: '#6366F1' }}>professionnels</span>
                    </h1>
                    <p style={{ fontSize: '20px', color: '#64748B', maxWidth: '800px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                        La solution complète pour vos cartes NFC et profils digitaux. Créez, gérez et suivez vos codes QR en toute simplicité.
                    </p>
                    <button className="btn-primary" style={{ padding: '18px 40px', fontSize: '18px', borderRadius: '8px' }} onClick={() => navigate('/register')}>
                        Créer mon premier code QR
                    </button>

                    <div style={{ marginTop: '80px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0,0,0,0.1)', border: '1px solid #E2E8F0' }}>
                        <img 
                            src="https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=1600" 
                            alt="Preview" 
                            style={{ width: '100%', display: 'block' }}
                        />
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section style={{ padding: '80px 20px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: '800', marginBottom: '60px', color: '#1A1265' }}>Plus de 16 types de codes QR</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                        {[
                            'URL / Site Web', 'Profil Digital', 'VCard Contact', 'WiFi', 
                            'Email Direct', 'SMS Automatique', 'Appel Téléphonique', 'Localisation GPS',
                            'Événement Calendrier', 'Crypto Wallet', 'Lien Instagram', 'Page Facebook',
                            'Document PDF', 'Lien Musique', 'Vidéo YouTube', 'Galerie Image'
                        ].map((label, i) => (
                            <div key={i} style={{ 
                                padding: '24px', border: '1px solid #E2E8F0', borderRadius: '8px', textAlign: 'center',
                                fontWeight: '700', color: '#1A1265', background: '#F8FAFC'
                            }}>
                                {label}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 20px', background: '#1A1265', color: 'white' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>QR CRAFTER</div>
                        <div style={{ color: '#94A3B8', fontSize: '14px' }}>© 2024 Tous droits réservés.</div>
                    </div>
                    <div style={{ display: 'flex', gap: '32px' }}>
                        <span style={{ cursor: 'pointer' }}>Produit</span>
                        <span style={{ cursor: 'pointer' }}>Contact</span>
                        <span style={{ cursor: 'pointer' }}>Légal</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
