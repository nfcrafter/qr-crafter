// src/constants/demoProfiles.js

export const DEMO_PROFILES = [
  {
    id: 'romuald',
    full_name: 'Romuald K.',
    title: "Architecte d'intérieur",
    bio: "Créateur d'espaces de vie d'exception à Cotonou. Allier esthétique, fonctionnalité et innovation pour vos villas et bureaux.",
    phone: '22969473921',
    email: 'romuald@nfcrafter.com',
    theme_color: '#111827',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/black-profile.png',
    banner_url: '/gallery-1.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Conception Plan 3D', price: '150 000 FCFA', image_url: '/gallery-1.jpg', button_text: 'Réserver', action_type: 'whatsapp' },
      { id: 2, name: 'Consultation Chantier (1h)', price: '50 000 FCFA', image_url: '/gallery-2.jpg', button_text: 'Commander', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Architecture 3D", "Design d'intérieur", "Suivi de chantier"],
    show_gallery: true,
    gallery: [
      { id: 1, url: '/gallery-1.jpg' },
      { id: 2, url: '/gallery-2.jpg' },
      { id: 3, url: '/gallery-3.jpg' }
    ],
    instagram: 'romuald_arch',
    linkedin: 'romuald-k',
    website: 'https://nfcrafter.com'
  },
  {
    id: 'clara',
    full_name: 'Dr. Clara M.',
    title: 'Chirurgien Dentiste',
    bio: "Cabinet dentaire Élite à Cotonou. Soins dentaires de haute technologie, orthodontie et esthétique du sourire.",
    phone: '22969473921',
    email: 'clara.m@nfcrafter.com',
    theme_color: '#06B6D4',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/white-profile.png',
    banner_url: '/gallery-4.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Consultation & Bilan', price: '15 000 FCFA', image_url: '/gallery-4.jpg', button_text: 'Réserver', action_type: 'whatsapp' },
      { id: 2, name: 'Détartrage Ultrasons', price: '30 000 FCFA', image_url: '/gallery-5.jpg', button_text: 'Réserver', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Chirurgie", "Implantologie", "Blanchiment"],
    show_gallery: true,
    gallery: [
      { id: 1, url: '/gallery-4.jpg' },
      { id: 2, url: '/gallery-5.jpg' }
    ],
    instagram: 'dr_clara_dentist'
  },
  {
    id: 'thomas',
    full_name: 'Thomas L.',
    title: 'Développeur Fullstack',
    bio: "Je traduis vos idées en applications performantes et prêtes à l'emploi (React, Node.js, SaaS). Passionné d'optimisation.",
    phone: '22969473921',
    email: 'thomas@nfcrafter.com',
    theme_color: '#2563EB',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/blue-profile.png',
    banner_url: '/gallery-6.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Création Landing Page', price: '180 000 FCFA', image_url: '/gallery-6.jpg', button_text: 'Commander', action_type: 'whatsapp' },
      { id: 2, name: 'Audit Performance Web', price: '90 000 FCFA', image_url: '/gallery-7.jpg', button_text: 'Commander', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["React / Next.js", "Node.js", "API Integration"],
    show_gallery: true,
    gallery: [
      { id: 1, url: '/gallery-6.jpg' },
      { id: 2, url: '/gallery-7.jpg' }
    ],
    github: 'thomas-l',
    linkedin: 'thomas-l-dev'
  },
  {
    id: 'antoine',
    full_name: 'Me. Antoine S.',
    title: "Avocat d'Affaires",
    bio: "Conseil juridique pour startups et entreprises. Fiscalité, contrats et propriété intellectuelle à Cotonou.",
    phone: '22969473921',
    email: 'antoine@nfcrafter.com',
    theme_color: '#D97706',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/gold-profile.png',
    banner_url: '/gallery-8.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Consultation Juridique (1h)', price: '60 000 FCFA', image_url: '/gallery-8.jpg', button_text: 'Réserver', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Droit commercial", "Fiscalité", "Startups"],
    linkedin: 'antoine-s'
  },
  {
    id: 'damien',
    full_name: 'Chef Damien B.',
    title: 'Gastronomie & Traiteur',
    bio: "Chef cuisinier à domicile et service traiteur d'exception pour vos événements privés et corporatifs.",
    phone: '22969473921',
    email: 'chef.damien@nfcrafter.com',
    theme_color: '#DC2626',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/red-profile.png',
    banner_url: '/gallery-3.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Buffet Cocktail (par pers.)', price: '15 000 FCFA', image_url: '/gallery-3.jpg', button_text: 'Commander', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Gastronomie", "Traiteur", "Chef à Domicile"],
    show_gallery: true,
    gallery: [
      { id: 1, url: '/gallery-3.jpg' }
    ],
    facebook: 'chef.damien.benin'
  },
  {
    id: 'bio',
    full_name: 'Boutique Bio',
    title: 'Épicerie & Bien-être',
    bio: "Votre boutique santé à Cotonou. Produits 100% bio, locaux et naturels pour votre bien-être au quotidien.",
    phone: '22969473921',
    email: 'contact@boutiquebio.com',
    theme_color: '#059669',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/green-profile.png',
    banner_url: '/gallery-5.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Huile de Coco Vierge (1L)', price: '8 500 FCFA', image_url: '/gallery-5.jpg', button_text: 'Commander', action_type: 'whatsapp' },
      { id: 2, name: 'Miel Sauvage Naturel (1L)', price: '6 000 FCFA', image_url: '/gallery-4.jpg', button_text: 'Commander', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Produits Bio", "Cosmétiques Naturels", "Superaliments"],
    whatsapp: '22969473921'
  },
  {
    id: 'sonia',
    full_name: 'Sonia G.',
    title: 'Photographe & Vidéaste',
    bio: "Capturer vos plus beaux instants. Portraits, mariages, événements et direction artistique.",
    phone: '22969473921',
    email: 'sonia@nfcrafter.com',
    theme_color: '#7C3AED',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/purple-profile.png',
    banner_url: '/gallery-7.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Séance Photo Portrait', price: '40 000 FCFA', image_url: '/gallery-7.jpg', button_text: 'Réserver', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Photographie", "Montage Vidéo", "Direction Artistique"],
    show_gallery: true,
    gallery: [
      { id: 1, url: '/gallery-7.jpg' }
    ],
    instagram: 'sonia_photo'
  },
  {
    id: 'melissa',
    full_name: 'Mélissa K.',
    title: 'Beauty Studio & Spa',
    bio: "Un moment unique de détente et de mise en beauté. Massages, soins du visage et manucure pro.",
    phone: '22969473921',
    email: 'melissa@nfcrafter.com',
    theme_color: '#DB2777',
    backgroundColor: '#f8fafc',
    photo_url: '/assets/cards/pink-profile.png',
    banner_url: '/gallery-2.jpg',
    show_products: true,
    products: [
      { id: 1, name: 'Massage Suédois (1h)', price: '35 000 FCFA', image_url: '/gallery-2.jpg', button_text: 'Réserver', action_type: 'whatsapp' }
    ],
    show_skills: true,
    skills: ["Massothérapie", "Esthétique", "Manucure"],
    instagram: 'melissa_beauty_spa'
  }
];
