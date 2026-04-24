// src/lib/utils.js
import { supabase } from './supabase';

/**
 * Génère un ID aléatoire de 6 caractères (chiffres + lettres majuscules)
 * et vérifie qu'il n'existe pas déjà dans la table `cards`.
 */
export async function generateUniqueCardId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    let exists = true;
    let attempts = 0;
    const maxAttempts = 10;

    while (exists && attempts < maxAttempts) {
        id = '';
        for (let i = 0; i < length; i++) {
            id += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const { data, error } = await supabase
            .from('cards')
            .select('card_id')
            .eq('card_id', id)
            .maybeSingle();
        exists = !!data;
        attempts++;
    }
    return id;
}