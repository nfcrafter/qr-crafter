import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const SOCIAL_LINKS = [
    { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', getUrl: v => `https://wa.me/${v.replace(/\D/g, '')}`, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' },
    { key: 'phone', label: 'Appeler', color: '#1A1265', getUrl: v => `tel:${v}`, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>' },
    { key: 'email', label: 'Email', color: '#EA4335', getUrl: v => `mailto:${v}`, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>' },
    { key: 'facebook', label: 'Facebook', color: '#1877F2', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>' },
    { key: 'tiktok', label: 'TikTok', color: '#000000', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>' },
    { key: 'twitter', label: 'X / Twitter', color: '#000000', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>' },
    { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>' },
    { key: 'youtube', label: 'YouTube', color: '#FF0000', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>' },
    { key: 'website', label: 'Site web', color: '#1A1265', getUrl: v => v, svg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>' },
]

export default function PublicProfile() {
    const { cardId } = useParams()
    const [profile, setProfile] = useState(null)
    const [card, setCard] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => { loadProfile() }, [cardId])

    async function loadProfile() {
        setLoading(true)
        const { data: card, error } = await supabase
            .from('cards').select('*').eq('card_id', cardId).single()
        if (error || !card) { setNotFound(true); setLoading(false); return }
        if (card.owner_id) {
            const { data: profile } = await supabase
                .from('profiles').select('*').eq('id', card.owner_id).single()
            setProfile(profile)
        }
        await supabase.from('scan_logs').insert({ card_id: cardId, user_agent: navigator.userAgent })
        setCard(card)
        setLoading(false)
    }

    function saveContact() {
        if (!profile) return
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.full_name || ''}\n`
        if (profile.phone) vcard += `TEL:${profile.phone}\n`
        if (profile.whatsapp) vcard += `TEL;TYPE=WHATSAPP:${profile.whatsapp}\n`
        if (profile.email) vcard += `EMAIL:${profile.email}\n`
        if (profile.website) vcard += `URL:${profile.website}\n`
        if (profile.bio) vcard += `NOTE:${profile.bio}\n`
        vcard += `END:VCARD`
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${profile.full_name || 'contact'}.vcf`; a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid #1A1265', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                <p style={{ color: '#666', fontSize: '14px' }}>Chargement...</p>
            </div>
        </div>
    )

    if (notFound) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>😕</div>
            <h2 style={{ color: '#1A1265', marginBottom: '8px' }}>Carte introuvable</h2>
            <p style={{ color: '#666' }}>Cette carte n'existe pas ou n'est pas encore activée.</p>
        </div>
    )

    if (card?.status === 'pending' || !profile) return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', padding: '24px' }}>
            <img src="/logo.png" alt="NFCrafter" style={{ height: '64px', marginBottom: '24px' }} />
            <h2 style={{ color: '#1A1265', marginBottom: '12px', textAlign: 'center' }}>Carte en cours d'activation</h2>
            <p style={{ color: '#666', textAlign: 'center', maxWidth: '360px', marginBottom: '24px' }}>
                Cette carte NFCrafter n'est pas encore activée.
            </p>
            <a href="/register" style={{ background: '#1A1265', color: 'white', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                Créer mon compte →
            </a>
        </div>
    )

    const themeColor = profile.theme_color || '#1A1265'
    const activeLinks = SOCIAL_LINKS.filter(s => profile[s.key])

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5', fontFamily: 'var(--font-body)' }}>
            <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }`}</style>

            {/* Bannière pleine largeur */}
            <div style={{
                height: '180px',
                background: profile.banner_url
                    ? `url(${profile.banner_url}) center/cover no-repeat`
                    : themeColor,
                width: '100%',
            }} />

            {/* Conteneur centré */}
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>

                {/* Card profil */}
                <div style={{
                    background: 'white', borderRadius: '16px',
                    marginTop: '-20px', marginBottom: '16px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                    animation: 'fadeUp 0.4s ease',
                    overflow: 'visible', position: 'relative',
                }}>
                    {/* Avatar */}
                    <div style={{ padding: '0 20px', position: 'relative', height: '56px' }}>
                        <div style={{
                            position: 'absolute', top: '-48px', left: '20px',
                            width: '96px', height: '96px', borderRadius: '50%',
                            border: '4px solid white', overflow: 'hidden',
                            background: profile.photo_url ? 'transparent' : themeColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                            zIndex: 10,
                        }}>
                            {profile.photo_url
                                ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={profile.full_name} />
                                : '👤'
                            }
                        </div>
                    </div>

                    {/* Nom + titre + bio */}
                    <div style={{ padding: '8px 20px 16px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>
                            {profile.full_name}
                        </h1>
                        {profile.title && (
                            <p style={{ fontSize: '14px', color: themeColor, fontWeight: '600', marginBottom: '8px' }}>
                                {profile.title}
                            </p>
                        )}
                        {profile.bio && (
                            <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                                {profile.bio}
                            </p>
                        )}
                    </div>

                    {/* Bouton contact */}
                    <div style={{ padding: '0 16px 20px' }}>
                        <button onClick={saveContact} style={{
                            width: '100%', padding: '14px',
                            background: themeColor, color: 'white',
                            border: 'none', borderRadius: '12px', cursor: 'pointer',
                            fontSize: '15px', fontWeight: '700',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        }}>
                            👤 Enregistrer le contact
                        </button>
                    </div>
                </div>

                {/* Liens sociaux */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeUp 0.5s ease' }}>
                    {activeLinks.map((link, i) => (
                        <a key={link.key}
                            href={link.getUrl(profile[link.key])}
                            target={['phone', 'email', 'whatsapp'].includes(link.key) ? '_self' : '_blank'}
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '14px 18px', background: 'white',
                                borderRadius: '14px', textDecoration: 'none', color: '#1a1a1a',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                border: '1px solid rgba(0,0,0,0.06)',
                            }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: '12px',
                                background: link.color + '15',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                                dangerouslySetInnerHTML={{ __html: `<div style="width:22px;height:22px;color:${link.color}">${link.svg}</div>` }}
                            />
                            <span style={{ fontWeight: '600', fontSize: '15px', flex: 1 }}>{link.label}</span>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '32px' }}>
                    <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>Propulsé par</p>
                    <a href="/" style={{ textDecoration: 'none' }}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '28px', opacity: 0.5 }} />
                    </a>
                </div>

            </div>
        </div>
    )
}