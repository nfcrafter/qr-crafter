// src/App.jsx
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

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

    const location = useLocation();

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
        if (!session && !navigator.onLine) {
            const cachedUser = localStorage.getItem('nfc_cached_user');
            if (cachedUser) {
                console.log("[PWA App] Restoring offline session from cached user");
                const parsedUser = JSON.parse(cachedUser);
                setSession({ user: parsedUser });
                setIsAdmin(parsedUser.email === ADMIN_EMAIL);
                return;
            }
        }
        
        setSession(session ?? null)
        if (session) {
            setIsAdmin(session.user.email === ADMIN_EMAIL)
        } else {
            setIsAdmin(false)
        }
    }

            // Hide WhatsApp support on public profiles (both /u/:id and /:slug)
            const isPublicProfile = location.pathname.startsWith('/u/') || 
                (location.pathname !== '/' && 
                 !location.pathname.startsWith('/login') && 
                 !location.pathname.startsWith('/register') && 
                 !location.pathname.startsWith('/dashboard') && 
                 !location.pathname.startsWith('/admin') && 
                 !location.pathname.startsWith('/activate') &&
                 !location.pathname.startsWith('/forgot-password') &&
                 !location.pathname.startsWith('/reset-password'));

            return (
                <>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/u/:cardId" element={<PublicProfile />} />
                        <Route path="/activate" element={<Activate />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />

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

                        <Route path="/:slug" element={<PublicProfile />} />

                        {/* Catch-all */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    {!isPublicProfile && <WhatsAppSupport />}
                </>
            )

}