// src/pages/PublicProfile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase.js';

export default function PublicProfile() {
    const { cardId } = useParams();
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [profile, setProfile] = useState(null);
    const [card, setCard] = useState(null);

    useEffect(() => {
        loadCard();
    }, [cardId]);

    async function loadCard() {
        setLoading(true);
        const { data, error } = await supabase
            .from('cards')
            .select('*')
            .eq('card_id', cardId)
            .single();

        if (error || !data) {
            setNotFound(true);
            setLoading(false);
            return;
        }

        setCard(data);
        setProfile(data.admin_profile || {});

        await supabase.from('scan_logs').insert({ card_id: cardId, user_agent: navigator.userAgent });
        setLoading(false);
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EBEBDF' }}>
                <p>Chargement...</p>
            </div>
        );
    }

    if (notFound || card?.status === 'pending') {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#EBEBDF', padding: '24px' }}>
                <img src="/logo.png" alt="NFCrafter" style={{ height: '64px', marginBottom: '24px' }} />
                <h2 style={{ color: '#1A1265', marginBottom: '12px', textAlign: 'center' }}>Carte en cours d'activation</h2>
                <p style={{ color: '#666', textAlign: 'center', maxWidth: '360px', marginBottom: '24px' }}>
                    Cette carte NFCrafter n'est pas encore activée.
                </p>
                <a href="/register" style={{ background: '#1A1265', color: 'white', padding: '12px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
                    Créer mon compte →
                </a>
            </div>
        );
    }

    const themeColor = profile.theme_color || '#1A1265';

    const SOCIAL_LINKS = [
        { key: 'whatsapp', label: 'WhatsApp', color: '#25D366', getUrl: v => `https://wa.me/${v.replace(/\D/g, '')}` },
        { key: 'phone', label: 'Appeler', color: '#1A1265', getUrl: v => `tel:${v}` },
        { key: 'email', label: 'Email', color: '#EA4335', getUrl: v => `mailto:${v}` },
        { key: 'instagram', label: 'Instagram', color: '#E1306C', getUrl: v => v },
        { key: 'facebook', label: 'Facebook', color: '#1877F2', getUrl: v => v },
        { key: 'tiktok', label: 'TikTok', color: '#000000', getUrl: v => v },
        { key: 'twitter', label: 'X', color: '#000000', getUrl: v => v },
        { key: 'linkedin', label: 'LinkedIn', color: '#0A66C2', getUrl: v => v },
        { key: 'youtube', label: 'YouTube', color: '#FF0000', getUrl: v => v },
        { key: 'website', label: 'Site web', color: '#1A1265', getUrl: v => v },
    ];

    const activeLinks = SOCIAL_LINKS.filter(l => profile[l.key]);

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <div style={{ height: '180px', background: profile.banner_url ? `url(${profile.banner_url}) center/cover no-repeat` : themeColor, width: '100%' }} />
            <div style={{ maxWidth: '680px', margin: '0 auto', padding: '0 16px' }}>
                <div style={{ background: 'white', borderRadius: '16px', marginTop: '-20px', marginBottom: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'visible', position: 'relative' }}>
                    <div style={{ padding: '0 20px', position: 'relative', height: '56px' }}>
                        <div style={{
                            position: 'absolute', top: '-48px', left: '20px',
                            width: '96px', height: '96px', borderRadius: '50%',
                            border: '4px solid white', overflow: 'hidden',
                            background: profile.photo_url ? 'transparent' : themeColor,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                        }}>
                            {profile.photo_url ? <img src={profile.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={profile.full_name} /> : '👤'}
                        </div>
                    </div>
                    <div style={{ padding: '8px 20px 16px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a1a', marginBottom: '4px' }}>{profile.full_name || 'Client'}</h1>
                        {profile.title && <p style={{ fontSize: '14px', color: themeColor, fontWeight: '600', marginBottom: '8px' }}>{profile.title}</p>}
                        {profile.bio && <p style={{ fontSize: '14px', color: '#555', lineHeight: '1.6' }}>{profile.bio}</p>}
                    </div>
                    <div style={{ padding: '0 16px 20px' }}>
                        <button onClick={() => {
                            let vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${profile.full_name || ''}\n`;
                            if (profile.phone) vcard += `TEL:${profile.phone}\n`;
                            if (profile.whatsapp) vcard += `TEL;TYPE=WHATSAPP:${profile.whatsapp}\n`;
                            if (profile.email) vcard += `EMAIL:${profile.email}\n`;
                            if (profile.website) vcard += `URL:${profile.website}\n`;
                            vcard += `END:VCARD`;
                            const blob = new Blob([vcard], { type: 'text/vcard' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url; a.download = `${profile.full_name || 'contact'}.vcf`; a.click();
                            URL.revokeObjectURL(url);
                        }} style={{ width: '100%', padding: '14px', background: themeColor, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
                            👤 Enregistrer le contact
                        </button>
                    </div>
                </div>

                {activeLinks.map(link => (
                    <a key={link.key} href={link.getUrl(profile[link.key])} target="_blank" rel="noopener noreferrer" style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: 'white',
                        borderRadius: '14px', textDecoration: 'none', color: '#1a1a1a', marginBottom: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: link.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                            {link.label === 'WhatsApp' && '💬'}
                            {link.label === 'Appeler' && '📞'}
                            {link.label === 'Email' && '✉️'}
                            {link.label === 'Instagram' && '📸'}
                            {link.label === 'Facebook' && '👥'}
                            {link.label === 'TikTok' && '🎵'}
                            {link.label === 'X' && '🐦'}
                            {link.label === 'LinkedIn' && '💼'}
                            {link.label === 'YouTube' && '▶️'}
                            {link.label === 'Site web' && '🌐'}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '15px', flex: 1 }}>{link.label}</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </a>
                ))}

                <div style={{ textAlign: 'center', marginTop: '32px', paddingBottom: '32px' }}>
                    <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>Propulsé par</p>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '28px', opacity: 0.5 }} />
                </div>
            </div>
        </div>
    );
}