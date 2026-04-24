import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
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
            <p style={{ color: 'var(--text-light)' }}>Chargement...</p>
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

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session ?? null)
            if (session) checkAdmin(session.user.email)
        })
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session ?? null)
            if (session) checkAdmin(session.user.email)
        })
        return () => subscription.unsubscribe()
    }, [])

    function checkAdmin(email) {
        // Ton email admin — change ici
        const ADMIN_EMAIL = 'nfcrafter@gmail.com'
        setIsAdmin(email === ADMIN_EMAIL)
    }

    return (
        <>
            <Routes>
                <Route path="/u/:cardId" element={<PublicProfile />} />
                <Route path="/login" element={session ? <Navigate to="/" replace /> : <Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={
                    <ProtectedAdmin session={session} isAdmin={isAdmin}>
                        <AdminDashboard />
                    </ProtectedAdmin>
                } />
                <Route path="/dashboard" element={
                    <ProtectedClient session={session}>
                        <ClientDashboard />
                    </ProtectedClient>
                } />
                <Route path="/" element={
                    session === undefined ? <LoadingScreen /> :
                        !session ? <Navigate to="/login" replace /> :
                            isAdmin ? <Navigate to="/admin" replace /> :
                                <Navigate to="/dashboard" replace />
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
                <Route path="*" element={<Navigate to="/" replace />} />
                <Route path="/activate" element={<Activate />} />
            </Routes>
            <WhatsAppSupport />
        </>
    )
}