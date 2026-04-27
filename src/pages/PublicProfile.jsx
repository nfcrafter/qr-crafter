// src/pages/PublicProfile.jsx
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

const SOCIAL_NETWORKS = [
    { id: 'whatsapp', icon: 'https://cdn-icons-png.flaticon.com/512/3670/3670051.png', label: 'WhatsApp', getUrl: v => `https://wa.me/${v.replace(/\D/g, '')}` },
    { id: 'instagram', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png', label: 'Instagram', getUrl: v => `https://instagram.com/${v.replace('@', '')}` },
    { id: 'facebook', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png', label: 'Facebook', getUrl: v => v },
    { id: 'tiktok', icon: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png', label: 'TikTok', getUrl: v => `https://tiktok.com/@${v.replace('@', '')}` },
    { id: 'linkedin', icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png', label: 'LinkedIn', getUrl: v => v },
    { id: 'twitter', icon: 'https://cdn-icons-png.flaticon.com/512/3256/3256013.png', label: 'Twitter', getUrl: v => `https://twitter.com/${v.replace('@', '')}` },
    { id: 'youtube', icon: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png', label: 'YouTube', getUrl: v => v }
];

export default function PublicProfile({ previewData }) {
    const { cardId } = useParams()
    const [card, setCard] = useState(null)
    const [profile, setProfile] = useState(previewData || null)
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
        const { data: cardData, error } = await supabase
            .from('cards').select('*').eq('card_id', cardId).single()
        
        if (error || !cardData) { setNotFound(true); setLoading(false); return }

        // Redirection if type is URL
        if (cardData.type_data?.qr_type === 'url' && cardData.type_data?.url) {
            window.location.href = cardData.type_data.url;
            return;
        }

        setCard(cardData)
        setProfile(cardData.type_data || {})
        
        // Log scan
        supabase.from('scan_logs').insert({ card_id: cardId, user_agent: navigator.userAgent }).then()
        setLoading(false)
    }

    function generateVCard() {
        if (!profile) return
        let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.full_name || ''}\nTITLE:${profile.job_title || ''}\nNOTE:${profile.bio || ''}\n`;
        
        // Add social links to notes or specific fields if possible
        if (profile.socials) {
            Object.entries(profile.socials).forEach(([key, val]) => {
                if (val) vcard += `X-SOCIALPROFILE;TYPE=${key}:${val}\n`;
            });
        }
        
        vcard += `END:VCARD`;
        const blob = new Blob([vcard], { type: 'text/vcard' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = `${profile.full_name || 'contact'}.vcf`; a.click()
    }

    if (loading) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #E2E8F0', borderTopColor: '#1A1265', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (notFound && !previewData) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '80px', margin: 0, color: '#1A1265' }}>404</h1>
                <p style={{ fontSize: '18px', color: '#64748B' }}>Ce profil n'existe pas ou a été désactivé.</p>
            </div>
        </div>
    )

    const primaryColor = profile?.primaryColor || '#1A1265'

    return (
        <div style={{ minHeight: '100vh', background: '#F1F5F9', paddingBottom: '80px', fontFamily: "'Inter', sans-serif" }}>
            {/* Banner */}
            <div style={{ height: '200px', background: primaryColor, position: 'relative' }}>
                {profile?.banner_url && <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
            </div>

            <div style={{ maxWidth: '480px', margin: '-60px auto 0', padding: '0 20px', position: 'relative' }}>
                {/* Profile Info */}
                <div style={{ background: 'white', borderRadius: '32px', padding: '60px 24px 32px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', position: 'relative' }}>
                    <div style={{ 
                        position: 'absolute', top: '-50px', left: '50%', transform: 'translateX(-50%)',
                        width: '100px', height: '100px', borderRadius: '30px', border: '5px solid white',
                        background: '#eee', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
                    }}>
                        <img src={profile?.photo_url || `https://ui-avatars.com/api/?name=${profile?.full_name || 'U'}&background=random`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </div>

                    <h1 style={{ fontSize: '24px', fontWeight: '900', color: '#1A1265', marginBottom: '4px' }}>{profile?.full_name || 'Nom complet'}</h1>
                    <p style={{ color: primaryColor, fontWeight: '700', fontSize: '14px', marginBottom: '16px' }}>{profile?.job_title || 'Profession / Poste'}</p>
                    <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>{profile?.bio || 'Aucune description disponible.'}</p>

                    <button 
                        onClick={generateVCard}
                        style={{ 
                            width: '100%', padding: '16px', borderRadius: '16px', border: 'none', 
                            background: primaryColor, color: 'white', fontWeight: '800', 
                            fontSize: '15px', cursor: 'pointer', boxShadow: `0 10px 25px ${primaryColor}44` 
                        }}
                    >
                        Enregistrer le contact
                    </button>
                </div>

                {/* Social Links List */}
                <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {profile?.socials && Object.entries(profile.socials).map(([key, value]) => {
                        if (!value) return null;
                        const net = SOCIAL_NETWORKS.find(n => n.id === key);
                        if (!net) return null;
                        return (
                            <a 
                                key={key} href={net.getUrl(value)} target="_blank" rel="noreferrer"
                                style={{ 
                                    background: 'white', padding: '16px 20px', borderRadius: '20px', 
                                    display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9'
                                }}
                            >
                                <img src={net.icon} style={{ width: '40px', height: '40px' }} alt="" />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '800', color: '#1A1265', fontSize: '15px' }}>{net.label}</div>
                                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>{value}</div>
                                </div>
                                <div style={{ color: '#CBD5E1' }}>→</div>
                            </a>
                        );
                    })}

                    {/* Custom Links */}
                    {profile?.customLinks?.map((link, idx) => (
                        <a 
                            key={idx} href={link.url} target="_blank" rel="noreferrer"
                            style={{ 
                                background: 'white', padding: '16px 20px', borderRadius: '20px', 
                                display: 'flex', alignItems: 'center', gap: '16px', textDecoration: 'none',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9'
                            }}
                        >
                            <div style={{ width: '40px', height: '40px', background: '#F1F5F9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔗</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '800', color: '#1A1265', fontSize: '15px' }}>{link.label}</div>
                            </div>
                            <div style={{ color: '#CBD5E1' }}>→</div>
                        </a>
                    ))}
                </div>

                {/* Footer Logo */}
                <div style={{ textAlign: 'center', marginTop: '60px' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                        <img src="/logo.png" style={{ height: '24px' }} alt="" />
                        <span style={{ fontWeight: '900', color: '#1A1265' }}>QR CRAFTER</span>
                    </div>
                </div>
            </div>
        </div>
    )
}