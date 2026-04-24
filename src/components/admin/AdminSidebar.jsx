import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'

const FOLDER_COLORS = [
    '#1A1265', '#7C3AED', '#0A66C2', '#E53935',
    '#F59E0B', '#25D366', '#E1306C', '#1a1a1a',
]

export default function AdminSidebar({ onFolderSelect, selectedFolder }) {
    const navigate = useNavigate()
    const [folders, setFolders] = useState([])
    const [showNewFolder, setShowNewFolder] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [newFolderColor, setNewFolderColor] = useState('#1A1265')
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 })

    useEffect(() => { loadFolders(); loadStats() }, [])

    async function loadFolders() {
        const { data } = await supabase.from('folders').select('*').order('created_at')
        setFolders(data || [])
    }

    async function loadStats() {
        const { data } = await supabase.from('cards').select('status')
        if (!data) return
        setStats({
            total: data.length,
            active: data.filter(c => c.status === 'active').length,
            pending: data.filter(c => c.status === 'pending').length,
        })
    }

    async function createFolder() {
        if (!newFolderName.trim()) return
        const { error } = await supabase.from('folders').insert({
            name: newFolderName.trim(),
            color: newFolderColor,
        })
        if (!error) {
            setNewFolderName('')
            setNewFolderColor('#1A1265')
            setShowNewFolder(false)
            loadFolders()
        }
    }

    async function deleteFolder(id, e) {
        e.stopPropagation()
        if (!window.confirm('Supprimer ce dossier ? Les cartes ne seront pas supprimées.')) return
        await supabase.from('folders').delete().eq('id', id)
        if (selectedFolder === id) onFolderSelect(null, null)
        loadFolders()
    }

    return (
        <aside style={{
            width: '240px', minHeight: '100vh',
            background: 'var(--bg-white)',
            borderRight: '1px solid var(--border)',
            display: 'flex', flexDirection: 'column',
            flexShrink: 0, position: 'sticky',
            top: 0, height: '100vh', overflowY: 'auto',
        }}>

            {/* Logo */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/logo.png" alt="NFCrafter" style={{ height: '32px' }} />
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '15px', color: 'var(--accent)' }}>
                            NFCrafter
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-light)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Admin
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats mini */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                    { label: 'Total', value: stats.total, color: 'var(--accent)' },
                    { label: 'Actives', value: stats.active, color: '#2e7d32' },
                    { label: 'Attente', value: stats.pending, color: '#e65100' },
                ].map(s => (
                    <div key={s.label} style={{ textAlign: 'center', padding: '8px 4px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)' }}>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: s.color, fontFamily: 'var(--font-display)' }}>{s.value}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-light)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Navigation */}
            <div style={{ padding: '12px 8px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 8px', marginBottom: '4px' }}>
                    Navigation
                </p>
                {[
                    { label: 'Toutes les cartes', icon: '💳', filter: null },
                    { label: 'Actives', icon: '✅', filter: 'active' },
                    { label: 'En attente', icon: '⏳', filter: 'pending' },
                ].map(item => (
                    <button key={item.label} onClick={() => onFolderSelect(null, item.filter)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '9px 10px', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '13px',
                            fontFamily: 'var(--font-body)', fontWeight: '500',
                            background: 'transparent', color: 'var(--text-light)',
                            transition: 'all 0.15s', textAlign: 'left', marginBottom: '2px',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg)'; e.currentTarget.style.color = 'var(--text)' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                    >
                        <span>{item.icon}</span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.filter === 'active' && <span style={{ fontSize: '11px', background: '#e8f5e9', color: '#2e7d32', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>{stats.active}</span>}
                        {item.filter === 'pending' && <span style={{ fontSize: '11px', background: '#fff3e0', color: '#e65100', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>{stats.pending}</span>}
                        {!item.filter && <span style={{ fontSize: '11px', background: 'var(--accent-light)', color: 'var(--accent)', padding: '1px 6px', borderRadius: '10px', fontWeight: '600' }}>{stats.total}</span>}
                    </button>
                ))}
            </div>

            {/* Dossiers */}
            <div style={{ padding: '0 8px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 4px' }}>
                    <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        Dossiers
                    </p>
                    <button onClick={() => setShowNewFolder(s => !s)} style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: '18px', color: 'var(--accent)', lineHeight: 1,
                    }}>
                        {showNewFolder ? '✕' : '+'}
                    </button>
                </div>

                {/* Form nouveau dossier */}
                {showNewFolder && (
                    <div style={{ padding: '10px', background: 'var(--bg)', borderRadius: 'var(--radius-md)', marginBottom: '8px', border: '1px solid var(--border)' }}>
                        <input type="text" placeholder="Nom du dossier"
                            value={newFolderName}
                            onChange={e => setNewFolderName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && createFolder()}
                            style={{ fontSize: '13px', marginBottom: '8px' }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {FOLDER_COLORS.map(c => (
                                <button key={c} onClick={() => setNewFolderColor(c)} style={{
                                    width: '22px', height: '22px', borderRadius: '50%', background: c,
                                    border: newFolderColor === c ? '2px solid var(--text)' : '2px solid transparent',
                                    cursor: 'pointer', padding: 0,
                                }} />
                            ))}
                        </div>
                        <button onClick={createFolder} style={{
                            width: '100%', padding: '7px', background: 'var(--accent)', color: 'white',
                            border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                            fontSize: '12px', fontWeight: '600',
                        }}>
                            Créer
                        </button>
                    </div>
                )}

                {/* Liste dossiers */}
                {folders.map(folder => (
                    <button key={folder.id} onClick={() => onFolderSelect(folder.id, null)}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '9px 10px', borderRadius: 'var(--radius-md)',
                            border: 'none', cursor: 'pointer', fontSize: '13px',
                            fontFamily: 'var(--font-body)', fontWeight: '500',
                            background: selectedFolder === folder.id ? 'var(--accent-light)' : 'transparent',
                            color: selectedFolder === folder.id ? 'var(--accent)' : 'var(--text-light)',
                            transition: 'all 0.15s', textAlign: 'left', marginBottom: '2px',
                        }}
                        onMouseEnter={e => {
                            if (selectedFolder !== folder.id) {
                                e.currentTarget.style.background = 'var(--bg)'
                                e.currentTarget.style.color = 'var(--text)'
                            }
                        }}
                        onMouseLeave={e => {
                            if (selectedFolder !== folder.id) {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = 'var(--text-light)'
                            }
                        }}
                    >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: folder.color, flexShrink: 0 }} />
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📁 {folder.name}
                        </span>
                        <span onClick={e => deleteFolder(folder.id, e)} style={{
                            fontSize: '11px', color: '#e53935', opacity: 0,
                            padding: '2px 4px', borderRadius: '4px', cursor: 'pointer',
                        }}
                            onMouseEnter={e => e.currentTarget.style.opacity = 1}
                            onMouseLeave={e => e.currentTarget.style.opacity = 0}
                        >
                            ✕
                        </span>
                    </button>
                ))}

                {folders.length === 0 && !showNewFolder && (
                    <p style={{ fontSize: '12px', color: 'var(--text-light)', padding: '8px 10px', fontStyle: 'italic' }}>
                        Aucun dossier. Cliquez + pour créer.
                    </p>
                )}
            </div>

            {/* Déconnexion */}
            <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
                <button onClick={async () => { await supabase.auth.signOut(); navigate('/login') }}
                    style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '9px 10px', borderRadius: 'var(--radius-md)',
                        border: 'none', cursor: 'pointer', fontSize: '13px',
                        fontFamily: 'var(--font-body)', fontWeight: '500',
                        background: 'transparent', color: 'var(--text-light)',
                        transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#fff5f5'; e.currentTarget.style.color = '#e53935' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-light)' }}
                >
                    🚪 Déconnexion
                </button>
            </div>
        </aside>
    )
}