import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="landing-page" style={{ background: '#FFFFFF', minHeight: '100vh' }}>
            {/* Navigation */}
            <nav style={{ 
                height: '80px', 
                borderBottom: '1px solid #F1F5F9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 40px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                    <img src="/logo.png" alt="QR Crafter" style={{ height: '40px' }} />
                    <span style={{ fontSize: '22px', fontWeight: '800', color: '#1A1265', letterSpacing: '-0.5px' }}>
                        QR<span style={{ color: 'var(--primary)' }}>CRAFTER</span>
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn-ghost" onClick={() => navigate('/login')}>Se connecter</button>
                    <button className="btn-primary" onClick={() => navigate('/register')}>S'inscrire</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{ 
                padding: '100px 20px 60px', 
                background: 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div className="max-w-wrapper">
                    <h1 style={{ 
                        fontSize: 'clamp(40px, 8vw, 64px)', 
                        lineHeight: '1.1', 
                        fontWeight: '800', 
                        marginBottom: '24px',
                        color: '#0F172A'
                    }}>
                        Nous simplifions les <span style={{ color: 'var(--primary)' }}>codes QR</span>
                    </h1>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        gap: '40px', 
                        marginBottom: '48px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckIcon /> <span>Générez des codes QR dynamiques</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckIcon /> <span>Suivez les performances</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckIcon /> <span>Concevez avec logo et couleurs</span>
                        </div>
                    </div>
                    <button className="btn-primary" style={{ padding: '20px 40px', fontSize: '20px', borderRadius: '40px' }} onClick={() => navigate('/register')}>
                        Créer un code QR
                    </button>

                    {/* Preview Mockup */}
                    <div style={{ marginTop: '80px', position: 'relative', zIndex: 2 }}>
                        <div className="premium-card" style={{ 
                            padding: '10px', 
                            borderRadius: '24px', 
                            maxWidth: '1000px', 
                            margin: '0 auto',
                            background: 'white'
                        }}>
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bbbda5366392?auto=format&fit=crop&q=80&w=2000" 
                                alt="Dashboard Preview" 
                                style={{ width: '100%', borderRadius: '16px', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Decorative blobs */}
                <div style={{ 
                    position: 'absolute', 
                    top: '10%', 
                    left: '-5%', 
                    width: '300px', 
                    height: '300px', 
                    background: 'var(--primary)', 
                    filter: 'blur(150px)', 
                    opacity: 0.1 
                }}></div>
                <div style={{ 
                    position: 'absolute', 
                    bottom: '10%', 
                    right: '-5%', 
                    width: '300px', 
                    height: '300px', 
                    background: 'var(--secondary)', 
                    filter: 'blur(150px)', 
                    opacity: 0.1 
                }}></div>
            </section>

            {/* QR Types Section */}
            <section style={{ padding: '80px 20px', background: '#FFFFFF' }}>
                <div className="max-w-wrapper">
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px' }}>
                            Un seul outil pour tous vos <span style={{ color: 'var(--primary)' }}>besoins</span>
                        </h2>
                        <p style={{ color: 'var(--text-500)', fontSize: '18px' }}>
                            Découvrez la multitude de types de codes QR que vous pouvez générer gratuitement.
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
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
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'}
                               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
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
                        fontSize: '48px', 
                        marginBottom: '60px',
                        fontWeight: '700'
                    }}>
                        Créez votre code QR gratuitement en trois <span style={{ color: 'var(--primary)' }}>étapes simples</span>
                    </h2>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
                        <StepCard 
                            number="1" 
                            title="Lien Administrateur" 
                            description="L'administrateur génère votre lien unique et prépare votre carte NFC personnalisée."
                            color="var(--primary)"
                        />
                        <StepCard 
                            number="2" 
                            title="Activez votre carte" 
                            description="Recevez votre carte, scannez-la et connectez-vous pour configurer votre profil digital."
                            color="var(--secondary)"
                        />
                        <StepCard 
                            number="3" 
                            title="Profil illimité & Gratuit" 
                            description="Mettez à jour vos informations à tout moment, sans aucun frais caché, pour toujours."
                            color="var(--accent)"
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section style={{ padding: '100px 20px', background: '#FFFFFF' }}>
                <div className="max-w-wrapper">
                    <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                        <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>
                            Le plus <span style={{ color: 'var(--primary)' }}>perfectionné</span> des générateurs
                        </h2>
                        <p style={{ color: 'var(--text-500)', fontSize: '18px', maxWidth: '800px', margin: '0 auto' }}>
                            Notre logiciel est extrêmement fonctionnel et personnalisable, tout en restant facile à utiliser pour tous.
                        </p>
                    </div>

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
                        gap: '24px' 
                    }}>
                        <FeatureCard 
                            title="Des codes QR high-tech"
                            desc="Accédez à des fonctionnalités avancées grâce à notre générateur de code QR dynamique."
                            icon="⚡"
                        />
                        <FeatureCard 
                            title="Des taux de conversion élevés"
                            desc="Créez des codes QR performants qui représentent fidèlement votre marque."
                            icon="📈"
                        />
                        <FeatureCard 
                            title="Analyses en temps réel"
                            desc="Sachez quand, où et combien de fois vos codes QR ont été scannés."
                            icon="📊"
                        />
                        <FeatureCard 
                            title="Personnalisation totale"
                            desc="Rendez vos codes QR plus attrayants grâce à notre gamme infinie d'options."
                            icon="🎨"
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 20px', background: '#1A1265', color: 'white' }}>
                <div className="max-w-wrapper" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '40px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <img src="/logo.png" alt="Logo" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
                            <span style={{ fontSize: '24px', fontWeight: '800' }}>
                                QR<span style={{ color: '#6366F1' }}>CRAFTER</span>
                            </span>
                        </div>
                        <p style={{ color: '#94A3B8' }}>© 2024 QR Crafter. Tous droits réservés.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Fonctionnalités</a>
                        <a href="#" style={{ color: '#94A3B8', textDecoration: 'none' }}>Aide</a>
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
