import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { NextResponse } from 'next/server';

// 🔐 Vérification sécurité des variables d'environnement
if (!process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
  console.warn('⚠️ GOOGLE_ANALYTICS_PROPERTY_ID non configuré');
}
if (!process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY) {
  console.warn('⚠️ GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY non configuré');
}

export async function GET() {
  try {
    // 🔒 Vérification préalable des credentials
    if (!process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY || 
        !process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
      return NextResponse.json({ 
        error: 'Google Analytics non configuré', 
        configured: false 
      }, { status: 400 });
    }

    // 🔑 Parsing sécurisé de la clé de service
    const credentials = JSON.parse(process.env.GOOGLE_ANALYTICS_SERVICE_ACCOUNT_KEY);
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

    // 📊 Initialisation du client Analytics
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
      projectId: credentials.project_id,
    });

    // 📅 Période : 7 derniers jours
    const dateRange = {
      startDate: '7daysAgo',
      endDate: 'today',
    };

    // 📈 Requête des métriques principales
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'newUsers' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
      limit: 50,
    });

    // 🔍 Extraction et transformation des données
    const metrics = response.rows?.map(row => ({
      date: row.dimensionValues?.[0].value || '',
      activeUsers: parseInt(row.metricValues?.[0].value || '0'),
      pageViews: parseInt(row.metricValues?.[1].value || '0'),
      avgSessionDuration: parseFloat(row.metricValues?.[2].value || '0'),
      bounceRate: parseFloat(row.metricValues?.[3].value || '0'),
      newUsers: parseInt(row.metricValues?.[4].value || '0'),
    })) || [];

    // 📊 Calculs agrégés
    const totalUsers = metrics.reduce((sum, m) => sum + m.activeUsers, 0);
    const totalPageViews = metrics.reduce((sum, m) => sum + m.pageViews, 0);
    const avgBounceRate = metrics.length > 0 
      ? metrics.reduce((sum, m) => sum + m.bounceRate, 0) / metrics.length 
      : 0;

    // ✅ Retour des données formatées
    return NextResponse.json({
      configured: true,
      summary: {
        totalUsers,
        totalPageViews,
        avgSessionDuration: metrics.reduce((sum, m) => sum + m.avgSessionDuration, 0) / metrics.length || 0,
        avgBounceRate,
        period: '7 derniers jours',
      },
      daily: metrics,
      propertyId,
    });
  } catch (error: any) {
    console.error('❌ Erreur Google Analytics API:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });

    // 🔒 Ne jamais exposer les détails sensibles en production
    return NextResponse.json({ 
      error: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Erreur lors de la récupération des données Analytics',
      configured: false,
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }, { status: 500 });
  }
}