// src/pages/PublicProfile.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { SOCIAL_NETWORKS } from '../constants/socials.js'

export default function PublicProfile() {
    const { cardId } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => { if (cardId) loadProfile() }, [cardId])

    async function loadProfile() {
        setLoading(true)
        const { data: card, error } = await supabase.from('cards').select('*').eq('card_id', cardId).single()
        if (error || !card) { setNotFound(true); setLoading(false); return }

        // URL type → immediate redirect
        if (card.type_data?.qr_type === 'url' && card.type_data?.url) {
            window.location.href = card.type_data.url
            return
        }

        setProfile(card.type_data || {})
        supabase.from('scan_logs').insert({ card_id: cardId, user_agent: navigator.userAgent }).then()
        setLoading(false)
    }

    function generateVCard() {
        if (!profile) return
        const p = profile
        let vc = `BEGIN:VCARD\r\nVERSION:3.0\r\n`
        if (p.full_name) vc += `FN:${p.full_name}\r\nN:${p.full_name};;;;\r\n`
        if (p.job_title) vc += `TITLE:${p.job_title}\r\n`
        if (p.bio) vc += `NOTE:${p.bio}\r\n`
        if (p.phone) vc += `TEL;TYPE=CELL:${p.phone}\r\n`
        if (p.email) vc += `EMAIL:${p.email}\r\n`
        if (p.photo_url) vc += `PHOTO;VALUE=URI:${p.photo_url}\r\n`

        // All social links
        if (p.socials) {
            Object.entries(p.socials).forEach(([key, val]) => {
                if (!val) return
                const net = SOCIAL_NETWORKS.find(n => n.id === key)
                if (net) {
                    const url = net.getUrl(val)
                    vc += `URL;TYPE=${net.label}:${url}\r\n`
                    if (net.vcardField) vc += `${net.vcardField(val)}\r\n`
                }
            })
        }

        // Custom links
        if (p.customLinks) {
            p.customLinks.forEach(link => {
                if (link.url) vc += `URL;TYPE=${link.label || 'Lien'}:${link.url}\r\n`
            })
        }

        vc += `END:VCARD`
        const blob = new Blob([vc], { type: 'text/vcard;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${p.full_name || 'contact'}.vcf`; a.click()
        URL.revokeObjectURL(url)
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid #EEF2FF', borderTopColor: '#1A1265', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    )

    if (notFound) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 80, fontWeight: 900, color: '#1A1265' }}>404</div>
                <p style={{ color: '#64748B', fontSize: 18, marginTop: 12 }}>Ce profil n'existe pas ou a été désactivé.</p>
            </div>
        </div>
    )

    const color = profile?.primaryColor || '#1A1265'
    const activeSocials = Object.entries(profile?.socials || {}).filter(([, v]) => v)
    const customLinks = (profile?.customLinks || []).filter(l => l.url)

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9', paddingBottom: 80, fontFamily: "'Inter', sans-serif" }}>
            {/* Banner */}
            <div style={{ height: 220, background: color, position: 'relative', overflow: 'hidden' }}>
                {profile?.banner_url && <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
                {/* gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.15) 100%)' }} />
            </div>

            <div style={{ maxWidth: 480, margin: '-70px auto 0', padding: '0 20px', position: 'relative' }}>
                {/* Profile card */}
                <div style={{ background: 'white', borderRadius: 32, padding: '72px 28px 32px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.07)' }}>
                    {/* Avatar */}
                    <div style={{
                        position: 'absolute', top: -54, left: '50%', transform: 'translateX(-50%)',
                        width: 108, height: 108, borderRadius: 28, border: '5px solid white',
                        background: '#EEF2FF', overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                    }}>
                        <img
                            src={profile?.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.full_name || 'U')}&background=random&bold=true`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt=""
                        />
                    </div>

                    <h1 style={{ fontSize: 26, fontWeight: 900, color: '#0F172A', marginBottom: 4 }}>{profile?.full_name}</h1>
                    {profile?.job_title && <p style={{ color: color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{profile.job_title}</p>}
                    {profile?.bio && <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 340, margin: '8px auto 24px' }}>{profile.bio}</p>}

                    {/* Save contact button */}
                    <button
                        onClick={generateVCard}
                        style={{
                            width: '100%', padding: '16px 24px', borderRadius: 18, border: 'none',
                            background: color, color: 'white', fontWeight: 800, fontSize: 15,
                            cursor: 'pointer', boxShadow: `0 12px 30px ${color}55`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            transition: 'transform .2s, box-shadow .2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${color}66` }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 12px 30px ${color}55` }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                        Enregistrer le contact
                    </button>
                </div>

                {/* Social links */}
                {activeSocials.length > 0 && (
                    <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {activeSocials.map(([key, value]) => {
                            const net = SOCIAL_NETWORKS.find(n => n.id === key)
                            if (!net) return null
                            return (
                                <a key={key} href={net.getUrl(value)} target="_blank" rel="noreferrer"
                                    style={{ background: 'white', padding: '14px 20px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', transition: 'transform .2s, box-shadow .2s' }}
                                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${net.color}22` }}
                                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }}
                                >
                                    <div style={{ width: 46, height: 46, borderRadius: 14, background: `${net.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <img src={net.icon} alt={net.label} style={{ width: 28, height: 28 }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>{net.label}</div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>{value}</div>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                                </a>
                            )
                        })}
                    </div>
                )}

                {/* Custom links */}
                {customLinks.length > 0 && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {customLinks.map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="noreferrer"
                                style={{ background: 'white', padding: '14px 20px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 16, textDecoration: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #F1F5F9', transition: 'transform .2s, box-shadow .2s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)' }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)' }}
                            >
                                <div style={{ width: 46, height: 46, borderRadius: 14, background: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, border: '1px solid #E2E8F0' }}>
                                    {link.emoji || '🔗'}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 800, color: '#0F172A', fontSize: 15 }}>{link.label || 'Lien'}</div>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                            </a>
                        ))}
                    </div>
                )}

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, opacity: 0.5, textDecoration: 'none', transition: 'opacity .2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}>
                        <img src="/logo.png" style={{ height: 22 }} alt="" />
                        <span style={{ fontWeight: 900, color: '#1A1265', fontSize: 13 }}>QR CRAFTER</span>
                    </a>
                </div>
            </div>
        </div>
    )
}