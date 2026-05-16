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
  const [isBioExpanded, setIsBioExpanded] = useState(false)

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

  async function saveContact() {
    if (!profile) return
    
    let photoBase64 = '';
    if (profile.photo_url) {
      try {
        const response = await fetch(profile.photo_url);
        const blob = await response.blob();
        photoBase64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.error("Error fetching profile photo for VCard:", e);
      }
    }

    let vc = `BEGIN:VCARD\r\nVERSION:3.0\r\n`
    if (profile.full_name) vc += `FN:${profile.full_name}\r\nN:${profile.full_name};;;;\r\n`
    if (profile.title || profile.job_title) vc += `TITLE:${profile.title || profile.job_title}\r\n`
    if (profile.bio) vc += `NOTE:${profile.bio}\r\n`
    if (profile.phone) vc += `TEL;TYPE=CELL:${profile.phone}\r\n`
    if (profile.email) vc += `EMAIL:${profile.email}\r\n`
    
    if (photoBase64) {
      vc += `PHOTO;TYPE=JPEG;ENCODING=b:${photoBase64}\r\n`
    } else if (profile.photo_url) {
      vc += `PHOTO;VALUE=URI:${profile.photo_url}\r\n`
    }

    let itemIndex = 1;
    SOCIAL_NETWORKS.forEach(s => {
      const rawVal = profile[s.id] || profile?.socials?.[s.id]
      const val = (typeof rawVal === 'object' && rawVal !== null) ? rawVal.value : rawVal

      if (val && !['phone', 'email'].includes(s.id)) {
        try {
          const url = s.getUrl(val)
          if (s.id === 'website') {
            vc += `URL:${url}\r\n`
          } else {
            vc += `item${itemIndex}.URL:${url}\r\n`
            vc += `item${itemIndex}.X-ABLabel:${s.label}\r\n`
            itemIndex++;
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: 20, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, color: '#94A3B8', marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>` }} />
      <h2 style={{ color: '#1A1265', marginBottom: 8 }}>Carte introuvable</h2>
      <p style={{ color: '#666' }}>Cette carte n'existe pas ou elle n'est pas encore activée.</p>
    </div>
  )

  const getBrightness = (hex) => {
    if (!hex || hex[0] !== '#') return 255;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
  };
  
  const themeColor = profile?.theme_color || profile?.primaryColor || '#1A1265'
  const bgColor = profile?.backgroundColor || '#f0f2f5'
  const isDark = getBrightness(bgColor) < 128;
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'white';
  const textColor = isDark ? '#F8FAFC' : '#111';
  const subTextColor = isDark ? '#94A3B8' : '#64748B';

  const activeLinks = SOCIAL_NETWORKS.filter(s => {
    if (s.id === 'phone' || s.id === 'email') return false;
    const val = profile?.[s.id] || profile?.socials?.[s.id];
    if (!val) return false;
    if (typeof val === 'object') return !!val.value;
    return typeof val === 'string' && val.trim().length > 0;
  });

  const activeCustomLinks = customLinks.filter(l => l.url)

  // Logic for Opening Hours status
  const getOpenStatus = () => {
    if (!profile?.business_hours || !profile?.show_hours) return null;
    const now = new Date();
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentDay = dayNames[now.getDay()];
    const config = profile.business_hours[currentDay];
    
    if (!config || !config.active) return { text: 'Fermé aujourd\'hui', color: '#EF4444' };
    
    const [hOpen, mOpen] = config.open.split(':').map(Number);
    const [hClose, mClose] = config.close.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const openMinutes = hOpen * 60 + mOpen;
    const closeMinutes = hClose * 60 + mClose;
    
    if (nowMinutes >= openMinutes && nowMinutes <= closeMinutes) {
        return { text: `Ouvert · Ferme à ${config.close}`, color: '#10B981' };
    }
    return { text: `Fermé · Ouvre à ${config.open}`, color: '#EF4444' };
  };

  const openStatus = getOpenStatus();

  return (
    <div style={{ 
        minHeight: '100vh', 
        background: bgColor, 
        fontFamily: "'Inter', 'Outfit', sans-serif",
        transition: 'all 0.3s ease',
        color: textColor
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0;transform:translateY(16px) } to { opacity:1;transform:translateY(0) } }
        .pl { transition: transform .18s, box-shadow .18s; }
        .pl:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.15) !important; }
        .sb:hover { filter: brightness(1.1); transform: translateY(-1px); }
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
        <div style={{ 
            background: cardBg, 
            borderRadius: 24, marginTop: -24, marginBottom: 16, 
            boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.3)' : '0 4px 28px rgba(0,0,0,0.06)', 
            animation: 'fadeUp .4s ease', position: 'relative', zIndex: 10,
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.7)',
            backdropFilter: isDark ? 'blur(10px)' : 'none'
        }}>
          {/* Avatar */}
          <div style={{ padding: '0 20px', height: 52, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -44, left: 20,
              width: 88, height: 88, borderRadius: '50%',
              border: isDark ? `4px solid #1E293B` : '4px solid white', overflow: 'hidden',
              background: profile?.photo_url ? 'transparent' : themeColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, boxShadow: '0 4px 16px rgba(0,0,0,0.18)', zIndex: 10
            }}>
              {profile?.photo_url
                ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{ width: 44, height: 44, color: 'white' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>` }} />}
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '4px 20px 16px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: textColor, marginBottom: 2 }}>{profile?.full_name || 'Nom complet'}</h1>
            {(profile?.title || profile?.job_title) && <p style={{ fontSize: 13, color: themeColor, fontWeight: 700, marginBottom: 12 }}>{profile.title || profile.job_title}</p>}
            
            {profile?.bio && (
              <div style={{ 
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderRadius: 16,
                padding: '14px',
                border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.03)',
                fontSize: 14,
                color: textColor,
                lineHeight: 1.6,
                position: 'relative',
                overflow: 'hidden',
                maxHeight: isBioExpanded ? 'none' : '100px'
              }}>
                {profile.bio.split('\n').map((line, i) => {
                  const isList = line.trim().startsWith('-');
                  return (
                    <div key={i} style={{ 
                      marginBottom: 8, 
                      fontWeight: (i === 0 && !isList) ? 600 : 400,
                      display: isList ? 'flex' : 'block',
                      gap: isList ? '8px' : '0',
                      color: (i === 0 && !isList) ? (isDark ? '#F8FAFC' : '#1A1265') : 'inherit'
                    }}>
                      {isList && <span style={{ color: themeColor, fontWeight: 900 }}>•</span>}
                      <span>
                        {isList ? line.trim().substring(1).trim().split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                          if (part.match(/https?:\/\/[^\s]+/)) return <a key={index} href={part} target="_blank" rel="noreferrer" style={{ color: themeColor, textDecoration: 'underline' }}>{part}</a>;
                          return part;
                        }) : line.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
                          if (part.match(/https?:\/\/[^\s]+/)) return <a key={index} href={part} target="_blank" rel="noreferrer" style={{ color: themeColor, textDecoration: 'underline' }}>{part}</a>;
                          return part;
                        })}
                      </span>
                    </div>
                  );
                })}
                
                {!isBioExpanded && profile.bio.length > 150 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '40px',
                    background: `linear-gradient(transparent, ${isDark ? '#1E293B' : '#F8FAFC'})`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    paddingBottom: '4px'
                  }}>
                    <button 
                      onClick={() => setIsBioExpanded(true)}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: themeColor, 
                        fontSize: 11, 
                        fontWeight: 800, 
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      Lire la suite ↓
                    </button>
                  </div>
                )}
              </div>
            )}
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .5s ease' }}>
          {(() => {
            const sections = profile?.section_order || ['bio', 'contact_buttons', 'links', 'products', 'business_info'];
            
            const renderers = {
              contact_buttons: () => (profile?.phone || profile?.email) && (
                <div key="contact_buttons" style={{ display: 'flex', gap: 10 }}>
                  {profile?.phone && (
                    <a className="pl" href={`tel:${profile.phone.toString().replace(/\s+/g, '')}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: cardBg, borderRadius: 16, textDecoration: 'none', color: textColor, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', fontWeight: 700, fontSize: 14 }}>
                      <span style={{ width: 18, height: 18, color: themeColor, display: 'flex' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === 'phone')?.svg }} /> Appeler
                    </a>
                  )}
                  {profile?.email && (
                    <a className="pl" href={`mailto:${profile.email}`} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px', background: cardBg, borderRadius: 16, textDecoration: 'none', color: textColor, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)', fontWeight: 700, fontSize: 14 }}>
                      <span style={{ width: 18, height: 18, color: themeColor, display: 'flex' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === 'email')?.svg }} /> Email
                    </a>
                  )}
                </div>
              ),
              links: () => (
                <div key="links" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {activeLinks.map(link => {
                    const rawValue = profile[link.id] || profile?.socials?.[link.id];
                    const linkValue = (typeof rawValue === 'object' && rawValue !== null) ? rawValue.value : rawValue;
                    const subText = (typeof rawValue === 'object' && rawValue !== null) ? rawValue.subtitle : '';
                    if (!linkValue) return null;
                    return (
                      <a key={link.id} className="pl" href={link.getUrl(linkValue)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: cardBg, borderRadius: 16, textDecoration: 'none', color: textColor, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                        <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: link.id === 'snapchat' ? link.color : (isDark ? 'rgba(255,255,255,0.05)' : link.color + '18'), display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: `<div style="width:22px;height:22px;color:${link.id === 'snapchat' ? '#000000' : (link.iconColor || link.color)}">${link.svg}</div>` }} />
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 700, fontSize: 15, color: textColor }}>{link.label}</div>
                          {subText && <div style={{ fontSize: 12, color: subTextColor, marginTop: 2 }}>{subText}</div>}
                        </div>
                        <span style={{ color: isDark ? '#475569' : '#CBD5E1', fontSize: 18 }}>→</span>
                      </a>
                    );
                  })}
                  {activeCustomLinks.map(link => (
                    <a key={link.id} className="pl" href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', background: cardBg, borderRadius: 16, textDecoration: 'none', color: textColor, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', border: isDark ? 'none' : '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10 }}>
                        <div style={{ width: '100%', height: '100%', color: themeColor, display: 'flex' }} dangerouslySetInnerHTML={{ __html: LINK_ICONS.find(i => i.id === link.iconId || i.emoji === link.emoji)?.svg || LINK_ICONS[0].svg }} />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{link.label || link.title}</span>
                      <span style={{ color: isDark ? '#475569' : '#CBD5E1', fontSize: 18 }}>→</span>
                    </a>
                  ))}
                </div>
              ),
              products: () => profile?.show_products && profile?.products?.length > 0 && (
                <div key="products" style={{ background: cardBg, borderRadius: 24, padding: 20, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: themeColor + '15', color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                        </div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: textColor, margin: 0 }}>Notre Boutique</h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {profile.products.map(p => (
                            <div key={p.id} className="pl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 16, padding: 12, display: 'flex', gap: 12, alignItems: 'center', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F1F5F9' }}>
                                <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', background: '#DDD', flexShrink: 0 }}>
                                    {p.image_url ? <img src={p.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AAA' }}>📦</div>}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontWeight: 700, fontSize: 14, color: textColor, marginBottom: 2 }}>{p.name}</div>
                                    <div style={{ fontSize: 13, fontWeight: 900, color: themeColor }}>{p.price}</div>
                                </div>
                                {p.action_type === 'link' ? (
                                    <a href={p.link_url} target="_blank" rel="noreferrer" style={{ background: themeColor, color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12 }}>Voir</a>
                                ) : (
                                    <button 
                                        onClick={() => {
                                            let waNumber = '';
                                            const pWaType = p.wa_type || 'personal'; // default to personal if not set

                                            if (pWaType === 'personal') {
                                                waNumber = (profile.socials?.whatsapp?.value || profile.phone || '').toString().replace(/\D/g, '');
                                            } else if (pWaType === 'business') {
                                                waNumber = (profile.socials?.whatsapp_business?.value || profile.socials?.whatsapp?.value || profile.phone || '').toString().replace(/\D/g, '');
                                            } else if (pWaType === 'custom' && p.wa_number) {
                                                waNumber = p.wa_number.replace(/\D/g, '');
                                            } else {
                                                // Fallback to legacy global logic if product logic fails
                                                if (profile.wa_order_type === 'whatsapp_social' && profile.socials?.whatsapp?.value) waNumber = profile.socials.whatsapp.value.replace(/\D/g, '');
                                                else if (profile.wa_order_type === 'business' && profile.socials?.whatsapp_business?.value) waNumber = profile.socials.whatsapp_business.value.replace(/\D/g, '');
                                                else if (profile.wa_order_type === 'custom' && profile.business_whatsapp_number) waNumber = profile.business_whatsapp_number.replace(/\D/g, '');
                                                else waNumber = (profile.phone || '').toString().replace(/\D/g, '');
                                            }

                                            const msg = `Bonjour, je souhaite commander "${p.name}" (${p.price}) vu sur votre profil NFCrafter.`;
                                            window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                                        }}
                                        style={{ background: '#25D366', color: 'white', border: 'none', padding: '8px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                                    >Commander</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
              ),
              business_info: () => (profile?.show_location || profile?.show_hours) && (
                <div key="business_info" style={{ background: cardBg, borderRadius: 24, padding: 20, boxShadow: isDark ? '0 10px 30px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.03)', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)' }}>
                    {profile.show_location && profile.location_address && (
                        <div style={{ marginBottom: profile.show_hours ? 20 : 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                <div style={{ width: 32, height: 32, borderRadius: 8, background: themeColor + '15', color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>` }} />
                                <h3 style={{ fontSize: 15, fontWeight: 800, color: textColor, margin: 0 }}>Nous trouver</h3>
                            </div>
                            <div style={{ background: isDark ? 'rgba(255,255,255,0.03)' : '#F8FAFC', borderRadius: 16, padding: 14, border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #F1F5F9' }}>
                                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>{profile.location_address}</div>
                                {profile.location_map_url && <a href={profile.location_map_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '10px', background: 'white', color: '#111', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>📍 Ouvrir dans Maps</a>}
                            </div>
                        </div>
                    )}
                    {profile.show_hours && profile.business_hours && (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ width: 32, height: 32, borderRadius: 8, background: themeColor + '15', color: themeColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }} dangerouslySetInnerHTML={{ __html: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` }} />
                                    <h3 style={{ fontSize: 15, fontWeight: 800, color: textColor, margin: 0 }}>Horaires</h3>
                                </div>
                                {openStatus && <div style={{ fontSize: 11, fontWeight: 800, color: openStatus.color, background: openStatus.color + '15', padding: '4px 10px', borderRadius: 10 }}>{openStatus.text}</div>}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map(day => {
                                    const h = profile.business_hours?.[day];
                                    const isToday = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase() === day.toLowerCase();
                                    return (
                                        <div key={day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, opacity: h?.active ? 1 : 0.4, fontWeight: isToday ? 800 : 400 }}>
                                            <span style={{ color: isToday ? themeColor : subTextColor }}>{day}</span>
                                            <span style={{ color: textColor }}>{h?.active ? `${h.open} - ${h.close}` : 'Fermé'}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
              )
            };

            return sections.map(sectionId => renderers[sectionId]?.());
          })()}
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