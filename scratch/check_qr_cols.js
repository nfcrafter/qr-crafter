
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://bgcamawnqjwbegkbdqln.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2FtYXducWp3YmVna2JkcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzgyMTUsImV4cCI6MjA5MjIxNDIxNX0.hmq7cxTNFXS418J8Bp6PS_AIlVA_oyF1NddZWrSZHy8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function check() {
    const { data, error } = await supabase.from('qr_codes').select('*').limit(1)
    console.log("QR Codes Columns:", data ? Object.keys(data[0]) : "Empty table")
    if (error) console.error("Error:", error)
}

check()
