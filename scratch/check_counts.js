import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bgcamawnqjwbegkbdqln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2FtYXducWp3YmVna2JkcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzgyMTUsImV4cCI6MjA5MjIxNDIxNX0.hmq7cxTNFXS418J8Bp6PS_AIlVA_oyF1NddZWrSZHy8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function countRows() {
    const { count: cardsCount, error: errCards } = await supabase.from('cards').select('*', { count: 'exact', head: true });
    const { count: qrsCount, error: errQrs } = await supabase.from('qr_codes').select('*', { count: 'exact', head: true });
    
    console.log("Database status:");
    console.log("Cards count in 'cards' table:", cardsCount);
    console.log("QR codes count in 'qr_codes' table:", qrsCount);
}

countRows();
