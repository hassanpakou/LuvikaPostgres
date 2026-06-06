// src/app/documentation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Code, Database, Shield, Globe, 
  Smartphone, Calendar, CreditCard, 
  ChevronRight, Search,
  User, QrCode, BarChart3, Settings,
  HelpCircle, Store, Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/src/components/system/ThemeToggle';

// Types
interface DocumentationItem {
  name?: string;
  title?: string;
  description?: string;
  fields?: string[];
  params?: string[];
  features?: string[];
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

// Sections
const documentationSections = [
  {
    id: 'overview',
    title: 'Aperçu',
    icon: Book,
    color: 'from-blue-500/60 to-cyan-500/60',
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
    id: 'user-guide',
    title: 'Guide Utilisateur',
    icon: HelpCircle,
    color: 'from-blue-500/60 to-cyan-500/60',
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
        title: 'Pour les Débutants',
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
            description: 'Vous pouvez partager votre carte en touchant les téléphones ensemble (NFC), en scannant les codes QR, ou en envoyant un lien.'
          },
          {
            title: 'Étape 4 : Gérer vos Contacts',
            description: 'Lorsque quelqu\'un consulte votre profil, vous pouvez voir qui a visité et vous connecter avec eux.'
          }
        ]
      }
    }
  },
  {
    id: 'profile-management',
    title: 'Gestion du Profil',
    icon: User,
    color: 'from-green-500/60 to-emerald-500/60',
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
      }
    }
  },
  {
    id: 'nfc-qr-codes',
    title: 'NFC & Codes QR',
    icon: QrCode,
    color: 'from-purple-500/60 to-pink-500/60',
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
      }
    }
  },
  {
    id: 'events',
    title: 'Événements',
    icon: Calendar,
    color: 'from-orange-500/60 to-red-500/60',
    description: 'Créer et gérer des événements professionnels',
    content: {
      creating_events: {
        title: 'Créer des Événements',
        content: 'Organisez des conférences, webinaires ou meetups.',
        items: [
          'Allez dans Tableau de bord → Événements',
          'Cliquez sur "Créer un Événement"',
          'Remplissez les détails de l\'événement',
          'Générez un code QR pour l\'enregistrement',
          'Partagez l\'événement avec votre réseau',
          'Suivez les inscriptions et la participation'
        ]
      }
    }
  },
  {
    id: 'subscriptions',
    title: 'Abonnements',
    icon: CreditCard,
    color: 'from-indigo-500/60 to-blue-500/60',
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
      }
    }
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    color: 'from-teal-500/60 to-emerald-500/60',
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
      }
    }
  },
  {
    id: 'api',
    title: 'Référence API',
    icon: Code,
    color: 'from-green-500/60 to-emerald-500/60',
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
      }
    }
  },
  {
    id: 'database',
    title: 'Base de Données',
    icon: Database,
    color: 'from-purple-500/60 to-pink-500/60',
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
      }
    }
  },
  {
    id: 'frontend',
    title: 'Architecture Frontend',
    icon: Smartphone,
    color: 'from-orange-500/60 to-red-500/60',
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
    color: 'from-gray-500/60 to-gray-700/60',
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
      }
    }
  },
  {
    id: 'deployment',
    title: 'Déploiement',
    icon: Globe,
    color: 'from-indigo-500/60 to-blue-500/60',
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

// Fonction pour générer le contenu Markdown
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
        sectionContent.items.forEach((item: string | DocumentationItem) => {
          if (typeof item === 'string') {
            content += `- ${item}\n`;
          } else {
            content += `#### ${item.name || item.title || ''}\n`;
            if (item.description) content += `${item.description}\n\n`;
            if (item.fields) content += `**Champs:** ${item.fields.join(', ')}\n\n`;
            if (item.params) content += `**Paramètres:** ${item.params.join(', ')}\n\n`;
            if (item.features) content += `**Fonctionnalités:** ${item.features.join(', ')}\n\n`;
          }
        });
        content += '\n';
      }

      if (sectionContent.endpoints) {
        content += '#### Endpoints API\n\n';
        sectionContent.endpoints.forEach((endpoint: { method: any; path: any; description: any; auth: any; params: any[]; }) => {
          content += `**${endpoint.method}** \`${endpoint.path}\`\n`;
          content += `${endpoint.description}\n`;
          if (endpoint.auth) content += '*Authentification requise*\n';
          if (endpoint.params) content += `**Paramètres:** ${endpoint.params.join(', ')}\n`;
          content += '\n';
        });
      }
    });

    content += '---\n\n';
  });

  return content;
};

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
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSectionChange = (sectionId: string) => {
    setContentLoading(true);
    setActiveSection(sectionId);
    setTimeout(() => setContentLoading(false), 300);
  };

  const filteredSections = documentationSections.filter(section =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col items-center gap-4"
        >
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
          />
          <span className="text-cyan-300/70 text-sm font-light tracking-wide">
            Chargement...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="container mx-auto px-4 py-12 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-3.5 py-1.5 rounded-full border border-cyan-500/20 mb-4">
                <Book className="w-3.5 h-3.5 text-cyan-300/80" />
                <span className="text-cyan-300/80 font-medium text-sm">Documentation</span>
              </div>

              <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-white/90 to-cyan-200/70 bg-clip-text text-transparent mb-3">
                Documentation LUVIKA
              </h1>
              <p className="text-gray-300/70 max-w-2xl mx-auto text-sm font-light leading-relaxed mb-6">
                Guide complet pour comprendre, utiliser et contribuer à la plateforme LUVIKA.
                Trouvez tout ce dont vous avez besoin pour démarrer.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                  <ThemeToggle />

                <Button size="sm" className="bg-gradient-to-r from-blue-600/80 to-cyan-500/80 hover:from-blue-500 hover:to-cyan-400 text-white text-xs">
                  <Book className="w-3.5 h-3.5 mr-1.5" />
                  Commencer
                </Button>
                <Button size="sm" variant="outline" onClick={downloadDocumentation} className="text-xs border-white/20 text-gray-300 hover:bg-white/5">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Télécharger
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="lg:col-span-1"
            >
              <div className="sticky top-4 rounded-2xl p-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                  <Book className="w-4 h-4 text-cyan-400/70" />
                  Table des Matières
                </h3>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400/60 w-3.5 h-3.5" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-8 text-xs bg-white/[0.03] border-white/[0.08] text-white/80 placeholder:text-gray-500"
                  />
                </div>
                
                <div className="space-y-1">
                  {filteredSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => handleSectionChange(section.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                        activeSection === section.id
                          ? 'bg-white/[0.06] border border-white/[0.1]'
                          : 'hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center flex-shrink-0`}>
                        <section.icon className="w-3.5 h-3.5 text-white/80" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white/80 truncate">{section.title}</div>
                        <div className="text-[10px] text-gray-500/70 truncate">{section.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: 0.1 }}
              className="lg:col-span-3"
            >
              <AnimatePresence mode="wait">
                {contentLoading ? (
                  <motion.div
                    key="loader"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center py-20"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full"
                    />
                  </motion.div>
                ) : (
                  documentationSections.map((section) => (
                    activeSection === section.id && (
                      <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-4"
                      >
                        {/* Section Header */}
                        <div className="rounded-2xl p-5 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08]">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                              <section.icon className="w-4.5 h-4.5 text-white/80" />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold text-white/90">{section.title}</h2>
                              <p className="text-xs text-gray-400/70 font-light">{section.description}</p>
                            </div>
                          </div>
                        </div>

                        {/* Content Cards */}
                        <div className="grid gap-3">
                          {Object.entries(section.content).map(([key, content]) => (
                            <div key={key} className="rounded-2xl p-5 bg-white/[0.02] backdrop-blur-sm border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-300">
                              <h3 className="text-base font-semibold text-white/80 mb-3">{content.title}</h3>
                              
                              {content.content && (
                                <p className="text-gray-300/70 text-sm leading-relaxed font-light mb-3">{content.content}</p>
                              )}
                              
                              {content.items && (
                                <div className="grid gap-2">
                                  {content.items.map((item: string | DocumentationItem, index: number) => (
                                    <div key={index} className="flex items-start gap-2.5 p-2.5 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                      <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${section.color} mt-1.5 flex-shrink-0`}></div>
                                      {typeof item === 'string' ? (
                                        <span className="text-gray-300/70 text-sm font-light">{item}</span>
                                      ) : (
                                        <div className="flex flex-col gap-1">
                                          <span className="text-white/80 text-sm font-medium">{item.name || item.title || ''}</span>
                                          <span className="text-gray-400/70 text-xs font-light">{item.description || ''}</span>
                                          {item.fields && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                              {item.fields.map((field, i) => (
                                                <Badge key={i} variant="outline" className="text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                                  {field}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                          {item.features && (
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                              {item.features.map((feature, i) => (
                                                <Badge key={i} variant="outline" className="text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                                  {feature}
                                                </Badge>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                              
                              {content.endpoints && (
                                <div className="space-y-2.5">
                                  {content.endpoints.map((endpoint: DocumentationEndpoint, index: number) => (
                                    <div key={index} className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <Badge className={`text-[10px] bg-gradient-to-r ${section.color} text-white/80 border-0 px-2 py-0`}>
                                          {endpoint.method}
                                        </Badge>
                                        <span className="text-white/70 text-xs font-mono">{endpoint.path}</span>
                                        {endpoint.auth && (
                                          <Badge variant="outline" className="ml-auto text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                            Auth
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-gray-400/70 text-xs font-light mb-2">{endpoint.description}</p>
                                      {endpoint.params && (
                                        <div className="flex flex-wrap gap-1">
                                          {endpoint.params.map((param, i) => (
                                            <Badge key={i} variant="outline" className="text-[10px] border-white/10 text-gray-400/70 bg-transparent">
                                              {param}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
}