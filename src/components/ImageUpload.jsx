// src/components/ImageUpload.jsx
// Upload image to Supabase Storage and return public URL
import { useState, useRef } from 'react'
import { supabase } from '../lib/supabase.js'

export default function ImageUpload({ label, value, onChange, bucket = 'avatars', shape = 'rect' }) {
    const [uploading, setUploading] = useState(false)
    const inputRef = useRef(null)

    async function handleFile(e) {
        const file = e.target.files?.[0]
        if (!file) return

        const maxSize = (bucket === 'banners') ? 5 * 1024 * 1024 : 2 * 1024 * 1024
        const maxSizeLabel = (bucket === 'banners') ? '5 Mo' : '2 Mo'

        if (file.size > maxSize) { 
            alert(`Fichier trop lourd (max ${maxSizeLabel} pour ce type d'image)`)
            return 
        }

        setUploading(true)
        try {
            const ext = file.name.split('.').pop()
            const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
            const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
            if (upErr) throw upErr
            const { data } = supabase.storage.from(bucket).getPublicUrl(path)
            onChange(data.publicUrl)
        } catch (err) {
            alert('Erreur upload : ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const isCircle = shape === 'circle'

    return (
        <div className="field">
            <label>{label}</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Preview */}
                <div onClick={() => inputRef.current?.click()} style={{
                    width: isCircle ? 72 : 120, height: isCircle ? 72 : 68, flexShrink: 0,
                    borderRadius: isCircle ? '50%' : 12,
                    background: value ? 'transparent' : '#EEF2FF',
                    border: '2px dashed #CBD5E1', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', position: 'relative', transition: '.2s'
                }}>
                    {value
                        ? <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <span style={{ fontSize: 28 }}>{isCircle ? '👤' : '🖼️'}</span>}
                    <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0, transition: '.2s',
                        borderRadius: isCircle ? '50%' : 10,
                    }} className="img-overlay">
                        <span style={{ color: 'white', fontSize: 18 }}>✏️</span>
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
                        style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #E2E8F0', background: 'white', color: '#1A1265', fontWeight: 700, fontSize: 13, cursor: uploading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                        {uploading ? '⏳ Envoi...' : '📁 Choisir un fichier'}
                    </button>
                    {value && (
                        <button type="button" onClick={() => onChange('')}
                            style={{ marginTop: 8, padding: '6px 14px', borderRadius: 8, border: 'none', background: '#FEE2E2', color: '#DC2626', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'block' }}>
                            Supprimer
                        </button>
                    )}
                    <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>PNG, JPG, WEBP · max {bucket === 'banners' ? '5 Mo' : '2 Mo'}</p>
                </div>
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <style>{`.img-overlay { opacity: 0 } div:hover > .img-overlay { opacity: 1 }`}</style>
        </div>
    )
}
