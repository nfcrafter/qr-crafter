import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'

const EMOJI_OPTIONS = ['🔗', '🌐', '📱', '💼', '🎵', '🎬', '📸', '🛍️', '📧', '📞', '💬', '🎮', '📚', '🎨', '🏪', '💰', '🎯', '⭐']

export default function CustomLinks({ profileId }) {
    const [links, setLinks] = useState([])
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [form, setForm] = useState({ title: '', url: '', icon: '🔗' })
    const [saving, setSaving] = useState(false)

    useEffect(() => { loadLinks() }, [profileId])

    async function loadLinks() {
        const { data } = await supabase
            .from('custom_links')
            .select('*')
            .eq('profile_id', profileId)
            .order('position')
        setLinks(data || [])
        setLoading(false)
    }

    async function addLink() {
        if (!form.title.trim() || !form.url.trim()) return
        setSaving(true)
        let url = form.url
        if (!url.startsWith('http')) url = 'https://' + url
        const { error } = await supabase.from('custom_links').insert({
            profile_id: profileId,
            title: form.title.trim(),
            url,
            icon: form.icon,
            position: links.length,
        })
        if (!error) {
            setForm({ title: '', url: '', icon: '🔗' })
            setAdding(false)
            loadLinks()
        }
        setSaving(false)
    }

    async function deleteLink(id) {
        await supabase.from('custom_links').delete().eq('id', id)
        loadLinks()
    }

    if (loading) return <p style={{ color: 'var(--text-light)', fontSize: '13px' }}>Chargement...</p>

    return (
        <div>
            {/* Liste des liens */}
            {links.map(link => (
                <div key={link.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 16px', background: 'var(--bg)',
                    borderRadius: 'var(--radius-md)', marginBottom: '8px',
                    border: '1px solid var(--border)',
                }}>
                    <span style={{ fontSize: '20px' }}>{link.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text)' }}>{link.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {link.url}
                        </div>
                    </div>
                    <button onClick={() => deleteLink(link.id)} style={{
                        background: 'transparent', border: 'none', color: '#e53935',
                        cursor: 'pointer', fontSize: '16px', padding: '4px',
                    }}>🗑</button>
                </div>
            ))}

            {/* Formulaire ajout */}
            {adding ? (
                <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginTop: '8px' }}>
                    {/* Sélecteur emoji */}
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-light)', marginBottom: '6px', display: 'block' }}>Icône</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {EMOJI_OPTIONS.map(emoji => (
                                <button key={emoji} onClick={() => setForm(f => ({ ...f, icon: emoji }))}
                                    style={{
                                        width: '36px', height: '36px', fontSize: '18px',
                                        border: form.icon === emoji ? '2px solid var(--accent)' : '1px solid var(--border)',
                                        borderRadius: '8px', background: form.icon === emoji ? 'var(--accent-light)' : 'white',
                                        cursor: 'pointer',
                                    }}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="field">
                        <label>Titre du lien *</label>
                        <input type="text" placeholder="ex: Mon portfolio, Ma boutique..."
                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        />
                    </div>
                    <div className="field">
                        <label>URL *</label>
                        <input type="text" placeholder="https://..."
                            value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn-ghost" onClick={() => setAdding(false)} style={{ flex: 1 }}>
                            Annuler
                        </button>
                        <button className="btn-primary" onClick={addLink} disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
                            {saving ? 'Ajout...' : 'Ajouter'}
                        </button>
                    </div>
                </div>
            ) : (
                <button onClick={() => setAdding(true)} style={{
                    width: '100%', padding: '12px',
                    border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)',
                    background: 'transparent', cursor: 'pointer',
                    color: 'var(--accent)', fontSize: '14px', fontWeight: '600',
                    marginTop: '8px', transition: 'all 0.2s',
                }}>
                    ＋ Ajouter un lien personnalisé
                </button>
            )}
        </div>
    )
}