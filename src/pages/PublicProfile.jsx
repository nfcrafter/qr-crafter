// src/pages/PublicProfile.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

import { SOCIAL_NETWORKS, LINK_ICONS } from '../constants/socials.js'

export default function PublicProfile() {
  const { cardId } = useParams()
  const [profile, setProfile] = useState(null)
  const [customLinks, setCustomLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { loadProfile() }, [cardId])

  async function loadProfile() {
    setLoading(true)
    const { data: card, error } = await supabase
      .from('cards').select('*').eq('card_id', cardId).single()
    if (error || !card) { setNotFound(true); setLoading(false); return }

    // URL type → immediate redirect
    if (card.admin_profile?.qr_type === 'url' && card.admin_profile?.url) {
      window.location.href = card.admin_profile.url
      return
    }

    let merged = {}

    if (card.owner_id) {
      // Card is activated — load client profile
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('id', card.owner_id).single()

      // Merge: admin sets base, client overrides but only if truthy
      const adminBase = card.admin_profile || {}
      merged = { ...adminBase }
      for (const k in profileData) {
        if (profileData[k] !== null && profileData[k] !== undefined && profileData[k] !== '') {
          merged[k] = profileData[k]
        }
      }

      // Load custom links from DB table
      const { data: linksData } = await supabase
        .from('custom_links').select('*')
        .eq('profile_id', card.owner_id)
        .order('position', { ascending: true })
      setCustomLinks(linksData?.length > 0 ? linksData : (merged.customLinks || []))
    } else if (card.admin_profile && Object.keys(card.admin_profile).length > 0) {
      // Not yet activated — show admin-filled profile
      merged = card.admin_profile
      setCustomLinks(merged.customLinks || [])
    }

    setProfile(merged)
    supabase.from('scan_logs').insert({ card_id: cardId, user_agent: navigator.userAgent }).then()
    setLoading(false)
  }

  function saveContact() {
    if (!profile) return
    let vc = `BEGIN:VCARD\r\nVERSION:3.0\r\n`
    if (profile.full_name) vc += `FN:${profile.full_name}\r\nN:${profile.full_name};;;;\r\n`
    if (profile.title || profile.job_title) vc += `TITLE:${profile.title || profile.job_title}\r\n`
    if (profile.bio) vc += `NOTE:${profile.bio}\r\n`
    if (profile.phone) vc += `TEL;TYPE=CELL:${profile.phone}\r\n`
    if (profile.email) vc += `EMAIL:${profile.email}\r\n`
    if (profile.photo_url) vc += `PHOTO;VALUE=URI:${profile.photo_url}\r\n`
    SOCIAL_NETWORKS.forEach(s => {
      const rawVal = profile[s.id] || profile?.socials?.[s.id]
      const val = (typeof rawVal === 'object' && rawVal !== null) ? rawVal.value : rawVal

      if (val && !['phone', 'email'].includes(s.id)) {
        try {
          const url = s.getUrl(val)
          if (s.id === 'website') {
            vc += `URL:${url}\r\n`
          } else if (s.vcardField) {
            vc += `${s.vcardField(url)}\r\n`
          }
        } catch (e) {
          console.error(`Error adding ${s.id} to vcard:`, e)
        }
      }
    })
    customLinks.forEach(l => { if (l.url) vc += `URL;TYPE=${l.label || l.title || 'Lien'}:${l.url}\r\n` })
    vc += `END:VCARD`
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS) {
      window.location.href = `data:text/x-vcard;charset=utf-8,${encodeURIComponent(vc)}`;
    } else {
      const blob = new Blob([vc], { type: 'text/vcard;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${profile.full_name || 'contact'}.vcf`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }, 100)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid #1A1265', borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <p style={{ color: '#888', fontSize: 14 }}>Chargement...</p>
      </div>
    </div>
  )

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
      <h2 style={{ color: '#1A1265', marginBottom: 8 }}>Carte introuvable</h2>
      <p style={{ color: '#666' }}>Cette carte n'existe pas ou n'est pas encore activée.</p>
    </div>
  )

  const themeColor = profile?.theme_color || profile?.primaryColor || '#1A1265'

  const activeLinks = SOCIAL_NETWORKS.filter(s => {
    if (s.id === 'phone' || s.id === 'email') return false;
    const val = profile?.[s.id] || profile?.socials?.[s.id];
    if (!val) return false;
    if (typeof val === 'object') return !!val.value;
    return typeof val === 'string' && val.trim().length > 0;
  });

  const activeCustomLinks = customLinks.filter(l => l.url)

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Inter', 'Outfit', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0;transform:translateY(16px) } to { opacity:1;transform:translateY(0) } }
        .pl { transition: transform .18s, box-shadow .18s; }
        .pl:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.10) !important; }
        .sb:hover { filter: brightness(1.08); transform: translateY(-1px); }
      `}</style>

      {/* Banner */}
      <div style={{
        height: 190, width: '100%', position: 'relative',
        background: profile?.banner_url ? `url(${profile.banner_url}) center/cover no-repeat` : themeColor
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.15) 100%)' }} />
      </div>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Profile card */}
        <div style={{ background: 'white', borderRadius: 20, marginTop: -24, marginBottom: 14, boxShadow: '0 4px 28px rgba(0,0,0,0.09)', animation: 'fadeUp .4s ease', position: 'relative', zIndex: 10 }}>
          {/* Avatar */}
          <div style={{ padding: '0 20px', height: 52, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -44, left: 20,
              width: 88, height: 88, borderRadius: '50%',
              border: '4px solid white', overflow: 'hidden',
              background: profile?.photo_url ? 'transparent' : themeColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', zIndex: 10
            }}>
              {profile?.photo_url
                ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : '👤'}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '4px 20px 16px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111', marginBottom: 2 }}>{profile?.full_name || 'Nom complet'}</h1>
            {(profile?.title || profile?.job_title) && <p style={{ fontSize: 13, color: themeColor, fontWeight: 700, marginBottom: 6 }}>{profile.title || profile.job_title}</p>}
            {profile?.bio && <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65 }}>{profile.bio}</p>}
          </div>

          {/* Save contact */}
          <div style={{ padding: '0 16px 20px' }}>
            <button className="sb" onClick={saveContact} style={{
              width: '100%', padding: '15px 20px', background: themeColor, color: 'white',
              border: 'none', borderRadius: 14, cursor: 'pointer', fontSize: 15, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: `0 8px 24px ${themeColor}44`, transition: 'all .18s'
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" /></svg>
              Enregistrer le contact
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, animation: 'fadeUp .5s ease' }}>
          {(profile?.phone || profile?.email) && (
            <div style={{ display: 'flex', gap: 10 }}>
              {profile?.phone && (
                <a className="pl" href={`tel:${profile.phone.toString().replace(/\s+/g, '')}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'white', borderRadius: 16, textDecoration: 'none', color: '#111', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', fontWeight: 700, fontSize: 14 }}>
                  <span style={{ fontSize: 16 }}>📞</span> Appeler
                </a>
              )}
              {profile?.email && (
                <a className="pl" href={`mailto:${profile.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: 'white', borderRadius: 16, textDecoration: 'none', color: '#111', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', fontWeight: 700, fontSize: 14 }}>
                  <span style={{ fontSize: 16 }}>✉️</span> Email
                </a>
              )}
            </div>
          )}

          {activeLinks.map(link => {
            const rawValue = profile[link.id] || profile?.socials?.[link.id];
            const linkValue = (typeof rawValue === 'object' && rawValue !== null) ? rawValue.value : rawValue;
            const subText = (typeof rawValue === 'object' && rawValue !== null) ? rawValue.subtitle : '';

            if (!linkValue) return null;

            return (
              <a key={link.id} className="pl"
                href={link.getUrl(linkValue)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: 'white', borderRadius: 16, textDecoration: 'none', color: '#111', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: link.id === 'snapchat' ? link.color : link.color + '18',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                  dangerouslySetInnerHTML={{ __html: `<div style="width:22px;height:22px;color:${link.id === 'snapchat' ? '#000000' : (link.iconColor || link.color)}">${link.svg}</div>` }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{link.label}</div>
                  {subText && <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{subText}</div>}
                </div>
                <span style={{ color: '#CBD5E1', fontSize: 18 }}>→</span>
              </a>
            )
          })}

          {activeCustomLinks.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, paddingLeft: 4, display: 'block', width: '100%' }}>
                Autres liens
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeCustomLinks.map(link => (
                  <a key={link.id} className="pl" href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: 'white', borderRadius: 16, textDecoration: 'none', color: '#111', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: '#F8FAFC', border: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      {link.emoji || link.icon || '🔗'}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{link.label || link.title}</span>
                    <span style={{ color: '#CBD5E1', fontSize: 18 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <p style={{ fontSize: 11, color: '#bbb', marginBottom: 6 }}>Propulsé par</p>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, opacity: 0.45 }}>
            <img src="/logo.png" alt="NFCrafter" style={{ height: 26 }} />
            <span style={{ fontWeight: 900, color: '#1A1265', fontSize: 13 }}>NFCrafter</span>
          </a>
        </div>
      </div>
    </div>
  )
}