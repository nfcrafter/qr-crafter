import { supabase } from './supabase.js'

export async function generateUniqueCardId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let cardId = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

    let exists = true
    while (exists) {
        const { data } = await supabase.from('cards').select('card_id').eq('card_id', cardId).single()
        if (!data) exists = false
        else cardId = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    }

    return cardId
}