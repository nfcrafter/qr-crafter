import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const SOCIAL_LINKS = [
    { key: 'whatsapp', label: 'WhatsApp', icon: '💬', color: '#25D366', getUrl: v => `https://wa.me/${v.replace(/\D/g, '')}` },
    { key: 'phone', label: 'Appeler', icon: '📞', color: '#1A1265', getUrl: v => `tel:${v}` },
    { key: 'email', label: 'Email', icon: '✉️', color: '#EA4335', getUrl: v => `mailto:${v}` },
    { key: 'instagram', label: 'Instagram', icon: '📸', color: '#E1306C', getUrl: v => v },
    { key: 'facebook', label: 'Facebook', icon: '👥', color: '#1877F2', getUrl: v => v },
    { key: 'tiktok', label: 'TikTok', icon: '🎵', color: '#000000', getUrl: v => v },
    { key: 'twitter', label: 'X / Twitter', icon: '🐦', color: '#1DA1F2', getUrl: v => v },
    { key: 'linkedin', label: 'LinkedIn', icon: '💼', color: '#0A66C2', getUrl: v => v },
    { key: 'youtube', label: 'YouTube', icon: '▶️', color: '#FF0000', getUrl: v => v },
    { key: 'website', label: 'Site web', icon: '🌐', color: '#1A1265', getUrl: v => v },
]

export default function PublicProfile() {
    const { cardId } = useParams()
    const [profile, setProfile] = useState(null)
    const [card, setCard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        loadProfile()
    }, [cardId])

    async function loadProfile() {
        setLoading(true)

        const { data: card, error } = await supabase
            .from('cards')
            .select('*')
            .eq('card_id', cardId)
            .single()

        if (error || !card) {
            setNotFound(true)
            setLoading(false)
            return
        }

        // Charger le profil séparément
        if (card.owner_id) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', card.owner_id)
                .single()
            setProfile(profile)
        }

        // Enregistrer le scan
        await supabase.from('scan_logs').insert({
            card_id: cardId,
            user_agent: navigator.userAgent,
        })

        setCard(card)
        setLoading(false)
    }

    function saveContact() {
        if (!profile) return
        let vcard = `BEGIN:VCARD\nVERSION:3.0\n`
        vcard += `FN:${profile.full_name || ''}\n`
        if (profile.phone) vcard += `TEL:${profile.phone}\n`
        if (profile.whatsapp) vcard += `TEL;TYPE=WHATSAPP:${profile.whatsapp}\n`
        if (profile.email) vcard += `EMAIL:${profile.email}\n`
        if (profile.website) vcard += `URL:${profile.website}\n`
        if (profile.bio) vcard += `NOTE:${profile.bio}\n`
        vcard += `END:VCARD`
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${profile.full_name || 'contact'}.vcf`
        a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
        </div>
    )

    if (notFound || !card) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '8px' }}>
                Carte introuvable
            </h2>
            <p style={{ color: 'var(--text-light)' }}>Cette carte n'existe pas ou n'est pas encore activée.</p>
        </div>
    )

    if (card.status === 'pending' || !profile) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '24px' }}>
            <img src="/logo.png" alt="NFCrafter" style={{ height: '64px', marginBottom: '24px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '12px', textAlign: 'center' }}>
                Carte en cours d'activation
            </h2>
            <p style={{ color: 'var(--text-light)', textAlign: 'center', maxWidth: '360px', marginBottom: '24px' }}>
                Cette carte NFCrafter n'est pas encore activée. Créez votre compte pour l'activer.
            </p>
            <a href="/register" style={{
                background: 'var(--accent)', color: 'white', padding: '12px 32px',
                borderRadius: 'var(--radius-sm)', textDecoration: 'none',
                fontWeight: '600', fontSize: '15px',
            }}>
                Créer mon compte →
            </a>
        </div>
    )

    const activeLinks = SOCIAL_LINKS.filter(s => profile[s.key])

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' }}>

            {/* Header profil */}
            <div style={{
                background: 'var(--accent)', paddingTop: '48px', paddingBottom: '80px',
                textAlign: 'center', position: 'relative',
            }}>
                <div style={{
                    width: '100px', height: '100px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.2)', margin: '0 auto 16px',
                    overflow: 'hidden', border: '4px solid rgba(255,255,255,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '40px',
                }}>
                    {profile.photo_url
                        ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👤'
                    }
                </div>
                <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
                    {profile.full_name}
                </h1>
                {profile.bio && (
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>
                        {profile.bio}
                    </p>
                )}
            </div>

            {/* Liens */}
            <div style={{ maxWidth: '480px', margin: '-40px auto 0', padding: '0 16px' }}>

                {/* Bouton enregistrer contact */}
                <button onClick={saveContact} style={{
                    width: '100%', padding: '16px', marginBottom: '12px',
                    background: 'var(--bg-white)', border: '2px solid var(--accent)',
                    borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '10px', fontSize: '15px', fontWeight: '700',
                    color: 'var(--accent)', fontFamily: 'var(--font-display)',
                    boxShadow: 'var(--shadow-lg)',
                }}>
                    👤 Enregistrer le contact
                </button>

                {/* Liens sociaux */}
                {activeLinks.map(link => (
                    <a key={link.key}
                        href={link.getUrl(profile[link.key])}
                        target={link.key !== 'phone' && link.key !== 'email' ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '16px 20px', marginBottom: '10px',
                            background: 'var(--bg-white)', borderRadius: 'var(--radius-lg)',
                            textDecoration: 'none', color: 'var(--text)',
                            boxShadow: 'var(--shadow)', border: '1px solid var(--border)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = 'var(--shadow)'
                        }}
                    >
                        <span style={{
                            width: '42px', height: '42px', borderRadius: '50%',
                            background: link.color + '15', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                            flexShrink: 0,
                        }}>
                            {link.icon}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{link.label}</span>
                        <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: '18px' }}>→</span>
                    </a>
                ))}

                {/* Footer NFCrafter */}
                <div style={{ textAlign: 'center', marginTop: '32px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '4px' }}>Propulsé par</p>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '24px', opacity: 0.6 }} />
                </div>
            </div>
        </div>
    )
}