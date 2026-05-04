// src/lib/utils.js (adding error translation)

export function translateError(message) {
    if (!message) return '';
    
    const errors = {
        'Invalid login credentials': 'Email ou mot de passe incorrect.',
        'User already registered': 'Cet email est déjà utilisé.',
        'User not found': 'Utilisateur non trouvé.',
        'Email not confirmed': 'Veuillez confirmer votre adresse email.',
        'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères.',
        'Too many requests': 'Trop de tentatives. Veuillez réessayer plus tard.',
        'Network error': 'Erreur réseau. Veuillez vérifier votre connexion.',
        'Email rate limit exceeded': 'Limite d\'envoi d\'emails dépassée. Réessayez plus tard.',
        'Signup confirmations disabled': 'Les inscriptions sont temporairement désactivées.',
        'Invalid token': 'Le lien est invalide ou a expiré.',
        'Email address not found': 'Cette adresse email n\'existe pas dans notre base.',
        'Failed to fetch': 'Impossible de contacter le serveur. Vérifiez votre connexion.',
        'rate limit': 'Trop de tentatives. Veuillez patienter un moment.',
        'Email sending failed': 'L\'envoi de l\'email a échoué. Contactez le support.',
    };

    // Check for partial matches or exact matches
    for (const [key, value] of Object.entries(errors)) {
        if (message.toLowerCase().includes(key.toLowerCase())) {
            return value;
        }
    }

    return message; // Return original if no translation found
}