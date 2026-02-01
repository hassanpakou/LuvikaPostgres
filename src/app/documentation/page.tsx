// src/app/documentation/page.tsx
'use client';

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Code, Database, Zap, Shield, Globe, 
  Smartphone, Users, Calendar, ShoppingBag, 
  ChevronRight, ExternalLink, Github, 
  ChevronDown, ChevronUp, Search, Filter,
  User, QrCode, CreditCard, BarChart3, Settings,
  HelpCircle, UserCheck, Users2, Store, 
  Calendar as CalendarIcon, MessageSquare, Download
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';

// Type definitions for documentation content
interface DocumentationItem {
  name?: string;
  title?: string;
  description?: string;
  fields?: string[];
  params?: string[];
}

interface DocumentationEndpoint {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  params?: string[];
}

interface DocumentationContent {
  title: string;
  content?: string;
  items?: (string | DocumentationItem)[];
  endpoints?: DocumentationEndpoint[];
}

// Documentation sections
const documentationSections = [
  {
    id: 'user-guide',
    title: 'Guide Utilisateur',
    icon: HelpCircle,
    color: 'from-blue-500 to-cyan-500',
    description: 'Guide étape par étape pour les débutants',
    content: {
      getting_started: {
        title: 'Commencer',
        content: 'Bienvenue sur LUVIKA ! Ce guide vous aidera à comprendre et à utiliser toutes les fonctionnalités de notre plateforme de cartes de visite numériques.',
        items: [
          '1. Créez votre compte - Inscrivez-vous avec votre email',
          '2. Complétez votre profil - Ajoutez vos informations et votre photo',
          '3. Choisissez votre forfait - Version Basic (gratuite) ou fonctionnalités Premium',
          '4. Obtenez votre carte numérique - Partagez votre profil avec NFC ou code QR',
          '5. Démarrez le networking - Connectez-vous avec d\'autres professionnels'
        ]
      },
      for_beginners: {
        title: 'Pour les Complets Débutants',
        content: 'Vous ne savez pas par où commencer ? Suivez ces étapes simples :',
        items: [
          {
            title: 'Étape 1 : Comprendre les Cartes de Visite Numériques',
            description: 'Une carte de visite numérique est comme une carte papier traditionnelle, mais elle est stockée sur votre téléphone et peut être partagée instantanément via NFC ou code QR.'
          },
          {
            title: 'Étape 2 : Créer Votre Profil',
            description: 'Votre profil est votre carte de visite numérique. Ajoutez votre nom, photo, poste, entreprise et coordonnées.'
          },
          {
            title: 'Étape 3 : Partager Votre Carte',
            description: 'Vous pouvez partager votre carte en : touchant les téléphones ensemble (NFC), en scannant les codes QR, ou en envoyant un lien.'
          },
          {
            title: 'Étape 4 : Gérer vos Contacts',
            description: 'Lorsque quelqu\'un consulte votre profil, vous pouvez voir qui a visité et vous connecter avec eux.'
          }
        ]
      },
      common_tasks: {
        title: 'Tâches Courantes',
        items: [
          'Comment créer votre profil',
          'Comment ajouter une photo à votre carte',
          'Comment partager votre carte numérique',
          'Comment suivre qui a consulté votre profil',
          'Comment créer et gérer des événements',
          'Comment mettre à niveau votre forfait',
          'Comment obtenir de l\'aide et du support'
        ]
      }
    }
  },
  {
    id: 'profile-management',
    title: 'Gestion du Profil',
    icon: User,
    color: 'from-green-500 to-emerald-500',
    description: 'Créer et personnaliser votre carte de visite numérique',
    content: {
      creating_profile: {
        title: 'Créer Votre Profil',
        content: 'Votre profil est votre carte de visite numérique. Rendez-le professionnel et complet.',
        items: [
          'Allez dans Tableau de bord → Paramètres',
          'Remplissez vos informations personnelles',
          'Téléversez une photo professionnelle',
          'Ajoutez vos coordonnées',
          'Choisissez les informations à afficher publiquement',
          'Enregistrez vos modifications'
        ]
      },
      profile_sections: {
        title: 'Sections du Profil',
        items: [
          {
            name: 'Informations Personnelles',
            description: 'Votre nom, photo, poste et entreprise',
            fields: ['Nom complet', 'Nom d\'utilisateur', 'Poste', 'Entreprise', 'Biographie']
          },
          {
            name: 'Coordonnées',
            description: 'Comment les gens peuvent vous contacter',
            fields: ['Email', 'Téléphone', 'Adresse', 'Site Web']
          },
          {
            name: 'Réseaux Sociaux',
            description: 'Vos profils sociaux professionnels',
            fields: ['LinkedIn', 'Twitter', 'Instagram', 'GitHub']
          },
          {
            name: 'Détails Professionnels',
            description: 'Vos compétences et expertise',
            fields: ['Compétences', 'Portfolio', 'CV', 'Certificats']
          }
        ]
      },
      visibility_settings: {
        title: 'Confidentialité et Visibilité',
        content: 'Contrôlez les informations visibles au public.',
        items: [
          'Profil public : Visible par tout le monde',
          'Informations privées : Seulement visibles par les personnes que vous approuvez',
          'Demandes de contact : Autoriser les inconnus à vous envoyer un message',
          'Analytics : Suivre qui visite votre profil'
        ]
      }
    }
  },
  {
    id: 'nfc-qr-codes',
    title: 'NFC & Codes QR',
    icon: QrCode,
    color: 'from-purple-500 to-pink-500',
    description: 'Partagez votre carte numérique instantanément',
    content: {
      nfc_cards: {
        title: 'Cartes NFC',
        content: 'Cartes physiques qui redirigent vers votre profil numérique lorsqu\'elles sont tapées.',
        items: [
          'Commandez des cartes NFC depuis votre tableau de bord',
          'Chaque carte a un ID unique',
          'Lorsque quelqu\'un tape la carte, il voit votre profil',
          'Vous pouvez suivre les scans et interactions',
          'Remplacez facilement les cartes perdues'
        ]
      },
      qr_codes: {
        title: 'Partage par Code QR',
        content: 'Générez des codes QR pour votre profil, événements ou produits.',
        items: [
          'Générez le code QR dans Tableau de bord → Code QR',
          'Téléchargez et imprimez le code QR',
          'Partagez numériquement via les applications de messagerie',
          'Suivez les scans et l\'engagement',
          'Personnalisez l\'apparence du code QR'
        ]
      },
      sharing_methods: {
        title: 'Comment Partager Votre Carte',
        items: [
          'Tap NFC : Touchez les téléphones ensemble',
          'Scan QR : Scannez le code QR',
          'Partage de Lien : Envoyez l\'URL de votre profil',
          'Réseaux Sociaux : Partagez sur vos réseaux',
          'Signature Email : Ajoutez à vos emails'
        ]
      }
    }
  },
  {
    id: 'events',
    title: 'Événements',
    icon: CalendarIcon,
    color: 'from-orange-500 to-red-500',
    description: 'Créer et gérer des événements professionnels',
    content: {
      creating_events: {
        title: 'Créer des Événements',
        content: 'Organisez des conférences, webinaires ou meetups.',
        items: [
          'Allez dans Tableau de bord → Événements',
          'Cliquez sur "Créer un Événement"',
          'Remplissez les détails de l\'événement (titre, date, lieu)',
          'Générez un code QR pour l\'enregistrement',
          'Partagez l\'événement avec votre réseau',
          'Suivez les inscriptions et la participation'
        ]
      },
      event_features: {
        title: 'Fonctionnalités des Événements',
        items: [
          {
            name: 'Inscriptions aux Événements',
            description: 'Gérez les participants et suivez les RSVP'
          },
          {
            name: 'Enregistrement par QR',
            description: 'Enregistrement rapide utilisant les codes QR sur le lieu'
          },
          {
            name: 'Analytics des Événements',
            description: 'Voir la participation, l\'engagement et les retours'
          },
          {
            name: 'Promotion d\'Événements',
            description: 'Partagez les événements sur les réseaux sociaux et par email'
          }
        ]
      },
      event_management: {
        title: 'Gestion des Événements',
        content: 'Gardez vos événements organisés et réussis.',
        items: [
          'Surveillez les inscriptions en temps réel',
          'Envoyez des rappels aux participants',
          'Enregistrez les participants lors de l\'événement',
          'Collectez les retours après l\'événement',
          'Analysez la performance de l\'événement'
        ]
      }
    }
  },
  {
    id: 'subscriptions',
    title: 'Abonnements',
    icon: CreditCard,
    color: 'from-indigo-500 to-blue-500',
    description: 'Choisissez le bon forfait pour vos besoins',
    content: {
      plan_comparison: {
        title: 'Comparaison des Forfaits',
        items: [
          {
            name: 'Basic (Gratuit)',
            description: 'Parfait pour les particuliers qui démarrent',
            features: ['1 carte NFC', 'Profil basique', 'Génération de code QR', 'Analytics limités']
          },
          {
            name: 'Professional',
            description: 'Pour les professionnels sérieux et les freelances',
            features: ['Cartes NFC illimitées', 'Profil avancé', 'Création d\'événements', 'Analytics détaillés', 'Support prioritaire']
          },
          {
            name: 'Business',
            description: 'Pour les équipes et les entreprises',
            features: ['Gestion d\'équipe', 'Branding personnalisé', 'Analytics avancés', 'Accès API', 'Support dédié']
          }
        ]
      },
      upgrading: {
        title: 'Comment Passer à la Version Supérieure',
        content: 'Améliorez votre forfait pour débloquer plus de fonctionnalités.',
        items: [
          'Allez dans Tableau de bord → Abonnement',
          'Choisissez votre forfait souhaité',
          'Entrez les informations de paiement',
          'Confirmez votre mise à niveau',
          'Profitez immédiatement des fonctionnalités premium'
        ]
      },
      billing: {
        title: 'Informations de Facturation',
        content: 'Gérez votre abonnement et vos paiements.',
        items: [
          'Options de facturation mensuelle ou annuelle',
          'Traitement de paiement sécurisé',
          'Annulation facile à tout moment',
          'Reçus et factures disponibles',
          'Gestion du renouvellement automatique'
        ]
      }
    }
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    color: 'from-teal-500 to-emerald-500',
    description: 'Suivre les performances de votre carte numérique',
    content: {
      profile_analytics: {
        title: 'Analytics du Profil',
        content: 'Voyez comment les gens interagissent avec votre carte numérique.',
        items: [
          'Vues totales du profil',
          'Statistiques de scan (NFC et QR)',
          'Démographie des visiteurs',
          'Heures d\'activité de pointe',
          'Distribution géographique'
        ]
      },
      engagement_metrics: {
        title: 'Indicateurs d\'Engagement',
        items: [
          {
            name: 'Taux de Scan',
            description: 'Fréquence à laquelle votre carte est scannée'
          },
          {
            name: 'Complétude du Profil',
            description: 'Complétude de vos informations de profil'
          },
          {
            name: 'Demandes de Contact',
            description: 'Messages et demandes de connexion reçus'
          },
          {
            name: 'Partages Sociaux',
            description: 'Fréquence à laquelle votre profil est partagé'
          }
        ]
      },
      reporting: {
        title: 'Rapports et Analyses',
        content: 'Générez des rapports pour suivre votre succès en networking.',
        items: [
          'Rapports d\'activité hebdomadaires',
          'Résumés de performance mensuels',
          'Rapports de participation aux événements',
          'Suivi du ROI pour les efforts de networking',
          'Exportation des données pour analyse'
        ]
      }
    }
  },
  {
    id: 'admin-panel',
    title: 'Panneau d\'Administration',
    icon: Settings,
    color: 'from-gray-500 to-gray-700',
    description: 'Gérer les utilisateurs et les paramètres de la plateforme',
    content: {
      user_management: {
        title: 'Gestion des Utilisateurs',
        content: 'Outils d\'administration pour gérer les utilisateurs de la plateforme.',
        items: [
          'Voir tous les utilisateurs enregistrés',
          'Bannir ou débannir les utilisateurs',
          'Gérer les rôles et permissions des utilisateurs',
          'Examiner les rapports et plaintes des utilisateurs',
          'Surveiller l\'activité des utilisateurs'
        ]
      },
      platform_analytics: {
        title: 'Analytics de la Plateforme',
        content: 'Aperçu de la performance et de l\'utilisation de la plateforme.',
        items: [
          'Utilisateurs enregistrés au total',
          'Abonnements actifs',
          'Scans et interactions totaux',
          'Métriques de revenus et de croissance',
          'Surveillance des performances système'
        ]
      },
      system_settings: {
        title: 'Configuration Système',
        content: 'Configurer les paramètres et fonctionnalités de toute la plateforme.',
        items: [
          'Modèles d\'email et notifications',
          'Paramètres et politiques de sécurité',
          'Commutateurs de fonctionnalités et mode maintenance',
          'Gestion de base de données et sauvegardes',
          'Paramètres d\'intégration'
        ]
      }
    }
  },
  {
    id: 'overview',
    title: 'Aperçu',
    icon: Book,
    color: 'from-blue-500 to-cyan-500',
    description: 'Guide complet de la plateforme LUVIKA',
    content: {
      introduction: {
        title: 'Qu\'est-ce que LUVIKA ?',
        content: 'LUVIKA est une plateforme complète de cartes de visite numériques et de networking qui combine la technologie NFC, les codes QR et les technologies web modernes pour révolutionner la manière dont les professionnels se connectent et partagent leurs informations.'
      },
      features: {
        title: 'Fonctionnalités Clés',
        items: [
          'Cartes de Visite NFC Intelligentes',
          'Génération de Code QR',
          'Gestion de Profil',
          'Gestion d\'Événements',
          'Système d\'Abonnement',
          'Tableau de Bord Analytics',
          'Support Multilingue',
          'Mises à Jour en Temps Réel'
        ]
      },
      architecture: {
        title: 'Stack Technologique',
        items: [
          'Next.js 16+ avec App Router',
          'TypeScript',
          'Tailwind CSS',
          'Supabase (PostgreSQL + Auth)',
          'Framer Motion pour les Animations',
          'Lucide React Icons',
          'Next Intl pour l\'i18n'
        ]
      }
    }
  },
  {
    id: 'api',
    title: 'Référence API',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    description: 'Points de terminaison et utilisation de l\'API RESTful',
    content: {
      authentication: {
        title: 'Authentification',
        content: 'Tous les points de terminaison de l\'API nécessitent une authentification utilisant les jetons JWT Supabase.',
        endpoints: [
          {
            method: 'POST',
            path: '/api/auth/sign-in',
            description: 'Authentification utilisateur',
            params: ['email', 'password']
          },
          {
            method: 'POST', 
            path: '/api/auth/sign-up',
            description: 'Enregistrement utilisateur',
            params: ['email', 'password', 'full_name']
          }
        ]
      },
      profiles: {
        title: 'Gestion de Profil',
        endpoints: [
          {
            method: 'GET',
            path: '/api/profile',
            description: 'Obtenir le profil utilisateur',
            auth: true
          },
          {
            method: 'PUT',
            path: '/api/profile',
            description: 'Mettre à jour le profil utilisateur',
            auth: true,
            params: ['full_name', 'username', 'bio', 'avatar_url']
          }
        ]
      },
      events: {
        title: 'Gestion d\'Événements',
        endpoints: [
          {
            method: 'GET',
            path: '/api/events',
            description: 'Lister les événements',
            auth: true
          },
          {
            method: 'POST',
            path: '/api/events',
            description: 'Créer un événement',
            auth: true,
            params: ['title', 'description', 'date', 'location']
          }
        ]
      }
    }
  },
  {
    id: 'database',
    title: 'Schéma de Base de Données',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    description: 'Structure de la base de données Supabase',
    content: {
      tables: {
        title: 'Tables Principales',
        items: [
          {
            name: 'profiles',
            description: 'Profils et paramètres utilisateurs',
            fields: ['id', 'full_name', 'username', 'email', 'avatar_url', 'bio_short', 'bio_long']
          },
          {
            name: 'events',
            description: 'Gestion des événements',
            fields: ['id', 'title', 'description', 'date', 'location', 'created_by', 'is_public']
          },
          {
            name: 'subscriptions',
            description: 'Forfaits d\'abonnement utilisateurs',
            fields: ['id', 'user_id', 'plan_type', 'start_date', 'end_date', 'status']
          },
          {
            name: 'nfc_cards',
            description: 'Assignations de cartes NFC',
            fields: ['id', 'user_id', 'card_id', 'status', 'created_at']
          }
        ]
      },
      relationships: {
        title: 'Relations',
        content: 'La base de données utilise des clés étrangères pour maintenir l\'intégrité référentielle entre les tables.'
      }
    }
  },
  {
    id: 'frontend',
    title: 'Architecture Frontend',
    icon: Smartphone,
    color: 'from-orange-500 to-red-500',
    description: 'Composants React et structure',
    content: {
      components: {
        title: 'Structure des Composants',
        items: [
          'Composants de Mise en Page (Header, Footer, Navigation)',
          'Composants UI (Boutons, Cartes, Formulaires)',
          'Composants Métier (Profil, Événements, Tableau de Bord)',
          'Composants Système (Chargement, Notifications, Modales)'
        ]
      },
      pages: {
        title: 'Structure des Pages',
        items: [
          'Pages Publiques (Accueil, Blog, Tarifs)',
          'Pages d\'Authentification (Connexion, Inscription)',
          'Pages du Tableau de Bord (Profil, Paramètres, Événements)',
          'Pages Admin (Gestion Utilisateurs, Analytics)'
        ]
      }
    }
  },
  {
    id: 'security',
    title: 'Sécurité',
    icon: Shield,
    color: 'from-gray-500 to-gray-700',
    description: 'Mesures de sécurité et meilleures pratiques',
    content: {
      measures: {
        title: 'Fonctionnalités de Sécurité',
        items: [
          'Authentification JWT',
          'Sécurité au Niveau Ligne (RLS)',
          'Validation des Entrées',
          'Protection CORS',
          'Limitation de Débit'
        ]
      },
      bestPractices: {
        title: 'Meilleures Pratiques',
        items: [
          'Toujours valider les entrées utilisateur',
          'Utiliser HTTPS en production',
          'Implémenter une gestion d\'erreur appropriée',
          'Audits de sécurité réguliers',
          'Garder les dépendances à jour'
        ]
      }
    }
  },
  {
    id: 'deployment',
    title: 'Déploiement',
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    description: 'Guide de déploiement en production',
    content: {
      requirements: {
        title: 'Exigences',
        items: [
          'Node.js 18+',
          'Projet Supabase',
          'Compte Vercel (recommandé)',
          'Variables d\'environnement configurées'
        ]
      },
      steps: {
        title: 'Étapes de Déploiement',
        items: [
          '1. Clonez le dépôt',
          '2. Installez les dépendances : npm install',
          '3. Configurez les variables d\'environnement',
          '4. Déployez sur Vercel ou votre plateforme préférée',
          '5. Exécutez les migrations de base de données',
          '6. Configurez les paramètres Supabase'
        ]
      }
    }
  }
];

// Fonction pour générer le contenu Markdown de la documentation
const generateDocumentationContent = () => {
  let content = '# Documentation LUVIKA\n\n';
  content += 'Guide complet pour comprendre, utiliser et contribuer à la plateforme LUVIKA.\n\n';

  documentationSections.forEach(section => {
    content += `## ${section.title}\n\n`;
    content += `${section.description}\n\n`;

    Object.entries(section.content).forEach(([key, sectionContent]) => {
      content += `### ${sectionContent.title}\n\n`;
      
      if (sectionContent.content) {
        content += `${sectionContent.content}\n\n`;
      }

      if (sectionContent.items) {
        sectionContent.items.forEach((item: string | DocumentationItem, index: number) => {
          if (typeof item === 'string') {
            content += `- ${item}\n`;
          } else {
            content += `#### ${item.name || item.title || ''}\n`;
            if (item.description) {
              content += `${item.description}\n\n`;
            }
            if (item.fields) {
              content += `**Champs:** ${Array.isArray(item.fields) ? item.fields.join(', ') : ''}\n\n`;
            }
            if (item.params) {
              content += `**Paramètres:** ${Array.isArray(item.params) ? item.params.join(', ') : ''}\n\n`;
            }
          }
        });
        content += '\n';
      }

      if (sectionContent.endpoints) {
        content += '#### Endpoints API\n\n';
        sectionContent.endpoints.forEach((endpoint: { method: any; path: any; description: any; auth: any; params: any[]; }) => {
          content += `**${endpoint.method}** \`${endpoint.path}\`\n`;
          content += `${endpoint.description}\n`;
          if (endpoint.auth) {
            content += '*Authentification requise*\n';
          }
          if (endpoint.params) {
            content += `**Paramètres:** ${endpoint.params.join(', ')}\n`;
          }
          content += '\n';
        });
      }
    });

    content += '---\n\n';
  });

  return content;
};

// Fonction pour télécharger la documentation
const downloadDocumentation = () => {
  const content = generateDocumentationContent();
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'LUVIKA_Documentation.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default function DocumentationPage() {
  const t = useTranslations('documentation');
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent mb-6">
              Documentation
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Guide complet pour comprendre, utiliser et contribuer à la plateforme LUVIKA.
              Trouvez tout ce dont vous avez besoin pour démarrer et tirer le meilleur parti de nos fonctionnalités.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400">
                <Book className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="https://github.com/hassanpakou/Luvika2026" target="_blank" rel="noopener noreferrer">
                  <Github className="w-5 h-5 mr-2" />
                  View on GitHub
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={downloadDocumentation}>
                <Download className="w-5 h-5 mr-2" />
                Download Documentation
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="glass-border sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Book className="w-6 h-6 text-cyan-400" />
                  Table of Contents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20"
                  />
                </div>
                
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-white/20'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                        <section.icon className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium text-white">{section.title}</div>
                        <div className="text-xs text-gray-400">{section.description}</div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                      activeSection === section.id ? 'rotate-90' : ''
                    }`} />
                  </button>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              {documentationSections.map((section) => (
                activeSection === section.id && (
                  <motion.div
                    key={section.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Section Header */}
                    <Card className="glass-border">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                            <section.icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl text-white">{section.title}</CardTitle>
                            <p className="text-gray-400">{section.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>

                    {/* Content */}
                    <div className="grid gap-6">
                      {Object.entries(section.content).map(([key, content]) => (
                        <Card key={key} className="glass-border">
                          <CardHeader>
                            <CardTitle className="text-lg text-white">{content.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {content.content && (
                              <p className="text-gray-300 mb-4">{content.content}</p>
                            )}
                            
                            {content.items && (
                              <div className="grid gap-3">
                                {content.items.map((item: string | DocumentationItem, index: number) => (
                                  <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${section.color}`}></div>
                                    {typeof item === 'string' ? (
                                      <span className="text-gray-300">{item}</span>
                                    ) : (
                                      <div className="flex flex-col">
                                        <span className="text-white font-medium">{item.name || item.title || ''}</span>
                                        <span className="text-gray-400 text-sm">{item.description || ''}</span>
                                        {item.fields && (
                                          <div className="mt-2">
                                            <span className="text-xs text-gray-500">Fields: </span>
                                            <span className="text-xs text-gray-300">{Array.isArray(item.fields) ? item.fields.join(', ') : ''}</span>
                                          </div>
                                        )}
                                        {item.params && (
                                          <div className="mt-2">
                                            <span className="text-xs text-gray-500">Parameters: </span>
                                            <span className="text-xs text-gray-300">{Array.isArray(item.params) ? item.params.join(', ') : ''}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {content.endpoints && (
                              <div className="space-y-4">
                                {content.endpoints.map((endpoint: { method: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; path: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; auth: any; description: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; params: any[]; }, index: Key | null | undefined) => (
                                  <div key={index} className="p-4 bg-white/5 rounded-lg">
                                    <div className="flex items-center gap-3 mb-2">
                                      <Badge variant="secondary" className={`bg-gradient-to-r ${section.color}/20 text-white border-0`}>
                                        {endpoint.method}
                                      </Badge>
                                      <span className="text-white font-mono">{endpoint.path}</span>
                                      {endpoint.auth && (
                                        <Badge variant="outline" className="ml-auto">Auth Required</Badge>
                                      )}
                                    </div>
                                    <p className="text-gray-300 mb-3">{endpoint.description}</p>
                                    {endpoint.params && (
                                      <div>
                                        <span className="text-xs text-gray-500">Parameters: </span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                          {endpoint.params.map((param, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">{param}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}