// src/app/documentation/page.tsx
'use client';

import { useState, useEffect, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Book, Code, Database, Zap, Shield, Globe, 
  Smartphone, Users, Calendar, ShoppingBag, 
  ChevronRight, ExternalLink, Github, 
  ChevronDown, ChevronUp, Search, Filter
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
    id: 'overview',
    title: 'Overview',
    icon: Book,
    color: 'from-blue-500 to-cyan-500',
    description: 'Complete guide to LUVIKA platform',
    content: {
      introduction: {
        title: 'What is LUVIKA?',
        content: 'LUVIKA is a comprehensive digital business card and networking platform that combines NFC technology, QR codes, and modern web technologies to revolutionize how professionals connect and share information.'
      },
      features: {
        title: 'Key Features',
        items: [
          'Smart NFC Business Cards',
          'QR Code Generation',
          'Profile Management',
          'Event Management',
          'Subscription System',
          'Analytics Dashboard',
          'Multi-language Support',
          'Real-time Updates'
        ]
      },
      architecture: {
        title: 'Technology Stack',
        items: [
          'Next.js 16+ with App Router',
          'TypeScript',
          'Tailwind CSS',
          'Supabase (PostgreSQL + Auth)',
          'Framer Motion for Animations',
          'Lucide React Icons',
          'Next Intl for i18n'
        ]
      }
    }
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: Code,
    color: 'from-green-500 to-emerald-500',
    description: 'RESTful API endpoints and usage',
    content: {
      authentication: {
        title: 'Authentication',
        content: 'All API endpoints require authentication using Supabase JWT tokens.',
        endpoints: [
          {
            method: 'POST',
            path: '/api/auth/sign-in',
            description: 'User authentication',
            params: ['email', 'password']
          },
          {
            method: 'POST', 
            path: '/api/auth/sign-up',
            description: 'User registration',
            params: ['email', 'password', 'full_name']
          }
        ]
      },
      profiles: {
        title: 'Profile Management',
        endpoints: [
          {
            method: 'GET',
            path: '/api/profile',
            description: 'Get user profile',
            auth: true
          },
          {
            method: 'PUT',
            path: '/api/profile',
            description: 'Update user profile',
            auth: true,
            params: ['full_name', 'username', 'bio', 'avatar_url']
          }
        ]
      },
      events: {
        title: 'Event Management',
        endpoints: [
          {
            method: 'GET',
            path: '/api/events',
            description: 'List events',
            auth: true
          },
          {
            method: 'POST',
            path: '/api/events',
            description: 'Create event',
            auth: true,
            params: ['title', 'description', 'date', 'location']
          }
        ]
      }
    }
  },
  {
    id: 'database',
    title: 'Database Schema',
    icon: Database,
    color: 'from-purple-500 to-pink-500',
    description: 'Supabase database structure',
    content: {
      tables: {
        title: 'Core Tables',
        items: [
          {
            name: 'profiles',
            description: 'User profiles and settings',
            fields: ['id', 'full_name', 'username', 'email', 'avatar_url', 'bio_short', 'bio_long']
          },
          {
            name: 'events',
            description: 'Event management',
            fields: ['id', 'title', 'description', 'date', 'location', 'created_by', 'is_public']
          },
          {
            name: 'subscriptions',
            description: 'User subscription plans',
            fields: ['id', 'user_id', 'plan_type', 'start_date', 'end_date', 'status']
          },
          {
            name: 'nfc_cards',
            description: 'NFC card assignments',
            fields: ['id', 'user_id', 'card_id', 'status', 'created_at']
          }
        ]
      },
      relationships: {
        title: 'Relationships',
        content: 'The database uses foreign keys to maintain referential integrity between tables.'
      }
    }
  },
  {
    id: 'frontend',
    title: 'Frontend Architecture',
    icon: Smartphone,
    color: 'from-orange-500 to-red-500',
    description: 'React components and structure',
    content: {
      components: {
        title: 'Component Structure',
        items: [
          'Layout Components (Header, Footer, Navigation)',
          'UI Components (Buttons, Cards, Forms)',
          'Business Components (Profile, Events, Dashboard)',
          'System Components (Loading, Notifications, Modals)'
        ]
      },
      pages: {
        title: 'Page Structure',
        items: [
          'Public Pages (Home, Blog, Pricing)',
          'Authentication Pages (Sign In, Sign Up)',
          'Dashboard Pages (Profile, Settings, Events)',
          'Admin Pages (User Management, Analytics)'
        ]
      }
    }
  },
  {
    id: 'security',
    title: 'Security',
    icon: Shield,
    color: 'from-gray-500 to-gray-700',
    description: 'Security measures and best practices',
    content: {
      measures: {
        title: 'Security Features',
        items: [
          'JWT Authentication',
          'Row Level Security (RLS)',
          'Input Validation',
          'CORS Protection',
          'Rate Limiting'
        ]
      },
      bestPractices: {
        title: 'Best Practices',
        items: [
          'Always validate user input',
          'Use HTTPS in production',
          'Implement proper error handling',
          'Regular security audits',
          'Keep dependencies updated'
        ]
      }
    }
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: Globe,
    color: 'from-indigo-500 to-blue-500',
    description: 'Production deployment guide',
    content: {
      requirements: {
        title: 'Requirements',
        items: [
          'Node.js 18+',
          'Supabase project',
          'Vercel account (recommended)',
          'Environment variables configured'
        ]
      },
      steps: {
        title: 'Deployment Steps',
        items: [
          '1. Clone the repository',
          '2. Install dependencies: npm install',
          '3. Configure environment variables',
          '4. Deploy to Vercel or your preferred platform',
          '5. Run database migrations',
          '6. Configure Supabase settings'
        ]
      }
    }
  }
];

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
              Complete guide to understanding, using, and contributing to the LUVIKA platform.
              Find everything you need to get started and make the most of our features.
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