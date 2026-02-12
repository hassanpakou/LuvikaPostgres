/**
 * Détermine si on est en environnement de production
 */
export function isProduction(): boolean {
  // Vérifie plusieurs indicateurs de production
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL === '1' ||
    (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
  );
}

/**
 * Nettoie le RP ID pour WebAuthn
 */
export function cleanRpId(rpId: string): string {
  return rpId
    .replace(/^https?:\/\//, '') // Supprime http:// ou https://
    .replace(/:\d+$/, '')        // Supprime le port (:3000)
    .replace(/\/$/, '')          // Supprime le slash final
    .trim();                     // Supprime les espaces
}

/**
 * Récupère le RP ID correct selon l'environnement
 */
export function getRpId(): string {
  const isProd = isProduction();
  
  // En production : utilise la variable d'environnement ou fallback sur le domaine
  if (isProd) {
    const envRpId = process.env.NEXT_PUBLIC_WEBAUTHN_RP_ID;
    if (envRpId) return cleanRpId(envRpId);
    
    // Fallback : utilise le domaine courant
    if (typeof window !== 'undefined') {
      return window.location.hostname;
    }
    return 'luvika.vercel.app';
  }
  
  // En développement : toujours localhost
  return 'localhost';
}

/**
 * Récupère l'origin correct selon l'environnement
 */
export function getOrigin(): string {
  if (isProduction()) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (appUrl) return appUrl;
    
    // Fallback : construit l'URL depuis le RP ID
    const rpId = getRpId();
    return `https://${rpId}`;
  }
  
  // En développement : toujours localhost:3000
  return 'http://localhost:3000';
}