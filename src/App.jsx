import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Dashboard from './pages/Dashboard.jsx'
import Creator from './pages/Creator.jsx'
import Login from './pages/Login.jsx'
import Redirect from './pages/Redirect.jsx'

function ProtectedRoute({ session, children }) {
    if (session === null) return <Navigate to="/login" replace />
    if (session === undefined) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div style={{ fontFamily: 'var(--font-body)', color: 'var(--text-light)' }}>Chargement...</div>
        </div>
    )
    return children
}

export default function App() {
    const [session, setSession] = useState(undefined)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session ?? null)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    return (
        <Routes>
            <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
            <Route path="/r/:slug" element={<Redirect />} />
            <Route path="/" element={
                <ProtectedRoute session={session}>
                    <Dashboard />
                </ProtectedRoute>
            } />
            <Route path="/create" element={
                <ProtectedRoute session={session}>
                    <Creator />
                </ProtectedRoute>
            } />
            <Route path="/edit/:id" element={
                <ProtectedRoute session={session}>
                    <Creator />
                </ProtectedRoute>
            } />
        </Routes>
    )
}