import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bgcamawnqjwbegkbdqln.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnY2FtYXducWp3YmVna2JkcWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MzgyMTUsImV4cCI6MjA5MjIxNDIxNX0.hmq7cxTNFXS418J8Bp6PS_AIlVA_oyF1NddZWrSZHy8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function manageCards() {
    try {
        console.log("Fetching all cards...");
        const { data: cards, error } = await supabase
            .from('cards')
            .select('card_id, card_name, url_slug, owner_id, status');

        if (error) {
            console.error("Error fetching cards:", error);
            return;
        }

        console.log(`Total cards found: ${cards.length}`);

        const toKeep = [];
        const toDelete = [];

        for (const card of cards) {
            const name = (card.card_name || "").toLowerCase();
            const id = (card.card_id || "").toUpperCase();

            const isAntoine = name.includes("antoine") || name.includes("ahissou");
            const isNelly = name.includes("nelly") || name.includes("akd");
            const isEKFWMCQ7 = id === "EKFWMCQ7";

            if (isAntoine || isNelly || isEKFWMCQ7) {
                toKeep.push(card);
            } else {
                toDelete.push(card);
            }
        }

        console.log("\n--- CARDS TO KEEP ---");
        toKeep.forEach(c => console.log(`KEEP: ID: ${c.card_id} | Name: "${c.card_name}" | Slug: "${c.url_slug}"`));

        console.log(`\n--- CARDS TO DELETE (${toDelete.length}) ---`);
        toDelete.forEach((c, idx) => {
            if (idx < 10 || idx >= toDelete.length - 5) {
                console.log(`DELETE: ID: ${c.card_id} | Name: "${c.card_name}" | Slug: "${c.url_slug}"`);
            } else if (idx === 10) {
                console.log("... [some entries hidden for brevity] ...");
            }
        });

        if (toKeep.length === 0) {
            console.error("\nWARNING: No cards found to keep! Aborting to prevent accidental data loss.");
            return;
        }

        console.log("\nDeleting cards from dependent tables first...");
        
        // Extract IDs to delete
        const deleteIds = toDelete.map(c => c.card_id);

        if (deleteIds.length === 0) {
            console.log("No cards to delete!");
            return;
        }

        // Clean up dependent tables if needed
        console.log("Deleting from 'scan_logs'...");
        const { error: errScan } = await supabase.from('scan_logs').delete().in('card_id', deleteIds);
        if (errScan) console.log("Scan logs delete info:", errScan.message);

        console.log("Deleting from 'feedbacks'...");
        const { error: errFeed } = await supabase.from('feedbacks').delete().in('card_id', deleteIds);
        if (errFeed) console.log("Feedbacks delete info:", errFeed.message);

        console.log("Deleting from 'user_cards'...");
        const { error: errUserCards } = await supabase.from('user_cards').delete().in('card_id', deleteIds);
        if (errUserCards) console.log("User cards delete info:", errUserCards.message);

        console.log("Deleting from 'cards'...");
        const { error: errCards } = await supabase.from('cards').delete().in('card_id', deleteIds);
        if (errCards) {
            console.error("Error deleting from cards table:", errCards);
        } else {
            console.log(`Successfully deleted ${deleteIds.length} cards from 'cards' table!`);
        }

    } catch (e) {
        console.error("Execution error:", e);
    }
}

manageCards();
