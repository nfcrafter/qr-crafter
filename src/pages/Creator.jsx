import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Step1Type from '../components/steps/Step1Type.jsx'
import Step2Content from '../components/steps/Step2Content.jsx'
import Step3Appearance from '../components/steps/Step3Appearance.jsx'

function generateSlug() {
    return Math.random().toString(36).substring(2, 8)
}

export default function Creator() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [step, setStep] = useState(1)
    const [qrType, setQrType] = useState(null)
    const [qrContent, setQrContent] = useState({})
    const [qrAppearance, setQrAppearance] = useState({
        dotsType: 'rounded',
        dotsColor: '#1A1265',
        bgColor: '#EBEBDF',
        cornersType: 'extra-rounded',
        cornersDotType: 'dot',
        cornersColor: '#1A1265',
        cornersDotColor: '#1A1265',
        logo: null,
        size: 512,
    })
    const [slug, setSlug] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (id) {
            loadExisting()
        } else {
            setSlug(generateSlug())
        }
    }, [id])

    async function loadExisting() {
        const { data } = await supabase
            .from('qr_codes')
            .select('*')
            .eq('id', id)
            .single()
        if (data) {
            setQrType(data.type)
            setQrContent(data.content || {})
            setQrAppearance(data.appearance || qrAppearance)
            setSlug(data.slug)
            setStep(2)
        }
    }

    const STEPS = [
        { n: 1, label: 'Type de code QR' },
        { n: 2, label: 'Contenu' },
        { n: 3, label: 'Apparence du QR' },
    ]

    function handleSelectType(type) {
        setQrType(type)
        setQrContent({})
        setStep(2)
    }

    async function handleSave() {
        setSaving(true)
        const entry = {
            slug,
            type: qrType,
            name: qrContent.name || 'Sans nom',
            content: qrContent,
            appearance: qrAppearance,
            updated_at: new Date().toISOString(),
        }

        if (id) {
            await supabase.from('qr_codes').update(entry).eq('id', id)
        } else {
            await supabase.from('qr_codes').insert({ ...entry, scans: 0 })
        }

        setSaving(false)
        navigate('/')
    }

    // URL permanente encodée dans le QR
    const QR_BASE_URL = window.location.origin
    const permanentURL = `${QR_BASE_URL}/r/${slug}`

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header stepper */}
            <header style={{
                background: 'var(--bg-white)', borderBottom: '1px solid var(--border)',
                padding: '0 32px', position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div style={{
                    maxWidth: '1100px', margin: '0 auto', height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                        onClick={() => navigate('/')}>
                        <img src="/logo.png" alt="NFCrafter" style={{ height: '32px', width: 'auto' }} />
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '18px', color: 'var(--accent)' }}>
                            NFCrafter
                        </span>
                    </div>

                    {/* Stepper */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {STEPS.map((s, i) => (
                            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '28px', height: '28px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '13px', fontWeight: '700',
                                        background: step > s.n ? 'var(--success)' : step === s.n ? 'var(--accent)' : 'var(--border)',
                                        color: step >= s.n ? 'white' : 'var(--text-light)',
                                    }}>
                                        {step > s.n ? '✓' : s.n}
                                    </div>
                                    <span style={{
                                        fontSize: '13px', fontWeight: step === s.n ? '600' : '400',
                                        color: step === s.n ? 'var(--accent)' : step > s.n ? 'var(--success)' : 'var(--text-light)',
                                    }}>
                                        {s.label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div style={{ width: '40px', height: '1px', background: 'var(--border)', margin: '0 4px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Contenu */}
            <div style={{ flex: 1, maxWidth: '1100px', margin: '0 auto', width: '100%', padding: '32px 16px' }}>
                {step === 1 && <Step1Type onSelect={handleSelectType} />}
                {step === 2 && (
                    <Step2Content
                        type={qrType}
                        content={qrContent}
                        onChange={setQrContent}
                        onBack={() => setStep(1)}
                        onNext={() => setStep(3)}
                        permanentURL={permanentURL}
                    />
                )}
                {step === 3 && (
                    <Step3Appearance
                        type={qrType}
                        content={qrContent}
                        appearance={qrAppearance}
                        onChange={setQrAppearance}
                        onBack={() => setStep(2)}
                        onSave={handleSave}
                        saving={saving}
                        permanentURL={permanentURL}
                    />
                )}
            </div>
        </div>
    )
}