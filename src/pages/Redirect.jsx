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
            alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
        }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent)', marginBottom: '8px' }}>
                QR Code introuvable
            </h2>
            <p style={{ color: 'var(--text-light)' }}>Ce lien n'existe pas ou a été supprimé.</p>
        </div>
    )

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', background: 'var(--bg)',
        }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
                Redirection en cours...
            </p>
        </div>
    )
}