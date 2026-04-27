import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page" style={{ background: '#FFFFFF', minHeight: '100vh', overflowX: 'hidden' }}>
            {/* Navigation */}
            <nav style={{ 
                height: '80px', 
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 min(40px, 5%)',
                position: 'sticky',
                top: 0,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="QR Crafter" style={{ height: '32px' }} />
                    <span style={{ fontSize: 'clamp(18px, 4vw, 22px)', fontWeight: '800', color: '#1A1265', letterSpacing: '-0.5px' }}>
                        QR<span style={{ color: 'var(--primary)' }}>CRAFTER</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-ghost" style={{ padding: '8px 12px', fontSize: '14px' }} onClick={() => navigate('/login')}>Connexion</button>
                    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => navigate('/register')}>Débuter</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                padding: 'clamp(60px, 10vw, 120px) 20px 60px', 
                background: 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="max-w-wrapper">
                    <h1 style={{ 
                        fontSize: 'clamp(36px, 8vw, 72px)', 
                        lineHeight: '1.1', 
                        fontWeight: '800', 
                        marginBottom: '24px',
                        color: '#0F172A',
                        letterSpacing: '-1.5px'
                    }}>
                        Nous simplifions les <span style={{ color: 'var(--primary)' }}>codes QR</span>
                    </h1>
                    <p style={{ fontSize: 'clamp(16px, 4vw, 20px)', color: 'var(--text-500)', maxWidth: '700px', margin: '0 auto 40px', lineHeight: '1.6' }}>
                        Gérez vos cartes NFC, créez des profils digitaux premium et suivez vos performances avec notre générateur universel.
                    </p>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: 'clamp(16px, 5vw, 40px)', 
                        marginBottom: '48px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                            <CheckIcon /> <span>Codes QR dynamiques</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                            <CheckIcon /> <span>Suivi & Statistiques</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600' }}>
                            <CheckIcon /> <span>Design Personnalisé</span>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ padding: '20px 48px', fontSize: '20px', borderRadius: '40px', boxShadow: '0 20px 40px rgba(26, 18, 101, 0.2)' }} onClick={() => navigate('/register')}>
                        Créer un code QR gratuitement
                    </button>

                    {/* Preview Mockup */}
                    <div style={{ marginTop: '80px', position: 'relative', zIndex: 2 }}>
                        <div className="premium-card" style={{ 
                            padding: 'clamp(4px, 1vw, 10px)', 
                            borderRadius: 'clamp(16px, 3vw, 24px)', 
                            maxWidth: '1000px', 
                            margin: '0 auto',
                            background: 'white',
                            boxShadow: '0 40px 100px rgba(15, 23, 42, 0.1)'
                        }}>
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=2000" 
                                alt="Dashboard Preview" 
                                style={{ width: '100%', borderRadius: 'inherit', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* QR Types Section */}
            <section style={{ padding: '80px 20px', background: '#FFFFFF' }}>
                <div className="max-w-wrapper">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: '800', marginBottom: '16px' }}>
                            Un seul outil pour tous vos <span style={{ color: 'var(--primary)' }}>besoins</span>
                        </h2>
                        <p style={{ color: 'var(--text-500)', fontSize: '18px' }}>
                            16 types de codes QR intelligents à votre disposition.
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 40vw, 180px), 1fr))', 
                        gap: '20px' 
                    }}>
                        {[
                            { icon: '🔗', label: 'URL' },
                            { icon: '👤', label: 'VCard' },
                            { icon: '📝', label: 'Texte' },
                            { icon: '📶', label: 'WiFi' },
                            { icon: '📧', label: 'Email' },
                            { icon: '💬', label: 'SMS' },
                            { icon: '📞', label: 'Téléphone' },
                            { icon: '📍', label: 'Localisation' },
                            { icon: '📅', label: 'Événement' },
                            { icon: '₿', label: 'Crypto' },
                            { icon: '📸', label: 'Instagram' },
                            { icon: '👥', label: 'Facebook' },
                            { icon: '📄', label: 'PDF' },
                            { icon: '🎵', label: 'Musique' },
                            { icon: '🎞️', label: 'Vidéo' },
                            { icon: '🖼️', label: 'Image' }
                        ].map((type, i) => (
                            <div key={i} className="premium-card" style={{ 
                                textAlign: 'center', 
                                padding: '24px 16px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '12px',
                                cursor: 'pointer'
                            }}>
                                <span style={{ fontSize: '32px' }}>{type.icon}</span>
                                <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-900)' }}>{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section style={{ padding: '100px 20px', background: '#F8FAFC' }}>
                <div className="max-w-wrapper">
                    <h2 style={{ 
                        textAlign: 'center', 
                        fontSize: 'clamp(32px, 6vw, 48px)', 
                        marginBottom: '60px',
                        fontWeight: '800'
                    }}>
                        Créez votre code QR en <span style={{ color: 'var(--primary)' }}>3 étapes</span>
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                        <StepCard 
                            number="1" 
                            title="Générez" 
                            description="Choisissez votre type de QR et remplissez les informations nécessaires."
                            color="var(--primary)"
                        />
                        <StepCard 
                            number="2" 
                            title="Personnalisez" 
                            description="Ajoutez votre logo, vos couleurs et choisissez un style de points unique."
                            color="var(--secondary)"
                        />
                        <StepCard 
                            number="3" 
                            title="Diffusez" 
                            description="Téléchargez votre QR haute résolution ou commandez votre carte NFC."
                            color="var(--accent)"
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 20px', background: '#FFFFFF' }}>
                <div className="max-w-wrapper">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: 'clamp(32px, 6vw, 48px)', marginBottom: '20px', fontWeight: '800' }}>
                            Le plus <span style={{ color: 'var(--primary)' }}>perfectionné</span>
                        </h2>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 1fr))', 
                        gap: '24px' 
                    }}>
                        <FeatureCard 
                            title="Codes QR Dynamiques"
                            desc="Modifiez le contenu de votre QR même après l'avoir imprimé sur vos cartes."
                            icon="⚡"
                        />
                        <FeatureCard 
                            title="Conversion Optimisée"
                            desc="Des designs qui attirent l'œil et encouragent le scan immédiat."
                            icon="📈"
                        />
                        <FeatureCard 
                            title="Statistiques en Direct"
                            desc="Suivez chaque interaction pour comprendre l'impact de vos codes."
                            icon="📊"
                        />
                        <FeatureCard 
                            title="Branding complet"
                            desc="Intégrez votre logo et vos couleurs de marque parfaitement."
                            icon="🎨"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '60px 20px', background: '#0F172A', color: 'white' }}>
                <div className="max-w-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: '24px', fontWeight: '800' }}>
                                QR<span style={{ color: '#6366F1' }}>CRAFTER</span>
                            </span>
                        </div>
                        <p style={{ color: '#94A3B8', fontSize: '14px' }}>© 2024 QR Crafter. La plateforme NFC premium.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Fonctionnalités</a>
                        <a href="#" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px' }}>Aide</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function CheckIcon() {
    return (
        <div style={{ 
            width: '24px', 
            height: '24px', 
            background: 'var(--primary)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px'
        }}>✓</div>
    );
}

function StepCard({ number, title, description, color }) {
    return (
        <div className="premium-card" style={{ textAlign: 'center', borderTop: `6px solid ${color}` }}>
            <div style={{ 
                width: '60px', 
                height: '60px', 
                background: color, 
                borderRadius: '20px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0 auto 24px'
            }}>{number}</div>
            <h3 style={{ marginBottom: '16px', fontSize: '24px' }}>{title}</h3>
            <p style={{ color: 'var(--text-500)' }}>{description}</p>
        </div>
    );
}

function FeatureCard({ title, desc, icon }) {
    return (
        <div className="premium-card" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ 
                fontSize: '32px', 
                background: '#F1F5F9', 
                width: '64px', 
                height: '64px', 
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>{icon}</div>
            <div>
                <h3 style={{ marginBottom: '8px', fontSize: '20px' }}>{title}</h3>
                <p style={{ color: 'var(--text-500)', fontSize: '15px' }}>{desc}</p>
            </div>
        </div>
    );
}
