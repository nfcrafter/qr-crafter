import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bgcamawnqjwbegkbdqln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2FtYXducWp3YmVna2JkcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzgyMTUsImV4cCI6MjA5MjIxNDIxNX0.hmq7cxTNFXS418J8Bp6PS_AIlVA_oyF1NddZWrSZHy8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function listCards() {
    try {
        console.log("Fetching cards...");
        const { data: cards, error } = await supabase
            .from('cards')
            .select('card_id, card_name, url_slug, owner_id, status, created_at');

        if (error) {
            console.error("Error fetching cards:", error);
            return;
        }

        console.log(`Found ${cards.length} cards in the database:\n`);
        cards.forEach((card, i) => {
            console.log(`${i+1}. ID: ${card.card_id} | Name: "${card.card_name}" | Slug: "${card.url_slug}" | Status: ${card.status} | Created: ${card.created_at}`);
        });
    } catch (e) {
        console.error("Execution error:", e);
    }
}

listCards();
