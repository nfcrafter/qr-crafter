import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Redirect() {
    const { slug } = useParams()
    const [error, setError] = useState(false)

    useEffect(() => {
        async function resolve() {
            const { data, error } = await supabase
                .from('qr_codes')
                .select('content, type')
                .eq('slug', slug)
                .single()

            if (error || !data) {
                setError(true)
                return
            }

            // Incrémenter le compteur de scans
            await supabase
                .from('qr_codes')
                .update({ scans: data.scans + 1 })
                .eq('slug', slug)

            // Rediriger selon le type
            const c = data.content
            switch (data.type) {
                case 'url':
                    window.location.href = c.url
                    break
                case 'whatsapp':
                    window.location.href = `https://wa.me/${(c.phone || '').replace(/\D/g, '')}${c.message ? `?text=${encodeURIComponent(c.message)}` : ''}`
                    break
                case 'phone':
                    window.location.href = `tel:${c.phone}`
                    break
                case 'sms':
                    window.location.href = `smsto:${c.phone}:${c.message}`
                    break
                case 'email':
                    window.location.href = `mailto:${c.to}?subject=${encodeURIComponent(c.subject || '')}&body=${encodeURIComponent(c.body || '')}`
                    break
                case 'social':
                    window.location.href = c.url
                    break
                case 'wifi':
                case 'vcard':
                case 'text':
                    // Ces types affichent une page d'info
                    window.location.href = `/info/${slug}`
                    break
                default:
                    setError(true)
            }
        }
        resolve()
    }, [slug])

    if (error) return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: 20, textAlign: 'center'
        }}>
            <div style={{ width: 64, height: 64, color: '#94A3B8', marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>` }} />
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '8px' }}>
                QR Code introuvable
            </h2>
            <p style={{ color: 'var(--text-light)' }}>Ce lien n'existe pas ou a été supprimé.</p>
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: '#F8FAFC',
        }}>
            <div style={{ width: 48, height: 48, color: '#6366F1', marginBottom: 16, animation: 'spin 2s linear infinite' }} dangerouslySetInnerHTML={{ __html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` }} />
            <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
            <p style={{ color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
                Redirection en cours...
            </p>
        </div>
    )
}