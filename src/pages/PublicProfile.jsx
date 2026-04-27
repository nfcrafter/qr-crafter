// src/pages/PublicProfile.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const SOCIAL_LINKS = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', getUrl: v => `https://wa.me/${v.replace(/\D/g, '')}`, icon: '💬' },
    { key: 'phone', label: 'Appeler', color: '#1A1265', getUrl: v => `tel:${v}`, icon: '📞' },
    { key: 'email', label: 'Email', color: '#EA4335', getUrl: v => `mailto:${v}`, icon: '✉️' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C', getUrl: v => v, icon: '📸' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', getUrl: v => v, icon: '👥' },
    { key: 'tiktok', label: 'TikTok', color: '#000000', getUrl: v => v, icon: '🎵' },
    { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2', getUrl: v => v, icon: '💼' },
    { key: 'website', label: 'Site web', color: '#1A1265', getUrl: v => v, icon: '🌐' },
]

export default function PublicProfile({ previewData }) {
    const { cardId } = useParams()
    const [profile, setProfile] = useState(previewData || null)
    const [card, setCard] = useState(null)
    const [loading, setLoading] = useState(!previewData)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => { 
        if (previewData) {
            setProfile(previewData);
            setLoading(false);
        } else if (cardId) {
            loadProfile();
        }
    }, [cardId, previewData])

    async function loadProfile() {
        setLoading(true)
        const { data: card, error } = await supabase
            .from('cards').select('*').eq('card_id', cardId).single()
        
        if (error || !card) { setNotFound(true); setLoading(false); return }

        if (card.owner_id) {
            const { data: profileData } = await supabase
                .from('profiles').select('*').eq('id', card.owner_id).single()
            setProfile(profileData)
        } else {
            // Use admin-defined profile if not yet claimed
            setProfile(card.admin_profile)
        }

        // Log scan
        supabase.from('scan_logs').insert({ card_id: cardId, user_agent: navigator.userAgent }).then()
        
        setCard(card)
        setLoading(false)
    }

    function saveContact() {
        if (!profile) return
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.full_name || ''}\nTEL:${profile.phone || ''}\nEMAIL:${profile.email || ''}\nURL:${profile.website || ''}\nEND:VCARD`
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${profile.full_name}.vcf`; a.click()
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (notFound && !previewData) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
            <div>
                <h1 style={{ fontSize: '100px', margin: 0 }}>404</h1>
                <p style={{ fontSize: '20px', color: 'var(--text-500)' }}>Carte introuvable ou inactive.</p>
            </div>
        </div>
    )

    const themeColor = profile?.theme_color || '#1A1265'
    const activeLinks = SOCIAL_LINKS.filter(s => profile?.[s.key])

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9', paddingBottom: '60px' }}>
            {/* Header / Banner */}
            <div style={{ 
                height: '240px', 
                background: profile?.banner_url ? `url(${profile.banner_url}) center/cover` : themeColor,
                position: 'relative'
            }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))' }}></div>
            </div>

            <div style={{ maxWidth: '500px', margin: '-80px auto 0', padding: '0 20px', position: 'relative', zIndex: 10 }}>
                {/* Profile Card */}
                <div className="premium-card" style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div style={{ 
                        position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
                        width: '120px', height: '120px', borderRadius: '40px', border: '6px solid white',
                        background: 'white', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'
                    }}>
                        <img 
                            src={profile?.photo_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'User'}&background=random`} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            alt="Avatar"
                        />
                    </div>

                    <h1 style={{ fontSize: '28px', marginBottom: '4px' }}>{profile?.full_name || 'Nom complet'}</h1>
                    <p style={{ color: themeColor, fontWeight: '700', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
                        {profile?.title || 'Titre / Poste'}
                    </p>
                    <p style={{ color: 'var(--text-500)', fontSize: '15px', lineHeight: '1.6', marginBottom: '24px' }}>
                        {profile?.bio || 'Définissez votre biographie dans les paramètres.'}
                    </p>

                    <button 
                        onClick={saveContact}
                        className="btn-primary" 
                        style={{ width: '100%', background: themeColor, boxShadow: `0 10px 20px ${themeColor}33` }}
                    >
                        Enregistrer le Contact
                    </button>
                </div>

                {/* Social Links Grid */}
                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                    {activeLinks.length > 0 ? activeLinks.map(link => (
                        <a 
                            key={link.key} 
                            href={link.getUrl(profile[link.key])} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="premium-card animate-fade-in"
                            style={{ 
                                display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', 
                                textDecoration: 'none', transition: 'transform 0.2s',
                                border: '1px solid rgba(255,255,255,0.8)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <div style={{ 
                                width: '48px', height: '48px', borderRadius: '14px', 
                                background: `${link.color}15`, color: link.color, 
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' 
                            }}>
                                {link.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '700', color: 'var(--text-900)', fontSize: '15px' }}>{link.label}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-500)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                    {profile[link.key]}
                                </div>
                            </div>
                            <div style={{ color: 'var(--text-400)' }}>→</div>
                        </a>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-400)', fontSize: '14px' }}>
                            Aucun lien social configuré.
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '48px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-400)', marginBottom: '12px' }}>Propulsé gratuitement par</p>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '24px' }} />
                        <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-900)', letterSpacing: '-0.5px' }}>
                            QR <span style={{ color: 'var(--primary)' }}>CRAFTER</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
