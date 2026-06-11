// src/config/company-modules.config.ts

import { ReactNode } from "react";

export interface CompanyModuleConfig {
  id: string;
  label: string;
  description: string;
  iconName: string;
  path: string;
  required: boolean;
  category: 'core' | 'commerce' | 'management' | 'communication' | 'specialized';
}

export interface CompanyTypeConfigData {
  // Remove this line: [x: string]: ReactNode;
  label: string;
  iconName: string;
  color: string;
  modules: CompanyModuleConfig[];
  fields: { name: string; label: string; type: string; placeholder?: string; required?: boolean }[];
  features: {
    onlineBooking?: boolean;
    delivery?: boolean;
    reservations?: boolean;
    menu?: boolean;
    rooms?: boolean;
    appointments?: boolean;
    prescriptions?: boolean;
    catalog?: boolean;
    loyalty?: boolean;
    reviews?: boolean;
    gallery?: boolean;
    events?: boolean;
    jobs?: boolean;
    blog?: boolean;
  };
}

export const COMPANY_TYPES_DATA: Record<string, CompanyTypeConfigData> = {
  restaurant: {
    label: 'Restaurant',
    iconName: 'UtensilsCrossed',
    color: 'from-orange-500/60 to-red-500/60',
    fields: [
      { name: 'cuisine_type', label: 'Type de cuisine', type: 'text', placeholder: 'Italienne, Congolaise, Mixte...' },
      { name: 'delivery_available', label: 'Livraison disponible', type: 'text', placeholder: 'Oui / Non' },
      { name: 'avg_prep_time', label: 'Temps moyen de préparation', type: 'text', placeholder: '30 min' },
      { name: 'tables_count', label: 'Nombre de tables', type: 'number', placeholder: '20' },
      { name: 'reservation_available', label: 'Réservation possible', type: 'text', placeholder: 'Oui / Non' },
      { name: 'price_range', label: 'Gamme de prix', type: 'text', placeholder: '€, €€, €€€' },
      { name: 'specialties', label: 'Spécialités', type: 'textarea', placeholder: 'Plats signature...' },
    ],
    features: {
      menu: true,
      reservations: true,
      delivery: true,
      reviews: true,
      gallery: true,
      events: true,
    },
    modules: [
      { id: 'menu', label: 'Menu Digital', description: 'Gérez votre carte et vos plats', iconName: 'FileText', path: '/dashboard/entreprise/menu', required: true, category: 'core' },
      { id: 'orders', label: 'Commandes', description: 'Suivez les commandes en temps réel', iconName: 'ShoppingBag', path: '/dashboard/entreprise/orders', required: true, category: 'commerce' },
      { id: 'reservations', label: 'Réservations', description: 'Gérez les réservations de tables', iconName: 'Calendar', path: '/dashboard/entreprise/reservations', required: false, category: 'core' },
      { id: 'delivery', label: 'Livraison', description: 'Gérez vos zones de livraison', iconName: 'Truck', path: '/dashboard/entreprise/delivery', required: false, category: 'commerce' },
      { id: 'reviews', label: 'Avis Clients', description: 'Gérez les avis et notes', iconName: 'Star', path: '/dashboard/entreprise/reviews', required: false, category: 'communication' },
      { id: 'gallery', label: 'Galerie Photos', description: 'Photos de vos plats et ambiance', iconName: 'Image', path: '/dashboard/entreprise/gallery', required: false, category: 'communication' },
      { id: 'events', label: 'Événements', description: 'Soirées et événements spéciaux', iconName: 'Music', path: '/dashboard/entreprise/events', required: false, category: 'specialized' },
      { id: 'analytics', label: 'Analytiques', description: 'Statistiques et rapports', iconName: 'BarChart3', path: '/dashboard/entreprise/analytics', required: false, category: 'management' },
      { id: 'cards', label: 'Cartes Membres', description: 'Gérez les cartes de fidélité', iconName: 'CreditCard', path: '/dashboard/entreprise/cards', required: false, category: 'management' },
      { id: 'settings', label: 'Paramètres', description: 'Configuration de l\'établissement', iconName: 'Settings', path: '/dashboard/entreprise/settings', required: true, category: 'management' },
    ],
  },
  
  hotel: {
    label: 'Hôtel',
    iconName: 'Hotel',
    color: 'from-purple-500/60 to-indigo-500/60',
    fields: [
      { name: 'rooms_count', label: 'Nombre de chambres', type: 'number', placeholder: '50' },
      { name: 'room_types', label: 'Types de chambres', type: 'text', placeholder: 'Simple, Double, Suite...' },
      { name: 'online_booking', label: 'Réservation en ligne', type: 'text', placeholder: 'Oui / Non' },
      { name: 'check_in_time', label: 'Heure d\'arrivée', type: 'text', placeholder: '14:00' },
      { name: 'check_out_time', label: 'Heure de départ', type: 'text', placeholder: '12:00' },
      { name: 'amenities', label: 'Équipements', type: 'textarea', placeholder: 'WiFi, Piscine, Spa...' },
    ],
    features: {
      rooms: true,
      onlineBooking: true,
      reviews: true,
      gallery: true,
      events: true,
    },
    modules: [
      { id: 'rooms', label: 'Chambres', description: 'Gérez vos chambres et tarifs', iconName: 'BedDouble', path: '/dashboard/entreprise/rooms', required: true, category: 'core' },
      { id: 'bookings', label: 'Réservations', description: 'Gérez les réservations', iconName: 'Calendar', path: '/dashboard/entreprise/bookings', required: true, category: 'core' },
      { id: 'orders', label: 'Commandes Room Service', description: 'Commandes des clients', iconName: 'ShoppingBag', path: '/dashboard/entreprise/orders', required: false, category: 'commerce' },
      { id: 'reviews', label: 'Avis Clients', description: 'Gérez les avis et notes', iconName: 'Star', path: '/dashboard/entreprise/reviews', required: false, category: 'communication' },
      { id: 'gallery', label: 'Galerie Photos', description: 'Photos de l\'établissement', iconName: 'Image', path: '/dashboard/entreprise/gallery', required: false, category: 'communication' },
      { id: 'events', label: 'Événements', description: 'Conférences et événements', iconName: 'Calendar', path: '/dashboard/entreprise/events', required: false, category: 'specialized' },
      { id: 'analytics', label: 'Analytiques', description: 'Taux d\'occupation et revenus', iconName: 'BarChart3', path: '/dashboard/entreprise/analytics', required: false, category: 'management' },
      { id: 'cards', label: 'Cartes Fidélité', description: 'Programme de fidélité', iconName: 'CreditCard', path: '/dashboard/entreprise/cards', required: false, category: 'management' },
      { id: 'settings', label: 'Paramètres', description: 'Configuration de l\'hôtel', iconName: 'Settings', path: '/dashboard/entreprise/settings', required: true, category: 'management' },
    ],
  },

  clinic: {
    label: 'Clinique',
    iconName: 'HeartPulse',
    color: 'from-red-600/60 to-rose-600/60',
    fields: [
      { name: 'specialties', label: 'Spécialités médicales', type: 'textarea', placeholder: 'Cardiologie, Pédiatrie...' },
      { name: 'beds_count', label: 'Nombre de lits', type: 'number', placeholder: '100' },
      { name: 'emergency', label: 'Service d\'urgence', type: 'text', placeholder: 'Oui / Non' },
      { name: 'insurance_accepted', label: 'Assurances acceptées', type: 'textarea', placeholder: 'Liste des assurances...' },
    ],
    features: {
      appointments: true,
      onlineBooking: true,
    },
    modules: [
      { id: 'appointments', label: 'Rendez-vous', description: 'Gérez les rendez-vous patients', iconName: 'Calendar', path: '/dashboard/entreprise/appointments', required: true, category: 'core' },
      { id: 'patients', label: 'Patients', description: 'Dossier patients', iconName: 'Users', path: '/dashboard/entreprise/patients', required: true, category: 'core' },
      { id: 'prescriptions', label: 'Ordonnances', description: 'Gérez les prescriptions', iconName: 'ClipboardList', path: '/dashboard/entreprise/prescriptions', required: false, category: 'specialized' },
      { id: 'staff', label: 'Personnel', description: 'Gérez le personnel médical', iconName: 'Users', path: '/dashboard/entreprise/staff', required: true, category: 'management' },
      { id: 'analytics', label: 'Analytiques', description: 'Statistiques médicales', iconName: 'BarChart3', path: '/dashboard/entreprise/analytics', required: false, category: 'management' },
      { id: 'cards', label: 'Cartes Personnel', description: 'Badges du personnel', iconName: 'CreditCard', path: '/dashboard/entreprise/cards', required: true, category: 'management' },
      { id: 'settings', label: 'Paramètres', description: 'Configuration de la clinique', iconName: 'Settings', path: '/dashboard/entreprise/settings', required: true, category: 'management' },
    ],
  },
};

// Also export as COMPANY_TYPES_MAP for backward compatibility
export const COMPANY_TYPES_MAP = COMPANY_TYPES_DATA;