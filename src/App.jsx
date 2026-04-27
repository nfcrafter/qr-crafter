// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import ClientDashboard from './pages/client/ClientDashboard.jsx'
import PublicProfile from './pages/PublicProfile.jsx'
import CardRedirect from './pages/CardRedirect.jsx'
import WhatsAppSupport from './components/WhatsAppSupport.jsx'
import Activate from './pages/Activate.jsx'
import CardSettings from './pages/admin/CardSettings.jsx'
import CreateCardWizard from './pages/admin/CreateCardWizard.jsx';

function LoadingScreen() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
            <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--primary-light)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: 'var(--text-500)', fontWeight: '500' }}>Chargement...</p>
            </div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )
}

function ProtectedAdmin({ session, isAdmin, children }) {
    if (session === undefined) return <LoadingScreen />
    if (!session) return <Navigate to="/login" replace />
    if (!isAdmin) return <Navigate to="/dashboard" replace />
    return children
}

function ProtectedClient({ session, children }) {
    if (session === undefined) return <LoadingScreen />
    if (!session) return <Navigate to="/login" replace />
    return children
}

export default function App() {
    const [session, setSession] = useState(undefined)
    const [isAdmin, setIsAdmin] = useState(false)
    const ADMIN_EMAIL = 'nfcrafter@gmail.com'

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        })
        return () => subscription.unsubscribe()
    }, [])

    function handleSession(session) {
        setSession(session ?? null)
        if (session) {
            setIsAdmin(session.user.email === ADMIN_EMAIL)
        } else {
            setIsAdmin(false)
        }
    }

    return (
        <>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={
                    session ? (
                        isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
                    ) : <Login />
                } />
                <Route path="/register" element={<Register />} />
                <Route path="/u/:cardId" element={<PublicProfile />} />
                <Route path="/activate" element={<Activate />} />

                {/* Client Routes */}
                <Route path="/dashboard" element={
                    <ProtectedClient session={session}>
                        <ClientDashboard />
                    </ProtectedClient>
                } />

                {/* Admin Routes */}
                <Route path="/admin" element={
                    <ProtectedAdmin session={session} isAdmin={isAdmin}>
                        <AdminDashboard />
                    </ProtectedAdmin>
                } />
                <Route path="/admin/card/:cardId" element={
                    <ProtectedAdmin session={session} isAdmin={isAdmin}>
                        <CardSettings />
                    </ProtectedAdmin>
                } />
                <Route path="/admin/create" element={
                    <ProtectedAdmin session={session} isAdmin={isAdmin}>
                        <CreateCardWizard />
                    </ProtectedAdmin>
                } />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <WhatsAppSupport />
        </>
    )
}